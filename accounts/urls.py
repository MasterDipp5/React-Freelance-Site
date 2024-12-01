from django.urls import path
from . import views
from .views import UserProfileView, RegisterView
from .views import CustomTokenObtainPairView
from .views import UserDetailView
from .views import (
    OpenProjectView,
    TakeProjectView,
    OngoingProjectsView,
    CloseProjectView,
    CompletedProjectsView,
    CategoryListView,
    FreelancerOpenProjectView,
    FreelancerOngoingProjectsView,
    FreelancerCompletedProjectsView,ClientOngoingProjectsView,
    ClientCompletedProjectsView,
    SubmitReviewView,
)
from .views import ReviewListView, CreateReviewView


urlpatterns = [
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('register/', RegisterView.as_view(), name='register'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/user/<int:user_id>/', views.UserProfileView.as_view(), name='user-profile'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("api/open_projects/", OpenProjectView.as_view(), name="open_projects"),
    path("api/take_project/<int:pk>/", TakeProjectView.as_view(), name="take_project"),
    path("api/ongoing_projects/", OngoingProjectsView.as_view(), name="ongoing_projects"),
    path("api/close_project/<int:pk>/", CloseProjectView.as_view(), name="close_project"),
    path("api/completed_projects/", CompletedProjectsView.as_view(), name="completed_projects"),
    path("api/reviews/", ReviewListView.as_view(), name="review_list"),
    path("api/reviews/create/", CreateReviewView.as_view(), name="create_review"),
    path('api/categories/', CategoryListView.as_view(), name='categories'),
    path('freelancer_open_projects/', FreelancerOpenProjectView.as_view(), name='freelancer_open_projects'),
    path('freelancer_ongoing_projects/', FreelancerOngoingProjectsView.as_view(), name='freelancer_ongoing_projects'),
    path('freelancer_completed_projects/', FreelancerCompletedProjectsView.as_view(), name='freelancer_completed_projects'),
    path('ongoing_projects/', ClientOngoingProjectsView.as_view(), name='client-ongoing-projects'),
    path('completed_projects/', ClientCompletedProjectsView.as_view(), name='client-completed-projects'),
    path('submit_review/<int:project_id>/', SubmitReviewView.as_view(), name='submit-review'),
]

