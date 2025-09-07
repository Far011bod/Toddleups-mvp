import React from 'react';
import clsx from 'clsx';

interface FormInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  isRTL?: boolean;
}

export function FormInput({
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
  required,
  placeholder,
  className,
  isRTL
}: FormInputProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={clsx(
          'w-full px-3 py-2 bg-gray-800 border rounded-lg',
          'text-white placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:border-transparent',
          'transition-all duration-200',
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-700 focus:ring-blue-500',
          isRTL && 'text-right'
        )}
        required={required}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}