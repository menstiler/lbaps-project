from django.contrib import admin
from .models import Task, TaskCustomField, UserSettings

admin.site.register(Task)
admin.site.register(TaskCustomField)
admin.site.register(UserSettings)