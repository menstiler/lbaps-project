from rest_framework import serializers
from .models import Task, TaskCustomField

class TaskCustomFieldSerializer(serializers.ModelSerializer):
    """Serializer for reading custom field data"""
    value = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskCustomField
        fields = ['id', 'field_name', 'field_type', 'field_value', 'value']
        read_only_fields = ['id', 'value']

    def get_value(self, obj):
        return obj.field_value


class TaskCustomFieldWriteSerializer(serializers.Serializer):
    """Serializer for writing custom field data"""
    field_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    field_type = serializers.ChoiceField(choices=TaskCustomField.FIELD_TYPES, required=False, allow_null=True, allow_blank=True)
    field_value = serializers.JSONField(required=False, allow_null=True)

    def validate(self, data):
        """Validate that if any field is provided, all fields are required"""
        field_name = data.get('field_name')
        field_type = data.get('field_type')
        field_value = data.get('field_value')
        
        # Check if any field is provided
        has_field_name = field_name is not None and field_name != '' and (not isinstance(field_name, str) or field_name.strip() != '')
        has_field_type = field_type is not None and field_type != ''
        has_field_value = field_value is not None and field_value != ''
        
        has_any_field = has_field_name or has_field_type or has_field_value
        
        # If no field is provided, it's valid (custom_field is optional)
        if not has_any_field:
            return data
        
        # If any field is provided, all must be provided
        errors = {}
        
        if not has_field_name:
            errors['field_name'] = ['This field is required when either field type or field value is provided.']
        
        if not has_field_type:
            errors['field_type'] = ['This field is required when either field name or field value is provided.']
        
        if not has_field_value:
            errors['field_value'] = ['This field is required when either field name or field type is provided.']
        
        if errors:
            raise serializers.ValidationError(errors)
        
        # Validate field_value matches field_type
        type_validations = {
            'string': (str, 'string'),
            'boolean': (bool, 'boolean'),
            'number': ((int, float), 'number'),
        }
        
        expected_type, type_name = type_validations.get(field_type)
        
        if not isinstance(field_value, expected_type):
            raise serializers.ValidationError({
                'field_value': [f'Value must be of type {type_name}']
            })
        
        return data


class TaskSerializer(serializers.ModelSerializer):
    custom_field = TaskCustomFieldWriteSerializer(write_only=True, required=False)
    custom_fields = TaskCustomFieldSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ("user",)

    def create(self, validated_data):
        """Create task and associated custom field"""
        custom_field_data = validated_data.pop('custom_field', None)
        task = Task.objects.create(**validated_data)
        
        # Only create custom field if all fields are provided
        if custom_field_data:
            field_name = custom_field_data.get('field_name')
            field_type = custom_field_data.get('field_type')
            field_value = custom_field_data.get('field_value')
            
            # Only create if all fields are present
            if field_name and field_type and field_value is not None:
                TaskCustomField.objects.create(
                    task=task,
                    field_name=field_name,
                    field_type=field_type,
                    field_value=field_value
                )
        
        return task