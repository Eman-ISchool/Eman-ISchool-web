import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    LayoutDashboard,
    BarChart3,
    Bell,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    MessageSquare,
    Shield,
    Smartphone,
    TrendingUp,
    Users,
    Eye,
    Heart
} from "lucide-react";

export const metadata = {
    title: "لوحة ولي الأمر | Eman-Academy",
    description: "تابع تقدم طفلك بثقة واطمئنان - تقارير مفصلة ودرجة جاهزية الامتحان",
};

export default function ParentDashboardPage() {
    const features = [
        {
            icon: BarChart3,
            title: "تقارير الأداء التفصيلية",
            description: "رسوم بيانية واضحة توضح تقدم طفلك في كل مادة"
        },
        {
            icon: CheckCircle,
            title: "متابعة الحضور والالتزام",
            description: "سجل كامل للحصص المباشرة والدروس المسجلة المشاهدة"
        },
        {
            icon: TrendingUp,
            title: "درجة جاهزية الامتحان",
            description: "مؤشر محدث أسبوعياً يوضح مدى استعداد طفلك"
        },
        {
            icon: Bell,
            title: "إشعارات ذكية",
            description: "تنبيهات بالواجبات والاختبارات والأحداث المهمة"
        },
        {
            icon: Calendar,
            title: "جدول الدروس",
            description: "عرض شامل للحصص القادمة بتوقيتك المحلي"
        },
        {
            icon: MessageSquare,
            title: "تواصل مع المعلمين",
            description: "قناة مباشرة للتواصل مع معلمي طفلك"
        }
    ];

    const peaceOfMindPoints = [
        {
            icon: Eye,
            title: "رؤية واضحة",
            description: "اعرف بالضبط ما يتعلمه طفلك وكيف يتقدم"
        },
        {
            icon: Shield,
            title: "اطمئنان تام",
            description: "لا مفاجآت - كل شيء واضح ومُتابع"
        },
        {
            icon: Clock,
            title: "توفير وقتك",
            description: "المعلومات جاهزة بنقرة واحدة دون سؤال أو استفسار"
        },
        {
            icon: Heart,
            title: "راحة البال",
            description: "ثق أن طفلك في أيدٍ أمينة ومسار صحيح"
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-400 rounded-full blur-3xl animate-pulse delay-700" />
                </div>

                <div className="container mx-auto relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
                            <LayoutDashboard className="w-4 h-4 text-brand-primary" />
                            <span>مصمم لأولياء الأمور في الخارج</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            تابع طفلك من
                            <span className="block text-brand-primary mt-2">أي مكان في العالم</span>
                        </h1>

                        <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                            لوحة تحكم شاملة تجعلك على اطلاع دائم بتقدم طفلك الدراسي - بلغة بسيطة وواضحة
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center pt-4">
                            <Link href="/login">
                                <Button size="lg" className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold px-8">
                                    سجل واحصل على اللوحة
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard Preview */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">نظرة على لوحة التحكم</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            واجهة بسيطة وواضحة - لا تعقيد ولا مصطلحات أكاديمية
                        </p>
                    </div>

                    {/* Mock Dashboard */}
                    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
                        {/* Dashboard Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-200 text-sm">مرحباً</p>
                                    <h3 className="text-2xl font-bold">أحمد محمد</h3>
                                </div>
                                <div className="text-left">
                                    <p className="text-blue-200 text-sm">آخر تحديث</p>
                                    <p className="font-medium">اليوم 10:30 صباحاً</p>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Content */}
                        <div className="p-8">
                            {/* Quick Stats */}
                            <div className="grid md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-green-50 rounded-2xl p-6 text-center">
                                    <div className="text-4xl font-bold text-green-600">78%</div>
                                    <div className="text-green-700 mt-2">جاهزية الامتحان</div>
                                </div>
                                <div className="bg-blue-50 rounded-2xl p-6 text-center">
                                    <div className="text-4xl font-bold text-blue-600">12</div>
                                    <div className="text-blue-700 mt-2">حصة هذا الأسبوع</div>
                                </div>
                                <div className="bg-amber-50 rounded-2xl p-6 text-center">
                                    <div className="text-4xl font-bold text-amber-600">3</div>
                                    <div className="text-amber-700 mt-2">واجبات معلقة</div>
                                </div>
                                <div className="bg-purple-50 rounded-2xl p-6 text-center">
                                    <div className="text-4xl font-bold text-purple-600">95%</div>
                                    <div className="text-purple-700 mt-2">نسبة الحضور</div>
                                </div>
                            </div>

                            {/* Performance by Subject */}
                            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                                <h4 className="font-bold text-lg mb-6">الأداء حسب المادة</h4>
                                <div className="space-y-4">
                                    {[
                                        { name: "اللغة العربية", score: 85, color: "emerald" },
                                        { name: "الرياضيات", score: 62, color: "amber" },
                                        { name: "العلوم", score: 90, color: "emerald" },
                                        { name: "اللغة الإنجليزية", score: 78, color: "blue" },
                                    ].map((subject, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium">{subject.name}</span>
                                                <span className={`text-${subject.color}-600 font-bold`}>
                                                    {subject.score}%
                                                </span>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${subject.score >= 80 ? 'bg-emerald-500' :
                                                            subject.score >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                                                        }`}
                                                    style={{ width: `${subject.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Upcoming Schedule */}
                            <div className="bg-blue-50 rounded-2xl p-6">
                                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    الحصص القادمة (بتوقيت الإمارات)
                                </h4>
                                <div className="space-y-3">
                                    {[
                                        { subject: "الرياضيات", time: "5:00 مساءً", day: "اليوم" },
                                        { subject: "اللغة العربية", time: "6:30 مساءً", day: "اليوم" },
                                        { subject: "العلوم", time: "4:00 مساءً", day: "غداً" },
                                    ].map((session, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white rounded-xl p-4">
                                            <div>
                                                <span className="font-medium">{session.subject}</span>
                                                <span className="text-gray-500 text-sm mr-3">{session.day}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <Clock className="w-4 h-4" />
                                                <span>{session.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">كل ما تحتاجه في مكان واحد</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            ميزات صُممت خصيصاً لأولياء الأمور المشغولين في الخارج
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                                <CardHeader>
                                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                                        <feature.icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base text-gray-600">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Peace of Mind Section */}
            <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">راحة البال التي تستحقها</h2>
                        <p className="text-blue-200 max-w-2xl mx-auto">
                            أنت تعمل بجد في الخارج لتوفير الأفضل لعائلتك - دعنا نساعدك تطمئن على تعليم أبنائك
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {peaceOfMindPoints.map((point, index) => (
                            <div key={index} className="text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                    <point.icon className="w-8 h-8 text-brand-primary" />
                                </div>
                                <h3 className="font-bold text-xl mb-2">{point.title}</h3>
                                <p className="text-blue-200">{point.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mobile App Preview */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm">
                                <Smartphone className="w-4 h-4" />
                                <span>متوفر على جميع الأجهزة</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold">تابع من هاتفك أينما كنت</h2>
                            <p className="text-lg text-gray-600">
                                لوحة التحكم تعمل على جميع الأجهزة - الكمبيوتر، الجوال، والتابلت.
                                احصل على إشعارات فورية لأهم التحديثات.
                            </p>

                            <div className="space-y-4">
                                {[
                                    "إشعارات بنتائج الاختبارات فور صدورها",
                                    "تذكير بالحصص المباشرة قبل موعدها",
                                    "تنبيه عند تأخر الطالب في الحضور",
                                    "ملخص أسبوعي للأداء"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Phone Mockup */}
                        <div className="flex justify-center">
                            <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl max-w-xs">
                                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                                    {/* Phone Screen Content */}
                                    <div className="bg-blue-600 text-white p-6">
                                        <p className="text-sm text-blue-200">درجة الجاهزية</p>
                                        <p className="text-4xl font-bold">78%</p>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="bg-green-50 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-medium">امتحان الرياضيات</p>
                                                    <p className="text-xs text-gray-500">النتيجة: 85/100</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-amber-50 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                <Bell className="w-5 h-5 text-amber-600" />
                                                <div>
                                                    <p className="text-sm font-medium">واجب اللغة العربية</p>
                                                    <p className="text-xs text-gray-500">موعد التسليم غداً</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="text-sm font-medium">حصة العلوم</p>
                                                    <p className="text-xs text-gray-500">اليوم 5:00 مساءً</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Diaspora Banner */}
            <section className="py-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Users className="w-8 h-8" />
                        <h3 className="text-2xl font-bold">هذه المنصة مصممة خصيصاً للعائلات المصرية في الخارج</h3>
                    </div>
                    <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                        نفهم تحديات العمل بعيداً عن الأبناء - لذلك صممنا كل شيء ليمنحك راحة البال
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            ابدأ الآن واحصل على لوحة التحكم
                        </h2>
                        <p className="text-lg text-gray-400">
                            سجل طفلك اليوم واحصل على وصول كامل للوحة ولي الأمر
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center pt-4">
                            <Link href="/login">
                                <Button size="lg" className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold px-8">
                                    حضّر طفلك بثقة
                                </Button>
                            </Link>
                            <Link href="/exam-simulation">
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                                    شاهد نظام الامتحانات
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
