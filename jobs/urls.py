from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'categories', CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
