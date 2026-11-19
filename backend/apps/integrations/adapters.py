import os
import requests
from django.conf import settings

class BaseIntegrationAdapter:
    provider_name = ""

    def __init__(self, external_account=None):
        self.account = external_account

    def is_configured(self):
        """Check if platform developer credentials exist in environment."""
        raise NotImplementedError

    def get_auth_url(self, state=None):
        """Generate OAuth redirection URL."""
        raise NotImplementedError

    def exchange_code_for_token(self, code):
        """Exchange authorization code for access tokens."""
        raise NotImplementedError


class InstagramAdapter(BaseIntegrationAdapter):
    provider_name = "INSTAGRAM"

    def is_configured(self):
        return bool(settings.INSTAGRAM_CLIENT_ID and settings.INSTAGRAM_CLIENT_SECRET)

    def get_auth_url(self, state="educonnect_state"):
        if not self.is_configured():
            return None
        return (
            f"https://api.instagram.com/oauth/authorize"
            f"?client_id={settings.INSTAGRAM_CLIENT_ID}"
            f"&redirect_uri={settings.INSTAGRAM_REDIRECT_URI}"
            f"&scope=user_profile,user_media"
            f"&response_type=code"
            f"&state={state}"
        )

    def exchange_code_for_token(self, code):
        if not self.is_configured():
            return {"error": "Instagram API credentials not configured in environment"}
        url = "https://api.instagram.com/oauth/access_token"
        payload = {
            'client_id': settings.INSTAGRAM_CLIENT_ID,
            'client_secret': settings.INSTAGRAM_CLIENT_SECRET,
            'grant_type': 'authorization_code',
            'redirect_uri': settings.INSTAGRAM_REDIRECT_URI,
            'code': code
        }
        res = requests.post(url, data=payload, timeout=10)
        return res.json()


class WhatsAppAdapter(BaseIntegrationAdapter):
    provider_name = "WHATSAPP"

    def is_configured(self):
        return bool(settings.WHATSAPP_API_TOKEN and settings.WHATSAPP_PHONE_NUMBER_ID)

    def send_template_notification(self, recipient_phone, template_name="student_alert", language_code="en_US"):
        if not self.is_configured():
            return {"status": "unconfigured", "error": "WhatsApp Business credentials missing"}
        url = f"https://graph.facebook.com/v19.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
        headers = {
            "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": recipient_phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code}
            }
        }
        res = requests.post(url, json=payload, headers=headers, timeout=10)
        return res.json()


class LinkedInAdapter(BaseIntegrationAdapter):
    provider_name = "LINKEDIN"

    def is_configured(self):
        return bool(settings.LINKEDIN_CLIENT_ID and settings.LINKEDIN_CLIENT_SECRET)

    def get_auth_url(self, state="educonnect_linkedin"):
        if not self.is_configured():
            return None
        return (
            f"https://www.linkedin.com/oauth/v2/authorization"
            f"?response_type=code"
            f"&client_id={settings.LINKEDIN_CLIENT_ID}"
            f"&redirect_uri={settings.LINKEDIN_REDIRECT_URI}"
            f"&state={state}"
            f"&scope=r_liteprofile%20r_emailaddress%20w_member_social"
        )


class YouTubeAdapter(BaseIntegrationAdapter):
    provider_name = "YOUTUBE"

    def is_configured(self):
        return bool(settings.YOUTUBE_API_KEY)

    def search_educational_videos(self, query, max_results=6):
        if not self.is_configured():
            return {
                "status": "unconfigured",
                "message": "YouTube API key not configured. Showing curated educational resources."
            }
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": query + " tutorial education",
            "type": "video",
            "maxResults": max_results,
            "key": settings.YOUTUBE_API_KEY
        }
        res = requests.get(url, params=params, timeout=10)
        return res.json()
