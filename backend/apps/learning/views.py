from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F
from .models import Course, Lesson, Enrollment, Quiz, Question, Answer, Achievement, LearningActivity
from .serializers import CourseSerializer, LessonSerializer, EnrollmentSerializer, QuizSerializer, AchievementSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.filter(is_published=True).select_related('instructor').prefetch_related('lessons', 'enrollments')
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category', None)
        difficulty = self.request.query_params.get('difficulty', None)
        search = self.request.query_params.get('search', None)

        if search:
            qs = qs.filter(title__icontains=search) | qs.filter(description__icontains=search)
        if category:
            qs = qs.filter(category__iexact=category)
        if difficulty:
            qs = qs.filter(difficulty=difficulty.upper())
        return qs

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, id=None):
        course = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
        if created:
            Course.objects.filter(id=course.id).update(enrolled_count=F('enrolled_count') + 1)
            LearningActivity.objects.create(
                user=request.user,
                activity_type='COURSE_ENROLLED',
                metadata={'course_id': str(course.id), 'title': course.title}
            )
            return Response({'status': 'enrolled'}, status=status.HTTP_201_CREATED)
        return Response({'status': 'already_enrolled'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete_lesson(self, request, id=None):
        course = self.get_object()
        lesson_id = request.data.get('lesson_id')
        enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
        if not enrollment:
            return Response({'error': 'Not enrolled in this course.'}, status=status.HTTP_400_BAD_REQUEST)

        completed = set(enrollment.completed_lessons)
        completed.add(str(lesson_id))
        enrollment.completed_lessons = list(completed)

        total_lessons = course.lessons.count()
        if total_lessons > 0:
            enrollment.progress_percent = round((len(enrollment.completed_lessons) / total_lessons) * 100, 2)
            if enrollment.progress_percent >= 100.0:
                enrollment.is_completed = True
        enrollment.save()

        return Response({
            'status': 'updated',
            'progress_percent': enrollment.progress_percent,
            'is_completed': enrollment.is_completed
        })

    @action(detail=True, methods=['get'])
    def quizzes(self, request, id=None):
        course = self.get_object()
        quizzes = Quiz.objects.filter(course=course).prefetch_related('questions')
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user).select_related('course', 'course__instructor')


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Achievement.objects.filter(user=self.request.user)
