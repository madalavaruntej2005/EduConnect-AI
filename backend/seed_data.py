"""
EduConnect AI - Comprehensive Database Seeder
Seeds verified Colleges, Users, Profiles, Posts, Comments, Stories,
Communities, Courses, Quizzes, Jobs, Projects, and Chat Rooms.
"""
import os
import sys
import django
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.colleges.models import College
from apps.profiles.models import StudentProfile
from apps.social.models import Post, PostMedia, Comment, Like, SavedPost
from apps.stories.models import Story, StoryViewer
from apps.communities.models import Community, Membership
from apps.learning.models import Course, Lesson, Quiz, Question, Enrollment, Achievement
from apps.careers.models import Job, Application
from apps.projects.models import Project, ProjectMember, Task
from apps.messaging.models import ChatRoom, ChatMember, Message
from apps.guardian.models import GuardianIncident, GuardianAction, RecoveryApproval, GuardianMetric
from apps.analytics.models import PlatformMetric

User = get_user_model()

def seed():
    print("🌱 Starting EduConnect AI database seeding...")

    # 1. Colleges
    c_mit, _ = College.objects.get_or_create(
        code="MIT",
        defaults={
            "name": "Massachusetts Institute of Technology",
            "domain": "mit.edu",
            "city": "Cambridge",
            "state": "MA",
            "country": "United States",
            "is_verified": True,
            "logo": "https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80",
            "banner": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80",
            "description": "World-renowned research university pioneering science and engineering."
        }
    )

    c_stanford, _ = College.objects.get_or_create(
        code="STANFORD",
        defaults={
            "name": "Stanford University",
            "domain": "stanford.edu",
            "city": "Stanford",
            "state": "CA",
            "country": "United States",
            "is_verified": True,
            "logo": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop&q=80",
            "banner": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80",
            "description": "Leading university located in the heart of Silicon Valley."
        }
    )

    c_berkeley, _ = College.objects.get_or_create(
        code="UCB",
        defaults={
            "name": "University of California, Berkeley",
            "domain": "berkeley.edu",
            "city": "Berkeley",
            "state": "CA",
            "country": "United States",
            "is_verified": True,
            "description": "Premier public research university fostering free speech and technological innovation."
        }
    )
    print("✓ Colleges seeded.")

    # 2. Users
    u_admin = User.objects.filter(email="admin@educonnect.ai").first()
    if not u_admin:
        u_admin = User.objects.create_superuser(
            email="admin@educonnect.ai",
            username="admin",
            password="AdminPassword123!",
            first_name="EduConnect",
            last_name="System",
            headline="Platform Administrator & SRE Lead"
        )

    u_alex = User.objects.filter(email="alex@educonnect.ai").first()
    if not u_alex:
        u_alex = User.objects.create_user(
            email="alex@educonnect.ai",
            username="alex_rivera",
            password="StudentPass123!",
            first_name="Alex",
            last_name="Rivera",
            role="STUDENT",
            headline="CS Junior @ MIT | Building Autonomous Agents | Open Source Contributor",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
            bio="Passionate about LLM agents, distributed systems, and real-time frontend UI.",
            is_verified=True
        )

    u_sarah = User.objects.filter(email="sarah@educonnect.ai").first()
    if not u_sarah:
        u_sarah = User.objects.create_user(
            email="sarah@educonnect.ai",
            username="sarah_chen",
            password="StudentPass123!",
            first_name="Sarah",
            last_name="Chen",
            role="STUDENT",
            headline="Data Science & ML @ Stanford | ex-Research Fellow",
            avatar="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
            bio="Researching transformer architectures and multimodal reasoning.",
            is_verified=True
        )

    u_emily = User.objects.filter(email="dr.emily@educonnect.ai").first()
    if not u_emily:
        u_emily = User.objects.create_user(
            email="dr.emily@educonnect.ai",
            username="prof_emily",
            password="TeacherPass123!",
            first_name="Dr. Emily",
            last_name="Watson",
            role="TEACHER",
            headline="Professor of Computer Science & AI Systems",
            avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
            bio="Teaching scalable web systems, data structures, and foundational neural networks.",
            is_verified=True
        )

    u_recruiter = User.objects.filter(email="mark.recruiter@google.com").first()
    if not u_recruiter:
        u_recruiter = User.objects.create_user(
            email="mark.recruiter@google.com",
            username="mark_recruiter",
            password="RecruiterPass123!",
            first_name="Mark",
            last_name="Vance",
            role="RECRUITER",
            headline="Senior University Talent Scout @ Google",
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
            bio="Connecting top student engineers and AI practitioners with world-class opportunities.",
            is_verified=True
        )
    print("✓ Users created.")

    # 3. Student Profiles
    p_alex, _ = StudentProfile.objects.get_or_create(
        user=u_alex,
        defaults={
            "college": c_mit,
            "major": "Computer Science & Engineering",
            "degree": "B.S. Computer Science",
            "graduation_year": 2026,
            "cgpa": 3.92,
            "skills": ["Python", "Django", "React", "PostgreSQL", "Docker", "PyTorch"],
            "interests": ["Autonomous AI", "Distributed Systems", "Full-stack Web"],
            "github_url": "https://github.com",
            "linkedin_url": "https://linkedin.com",
            "streak_count": 14,
            "reputation_points": 480,
            "badges": ["Dean's List 2025", "14-Day Study Streak", "Hackathon Winner"]
        }
    )

    p_sarah, _ = StudentProfile.objects.get_or_create(
        user=u_sarah,
        defaults={
            "college": c_stanford,
            "major": "Data Science & Artificial Intelligence",
            "degree": "B.S. Data Science",
            "graduation_year": 2026,
            "cgpa": 3.96,
            "skills": ["Machine Learning", "Transformers", "Python", "R", "SQL"],
            "interests": ["NLP", "Generative AI", "Computer Vision"],
            "github_url": "https://github.com",
            "linkedin_url": "https://linkedin.com",
            "streak_count": 21,
            "reputation_points": 620,
            "badges": ["Top Contributor", "AI Research Award", "3-Week Streak"]
        }
    )
    print("✓ Student Profiles seeded.")

    # 4. Communities
    comm_ai, _ = Community.objects.get_or_create(
        name="AI & Deep Learning Society",
        defaults={
            "description": "A collaborative haven for students experimenting with neural architectures, transformers, and autonomous agents.",
            "category": "Artificial Intelligence",
            "creator": u_emily,
            "avatar": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
            "banner": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop&q=80",
            "members_count": 128
        }
    )
    Membership.objects.get_or_create(community=comm_ai, user=u_emily, defaults={"role": "ADMIN"})
    Membership.objects.get_or_create(community=comm_ai, user=u_alex, defaults={"role": "MEMBER"})
    Membership.objects.get_or_create(community=comm_ai, user=u_sarah, defaults={"role": "MEMBER"})

    comm_web, _ = Community.objects.get_or_create(
        name="Full-Stack Web Artisans",
        defaults={
            "description": "Modern frontend, backend architectures, APIs, and cloud deployments.",
            "category": "Web Development",
            "creator": u_alex,
            "avatar": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&auto=format&fit=crop&q=80",
            "banner": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
            "members_count": 94
        }
    )
    Membership.objects.get_or_create(community=comm_web, user=u_alex, defaults={"role": "ADMIN"})
    Membership.objects.get_or_create(community=comm_web, user=u_sarah, defaults={"role": "MEMBER"})
    print("✓ Communities and memberships seeded.")

    # 5. Posts & Social Content
    post1, _ = Post.objects.get_or_create(
        author=u_alex,
        content="🚀 Just deployed our autonomous AI Agent that monitors distributed Django services and self-heals transient errors! What are your favorite testing patterns for reliability in multi-container setups? #AI #DevOps #Django #Python",
        defaults={
            "post_type": "TEXT",
            "visibility": "PUBLIC",
            "likes_count": 24,
            "comments_count": 3,
            "hashtags": ["ai", "devops", "django", "python"]
        }
    )

    PostMedia.objects.get_or_create(
        post=post1,
        file_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
        defaults={"media_type": "IMAGE", "order": 0}
    )

    post2, _ = Post.objects.get_or_create(
        author=u_sarah,
        content="✨ Delighted to share that our research paper on Multi-Agent Memory Pruning has been accepted! Grateful to @prof_emily for the guidance. Slides and code are open-sourced on my profile. #Research #MachineLearning #Stanford",
        defaults={
            "post_type": "ARTICLE",
            "visibility": "PUBLIC",
            "likes_count": 48,
            "comments_count": 5,
            "hashtags": ["research", "machinelearning", "stanford"]
        }
    )

    # Comments
    Comment.objects.get_or_create(
        post=post1,
        author=u_sarah,
        content="Incredible work Alex! Did you implement human-in-the-loop approval gates for destructive recovery actions?",
        defaults={"likes_count": 4}
    )
    Comment.objects.get_or_create(
        post=post1,
        author=u_emily,
        content="Splendid architecture Alex. Highly recommend benchmarking failover latency under synthetic traffic spikes.",
        defaults={"likes_count": 6}
    )
    print("✓ Social posts, media and comments seeded.")

    # 6. Ephemeral Stories
    Story.objects.get_or_create(
        author=u_alex,
        media_url="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
        defaults={
            "media_type": "IMAGE",
            "caption": "Hackathon midnight sprint! ☕💻",
            "expires_at": timezone.now() + timedelta(hours=22)
        }
    )
    Story.objects.get_or_create(
        author=u_sarah,
        media_url="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
        defaults={
            "media_type": "IMAGE",
            "caption": "Lab seminar on Transformer Attention 📊",
            "expires_at": timezone.now() + timedelta(hours=18)
        }
    )
    print("✓ Ephemeral stories seeded.")

    # 7. Courses, Lessons, Quizzes
    course1, _ = Course.objects.get_or_create(
        title="Modern Full-Stack AI Architecture with Django & React",
        defaults={
            "description": "Master building production-grade web ecosystems combining high-throughput Django backends with reactive, accessible React user interfaces and autonomous AI services.",
            "instructor": u_emily,
            "category": "Computer Science",
            "difficulty": "INTERMEDIATE",
            "duration_hours": 8,
            "enrolled_count": 340,
            "rating": 4.9,
            "thumbnail": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
        }
    )

    lesson1, _ = Lesson.objects.get_or_create(
        course=course1,
        title="1. Introduction to Domain-Driven Monorepo Architecture",
        defaults={
            "order": 1,
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "duration_seconds": 720,
            "notes_markdown": "# Monorepo Design Principles\n\n- Colocated contracts\n- Type consistency\n- Independent service boundary isolation",
            "is_preview": True
        }
    )

    lesson2, _ = Lesson.objects.get_or_create(
        course=course1,
        title="2. Real-Time WebSockets with Django Channels & Redis",
        defaults={
            "order": 2,
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "duration_seconds": 960,
            "notes_markdown": "# WebSocket Fundamentals\n\n- ASGI Protocol Router\n- Channel Layers and Consumer Lifecycle",
            "is_preview": False
        }
    )

    quiz1, _ = Quiz.objects.get_or_create(
        course=course1,
        lesson=lesson1,
        defaults={"title": "Monorepo & Domain Design Checkpoint", "passing_score": 75}
    )

    Question.objects.get_or_create(
        quiz=quiz1,
        text="Which protocol specification allows Django to process asynchronous WebSockets and HTTP concurrently?",
        defaults={
            "options": ["WSGI", "ASGI", "FastCGI", "SCGI"],
            "correct_index": 1,
            "explanation": "ASGI (Asynchronous Server Gateway Interface) extends WSGI with asynchronous capability and WebSocket protocol handling."
        }
    )

    Enrollment.objects.get_or_create(
        user=u_alex,
        course=course1,
        defaults={"progress_percent": 50.0, "completed_lessons": [str(lesson1.id)]}
    )
    print("✓ Courses, lessons, quizzes, and enrollments seeded.")

    # 8. Careers & Jobs
    job1, _ = Job.objects.get_or_create(
        title="AI Software Engineer Intern (Summer 2026)",
        recruiter=u_recruiter,
        defaults={
            "company_name": "Google",
            "company_logo": "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80",
            "job_type": "INTERNSHIP",
            "workplace_type": "HYBRID",
            "location": "Mountain View, CA / New York, NY",
            "description": "Join Google DeepMind and Core Engineering teams to prototype next-generation multimodal agent systems.",
            "requirements": ["Currently pursuing B.S. or M.S. in CS or related field", "Proficiency in Python or C++", "Understanding of distributed systems or ML"],
            "skills_required": ["Python", "PyTorch", "Algorithms", "Git"],
            "salary_range": "$55 - $68 / hour",
            "application_deadline": timezone.now() + timedelta(days=60)
        }
    )

    Application.objects.get_or_create(
        job=job1,
        applicant=u_alex,
        defaults={
            "resume_url": "https://example.com/alex_rivera_resume.pdf",
            "cover_letter": "I have built multi-agent frameworks and autonomous software reliability engines and would love to contribute to Google.",
            "status": "REVIEWING"
        }
    )
    print("✓ Careers, job listings, and applications seeded.")

    # 9. Collaborative Projects
    proj1, _ = Project.objects.get_or_create(
        title="EduConnect AI Guardian & Learning Engine",
        owner=u_alex,
        defaults={
            "description": "Collaborative project building an autonomous software reliability engineer and student AI tutor ecosystem.",
            "github_repo_url": "https://github.com/educonnect-ai/core",
            "tags": ["Python", "Django", "React", "AI", "SRE"],
            "is_looking_for_members": True
        }
    )
    ProjectMember.objects.get_or_create(project=proj1, user=u_alex, defaults={"role": "Project Lead"})
    ProjectMember.objects.get_or_create(project=proj1, user=u_sarah, defaults={"role": "ML Architect"})

    Task.objects.get_or_create(
        project=proj1,
        title="Implement OpenAI Responses API with structured JSON output",
        defaults={"status": "DONE", "assigned_to": u_sarah}
    )
    Task.objects.get_or_create(
        project=proj1,
        title="Build real-time WebSocket messaging with typing indicators",
        defaults={"status": "IN_PROGRESS", "assigned_to": u_alex}
    )
    print("✓ Collaborative projects and tasks seeded.")

    # 10. Chat Room & Messages
    room_direct, _ = ChatRoom.objects.get_or_create(
        room_type="DIRECT",
        name="Alex & Sarah",
        defaults={"created_by": u_alex}
    )
    ChatMember.objects.get_or_create(room=room_direct, user=u_alex, defaults={"is_admin": True})
    ChatMember.objects.get_or_create(room=room_direct, user=u_sarah, defaults={"is_admin": False})

    Message.objects.get_or_create(
        room=room_direct,
        sender=u_alex,
        content="Hey Sarah! Did you review the latest PR for the AI Guardian diagnostic collector?",
        defaults={"is_read": True}
    )
    Message.objects.get_or_create(
        room=room_direct,
        sender=u_sarah,
        content="Yes! The classification engine correctly categorized transient Redis timeouts. Works like a charm!",
        defaults={"is_read": True}
    )
    print("✓ Chat rooms and messages seeded.")

    # 11. AI Guardian Telemetry & Incidents
    GuardianMetric.objects.create(metric_name="api_latency_ms", value=42.5, unit="ms")
    GuardianMetric.objects.create(metric_name="db_query_ms", value=12.1, unit="ms")
    GuardianMetric.objects.create(metric_name="cpu_usage_percent", value=18.4, unit="%")
    GuardianMetric.objects.create(metric_name="memory_usage_mb", value=312.0, unit="MB")

    inc1, _ = GuardianIncident.objects.get_or_create(
        service_name="celery_worker",
        error_summary="Transient Celery worker connection timeout during high-throughput media ingestion",
        defaults={
            "severity": "LOW",
            "error_details": "Worker heartbeat missed by 4.2 seconds during concurrent video transcode queueing.",
            "ai_diagnosis": "High I/O burst caused event-loop lag. Safe recovery: flush transient task queue and retry failed task.",
            "recommended_action": "RETRY_FAILED_TASKS",
            "is_resolved": True,
            "resolved_at": timezone.now()
        }
    )
    GuardianAction.objects.get_or_create(
        incident=inc1,
        action_type="RETRY_FAILED_TASKS",
        defaults={
            "is_automated": True,
            "status": "SUCCESS",
            "execution_log": "Successfully re-enqueued 2 tasks. Worker state healthy."
        }
    )

    # 12. Platform Analytics
    PlatformMetric.objects.get_or_create(
        date=timezone.now().date(),
        defaults={
            "active_users": 1420,
            "new_registrations": 85,
            "posts_created": 312,
            "messages_sent": 4290,
            "courses_completed": 48,
            "ai_queries_processed": 1840
        }
    )
    print("✓ AI Guardian incidents and platform metrics seeded.")
    print("🎉 All database entities seeded successfully!")

if __name__ == '__main__':
    seed()
