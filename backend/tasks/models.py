from django.contrib.auth.models import User
from django.db import models
from django.core.exceptions import ValidationError

class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class TaskCustomField(models.Model):
    FIELD_TYPES = [
        ("string", "String"),
        ("boolean", "Boolean"),
        ("number", "Number"),
    ]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='custom_fields')
    field_name = models.CharField(max_length=100)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    field_value = models.JSONField(null=True)  
    
    def clean(self):
        if self.field_value is None:
            return
        
        type_validations = {
            'string': lambda v: isinstance(v, str),
            'boolean': lambda v: isinstance(v, bool),
            'number': lambda v: isinstance(v, (int, float)),
        }
        
        validator = type_validations.get(self.field_type)
        if validator and not validator(self.field_value):
            raise ValidationError({
                'value': f'Value must be of type {self.field_type}'
            })
