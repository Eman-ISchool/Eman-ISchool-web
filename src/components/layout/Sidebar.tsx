'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Home,
  BookOpen,
  Users,
  Calendar,
  Clock,
  BarChart3,
    FileText,
  Bell,
    Search,
  Video,
  MessageCircle,
    Settings,
    Shield,
    ChevronRight,
    ChevronLeft,
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

const navItems: NavItem[] = [
  {
    href: `/${locale}/dashboard`,
    icon: item.icon,
    label: item.label,
    badge: item.badge ? (
      <span className="text-xs font-medium text-slate-500">
                      {item.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

