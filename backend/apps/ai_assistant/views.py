from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F
from .models import AIConversation, AIMessage
from .serializers import AIConversationSerializer, AIMessageSerializer
from .ai_service import ask_educonnect_ai

class AIAssistantViewSet(viewsets.ModelViewSet):
    serializer_class = AIConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user).prefetch_related('messages')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def ask(self, request, pk=None):
        conversation = self.get_object()
        prompt = request.data.get('prompt')

        if not prompt or not prompt.strip():
            return Response({'error': 'Prompt text is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Save student prompt
        user_msg = AIMessage.objects.create(
            conversation=conversation,
            role='user',
            content=prompt.strip(),
            tokens_used=len(prompt.split())
        )

        # 2. Gather history
        history = list(conversation.messages.order_by('created_at').values('role', 'content'))

        # 3. Query AI Service
        result = ask_educonnect_ai(
            prompt=prompt,
            mode=conversation.context_mode,
            conversation_history=history
        )

        # 4. Save AI response
        ai_msg = AIMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=result['response'],
            tokens_used=result.get('tokens_used', 50)
        )

        # 5. Update conversation total tokens
        AIConversation.objects.filter(id=conversation.id).update(
            total_tokens=F('total_tokens') + user_msg.tokens_used + ai_msg.tokens_used
        )
        conversation.refresh_from_db()

        return Response({
            'user_message': AIMessageSerializer(user_msg).data,
            'assistant_message': AIMessageSerializer(ai_msg).data,
            'provider': result.get('provider', 'AI'),
            'total_tokens': conversation.total_tokens
        })
