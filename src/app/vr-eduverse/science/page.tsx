import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Atom,
  Microscope,
  Telescope,
  Dna,
  Flask,
  Clock,
  GraduationCap,
  Eye,
  Star,
  ArrowRight,
  Play,
  BookOpen,
  Lightbulb,
  ChevronRight,
  Zap,
  Globe2,
} from "lucide-react";

export const metadata = {
  title: "التصورات العلمية ثلاثية الأبعاد - العلوم التفاعلية | Eman-Academy",
  description: "استكشف المفاهيم العلمية المعقدة من خلال نماذج ثلاثية الأبعاد تفاعلية - النظام الشمسي، الخلية البشرية، الذرة والجزيئات",
};

export default function ScienceHubPage() {
  // Science visualization data
  const scienceVisualizations = [
    {
      id: "solar-system",
      slug: "solar-system",
      icon: Telescope,
      category: "astronomy",
      categoryLabel: {
        en: "Astronomy",
        ar: "علم الفلك",
      },
      title: {
        en: "Solar System",
        ar: "النظام الشمسي",
      },
      subtitle: {
        en: "Explore the Planets and Their Orbits",
        ar: "استكشف الكواكب ومداراتها",
      },
      description: {
        en: "Take an interactive journey through our solar system. Explore all 8 planets with accurate relative sizes, orbital animations, and detailed information about each celestial body.",
        ar: "قم برحلة تفاعلية عبر نظامنا الشمسي. استكشف جميع الكواكب الثمانية بأحجام نسبية دقيقة، ورسوم متحركة للمدارات، ومعلومات مفصلة عن كل جرم سماوي.",
      },
      thumbnailUrl: "https://placehold.co/800x600/3b82f6/ffffff?text=Solar+System",
      coverImageUrl: "https://placehold.co/1200x600/3b82f6/ffffff?text=Solar+System",
      difficulty: "intermediate",
      estimatedDuration: 25,
      gradeLevel: ["5-6", "7-9", "10-12"],
      highlights: [
        { en: "8 planets with accurate relative sizes", ar: "٨ كواكب بأحجام نسبية دقيقة" },
        { en: "Orbital animation and speed", ar: "رسوم متحركة للمدارات والسرعة" },
        { en: "Planetary information panels", ar: "لوحات معلومات الكواكب" },
        { en: "Distance scale toggle", ar: "تبديل مقياس المسافة" },
      ],
      stats: {
        models: 9,
        hotspots: 8,
        quizzes: 4,
      },
      isAvailable: false, // To be implemented in 4.2
    },
    {
      id: "human-cell",
      slug: "human-cell",
      icon: Microscope,
      category: "biology",
      categoryLabel: {
        en: "Biology",
        ar: "علم الأحياء",
      },
      title: {
        en: "Human Cell",
        ar: "الخلية البشرية",
      },
      subtitle: {
        en: "Discover the Building Blocks of Life",
        ar: "اكتشف اللبنات الأساسية للحياة",
      },
      description: {
        en: "Explore the intricate structure of plant and animal cells in 3D. Learn about organelles like the nucleus, mitochondria, and more through interactive cutaway views and detailed educational content.",
        ar: "استكشف البنية المعقدة للخلايا النباتية والحيوانية في 3D. تعلم عن العضيات مثل النواة والميتوكوندريا والمزيد من خلال مشاهد تفاعلية مقطوعة ومحتوى تعليمي مفصل.",
      },
      thumbnailUrl: "https://placehold.co/800x600/10b981/ffffff?text=Human+Cell",
      coverImageUrl: "https://placehold.co/1200x600/10b981/ffffff?text=Human+Cell",
      difficulty: "intermediate",
      estimatedDuration: 20,
      gradeLevel: ["7-9", "10-12"],
      highlights: [
        { en: "Cutaway view of cell structure", ar: "عرض مقطوع لبنية الخلية" },
        { en: "Labeled organelles", ar: "عضيات مسماة" },
        { en: "Plant vs Animal cell comparison", ar: "مقارنة بين الخلية النباتية والحيوانية" },
        { en: "Interactive zoom and rotation", ar: "تكبير وتدوير تفاعلي" },
      ],
      stats: {
        models: 15,
        hotspots: 12,
        quizzes: 5,
      },
      isAvailable: false, // To be implemented in 4.3
    },
    {
      id: "atom-molecule",
      slug: "atom-molecule",
      icon: Atom,
      category: "chemistry",
      categoryLabel: {
        en: "Chemistry",
        ar: "الكيمياء",
      },
      title: {
        en: "Atoms & Molecules",
        ar: "الذرات والجزيئات",
      },
      subtitle: {
        en: "Understand Chemical Structures",
        ar: "افهم التراكيب الكيميائية",
      },
      description: {
        en: "Dive into the world of atoms and molecules. Visualize the Bohr model, explore molecular structures like H2O, observe electron orbital animations, and learn about chemical bonding.",
        ar: "انغمس في عالم الذرات والجزيئات. تصور نموذج بور، واستكشف التراكيب الجزيئية مثل H2O، ولاحظ الرسوم المتحركة للمدارات الإلكترونية، وتعلم عن الروابط الكيميائية.",
      },
      thumbnailUrl: "https://placehold.co/800x600/8b5cf6/ffffff?text=Atoms+Molecules",
      coverImageUrl: "https://placehold.co/1200x600/8b5cf6/ffffff?text=Atoms+Molecules",
      difficulty: "advanced",
      estimatedDuration: 18,
      gradeLevel: ["7-9", "10-12"],
      highlights: [
        { en: "Bohr model atom visualization", ar: "تصور نموذج بور للذرة" },
        { en: "Water molecule (H2O) structure", ar: "بنية جزيء الماء (H2O)" },
        { en: "Electron orbital animation", ar: "رسوم متحركة للمدارات الإلكترونية" },
        { en: "Chemical bonding explanations", ar: "شرح الروابط الكيميائية" },
      ],
      stats: {
        models: 10,
        hotspots: 8,
        quizzes: 4,
      },
      isAvailable: false, // To be implemented in 4.4
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

  const categoryColors = {
    astronomy: "bg-blue-600",
    biology: "bg-green-600",
    chemistry: "bg-purple-600",
    physics: "bg-orange-600",
  };

  const categoryIcons = {
    astronomy: Telescope,
    biology: Dna,
    chemistry: Flask,
    physics: Zap,
  };

  // Group visualizations by category
  const categories = [
    { id: "astronomy", label: { en: "Astronomy", ar: "علم الفلك" }, icon: Telescope },
    { id: "biology", label: { en: "Biology", ar: "علم الأحياء" }, icon: Dna },
    { id: "chemistry", label: { en: "Chemistry", ar: "الكيمياء" }, icon: Flask },
    { id: "physics", label: { en: "Physics", ar: "الفيزياء" }, icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm text-blue-200">
              <Link href="/vr-eduverse" className="hover:text-white transition-colors">
                VR Eduverse
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span>التصورات العلمية</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
              <Lightbulb className="w-4 h-4 text-blue-300" />
              <span>3D Science Visualizations</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              التصورات العلمية ثلاثية الأبعاد
              <span className="block text-blue-300 mt-2">Interactive 3D Science</span>
            </h1>

            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              استكشف المفاهيم العلمية المعقدة من خلال نماذج تفاعلية ثلاثية الأبعاد
              <br />
              <span className="text-base">
                Visualize complex scientific concepts through interactive 3D models
              </span>
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-300">{scienceVisualizations.length}</div>
                <div className="text-sm text-blue-100">Visualizations</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-300">
                  {scienceVisualizations.reduce((acc, viz) => acc + viz.stats.models, 0)}
                </div>
                <div className="text-sm text-blue-100">3D Models</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-300">
                  {scienceVisualizations.reduce((acc, viz) => acc + viz.stats.hotspots, 0)}
                </div>
                <div className="text-sm text-blue-100">Info Points</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-300">
                  {scienceVisualizations.reduce((acc, viz) => acc + viz.stats.quizzes, 0)}
                </div>
                <div className="text-sm text-blue-100">Quizzes</div>
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
              لماذا التصورات العلمية ثلاثية الأبعاد؟
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              تجعل النماذج ثلاثية الأبعاد المفاهيم العلمية المجردة ملموسة وسهلة الفهم.
              تجربة تفاعلية تحفز الفضول وتعزز التعلم العميق.
            </p>

            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">رؤية ثلاثية الأبعاد</h3>
                <p className="text-gray-600 text-sm">
                  تفاعل مع النماذج من جميع الزوايا، قم بالتكبير والتدوير لفهم أعمق
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">شرح تفصيلي</h3>
                <p className="text-gray-600 text-sm">
                  نقاط معلومات تفاعلية تشرح كل جزء بالتفصيل باللغتين العربية والإنجليزية
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">تعلم بالاستكشاف</h3>
                <p className="text-gray-600 text-sm">
                  تعلم ذاتي من خلال الاستكشاف والتجربة بدلاً من الحفظ التقليدي
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
              التصنيفات العلمية
            </h2>
            <p className="text-gray-600">
              استكشف المواضيع حسب التخصص العلمي
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = scienceVisualizations.filter(
                (viz) => viz.category === category.id
              ).length;
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-12 h-12 ${categoryColors[category.id as keyof typeof categoryColors]} text-white rounded-xl flex items-center justify-center mx-auto mb-3`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    {category.label.ar}
                  </h3>
                  <p className="text-xs text-gray-500">{category.label.en}</p>
                  <div className="mt-2 text-xs text-gray-600">
                    {count} {count === 1 ? "visualization" : "visualizations"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Science Visualizations Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              استكشف التصورات العلمية
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              اختر موضوعاً علمياً وابدأ رحلتك في الاستكشاف التفاعلي
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {scienceVisualizations.map((viz, index) => {
              const Icon = viz.icon;
              return (
                <Card
                  key={viz.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                    <img
                      src={viz.thumbnailUrl}
                      alt={viz.title.en}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Icon Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge
                        variant={viz.isAvailable ? "default" : "secondary"}
                        className={viz.isAvailable ? "bg-green-600" : "bg-gray-600"}
                      >
                        {viz.isAvailable ? "متاح" : "قريباً"}
                      </Badge>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute bottom-4 left-4">
                      <Badge
                        className={`${categoryColors[viz.category as keyof typeof categoryColors]} text-white`}
                      >
                        {viz.categoryLabel.ar}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1 group-hover:text-blue-600 transition-colors">
                          {viz.title.ar}
                        </CardTitle>
                        <div className="text-sm text-gray-500 font-medium">{viz.title.en}</div>
                      </div>
                    </div>
                    <CardDescription className="text-sm line-clamp-2 leading-relaxed">
                      {viz.subtitle.ar}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {viz.description.ar}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center bg-gray-50 rounded-lg p-2">
                        <div className="text-lg font-bold text-blue-600">{viz.stats.models}</div>
                        <div className="text-xs text-gray-600">Models</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-2">
                        <div className="text-lg font-bold text-purple-600">{viz.stats.hotspots}</div>
                        <div className="text-xs text-gray-600">Info Points</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-2">
                        <div className="text-lg font-bold text-green-600">{viz.stats.quizzes}</div>
                        <div className="text-xs text-gray-600">Quizzes</div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{viz.estimatedDuration} دقيقة</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <GraduationCap className="w-4 h-4" />
                        <span>الصفوف {viz.gradeLevel.join(", ")}</span>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={difficultyColors[viz.difficulty as keyof typeof difficultyColors]}
                      >
                        {difficultyLabels[viz.difficulty as keyof typeof difficultyLabels].ar}
                      </Badge>
                    </div>

                    {/* Highlights Preview */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-900">
                          أبرز الميزات:
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {viz.highlights.slice(0, 2).map((highlight, i) => (
                          <li key={i} className="text-xs text-blue-800 flex items-start gap-2">
                            <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">{highlight.ar}</span>
                          </li>
                        ))}
                      </ul>
                      {viz.highlights.length > 2 && (
                        <div className="text-xs text-blue-600 mt-1">
                          +{viz.highlights.length - 2} ميزات أخرى
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link
                      href={
                        viz.isAvailable
                          ? `/vr-eduverse/science/${viz.slug}`
                          : `/vr-eduverse/science#coming-soon`
                      }
                    >
                      <Button
                        className={`w-full ${
                          viz.isAvailable
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                        } text-white font-semibold`}
                        disabled={!viz.isAvailable}
                      >
                        {viz.isAvailable ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            ابدأ الاستكشاف
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
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                الفوائد التعليمية
              </h2>
              <p className="text-gray-600">
                كيف تعزز التصورات ثلاثية الأبعاد فهم طفلك للعلوم
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      فهم المفاهيم المجردة
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      النماذج ثلاثية الأبعاد تحول المفاهيم العلمية المجردة إلى تجارب مرئية
                      ملموسة، مما يسهل الفهم والاستيعاب.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      تحفيز الفضول العلمي
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      الاستكشاف التفاعلي يثير فضول الطلاب ويشجعهم على طرح الأسئلة
                      والبحث عن الإجابات بأنفسهم.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      ربط النظرية بالتطبيق
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      تربط التصورات المعلومات النظرية من الكتب المدرسية بالتطبيقات
                      العملية في العالم الحقيقي.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      التحضير للامتحانات
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      كل تصور يتضمن اختبارات قصيرة ترتبط بمواصفات الامتحانات المصرية،
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
      <section className="py-16 px-4 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                كيف تعمل التصورات العلمية؟
              </h2>
              <p className="text-blue-100">
                خطوات بسيطة لبدء رحلتك العلمية التفاعلية
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="font-bold text-lg mb-2">اختر الموضوع</h3>
                <p className="text-blue-100 text-sm">
                  اختر المفهوم العلمي الذي تريد استكشافه من القائمة أعلاه
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="font-bold text-lg mb-2">تفاعل مع النموذج</h3>
                <p className="text-blue-100 text-sm">
                  قم بالتكبير والتدوير والاستكشاف، واكتشف النقاط التفاعلية للحصول على المعلومات
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="font-bold text-lg mb-2">اختبر فهمك</h3>
                <p className="text-blue-100 text-sm">
                  أجب على الأسئلة القصيرة لتعزيز فهمك وتحضيرك للامتحانات
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
              جاهز لاستكشاف العلوم بطريقة جديدة؟
            </h2>
            <p className="text-lg text-gray-600">
              انضم إلى Eman-Academy وامنح طفلك تجربة تعليمية علمية تفاعلية فريدة
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8"
                >
                  ابدأ الآن مجاناً
                </Button>
              </Link>
              <Link href="/vr-eduverse">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8"
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
