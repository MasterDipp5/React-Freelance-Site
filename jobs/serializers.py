from rest_framework import serializers
from .models import Job, Category

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ['id', 'client', 'title', 'description', 'budget', 'deadline', 'categories', 'created_at']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']
