from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile
import re
from .models import OpenProject, OngoingProject, CompletedProject, Category
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.username", read_only=True)
    freelancer_name = serializers.CharField(source="freelancer.username", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "client",
            "client_name",
            "freelancer",
            "freelancer_name",
            "heading",
            "description",
            "created_at",
        ]

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'role']

def validate_username(value):
    # Allow letters, numbers, spaces, dashes, and underscores
    if not re.match(r'^[\w\s-]+$', value):
        raise serializers.ValidationError("Username can only contain letters, numbers, spaces, dashes, and underscores.")
    return value


# accounts/serializers.py
class RegisterSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False)
    bio = serializers.CharField(required=False)
    category = serializers.CharField(required=False)
    role = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'category', 'bio', 'profile_image']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        UserProfile.objects.create(
            user=user,
            role=validated_data['role'],
            category=validated_data.get('category', ""),
            bio=validated_data.get('bio', ""),
            profile_image=validated_data.get('profile_image')
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class OpenProjectSerializer(serializers.ModelSerializer):
    category = serializers.CharField()

    class Meta:
        model = OpenProject
        fields = ['id', 'title', 'description', 'category', 'client', 'created_at']



class OngoingProjectSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()

    class Meta:
        model = OngoingProject
        fields = ['id', 'title', 'description', 'category', 'client', 'freelancer', 'started_at']


class CompletedProjectSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()

    class Meta:
        model = CompletedProject
        fields = ['id', 'title', 'description', 'category', 'client', 'freelancer', 'completed_at']

