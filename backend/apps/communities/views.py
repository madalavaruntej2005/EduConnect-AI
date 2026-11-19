from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F
from .models import Community, Membership
from .serializers import CommunitySerializer, MembershipSerializer

class CommunityViewSet(viewsets.ModelViewSet):
    queryset = Community.objects.all().select_related('creator', 'college').prefetch_related('memberships')
    serializer_class = CommunitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        college_id = self.request.query_params.get('college_id', None)

        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(description__icontains=search)
        if category:
            qs = qs.filter(category__iexact=category)
        if college_id:
            qs = qs.filter(college_id=college_id)
        return qs

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, id=None):
        community = self.get_object()
        membership, created = Membership.objects.get_or_create(community=community, user=request.user)
        if created:
            Community.objects.filter(id=community.id).update(members_count=F('members_count') + 1)
            return Response({'status': 'joined', 'role': membership.role}, status=status.HTTP_201_CREATED)
        return Response({'status': 'already_member', 'role': membership.role})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def leave(self, request, id=None):
        community = self.get_object()
        membership = Membership.objects.filter(community=community, user=request.user).first()
        if membership:
            if membership.role == 'ADMIN' and community.memberships.filter(role='ADMIN').count() <= 1:
                return Response({'error': 'Cannot leave as the only community admin.'}, status=status.HTTP_400_BAD_REQUEST)
            membership.delete()
            Community.objects.filter(id=community.id, members_count__gt=0).update(members_count=F('members_count') - 1)
            return Response({'status': 'left'})
        return Response({'status': 'not_a_member'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def members(self, request, id=None):
        community = self.get_object()
        memberships = Membership.objects.filter(community=community).select_related('user')
        serializer = MembershipSerializer(memberships, many=True)
        return Response(serializer.data)
