import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface RoleCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    colorClass: string;
}

export default function RoleCard({ title, description, icon: Icon, href, colorClass }: RoleCardProps) {
    // Extract role from href for test identification
    const role = href.split('/').pop() || 'unknown';

    return (
        <Link
            href={href}
            className="block group"
            data-testid={`login-role-${role}`}
            aria-label={`Login as ${title}`}
        >
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-950">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center text-brand-dark dark:text-gray-100">
                    <div className={`p-4 rounded-full mb-4 ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                        <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </CardContent>
            </Card>
        </Link>
    );
}
