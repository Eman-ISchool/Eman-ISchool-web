'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  X,
  Volume2,
  VolumeX,
  Info,
  BookOpen,
  Award,
  Clock,
  MapPin,
  Compass,
  Pyramid,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type {
  VRExperience,
  VRScene,
  InfoHotspot,
  NavigationHotspot,
  QuizHotspot,
  VRLanguage,
  AnyHotspot,
} from '@/types/vr';
import { VRHotspots } from '@/components/vr/hotspots/VRHotspots';
import { VRScene as VRSceneComponent } from '@/components/vr/scenes/VRScene';
import { VRNavigation } from '@/components/vr/ui/VRNavigation';

// Dynamically import VR components to avoid SSR issues
const VRCanvas = dynamic(
  () => import('@/components/vr/canvas/VRCanvas').then((mod) => mod.VRCanvas),
  { ssr: false }
);

const VRInfoPanel = dynamic(
  () => import('@/components/vr/ui/VRInfoPanel').then((mod) => mod.VRInfoPanel),
  { ssr: false }
);

/**
 * Pyramids of Giza VR Experience Page
 *
 * Immersive VR field trip to the Pyramids of Giza with multiple scenes,
 * educational hotspots, and interactive quizzes.
 */
export default function PyramidsOfGizaPage() {
  const [language, setLanguage] = useState<VRLanguage>('ar');
  const [currentSceneId, setCurrentSceneId] = useState('great-pyramid-exterior');
  const [activeInfoHotspot, setActiveInfoHotspot] = useState<InfoHotspot | null>(null);
  const [activeQuizHotspot, setActiveQuizHotspot] = useState<QuizHotspot | null>(null);
  const [answeredQuizIds, setAnsweredQuizIds] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visitedScenes, setVisitedScenes] = useState<string[]>(['great-pyramid-exterior']);

  // Define the VR experience data
  const vrExperience: VRExperience = useMemo(() => ({
    id: 'pyramids-of-giza',
    slug: 'pyramids-of-giza',
    title: {
      en: 'Pyramids of Giza',
      ar: 'أهرامات الجيزة',
    },
    description: {
      en: 'Experience the grandeur of the Great Pyramid, explore the Sphinx, and learn about ancient Egyptian civilization through immersive 360° views.',
      ar: 'اختبر عظمة الهرم الأكبر، واستكشف أبو الهول، وتعلم عن الحضارة المصرية القديمة من خلال مشاهد 360° غامرة.',
    },
    category: 'field-trip',
    subject: 'Egyptian History',
    gradeLevel: ['5-6', '7-9', '10-12'],
    difficulty: 'intermediate',
    thumbnailUrl: 'https://placehold.co/800x600/f59e0b/ffffff?text=Pyramids+of+Giza',
    coverImageUrl: 'https://placehold.co/1200x600/f59e0b/ffffff?text=Pyramids+of+Giza',
    estimatedDuration: 30,
    scenes: [],
    initialSceneId: 'great-pyramid-exterior',
    learningObjectives: [
      {
        en: 'Understand the construction techniques of the Great Pyramid',
        ar: 'فهم تقنيات بناء الهرم الأكبر',
      },
      {
        en: 'Learn about the pharaohs and their significance',
        ar: 'التعرف على الفراعنة وأهميتهم',
      },
      {
        en: 'Explore the cultural and religious beliefs of ancient Egypt',
        ar: 'استكشاف المعتقدات الثقافية والدينية لمصر القديمة',
      },
    ],
    keywords: ['pyramids', 'giza', 'egypt', 'pharaoh', 'sphinx', 'ancient'],
    isPublished: true,
    publishedAt: '2026-01-12T00:00:00Z',
    createdAt: '2026-01-12T00:00:00Z',
    updatedAt: '2026-01-12T00:00:00Z',
  }), []);

  // Define scenes with hotspots
  const scenes: VRScene[] = useMemo(() => [
    {
      id: 'great-pyramid-exterior',
      title: {
        en: 'Great Pyramid - Exterior View',
        ar: 'الهرم الأكبر - المنظر الخارجي',
      },
      description: {
        en: 'Stand before the Great Pyramid of Khufu, the largest of the three pyramids',
        ar: 'قف أمام هرم خوفو الأكبر، أكبر الأهرامات الثلاثة',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/d4a574/ffffff?text=Great+Pyramid+Exterior',
      thumbnailUrl: 'https://placehold.co/400x300/d4a574/ffffff?text=Great+Pyramid',
      hotspots: [
        {
          id: 'info-pyramid-construction',
          type: 'info',
          position: { x: -10, y: 5, z: -20 },
          title: {
            en: 'Construction Techniques',
            ar: 'تقنيات البناء',
          },
          description: {
            en: 'Learn how ancient Egyptians built this wonder',
            ar: 'تعرف على كيفية بناء المصريين القدماء لهذه الأعجوبة',
          },
          content: {
            title: {
              en: 'How Were the Pyramids Built?',
              ar: 'كيف تم بناء الأهرامات؟',
            },
            description: {
              en: 'The Great Pyramid was built using approximately 2.3 million stone blocks, each weighing between 2.5 to 15 tons. Ancient Egyptians used copper tools, wooden sledges, and ramps to move and position these massive stones. The precision of construction is remarkable - the base is level to within 2.1 cm, and the sides are aligned to the cardinal directions with incredible accuracy. It took an estimated 20 years and 100,000 workers to complete.',
              ar: 'تم بناء الهرم الأكبر باستخدام حوالي 2.3 مليون كتلة حجرية، يتراوح وزن كل منها بين 2.5 إلى 15 طناً. استخدم المصريون القدماء أدوات نحاسية، وزلاجات خشبية، ومنحدرات لنقل وتحريك هذه الأحجار الضخمة. دقة البناء ملحوظة - القاعدة مستوية في حدود 2.1 سم، والجوانب محاذية للاتجاهات الأصلية بدقة مذهلة. استغرق البناء حوالي 20 عاماً و100,000 عامل.',
            },
            imageUrl: 'https://placehold.co/600x400/8b7355/ffffff?text=Construction',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-khufu',
          type: 'info',
          position: { x: 5, y: 8, z: -15 },
          title: {
            en: 'Pharaoh Khufu',
            ar: 'الفرعون خوفو',
          },
          description: {
            en: 'Learn about the pharaoh who commissioned this pyramid',
            ar: 'تعرف على الفرعون الذي أمر ببناء هذا الهرم',
          },
          content: {
            title: {
              en: 'Khufu: The Great Builder',
              ar: 'خوفو: البناء العظيم',
            },
            description: {
              en: 'Khufu (also known as Cheops) was the second pharaoh of the Fourth Dynasty of Egypt, ruling around 2589–2566 BCE. He is best known for commissioning the Great Pyramid at Giza, which served as his tomb and eternal resting place. The pyramid was originally 146.6 meters (481 feet) tall, making it the tallest man-made structure for over 3,800 years. Khufu\'s reign marked a golden age of pyramid construction and Egyptian civilization.',
              ar: 'خوفو (المعروف أيضاً باسم شيوبس) كان الفرعون الثاني من الأسرة الرابعة لمصر، حكم حوالي 2589-2566 قبل الميلاد. اشتهر ببناء الهرم الأكبر في الجيزة، الذي كان بمثابة مقبرته ومكان راحته الأبدية. كان ارتفاع الهرم في الأصل 146.6 متراً (481 قدماً)، مما جعله أطول بناء من صنع الإنسان لأكثر من 3,800 عام. يمثل عهد خوفو عصراً ذهبياً لبناء الأهرامات والحضارة المصرية.',
            },
            imageUrl: 'https://placehold.co/600x400/d4af37/ffffff?text=Khufu',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-pyramid-interior',
          type: 'navigation',
          position: { x: 0, y: 2, z: -25 },
          title: {
            en: 'Enter the Pyramid',
            ar: 'ادخل إلى الهرم',
          },
          description: {
            en: 'Explore the King\'s Chamber inside',
            ar: 'استكشف حجرة الملك بالداخل',
          },
          targetSceneId: 'great-pyramid-interior',
          previewImageUrl: 'https://placehold.co/400x300/4a4a4a/ffffff?text=Interior',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'nav-sphinx',
          type: 'navigation',
          position: { x: 15, y: 3, z: -10 },
          title: {
            en: 'Visit the Sphinx',
            ar: 'زُر أبو الهول',
          },
          description: {
            en: 'Explore the Great Sphinx',
            ar: 'استكشف أبو الهول العظيم',
          },
          targetSceneId: 'great-sphinx',
          previewImageUrl: 'https://placehold.co/400x300/c19a6b/ffffff?text=Sphinx',
          transitionDuration: 1500,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'quiz-pyramid-facts',
          type: 'quiz',
          position: { x: -15, y: 4, z: -12 },
          title: {
            en: 'Test Your Knowledge',
            ar: 'اختبر معرفتك',
          },
          description: {
            en: 'Quiz about the Great Pyramid',
            ar: 'اختبار عن الهرم الأكبر',
          },
          question: {
            en: 'How many stone blocks were used to build the Great Pyramid?',
            ar: 'كم عدد الكتل الحجرية المستخدمة في بناء الهرم الأكبر؟',
          },
          options: [
            {
              id: 'opt-1',
              text: { en: 'About 500,000 blocks', ar: 'حوالي 500,000 كتلة' },
              isCorrect: false,
            },
            {
              id: 'opt-2',
              text: { en: 'About 2.3 million blocks', ar: 'حوالي 2.3 مليون كتلة' },
              isCorrect: true,
            },
            {
              id: 'opt-3',
              text: { en: 'About 10 million blocks', ar: 'حوالي 10 مليون كتلة' },
              isCorrect: false,
            },
            {
              id: 'opt-4',
              text: { en: 'About 1 million blocks', ar: 'حوالي 1 مليون كتلة' },
              isCorrect: false,
            },
          ],
          explanation: {
            en: 'The Great Pyramid was built using approximately 2.3 million stone blocks, each weighing between 2.5 to 15 tons.',
            ar: 'تم بناء الهرم الأكبر باستخدام حوالي 2.3 مليون كتلة حجرية، يتراوح وزن كل منها بين 2.5 إلى 15 طناً.',
          },
          points: 10,
          color: '#eab308',
        } as QuizHotspot,
      ],
      camera: {
        initialRotation: { x: 0, y: 0, z: 0 },
        minPolarAngle: Math.PI / 6,
        maxPolarAngle: (5 * Math.PI) / 6,
        enableZoom: true,
        zoomRange: { min: 1, max: 3 },
      },
      lighting: {
        ambientIntensity: 0.8,
        ambientColor: '#ffffff',
        directionalIntensity: 1.0,
        directionalColor: '#ffd700',
        directionalPosition: { x: 10, y: 20, z: 10 },
      },
    },
    {
      id: 'great-pyramid-interior',
      title: {
        en: 'King\'s Chamber',
        ar: 'حجرة الملك',
      },
      description: {
        en: 'Inside the Great Pyramid - the King\'s Chamber',
        ar: 'داخل الهرم الأكبر - حجرة الملك',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/3a3a3a/ffffff?text=Kings+Chamber',
      thumbnailUrl: 'https://placehold.co/400x300/3a3a3a/ffffff?text=Interior',
      hotspots: [
        {
          id: 'info-kings-chamber',
          type: 'info',
          position: { x: 0, y: 3, z: -10 },
          title: {
            en: 'The King\'s Chamber',
            ar: 'حجرة الملك',
          },
          content: {
            title: {
              en: 'Inside the King\'s Chamber',
              ar: 'داخل حجرة الملك',
            },
            description: {
              en: 'The King\'s Chamber is located at the heart of the Great Pyramid. It measures approximately 10.5 meters (34 ft) from east to west and 5.2 meters (17 ft) from north to south. The chamber is entirely lined with red granite from Aswan. The sarcophagus of Pharaoh Khufu was originally placed here, though it was found empty when the chamber was first entered in modern times. The chamber features five relieving chambers above it to distribute the immense weight of the pyramid.',
              ar: 'تقع حجرة الملك في قلب الهرم الأكبر. تبلغ أبعادها حوالي 10.5 متر (34 قدماً) من الشرق إلى الغرب و5.2 متر (17 قدماً) من الشمال إلى الجنوب. الحجرة مبطنة بالكامل بالجرانيت الأحمر من أسوان. كان تابوت الفرعون خوفو موضوعاً هنا في الأصل، على الرغم من أنه وُجد فارغاً عندما دخلت الحجرة لأول مرة في العصر الحديث. تحتوي الحجرة على خمس غرف للتخفيف فوقها لتوزيع الوزن الهائل للهرم.',
            },
            imageUrl: 'https://placehold.co/600x400/8b4513/ffffff?text=Chamber',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-sarcophagus',
          type: 'info',
          position: { x: 5, y: 1, z: -8 },
          title: {
            en: 'The Sarcophagus',
            ar: 'التابوت',
          },
          content: {
            title: {
              en: 'Khufu\'s Sarcophagus',
              ar: 'تابوت خوفو',
            },
            description: {
              en: 'The red granite sarcophagus in the King\'s Chamber is plain and unadorned, unlike the elaborate coffins found in later tombs. It is slightly larger than the entrance passage, meaning it must have been placed in the chamber during construction. The sarcophagus shows signs of damage, possibly from ancient tomb robbers. Its simple design reflects the Old Kingdom\'s focus on the pyramid itself as the primary monument.',
              ar: 'تابوت الجرانيت الأحمر في حجرة الملك بسيط وغير مزخرف، على عكس التوابيت المزخرفة الموجودة في المقابر اللاحقة. حجمه أكبر قليلاً من ممر الدخول، مما يعني أنه تم وضعه في الحجرة أثناء البناء. يظهر التابوت علامات تلف، ربما من لصوص المقابر القدماء. يعكس تصميمه البسيط تركيز الدولة القديمة على الهرم نفسه باعتباره النصب التذكاري الرئيسي.',
            },
            imageUrl: 'https://placehold.co/600x400/654321/ffffff?text=Sarcophagus',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-exit-pyramid',
          type: 'navigation',
          position: { x: -10, y: 2, z: -5 },
          title: {
            en: 'Exit the Pyramid',
            ar: 'اخرج من الهرم',
          },
          description: {
            en: 'Return to exterior view',
            ar: 'العودة إلى المنظر الخارجي',
          },
          targetSceneId: 'great-pyramid-exterior',
          previewImageUrl: 'https://placehold.co/400x300/d4a574/ffffff?text=Exterior',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'nav-complex-overview',
          type: 'navigation',
          position: { x: 10, y: 2, z: -5 },
          title: {
            en: 'Pyramid Complex',
            ar: 'مجمع الأهرامات',
          },
          description: {
            en: 'View all three pyramids',
            ar: 'شاهد الأهرامات الثلاثة',
          },
          targetSceneId: 'pyramid-complex',
          previewImageUrl: 'https://placehold.co/400x300/d2b48c/ffffff?text=Complex',
          transitionDuration: 1500,
          color: '#8b5cf6',
        } as NavigationHotspot,
      ],
      camera: {
        initialRotation: { x: 0, y: 0, z: 0 },
        enableZoom: true,
        zoomRange: { min: 1, max: 2 },
      },
      lighting: {
        ambientIntensity: 0.4,
        ambientColor: '#ffcc99',
        directionalIntensity: 0.3,
        directionalColor: '#ff9966',
        directionalPosition: { x: 0, y: 5, z: 0 },
      },
    },
    {
      id: 'great-sphinx',
      title: {
        en: 'The Great Sphinx',
        ar: 'أبو الهول العظيم',
      },
      description: {
        en: 'Face to face with the iconic Sphinx of Giza',
        ar: 'وجهاً لوجه مع أبو الهول الشهير في الجيزة',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/c19a6b/ffffff?text=Great+Sphinx',
      thumbnailUrl: 'https://placehold.co/400x300/c19a6b/ffffff?text=Sphinx',
      hotspots: [
        {
          id: 'info-sphinx-history',
          type: 'info',
          position: { x: 0, y: 5, z: -20 },
          title: {
            en: 'The Sphinx',
            ar: 'أبو الهول',
          },
          content: {
            title: {
              en: 'The Great Sphinx of Giza',
              ar: 'أبو الهول العظيم في الجيزة',
            },
            description: {
              en: 'The Great Sphinx is a limestone statue of a reclining sphinx with the head of a pharaoh and the body of a lion. It is 73 meters (240 ft) long and 20 meters (66 ft) high. Most scholars believe it was built during the reign of Pharaoh Khafre (c. 2558–2532 BCE) and that the face represents him. The Sphinx has become one of the most recognizable symbols of ancient Egypt. It was carved from a single ridge of limestone and has endured millennia of erosion.',
              ar: 'أبو الهول العظيم هو تمثال من الحجر الجيري لأبو الهول الجالس برأس فرعون وجسم أسد. يبلغ طوله 73 متراً (240 قدماً) وارتفاعه 20 متراً (66 قدماً). يعتقد معظم العلماء أنه تم بناؤه في عهد الفرعون خفرع (حوالي 2558-2532 قبل الميلاد) وأن الوجه يمثله. أصبح أبو الهول أحد أكثر رموز مصر القديمة شهرة. تم نحته من حافة واحدة من الحجر الجيري وتحمل آلاف السنين من التعرية.',
            },
            imageUrl: 'https://placehold.co/600x400/daa520/ffffff?text=Sphinx+Close',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-sphinx-mystery',
          type: 'info',
          position: { x: -8, y: 3, z: -15 },
          title: {
            en: 'Mysteries of the Sphinx',
            ar: 'أسرار أبو الهول',
          },
          content: {
            title: {
              en: 'Unsolved Mysteries',
              ar: 'الألغاز غير المحلولة',
            },
            description: {
              en: 'The Sphinx continues to puzzle archaeologists. Its exact age is debated, with some theories suggesting it may be older than the pyramids. The missing nose has sparked numerous theories - from natural erosion to deliberate destruction. There are also hidden chambers and tunnels beneath and around the Sphinx that haven\'t been fully explored. The Dream Stele between its paws tells the story of Pharaoh Thutmose IV\'s restoration of the monument.',
              ar: 'يواصل أبو الهول إحداث حيرة لعلماء الآثار. عمره الدقيق محل نقاش، حيث تشير بعض النظريات إلى أنه قد يكون أقدم من الأهرامات. الأنف المفقود أثار العديد من النظريات - من التعرية الطبيعية إلى التدمير المتعمد. هناك أيضاً غرف وأنفاق مخفية تحت وحول أبو الهول لم يتم استكشافها بالكامل. لوحة الحلم بين كفيه تروي قصة ترميم الفرعون تحتمس الرابع للنصب التذكاري.',
            },
            imageUrl: 'https://placehold.co/600x400/cd853f/ffffff?text=Mystery',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-pyramid-exterior',
          type: 'navigation',
          position: { x: 15, y: 3, z: -10 },
          title: {
            en: 'Return to Pyramid',
            ar: 'العودة إلى الهرم',
          },
          description: {
            en: 'Go back to the Great Pyramid',
            ar: 'العودة إلى الهرم الأكبر',
          },
          targetSceneId: 'great-pyramid-exterior',
          previewImageUrl: 'https://placehold.co/400x300/d4a574/ffffff?text=Pyramid',
          transitionDuration: 1500,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'quiz-sphinx',
          type: 'quiz',
          position: { x: -12, y: 4, z: -8 },
          title: {
            en: 'Sphinx Quiz',
            ar: 'اختبار أبو الهول',
          },
          question: {
            en: 'What does the Sphinx represent with its unique form?',
            ar: 'ماذا يمثل أبو الهول بشكله الفريد؟',
          },
          options: [
            {
              id: 'opt-1',
              text: { en: 'A pharaoh\'s head with a lion\'s body', ar: 'رأس فرعون مع جسم أسد' },
              isCorrect: true,
            },
            {
              id: 'opt-2',
              text: { en: 'A god\'s head with a bird\'s body', ar: 'رأس إله مع جسم طائر' },
              isCorrect: false,
            },
            {
              id: 'opt-3',
              text: { en: 'A lion\'s head with a human body', ar: 'رأس أسد مع جسم إنسان' },
              isCorrect: false,
            },
            {
              id: 'opt-4',
              text: { en: 'A bull\'s head with a lion\'s body', ar: 'رأس ثور مع جسم أسد' },
              isCorrect: false,
            },
          ],
          explanation: {
            en: 'The Sphinx combines the head of a pharaoh (likely Khafre) with the body of a lion, symbolizing royal power and divine strength.',
            ar: 'يجمع أبو الهول بين رأس فرعون (على الأرجح خفرع) وجسم أسد، مما يرمز إلى القوة الملكية والقوة الإلهية.',
          },
          points: 10,
          color: '#eab308',
        } as QuizHotspot,
      ],
      camera: {
        initialRotation: { x: 0, y: 0, z: 0 },
        minPolarAngle: Math.PI / 6,
        maxPolarAngle: (5 * Math.PI) / 6,
        enableZoom: true,
        zoomRange: { min: 1, max: 3 },
      },
      lighting: {
        ambientIntensity: 0.7,
        ambientColor: '#ffffcc',
        directionalIntensity: 0.9,
        directionalColor: '#ffa500',
        directionalPosition: { x: -10, y: 15, z: 10 },
      },
    },
    {
      id: 'pyramid-complex',
      title: {
        en: 'Pyramid Complex Overview',
        ar: 'نظرة عامة على مجمع الأهرامات',
      },
      description: {
        en: 'View of all three pyramids - Khufu, Khafre, and Menkaure',
        ar: 'منظر للأهرامات الثلاثة - خوفو، خفرع، ومنقرع',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/d2b48c/ffffff?text=Three+Pyramids',
      thumbnailUrl: 'https://placehold.co/400x300/d2b48c/ffffff?text=Complex',
      hotspots: [
        {
          id: 'info-three-pyramids',
          type: 'info',
          position: { x: 0, y: 8, z: -25 },
          title: {
            en: 'The Three Pyramids',
            ar: 'الأهرامات الثلاثة',
          },
          content: {
            title: {
              en: 'The Giza Pyramid Complex',
              ar: 'مجمع أهرامات الجيزة',
            },
            description: {
              en: 'The Giza pyramid complex consists of three main pyramids: the Great Pyramid of Khufu (Cheops), the Pyramid of Khafre (Chephren), and the Pyramid of Menkaure (Mykerinos). Built during Egypt\'s Fourth Dynasty (c. 2613–2494 BCE), they served as royal tombs. The complex also includes the Great Sphinx, several smaller pyramids for queens, causeways, valley temples, and boat pits. It represents the pinnacle of pyramid-building technology and remains one of the most important archaeological sites in the world.',
              ar: 'يتكون مجمع أهرامات الجيزة من ثلاثة أهرامات رئيسية: هرم خوفو الأكبر (شيوبس)، وهرم خفرع (خفرين)، وهرم منقرع (ميكرينوس). بُنيت خلال الأسرة الرابعة لمصر (حوالي 2613-2494 قبل الميلاد)، وكانت بمثابة مقابر ملكية. يشمل المجمع أيضاً أبو الهول العظيم، والعديد من الأهرامات الصغيرة للملكات، والطرق المرتفعة، ومعابد الوادي، وحفر القوارب. يمثل ذروة تكنولوجيا بناء الأهرامات ويبقى أحد أهم المواقع الأثرية في العالم.',
            },
            imageUrl: 'https://placehold.co/600x400/daa520/ffffff?text=Complex',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-khafre-pyramid',
          type: 'info',
          position: { x: -10, y: 6, z: -20 },
          title: {
            en: 'Pyramid of Khafre',
            ar: 'هرم خفرع',
          },
          content: {
            title: {
              en: 'The Second Pyramid',
              ar: 'الهرم الثاني',
            },
            description: {
              en: 'The Pyramid of Khafre is the second-largest pyramid at Giza. While slightly smaller than Khufu\'s pyramid (originally 143.5 meters tall), it appears taller because it sits on higher ground. Uniquely, it still retains some of its original smooth limestone casing at the top. Khafre was Khufu\'s son and ruled Egypt around 2558–2532 BCE. His pyramid complex includes the Valley Temple, where the famous diorite statue of Khafre was discovered.',
              ar: 'هرم خفرع هو ثاني أكبر هرم في الجيزة. على الرغم من أنه أصغر قليلاً من هرم خوفو (ارتفاعه الأصلي 143.5 متراً)، إلا أنه يبدو أطول لأنه يقع على أرض مرتفعة. بشكل فريد، لا يزال يحتفظ ببعض كسوته الحجرية الجيرية الملساء الأصلية في القمة. كان خفرع ابن خوفو وحكم مصر حوالي 2558-2532 قبل الميلاد. يشمل مجمع هرمه معبد الوادي، حيث تم اكتشاف تمثال خفرع الشهير من حجر الديوريت.',
            },
            imageUrl: 'https://placehold.co/600x400/b8860b/ffffff?text=Khafre',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-menkaure-pyramid',
          type: 'info',
          position: { x: 10, y: 5, z: -18 },
          title: {
            en: 'Pyramid of Menkaure',
            ar: 'هرم منقرع',
          },
          content: {
            title: {
              en: 'The Smallest Pyramid',
              ar: 'الهرم الأصغر',
            },
            description: {
              en: 'The Pyramid of Menkaure is the smallest of the three main pyramids at Giza, originally standing at 65.5 meters (215 ft) tall. Menkaure was the grandson of Khufu and ruled around 2532–2503 BCE. Despite its smaller size, it features some of the finest stonework. The lower portion was originally cased in costly red granite from Aswan, while the upper portion used white limestone. The pyramid\'s smaller scale may reflect changing economic conditions or religious beliefs in Egypt.',
              ar: 'هرم منقرع هو أصغر الأهرامات الثلاثة الرئيسية في الجيزة، كان يبلغ ارتفاعه الأصلي 65.5 متراً (215 قدماً). كان منقرع حفيد خوفو وحكم حوالي 2532-2503 قبل الميلاد. على الرغم من حجمه الأصغر، إلا أنه يتميز ببعض أفضل الأعمال الحجرية. كان الجزء السفلي مغطى في الأصل بالجرانيت الأحمر المكلف من أسوان، بينما استخدم الجزء العلوي الحجر الجيري الأبيض. قد يعكس حجم الهرم الأصغر تغيير الظروف الاقتصادية أو المعتقدات الدينية في مصر.',
            },
            imageUrl: 'https://placehold.co/600x400/a0522d/ffffff?text=Menkaure',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-solar-barque',
          type: 'navigation',
          position: { x: 15, y: 3, z: -12 },
          title: {
            en: 'Solar Barque Museum',
            ar: 'متحف مركب الشمس',
          },
          description: {
            en: 'See Khufu\'s solar boat',
            ar: 'شاهد مركب خوفو الشمسية',
          },
          targetSceneId: 'solar-barque',
          previewImageUrl: 'https://placehold.co/400x300/8b4513/ffffff?text=Boat',
          transitionDuration: 1500,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'quiz-pyramid-complex',
          type: 'quiz',
          position: { x: -15, y: 4, z: -15 },
          title: {
            en: 'Complex Quiz',
            ar: 'اختبار المجمع',
          },
          question: {
            en: 'Which pharaoh built the second (middle) pyramid at Giza?',
            ar: 'أي فرعون بنى الهرم الثاني (الأوسط) في الجيزة؟',
          },
          options: [
            {
              id: 'opt-1',
              text: { en: 'Khufu', ar: 'خوفو' },
              isCorrect: false,
            },
            {
              id: 'opt-2',
              text: { en: 'Khafre', ar: 'خفرع' },
              isCorrect: true,
            },
            {
              id: 'opt-3',
              text: { en: 'Menkaure', ar: 'منقرع' },
              isCorrect: false,
            },
            {
              id: 'opt-4',
              text: { en: 'Sneferu', ar: 'سنفرو' },
              isCorrect: false,
            },
          ],
          explanation: {
            en: 'Khafre, the son of Khufu, built the second pyramid at Giza. It still retains some of its original limestone casing at the top.',
            ar: 'خفرع، ابن خوفو، بنى الهرم الثاني في الجيزة. لا يزال يحتفظ ببعض كسوته الحجرية الجيرية الأصلية في القمة.',
          },
          points: 10,
          color: '#eab308',
        } as QuizHotspot,
      ],
      camera: {
        initialRotation: { x: 0, y: 0, z: 0 },
        minPolarAngle: Math.PI / 6,
        maxPolarAngle: (5 * Math.PI) / 6,
        enableZoom: true,
        zoomRange: { min: 1, max: 4 },
      },
      lighting: {
        ambientIntensity: 0.8,
        ambientColor: '#ffffff',
        directionalIntensity: 1.0,
        directionalColor: '#ffd700',
        directionalPosition: { x: 10, y: 20, z: 10 },
      },
    },
    {
      id: 'solar-barque',
      title: {
        en: 'Solar Barque Museum',
        ar: 'متحف مركب الشمس',
      },
      description: {
        en: 'Khufu\'s reconstructed solar boat',
        ar: 'مركب خوفو الشمسية المعاد تركيبها',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/8b4513/ffffff?text=Solar+Boat',
      thumbnailUrl: 'https://placehold.co/400x300/8b4513/ffffff?text=Boat',
      hotspots: [
        {
          id: 'info-solar-boat',
          type: 'info',
          position: { x: 0, y: 5, z: -15 },
          title: {
            en: 'The Solar Barque',
            ar: 'مركب الشمس',
          },
          content: {
            title: {
              en: 'Khufu\'s Solar Boat',
              ar: 'مركب خوفو الشمسية',
            },
            description: {
              en: 'This magnificent cedar wood boat was discovered in 1954, buried in a sealed pit at the base of the Great Pyramid. It is 43.6 meters (143 ft) long and was meticulously reconstructed from 1,224 pieces. Ancient Egyptians believed the pharaoh needed this boat to sail across the heavens with the sun god Ra in the afterlife. The boat may have also been used in Khufu\'s funeral procession before being dismantled and buried. Its excellent preservation provides invaluable insights into ancient Egyptian boat-building techniques.',
              ar: 'تم اكتشاف هذا المركب الرائع من خشب الأرز في عام 1954، مدفوناً في حفرة مغلقة عند قاعدة الهرم الأكبر. يبلغ طوله 43.6 متراً (143 قدماً) وأعيد تركيبه بدقة من 1,224 قطعة. اعتقد المصريون القدماء أن الفرعون يحتاج إلى هذا المركب للإبحار عبر السماوات مع إله الشمس رع في الآخرة. ربما تم استخدام المركب أيضاً في موكب جنازة خوفو قبل تفكيكه ودفنه. توفر حالة حفظه الممتازة رؤى لا تقدر بثمن حول تقنيات بناء القوارب المصرية القديمة.',
            },
            imageUrl: 'https://placehold.co/600x400/cd853f/ffffff?text=Boat+Detail',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-afterlife-beliefs',
          type: 'info',
          position: { x: -8, y: 4, z: -12 },
          title: {
            en: 'Journey to Afterlife',
            ar: 'رحلة إلى الآخرة',
          },
          content: {
            title: {
              en: 'Ancient Egyptian Afterlife Beliefs',
              ar: 'معتقدات الآخرة المصرية القديمة',
            },
            description: {
              en: 'Ancient Egyptians had complex beliefs about the afterlife. They believed the soul had multiple parts, including the Ka (life force) and Ba (personality). The pharaoh\'s journey to the afterlife required various tools and provisions, including boats for celestial navigation. The pyramid served as a stairway to heaven, and the solar boat allowed the pharaoh to join Ra\'s daily journey across the sky. These beliefs drove the massive investment in tomb construction and burial goods.',
              ar: 'كان لدى المصريين القدماء معتقدات معقدة حول الآخرة. اعتقدوا أن الروح لها أجزاء متعددة، بما في ذلك الكا (قوة الحياة) والبا (الشخصية). تطلبت رحلة الفرعون إلى الآخرة أدوات ومؤن مختلفة، بما في ذلك القوارب للملاحة السماوية. كان الهرم بمثابة درج إلى السماء، والمركب الشمسي سمح للفرعون بالانضمام إلى رحلة رع اليومية عبر السماء. دفعت هذه المعتقدات الاستثمار الضخم في بناء المقابر والسلع الجنائزية.',
            },
            imageUrl: 'https://placehold.co/600x400/daa520/ffffff?text=Afterlife',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-back-to-complex',
          type: 'navigation',
          position: { x: 10, y: 2, z: -10 },
          title: {
            en: 'Return to Complex',
            ar: 'العودة إلى المجمع',
          },
          description: {
            en: 'Go back to pyramid complex view',
            ar: 'العودة إلى منظر مجمع الأهرامات',
          },
          targetSceneId: 'pyramid-complex',
          previewImageUrl: 'https://placehold.co/400x300/d2b48c/ffffff?text=Complex',
          transitionDuration: 1500,
          color: '#8b5cf6',
        } as NavigationHotspot,
      ],
      camera: {
        initialRotation: { x: 0, y: 0, z: 0 },
        enableZoom: true,
        zoomRange: { min: 1, max: 3 },
      },
      lighting: {
        ambientIntensity: 0.7,
        ambientColor: '#fff8dc',
        directionalIntensity: 0.5,
        directionalColor: '#ffa500',
        directionalPosition: { x: 5, y: 10, z: 5 },
      },
    },
  ], []);

  // Get current scene
  const currentScene = useMemo(
    () => scenes.find((s) => s.id === currentSceneId) || scenes[0],
    [scenes, currentSceneId]
  );

  // Handle scene change
  const handleSceneChange = useCallback((sceneId: string) => {
    setCurrentSceneId(sceneId);
    setActiveInfoHotspot(null);
    setActiveQuizHotspot(null);

    // Track visited scenes
    if (!visitedScenes.includes(sceneId)) {
      setVisitedScenes((prev) => [...prev, sceneId]);
    }
  }, [visitedScenes]);

  // Handle hotspot click
  const handleHotspotClick = useCallback((hotspotId: string, hotspotType: string) => {
    // Hotspot interaction handled by parent component
  }, []);

  // Handle info hotspot
  const handleShowInfo = useCallback((hotspot: InfoHotspot) => {
    setActiveInfoHotspot(hotspot);
    setActiveQuizHotspot(null);
  }, []);

  // Handle quiz hotspot
  const handleShowQuiz = useCallback((hotspot: QuizHotspot) => {
    setActiveQuizHotspot(hotspot);
    setActiveInfoHotspot(null);
  }, []);

  // Handle quiz answer
  const handleQuizAnswer = useCallback((optionId: string) => {
    if (!activeQuizHotspot) return;

    const selectedOption = activeQuizHotspot.options.find((opt) => opt.id === optionId);
    if (!selectedOption) return;

    setQuizAnswers((prev) => ({
      ...prev,
      [activeQuizHotspot.id]: optionId,
    }));

    if (selectedOption.isCorrect && !answeredQuizIds.includes(activeQuizHotspot.id)) {
      setAnsweredQuizIds((prev) => [...prev, activeQuizHotspot.id]);
    }
  }, [activeQuizHotspot, answeredQuizIds]);

  // Handle navigation
  const handleNavigate = useCallback((targetSceneId: string) => {
    handleSceneChange(targetSceneId);
  }, [handleSceneChange]);

  // Handle exit
  const handleExit = useCallback(() => {
    window.location.href = '/vr-eduverse/field-trips';
  }, []);

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
  const totalScenes = scenes.length;
  const totalQuizzes = scenes.reduce(
    (sum, scene) => sum + scene.hotspots.filter((h) => h.type === 'quiz').length,
    0
  );
  const progress = Math.round((visitedScenes.length / totalScenes) * 100);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/vr-eduverse/field-trips">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'رجوع' : 'Back'}
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Pyramid className="w-6 h-6 text-amber-400" />
              <div>
                <h1 className="text-white font-bold text-lg">
                  {vrExperience.title[language]}
                </h1>
                <p className="text-gray-300 text-xs">{currentScene.title[language]}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="text-white hover:bg-white/20"
            >
              {language === 'ar' ? 'EN' : 'ع'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-7xl mx-auto mt-3">
          <div className="flex items-center gap-4 text-xs text-white">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>
                {visitedScenes.length}/{totalScenes} {language === 'ar' ? 'مشاهد' : 'scenes'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span>
                {answeredQuizIds.length}/{totalQuizzes} {language === 'ar' ? 'اختبارات' : 'quizzes'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>{progress}% {language === 'ar' ? 'مكتمل' : 'complete'}</span>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* VR Canvas */}
      <div className="w-full h-full">
        <VRCanvas mode="3d" enableXR={false}>
          <VRSceneComponent scene={currentScene} enableControls={true} isVRMode={false} />

          <VRHotspots
            hotspots={currentScene.hotspots as AnyHotspot[]}
            language={language}
            onClick={handleHotspotClick}
            onShowInfo={handleShowInfo}
            onNavigate={handleNavigate}
            onShowQuiz={handleShowQuiz}
            answeredQuizIds={answeredQuizIds}
          />

          {/* Info Panel */}
          {activeInfoHotspot && (
            <VRInfoPanel
              content={activeInfoHotspot.content}
              position={{ x: 0, y: 1.6, z: -2 }}
              width={2.5}
              isVisible={true}
              onClose={() => setActiveInfoHotspot(null)}
              language={language}
            />
          )}

          {/* Navigation Menu */}
          <VRNavigation
            scenes={scenes}
            currentSceneId={currentSceneId}
            onSceneChange={handleSceneChange}
            onExit={handleExit}
            language={language}
            position={{ x: -3, y: 2, z: -1 }}
            isOpen={showNavigation}
            onToggle={() => setShowNavigation(!showNavigation)}
          />
        </VRCanvas>
      </div>

      {/* Navigation Toggle Button */}
      <Button
        onClick={() => setShowNavigation(!showNavigation)}
        className="absolute bottom-4 left-4 z-10 bg-purple-600 hover:bg-purple-700"
      >
        <Compass className="w-4 h-4 mr-2" />
        {language === 'ar' ? 'التنقل' : 'Navigation'}
      </Button>

      {/* Info Panel Overlay */}
      {activeInfoHotspot && (
        <Card className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-10 bg-white/95 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-lg">{activeInfoHotspot.content.title[language]}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveInfoHotspot(null)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {activeInfoHotspot.content.imageUrl && (
              <img
                src={activeInfoHotspot.content.imageUrl}
                alt={activeInfoHotspot.content.title[language]}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
            )}
            <p className="text-sm text-gray-700 leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {activeInfoHotspot.content.description[language]}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quiz Overlay */}
      {activeQuizHotspot && (
        <Card className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-10 bg-white/95 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <Badge className="mb-2 bg-yellow-500">
                  {language === 'ar' ? 'اختبار' : 'Quiz'}
                </Badge>
                <h3 className="font-bold text-lg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {activeQuizHotspot.question[language]}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveQuizHotspot(null)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 mb-4">
              {activeQuizHotspot.options.map((option) => {
                const isSelected = quizAnswers[activeQuizHotspot.id] === option.id;
                const showResult = isSelected;
                const isCorrect = option.isCorrect;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleQuizAnswer(option.id)}
                    disabled={showResult}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      showResult
                        ? isCorrect
                          ? 'border-green-500 bg-green-50'
                          : isSelected
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                        : 'border-gray-200 hover:border-amber-400 hover:bg-amber-50'
                    }`}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {option.text[language]}
                  </button>
                );
              })}
            </div>

            {quizAnswers[activeQuizHotspot.id] && activeQuizHotspot.explanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  {activeQuizHotspot.explanation[language]}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Info */}
      <div className="absolute bottom-4 right-4 z-10 text-white text-xs bg-black/50 backdrop-blur px-3 py-2 rounded-lg">
        <Clock className="w-3 h-3 inline mr-1" />
        {language === 'ar' ? 'المدة المقدرة:' : 'Estimated Duration:'} {vrExperience.estimatedDuration}{' '}
        {language === 'ar' ? 'دقيقة' : 'min'}
      </div>
    </div>
  );
}
