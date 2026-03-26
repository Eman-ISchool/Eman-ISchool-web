import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export const metadata = {
    title: "المنهج الأزهري | Eman-Academy",
    description: "تعليم المنهج الأزهري الشريف لجميع المراحل مع أفضل المعلمين المتخصصين.",
};

export default function AlAzharSchoolPage() {
    const subjects = [
        { name: "القرآن الكريم والتجويد", description: "حفظ وتلاوة مع أحكام التجويد", icon: "📖" },
        { name: "الفقه الإسلامي", description: "فقه العبادات والمعاملات", icon: "⚖️" },
        { name: "التوحيد والعقيدة", description: "أصول الإيمان والتوحيد", icon: "🌙" },
        { name: "الحديث الشريف", description: "متون الحديث وعلومه", icon: "📜" },
        { name: "النحو والصرف", description: "قواعد اللغة العربية", icon: "✍️" },
        { name: "السيرة النبوية", description: "حياة النبي ﷺ", icon: "🕌" },
    ];

    const features = [
        "معلمون أزهريون متخصصون",
        "منهج معتمد من الأزهر الشريف",
        "تحفيظ القرآن الكريم بالتجويد",
        "شرح مبسط للمواد الشرعية",
        "اختبارات ومتابعة دورية",
        "شهادات معتمدة",
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white py-20 px-4">
                <div className="container mx-auto text-center space-y-6">
                    <div className="text-5xl mb-4">🕌</div>
                    <h1 className="text-4xl md:text-5xl font-bold">
                        المنهج <span className="text-brand-primary">الأزهري</span>
                    </h1>
                    <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                        تعليم أزهري أصيل يجمع بين العلوم الشرعية والتربية على القيم الإسلامية
                    </p>
                    <Link href="/exam-simulation">
                        <Button size="lg" className="bg-brand-primary text-black hover:bg-yellow-400 font-bold">
                            جرب امتحان تجريبي مجاناً
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Subjects Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">المواد الدراسية</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((subject, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow border-emerald-100">
                                <CardHeader className="text-center">
                                    <div className="text-4xl mb-2">{subject.icon}</div>
                                    <CardTitle className="text-lg text-emerald-800">{subject.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 text-center text-sm">{subject.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">مميزات البرنامج الأزهري</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-emerald-100">
                                <Star className="w-6 h-6 text-emerald-600 shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quote Section */}
            <section className="py-12 bg-emerald-50">
                <div className="container mx-auto px-4 text-center">
                    <blockquote className="text-2xl font-medium text-emerald-800 max-w-3xl mx-auto">
                        "طلب العلم فريضة على كل مسلم"
                    </blockquote>
                    <p className="text-gray-600 mt-4">- حديث شريف</p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-emerald-900 text-white">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h2 className="text-3xl font-bold">انضم إلى أسرتنا الأزهرية</h2>
                    <p className="text-gray-200 max-w-xl mx-auto">
                        سجل الآن وابدأ رحلة التعلم الشرعي مع أفضل المعلمين
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
