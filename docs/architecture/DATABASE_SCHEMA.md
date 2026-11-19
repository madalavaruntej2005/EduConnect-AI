# EduConnect AI — PostgreSQL Database Architecture & Schema

## 1. Schema Conventions
- **Primary Keys**: Every domain model uses UUIDv4 (`id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`).
- **Audit Timestamps**: All entities carry `created_at` and `updated_at` indexed timestamps.
- **Data Integrity**: Enforced foreign key cascades, unique constraints (`unique_together` and `UniqueConstraint` with filters), and explicit database indexes.

---

## 2. Entity Relationship Overview

```
[User] 1 ──────── 1 [StudentProfile] ──────── * [College]
  │
  ├────── * [Post] ────── * [PostMedia]
  │          │
  │          ├───── * [Comment]
  │          └───── * [Like]
  │
  ├────── * [Story] ───── * [StoryViewer]
  │
  ├────── * [ChatMember] ──── * [ChatRoom] ──── * [Message]
  │
  ├────── * [Membership] ──── * [Community]
  │
  ├────── * [Enrollment] ──── * [Course] ──── * [Lesson] ──── 1 [Quiz] ──── * [Question]
  │
  ├────── * [ProjectMember] ─ * [Project] ─── * [Task]
  │
  ├────── * [Application] ─── * [Job]
  │
  ├────── * [AIConversation] ─ * [AIMessage]
  │
  ├────── * [ExternalAccount]
  │
  └────── * [Notification]

[GuardianIncident] ───┬─── * [GuardianAction]
                     └─── * [RecoveryApproval]
[GuardianMetric]
[AuditLog]
[ContentReport]
[PlatformMetric]
```

---

## 3. Data Dictionary

### Accounts & Profiles
- `accounts_user`: Custom user table (email, username, password_hash, role, is_verified, avatar, banner, headline, bio).
- `profiles_studentprofile`: University affiliation, major, graduation_year, CGPA, skills JSON, streak_count, reputation_points, badges JSON.
- `colleges_college`: Name, code (e.g. MIT, STANFORD), domain, city, state, country, logo, verification status.

### Social Networking & Ephemeral Content
- `social_post`: Author FK, content, post_type (`TEXT`, `IMAGE`, `VIDEO`, `SHORT`, `ARTICLE`), visibility, likes_count, comments_count, hashtags JSON.
- `social_postmedia`: Post FK, media_type (`IMAGE`, `VIDEO`), file_url, order.
- `social_comment`: Post FK, Author FK, parent self-referential FK (for nested threads), content.
- `social_like`: User FK, polymorphic Post/Comment FK, unique constraints.
- `social_savedpost`: User bookmarks.
- `stories_story`: Author FK, media_url, expires_at (default +24h), caption.
- `stories_storyviewer`: Story FK, Viewer FK, viewed_at.

### Real-Time Chat & Communities
- `messaging_chatroom`: room_type (`DIRECT`, `GROUP`), name, avatar, created_by.
- `messaging_chatmember`: Room FK, User FK, is_admin, last_read_at.
- `messaging_message`: Room FK, Sender FK, content, attachment_url, is_read.
- `communities_community`: Name, slug, description, category, creator FK, members_count.
- `communities_membership`: Community FK, User FK, role (`MEMBER`, `MODERATOR`, `ADMIN`).

### Learning Hub & Academics
- `learning_course`: Instructor FK, title, slug, difficulty, duration_hours, rating, enrolled_count.
- `learning_lesson`: Course FK, order, title, video_url, duration_seconds, notes_markdown.
- `learning_quiz`: Course FK, Lesson FK, title, passing_score.
- `learning_question`: Quiz FK, text, options JSON, correct_index, explanation.
- `learning_enrollment`: User FK, Course FK, progress_percent, completed_lessons JSON.

### Professional Networking & Careers
- `careers_job`: Recruiter FK, title, company_name, job_type (`INTERNSHIP`, `FULL_TIME`), salary_range, location.
- `careers_application`: Job FK, Applicant FK, resume_url, cover_letter, status (`SUBMITTED`, `REVIEWING`, `INTERVIEWING`, `OFFERED`, `REJECTED`).
- `projects_project`: Owner FK, title, description, github_repo_url, tags JSON, is_looking_for_members.
- `projects_task`: Project FK, title, assigned_to FK, status (`TODO`, `IN_PROGRESS`, `DONE`).

### AI & Autonomous Reliability
- `ai_assistant_aiconversation`: User FK, title, context_mode (`TUTOR`, `DEBUGGER`, `SUMMARIZER`, `QUIZ_GEN`), total_tokens.
- `ai_assistant_aimessage`: Conversation FK, role (`user`, `assistant`), content, tokens_used.
- `guardian_guardianincident`: service_name, severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), error_summary, ai_diagnosis, recommended_action, is_resolved.
- `guardian_guardianaction`: Incident FK, action_type, status, execution_log.
- `guardian_recoveryapproval`: Incident FK, proposed_action, risk_score, status (`PENDING`, `APPROVED`, `REJECTED`).
