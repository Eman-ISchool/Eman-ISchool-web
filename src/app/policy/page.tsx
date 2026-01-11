import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
    title: "سياسة الخصوصية | Eman-Academy",
    description: "سياسة الخصوصية وشروط الاستخدام لمنصة Eman-Academy التعليمية.",
};

export default function PolicyPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-brand-dark mb-4">سياسة الخصوصية</h1>
                    <p className="text-gray-600">آخر تحديث: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>مقدمة</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none">
                        <p className="text-gray-600 leading-relaxed">
                            نحن في Eman-Academy نلتزم بحماية خصوصية مستخدمينا. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا للمعلومات الشخصية التي تقدمها عند استخدام منصتنا التعليمية.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>المعلومات التي نجمعها</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span>
                                <span>المعلومات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span>
                                <span>معلومات الحساب: بيانات تسجيل الدخول وتفضيلات المستخدم</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span>
                                <span>بيانات الاستخدام: سجل الدورات والتقدم الدراسي</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span>
                                <span>معلومات الدفع: تتم معالجتها بشكل آمن عبر بوابات دفع موثوقة</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>كيف نستخدم معلوماتك</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span>
                                <span>توفير وتحسين خدماتنا التعليمية</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span>
                                <span>التواصل معك بخصوص حسابك والدورات المسجل بها</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span>
                                <span>إرسال تحديثات ومواد تعليمية ذات صلة</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span>
                                <span>تحليل الاستخدام لتحسين تجربة التعلم</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>حماية البيانات</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-600 leading-relaxed">
                        <p>
                            نستخدم تقنيات تشفير متقدمة وإجراءات أمنية صارمة لحماية بياناتك الشخصية. لا نشارك معلوماتك مع أطراف ثالثة إلا بموافقتك أو عند الضرورة القانونية.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>حقوقك</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span>
                                <span>الوصول إلى بياناتك الشخصية وتحديثها</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span>
                                <span>طلب حذف حسابك وبياناتك</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span>
                                <span>إلغاء الاشتراك في الرسائل التسويقية</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span>
                                <span>الحصول على نسخة من بياناتك</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>سياسة الاسترداد</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-600 leading-relaxed">
                        <p>
                            يمكنك طلب استرداد المبلغ خلال 7 أيام من تاريخ الشراء إذا لم تشاهد أكثر من 20% من محتوى الدورة. للمزيد من التفاصيل، يرجى التواصل مع فريق الدعم.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>تواصل معنا</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-600 leading-relaxed">
                        <p>
                            إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر:
                        </p>
                        <ul className="mt-4 space-y-2">
                            <li>البريد الإلكتروني: info@eman-academy.ae</li>
                            <li>الهاتف: +971 50 569 2091</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
