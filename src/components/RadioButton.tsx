import React from 'react';

interface RadioOption {
  value: number;
  label: string;
}

interface RadioButtonProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value?: number;
  onChange?: (value: string) => void;
  className?: string;
  required?: boolean;
}

const RadioButton: React.FC<RadioButtonProps> = ({ 
  label, 
  name,
  options, 
  value, 
  onChange, 
  className = '',
  required = false 
}) => {
  return (
    <div className={`form-row ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex flex-wrap gap-4 flex-1">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="w-4 h-4 text-[#8bbb04] focus:ring-[#8bbb04] focus:ring-2 accent-[#8bbb04]"
              required={required}
            />
            <span className="text-sm text-gray-700 group-hover:text-secondary transition-colors">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioButton;

