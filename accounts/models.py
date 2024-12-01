# accounts/models.py

from django.contrib.auth.models import User
from django.db import models

class Review(models.Model):
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews_given")
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews_received")
    heading = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.client.username} for {self.freelancer.username}"



class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class OpenProject(models.Model):
    title = models.CharField(max_length=255, default="Untitled Project")
    description = models.TextField(default="No description provided.")
    category = models.CharField(max_length=255, default="General")  # Store as string
    client = models.CharField(max_length=255, default="Unknown Client")  # Store client's name as string
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title





class OngoingProject(models.Model):
    title = models.CharField(max_length=255, default="Untitled Project")  # Default title
    description = models.TextField(default="No description provided.")   # Default description
    category = models.CharField(max_length=255, default="General")  # Default category stored as a string
    client = models.CharField(max_length=255, default="Unknown Client")  # Client's name as a string
    freelancer = models.CharField(max_length=255, default="Unassigned Freelancer")  # Freelancer's name as a string
    started_at = models.DateTimeField(auto_now_add=True)  # Automatically set current timestamp

    def __str__(self):
        return self.title



class CompletedProject(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="completed_projects")
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name="completed_projects_client")
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="completed_projects_freelancer")
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=50)
    category = models.CharField(max_length=50, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(upload_to="profile_images/", blank=True, null=True)

    def __str__(self):
        return self.user.username


class Job(models.Model):
    STATUS_CHOICES = [
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    freelancer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='jobs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    client = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

