'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, from 'next/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Home, BookOpen, Users, Calendar, Clock, BarChart3, FileText, Bell, Search, Video, MessageCircle, Settings, Shield,
    ChevronRight,
    ChevronLeft
    GraduationCap,
    LogOut,
    Menu,
    X,
    LogOut,
  } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { usePathname, from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

import { NavItem } from NavItemProps {
  href: string;
  label: string;
  badge?: string | BadgeVariant?: 'default' | 'ghost' | 'solid';
  icon?: LucideIcon;
  badgeClassName?: string;
  activeClassName?: string;
}

 className?: string;
}

 className?: string;
    >
      className?: string;
    badgeClassName?: string;
    badge?: string;
    badgeVariant?: 'default' | 'ghost' | 'solid';
    icon?: LucideIcon;
    badgeClassName?: string;
    activeClassName?: string;
  >
 className?: string;
            className?: string;
          }
        : className?: string;
          badgeClassName?: string;
          badge?: string;
          badgeVariant?: 'default' | 'ghost' | 'solid';
          icon?: LucideIcon;
          badgeClassName?: string;
          activeClassName?: string;
        </div>
      )}
    </div>
  );
}

 return (
    <nav className={cn(
      'flex h-16 flex-col items-start gap-2 border-e bg-slate-100',
      <div className="flex h-16 flex-shrink-0 items-center justify-start">
        <Link href={item.href} className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
