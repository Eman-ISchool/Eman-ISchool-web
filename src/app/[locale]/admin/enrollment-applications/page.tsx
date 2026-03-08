"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Clock, CheckCircle, XCircle, FileText, CreditCard } from "lucide-react";

export default function EnrollmentApplicationsList() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const url = statusFilter ? `/api/enrollment-applications?status=${statusFilter}` : '/api/enrollment-applications';
            const res = await fetch(url);
            const data = await res.json();
            if (data.applications) {
                setApplications(data.applications);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>;
            case 'payment_pending': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><CreditCard className="w-3 h-3" /> Payment Pending</span>;
            case 'payment_completed': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Payment Complete</span>;
            case 'approved': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Approved</span>;
            case 'rejected': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Rejected</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Enrollment Applications</h1>
                <div className="flex gap-2">
                    <select
                        className="border border-gray-300 rounded-md shadow-sm p-2 text-sm bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="payment_pending">Payment Pending</option>
                        <option value="payment_completed">Payment Completed</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-start">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-medium">Student Name</th>
                                <th className="px-6 py-4 font-medium">Grade</th>
                                <th className="px-6 py-4 font-medium">Parent Contact</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Applied On</th>
                                <th className="px-6 py-4 font-medium text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading applications...</td></tr>
                            ) : applications.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-500">No applications found.</td></tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {app.student_details?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {app.grades?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {app.parent_details?.name || app.users?.name}<br />
                                            <span className="text-xs text-gray-500">{app.parent_details?.phone}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(app.status)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(app.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-end">
                                            <Link href={`/en/admin/enrollment-applications/${app.id}`}>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Eye className="w-4 h-4" /> Review
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
