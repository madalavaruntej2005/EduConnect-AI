from rest_framework import viewsets, permissions
from .models import College
from .serializers import CollegeSerializer

class CollegeViewSet(viewsets.ModelViewSet):
    queryset = College.objects.all().order_by('name')
    serializer_class = CollegeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        query = self.request.query_params.get('search', None)
        if query:
            qs = qs.filter(name__icontains=query) | qs.filter(code__icontains=query) | qs.filter(city__icontains=query)
        return qs
