'use client';

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

export interface MobileDrawerNavProps {
  items: NavItem[];
  trigger?: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
}

export function MobileDrawerNav({
  items,
  trigger,
  side = 'right',
  className = '',
}: MobileDrawerNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const toggleDrawer = () => setIsOpen(!isOpen);

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDrawer}
      aria-label="Toggle navigation menu"
    >
      <Menu className="h-6 w-6" />
    </Button>
  );

  return (
    <>
      {trigger || defaultTrigger}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 ${side}-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full'
          } ${className}`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">القائمة</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDrawer}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Drawer Content */}
        <nav className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={toggleDrawer}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-slate-100'
                    }`}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="flex-shrink-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Nested items */}
                {item.children && item.children.length > 0 && (
                  <ul className="mt-2 space-y-1 ps-4">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={toggleDrawer}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${isActive(child.href)
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-slate-100'
                            }`}
                        >
                          {child.icon && (
                            <span className="flex-shrink-0">{child.icon}</span>
                          )}
                          <span className="flex-1">{child.label}</span>
                          {child.badge !== undefined && child.badge > 0 && (
                            <span className="flex-shrink-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
