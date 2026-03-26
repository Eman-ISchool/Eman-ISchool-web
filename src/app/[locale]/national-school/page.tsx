import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export const metadata = {
    title: "المنهج المصري | Eman-Academy",
    description: "تعليم المنهج المصري (عربي ولغات) لجميع المراحل الدراسية من الابتدائي حتى الثانوية.",
};

export default function NationalSchoolPage() {
    const grades = [
        { name: "المرحلة الابتدائية", grades: "من الأول إلى السادس الابتدائي", icon: "📚" },
        { name: "المرحلة الإعدادية", grades: "من الأول إلى الثالث الإعدادي", icon: "📖" },
        { name: "المرحلة الثانوية", grades: "من الأول إلى الثالث الثانوي", icon: "🎓" },
    ];

    const features = [
        "شرح شامل لجميع المواد الدراسية",
        "مدرسون متخصصون ذوو خبرة",
        "اختبارات دورية ومتابعة مستمرة",
        "مراجعات نهائية قبل الامتحانات",
        "دعم فني على مدار الساعة",
        "بث مباشر وتسجيلات عالية الجودة",
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-brand-dark to-gray-900 text-white py-20 px-4">
                <div className="container mx-auto text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold">
                        المنهج المصري <span className="text-brand-primary">(عربي ولغات)</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        منهج التعليم المصري الرسمي بأعلى جودة تعليمية لجميع المراحل الدراسية
                    </p>
                    <Link href="/exam-simulation">
                        <Button size="lg" className="bg-brand-primary text-black hover:bg-yellow-400 font-bold">
                            جرب امتحان تجريبي مجاناً
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Grades Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">المراحل الدراسية</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {grades.map((grade, index) => (
                            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="text-5xl mb-4">{grade.icon}</div>
                                    <CardTitle className="text-xl">{grade.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">{grade.grades}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">مميزات البرنامج</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                                <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-brand-dark text-white">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h2 className="text-3xl font-bold">ابدأ رحلة التفوق اليوم</h2>
                    <p className="text-gray-300 max-w-xl mx-auto">
                        سجل الآن واحصل على وصول كامل لجميع الدروس والمراجعات
                    </p>
                    <Link href="/login">
                        <Button size="lg" className="bg-brand-primary text-black hover:bg-yellow-400 font-bold">
                            حضّر طفلك بثقة
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
