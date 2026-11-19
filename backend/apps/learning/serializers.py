from rest_framework import serializers
from .models import Course, Lesson, Enrollment, Quiz, Question, Answer, LearningActivity, Achievement
from apps.accounts.serializers import UserSerializer

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ('id', 'course', 'title', 'order', 'video_url', 'duration_seconds', 'notes_markdown', 'pdf_attachment_url', 'is_preview')


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'text', 'options', 'correct_index', 'explanation')
        extra_kwargs = {
            'correct_index': {'write_only': True},
            'explanation': {'write_only': True}
        }


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'course', 'lesson', 'title', 'passing_score', 'questions')


class CourseSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    my_progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            'id', 'title', 'slug', 'description', 'instructor',
            'thumbnail', 'category', 'difficulty', 'duration_hours',
            'enrolled_count', 'rating', 'is_published', 'lessons',
            'is_enrolled', 'my_progress', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'slug', 'instructor', 'enrolled_count', 'rating', 'is_enrolled', 'my_progress', 'created_at', 'updated_at')

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(user=request.user).exists()
        return False

    def get_my_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = obj.enrollments.filter(user=request.user).first()
            if enrollment:
                return float(enrollment.progress_percent)
        return 0.0


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ('id', 'course', 'progress_percent', 'completed_lessons', 'is_completed', 'enrolled_at', 'last_accessed')


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'
