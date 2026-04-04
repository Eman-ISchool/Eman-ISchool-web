"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ChevronRight, ChevronLeft, Upload, CreditCard, Landmark, Loader2, FileCheck } from "lucide-react";

const GRADES = [
    { id: "grade-1", name: "Grade 1", fee: 15000 },
    { id: "grade-2", name: "Grade 2", fee: 15500 },
    { id: "grade-3", name: "Grade 3", fee: 16000 },
    { id: "grade-4", name: "Grade 4", fee: 16500 },
];

export default function MultiStepForm() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [formData, setFormData] = useState({
        gradeId: "grade-1",
        studentName: "",
        studentDateOfBirth: "",
        studentGender: "male",
        parentName: "",
        parentEmail: "",
        parentPhone: "",
        emiratesIdFile: null as File | null,
        egyptianIdFile: null as File | null,
        previousSchoolReportFile: null as File | null,
        paymentMethod: "stripe", // stripe or bank_transfer
        bankReceiptFile: null as File | null,
    });

    const updateForm = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    // File validation helper
    const validateFile = (file: File | null, maxSizeMB = 10): { valid: boolean; error?: string } => {
        if (!file) return { valid: false };

        const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        const maxSize = maxSizeMB * 1024 * 1024;

        if (!validTypes.includes(file.type)) {
            return { valid: false, error: 'File must be PDF, JPG, or PNG' };
        }

        if (file.size > maxSize) {
            return { valid: false, error: `File must be under ${maxSizeMB}MB` };
        }

        return { valid: true };
    };

    const selectedGrade = GRADES.find((g) => g.id === formData.gradeId) || GRADES[0];
    const currency = "AED";
    const monthlyInstallment = Math.round(selectedGrade.fee / 10); // 10 months

    const handleNext = () => setStep((p) => p + 1);
    const handleBack = () => setStep((p) => p - 1);

    const handleSubmit = async () => {
        setLoading(true);
        setErrorMsg("");

        try {
            const data = new FormData();
            data.append("gradeId", formData.gradeId);
            data.append("studentDetails", JSON.stringify({
                name: formData.studentName,
                dateOfBirth: formData.studentDateOfBirth,
                gender: formData.studentGender,
            }));
            data.append("parentDetails", JSON.stringify({
                name: formData.parentName,
                email: formData.parentEmail,
                phone: formData.parentPhone,
            }));
            data.append("paymentMethod", formData.paymentMethod);
            data.append("paymentPlan", JSON.stringify({
                type: "monthly",
                installments: 10,
                amountPerInstallment: monthlyInstallment
            }));
            data.append("totalAmount", selectedGrade.fee.toString());
            data.append("currency", currency);

            if (formData.emiratesIdFile) data.append("emiratesId", formData.emiratesIdFile);
            if (formData.egyptianIdFile) data.append("egyptianId", formData.egyptianIdFile);
            if (formData.previousSchoolReportFile) data.append("previousSchoolReport", formData.previousSchoolReportFile);
            if (formData.paymentMethod === "bank_transfer" && formData.bankReceiptFile) {
                data.append("bankReceipt", formData.bankReceiptFile);
            }

            // 1. Submit application to our API
            const appRes = await fetch("/api/enrollment-applications", {
                method: "POST",
                body: data,
            });

            const appData = await appRes.json();
            if (!appRes.ok) throw new Error(appData.error || "Failed to submit application");

            const applicationId = appData.application.id;

            // 2. If Stripe, redirect to checkout
            if (formData.paymentMethod === "stripe") {
                const stripeRes = await fetch("/api/stripe/checkout-enrollment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        applicationId,
                        amount: selectedGrade.fee,
                        currency,
                        title: `Tuition Fee for ${selectedGrade.name}`,
                    }),
                });
                const stripeData = await stripeRes.json();
                if (!stripeRes.ok) throw new Error(stripeData.error || "Failed to initialize payment");

                window.location.href = stripeData.url;
            } else {
                // Bank transfer completed
                router.push("/en/enrollment/success");
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const stepsList = ["Student Details", "Parent Details", "Documents", "Financial & Payment"];

    const renderStepIndicator = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-brand-primary z-0 transition-all duration-300"
                    style={{ width: `${((step - 1) / (stepsList.length - 1)) * 100}%` }}
                ></div>

                {stepsList.map((s, i) => {
                    const isActive = step === i + 1;
                    const isCompleted = step > i + 1;
                    return (
                        <div key={i} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors 
                ${isActive ? 'bg-white border-brand-primary text-brand-primary' :
                                        isCompleted ? 'bg-brand-primary border-brand-primary text-black' :
                                            'bg-white border-gray-300 text-gray-400'}`}
                            >
                                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : i + 1}
                            </div>
                            <span className={`mt-2 text-xs font-medium hidden sm:block ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                {s}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
            <CardContent className="p-6 sm:p-10">
                {renderStepIndicator()}

                {errorMsg && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm relative">
                        {errorMsg}
                    </div>
                )}

                <div className="min-h-[300px]">
                    {/* STEP 1: Student Details */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
                                <p className="text-gray-500">Provide information about the student.</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Full Student Name</Label>
                                    <Input
                                        value={formData.studentName}
                                        onChange={e => updateForm('studentName', e.target.value)}
                                        placeholder="e.g. Ahmed Ali"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <Input
                                        type="date"
                                        value={formData.studentDateOfBirth}
                                        onChange={e => updateForm('studentDateOfBirth', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.studentGender}
                                        onChange={e => updateForm('studentGender', e.target.value)}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Enrollment Grade</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        value={formData.gradeId}
                                        onChange={e => updateForm('gradeId', e.target.value)}
                                    >
                                        {GRADES.map(g => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Parent Details */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Parent/Guardian Details</h2>
                                <p className="text-gray-500">How can we contact you?</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        value={formData.parentName}
                                        onChange={e => updateForm('parentName', e.target.value)}
                                        placeholder="e.g. Ali Mohammed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        value={formData.parentEmail}
                                        onChange={e => updateForm('parentEmail', e.target.value)}
                                        placeholder="ali@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        value={formData.parentPhone}
                                        onChange={e => updateForm('parentPhone', e.target.value)}
                                        placeholder="+971 50 XXXXXXX"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Documents */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Required Documents</h2>
                                <p className="text-gray-500">Please upload the following identifications and reports. (PDF, JPG, PNG)</p>
                            </div>

                            <div className="space-y-4">
                                {/* File Upload Helper Function Template */}
                                {[
                                    { key: 'emiratesIdFile', label: 'Emirates ID (Front & Back)' },
                                    { key: 'egyptianIdFile', label: 'Egyptian ID / Passport' },
                                    { key: 'previousSchoolReportFile', label: 'Previous School Report (Optional)' }
                                ].map((doc) => (
                                    <div key={doc.key} className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{doc.label}</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {(formData as any)[doc.key] ? (formData as any)[doc.key].name : "No file selected"}
                                            </p>
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                id={doc.key}
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files.length > 0) {
                                                        const file = e.target.files[0];
                                                        const validation = validateFile(file);
                                                        if (!validation.valid) {
                                                            setErrorMsg(validation.error || 'Invalid file');
                                                            return;
                                                        }
                                                        updateForm(doc.key, file);
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById(doc.key)?.click()}
                                            >
                                                {(formData as any)[doc.key] ? <FileCheck className="w-4 h-4 me-2 text-green-600" /> : <Upload className="w-4 h-4 me-2" />}
                                                {(formData as any)[doc.key] ? 'Change File' : 'Upload'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Financial & Payment */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Financial Overview & Payment</h2>
                                <p className="text-gray-500">Review your tuition plans and select a payment method.</p>
                            </div>

                            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900">Tuition for {selectedGrade.name}</h3>
                                    <div className="text-3xl font-extrabold text-blue-700 mt-2">{selectedGrade.fee.toLocaleString()} <span className="text-lg font-medium">{currency} / year</span></div>
                                    <p className="text-blue-600/80 mt-1">Full academic year upfront</p>
                                </div>
                                <div className="text-xl font-bold text-gray-300 hidden md:block">OR</div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 w-full md:w-auto">
                                    <div className="text-sm text-gray-500 font-medium">Monthly Installment Plan</div>
                                    <div className="text-2xl font-bold text-gray-900">{monthlyInstallment.toLocaleString()} <span className="text-sm">{currency} / mo</span></div>
                                    <div className="text-xs text-brand-primary font-bold mt-1">10 Months Plan</div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <Label className="text-base">Select Payment Method</Label>
                                <div className="grid sm:grid-cols-2 gap-4">

                                    {/* Stripe Card */}
                                    <div
                                        onClick={() => updateForm('paymentMethod', 'stripe')}
                                        className={`border-2 rounded-xl p-4 cursor-pointer flex items-start gap-4 transition-all
                      ${formData.paymentMethod === 'stripe' ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div className={`p-2 rounded-full ${formData.paymentMethod === 'stripe' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-gray-100 text-gray-500'}`}>
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Credit / Debit Card</h4>
                                            <p className="text-sm text-gray-500">Secure online payment via Stripe.</p>
                                        </div>
                                    </div>

                                    {/* Bank Transfer Card */}
                                    <div
                                        onClick={() => updateForm('paymentMethod', 'bank_transfer')}
                                        className={`border-2 rounded-xl p-4 cursor-pointer flex items-start gap-4 transition-all
                      ${formData.paymentMethod === 'bank_transfer' ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div className={`p-2 rounded-full ${formData.paymentMethod === 'bank_transfer' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-gray-100 text-gray-500'}`}>
                                            <Landmark className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Bank Transfer</h4>
                                            <p className="text-sm text-gray-500">Upload transfer receipt manually.</p>
                                        </div>
                                    </div>

                                </div>

                                {formData.paymentMethod === 'bank_transfer' && (
                                    <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in">
                                        <h4 className="font-bold text-gray-900 mb-2">Our Bank Details</h4>
                                        <p className="text-sm text-gray-600 mb-4">Please transfer the amount to the following account and upload the receipt.</p>
                                        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                                            <div><span className="text-gray-500 block">Bank Name:</span><span className="font-medium">{process.env.NEXT_PUBLIC_BANK_NAME || 'Emirates NBD'}</span></div>
                                            <div><span className="text-gray-500 block">Account Name:</span><span className="font-medium">{process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'Eduverse LLC'}</span></div>
                                            <div><span className="text-gray-500 block">IBAN:</span><span className="font-medium text-xs sm:text-sm">{process.env.NEXT_PUBLIC_BANK_IBAN || 'AE99 0000 0000 0000 0000 00'}</span></div>
                                            <div><span className="text-gray-500 block">SWIFT:</span><span className="font-medium">{process.env.NEXT_PUBLIC_BANK_SWIFT || 'ENBXXXXX'}</span></div>
                                        </div>

                                        <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-white flex items-center justify-between">
                                            <div>
                                                <h5 className="font-medium text-sm">Upload Receipt</h5>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formData.bankReceiptFile ? formData.bankReceiptFile.name : "Requirement for Bank Transfer"}
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                id="bankReceiptFile"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files.length > 0) {
                                                        const file = e.target.files[0];
                                                        const validation = validateFile(file);
                                                        if (!validation.valid) {
                                                            setErrorMsg(validation.error || 'Invalid file');
                                                            return;
                                                        }
                                                        updateForm('bankReceiptFile', file);
                                                    }
                                                }}
                                            />
                                            <Button type="button" size="sm" variant="outline" onClick={() => document.getElementById('bankReceiptFile')?.click()}>
                                                {formData.bankReceiptFile ? 'Change' : 'Upload File'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Navigation Controls */}
                <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={step === 1 || loading}
                    >
                        <ChevronLeft className="w-4 h-4 me-2" /> Back
                    </Button>

                    {step < 4 ? (
                        <Button
                            className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold"
                            onClick={handleNext}
                        >
                            Next Step <ChevronRight className="w-4 h-4 ms-2" />
                        </Button>
                    ) : (
                        <Button
                            className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold"
                            onClick={handleSubmit}
                            disabled={loading || (formData.paymentMethod === 'bank_transfer' && !formData.bankReceiptFile)}
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 me-2 animate-spin" /> Processing...</>
                            ) : formData.paymentMethod === 'stripe' ? (
                                <><CreditCard className="w-4 h-4 me-2" /> Pay via Stripe</>
                            ) : (
                                <><CheckCircle2 className="w-4 h-4 me-2" /> Submit Application</>
                            )}
                        </Button>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}
