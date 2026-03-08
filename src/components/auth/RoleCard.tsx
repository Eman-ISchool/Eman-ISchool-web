import Link from 'next/link';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface RoleCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    colorClass: string;
}

const ROLE_THEMES: Record<string, { gradient: string; shadow: string }> = {
    admin: {
        gradient: 'from-slate-700 to-slate-900',
        shadow: 'shadow-slate-900/25',
    },
    teacher: {
        gradient: 'from-teal-600 to-teal-800',
        shadow: 'shadow-teal-700/25',
    },
    student: {
        gradient: 'from-emerald-500 to-teal-700',
        shadow: 'shadow-emerald-600/25',
    },
};

export default function RoleCard({ title, description, icon: Icon, href }: RoleCardProps) {
    const role = href.split('/').pop() || 'student';
    const theme = ROLE_THEMES[role] ?? ROLE_THEMES.student;

    return (
        <Link
            href={href}
            className="group block"
            data-testid={`login-role-${role}`}
            aria-label={`Login as ${title}`}
        >
            <div
                className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${theme.gradient} p-7 text-white shadow-xl ${theme.shadow} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl`}
            >
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute top-4 right-4 h-8 w-8 rounded-full bg-white/5" />

                {/* Icon */}
                <div className="mb-5 inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Text */}
                <h3 className="text-xl font-extrabold mb-1.5">{title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{description}</p>

                {/* CTA row */}
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-white/80 transition-all group-hover:gap-2.5">
                    <span>ادخل الآن</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
            </div>
        </Link>
    );
}
