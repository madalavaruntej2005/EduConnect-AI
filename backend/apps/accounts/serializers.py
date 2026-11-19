from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'is_verified', 'avatar', 'banner', 'headline',
            'bio', 'phone_number', 'date_joined'
        )
        read_only_fields = ('id', 'is_verified', 'date_joined')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='STUDENT')
    college_id = serializers.UUIDField(required=False, write_only=True)
    major = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'headline', 'college_id', 'major')

    def create(self, validated_data):
        password = validated_data.pop('password')
        college_id = validated_data.pop('college_id', None)
        major = validated_data.pop('major', 'General Studies')

        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'STUDENT'),
            headline=validated_data.get('headline', '')
        )

        # Automatically initialize StudentProfile if role is STUDENT
        if user.role == 'STUDENT':
            from apps.profiles.models import StudentProfile
            from apps.colleges.models import College
            college_instance = None
            if college_id:
                try:
                    college_instance = College.objects.get(id=college_id)
                except College.DoesNotExist:
                    pass

            StudentProfile.objects.create(
                user=user,
                college=college_instance,
                major=major,
                skills=['Python', 'Git', 'Problem Solving']
            )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = User.objects.filter(email__iexact=email).first()
        if not user or not user.check_password(password):
            raise serializers.ValidationError('Invalid email or password.')

        if not user.is_active:
            raise serializers.ValidationError('This account has been suspended or deactivated.')

        refresh = RefreshToken.for_user(user)
        return {
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
