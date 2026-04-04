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
  Mountain,
  Maximize2,
  Minimize2,
  Compass,
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
const VRHotspots = dynamic(() => import('@/components/vr/hotspots/VRHotspots').then(m => m.VRHotspots), { ssr: false });
const VRSceneComponent = dynamic(() => import('@/components/vr/scenes/VRScene').then(m => m.VRScene), { ssr: false });
const VRNavigation = dynamic(() => import('@/components/vr/ui/VRNavigation').then(m => m.VRNavigation), { ssr: false });

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
 * Abu Simbel Temples VR Experience Page
 *
 * Immersive VR field trip to the Abu Simbel temples with multiple scenes,
 * educational hotspots about Ramesses II, temple relocation, and sun alignment.
 */
export default function AbuSimbelPage() {
  const [language, setLanguage] = useState<VRLanguage>('ar');
  const [currentSceneId, setCurrentSceneId] = useState('great-temple-facade');
  const [activeInfoHotspot, setActiveInfoHotspot] = useState<InfoHotspot | null>(null);
  const [activeQuizHotspot, setActiveQuizHotspot] = useState<QuizHotspot | null>(null);
  const [answeredQuizIds, setAnsweredQuizIds] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visitedScenes, setVisitedScenes] = useState<string[]>(['great-temple-facade']);

  // Define the VR experience data
  const vrExperience: VRExperience = useMemo(() => ({
    id: 'abu-simbel',
    slug: 'abu-simbel',
    title: {
      en: 'Abu Simbel Temples',
      ar: 'معابد أبو سمبل',
    },
    description: {
      en: 'Visit the magnificent temples of Ramesses II, witness the colossal statues carved into the mountainside, and learn about the incredible UNESCO rescue mission that saved these monuments from flooding.',
      ar: 'زُر معابد رمسيس الثاني الرائعة، شاهد التماثيل الضخمة المنحوتة في الجبل، وتعلم عن مهمة الإنقاذ المذهلة من اليونسكو التي أنقذت هذه الآثار من الفيضان.',
    },
    category: 'field-trip',
    subject: 'Egyptian History',
    gradeLevel: ['5-6', '7-9', '10-12'],
    difficulty: 'intermediate',
    thumbnailUrl: 'https://placehold.co/800x600/cd853f/ffffff?text=Abu+Simbel',
    coverImageUrl: 'https://placehold.co/1200x600/cd853f/ffffff?text=Abu+Simbel',
    estimatedDuration: 25,
    scenes: [],
    initialSceneId: 'great-temple-facade',
    learningObjectives: [
      {
        en: 'Understand the reign and achievements of Ramesses II',
        ar: 'فهم عهد وإنجازات رمسيس الثاني',
      },
      {
        en: 'Learn about the temple relocation project',
        ar: 'التعرف على مشروع نقل المعبد',
      },
      {
        en: 'Discover the sun alignment phenomenon',
        ar: 'اكتشاف ظاهرة محاذاة الشمس',
      },
    ],
    keywords: ['abu-simbel', 'ramesses-ii', 'nubia', 'unesco', 'temples'],
    isPublished: true,
    publishedAt: '2026-01-12T00:00:00Z',
    createdAt: '2026-01-12T00:00:00Z',
    updatedAt: '2026-01-12T00:00:00Z',
  }), []);

  // Define scenes with hotspots
  const scenes: VRScene[] = useMemo(() => [
    {
      id: 'great-temple-facade',
      title: {
        en: 'Great Temple - Facade',
        ar: 'المعبد الكبير - الواجهة',
      },
      description: {
        en: 'Four colossal statues of Ramesses II guard the entrance to the Great Temple',
        ar: 'أربعة تماثيل ضخمة لرمسيس الثاني تحرس مدخل المعبد الكبير',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/d2691e/ffffff?text=Great+Temple+Facade',
      thumbnailUrl: 'https://placehold.co/400x300/d2691e/ffffff?text=Facade',
      hotspots: [
        {
          id: 'info-colossal-statues',
          type: 'info',
          position: { x: 0, y: 8, z: -20 },
          title: {
            en: 'The Four Colossi',
            ar: 'التماثيل الأربعة الضخمة',
          },
          description: {
            en: 'Learn about the massive statues',
            ar: 'تعرف على التماثيل الضخمة',
          },
          content: {
            title: {
              en: 'Four Colossal Statues of Ramesses II',
              ar: 'أربعة تماثيل ضخمة لرمسيس الثاني',
            },
            description: {
              en: 'The facade of the Great Temple features four colossal seated statues of Ramesses II, each measuring approximately 20 meters (66 feet) in height. The statues depict the pharaoh wearing the double crown of Upper and Lower Egypt, seated on his throne. Each statue was carved directly from the rock face of the mountain. Between and beside the statues are smaller figures representing members of the royal family. The sheer scale of these monuments was designed to inspire awe and demonstrate the pharaoh\'s divine power and eternal presence.',
              ar: 'تتميز واجهة المعبد الكبير بأربعة تماثيل جالسة ضخمة لرمسيس الثاني، يبلغ ارتفاع كل منها حوالي 20 متراً (66 قدماً). تصور التماثيل الفرعون وهو يرتدي التاج المزدوج لمصر العليا والسفلى، جالساً على عرشه. تم نحت كل تمثال مباشرة من صخور الجبل. بين التماثيل وبجانبها تماثيل أصغر تمثل أفراد العائلة الملكية. تم تصميم الحجم الهائل لهذه الآثار لإلهام الرهبة وإظهار القوة الإلهية للفرعون ووجوده الأبدي.',
            },
            imageUrl: 'https://placehold.co/600x400/a0522d/ffffff?text=Colossi',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-ramesses-ii',
          type: 'info',
          position: { x: -10, y: 5, z: -15 },
          title: {
            en: 'Ramesses II',
            ar: 'رمسيس الثاني',
          },
          description: {
            en: 'Learn about the great pharaoh',
            ar: 'تعرف على الفرعون العظيم',
          },
          content: {
            title: {
              en: 'Ramesses II: Egypt\'s Greatest Pharaoh',
              ar: 'رمسيس الثاني: أعظم فراعنة مصر',
            },
            description: {
              en: 'Ramesses II, also known as Ramesses the Great, ruled Egypt for 66 years (1279–1213 BCE) during the 19th Dynasty. He is considered one of ancient Egypt\'s most powerful and celebrated pharaohs. His reign was marked by extensive building programs, military campaigns (including the famous Battle of Kadesh), and unprecedented prosperity. He fathered over 100 children and lived to approximately 90 years old. Ramesses II built more temples, monuments, and colossal statues than any other pharaoh. Abu Simbel stands as his grandest achievement and a testament to his ego and ambition.',
              ar: 'رمسيس الثاني، المعروف أيضاً باسم رمسيس الأكبر، حكم مصر لمدة 66 عاماً (1279-1213 قبل الميلاد) خلال الأسرة التاسعة عشرة. يعتبر من أقوى وأشهر فراعنة مصر القديمة. تميز عهده ببرامج بناء واسعة النطاق، وحملات عسكرية (بما في ذلك معركة قادش الشهيرة)، وازدهار غير مسبوق. أنجب أكثر من 100 طفل وعاش حتى 90 عاماً تقريباً. بنى رمسيس الثاني معابد ونصب تذكارية وتماثيل ضخمة أكثر من أي فرعون آخر. تقف أبو سمبل كأعظم إنجازاته وشاهد على طموحه وثقته بنفسه.',
            },
            imageUrl: 'https://placehold.co/600x400/daa520/ffffff?text=Ramesses+II',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-temple-purpose',
          type: 'info',
          position: { x: 10, y: 4, z: -12 },
          title: {
            en: 'Temple Purpose',
            ar: 'غرض المعبد',
          },
          description: {
            en: 'Why was this temple built?',
            ar: 'لماذا تم بناء هذا المعبد؟',
          },
          content: {
            title: {
              en: 'Purpose and Construction',
              ar: 'الغرض والبناء',
            },
            description: {
              en: 'Abu Simbel was constructed around 1264 BCE to commemorate Ramesses II\'s victory at the Battle of Kadesh and to intimidate Egypt\'s southern neighbors in Nubia. The temple was dedicated to the gods Amun, Ra-Horakhty, and Ptah, as well as the deified Ramesses himself. Construction took approximately 20 years and required carving the entire temple complex from a solid sandstone cliff. The temple\'s location in Nubia (southern Egypt) served as a powerful statement of Egyptian dominance in the region. It was both a religious center and a political monument.',
              ar: 'تم بناء أبو سمبل حوالي 1264 قبل الميلاد لإحياء ذكرى انتصار رمسيس الثاني في معركة قادش ولترهيب جيران مصر الجنوبيين في النوبة. كُرس المعبد للآلهة آمون ورع حور آختي وبتاح، بالإضافة إلى رمسيس نفسه المؤله. استغرق البناء حوالي 20 عاماً واحتاج نحت مجمع المعبد بأكمله من منحدر من الحجر الرملي الصلب. كان موقع المعبد في النوبة (جنوب مصر) بمثابة بيان قوي للهيمنة المصرية في المنطقة. كان المعبد مركزاً دينياً ونصباً سياسياً في آن واحد.',
            },
            imageUrl: 'https://placehold.co/600x400/cd853f/ffffff?text=Temple+Purpose',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-temple-interior',
          type: 'navigation',
          position: { x: 0, y: 2, z: -18 },
          title: {
            en: 'Enter the Temple',
            ar: 'ادخل إلى المعبد',
          },
          description: {
            en: 'Explore the hypostyle hall',
            ar: 'استكشف قاعة الأعمدة',
          },
          targetSceneId: 'great-temple-interior',
          previewImageUrl: 'https://placehold.co/400x300/8b4513/ffffff?text=Interior',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'nav-small-temple',
          type: 'navigation',
          position: { x: 15, y: 3, z: -10 },
          title: {
            en: 'Small Temple',
            ar: 'المعبد الصغير',
          },
          description: {
            en: 'Visit the Temple of Hathor',
            ar: 'زُر معبد حتحور',
          },
          targetSceneId: 'small-temple',
          previewImageUrl: 'https://placehold.co/400x300/daa520/ffffff?text=Small+Temple',
          transitionDuration: 1500,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'quiz-ramesses-facts',
          type: 'quiz',
          position: { x: -12, y: 6, z: -15 },
          title: {
            en: 'Ramesses Quiz',
            ar: 'اختبار رمسيس',
          },
          description: {
            en: 'Test your knowledge',
            ar: 'اختبر معرفتك',
          },
          question: {
            en: 'How long did Ramesses II rule Egypt?',
            ar: 'كم عاماً حكم رمسيس الثاني مصر؟',
          },
          options: [
            {
              id: 'opt-1',
              text: { en: '20 years', ar: '20 عاماً' },
              isCorrect: false,
            },
            {
              id: 'opt-2',
              text: { en: '40 years', ar: '40 عاماً' },
              isCorrect: false,
            },
            {
              id: 'opt-3',
              text: { en: '66 years', ar: '66 عاماً' },
              isCorrect: true,
            },
            {
              id: 'opt-4',
              text: { en: '90 years', ar: '90 عاماً' },
              isCorrect: false,
            },
          ],
          explanation: {
            en: 'Ramesses II ruled Egypt for an impressive 66 years (1279–1213 BCE), one of the longest reigns in Egyptian history.',
            ar: 'حكم رمسيس الثاني مصر لمدة 66 عاماً مذهلة (1279-1213 قبل الميلاد)، أحد أطول فترات الحكم في التاريخ المصري.',
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
        ambientIntensity: 0.9,
        ambientColor: '#fffaf0',
        directionalIntensity: 1.2,
        directionalColor: '#ffa500',
        directionalPosition: { x: 10, y: 20, z: 10 },
      },
    },
    {
      id: 'great-temple-interior',
      title: {
        en: 'Hypostyle Hall',
        ar: 'قاعة الأعمدة',
      },
      description: {
        en: 'The grand hall with eight colossal statues of Ramesses as Osiris',
        ar: 'القاعة الكبرى بثمانية تماثيل ضخمة لرمسيس كأوزوريس',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/8b4513/ffffff?text=Hypostyle+Hall',
      thumbnailUrl: 'https://placehold.co/400x300/8b4513/ffffff?text=Hall',
      hotspots: [
        {
          id: 'info-hypostyle-hall',
          type: 'info',
          position: { x: 0, y: 3, z: -10 },
          title: {
            en: 'The Great Hall',
            ar: 'القاعة الكبرى',
          },
          content: {
            title: {
              en: 'Hypostyle Hall Architecture',
              ar: 'عمارة قاعة الأعمدة',
            },
            description: {
              en: 'The hypostyle hall is the first chamber inside the Great Temple. It features eight massive pillars, each adorned with a 10-meter-tall statue of Ramesses II depicted as Osiris, the god of the afterlife. The ceiling is decorated with vultures representing the goddess Nekhbet. The walls are covered with detailed reliefs showing Ramesses II in various military victories and religious ceremonies. The hall measures approximately 18 meters long and 16 meters wide. This grand space was designed to impress visitors with the pharaoh\'s power and divine status.',
              ar: 'قاعة الأعمدة هي الغرفة الأولى داخل المعبد الكبير. تحتوي على ثمانية أعمدة ضخمة، كل منها مزين بتمثال بطول 10 أمتار لرمسيس الثاني مصوراً كأوزوريس، إله الآخرة. السقف مزين بالنسور التي تمثل الإلهة نخبت. الجدران مغطاة بنقوش تفصيلية تظهر رمسيس الثاني في انتصارات عسكرية وحفلات دينية مختلفة. يبلغ طول القاعة حوالي 18 متراً وعرضها 16 متراً. صُممت هذه المساحة الكبيرة لإبهار الزوار بقوة الفرعون ومكانته الإلهية.',
            },
            imageUrl: 'https://placehold.co/600x400/a0522d/ffffff?text=Hall+Interior',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-reliefs',
          type: 'info',
          position: { x: -8, y: 4, z: -8 },
          title: {
            en: 'Wall Reliefs',
            ar: 'النقوش الجدارية',
          },
          content: {
            title: {
              en: 'Battle Scenes and Religious Ceremonies',
              ar: 'مشاهد المعارك والاحتفالات الدينية',
            },
            description: {
              en: 'The walls of the hypostyle hall are covered with intricate reliefs depicting key events from Ramesses II\'s reign. The most prominent scenes show the Battle of Kadesh (c. 1274 BCE), where Ramesses fought the Hittites - though the actual battle was a stalemate, the reliefs portray it as a great Egyptian victory. Other scenes show the pharaoh making offerings to various gods, receiving blessings, and subduing enemies. These reliefs served as propaganda, reinforcing Ramesses\' image as a warrior-king blessed by the gods and invincible in battle.',
              ar: 'جدران قاعة الأعمدة مغطاة بنقوش معقدة تصور الأحداث الرئيسية من عهد رمسيس الثاني. أبرز المشاهد تُظهر معركة قادش (حوالي 1274 قبل الميلاد)، حيث قاتل رمسيس الحيثيين - على الرغم من أن المعركة الفعلية كانت طريقاً مسدوداً، تصور النقوش المعركة كانتصار مصري عظيم. مشاهد أخرى تُظهر الفرعون يقدم القرابين لآلهة مختلفة، ويتلقى البركات، ويخضع الأعداء. خدمت هذه النقوش كدعاية، تعزز صورة رمسيس كملك محارب مبارك من الآلهة ولا يُقهر في المعركة.',
            },
            imageUrl: 'https://placehold.co/600x400/cd853f/ffffff?text=Wall+Reliefs',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-sanctuary',
          type: 'navigation',
          position: { x: 0, y: 2, z: -12 },
          title: {
            en: 'Inner Sanctuary',
            ar: 'القدس الداخلي',
          },
          description: {
            en: 'Visit the sacred chamber',
            ar: 'زُر الغرفة المقدسة',
          },
          targetSceneId: 'sanctuary',
          previewImageUrl: 'https://placehold.co/400x300/654321/ffffff?text=Sanctuary',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'nav-exit-temple',
          type: 'navigation',
          position: { x: 10, y: 2, z: -5 },
          title: {
            en: 'Exit Temple',
            ar: 'اخرج من المعبد',
          },
          description: {
            en: 'Return to facade',
            ar: 'العودة إلى الواجهة',
          },
          targetSceneId: 'great-temple-facade',
          previewImageUrl: 'https://placehold.co/400x300/d2691e/ffffff?text=Facade',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
      ],
      camera: {
        initialRotation: { x: 0, y: 0, z: 0 },
        enableZoom: true,
        zoomRange: { min: 1, max: 2.5 },
      },
      lighting: {
        ambientIntensity: 0.3,
        ambientColor: '#ffcc99',
        directionalIntensity: 0.4,
        directionalColor: '#ff9966',
        directionalPosition: { x: 0, y: 5, z: 5 },
      },
    },
    {
      id: 'sanctuary',
      title: {
        en: 'Inner Sanctuary',
        ar: 'القدس الداخلي',
      },
      description: {
        en: 'The sacred chamber where the sun alignment phenomenon occurs',
        ar: 'الغرفة المقدسة حيث تحدث ظاهرة محاذاة الشمس',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/4a3c28/ffffff?text=Sanctuary',
      thumbnailUrl: 'https://placehold.co/400x300/4a3c28/ffffff?text=Sanctuary',
      hotspots: [
        {
          id: 'info-four-statues',
          type: 'info',
          position: { x: 0, y: 2, z: -8 },
          title: {
            en: 'The Four Seated Gods',
            ar: 'الآلهة الأربعة الجالسين',
          },
          content: {
            title: {
              en: 'The Sacred Statues',
              ar: 'التماثيل المقدسة',
            },
            description: {
              en: 'The sanctuary, the innermost chamber of the temple, houses four seated statues carved from the rock. From left to right, they depict the gods Ptah, Amun-Ra, Ramesses II (deified), and Ra-Horakhty. These gods represent different aspects of Egyptian religion: Ptah (creator god of Memphis), Amun-Ra (king of gods), the deified pharaoh, and Ra-Horakhty (sun god). The chamber measures approximately 7 meters wide and 4 meters deep. This holy of holies was accessible only to the highest priests and the pharaoh himself.',
              ar: 'يضم القدس الداخلي، الغرفة الداخلية للمعبد، أربعة تماثيل جالسة منحوتة من الصخر. من اليسار إلى اليمين، تصور الآلهة بتاح، وآمون رع، ورمسيس الثاني (المؤله)، ورع حور آختي. تمثل هذه الآلهة جوانب مختلفة من الدين المصري: بتاح (إله الخلق في ممفيس)، آمون رع (ملك الآلهة)، الفرعون المؤله، ورع حور آختي (إله الشمس). يبلغ عرض الغرفة حوالي 7 أمتار وعمقها 4 أمتار. كان هذا القدس الأقداس متاحاً فقط لأعلى الكهنة والفرعون نفسه.',
            },
            imageUrl: 'https://placehold.co/600x400/5d4e37/ffffff?text=Four+Gods',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-sun-alignment',
          type: 'info',
          position: { x: -5, y: 3, z: -7 },
          title: {
            en: 'Sun Alignment',
            ar: 'محاذاة الشمس',
          },
          content: {
            title: {
              en: 'The Solar Phenomenon',
              ar: 'الظاهرة الشمسية',
            },
            description: {
              en: 'Twice a year, on February 22 and October 22, the first rays of the rising sun penetrate 65 meters through the temple\'s entrance and corridors to illuminate three of the four statues in the sanctuary. The sun lights up Amun-Ra, Ramesses II, and Ra-Horakhty, while Ptah (god of darkness) remains in shadow. These dates are believed to correspond to Ramesses II\'s birthday and coronation day. This astronomical precision demonstrates the ancient Egyptians\' advanced knowledge of astronomy and engineering. After the temple relocation, the dates shifted by one day to February 21 and October 21.',
              ar: 'مرتين في السنة، في 22 فبراير و22 أكتوبر، تخترق أشعة الشمس الأولى 65 متراً عبر مدخل المعبد والممرات لتضيء ثلاثة من التماثيل الأربعة في القدس الداخلي. تضيء الشمس آمون رع، ورمسيس الثاني، ورع حور آختي، بينما يبقى بتاح (إله الظلام) في الظل. يُعتقد أن هذه التواريخ تتوافق مع عيد ميلاد رمسيس الثاني ويوم تتويجه. تُظهر هذه الدقة الفلكية معرفة المصريين القدماء المتقدمة في علم الفلك والهندسة. بعد نقل المعبد، انتقلت التواريخ بيوم واحد إلى 21 فبراير و21 أكتوبر.',
            },
            imageUrl: 'https://placehold.co/600x400/ffa500/ffffff?text=Sun+Alignment',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-back-to-hall',
          type: 'navigation',
          position: { x: 5, y: 2, z: -5 },
          title: {
            en: 'Return to Hall',
            ar: 'العودة إلى القاعة',
          },
          description: {
            en: 'Go back to the hypostyle hall',
            ar: 'العودة إلى قاعة الأعمدة',
          },
          targetSceneId: 'great-temple-interior',
          previewImageUrl: 'https://placehold.co/400x300/8b4513/ffffff?text=Hall',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'quiz-sun-alignment',
          type: 'quiz',
          position: { x: -8, y: 3, z: -6 },
          title: {
            en: 'Sun Quiz',
            ar: 'اختبار الشمس',
          },
          question: {
            en: 'Which god remains in shadow during the sun alignment phenomenon?',
            ar: 'أي إله يبقى في الظل أثناء ظاهرة محاذاة الشمس؟',
          },
          options: [
            {
              id: 'opt-1',
              text: { en: 'Ptah', ar: 'بتاح' },
              isCorrect: true,
            },
            {
              id: 'opt-2',
              text: { en: 'Amun-Ra', ar: 'آمون رع' },
              isCorrect: false,
            },
            {
              id: 'opt-3',
              text: { en: 'Ramesses II', ar: 'رمسيس الثاني' },
              isCorrect: false,
            },
            {
              id: 'opt-4',
              text: { en: 'Ra-Horakhty', ar: 'رع حور آختي' },
              isCorrect: false,
            },
          ],
          explanation: {
            en: 'Ptah, the god of darkness and the underworld, remains in shadow while the other three statues are illuminated by the sun.',
            ar: 'يبقى بتاح، إله الظلام والعالم السفلي، في الظل بينما تضاء التماثيل الثلاثة الأخرى بأشعة الشمس.',
          },
          points: 10,
          color: '#eab308',
        } as QuizHotspot,
      ],
      camera: {
        initialRotation: { x: 0, y: 0, z: 0 },
        enableZoom: true,
        zoomRange: { min: 1, max: 2 },
      },
      lighting: {
        ambientIntensity: 0.2,
        ambientColor: '#ff9966',
        directionalIntensity: 0.6,
        directionalColor: '#ffa500',
        directionalPosition: { x: 0, y: 0, z: 10 },
      },
    },
    {
      id: 'small-temple',
      title: {
        en: 'Temple of Hathor',
        ar: 'معبد حتحور',
      },
      description: {
        en: 'The Small Temple dedicated to Queen Nefertari and the goddess Hathor',
        ar: 'المعبد الصغير المخصص للملكة نفرتاري والإلهة حتحور',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/daa520/ffffff?text=Small+Temple',
      thumbnailUrl: 'https://placehold.co/400x300/daa520/ffffff?text=Small+Temple',
      hotspots: [
        {
          id: 'info-nefertari-temple',
          type: 'info',
          position: { x: 0, y: 5, z: -15 },
          title: {
            en: 'Temple of Nefertari',
            ar: 'معبد نفرتاري',
          },
          content: {
            title: {
              en: 'The Small Temple Facade',
              ar: 'واجهة المعبد الصغير',
            },
            description: {
              en: 'Located 100 meters north of the Great Temple, the Small Temple is dedicated to the goddess Hathor and Queen Nefertari, Ramesses II\'s favorite wife. The facade features six standing colossal statues, each about 10 meters tall - four of Ramesses II and two of Nefertari. This is remarkable because royal wives were typically depicted at a much smaller scale. The equal size of Nefertari\'s statues alongside the pharaoh\'s demonstrates the queen\'s importance and the love Ramesses had for her. An inscription reads: "For whose sake the very sun does shine."',
              ar: 'يقع المعبد الصغير على بعد 100 متر شمال المعبد الكبير، وهو مخصص للإلهة حتحور والملكة نفرتاري، الزوجة المفضلة لرمسيس الثاني. تتميز الواجهة بستة تماثيل واقفة ضخمة، يبلغ ارتفاع كل منها حوالي 10 أمتار - أربعة لرمسيس الثاني واثنان لنفرتاري. هذا أمر ملحوظ لأن الزوجات الملكيات كانت تُصوَّر عادةً بحجم أصغر بكثير. يُظهر الحجم المتساوي لتماثيل نفرتاري إلى جانب تماثيل الفرعون أهمية الملكة والحب الذي كان رمسيس يكنه لها. نقش يقول: "التي من أجلها تشرق الشمس".',
            },
            imageUrl: 'https://placehold.co/600x400/d4af37/ffffff?text=Nefertari+Temple',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-nefertari',
          type: 'info',
          position: { x: -10, y: 4, z: -12 },
          title: {
            en: 'Queen Nefertari',
            ar: 'الملكة نفرتاري',
          },
          content: {
            title: {
              en: 'Nefertari: Great Royal Wife',
              ar: 'نفرتاري: الزوجة الملكية العظيمة',
            },
            description: {
              en: 'Nefertari Meritmut was the first and favorite wife of Ramesses II. Her name means "Beautiful Companion" and she held the titles of Great Royal Wife and Lady of the Two Lands. She played an important diplomatic role, corresponding with foreign queens and appearing alongside Ramesses in official ceremonies. Her tomb (QV66) in the Valley of the Queens is considered one of the most beautiful in all of Egypt, with stunning painted walls. The dedication of an entire temple to her at Abu Simbel was an unprecedented honor, demonstrating Ramesses\' devotion. She bore Ramesses several children before her death around year 24-25 of his reign.',
              ar: 'نفرتاري ميريت موت كانت الزوجة الأولى والمفضلة لرمسيس الثاني. اسمها يعني "الرفيقة الجميلة" وحملت ألقاب الزوجة الملكية العظيمة وسيدة الأرضين. لعبت دوراً دبلوماسياً مهماً، تراسلت مع ملكات أجنبيات وظهرت إلى جانب رمسيس في الاحتفالات الرسمية. تُعتبر مقبرتها (QV66) في وادي الملكات من أجمل المقابر في مصر كلها، بجدرانها المرسومة المذهلة. تكريس معبد كامل لها في أبو سمبل كان شرفاً غير مسبوق، يُظهر تفاني رمسيس. أنجبت نفرتاري لرمسيس عدة أطفال قبل وفاتها حوالي العام 24-25 من حكمه.',
            },
            imageUrl: 'https://placehold.co/600x400/ff69b4/ffffff?text=Nefertari',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-hathor',
          type: 'info',
          position: { x: 10, y: 4, z: -10 },
          title: {
            en: 'Goddess Hathor',
            ar: 'الإلهة حتحور',
          },
          content: {
            title: {
              en: 'Hathor: Goddess of Love and Music',
              ar: 'حتحور: إلهة الحب والموسيقى',
            },
            description: {
              en: 'Hathor was one of ancient Egypt\'s most important goddesses, associated with love, beauty, music, dance, fertility, and joy. She was often depicted as a cow or as a woman with cow\'s ears. Hathor was believed to be the mother of the pharaoh and played a protective role. Inside the Small Temple, reliefs show Nefertari making offerings to Hathor and being embraced by the goddess. The temple\'s dedication to both Hathor and Nefertari suggests the queen\'s identification with the goddess. Hathor\'s sacred musical instrument, the sistrum, appears frequently in the temple decorations.',
              ar: 'كانت حتحور واحدة من أهم الإلهات في مصر القديمة، مرتبطة بالحب والجمال والموسيقى والرقص والخصوبة والفرح. غالباً ما كانت تُصوَّر كبقرة أو كامرأة بأذني بقرة. كان يُعتقد أن حتحور أم الفرعون ولعبت دوراً وقائياً. داخل المعبد الصغير، تُظهر النقوش نفرتاري تقدم القرابين لحتحور وتُحتضن من قبل الإلهة. يشير تكريس المعبد لكل من حتحور ونفرتاري إلى تماهي الملكة مع الإلهة. يظهر آلة حتحور الموسيقية المقدسة، السيستروم، بشكل متكرر في زخارف المعبد.',
            },
            imageUrl: 'https://placehold.co/600x400/98d8c8/ffffff?text=Hathor',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-temples-overview',
          type: 'navigation',
          position: { x: 0, y: 2, z: -12 },
          title: {
            en: 'Temples Overview',
            ar: 'نظرة عامة على المعابد',
          },
          description: {
            en: 'View both temples',
            ar: 'شاهد كلا المعبدين',
          },
          targetSceneId: 'temples-overview',
          previewImageUrl: 'https://placehold.co/400x300/cd853f/ffffff?text=Overview',
          transitionDuration: 1500,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'quiz-nefertari',
          type: 'quiz',
          position: { x: -12, y: 5, z: -10 },
          title: {
            en: 'Nefertari Quiz',
            ar: 'اختبار نفرتاري',
          },
          question: {
            en: 'What was unique about Nefertari\'s statues at Abu Simbel?',
            ar: 'ما الذي كان فريداً في تماثيل نفرتاري في أبو سمبل؟',
          },
          options: [
            {
              id: 'opt-1',
              text: { en: 'They were made of gold', ar: 'كانت مصنوعة من الذهب' },
              isCorrect: false,
            },
            {
              id: 'opt-2',
              text: { en: 'They were the same size as the pharaoh\'s', ar: 'كانت بنفس حجم تماثيل الفرعون' },
              isCorrect: true,
            },
            {
              id: 'opt-3',
              text: { en: 'They were larger than the pharaoh\'s', ar: 'كانت أكبر من تماثيل الفرعون' },
              isCorrect: false,
            },
            {
              id: 'opt-4',
              text: { en: 'They were painted in color', ar: 'كانت ملونة' },
              isCorrect: false,
            },
          ],
          explanation: {
            en: 'Nefertari\'s statues are the same size as Ramesses II\'s, which was unprecedented. Royal wives were typically shown much smaller.',
            ar: 'تماثيل نفرتاري بنفس حجم تماثيل رمسيس الثاني، وهو أمر غير مسبوق. عادة ما كانت الزوجات الملكيات تُظهر بحجم أصغر بكثير.',
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
        ambientColor: '#fffaf0',
        directionalIntensity: 1.0,
        directionalColor: '#ffd700',
        directionalPosition: { x: 10, y: 15, z: 10 },
      },
    },
    {
      id: 'temples-overview',
      title: {
        en: 'Abu Simbel Complex',
        ar: 'مجمع أبو سمبل',
      },
      description: {
        en: 'Panoramic view of both the Great Temple and the Small Temple',
        ar: 'منظر بانورامي للمعبد الكبير والمعبد الصغير',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/cd853f/ffffff?text=Both+Temples',
      thumbnailUrl: 'https://placehold.co/400x300/cd853f/ffffff?text=Overview',
      hotspots: [
        {
          id: 'info-relocation',
          type: 'info',
          position: { x: 0, y: 6, z: -20 },
          title: {
            en: 'Temple Relocation',
            ar: 'نقل المعبد',
          },
          content: {
            title: {
              en: 'UNESCO\'s Rescue Mission',
              ar: 'مهمة الإنقاذ من اليونسكو',
            },
            description: {
              en: 'In the 1960s, the construction of the Aswan High Dam threatened to submerge Abu Simbel under the waters of Lake Nasser. Between 1964 and 1968, UNESCO coordinated an international effort to save the temples. The entire temple complex was carefully cut into large blocks (averaging 30 tons each), moved to higher ground 65 meters above and 200 meters back from the original location, and reassembled. The project cost approximately $40 million (about $300 million today) and involved engineers from 50 countries. It remains one of the greatest feats of archaeological engineering and sparked the modern movement for heritage preservation.',
              ar: 'في ستينيات القرن العشرين، هدد بناء السد العالي بأسوان بغمر أبو سمبل تحت مياه بحيرة ناصر. بين عامي 1964 و1968، نسقت اليونسكو جهداً دولياً لإنقاذ المعابد. تم قطع مجمع المعبد بأكمله بعناية إلى كتل كبيرة (متوسط 30 طناً لكل منها)، ونقلها إلى أرض مرتفعة 65 متراً أعلى و200 متر للخلف من الموقع الأصلي، وإعادة تجميعها. كلف المشروع حوالي 40 مليون دولار (حوالي 300 مليون دولار اليوم) وشارك فيه مهندسون من 50 دولة. يبقى أحد أعظم الإنجازات الهندسية الأثرية وأطلق الحركة الحديثة للحفاظ على التراث.',
            },
            imageUrl: 'https://placehold.co/600x400/4682b4/ffffff?text=Relocation',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-location',
          type: 'info',
          position: { x: -12, y: 5, z: -15 },
          title: {
            en: 'Location & Access',
            ar: 'الموقع والوصول',
          },
          content: {
            title: {
              en: 'Abu Simbel in Nubia',
              ar: 'أبو سمبل في النوبة',
            },
            description: {
              en: 'Abu Simbel is located in southern Egypt, about 230 km (140 miles) southwest of Aswan, near the border with Sudan. The site is in ancient Nubia, a region that was important to Egypt for trade, gold, and military campaigns. The temples face east towards the Nile (now Lake Nasser) and the rising sun. The remote location made the temples relatively unknown to the outside world until Swiss explorer Johann Ludwig Burckhardt rediscovered them in 1813. Italian explorer Giovanni Belzoni first entered the Great Temple in 1817 after clearing sand from the entrance.',
              ar: 'تقع أبو سمبل في جنوب مصر، على بعد حوالي 230 كم (140 ميلاً) جنوب غرب أسوان، بالقرب من الحدود مع السودان. يقع الموقع في النوبة القديمة، وهي منطقة كانت مهمة لمصر للتجارة والذهب والحملات العسكرية. تواجه المعابد الشرق نحو النيل (الآن بحيرة ناصر) والشمس المشرقة. جعل الموقع النائي المعابد غير معروفة نسبياً للعالم الخارجي حتى أعاد المستكشف السويسري يوهان لودفيج بوركهارت اكتشافها في عام 1813. دخل المستكشف الإيطالي جيوفاني بيلزوني المعبد الكبير لأول مرة في عام 1817 بعد إزالة الرمال من المدخل.',
            },
            imageUrl: 'https://placehold.co/600x400/6b8e23/ffffff?text=Location+Map',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-preservation',
          type: 'info',
          position: { x: 12, y: 4, z: -12 },
          title: {
            en: 'Modern Preservation',
            ar: 'الحفظ الحديث',
          },
          content: {
            title: {
              en: 'Ongoing Conservation',
              ar: 'الحفظ المستمر',
            },
            description: {
              en: 'Abu Simbel is now a UNESCO World Heritage Site and one of Egypt\'s most popular tourist destinations, visited by thousands of people annually. Modern conservation efforts focus on protecting the sandstone from weathering, managing tourist impact, and monitoring structural stability. The relocation created an artificial mountain with a concrete dome above the temples. Sensors monitor temperature, humidity, and structural movement. The site hosts annual Sun Festival celebrations on February 21-22 and October 21-22, attracting visitors worldwide to witness the solar alignment. These efforts ensure that future generations can continue to experience Ramesses II\'s magnificent legacy.',
              ar: 'أبو سمبل الآن موقع تراث عالمي لليونسكو وواحدة من أشهر الوجهات السياحية في مصر، يزورها آلاف الأشخاص سنوياً. تركز جهود الحفاظ الحديثة على حماية الحجر الرملي من التجوية، وإدارة تأثير السياحة، ومراقبة الاستقرار الهيكلي. أنشأ النقل جبلاً صناعياً بقبة خرسانية فوق المعابد. تراقب أجهزة الاستشعار درجة الحرارة والرطوبة والحركة الهيكلية. يستضيف الموقع احتفالات مهرجان الشمس السنوية في 21-22 فبراير و21-22 أكتوبر، تجذب زوار من جميع أنحاء العالم لمشاهدة محاذاة الشمس. تضمن هذه الجهود أن الأجيال القادمة يمكن أن تستمر في تجربة إرث رمسيس الثاني الرائع.',
            },
            imageUrl: 'https://placehold.co/600x400/228b22/ffffff?text=Conservation',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-great-temple',
          type: 'navigation',
          position: { x: -8, y: 2, z: -10 },
          title: {
            en: 'Great Temple',
            ar: 'المعبد الكبير',
          },
          description: {
            en: 'Visit the Great Temple',
            ar: 'زُر المعبد الكبير',
          },
          targetSceneId: 'great-temple-facade',
          previewImageUrl: 'https://placehold.co/400x300/d2691e/ffffff?text=Great+Temple',
          transitionDuration: 1500,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'nav-small-temple-return',
          type: 'navigation',
          position: { x: 8, y: 2, z: -10 },
          title: {
            en: 'Small Temple',
            ar: 'المعبد الصغير',
          },
          description: {
            en: 'Visit the Small Temple',
            ar: 'زُر المعبد الصغير',
          },
          targetSceneId: 'small-temple',
          previewImageUrl: 'https://placehold.co/400x300/daa520/ffffff?text=Small+Temple',
          transitionDuration: 1500,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'quiz-relocation',
          type: 'quiz',
          position: { x: 0, y: 4, z: -15 },
          title: {
            en: 'Relocation Quiz',
            ar: 'اختبار النقل',
          },
          question: {
            en: 'Why were the Abu Simbel temples relocated in the 1960s?',
            ar: 'لماذا تم نقل معابد أبو سمبل في ستينيات القرن العشرين؟',
          },
          options: [
            {
              id: 'opt-1',
              text: { en: 'To protect them from tourists', ar: 'لحمايتها من السياح' },
              isCorrect: false,
            },
            {
              id: 'opt-2',
              text: { en: 'To save them from flooding by Lake Nasser', ar: 'لإنقاذها من فيضان بحيرة ناصر' },
              isCorrect: true,
            },
            {
              id: 'opt-3',
              text: { en: 'To restore them to their original condition', ar: 'لاستعادتها إلى حالتها الأصلية' },
              isCorrect: false,
            },
            {
              id: 'opt-4',
              text: { en: 'To move them closer to Cairo', ar: 'لنقلها أقرب إلى القاهرة' },
              isCorrect: false,
            },
          ],
          explanation: {
            en: 'The temples were relocated to save them from being submerged by Lake Nasser, created by the construction of the Aswan High Dam.',
            ar: 'تم نقل المعابد لإنقاذها من الغمر ببحيرة ناصر، التي نشأت عن بناء السد العالي بأسوان.',
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
        ambientIntensity: 0.9,
        ambientColor: '#fffaf0',
        directionalIntensity: 1.2,
        directionalColor: '#ffa500',
        directionalPosition: { x: 10, y: 20, z: 10 },
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
              <Mountain className="w-6 h-6 text-amber-600" />
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
              className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
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
                        : 'border-gray-200 hover:border-amber-600 hover:bg-amber-50'
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
