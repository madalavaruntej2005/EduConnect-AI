# EduConnect AI — REST API Reference (v1)

Base URL: `http://localhost:8000/api/v1` (or production host)

All authenticated endpoints require the header:
```http
Authorization: Bearer <access_jwt_token>
```

---

## 1. Authentication & Accounts (`/api/v1/auth/`)

| Method | Endpoint | Description | Permissions |
|---|---|---|---|
| `POST` | `/api/v1/auth/register/` | Register student, educator, or recruiter | Public |
| `POST` | `/api/v1/auth/login/` | Authenticate with email & password, returns JWT tokens | Public |
| `GET` | `/api/v1/auth/me/` | Retrieve currently authenticated user profile | Authenticated |
| `PATCH` | `/api/v1/auth/me/` | Update avatar, bio, headline | Authenticated |
| `POST` | `/api/v1/auth/refresh/` | Refresh expired JWT access token | Public |
| `POST` | `/api/v1/auth/logout/` | Blacklist refresh token & logout session | Authenticated |

---

## 2. Social Networking (`/api/v1/posts/` and `/api/v1/feed/`)

| Method | Endpoint | Description | Permissions |
|---|---|---|---|
| `GET` | `/api/v1/feed/?mode=for_you` | Retrieve personalized social feed (`for_you`, `trending`, `shorts`) | Public / Auth |
| `POST` | `/api/v1/posts/` | Create post (Discussion, Photo, Reel, Article) with hashtags & media | Authenticated |
| `GET` | `/api/v1/posts/{id}/` | Retrieve post details | Public |
| `POST` | `/api/v1/posts/{id}/like/` | Like or unlike post (optimistic toggle) | Authenticated |
| `POST` | `/api/v1/posts/{id}/save_post/` | Bookmark or unbookmark post | Authenticated |
| `GET` | `/api/v1/posts/{id}/comments/` | List comments and nested replies on post | Public |
| `POST` | `/api/v1/posts/{id}/comments/` | Submit a comment on post | Authenticated |

---

## 3. Ephemeral Stories (`/api/v1/stories/`)

| Method | Endpoint | Description | Permissions |
|---|---|---|---|
| `GET` | `/api/v1/stories/` | Get active non-expired stories (< 24h old) | Public / Auth |
| `POST` | `/api/v1/stories/` | Publish new 24h story with media URL | Authenticated |
| `POST` | `/api/v1/stories/{id}/view_story/` | Record story viewer | Authenticated |
| `GET` | `/api/v1/stories/{id}/viewers/` | Viewers list (Author only) | Author |

---

## 4. Real-Time Chat & Messaging (`/api/v1/chat/`)

| Method | Endpoint | Description | Permissions |
|---|---|---|---|
| `GET` | `/api/v1/chat/` | List user direct conversations & group chat rooms | Authenticated |
| `POST` | `/api/v1/chat/direct/` | Initiate or retrieve 1-to-1 conversation by `user_id` | Authenticated |
| `GET` | `/api/v1/chat/{room_id}/messages/` | Retrieve chat history & mark read | Member |
| `POST` | `/api/v1/chat/{room_id}/messages/` | Send message (text or file attachment) | Member |
| `WS` | `/ws/chat/{room_id}/` | WebSocket real-time messaging, typing indicators & online status | Authenticated |

---

## 5. Communities & Clubs (`/api/v1/communities/`)

| Method | Endpoint | Description | Permissions |
|---|---|---|---|
| `GET` | `/api/v1/communities/?category=...` | List student communities & clubs | Public |
| `POST` | `/api/v1/communities/` | Found a new student community | Authenticated |
| `POST` | `/api/v1/communities/{id}/join/` | Join community as member | Authenticated |
| `POST` | `/api/v1/communities/{id}/leave/` | Leave community | Member |

---

## 6. Learning Management Hub (`/api/v1/courses/`)

| Method | Endpoint | Description | Permissions |
|---|---|---|---|
| `GET` | `/api/v1/courses/?difficulty=...` | List video masterclasses & courses | Public |
| `GET` | `/api/v1/courses/{id}/` | Retrieve course details & lesson syllabus | Public |
| `POST` | `/api/v1/courses/{id}/enroll/` | Enroll student into course | Authenticated |
| `POST` | `/api/v1/courses/{id}/complete_lesson/` | Mark lesson complete & increment progress | Authenticated |
| `GET` | `/api/v1/courses/{id}/quizzes/` | Get interactive course quizzes | Public / Auth |
| `GET` | `/api/v1/courses/my-enrollments/` | Get student active course progress | Authenticated |

---

## 7. Careers, Internships & Jobs (`/api/v1/jobs/`)

| Method | Endpoint | Description | Permissions |
|---|---|---|---|
| `GET` | `/api/v1/jobs/?type=INTERNSHIP` | List internships & graduate opportunities | Public |
| `POST` | `/api/v1/jobs/` | Post a job opportunity | Recruiter / Admin |
| `POST` | `/api/v1/jobs/{id}/apply/` | Apply with resume PDF URL and cover note | Student |
| `GET` | `/api/v1/jobs/my-applications/` | List student application status history | Authenticated |

---

## 8. Collaborative Projects (`/api/v1/projects/`)

| Method | Endpoint | Description | Permissions |
|---|---|---|---|
| `GET` | `/api/v1/projects/` | List student projects looking for members | Public |
| `POST` | `/api/v1/projects/` | Create student project workspace | Authenticated |
| `POST` | `/api/v1/projects/{id}/join/` | Join project collaboration team | Authenticated |
| `POST` | `/api/v1/projects/{id}/create_task/` | Add Kanban task (`TODO`) | Team Member |
| `PATCH` | `/api/v1/projects/{id}/update-task/{task_id}/` | Move task (`TODO` -> `IN_PROGRESS` -> `DONE`) | Team Member |

---

## 9. AI Academic Assistant (`/api/v1/ai/`)

| Method | Endpoint | Description | Permissions |
|---|---|---|---|
| `GET` | `/api/v1/ai/` | List student AI chat sessions | Authenticated |
| `POST` | `/api/v1/ai/` | Create session (`TUTOR`, `DEBUGGER`, `SUMMARIZER`, `QUIZ_GEN`) | Authenticated |
| `POST` | `/api/v1/ai/{id}/ask/` | Ask academic prompt; returns OpenAI / Autonomous engine answer | Authenticated |

---

## 10. AI Guardian Reliability Engine (`/api/v1/guardian/`)

| Method | Endpoint | Description | Permissions |
|---|---|---|---|
| `GET` | `/api/v1/guardian/health-overview/` | Platform health score (0-100), active alerts, telemetry | Public / Admin |
| `GET` | `/api/v1/guardian/incidents/` | List detected infrastructure anomalies | Admin / Guardian |
| `POST` | `/api/v1/guardian/incidents/{id}/execute_recovery/` | Trigger safe non-destructive self-healing tool | Admin / Guardian |
| `POST` | `/api/v1/guardian/approvals/{id}/decide/` | Sign-off or reject high-risk recovery action | Admin |
