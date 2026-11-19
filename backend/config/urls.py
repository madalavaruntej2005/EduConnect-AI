"""
EduConnect AI - Primary URL Routing Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def health_check(request):
    """Health check endpoint for Render, load balancers and AI Guardian."""
    return JsonResponse({
        "status": "healthy",
        "service": "EduConnect AI Backend",
        "version": "1.0.0",
        "environment": "production" if not settings.DEBUG else "development"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('api/v1/health/', health_check, name='api_health_check'),

    # API Version 1 endpoints
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/users/', include('apps.accounts.urls_users')),
    path('api/v1/profiles/', include('apps.profiles.urls')),
    path('api/v1/colleges/', include('apps.colleges.urls')),
    path('api/v1/posts/', include('apps.social.urls')),
    path('api/v1/feed/', include('apps.social.urls_feed')),
    path('api/v1/stories/', include('apps.stories.urls')),
    path('api/v1/connections/', include('apps.networking.urls')),
    path('api/v1/communities/', include('apps.communities.urls')),
    path('api/v1/chat/', include('apps.messaging.urls')),
    path('api/v1/courses/', include('apps.learning.urls')),
    path('api/v1/jobs/', include('apps.careers.urls')),
    path('api/v1/projects/', include('apps.projects.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/ai/', include('apps.ai_assistant.urls')),
    path('api/v1/integrations/', include('apps.integrations.urls')),
    path('api/v1/guardian/', include('apps.guardian.urls')),
    path('api/v1/moderation/', include('apps.moderation.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
