'use client';

import * as React from 'react';

// Minimal stub for Select component (until @radix-ui/react-select is added)
const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { onValueChange?: (value: string) => void }>(
    ({ children, onValueChange, onChange, ...props }, ref) => (
        <select
            ref={ref}
            onChange={(e) => {
                onChange?.(e);
                onValueChange?.(e.target.value);
            }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            {...props}
        >
            {children}
        </select>
    )
);
Select.displayName = 'Select';

const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>
);
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
    ({ children, ...props }, ref) => <option ref={ref} {...props}>{children}</option>
);
SelectItem.displayName = 'SelectItem';

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }>(
    ({ children, placeholder, ...props }, ref) => <span ref={ref} {...props}>{children || placeholder}</span>
);
SelectValue.displayName = 'SelectValue';

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
