'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
    footer?: ReactNode;
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    footer,
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle click outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="admin-modal-overlay"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                className={`admin-modal ${sizeClasses[size]}`}
            >
                {/* Header */}
                <div className="admin-modal-header">
                    <h2 id="modal-title" className="admin-modal-title">
                        {title}
                    </h2>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="admin-modal-close"
                            aria-label="إغلاق"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="admin-modal-body">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="admin-modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// Form components for use within modals
export function FormGroup({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`admin-form-group ${className}`}>{children}</div>;
}

export function FormLabel({ children, required = false, htmlFor }: { children: ReactNode; required?: boolean; htmlFor?: string }) {
    return (
        <label className="admin-label" htmlFor={htmlFor}>
            {children}
            {required && <span className="text-red-500 mr-1">*</span>}
        </label>
    );
}

export function FormInput({
    type = 'text',
    placeholder,
    value,
    onChange,
    required = false,
    id,
    name,
    className = '',
    ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            type={type}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`admin-input ${className}`}
            {...props}
        />
    );
}

export function FormSelect({
    children,
    value,
    onChange,
    required = false,
    id,
    name,
    className = '',
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={`admin-select ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}

export function FormTextarea({
    placeholder,
    value,
    onChange,
    rows = 3,
    required = false,
    id,
    name,
    className = '',
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange as any}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className={`admin-textarea ${className}`}
            {...props}
        />
    );
}
