'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import {
    MoreHorizontal,
    Edit2,
    Trash2,
    Copy,
    Share2,
    Eye,
    LucideIcon,
} from 'lucide-react';

interface DropdownItem {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'danger';
    divider?: boolean;
}

interface DropdownMenuProps {
    items: DropdownItem[];
    trigger?: ReactNode;
    className?: string;
}

export default function DropdownMenu({
    items,
    trigger,
    className = '',
}: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on ESC
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleItemClick = (item: DropdownItem) => {
        item.onClick();
        setIsOpen(false);
    };

    return (
        <div className={`admin-dropdown-container ${className}`} ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="admin-btn admin-btn-ghost admin-btn-icon"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {trigger || <MoreHorizontal className="w-4 h-4" />}
            </button>

            {isOpen && (
                <div className="admin-dropdown">
                    {items.map((item, index) => (
                        <div key={index}>
                            {item.divider && <div className="admin-dropdown-divider" />}
                            <button
                                onClick={() => handleItemClick(item)}
                                className={`admin-dropdown-item ${item.variant === 'danger' ? 'admin-dropdown-item-danger' : ''
                                    }`}
                            >
                                {item.icon && <item.icon className="w-4 h-4" />}
                                <span>{item.label}</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Pre-configured dropdown with standard actions
interface StandardActionsDropdownProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    onShare?: () => void;
    onViewDetails?: () => void;
    extraItems?: DropdownItem[];
}

export function StandardActionsDropdown({
    onEdit,
    onDelete,
    onDuplicate,
    onShare,
    onViewDetails,
    extraItems = [],
}: StandardActionsDropdownProps) {
    const items: DropdownItem[] = [];

    if (onViewDetails) {
        items.push({
            label: 'عرض التفاصيل',
            icon: Eye,
            onClick: onViewDetails,
        });
    }

    if (onEdit) {
        items.push({
            label: 'تعديل',
            icon: Edit2,
            onClick: onEdit,
        });
    }

    if (onDuplicate) {
        items.push({
            label: 'نسخ',
            icon: Copy,
            onClick: onDuplicate,
        });
    }

    if (onShare) {
        items.push({
            label: 'مشاركة',
            icon: Share2,
            onClick: onShare,
        });
    }

    // Add extra items
    items.push(...extraItems);

    if (onDelete) {
        items.push({
            label: 'حذف',
            icon: Trash2,
            onClick: onDelete,
            variant: 'danger',
            divider: items.length > 0,
        });
    }

    return <DropdownMenu items={items} />;
}
