from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import UserProfile
from .serializers import UserProfileSerializer, RegisterSerializer, UserSerializer
from .models import UserProfile, Job
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import OpenProject, OngoingProject, CompletedProject, Category
from .serializers import OpenProjectSerializer, OngoingProjectSerializer, CompletedProjectSerializer, CategorySerializer
from .serializers import ReviewSerializer
from .models import Review
import json
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import OpenProject
from .serializers import OpenProjectSerializer


class ReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        freelancer_id = self.request.query_params.get("freelancer_id", None)
        if freelancer_id:
            return Review.objects.filter(freelancer_id=freelancer_id)
        return Review.objects.filter(freelancer=self.request.user)

class CreateReviewView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)



class OpenProjectView(APIView):
    def get(self, request):
        # Return all open projects for the logged-in user
        client_name = request.user.username  # Get the logged-in user's name
        projects = OpenProject.objects.filter(client=client_name)
        serializer = OpenProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Create a new project
        data = request.data.copy()  # Copy request data to ensure immutability
        data['client'] = request.user.username  # Automatically set the client's name

        serializer = OpenProjectSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class TakeProjectView(generics.UpdateAPIView):
    queryset = OpenProject.objects.all()
    serializer_class = OpenProjectSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            project = OpenProject.objects.get(pk=pk)
            OngoingProject.objects.create(
                title=project.title,
                description=project.description,
                client=project.client,
                freelancer=request.user,
            )
            project.delete()
            return Response({"message": "Project taken successfully."}, status=status.HTTP_200_OK)
        except OpenProject.DoesNotExist:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

    def take_project(request, project_id):
        if request.method == "POST":
            try:
                # Fetch the project
                open_project = OpenProject.objects.get(id=project_id)

                # Get the freelancer's profile
                freelancer_profile = UserProfile.objects.get(user=request.user)

                # Move project to OngoingProject
                ongoing_project = OngoingProject.objects.create(
                    title=open_project.title,
                    description=open_project.description,
                    category=open_project.category,
                    client=open_project.client,
                    freelancer=request.user.username,  # Freelancer name as string
                )

                # Delete the project from OpenProject
                open_project.delete()

                return JsonResponse({"success": True, "message": "Project taken successfully"})
            except OpenProject.DoesNotExist:
                return JsonResponse({"success": False, "message": "Project not found"}, status=404)
            except Exception as e:
                return JsonResponse({"success": False, "message": str(e)}, status=500)
        return JsonResponse({"success": False, "message": "Invalid request method"}, status=400)


class OngoingProjectsView(generics.ListAPIView):
    serializer_class = OngoingProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OngoingProject.objects.filter(freelancer=self.request.user)


