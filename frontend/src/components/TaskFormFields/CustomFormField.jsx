const CustomFormField = ({ formData, errors, fieldOptions, onChange }) => (
    <div className="task-form-fields">
        <div className="form-field">
            <label className="form-field-label">
                Field Name
                <input
                    value={formData.custom_field.field_name}
                    type="text"
                    name="custom_field.field_name"
                    onChange={onChange}
                    className="form-field-input"
                    placeholder="Field name"
                />
            </label>
            {errors?.field_name && (
                <div className="form-field-error">{errors.field_name}</div>
            )}
        </div>

        <div className="form-field">
            <label className="form-field-label">Field Type</label>
            <select
                value={formData.custom_field.field_type}
                name="custom_field.field_type"
                onChange={onChange}
                className="form-field-select"
            >
                <option value="">Select type</option>
                {fieldOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {errors?.field_type && (
                <div className="form-field-error">{errors.field_type}</div>
            )}
        </div>

        <div className="form-field">
            <label className="form-field-label">Field Value</label>
            {formData.custom_field.field_type === 'boolean' ? (
                <select
                    value={formData.custom_field.field_value}
                    name="custom_field.field_value"
                    onChange={onChange}
                    className="form-field-select"
                >
                    <option value="">Select value</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            ) : (
                <input
                    value={formData.custom_field.field_value}
                    type={formData.custom_field.field_type === 'number' ? 'number' : 'text'}
                    name="custom_field.field_value"
                    onChange={onChange}
                    className="form-field-input"
                    placeholder="Enter value"
                />
            )}
            {errors?.field_value && (
                <div className="form-field-error">{errors.field_value}</div>
            )}
        </div>
    </div>
);

export default CustomFormField;