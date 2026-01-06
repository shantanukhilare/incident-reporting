import React from 'react';

interface DropdownOption {
  value: number;
  label: string;
}

interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  label, 
  options, 
  value, 
  onChange, 
  className = '',
  required = false,
  placeholder = 'Select an option',
  error
}) => {
  return (
    <div className="form-row">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex-1 flex flex-col gap-1 w-full">
        <select
          value={value === 0 ? "" : value} // ← Fixed: empty string when value is 0
          onChange={(e) => onChange?.(parseInt(e.target.value))}
          className={`form-select flex-1 ${error ? 'border-red-500' : ''} ${className}`}
          required={required}
        >
          <option value="" disabled style={{ color: '#9ca3af', fontStyle: 'italic' }}>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} style={{ padding: '0.75rem', backgroundColor: 'white', color: '#1f2937' }}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-red-500 text-xs ml-1">{error}</span>
        )}
      </div>
    </div>
  );
};

export default Dropdown;