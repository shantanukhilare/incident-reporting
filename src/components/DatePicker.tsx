import React from 'react';

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  required?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  label, 
  value, 
  onChange, 
  className = '',
  required = false 
}) => {
  return (
    <div className="form-row">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className={`form-input flex-1 ${className}`}
        required={required}
      />
    </div>
  );
};

export default DatePicker;

