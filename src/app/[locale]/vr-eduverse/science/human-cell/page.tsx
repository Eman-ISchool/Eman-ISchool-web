'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  Award,
  Maximize2,
  Minimize2,
  Languages,
  HelpCircle,
  CheckCircle2,
  X,
  Microscope,
  FlipHorizontal,
  Eye,
} from 'lucide-react';
import type { VRLanguage } from '@/types/vr';

// Dynamically import VR components to avoid SSR issues
const VRCanvas = dynamic(
  () => import('@/components/vr/canvas/VRCanvas').then((mod) => mod.VRCanvas),
  { ssr: false }
);

const CellScene = dynamic(
  () =>
    import('@/components/vr/experiences/CellScene').then(
      (mod) => mod.CellScene
    ),
  { ssr: false }
);

/**
 * Human Cell VR Experience Page
 *
 * Interactive 3D visualization of plant and animal cells with labeled organelles
 * and educational information.
 */
export default function HumanCellPage() {
  const [language, setLanguage] = useState<VRLanguage>('ar');
  const [cellType, setCellType] = useState<'animal' | 'plant'>('animal');
  const [selectedOrganelleId, setSelectedOrganelleId] = useState<string | null>(null);
  const [answeredQuizIds, setAnsweredQuizIds] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cutawayAngle, setCutawayAngle] = useState(45);
  const [showHelp, setShowHelp] = useState(false);

  // Quiz questions for organelles
  const quizQuestions = useMemo(
    () => [
      {
        id: 'nucleus-quiz',
        organelleId: 'nucleus',
        question: {
          en: 'What is the main function of the nucleus?',
          ar: 'ما هي الوظيفة الرئيسية للنواة؟',
        },
        options: [
          { en: 'Produce energy', ar: 'إنتاج الطاقة' },
          { en: 'Control cell activities and store DNA', ar: 'التحكم في أنشطة الخلية وتخزين DNA' },
          { en: 'Digest waste materials', ar: 'هضم المواد النفايات' },
        ],
        correctAnswer: 1,
      },
      {
        id: 'mitochondria-quiz',
        organelleId: 'mitochondria',
        question: {
          en: 'Why are mitochondria called the "powerhouse" of the cell?',
          ar: 'لماذا تسمى الميتوكوندريا "محطة الطاقة" للخلية؟',
        },
        options: [
          { en: 'They store water', ar: 'تخزن الماء' },
          { en: 'They produce ATP energy', ar: 'تنتج طاقة ATP' },
          { en: 'They make proteins', ar: 'تصنع البروتينات' },
        ],
        correctAnswer: 1,
      },
      {
        id: 'chloroplast-quiz',
        organelleId: 'chloroplast',
        question: {
          en: 'What unique function do chloroplasts perform?',
          ar: 'ما الوظيفة الفريدة التي تؤديها البلاستيدات الخضراء؟',
        },
        options: [
          { en: 'Photosynthesis - converting sunlight to energy', ar: 'التمثيل الضوئي - تحويل ضوء الشمس إلى طاقة' },
          { en: 'Cell division', ar: 'انقسام الخلية' },
          { en: 'Waste removal', ar: 'إزالة النفايات' },
        ],
        correctAnswer: 0,
      },
      {
        id: 'ribosome-quiz',
        organelleId: 'ribosome',
        question: {
          en: 'What do ribosomes produce?',
          ar: 'ماذا تنتج الريبوسومات؟',
        },
        options: [
          { en: 'Lipids', ar: 'الدهون' },
          { en: 'Proteins', ar: 'البروتينات' },
          { en: 'DNA', ar: 'الحمض النووي' },
        ],
        correctAnswer: 1,
      },
      {
        id: 'vacuole-quiz',
        organelleId: 'vacuole',
        question: {
          en: 'In which type of cell are vacuoles typically larger?',
          ar: 'في أي نوع من الخلايا تكون الفجوات أكبر عادة؟',
        },
        options: [
          { en: 'Animal cells', ar: 'الخلايا الحيوانية' },
          { en: 'Plant cells', ar: 'الخلايا النباتية' },
          { en: 'Both are the same size', ar: 'كلاهما بنفس الحجم' },
        ],
        correctAnswer: 1,
      },
      {
        id: 'cell-wall-quiz',
        organelleId: 'cell-wall',
        question: {
          en: 'Which type of cell has a cell wall?',
          ar: 'أي نوع من الخلايا لديه جدار خلوي؟',
        },
        options: [
          { en: 'Only animal cells', ar: 'الخلايا الحيوانية فقط' },
          { en: 'Only plant cells', ar: 'الخلايا النباتية فقط' },
          { en: 'Both plant and animal cells', ar: 'الخلايا النباتية والحيوانية' },
        ],
        correctAnswer: 1,
      },
    ],
    []
  );

  // Handle organelle click
  const handleOrganelleClick = useCallback((organelle: any) => {
    setSelectedOrganelleId(organelle.id);
  }, []);

  // Handle quiz answer
  const handleQuizAnswer = useCallback(
    (quizId: string, answerIndex: number, correctAnswer: number) => {
      if (answerIndex === correctAnswer && !answeredQuizIds.includes(quizId)) {
        setAnsweredQuizIds((prev) => [...prev, quizId]);
      }
    },
    [answeredQuizIds]
  );

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Calculate progress
  const completionPercentage = useMemo(() => {
    // Only count quizzes for current cell type
    const relevantQuizzes = quizQuestions.filter((q) => {
      if (q.organelleId === 'chloroplast' || q.organelleId === 'cell-wall') {
        return cellType === 'plant';
      }
      return true;
    });
    const answeredRelevant = answeredQuizIds.filter((id) =>
      relevantQuizzes.some((q) => q.id === id)
    );
    return Math.round((answeredRelevant.length / relevantQuizzes.length) * 100);
  }, [answeredQuizIds.length, quizQuestions, cellType, answeredQuizIds]);

  // Get organelle data dynamically imported
  const [organellesData, setOrganellesData] = useState<any[]>([]);

  // Load organelles data
  useMemo(() => {
    import('@/components/vr/experiences/CellScene').then((mod) => {
      setOrganellesData(mod.ORGANELLES_DATA);
    });
  }, []);

  const selectedOrganelle = selectedOrganelleId
    ? organellesData.find((o) => o.id === selectedOrganelleId)
    : null;

  const selectedQuiz =
    selectedOrganelleId
      ? quizQuestions.find((q) => q.organelleId === selectedOrganelleId)
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Back button */}
            <Link href="/vr-eduverse/science">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'رجوع' : 'Back'}
              </Button>
            </Link>

            {/* Title */}
            <div className="flex-1 text-center">
              <h1 className="text-lg md:text-xl font-bold">
                {language === 'ar' ? 'الخلية البشرية' : 'Human Cell'}
              </h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Microscope className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">
                  {language === 'ar' ? 'علم الأحياء' : 'Biology'}
                </span>
                <span className="text-xs text-gray-600">•</span>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    cellType === 'animal'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-green-500 text-green-400'
                  }`}
                >
                  {cellType === 'animal'
                    ? language === 'ar'
                      ? 'خلية حيوانية'
                      : 'Animal Cell'
                    : language === 'ar'
                    ? 'خلية نباتية'
                    : 'Plant Cell'}
                </Badge>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-400">
                <Award className="w-3 h-3 mr-1" />
                {answeredQuizIds.length}/{quizQuestions.filter((q) => {
                  if (q.organelleId === 'chloroplast' || q.organelleId === 'cell-wall') {
                    return cellType === 'plant';
                  }
                  return true;
                }).length}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main VR Canvas */}
      <div className="fixed inset-0 pt-16">
        <VRCanvas
          mode="3d"
          backgroundColor="#001a0a"
          fov={75}
          far={1000}
        >
          <CellScene
            language={language}
            cellType={cellType}
            onOrganelleClick={handleOrganelleClick}
            cutawayAngle={cutawayAngle}
          />
        </VRCanvas>
      </div>

      {/* Control Panel */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <Card className="bg-gray-900/95 backdrop-blur-sm border-gray-700 shadow-2xl">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="text-gray-300 hover:text-white"
                title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
              >
                <Languages className="w-4 h-4" />
              </Button>

              {/* Cell Type Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCellType(cellType === 'animal' ? 'plant' : 'animal');
                  setSelectedOrganelleId(null);
                }}
                className={`${
                  cellType === 'plant' ? 'text-green-400' : 'text-blue-400'
                } hover:text-white`}
                title={
                  language === 'ar'
                    ? cellType === 'animal'
                      ? 'التبديل إلى خلية نباتية'
                      : 'التبديل إلى خلية حيوانية'
                    : cellType === 'animal'
                    ? 'Switch to Plant Cell'
                    : 'Switch to Animal Cell'
                }
              >
                <FlipHorizontal className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-gray-700" />

              {/* Cutaway Angle Control */}
              <div className="flex items-center gap-1 px-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={cutawayAngle}
                  onChange={(e) => setCutawayAngle(Number(e.target.value))}
                  className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  title={language === 'ar' ? 'زاوية القطع' : 'Cutaway Angle'}
                />
              </div>

              <div className="w-px h-6 bg-gray-700" />

              {/* Help */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                className="text-gray-300 hover:text-white"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-gray-300 hover:text-white"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="fixed top-20 right-6 z-50 max-w-sm">
          <Card className="bg-gray-900/95 backdrop-blur-sm border-gray-700 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">
                  {language === 'ar' ? 'المساعدة' : 'Help'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-white h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <div>
                  <strong>{language === 'ar' ? '🖱️ الفأرة:' : '🖱️ Mouse:'}</strong>
                  <br />
                  {language === 'ar'
                    ? 'اسحب للدوران، عجلة التمرير للتكبير'
                    : 'Drag to rotate, scroll to zoom'}
                </div>
                <div>
                  <strong>{language === 'ar' ? '🖐️ النقر:' : '🖐️ Click:'}</strong>
                  <br />
                  {language === 'ar'
                    ? 'انقر على العضيات للحصول على المعلومات'
                    : 'Click organelles for information'}
                </div>
                <div>
                  <strong>{language === 'ar' ? '👁️ القطع:' : '👁️ Cutaway:'}</strong>
                  <br />
                  {language === 'ar'
                    ? 'استخدم الشريط لضبط زاوية القطع'
                    : 'Use slider to adjust cutaway angle'}
                </div>
                <div>
                  <strong>{language === 'ar' ? '🔄 التبديل:' : '🔄 Switch:'}</strong>
                  <br />
                  {language === 'ar'
                    ? 'بدّل بين الخلايا الحيوانية والنباتية'
                    : 'Toggle between animal and plant cells'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Organelle Info Panel */}
      {selectedOrganelle && (
        <div className="fixed top-20 left-6 z-50 max-w-md">
          <Card className="bg-gray-900/95 backdrop-blur-sm border-gray-700 shadow-2xl">
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">
                    {selectedOrganelle.name[language]}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedOrganelle.description[language]}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrganelleId(null)}
                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Function */}
              <div className="mb-4 p-3 bg-green-900/20 rounded-lg border border-green-800/30">
                <div className="text-xs text-green-400 font-semibold mb-1">
                  {language === 'ar' ? 'الوظيفة' : 'Function'}
                </div>
                <div className="text-sm text-gray-300">
                  {selectedOrganelle.function[language]}
                </div>
              </div>

              {/* Facts */}
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-semibold text-green-400 mb-2">
                  {language === 'ar' ? 'حقائق مثيرة:' : 'Interesting Facts:'}
                </h3>
                {selectedOrganelle.facts.map((fact: any, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span className="text-gray-300">{fact[language]}</span>
                  </div>
                ))}
              </div>

              {/* Cell Type Info */}
              <div className="mb-4 flex gap-2">
                {selectedOrganelle.inAnimalCell && (
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    {language === 'ar' ? 'خلية حيوانية' : 'Animal Cell'}
                  </Badge>
                )}
                {selectedOrganelle.inPlantCell && (
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    {language === 'ar' ? 'خلية نباتية' : 'Plant Cell'}
                  </Badge>
                )}
              </div>

              {/* Quiz Section */}
              {selectedQuiz && (
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold">
                      {language === 'ar' ? 'اختبر معلوماتك' : 'Test Your Knowledge'}
                    </h3>
                  </div>

                  {answeredQuizIds.includes(selectedQuiz.id) ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 p-3 rounded-lg">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>
                        {language === 'ar' ? 'إجابة صحيحة!' : 'Correct answer!'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm mb-3">{selectedQuiz.question[language]}</p>
                      <div className="space-y-2">
                        {selectedQuiz.options.map((option: any, index: number) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="w-full justify-start text-left border-gray-700 hover:border-green-500 hover:bg-green-900/20"
                            onClick={() =>
                              handleQuizAnswer(
                                selectedQuiz.id,
                                index,
                                selectedQuiz.correctAnswer
                              )
                            }
                          >
                            {option[language]}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completion Badge */}
      {completionPercentage === 100 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-green-500 shadow-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <Award className="w-8 h-8 text-white" />
              <div>
                <h3 className="font-bold text-white">
                  {language === 'ar' ? 'مبروك!' : 'Congratulations!'}
                </h3>
                <p className="text-sm text-green-100">
                  {language === 'ar'
                    ? 'لقد أكملت جميع الأسئلة!'
                    : "You've completed all quizzes!"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
