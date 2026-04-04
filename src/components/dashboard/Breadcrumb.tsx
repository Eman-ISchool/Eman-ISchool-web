import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href: string;
    active?: boolean;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3 space-x-reverse">
                <li className="inline-flex items-center">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-brand-primary">
                        <Home className="ms-2 w-4 h-4" />
                        الرئيسية
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            <ChevronLeft className="w-4 h-4 text-gray-400 mx-1" />
                            {item.active ? (
                                <span className="text-sm font-medium text-gray-500">{item.label}</span>
                            ) : (
                                <Link href={item.href} className="text-sm font-medium text-gray-700 hover:text-brand-primary">
                                    {item.label}
                                </Link>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
