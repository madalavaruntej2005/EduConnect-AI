from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project, ProjectMember, Task
from .serializers import ProjectSerializer, TaskSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().select_related('owner').prefetch_related('members', 'tasks')
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        tag = self.request.query_params.get('tag', None)
        looking_for = self.request.query_params.get('looking_for_members', None)
        search = self.request.query_params.get('search', None)

        if search:
            qs = qs.filter(title__icontains=search) | qs.filter(description__icontains=search)
        if looking_for is not None:
            qs = qs.filter(is_looking_for_members=looking_for.lower() in ('true', '1'))
        if tag:
            qs = qs.filter(tags__contains=[tag.lower()])
        return qs

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, pk=None):
        project = self.get_object()
        member, created = ProjectMember.objects.get_or_create(
            project=project,
            user=request.user,
            defaults={'role': 'Contributor'}
        )
        if created:
            return Response({'status': 'joined', 'role': member.role}, status=status.HTTP_201_CREATED)
        return Response({'status': 'already_member', 'role': member.role})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def create_task(self, request, pk=None):
        project = self.get_object()
        title = request.data.get('title')
        description = request.data.get('description', '')
        if not title:
            return Response({'error': 'Title is required.'}, status=status.HTTP_400_BAD_REQUEST)

        task = Task.objects.create(
            project=project,
            title=title,
            description=description,
            status='TODO'
        )
        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='update-task/(?P<task_id>[0-9a-f-]+)', permission_classes=[permissions.IsAuthenticated])
    def update_task(self, request, pk=None, task_id=None):
        project = self.get_object()
        task = Task.objects.filter(project=project, id=task_id).first()
        if not task:
            return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TaskSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
