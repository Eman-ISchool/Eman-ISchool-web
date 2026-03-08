"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle, XCircle, FileText, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ApplicationDetail({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApp();
    }, [params.id]);

    const fetchApp = async () => {
        // We could make an API route for GET by ID or just use supabase client here since admin RLS is allowed.
        // Using supabase directly:
        const { data } = await supabase
            .from('enrollment_applications')
            .select('*, grades(name), users!enrollment_applications_user_id_fkey(name, email)')
            .eq('id', params.id)
            .single();
        if (data) setApp(data);
        setLoading(false);
    };

    const updateStatus = async (newStatus: string) => {
        const { error } = await supabase
            .from('enrollment_applications')
            .update({ status: newStatus })
            .eq('id', params.id);

        if (!error) {
            fetchApp();
        } else {
            alert("Error updating status");
        }
    };

    const getFileUrl = async (path: string) => {
        // Create signed URL for protected file
        const { data, error } = await supabase.storage.from('enrollment_documents').createSignedUrl(path, 3600);
        if (data) {
            window.open(data.signedUrl, '_blank');
        } else {
            alert("Could not load document.");
        }
    };

    if (loading) return <div className="p-8">Loading application...</div>;
    if (!app) return <div className="p-8">Application not found</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/en/admin/enrollment-applications">
                    <Button variant="ghost" size="sm" className="gap-2"><ChevronLeft className="w-4 h-4" /> Back to list</Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

                {/* Left Column: Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                        <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="text-lg">Student Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-y-4 text-sm">
                                <div><span className="text-gray-500 block">Name</span><span className="font-medium text-gray-900">{app.student_details?.name}</span></div>
                                <div><span className="text-gray-500 block">Grade</span><span className="font-medium text-brand-primary">{app.grades?.name}</span></div>
                                <div><span className="text-gray-500 block">Date of Birth</span><span className="font-medium text-gray-900">{app.student_details?.dateOfBirth}</span></div>
                                <div><span className="text-gray-500 block">Gender</span><span className="font-medium text-gray-900 capitalize">{app.student_details?.gender}</span></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                        <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="text-lg">Parent/Guardian Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-y-4 text-sm">
                                <div><span className="text-gray-500 block">Name</span><span className="font-medium text-gray-900">{app.parent_details?.name}</span></div>
                                <div><span className="text-gray-500 block">Email</span><span className="font-medium text-gray-900">{app.parent_details?.email}</span></div>
                                <div><span className="text-gray-500 block">Phone</span><span className="font-medium text-gray-900">{app.parent_details?.phone}</span></div>
                                <div><span className="text-gray-500 block">Account User</span><span className="font-medium text-gray-900">{app.users?.name}</span></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                        <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {app.documents && Object.keys(app.documents).length > 0 ? (
                                Object.entries(app.documents).map(([key, path]: [string, any]) => (
                                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <span className="font-medium text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => getFileUrl(path)}><Download className="w-4 h-4 mr-2" /> View</Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No documents uploaded.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Status & Actions */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-0 ring-1 ring-brand-primary">
                        <CardHeader className="bg-brand-primary/5 border-b border-brand-primary/10">
                            <CardTitle className="text-lg">Review & Action</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">Current Status</span>
                                <div className="font-bold text-lg capitalize">{app.status.replace('_', ' ')}</div>
                            </div>

                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">Payment Details</span>
                                <div className="p-3 bg-gray-50 rounded border text-sm space-y-2">
                                    <div className="flex justify-between"><span>Method:</span><span className="font-medium capitalize">{app.payment_method?.replace('_', ' ')}</span></div>
                                    <div className="flex justify-between"><span>Total Amount:</span><span className="font-medium">{app.total_amount} {app.currency}</span></div>
                                    {app.payment_plan && (
                                        <div className="flex justify-between"><span>Plan:</span><span className="font-medium text-blue-600">{app.payment_plan.installments} Installments</span></div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-4 border-t">
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white w-full gap-2"
                                    onClick={() => updateStatus('approved')}
                                    disabled={app.status === 'approved'}
                                >
                                    <CheckCircle className="w-4 h-4" /> Approve Application
                                </Button>
                                {(app.status === 'payment_pending' || app.status === 'pending') && (
                                    <Button
                                        variant="outline"
                                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 gap-2"
                                        onClick={() => updateStatus('payment_completed')}
                                    >
                                        <CheckCircle className="w-4 h-4" /> Mark Payment Received
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50 w-full gap-2"
                                    onClick={() => updateStatus('rejected')}
                                    disabled={app.status === 'rejected'}
                                >
                                    <XCircle className="w-4 h-4" /> Reject Application
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
