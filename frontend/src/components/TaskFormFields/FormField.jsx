const FormField = ({ label, value, onChange, type, error, className, name, placeholder, required=false, labelStyle }) => {
    return (
        <div className={`task-form-${className ? className : ''}-field`}>
            <div className="form-field form-field-full-width">
                <label className="form-field-label" style={labelStyle}>
                    {type === 'checkbox' && (
                        <input
                            type="checkbox"
                            name={name}
                            checked={value}
                            onChange={onChange}
                            className="form-field-checkbox"
                        />
                    )}
                    {label}
                    {required && <span className="required-asterisk">*</span>}
                    {type === 'textarea' && (
                        <textarea
                            value={value}
                            name={name}
                            onChange={onChange}
                            className="form-field-input"
                            placeholder={placeholder}
                            rows="3"
                        />
                    )}
                    {(type === 'text' || type === 'date') && (
                        <input
                            value={value}
                            name={name}
                            onChange={onChange}
                            className="form-field-input"
                            placeholder={placeholder}
                            type={type}
                        />
                    )}
                </label>
                {error && (
                    <div className="form-field-error">{error}</div>
                )}
            </div>
        </div>
    );
};

export default FormField;