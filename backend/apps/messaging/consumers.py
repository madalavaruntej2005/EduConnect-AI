import json
from asgiref.sync import sync_to_async

try:
    from channels.generic.websocket import AsyncWebsocketConsumer

    class ChatConsumer(AsyncWebsocketConsumer):
        async def connect(self):
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            self.room_group_name = f'chat_{self.room_id}'
            self.user = self.scope.get('user')

            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

            # Broadcast online status
            if self.user and self.user.is_authenticated:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_status',
                        'user_id': str(self.user.id),
                        'username': self.user.username,
                        'status': 'online'
                    }
                )

        async def disconnect(self, close_code):
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

        async def receive(self, text_data):
            data = json.loads(text_data)
            msg_type = data.get('type', 'chat_message')

            if msg_type == 'typing':
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_typing',
                        'user_id': str(self.user.id) if self.user and self.user.is_authenticated else 'anon',
                        'username': self.user.username if self.user and self.user.is_authenticated else 'Someone',
                        'is_typing': data.get('is_typing', True)
                    }
                )
            elif msg_type == 'chat_message':
                content = data.get('content', '')
                attachment_url = data.get('attachment_url', '')
                attachment_type = data.get('attachment_type', '')

                # Broadcast to group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'new_message',
                        'room_id': self.room_id,
                        'sender_id': str(self.user.id) if self.user and self.user.is_authenticated else None,
                        'sender_username': self.user.username if self.user and self.user.is_authenticated else 'User',
                        'content': content,
                        'attachment_url': attachment_url,
                        'attachment_type': attachment_type,
                    }
                )

        async def new_message(self, event):
            await self.send(text_data=json.dumps(event))

        async def user_typing(self, event):
            await self.send(text_data=json.dumps(event))

        async def user_status(self, event):
            await self.send(text_data=json.dumps(event))

except ImportError:
    # Channels fallback mock for environments without channels
    ChatConsumer = None
