'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Users,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Shield,
    BookOpen,
    GraduationCap,
    MoreVertical,
    Mail,
    Phone,
    Calendar,
    CheckCircle,
    XCircle,
    Edit,
    Trash2,
    ArrowLeft,
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: 'student' | 'teacher' | 'admin';
    phone: string | null;
    is_active: boolean;
    last_login: string | null;
    created_at: string;
    enrollmentsCount: number;
    lessonsTaughtCount: number;
}

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const limit = 20;

    useEffect(() => {
        if (status === 'loading') return;

        // @ts-ignore
        if (!session?.user?.role || session.user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        fetchUsers();
    }, [session, status, router, page, search, roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: (page * limit).toString(),
            });

            if (search) params.append('search', search);
            if (roleFilter) params.append('role', roleFilter);

            const res = await fetch(`/api/admin/users?${params}`);
            const data = await res.json();

            setUsers(data.users || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAction = async (action: string) => {
        if (selectedUsers.length === 0) return;

        if (!confirm(`هل أنت متأكد من تنفيذ هذا الإجراء على ${selectedUsers.length} مستخدم؟`)) return;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, userIds: selectedUsers }),
            });

            if (res.ok) {
                setSelectedUsers([]);
                fetchUsers();
            }
        } catch (error) {
            console.error('Error performing bulk action:', error);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, role: newRole }),
            });

            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };

    const handleToggleActive = async (userId: string, isActive: boolean) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, isActive: !isActive }),
            });

            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error toggling active status:', error);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin':
                return <Shield className="h-4 w-4 text-purple-500" />;
            case 'teacher':
                return <BookOpen className="h-4 w-4 text-green-500" />;
            default:
                return <GraduationCap className="h-4 w-4 text-blue-500" />;
        }
    };

    const getRoleName = (role: string) => {
        switch (role) {
            case 'admin': return 'مدير';
            case 'teacher': return 'معلم';
            default: return 'طالب';
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            إدارة المستخدمين
                        </h1>
                        <p className="text-gray-500">{total} مستخدم في النظام</p>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(0);
                                }}
                                className="pr-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setPage(0);
                                }}
                                className="px-4 py-2 border rounded-lg bg-white"
                            >
                                <option value="">كل الأدوار</option>
                                <option value="student">طالب</option>
                                <option value="teacher">معلم</option>
                                <option value="admin">مدير</option>
                            </select>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedUsers.length > 0 && (
                        <div className="mt-4 flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium">
                                تم تحديد {selectedUsers.length} مستخدم
                            </span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                                    تفعيل
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                                    تعطيل
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleBulkAction('make_teacher')}>
                                    ترقية لمعلم
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setSelectedUsers([])}>
                                    إلغاء التحديد
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            لا يوجد مستخدمين
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-4 text-right">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.length === users.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUsers(users.map(u => u.id));
                                                    } else {
                                                        setSelectedUsers([]);
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                        </th>
                                        <th className="p-4 text-right font-medium">المستخدم</th>
                                        <th className="p-4 text-right font-medium">الدور</th>
                                        <th className="p-4 text-right font-medium">الحالة</th>
                                        <th className="p-4 text-right font-medium">الإحصائيات</th>
                                        <th className="p-4 text-right font-medium">آخر دخول</th>
                                        <th className="p-4 text-right font-medium">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedUsers([...selectedUsers, user.id]);
                                                        } else {
                                                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                                        }
                                                    }}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {user.image ? (
                                                        <img
                                                            src={user.image}
                                                            alt={user.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <Users className="h-5 w-5 text-gray-500" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                    className="px-3 py-1.5 border rounded-lg bg-white text-sm"
                                                >
                                                    <option value="student">طالب</option>
                                                    <option value="teacher">معلم</option>
                                                    <option value="admin">مدير</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleToggleActive(user.id, user.is_active)}
                                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${user.is_active
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {user.is_active ? (
                                                        <>
                                                            <CheckCircle className="h-3 w-3" />
                                                            نشط
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-3 w-3" />
                                                            معطل
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    {user.role === 'teacher' ? (
                                                        <span>{user.lessonsTaughtCount} درس</span>
                                                    ) : user.role === 'student' ? (
                                                        <span>{user.enrollmentsCount} تسجيل</span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {user.last_login
                                                    ? new Date(user.last_login).toLocaleDateString('ar-EG')
                                                    : 'لم يسجل الدخول'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Button size="icon" variant="ghost">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <p className="text-sm text-gray-500">
                                عرض {page * limit + 1} - {Math.min((page + 1) * limit, total)} من {total}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 0}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <span className="text-sm">
                                    صفحة {page + 1} من {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages - 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
