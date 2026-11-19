from rest_framework import serializers
from .models import PlatformMetric

class PlatformMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformMetric
        fields = '__all__'
