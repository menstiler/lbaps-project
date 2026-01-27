from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Task, UserSettings
from .serializers import TaskSerializer, UserSettingsSerializer

class TaskViewSet(ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).prefetch_related('custom_fields')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserSettingsViewSet(ModelViewSet):
    serializer_class = UserSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserSettings.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def settings_view(request):
        """Get or update current user's settings"""
        settings, created = UserSettings.objects.get_or_create(user=request.user)
        
        if request.method == 'PUT':
            serializer = UserSettingsSerializer(settings, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        
        # GET request
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)