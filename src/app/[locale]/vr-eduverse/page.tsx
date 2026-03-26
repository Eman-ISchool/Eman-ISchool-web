import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Compass,
    ListMusic,
    Users,
    Link2,
    Sparkles,
    Upload,
    CheckCircle,
    Globe,
    Laptop,
    GraduationCap,
    Eye,
    Settings
} from "lucide-react";

export const metadata = {
    title: "تجربة الواقع الافتراضي التعليمية | Eman-Academy",
    description: "دليل شامل لتطبيق ClassVR Eduverse في التعليم المصري عن بُعد - تقنية VR المتقدمة للتعلم الغامر",
};

export default function VREdueversePage() {
    const features = [
        {
            id: "content-library",
            icon: Compass,
            title: "مكتبة المحتوى التعليمي",
            subtitle: "Browsing the Eduverse Content Library",
            description: "استكشف آلاف الموارد التعليمية بتقنية الواقع الافتراضي والمعزز",
            implementation: [
                "الوصول عبر بوابة ClassVR الرئيسية بحساب المعلم",
                "البحث بالكلمات المفتاحية أو المادة أو الصف الدراسي",
                "تصنيف المحتوى: مشاهد 360°، نماذج AR، محاكاة تفاعلية",
                "حفظ المحتوى المفضل في قوائم مخصصة لإعادة الاستخدام",
                "معاينة المحتوى قبل إضافته للدروس"
            ],
            teacherWorkflow: [
                "تسجيل الدخول → استعراض المكتبة → البحث بالمنهج المصري",
                "معاينة كل مورد → التحقق من ملاءمته للهدف التعليمي",
                "إضافة إلى قائمة الدرس → ترتيب حسب تسلسل الشرح"
            ],
            studentExperience: "يرى الطالب المحتوى بشكل غامر 360° مع نقاط تفاعل للمعلومات الإضافية",
            bestPractices: [
                "اختر محتوى يرتبط مباشرة بأهداف الدرس",
                "راجع المحتوى مسبقاً لتحديد نقاط التركيز",
                "استخدم فلاتر الصف الدراسي لضمان الملاءمة"
            ]
        },
        {
            id: "lesson-playlists",
            icon: ListMusic,
            title: "قوائم الدروس المتوافقة مع المنهج",
            subtitle: "Creating Curriculum-Aligned Lesson Playlists",
            description: "بناء قوائم تشغيل تعليمية متوافقة مع المنهج المصري",
            implementation: [
                "إنشاء قائمة جديدة من لوحة التحكم",
                "سحب وإفلات المحتوى من المكتبة",
                "تحديد مدة كل عنصر ضمن الحصة",
                "ربط كل محتوى بهدف من أهداف المنهج المصري",
                "تخصيص القوائم حسب المستوى: ابتدائي، إعدادي، ثانوي"
            ],
            teacherWorkflow: [
                "تحديد أهداف الدرس من المنهج المصري",
                "البحث عن محتوى VR مناسب لكل هدف",
                "ترتيب المحتوى: مقدمة → شرح → تطبيق → مراجعة",
                "ضبط التوقيت ليناسب مدة الحصة (45-60 دقيقة)"
            ],
            studentExperience: "يتنقل الطالب بين المحتويات بتوجيه المعلم مع استيعاب تدريجي للمفاهيم",
            bestPractices: [
                "لا تزحم القائمة - 3-5 موارد VR كافية للحصة",
                "خصص وقتاً للنقاش بين كل مورد",
                "أنشئ قوائم مختلفة للطلاب المتفوقين والمتعثرين"
            ]
        },
        {
            id: "group-sessions",
            icon: Users,
            title: "الجلسات الجماعية بقيادة المعلم",
            subtitle: "Teacher-Led Group Sessions",
            description: "إدارة فصول VR شاملة لما يصل إلى 30 طالب في وقت واحد",
            implementation: [
                "بدء جلسة جديدة من لوحة التحكم",
                "اختيار القائمة أو المحتوى المحدد",
                "إرسال المحتوى لجميع نظارات الطلاب بنقرة واحدة",
                "مراقبة ما يراه كل طالب في الوقت الحقيقي",
                "التحكم في الإيقاف والتشغيل والتنقل"
            ],
            teacherWorkflow: [
                "تجهيز النظارات والتأكد من الاتصال",
                "شرح مختصر قبل بدء تجربة VR",
                "بدء الجلسة ومراقبة الشاشات",
                "توجيه انتباه الطلاب لنقاط محددة",
                "إيقاف للنقاش ثم استكمال"
            ],
            studentExperience: "تجربة موحدة وموجهة مع إمكانية النظر في جميع الاتجاهات ضمن المشهد",
            bestPractices: [
                "ابدأ بمحتوى قصير (2-3 دقائق) لتجنب الإرهاق",
                "استخدم ميزة التركيز لتوجيه الانتباه",
                "خصص وقتاً للأسئلة بعد كل تجربة"
            ]
        },
        {
            id: "thinglink",
            icon: Link2,
            title: "التكامل مع ThingLink",
            subtitle: "Integration with ThingLink",
            description: "إضافة طبقات تفاعلية على المحتوى 360°",
            implementation: [
                "إنشاء حساب ThingLink وربطه ببوابة ClassVR",
                "تحميل صور 360° أو استخدام مكتبة ThingLink",
                "إضافة نقاط تفاعل (Hotspots) على المشهد",
                "تضمين أسئلة، فيديوهات، روابط، شروحات",
                "نشر المحتوى واستيراده في ClassVR"
            ],
            teacherWorkflow: [
                "تحديد المفاهيم التي تحتاج تعميقاً",
                "إنشاء hotspots للمعلومات الإضافية",
                "إضافة أسئلة اختبارية لقياس الفهم",
                "معاينة واختبار قبل الاستخدام في الفصل"
            ],
            studentExperience: "يستكشف الطالب المشهد ويكتشف المعلومات بالنقر على نقاط التفاعل",
            bestPractices: [
                "لا تضف أكثر من 5-7 نقاط تفاعل لتجنب التشتت",
                "استخدم ألوان واضحة للنقاط",
                "اجعل المحتوى التفاعلي مختصراً ومركزاً"
            ]
        },
        {
            id: "ai-generation",
            icon: Sparkles,
            title: "توليد المحتوى بالذكاء الاصطناعي",
            subtitle: "AI Content Generation",
            description: "إنشاء مشاهد 360° مخصصة من وصف نصي",
            implementation: [
                "الوصول لأداة AI من بوابة ClassVR",
                "كتابة وصف تفصيلي للمشهد المطلوب",
                "تحديد الغرض التعليمي والفئة العمرية",
                "مراجعة وتعديل النتيجة",
                "حفظ وإضافة للدروس"
            ],
            teacherWorkflow: [
                "تحديد المفهوم الذي يحتاج تصوراً بصرياً",
                "كتابة prompt واضح: المكان، الزمان، العناصر",
                "توليد ومراجعة للدقة العلمية",
                "تعديل أو إعادة التوليد إذا لزم الأمر"
            ],
            studentExperience: "يرى الطالب مشاهد مخصصة للمنهج المصري غير متوفرة في المكتبة العامة",
            bestPractices: [
                "كن دقيقاً في الوصف: 'داخل الهرم الأكبر في عصر بناء الأهرامات'",
                "راجع الدقة العلمية والتاريخية",
                "استخدم للمفاهيم المجردة كالفيزياء والكيمياء"
            ],
            examples: [
                "رحلة داخل الخلية النباتية مع تفاصيل كل عضية",
                "مشهد من معركة حطين بالملابس والأسلحة التاريخية",
                "نموذج ثلاثي الأبعاد للجهاز الهضمي أثناء الهضم"
            ]
        },
        {
            id: "custom-upload",
            icon: Upload,
            title: "رفع المحتوى المخصص",
            subtitle: "Uploading Custom Content",
            description: "رفع صور وفيديوهات ونماذج 3D خاصة بالمنهج المصري",
            implementation: [
                "الوصول لقسم 'المحتوى المخصص' في البوابة",
                "اختيار نوع الملف: صورة 360°، فيديو 360°، نموذج 3D",
                "رفع بالصيغ المدعومة: JPG/PNG (360°), MP4 (360°), GLB/GLTF",
                "إضافة وصف وتصنيف وكلمات مفتاحية",
                "تنظيم في مجلدات حسب المادة والصف"
            ],
            teacherWorkflow: [
                "تصوير محتوى 360° بكاميرا متخصصة أو هاتف",
                "تحرير وضبط الجودة",
                "رفع مع وصف مفصل",
                "تخصيص للمنهج المصري: الآثار، المتاحف، المعالم"
            ],
            studentExperience: "يختبر الطالب محتوى فريداً مرتبطاً بثقافته وبيئته المصرية",
            technicalSpecs: {
                images: "JPG/PNG، دقة 4096x2048 pixel minimum، Equirectangular",
                videos: "MP4 H.264، دقة 4K، 30fps minimum",
                models: "GLB/GLTF، أقل من 50MB، Textures embedded"
            },
            bestPractices: [
                "صوّر المتاحف والمعالم المصرية لربط المنهج بالواقع",
                "أنشئ نماذج 3D للتجارب العلمية المصرية",
                "شارك المحتوى مع معلمين آخرين في المنصة"
            ]
        }
    ];

    const remoteAdaptation = [
        {
            icon: Globe,
            title: "التكيف مع الطلاب في الخارج",
            points: [
                "جلسات VR مسجلة للمشاهدة حسب التوقيت المحلي",
                "محتوى قابل للوصول من أي مكان عبر الإنترنت",
                "تقارير أداء مفصلة لأولياء الأمور",
                "دعم فني متعدد المناطق الزمنية"
            ]
        },
        {
            icon: Laptop,
            title: "المتطلبات التقنية للتعلم عن بُعد",
            points: [
                "نظارة ClassVR أو أي جهاز مع متصفح ويب",
                "اتصال إنترنت مستقر (10 Mbps minimum)",
                "تطبيق ClassVR للمعلم على الكمبيوتر أو الجوال",
                "سماعات للصوت التفاعلي"
            ]
        },
        {
            icon: GraduationCap,
            title: "الربط بالامتحانات المصرية",
            points: [
                "محتوى VR مرتبط بمواصفات الامتحانات الوزارية",
                "تمارين تفاعلية تحاكي أسئلة الامتحانات",
                "مراجعة بصرية للمفاهيم الصعبة",
                "تقييم الاستيعاب بعد كل جلسة VR"
            ]
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="container mx-auto relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 text-brand-primary" />
                            <span>تقنية ClassVR Eduverse</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            تجربة الواقع الافتراضي
                            <span className="block text-brand-primary mt-2">التعليمية الغامرة</span>
                        </h1>

                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            دليل شامل لتطبيق تقنية VR في التعليم المصري عن بُعد - من الاستكشاف إلى الإتقان
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center pt-4">
                            <Link href="/vr-eduverse/science/solar-system">
                                <Button size="lg" className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold px-8">
                                    ابدأ التجربة الآن
                                </Button>
                            </Link>
                            <a href="#features">
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                                    اكتشف الميزات
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* What is Eduverse */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            ما هو <span className="text-purple-600">ClassVR Eduverse</span>؟
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            ClassVR Eduverse هو منصة تعليمية غامرة توفر آلاف الموارد التعليمية بتقنية الواقع الافتراضي والمعزز.
                            تتيح للمعلمين إنشاء دروس تفاعلية وللطلاب استكشاف المفاهيم بطريقة لا تُنسى.
                        </p>

                        <div className="grid md:grid-cols-4 gap-6 pt-8">
                            <div className="text-center p-6 rounded-2xl bg-purple-50">
                                <div className="text-4xl font-bold text-purple-600">1000+</div>
                                <div className="text-gray-600 mt-2">مشهد 360°</div>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-indigo-50">
                                <div className="text-4xl font-bold text-indigo-600">500+</div>
                                <div className="text-gray-600 mt-2">نموذج 3D</div>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-blue-50">
                                <div className="text-4xl font-bold text-blue-600">30</div>
                                <div className="text-gray-600 mt-2">طالب/جلسة</div>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-green-50">
                                <div className="text-4xl font-bold text-green-600">∞</div>
                                <div className="text-gray-600 mt-2">محتوى مخصص</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">دليل التطبيق الشامل</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            خطوات تفصيلية لكل ميزة من ميزات ClassVR Eduverse مع أفضل الممارسات
                        </p>
                    </div>

                    <div className="space-y-12">
                        {features.map((feature, index) => (
                            <Card key={feature.id} id={feature.id} className="overflow-hidden border-none shadow-lg">
                                <div className="grid lg:grid-cols-3 gap-0">
                                    {/* Header Column */}
                                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                                <feature.icon className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm opacity-80">الميزة {index + 1}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                                        <p className="text-sm opacity-80 mb-4">{feature.subtitle}</p>
                                        <p className="text-gray-200">{feature.description}</p>
                                    </div>

                                    {/* Implementation Column */}
                                    <div className="p-8 bg-white">
                                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-purple-600" />
                                            خطوات التطبيق
                                        </h4>
                                        <ul className="space-y-3">
                                            {feature.implementation.map((step, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm shrink-0 mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-gray-600">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Best Practices Column */}
                                    <div className="p-8 bg-gray-50">
                                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            أفضل الممارسات
                                        </h4>
                                        <ul className="space-y-3">
                                            {feature.bestPractices.map((practice, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                                    <span className="text-gray-600">{practice}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                                            <h5 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                                                <Eye className="w-4 h-4" />
                                                تجربة الطالب
                                            </h5>
                                            <p className="text-sm text-purple-700">{feature.studentExperience}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Remote Learning Adaptation */}
            <section className="py-20 bg-gradient-to-br from-brand-dark to-gray-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            مُحسّن للطلاب <span className="text-brand-primary">في الخارج</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            تم تكييف كل ميزة لتناسب احتياجات العائلات المصرية المقيمة خارج مصر
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {remoteAdaptation.map((item, index) => (
                            <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="w-14 h-14 bg-brand-primary/20 rounded-2xl flex items-center justify-center mb-4">
                                        <item.icon className="w-7 h-7 text-brand-primary" />
                                    </div>
                                    <CardTitle className="text-xl text-white">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {item.points.map((point, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-300">
                                                <CheckCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-purple-50">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            جاهز لتحويل تجربة التعلم؟
                        </h2>
                        <p className="text-lg text-gray-600">
                            انضم إلى Eman-Academy واستفد من تقنية الواقع الافتراضي لتحضير طفلك للامتحانات المصرية باحترافية
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center pt-4">
                            <Link href="/vr-eduverse/science">
                                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8">
                                    استكشف تجارب العلوم
                                </Button>
                            </Link>
                            <Link href="/vr-eduverse/field-trips">
                                <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8">
                                    الرحلات الميدانية الافتراضية
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
