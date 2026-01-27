from django.contrib import admin
from .models import Task, TaskCustomField
# Register your models here.
admin.site.register(Task)
admin.site.register(TaskCustomField)