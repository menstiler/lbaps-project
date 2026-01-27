from rest_framework.viewsets import ModelViewSet
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).prefetch_related('custom_fields')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
