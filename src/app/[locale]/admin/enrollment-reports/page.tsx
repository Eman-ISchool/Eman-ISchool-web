"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, CheckCircle, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function EnrollmentReports() {
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        paymentPending: 0,
        pending: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        const { data: apps } = await supabase.from('enrollment_applications').select('status, total_amount');

        if (apps) {
            let total = apps.length;
            let approved = apps.filter(a => a.status === 'approved').length;
            let paymentPending = apps.filter(a => a.status === 'payment_pending').length;
            let pending = apps.filter(a => a.status === 'pending').length;

            let revenue = apps.reduce((acc, app) => {
                // Let's assume approved or payment_completed means revenue generated (simplified)
                if (app.status === 'approved' || app.status === 'payment_completed') {
                    return acc + (Number(app.total_amount) || 0);
                }
                return acc;
            }, 0);

            setStats({ total, approved, paymentPending, pending, totalRevenue: revenue });
        }
        setLoading(false);
    };

    if (loading) return <div className="p-8">Loading reports...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Enrollment Reports</h1>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500">Payment Pending</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.paymentPending}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                                <CreditCard className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500">Approved Enrollments</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg text-green-600">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-0 ring-1 ring-gray-200 mt-6 bg-gradient-to-br from-brand-primary/10 to-transparent">
                <CardContent className="p-8">
                    <div className="space-y-4 max-w-lg">
                        <p className="text-sm font-bold text-brand-dark uppercase tracking-wider">Estimated Revenue (Approved)</p>
                        <p className="text-4xl md:text-5xl font-extrabold text-brand-dark flex flex-wrap gap-2 items-baseline">
                            {stats.totalRevenue.toLocaleString()} <span className="text-xl md:text-2xl font-bold">AED</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Sum of total amounts from approved applications.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
