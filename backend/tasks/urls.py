from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import TaskViewSet, UserSettingsViewSet, settings_view

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="tasks")
router.register("settings", UserSettingsViewSet, basename="settings")


urlpatterns = [
    path("settings", settings_view, name="settings"),
] + router.urls