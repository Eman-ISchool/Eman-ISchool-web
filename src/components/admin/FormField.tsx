'use client';

import { ReactNode, forwardRef } from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
    label?: string;
    error?: string;
    required?: boolean;
    helperText?: string;
    className?: string;
    children: ReactNode;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
    ({ label, error, required, helperText, className = '', children }, ref) => {
        return (
            <div ref={ref} className={`space-y-1.5 ${className}`}>
                {label && (
                    <Label className={`text-sm font-medium ${error ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        {label}
                        {required && <span className="me-1 text-red-500">*</span>}
                    </Label>
                )}
                {children}
                {helperText && !error && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        {helperText}
                    </p>
                )}
                {error && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

FormField.displayName = 'FormField';

// Input Field
interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    required?: boolean;
    helperText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ label, error, required, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
        return (
            <FormField label={label} error={error} required={required} helperText={helperText}>
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 ${leftIcon ? 'pr-10' : ''} ${rightIcon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
                        dir="rtl"
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
            </FormField>
        );
    }
);

InputField.displayName = 'InputField';

// Textarea Field
interface TextareaFieldProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
    label?: string;
    error?: string;
    required?: boolean;
    helperText?: string;
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
    ({ label, error, required, helperText, resize = 'vertical', className = '', ...props }, ref) => {
        return (
            <FormField label={label} error={error} required={required} helperText={helperText}>
                <textarea
                    ref={ref}
                    className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${resize === 'none' ? 'resize-none' : ''} ${className}`}
                    dir="rtl"
                    {...props}
                />
            </FormField>
        );
    }
);

TextareaField.displayName = 'TextareaField';

// Select Field
interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label?: string;
    error?: string;
    required?: boolean;
    helperText?: string;
    options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
    ({ label, error, required, helperText, options, className = '', ...props }, ref) => {
        return (
            <FormField label={label} error={error} required={required} helperText={helperText}>
                <div className="relative">
                    <select
                        ref={ref}
                        className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
                        dir="rtl"
                        {...props}
                    >
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </FormField>
        );
    }
);

SelectField.displayName = 'SelectField';

// Checkbox Field
interface CheckboxFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        return (
            <FormField error={error} helperText={helperText} className={className}>
                <label className="flex cursor-pointer items-start gap-3">
                    <input
                        ref={ref}
                        type="checkbox"
                        className={`mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        {...props}
                    />
                    {label && (
                        <span className={`text-sm ${error ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                            {label}
                        </span>
                    )}
                </label>
            </FormField>
        );
    }
);

CheckboxField.displayName = 'CheckboxField';

// Radio Group
interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface RadioGroupProps {
    label?: string;
    error?: string;
    required?: boolean;
    helperText?: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: RadioOption[];
    className?: string;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
    ({ label, error, required, helperText, name, value, onChange, options, className = '' }, ref) => {
        return (
            <FormField label={label} error={error} required={required} helperText={helperText} className={className}>
                <div className="space-y-2" ref={ref}>
                    {options.map((option) => (
                        <label
                            key={option.value}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                                value === option.value
                                    ? 'border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
                            } ${option.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={value === option.value}
                                onChange={(e) => onChange(e.target.value)}
                                disabled={option.disabled}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:bg-gray-900"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {option.label}
                            </span>
                        </label>
                    ))}
                </div>
            </FormField>
        );
    }
);

RadioGroup.displayName = 'RadioGroup';