class CloseProjectView(generics.UpdateAPIView):
    queryset = OngoingProject.objects.all()
    serializer_class = OngoingProjectSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            # Fetch the ongoing project assigned to the freelancer
            project = OngoingProject.objects.get(pk=pk, freelancer=request.user.username)

            # Get the client as a User instance
            client_user = User.objects.get(username=project.client)

            # Create a completed project
            CompletedProject.objects.create(
                title=project.title,
                description=project.description,
                client=client_user,  # Pass the User instance here
                freelancer=request.user,  # Pass the User instance for the freelancer
            )

            # Delete the ongoing project
            project.delete()

            return Response({"message": "Project closed successfully."}, status=status.HTTP_200_OK)

        except OngoingProject.DoesNotExist:
            return Response({"error": "Project not found or not assigned to you."}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({"error": "Client user does not exist."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompletedProjectsView(generics.ListAPIView):
    serializer_class = CompletedProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CompletedProject.objects.filter(freelancer=self.request.user)

User = get_user_model()  # Using get_user_model for flexibility with custom user models

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Attempt to fetch the user's profile
            profile = UserProfile.objects.get(user=request.user)
            data = {
                "username": request.user.username,
                "bio": profile.bio,
                "profile_image": profile.profile_image.url if profile.profile_image else None,
                "role": profile.role,
                "category": profile.category,
            }
            return Response(data)
        except UserProfile.DoesNotExist:
            # Automatically create a profile if it doesn't exist
            UserProfile.objects.create(user=request.user, role="freelancer", bio="", category="")
            return Response(
                {"message": "Profile was missing but has been created. Please update your details."},
                status=201,
            )


class RegisterView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Save the user
                user = serializer.save()

                # Check if UserProfile already exists
                if not UserProfile.objects.filter(user=user).exists():
                    # Create a UserProfile only if it doesn't exist
                    UserProfile.objects.create(
                        user=user,
                        role=request.data.get("role", "freelancer"),
                        bio=request.data.get("bio", ""),
                        category=request.data.get("category", ""),
                        profile_image=request.data.get("profile_image", None),
                    )

                return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
            except IntegrityError as e:
                return Response(
                    {"error": "A profile already exists for this user."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)  # Get default tokens
        data['username'] = self.user.username  # Add custom fields
        data['role'] = self.user.userprofile.role  # Add the user's role
        data['user_id'] = self.user.id  # Add user ID

        # Debugging: Log or print the response
        print("Login response data:", data)

        return data

# Custom view for login
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id, *args, **kwargs):
        # Fetch the UserProfile using user_id and serialize the data
        user_profile = get_object_or_404(UserProfile, user_id=user_id)
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data)

class FreelancerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = UserProfile.objects.get(user=request.user)
        data = {
            "name": request.user.username,
            "bio": profile.bio,
            "profile_image": profile.profile_image.url if profile.profile_image else None,
            "category": profile.category,
        }
        return Response(data)

class FreelancerJobsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = UserProfile.objects.get(user=request.user)
        jobs = Job.objects.filter(freelancer=profile)
        job_data = [{"id": job.id, "title": job.title, "description": job.description, "status": job.status} for job in jobs]
        return Response(job_data)

class CategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

class FreelancerOpenProjectView(APIView):
    def get(self, request):
        try:
            # Get the logged-in user's category from their profile
            user_profile = UserProfile.objects.get(user=request.user)
            freelancer_category = user_profile.category

            # Filter projects that match the freelancer's category
            projects = OpenProject.objects.filter(category=freelancer_category)

            # Serialize the filtered projects
            serializer = OpenProjectSerializer(projects, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except UserProfile.DoesNotExist:
            # Handle case where the user does not have a profile
            return Response(
                {"error": "User profile not found for the logged-in user."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            # Handle any unexpected errors
            return Response(
                {"error": f"An error occurred while fetching open projects: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FreelancerOngoingProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Filter ongoing projects by freelancer's username
            ongoing_projects = OngoingProject.objects.filter(freelancer=request.user.username)
            serializer = OngoingProjectSerializer(ongoing_projects, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"An error occurred while fetching ongoing projects: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class FreelancerCompletedProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Filter completed projects by freelancer's username
            completed_projects = CompletedProject.objects.filter(freelancer=request.user)
            serializer = CompletedProjectSerializer(completed_projects, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"An error occurred while fetching completed projects: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class ClientOngoingProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Filter ongoing projects by client name
            client_name = request.user.username
            ongoing_projects = OngoingProject.objects.filter(client=client_name)
            serializer = OngoingProjectSerializer(ongoing_projects, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"An error occurred while fetching ongoing projects: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ClientCompletedProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Filter completed projects by client name
            client_name = request.user.username
            completed_projects = CompletedProject.objects.filter(client__username=client_name)
            serializer = CompletedProjectSerializer(completed_projects, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"An error occurred while fetching completed projects: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SubmitReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        try:
            # Fetch the completed project
            project = CompletedProject.objects.get(id=project_id, client=request.user)

            # Validate and save the review
            serializer = ReviewSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    client=request.user,
                    freelancer=project.freelancer,
                    project=project
                )
                return Response({"message": "Review submitted successfully."}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except CompletedProject.DoesNotExist:
            return Response({"error": "Completed project not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"An error occurred while submitting the review: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
