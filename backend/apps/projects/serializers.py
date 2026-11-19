from rest_framework import serializers
from .models import Project, ProjectMember, Task
from apps.accounts.serializers import UserSerializer

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)

    class Meta:
        model = Task
        fields = ('id', 'project', 'title', 'description', 'assigned_to', 'assigned_to_details', 'status', 'due_date', 'created_at')


class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ('id', 'user', 'role', 'joined_at')


class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = ProjectMemberSerializer(many=True, read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)
    is_member = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            'id', 'title', 'description', 'owner', 'github_repo_url',
            'live_demo_url', 'tags', 'is_looking_for_members', 'banner',
            'members', 'tasks', 'is_member', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'owner', 'is_member', 'created_at', 'updated_at')

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(user=request.user).exists()
        return False

    def create(self, validated_data):
        user = self.context['request'].user
        project = Project.objects.create(owner=user, **validated_data)
        ProjectMember.objects.create(project=project, user=user, role='Lead / Creator')
        return project
