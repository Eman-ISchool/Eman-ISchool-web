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
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Languages,
  HelpCircle,
  CheckCircle2,
  X,
  Telescope,
  Scale,
} from 'lucide-react';
import type { VRLanguage } from '@/types/vr';

// Dynamically import VR components to avoid SSR issues
const VRCanvas = dynamic(
  () => import('@/components/vr/canvas/VRCanvas').then((mod) => mod.VRCanvas),
  { ssr: false }
);

const SolarSystemScene = dynamic(
  () =>
    import('@/components/vr/experiences/SolarSystemScene').then(
      (mod) => mod.SolarSystemScene
    ),
  { ssr: false }
);

/**
 * Solar System VR Experience Page
 *
 * Interactive 3D visualization of the solar system with all 8 planets,
 * orbital animations, and educational information.
 */
export default function SolarSystemPage() {
  const [language, setLanguage] = useState<VRLanguage>('ar');
  const [selectedPlanetIndex, setSelectedPlanetIndex] = useState<number | null>(null);
  const [answeredQuizIds, setAnsweredQuizIds] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [realisticScale, setRealisticScale] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Quiz questions for each planet
  const quizQuestions = useMemo(
    () => [
      {
        id: 'mercury-quiz',
        planetIndex: 0,
        question: {
          en: 'Which planet is closest to the Sun?',
          ar: 'أي كوكب هو الأقرب إلى الشمس؟',
        },
        options: [
          { en: 'Mercury', ar: 'عطارد' },
          { en: 'Venus', ar: 'الزهرة' },
          { en: 'Mars', ar: 'المريخ' },
        ],
        correctAnswer: 0,
      },
      {
        id: 'venus-quiz',
        planetIndex: 1,
        question: {
          en: 'Which planet is the hottest in the solar system?',
          ar: 'أي كوكب هو الأسخن في النظام الشمسي؟',
        },
        options: [
          { en: 'Mercury', ar: 'عطارد' },
          { en: 'Venus', ar: 'الزهرة' },
          { en: 'Mars', ar: 'المريخ' },
        ],
        correctAnswer: 1,
      },
      {
        id: 'jupiter-quiz',
        planetIndex: 4,
        question: {
          en: 'Which planet is the largest in the solar system?',
          ar: 'أي كوكب هو الأكبر في النظام الشمسي؟',
        },
        options: [
          { en: 'Saturn', ar: 'زحل' },
          { en: 'Jupiter', ar: 'المشتري' },
          { en: 'Uranus', ar: 'أورانوس' },
        ],
        correctAnswer: 1,
      },
      {
        id: 'saturn-quiz',
        planetIndex: 5,
        question: {
          en: 'Which planet has the most spectacular ring system?',
          ar: 'أي كوكب لديه أروع نظام حلقات؟',
        },
        options: [
          { en: 'Jupiter', ar: 'المشتري' },
          { en: 'Saturn', ar: 'زحل' },
          { en: 'Uranus', ar: 'أورانوس' },
        ],
        correctAnswer: 1,
      },
    ],
    []
  );

  // Handle planet click
  const handlePlanetClick = useCallback((planet: any, index: number) => {
    setSelectedPlanetIndex(index);
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
    return Math.round((answeredQuizIds.length / quizQuestions.length) * 100);
  }, [answeredQuizIds.length, quizQuestions.length]);

  // Get planet data dynamically imported
  const [planetsData, setPlanetsData] = useState<any[]>([]);

  // Load planets data
  useMemo(() => {
    import('@/components/vr/experiences/SolarSystemScene').then((mod) => {
      setPlanetsData(mod.PLANETS_DATA);
    });
  }, []);

  const selectedPlanet = selectedPlanetIndex !== null ? planetsData[selectedPlanetIndex] : null;
  const selectedQuiz =
    selectedPlanetIndex !== null
      ? quizQuestions.find((q) => q.planetIndex === selectedPlanetIndex)
      : null;

  return (
    <div className="min-h-screen bg-black text-white">
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
                {language === 'ar' ? 'النظام الشمسي' : 'Solar System'}
              </h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Telescope className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">
                  {language === 'ar' ? 'علم الفلك' : 'Astronomy'}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                <Award className="w-3 h-3 mr-1" />
                {answeredQuizIds.length}/{quizQuestions.length}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main VR Canvas */}
      <div className="fixed inset-0 pt-16">
        <VRCanvas
          mode="3d"
          backgroundColor="#000000"
          fov={60}
          far={2000}
        >
          <SolarSystemScene
            language={language}
            onPlanetClick={handlePlanetClick}
            realisticScale={realisticScale}
            animationSpeed={isPaused ? 0 : animationSpeed}
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

              {/* Scale Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRealisticScale(!realisticScale)}
                className={`${
                  realisticScale ? 'text-blue-400' : 'text-gray-300'
                } hover:text-white`}
                title={
                  language === 'ar'
                    ? realisticScale
                      ? 'عرض للمشاهدة'
                      : 'مقياس واقعي'
                    : realisticScale
                    ? 'Viewable Scale'
                    : 'Realistic Scale'
                }
              >
                <Scale className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-gray-700" />

              {/* Animation Control */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className="text-gray-300 hover:text-white"
                title={language === 'ar' ? (isPaused ? 'تشغيل' : 'إيقاف') : isPaused ? 'Play' : 'Pause'}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>

              {/* Speed Control */}
              <div className="flex items-center gap-1 px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAnimationSpeed(Math.max(0.1, animationSpeed - 0.5))}
                  className="text-gray-300 hover:text-white h-7 w-7 p-0"
                  disabled={isPaused}
                >
                  -
                </Button>
                <span className="text-xs text-gray-400 w-12 text-center">
                  {animationSpeed.toFixed(1)}x
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAnimationSpeed(Math.min(5, animationSpeed + 0.5))}
                  className="text-gray-300 hover:text-white h-7 w-7 p-0"
                  disabled={isPaused}
                >
                  +
                </Button>
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
                    ? 'انقر على الكواكب للحصول على المعلومات'
                    : 'Click planets for information'}
                </div>
                <div>
                  <strong>{language === 'ar' ? '⚖️ المقياس:' : '⚖️ Scale:'}</strong>
                  <br />
                  {language === 'ar'
                    ? 'بدّل بين المقياس الواقعي والمقياس القابل للعرض'
                    : 'Toggle between realistic and viewable scale'}
                </div>
                <div>
                  <strong>{language === 'ar' ? '⏯️ التحكم:' : '⏯️ Controls:'}</strong>
                  <br />
                  {language === 'ar'
                    ? 'أوقف/شغّل الحركة، اضبط السرعة'
                    : 'Pause/play animation, adjust speed'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Planet Info Panel */}
      {selectedPlanet && (
        <div className="fixed top-20 left-6 z-50 max-w-md">
          <Card className="bg-gray-900/95 backdrop-blur-sm border-gray-700 shadow-2xl">
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">
                    {selectedPlanet.name[language]}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedPlanet.description[language]}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlanetIndex(null)}
                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Planet Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-400 mb-1">
                    {language === 'ar' ? 'المسافة من الشمس' : 'Distance from Sun'}
                  </div>
                  <div className="text-sm font-semibold">
                    {selectedPlanet.distanceFromSunAU.toFixed(2)} AU
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">
                    {language === 'ar' ? 'القطر' : 'Diameter'}
                  </div>
                  <div className="text-sm font-semibold">
                    {(selectedPlanet.radiusKm * 2).toLocaleString()} km
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">
                    {language === 'ar' ? 'السنة' : 'Year'}
                  </div>
                  <div className="text-sm font-semibold">
                    {selectedPlanet.orbitalPeriodDays.toLocaleString()}{' '}
                    {language === 'ar' ? 'يوم' : 'days'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">
                    {language === 'ar' ? 'الأقمار' : 'Moons'}
                  </div>
                  <div className="text-sm font-semibold">{selectedPlanet.moons}</div>
                </div>
              </div>

              {/* Facts */}
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-semibold text-blue-400 mb-2">
                  {language === 'ar' ? 'حقائق مثيرة:' : 'Interesting Facts:'}
                </h3>
                {selectedPlanet.facts.map((fact: any, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span className="text-gray-300">{fact[language]}</span>
                  </div>
                ))}
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
                            className="w-full justify-start text-left border-gray-700 hover:border-blue-500 hover:bg-blue-900/20"
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
          <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-500 shadow-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <Award className="w-8 h-8 text-white" />
              <div>
                <h3 className="font-bold text-white">
                  {language === 'ar' ? 'مبروك!' : 'Congratulations!'}
                </h3>
                <p className="text-sm text-yellow-100">
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
