// Form component for the Stock Management System

import React from 'react';
import type { FormField } from '../../types';

interface FormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  onChange?: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  loading?: boolean;
  submitText?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
  className?: string;
}

export function Form({
  fields,
  onSubmit,
  onChange,
  initialData = {},
  loading = false,
  submitText = 'Submit',
  layout = 'vertical',
  columns = 1,
  className = '',
}: FormProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Update form data when initialData changes
  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (name: string, value: any) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    onChange?.(newFormData);

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }

      // Custom validation
      if (field.validation && formData[field.name]) {
        const value = formData[field.name];
        if (field.validation.min && value < field.validation.min) {
          newErrors[field.name] = `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation.max && value > field.validation.max) {
          newErrors[field.name] = `${field.label} must be at most ${field.validation.max}`;
        }
        if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
          newErrors[field.name] = field.validation.message || `${field.label} format is invalid`;
        }
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    const baseInputClasses = `
      block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
      focus:outline-none focus:ring-1 focus:border-blue-500 sm:text-sm
      ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500'}
    `;

    const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={field.name} className={layout === 'grid' ? 'space-y-1' : 'space-y-1'}>
            <label htmlFor={field.name} className={labelClasses}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={baseInputClasses}
              required={field.required}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className={layout === 'grid' ? 'space-y-1' : 'space-y-1'}>
            <label htmlFor={field.name} className={labelClasses}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              id={field.name}
              name={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, Number(e.target.value))}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              className={baseInputClasses}
              required={field.required}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className={layout === 'grid' ? 'space-y-1' : 'space-y-1'}>
            <label htmlFor={field.name} className={labelClasses}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={field.name}
              name={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={`${baseInputClasses} resize-vertical`}
              required={field.required}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className={layout === 'grid' ? 'space-y-1' : 'space-y-1'}>
            <label htmlFor={field.name} className={labelClasses}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={field.name}
              name={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={baseInputClasses}
              required={field.required}
            >
              <option value="">{field.placeholder || `Select ${field.label}`}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={value || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={field.name} className="ml-2 block text-sm text-gray-900">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {error && <p className="text-sm text-red-600 ml-6">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  const getGridClasses = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1';
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {layout === 'grid' ? (
        <div className={`grid gap-6 ${getGridClasses()}`}>
          {fields.map(renderField)}
        </div>
      ) : (
        <div className={layout === 'horizontal' ? 'space-y-4' : 'space-y-6'}>
          {fields.map(renderField)}
        </div>
      )}

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
}

// Form Field component for individual fields
interface FormFieldProps {
  field: FormField;
  value: any;
  error?: string;
  onChange: (name: string, value: any) => void;
}

export function FormFieldComponent({ field, value, error, onChange }: FormFieldProps) {
  const handleChange = (newValue: any) => {
    onChange(field.name, newValue);
  };

  const baseInputClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
    focus:outline-none focus:ring-1 focus:border-blue-500 sm:text-sm
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500'}
  `;

  const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
      return (
        <div className="space-y-1">
          <label htmlFor={field.name} className={labelClasses}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type={field.type}
            id={field.name}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClasses}
            required={field.required}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case 'number':
      return (
        <div className="space-y-1">
          <label htmlFor={field.name} className={labelClasses}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="number"
            id={field.name}
            value={value || ''}
            onChange={(e) => handleChange(Number(e.target.value))}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className={baseInputClasses}
            required={field.required}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-1">
          <label htmlFor={field.name} className={labelClasses}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            id={field.name}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`${baseInputClasses} resize-vertical`}
            required={field.required}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case 'select':
      return (
        <div className="space-y-1">
          <label htmlFor={field.name} className={labelClasses}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            id={field.name}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClasses}
            required={field.required}
          >
            <option value="">{field.placeholder || `Select ${field.label}`}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={field.name}
            checked={value || false}
            onChange={(e) => handleChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={field.name} className="ml-2 block text-sm text-gray-900">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {error && <p className="text-sm text-red-600 ml-6">{error}</p>}
        </div>
      );

    default:
      return null;
  }
}

export default Form;