import { Button } from "@/components/ui/button";

export const metadata = {
    title: "من نحن | Eman-Academy Online School",
    description: "تعرف على مدرسة Eman-Academy وأهدافها في تقديم تعليم متميز.",
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-brand-dark">عن <span className="text-brand-primary">Eman-Academy</span></h1>
                    <p className="text-xl text-gray-600">
                        نحن منصة تعليمية رائدة تهدف إلى إحداث ثورة في التعليم المصري والأزهري عبر الإنترنت.
                    </p>
                </div>

                {/* Vision & Mission */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-4 text-brand-primary">رؤيتنا</h2>
                        <p className="text-gray-600 leading-relaxed">
                            أن نكون الخيار الأول للأسرة المصرية في التعليم الإلكتروني، ونقدم نموذجاً يحتذى به في جودة التعليم وسهولة الوصول إليه.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-4 text-brand-primary">رسالتنا</h2>
                        <p className="text-gray-600 leading-relaxed">
                            توفير بيئة تعليمية تفاعلية وجذابة تجمع بين التكنولوجيا الحديثة والخبرة التربوية، لتخريج جيل مبدع ومتفوق.
                        </p>
                    </div>
                </div>

                {/* Why Us? */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-center">لماذا نحن؟</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: "مناهج معتمدة", desc: "شرح كامل للمناهج الدراسية بخطط زمنية محددة." },
                            { title: "فصول افتراضية", desc: "بث مباشر وتفاعل حقيقي بين الطالب والمعلم." },
                            { title: "أسعار تنافسية", desc: "باقات متنوعة تناسب جميع الفئات." },
                        ].map((item, i) => (
                            <div key={i} className="text-center p-6 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors">
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center bg-brand-dark text-white p-12 rounded-3xl relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-3xl font-bold">ابدأ رحلة النجاح مع Eman-Academy اليوم</h2>
                        <Button size="lg" className="bg-brand-primary text-black hover:bg-yellow-400 font-bold px-8">
                            انضم إلينا الآن
                        </Button>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
                </div>
            </div>
        </div>
    );
}
