import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Compass,
  Clock,
  GraduationCap,
  MapPin,
  Eye,
  Star,
  ArrowRight,
  Play,
  BookOpen,
  Globe,
  Pyramid,
  Building2,
  Landmark,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "الرحلات الميدانية الافتراضية - المواقع المصرية التاريخية | Eman-Academy",
  description: "استكشف المعالم المصرية التاريخية من خلال رحلات افتراضية غامرة - الأهرامات، المتحف المصري، معبد أبو سمبل",
};

export default function FieldTripsHubPage() {
  // Field trip destinations data
  const fieldTrips = [
    {
      id: "pyramids-of-giza",
      slug: "pyramids-of-giza",
      icon: Pyramid,
      title: {
        en: "Pyramids of Giza",
        ar: "أهرامات الجيزة",
      },
      subtitle: {
        en: "The Last Wonder of the Ancient World",
        ar: "العجيبة الأخيرة من عجائب الدنيا السبع",
      },
      description: {
        en: "Experience the grandeur of the Great Pyramid, explore the Sphinx, and learn about ancient Egyptian civilization through immersive 360° views and interactive hotspots.",
        ar: "اختبر عظمة الهرم الأكبر، واستكشف أبو الهول، وتعلم عن الحضارة المصرية القديمة من خلال مشاهد 360° غامرة ونقاط تفاعلية.",
      },
      thumbnailUrl: "https://placehold.co/800x600/f59e0b/ffffff?text=Pyramids+of+Giza",
      coverImageUrl: "https://placehold.co/1200x600/f59e0b/ffffff?text=Pyramids+of+Giza",
      difficulty: "intermediate",
      estimatedDuration: 30,
      gradeLevel: ["5-6", "7-9", "10-12"],
      highlights: [
        { en: "Great Pyramid exterior & interior", ar: "الهرم الأكبر من الخارج والداخل" },
        { en: "Sphinx and temple complex", ar: "أبو الهول ومجمع المعابد" },
        { en: "Construction techniques", ar: "تقنيات البناء" },
        { en: "Pharaonic history & culture", ar: "التاريخ والثقافة الفرعونية" },
      ],
      stats: {
        scenes: 5,
        hotspots: 12,
        quizzes: 3,
      },
      location: {
        city: "Giza",
        country: "Egypt",
      },
      isAvailable: false, // Not implemented yet
    },
    {
      id: "egyptian-museum",
      slug: "egyptian-museum",
      icon: Building2,
      title: {
        en: "Egyptian Museum",
        ar: "المتحف المصري",
      },
      subtitle: {
        en: "Treasures of Ancient Egypt",
        ar: "كنوز مصر القديمة",
      },
      description: {
        en: "Take a virtual tour through the Egyptian Museum's iconic galleries. Discover Tutankhamun's treasures, royal mummies, and thousands of artifacts from Egypt's ancient past.",
        ar: "قم بجولة افتراضية في قاعات المتحف المصري الشهيرة. اكتشف كنوز توت عنخ آمون، والمومياوات الملكية، وآلاف القطع الأثرية من ماضي مصر العريق.",
      },
      thumbnailUrl: "https://placehold.co/800x600/ef4444/ffffff?text=Egyptian+Museum",
      coverImageUrl: "https://placehold.co/1200x600/ef4444/ffffff?text=Egyptian+Museum",
      difficulty: "beginner",
      estimatedDuration: 25,
      gradeLevel: ["5-6", "7-9", "10-12"],
      highlights: [
        { en: "Tutankhamun's golden mask", ar: "القناع الذهبي لتوت عنخ آمون" },
        { en: "Royal mummies collection", ar: "مجموعة المومياوات الملكية" },
        { en: "Ancient artifacts & jewelry", ar: "القطع الأثرية والمجوهرات القديمة" },
        { en: "Hieroglyphics & writing systems", ar: "الهيروغليفية ونظم الكتابة" },
      ],
      stats: {
        scenes: 6,
        hotspots: 15,
        quizzes: 4,
      },
      location: {
        city: "Cairo",
        country: "Egypt",
      },
      isAvailable: false, // Not implemented yet
    },
    {
      id: "abu-simbel",
      slug: "abu-simbel",
      icon: Landmark,
      title: {
        en: "Abu Simbel Temples",
        ar: "معابد أبو سمبل",
      },
      subtitle: {
        en: "Monument of Ramesses II",
        ar: "نصب رمسيس الثاني التذكاري",
      },
      description: {
        en: "Explore the magnificent rock temples of Abu Simbel, marvel at the colossal statues of Ramesses II, and learn about the incredible UNESCO rescue mission that saved these monuments.",
        ar: "استكشف معابد أبو سمبل الصخرية الرائعة، وتأمل التماثيل الضخمة لرمسيس الثاني، وتعلم عن مهمة الإنقاذ الاستثنائية لليونسكو التي أنقذت هذه الآثار.",
      },
      thumbnailUrl: "https://placehold.co/800x600/3b82f6/ffffff?text=Abu+Simbel",
      coverImageUrl: "https://placehold.co/1200x600/3b82f6/ffffff?text=Abu+Simbel",
      difficulty: "intermediate",
      estimatedDuration: 20,
      gradeLevel: ["7-9", "10-12"],
      highlights: [
        { en: "Great Temple facade with colossal statues", ar: "واجهة المعبد الكبير بالتماثيل الضخمة" },
        { en: "Interior chambers & hieroglyphs", ar: "الغرف الداخلية والنقوش الهيروغليفية" },
        { en: "Temple of Hathor", ar: "معبد حتحور" },
        { en: "Sun alignment phenomenon", ar: "ظاهرة تعامد الشمس" },
      ],
      stats: {
        scenes: 4,
        hotspots: 10,
        quizzes: 2,
      },
      location: {
        city: "Aswan",
        country: "Egypt",
      },
      isAvailable: false, // Not implemented yet
    },
  ];

  const difficultyColors = {
    beginner: "bg-green-100 text-green-700 border-green-200",
    intermediate: "bg-yellow-100 text-yellow-700 border-yellow-200",
    advanced: "bg-red-100 text-red-700 border-red-200",
  };

  const difficultyLabels = {
    beginner: { en: "Beginner", ar: "مبتدئ" },
    intermediate: { en: "Intermediate", ar: "متوسط" },
    advanced: { en: "Advanced", ar: "متقدم" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-700 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm text-yellow-200">
              <Link href="/vr-eduverse" className="hover:text-white transition-colors">
                VR Eduverse
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span>الرحلات الميدانية</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
              <Compass className="w-4 h-4 text-yellow-300" />
              <span>Virtual Field Trips</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              الرحلات الميدانية الافتراضية
              <span className="block text-yellow-300 mt-2">Egyptian Historical Sites</span>
            </h1>

            <p className="text-xl text-yellow-100 max-w-2xl mx-auto">
              استكشف المعالم المصرية التاريخية من خلال تجارب واقع افتراضي غامرة
              <br />
              <span className="text-base">
                Explore Egypt&apos;s iconic monuments through immersive virtual reality experiences
              </span>
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-yellow-300">{fieldTrips.length}</div>
                <div className="text-sm text-yellow-100">Destinations</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-yellow-300">
                  {fieldTrips.reduce((acc, ft) => acc + ft.stats.scenes, 0)}
                </div>
                <div className="text-sm text-yellow-100">360° Scenes</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-yellow-300">
                  {fieldTrips.reduce((acc, ft) => acc + ft.stats.hotspots, 0)}
                </div>
                <div className="text-sm text-yellow-100">Hotspots</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-yellow-300">
                  {fieldTrips.reduce((acc, ft) => acc + ft.stats.quizzes, 0)}
                </div>
                <div className="text-sm text-yellow-100">Quizzes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              لماذا الرحلات الميدانية الافتراضية؟
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              تتيح لك تقنية الواقع الافتراضي زيارة المواقع التاريخية المصرية من أي مكان في العالم.
              تجربة غامرة تربط أطفال الجالية المصرية بحضارتهم وتراثهم العريق.
            </p>

            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">تجربة غامرة</h3>
                <p className="text-gray-600 text-sm">
                  مشاهد 360° تضعك في قلب الموقع التاريخي كأنك هناك فعلياً
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">محتوى تعليمي</h3>
                <p className="text-gray-600 text-sm">
                  نقاط تفاعلية بمعلومات تاريخية وثقافية غنية باللغتين العربية والإنجليزية
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">من أي مكان</h3>
                <p className="text-gray-600 text-sm">
                  متاح للطلاب في مصر والمغتربين في جميع أنحاء العالم
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Field Trips Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              استكشف المواقع التاريخية
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              اختر وجهتك وابدأ رحلتك الافتراضية في التاريخ المصري العريق
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {fieldTrips.map((trip, index) => {
              const Icon = trip.icon;
              return (
                <Card
                  key={trip.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-amber-300 group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                    <img
                      src={trip.thumbnailUrl}
                      alt={trip.title.en}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Icon Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                        <Icon className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge
                        variant={trip.isAvailable ? "default" : "secondary"}
                        className={trip.isAvailable ? "bg-green-600" : "bg-gray-600"}
                      >
                        {trip.isAvailable ? "متاح" : "قريباً"}
                      </Badge>
                    </div>

                    {/* Number Badge */}
                    <div className="absolute bottom-4 left-4">
                      <div className="w-10 h-10 bg-amber-500 text-white font-bold rounded-full flex items-center justify-center text-lg shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1 group-hover:text-amber-600 transition-colors">
                          {trip.title.ar}
                        </CardTitle>
                        <div className="text-sm text-gray-500 font-medium">{trip.title.en}</div>
                      </div>
                    </div>
                    <CardDescription className="text-sm line-clamp-2 leading-relaxed">
                      {trip.subtitle.ar}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {trip.description.ar}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center bg-gray-50 rounded-lg p-2">
                        <div className="text-lg font-bold text-amber-600">{trip.stats.scenes}</div>
                        <div className="text-xs text-gray-600">Scenes</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-2">
                        <div className="text-lg font-bold text-blue-600">{trip.stats.hotspots}</div>
                        <div className="text-xs text-gray-600">Hotspots</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-2">
                        <div className="text-lg font-bold text-green-600">{trip.stats.quizzes}</div>
                        <div className="text-xs text-gray-600">Quizzes</div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{trip.estimatedDuration} دقيقة</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{trip.location.city}, {trip.location.country}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <GraduationCap className="w-4 h-4" />
                        <span>الصفوف {trip.gradeLevel.join(", ")}</span>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={difficultyColors[trip.difficulty as keyof typeof difficultyColors]}
                      >
                        {difficultyLabels[trip.difficulty as keyof typeof difficultyLabels].ar}
                      </Badge>
                    </div>

                    {/* Highlights Preview */}
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-900">
                          أبرز المعالم:
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {trip.highlights.slice(0, 2).map((highlight, i) => (
                          <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
                            <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">{highlight.ar}</span>
                          </li>
                        ))}
                      </ul>
                      {trip.highlights.length > 2 && (
                        <div className="text-xs text-amber-600 mt-1">
                          +{trip.highlights.length - 2} معالم أخرى
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link
                      href={
                        trip.isAvailable
                          ? `/vr-eduverse/field-trips/${trip.slug}`
                          : `/vr-eduverse/field-trips#coming-soon`
                      }
                    >
                      <Button
                        className={`w-full ${
                          trip.isAvailable
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                        } text-white font-semibold`}
                        disabled={!trip.isAvailable}
                      >
                        {trip.isAvailable ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            ابدأ الرحلة
                          </>
                        ) : (
                          <>قريباً</>
                        )}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Educational Benefits */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                الفوائد التعليمية
              </h2>
              <p className="text-gray-600">
                كيف تعزز الرحلات الميدانية الافتراضية تعلم طفلك
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      ربط المنهج بالواقع
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      ترتبط الرحلات الافتراضية بالمنهج المصري في التاريخ والدراسات الاجتماعية،
                      مما يعزز فهم الطلاب للحضارة المصرية القديمة.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      التواصل مع التراث
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      تساعد أطفال الجالية المصرية في الخارج على الارتباط بجذورهم
                      والتعرف على تاريخ بلدهم بطريقة حديثة وجذابة.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      تعلم بصري تفاعلي
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      التجربة الغامرة تحفز الذاكرة البصرية وتجعل المعلومات لا تُنسى،
                      مما يحسن استيعاب الطلاب واستعدادهم للامتحانات.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      الاستعداد للامتحانات
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      كل رحلة تتضمن اختبارات قصيرة ترتبط بمواصفات الامتحانات المصرية،
                      مما يساعد الطلاب على التحضير الفعال.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-700 text-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                كيف تعمل الرحلات الافتراضية؟
              </h2>
              <p className="text-yellow-100">
                خطوات بسيطة لبدء مغامرتك التعليمية
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="font-bold text-lg mb-2">اختر الوجهة</h3>
                <p className="text-yellow-100 text-sm">
                  اختر الموقع التاريخي الذي تريد استكشافه من القائمة أعلاه
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="font-bold text-lg mb-2">استكشف المشاهد</h3>
                <p className="text-yellow-100 text-sm">
                  تجول في المشاهد 360° واكتشف النقاط التفاعلية للحصول على المعلومات
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="font-bold text-lg mb-2">اختبر معرفتك</h3>
                <p className="text-yellow-100 text-sm">
                  أجب على الأسئلة القصيرة في كل موقع لتعزيز فهمك وتحضيرك للامتحانات
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              جاهز لبدء رحلتك الافتراضية؟
            </h2>
            <p className="text-lg text-gray-600">
              انضم إلى Eman-Academy وامنح طفلك تجربة تعليمية فريدة تربطه بحضارته وتراثه
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8"
                >
                  ابدأ الآن مجاناً
                </Button>
              </Link>
              <Link href="/vr-eduverse">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-amber-600 text-amber-600 hover:bg-amber-50 px-8"
                >
                  اكتشف المزيد من تجارب VR
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
