"""Celery configuration for EduConnect AI background jobs."""
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    from celery import Celery
    app = Celery('educonnect')
    app.config_from_object('django.conf:settings', namespace='CELERY')
    app.autodiscover_tasks()
except Exception:
    app = None
