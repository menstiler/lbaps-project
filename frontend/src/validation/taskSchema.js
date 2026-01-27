import { z } from 'zod';

export const customFieldSchema = z.object({
    field_name: z.string().optional(),
    field_type: z.enum(['string', 'boolean', 'number', '']).optional(),
    field_value: z.string().or(z.boolean()).or(z.number()).optional(),
}).superRefine((data, ctx) => {
    const hasFieldName = data.field_name && data.field_name.trim() !== '';
    const hasFieldType = data.field_type && data.field_type !== '';
    const hasFieldValue = data.field_value !== null &&
        data.field_value !== undefined &&
        data.field_value !== '' &&
        (typeof data.field_value !== 'string' || data.field_value.trim() !== '');

    const hasAny = hasFieldName || hasFieldType || hasFieldValue;

    // If no field is provided 
    if (!hasAny) {
        return;
    }

    // If any custom field is provided, all custom fields must be provided
    if (!hasFieldName) {
        ctx.addIssue({
            code: 'custom',
            message: 'Field name is required when either field type or field value is provided.',
            path: ['field_name'],
        });
    }

    if (!hasFieldType) {
        ctx.addIssue({
            code: 'custom',
            message: 'This field is required when either field name or field value is provided.',
            path: ['field_type'],
        });
    }

    if (!hasFieldValue) {
        ctx.addIssue({
            code: 'custom',
            message: 'This field is required when either field name or field type is provided.',
            path: ['field_value'],
        });
    }

    // Type validation 
    if (hasFieldName && hasFieldType && hasFieldValue) {
        if (data.field_type === 'string' && typeof data.field_value !== 'string') {
            ctx.addIssue({
                code: 'custom',
                message: 'Value must be of type string',
                path: ['field_value'],
            });
        } else if (data.field_type === 'number' && isNaN(data.field_value)) {
            ctx.addIssue({
                code: 'custom',
                message: 'Value must be of type number',
                path: ['field_value'],
            });
        } else if (data.field_type === 'boolean' &&
            data.field_value !== 'true' &&
            data.field_value !== 'false') {
            ctx.addIssue({
                code: 'custom',
                message: 'Value must be of type boolean',
                path: ['field_value'],
            });
        }
    }
});

export const taskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    custom_field: customFieldSchema.optional(),
});