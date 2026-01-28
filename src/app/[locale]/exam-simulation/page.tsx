import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    ClipboardCheck,
    Timer,
    BarChart3,
    Target,
    Brain,
    Award,
    CheckCircle,
    TrendingUp,
    AlertTriangle,
    BookOpen,
    Calendar,
    Users
} from "lucide-react";

export const metadata = {
    title: "نظام محاكاة الامتحانات | Eman-Academy",
    description: "امتحانات محاكية مطابقة للامتحانات المصرية - تصحيح فوري وتحليل أداء متقدم",
};

export default function ExamSimulationPage() {
    const features = [
        {
            icon: ClipboardCheck,
            title: "امتحانات مطابقة للأصل",
            description: "تصميم مطابق لشكل ومحتوى الامتحانات المصرية الرسمية بنفس نوع الأسئلة وتوزيع الدرجات"
        },
        {
            icon: Timer,
            title: "توقيت حقيقي",
            description: "مؤقت تنازلي بنفس وقت الامتحان الفعلي لتدريب الطالب على إدارة الوقت"
        },
        {
            icon: BarChart3,
            title: "تصحيح فوري آلي",
            description: "نتيجة فورية مع تفصيل الإجابات الصحيحة والخاطئة وشرح كل سؤال"
        },
        {
            icon: Target,
            title: "تحليل موضوع بموضوع",
            description: "تقرير مفصل يوضح أداء الطالب في كل موضوع من موضوعات المنهج"
        },
        {
            icon: Brain,
            title: "اكتشاف نقاط الضعف",
            description: "تحديد تلقائي للمفاهيم التي تحتاج مراجعة مع توصيات مخصصة"
        },
        {
            icon: Award,
            title: "درجة جاهزية الامتحان",
            description: "مؤشر شامل يوضح مدى استعداد الطالب للامتحان الفعلي"
        }
    ];

    const examTypes = [
        {
            title: "امتحانات شهرية",
            description: "محاكاة للاختبارات الشهرية المدرسية",
            frequency: "أسبوعياً",
            duration: "30-45 دقيقة"
        },
        {
            title: "امتحانات نصف العام",
            description: "امتحانات شاملة لنصف المنهج",
            frequency: "قبل موعد الامتحان بأسبوعين",
            duration: "2-3 ساعات"
        },
        {
            title: "امتحانات نهاية العام",
            description: "محاكاة كاملة للامتحان النهائي",
            frequency: "قبل موعد الامتحان بشهر",
            duration: "3 ساعات"
        }
    ];

    const subjects = [
        { name: "اللغة العربية", icon: "📝" },
        { name: "الرياضيات", icon: "📐" },
        { name: "العلوم", icon: "🔬" },
        { name: "الدراسات الاجتماعية", icon: "🌍" },
        { name: "اللغة الإنجليزية", icon: "🔤" },
        { name: "اللغة الفرنسية", icon: "🇫🇷" },
        { name: "العلوم الشرعية", icon: "📖" },
        { name: "الحاسب الآلي", icon: "💻" }
    ];

    const howItWorks = [
        {
            step: 1,
            title: "اختر المادة والصف",
            description: "حدد المادة والمرحلة الدراسية ونوع الامتحان المطلوب"
        },
        {
            step: 2,
            title: "ابدأ الامتحان",
            description: "سيبدأ المؤقت وستظهر الأسئلة بنفس شكل الامتحان الحقيقي"
        },
        {
            step: 3,
            title: "أجب واستعرض",
            description: "أجب على الأسئلة مع إمكانية التنقل والمراجعة قبل التسليم"
        },
        {
            step: 4,
            title: "احصل على النتيجة",
            description: "تصحيح فوري مع تقرير أداء تفصيلي ودرجة الجاهزية"
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 text-white py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-400 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-400 rounded-full blur-3xl animate-pulse delay-700" />
                </div>

                <div className="container mx-auto relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
                            <Target className="w-4 h-4 text-brand-primary" />
                            <span>نظام أساسي - ليس إضافة</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            نظام محاكاة
                            <span className="block text-brand-primary mt-2">الامتحانات المصرية</span>
                        </h1>

                        <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                            امتحانات مطابقة للامتحانات الرسمية مع تصحيح فوري وتحليل أداء متقدم لتحضير طفلك باحترافية
                        </p>

                        {/* USP Quote */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-xl mx-auto border border-white/20">
                            <p className="text-lg font-medium">
                                "آخرون يشرحون الدروس. نحن نُعِد طفلك للامتحان الحقيقي."
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center pt-4">
                            <Link href="/login">
                                <Button size="lg" className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold px-8">
                                    جرب امتحان تجريبي مجاني
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">ميزات نظام المحاكاة</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            نظام متكامل صُمم خصيصاً لمحاكاة تجربة الامتحان المصري الحقيقية
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                                <CardHeader>
                                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-300">
                                        <feature.icon className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
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

            {/* How It Works */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">كيف يعمل النظام</h2>
                        <p className="text-gray-600">أربع خطوات بسيطة لتحضير طفلك للامتحان</p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-4 gap-8">
                            {howItWorks.map((item) => (
                                <div key={item.step} className="text-center relative">
                                    <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                                        {item.step}
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                    <p className="text-gray-600 text-sm">{item.description}</p>

                                    {item.step < 4 && (
                                        <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-emerald-200 -z-10" style={{ transform: 'translateX(50%)' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Exam Types */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">أنواع الامتحانات المتاحة</h2>
                        <p className="text-gray-600">محاكاة لجميع أنواع الامتحانات المصرية</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {examTypes.map((type, index) => (
                            <Card key={index} className="border-2 border-emerald-100 hover:border-emerald-300 transition-colors">
                                <CardHeader>
                                    <CardTitle className="text-xl text-emerald-800">{type.title}</CardTitle>
                                    <CardDescription>{type.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Calendar className="w-5 h-5 text-emerald-600" />
                                            <span>التكرار: {type.frequency}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Timer className="w-5 h-5 text-emerald-600" />
                                            <span>المدة: {type.duration}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Subjects Coverage */}
            <section className="py-20 bg-emerald-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">المواد المتاحة</h2>
                        <p className="text-gray-600">تغطية شاملة لجميع مواد المنهج المصري</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                        {subjects.map((subject, index) => (
                            <div key={index} className="flex items-center gap-3 px-6 py-4 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
                                <span className="text-2xl">{subject.icon}</span>
                                <span className="font-medium text-gray-700">{subject.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Performance Analysis Preview */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold">تقارير أداء تفصيلية</h2>
                            <p className="text-lg text-gray-600">
                                بعد كل امتحان، يحصل ولي الأمر على تقرير شامل يوضح مستوى الطالب ونقاط القوة والضعف.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-green-600 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-green-800">نقاط القوة</h4>
                                        <p className="text-green-700 text-sm">تحديد الموضوعات التي يتفوق فيها الطالب</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-amber-600 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-amber-800">نقاط الضعف</h4>
                                        <p className="text-amber-700 text-sm">تحديد المفاهيم التي تحتاج مراجعة إضافية</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                                    <BookOpen className="w-6 h-6 text-blue-600 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-blue-800">توصيات مخصصة</h4>
                                        <p className="text-blue-700 text-sm">دروس ومراجعات مقترحة بناءً على الأداء</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mock Dashboard Preview */}
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 shadow-xl">
                            <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg">درجة الجاهزية للامتحان</h3>
                                    <span className="text-3xl font-bold text-emerald-600">78%</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>اللغة العربية</span>
                                            <span className="text-emerald-600">85%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>الرياضيات</span>
                                            <span className="text-amber-600">62%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>العلوم</span>
                                            <span className="text-emerald-600">90%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">التوصية:</span> مراجعة وحدة الهندسة في الرياضيات
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Diaspora Banner */}
            <section className="py-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Users className="w-8 h-8" />
                        <h3 className="text-2xl font-bold">مصمم خصيصاً للعائلات المصرية في الخارج</h3>
                    </div>
                    <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
                        نظام المحاكاة يراعي فروق التوقيت ويتيح للطلاب التدرب في أي وقت يناسبهم
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            ابدأ التحضير الاحترافي اليوم
                        </h2>
                        <p className="text-lg text-gray-400">
                            امتحان تجريبي مجاني لتجربة النظام قبل الاشتراك
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center pt-4">
                            <Link href="/login">
                                <Button size="lg" className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold px-8">
                                    حضّر طفلك بثقة
                                </Button>
                            </Link>
                            <Link href="/parent-dashboard">
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                                    شاهد لوحة ولي الأمر
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
