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
  Building2,
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
 * Egyptian Museum VR Experience Page
 *
 * Immersive VR field trip to the Egyptian Museum with multiple gallery scenes,
 * educational hotspots about artifacts, and interactive quizzes.
 */
export default function EgyptianMuseumPage() {
  const [language, setLanguage] = useState<VRLanguage>('ar');
  const [currentSceneId, setCurrentSceneId] = useState('museum-entrance');
  const [activeInfoHotspot, setActiveInfoHotspot] = useState<InfoHotspot | null>(null);
  const [activeQuizHotspot, setActiveQuizHotspot] = useState<QuizHotspot | null>(null);
  const [answeredQuizIds, setAnsweredQuizIds] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visitedScenes, setVisitedScenes] = useState<string[]>(['museum-entrance']);

  // Define the VR experience data
  const vrExperience: VRExperience = useMemo(() => ({
    id: 'egyptian-museum',
    slug: 'egyptian-museum',
    title: {
      en: 'Egyptian Museum',
      ar: 'المتحف المصري',
    },
    description: {
      en: 'Take a virtual tour through the Egyptian Museum\'s iconic galleries. Discover Tutankhamun\'s treasures, royal mummies, and thousands of artifacts from Egypt\'s ancient past.',
      ar: 'قم بجولة افتراضية في قاعات المتحف المصري الشهيرة. اكتشف كنوز توت عنخ آمون، والمومياوات الملكية، وآلاف القطع الأثرية من ماضي مصر العريق.',
    },
    category: 'field-trip',
    subject: 'Egyptian History',
    gradeLevel: ['5-6', '7-9', '10-12'],
    difficulty: 'beginner',
    thumbnailUrl: 'https://placehold.co/800x600/ef4444/ffffff?text=Egyptian+Museum',
    coverImageUrl: 'https://placehold.co/1200x600/ef4444/ffffff?text=Egyptian+Museum',
    estimatedDuration: 25,
    scenes: [],
    initialSceneId: 'museum-entrance',
    learningObjectives: [
      {
        en: 'Explore major artifacts from ancient Egypt',
        ar: 'استكشاف القطع الأثرية الرئيسية من مصر القديمة',
      },
      {
        en: 'Learn about Tutankhamun and his treasures',
        ar: 'التعرف على توت عنخ آمون وكنوزه',
      },
      {
        en: 'Understand ancient Egyptian burial practices',
        ar: 'فهم ممارسات الدفن المصرية القديمة',
      },
    ],
    keywords: ['museum', 'tutankhamun', 'mummies', 'artifacts', 'cairo'],
    isPublished: true,
    publishedAt: '2026-01-12T00:00:00Z',
    createdAt: '2026-01-12T00:00:00Z',
    updatedAt: '2026-01-12T00:00:00Z',
  }), []);

  // Define scenes with hotspots
  const scenes: VRScene[] = useMemo(() => [
    {
      id: 'museum-entrance',
      title: {
        en: 'Museum Entrance Hall',
        ar: 'قاعة مدخل المتحف',
      },
      description: {
        en: 'Welcome to the Egyptian Museum, home to the world\'s largest collection of ancient Egyptian artifacts',
        ar: 'مرحباً بك في المتحف المصري، موطن أكبر مجموعة من الآثار المصرية القديمة في العالم',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/d4c5b0/ffffff?text=Museum+Entrance',
      thumbnailUrl: 'https://placehold.co/400x300/d4c5b0/ffffff?text=Entrance',
      hotspots: [
        {
          id: 'info-museum-history',
          type: 'info',
          position: { x: 0, y: 5, z: -15 },
          title: {
            en: 'Museum History',
            ar: 'تاريخ المتحف',
          },
          description: {
            en: 'Learn about the Egyptian Museum',
            ar: 'تعرف على المتحف المصري',
          },
          content: {
            title: {
              en: 'The Egyptian Museum in Cairo',
              ar: 'المتحف المصري في القاهرة',
            },
            description: {
              en: 'The Museum of Egyptian Antiquities, commonly known as the Egyptian Museum, is home to over 120,000 artifacts. Founded in 1902, it is located in Tahrir Square in Cairo. The museum houses the world\'s most extensive collection of pharaonic antiquities, spanning from the Predynastic Period to the Greco-Roman Era. Its iconic building, designed in the Neoclassical style, has become a symbol of Egypt\'s rich archaeological heritage.',
              ar: 'متحف الآثار المصرية، المعروف باسم المتحف المصري، يضم أكثر من 120,000 قطعة أثرية. تأسس عام 1902، ويقع في ميدان التحرير في القاهرة. يحتوي المتحف على أكبر مجموعة من الآثار الفرعونية في العالم، تمتد من عصر ما قبل الأسرات إلى العصر اليوناني الروماني. المبنى الشهير، المصمم على الطراز النيوكلاسيكي، أصبح رمزاً للتراث الأثري الغني لمصر.',
            },
            imageUrl: 'https://placehold.co/600x400/8b7355/ffffff?text=Museum+Building',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-tutankhamun-gallery',
          type: 'navigation',
          position: { x: -10, y: 2, z: -12 },
          title: {
            en: 'Tutankhamun Gallery',
            ar: 'قاعة توت عنخ آمون',
          },
          description: {
            en: 'Explore the treasures of King Tut',
            ar: 'استكشف كنوز الملك توت',
          },
          targetSceneId: 'tutankhamun-gallery',
          previewImageUrl: 'https://placehold.co/400x300/ffd700/ffffff?text=Tutankhamun',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'nav-mummies-room',
          type: 'navigation',
          position: { x: 10, y: 2, z: -12 },
          title: {
            en: 'Royal Mummies Room',
            ar: 'قاعة المومياوات الملكية',
          },
          description: {
            en: 'See the preserved pharaohs',
            ar: 'شاهد الفراعنة المحفوظين',
          },
          targetSceneId: 'mummies-room',
          previewImageUrl: 'https://placehold.co/400x300/4a4a4a/ffffff?text=Mummies',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'quiz-museum-facts',
          type: 'quiz',
          position: { x: 0, y: 3, z: -10 },
          title: {
            en: 'Museum Quiz',
            ar: 'اختبار المتحف',
          },
          description: {
            en: 'Test your knowledge',
            ar: 'اختبر معرفتك',
          },
          question: {
            en: 'How many artifacts does the Egyptian Museum house?',
            ar: 'كم عدد القطع الأثرية الموجودة في المتحف المصري؟',
          },
          options: [
            {
              id: 'opt-1',
              text: { en: 'About 50,000', ar: 'حوالي 50,000' },
              isCorrect: false,
            },
            {
              id: 'opt-2',
              text: { en: 'About 120,000', ar: 'حوالي 120,000' },
              isCorrect: true,
            },
            {
              id: 'opt-3',
              text: { en: 'About 500,000', ar: 'حوالي 500,000' },
              isCorrect: false,
            },
            {
              id: 'opt-4',
              text: { en: 'About 10,000', ar: 'حوالي 10,000' },
              isCorrect: false,
            },
          ],
          explanation: {
            en: 'The Egyptian Museum houses over 120,000 artifacts, making it the world\'s largest collection of pharaonic antiquities.',
            ar: 'يضم المتحف المصري أكثر من 120,000 قطعة أثرية، مما يجعله أكبر مجموعة من الآثار الفرعونية في العالم.',
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
        ambientColor: '#ffffff',
        directionalIntensity: 0.8,
        directionalColor: '#ffeaa7',
        directionalPosition: { x: 5, y: 10, z: 5 },
      },
    },
    {
      id: 'tutankhamun-gallery',
      title: {
        en: 'Tutankhamun Gallery',
        ar: 'قاعة توت عنخ آمون',
      },
      description: {
        en: 'The famous treasures of the boy king Tutankhamun',
        ar: 'كنوز الملك الصبي توت عنخ آمون الشهيرة',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/ffd700/ffffff?text=Tutankhamun+Gallery',
      thumbnailUrl: 'https://placehold.co/400x300/ffd700/ffffff?text=Tutankhamun',
      hotspots: [
        {
          id: 'info-golden-mask',
          type: 'info',
          position: { x: 0, y: 4, z: -12 },
          title: {
            en: 'The Golden Mask',
            ar: 'القناع الذهبي',
          },
          content: {
            title: {
              en: 'Tutankhamun\'s Golden Funeral Mask',
              ar: 'القناع الجنائزي الذهبي لتوت عنخ آمون',
            },
            description: {
              en: 'This iconic golden mask is one of the most famous artifacts in the world. Made of 11 kg of solid gold with inlays of lapis lazuli, obsidian, and colored glass, it covered the face of Tutankhamun\'s mummy. The mask represents the young pharaoh wearing the royal nemes headdress with the vulture and cobra symbols of Upper and Lower Egypt. The intricate craftsmanship and stunning preservation make it a masterpiece of ancient Egyptian art, discovered in 1922 by Howard Carter.',
              ar: 'هذا القناع الذهبي الشهير هو من أشهر القطع الأثرية في العالم. مصنوع من 11 كجم من الذهب الخالص مع تطعيمات من اللازورد والسبج والزجاج الملون، وكان يغطي وجه مومياء توت عنخ آمون. يمثل القناع الفرعون الشاب وهو يرتدي غطاء الرأس الملكي "نمس" مع رمزي النسر والكوبرا لمصر العليا والسفلى. الحرفية المعقدة والحفظ المذهل يجعلانه تحفة فنية من الفن المصري القديم، اكتشفه هوارد كارتر عام 1922.',
            },
            imageUrl: 'https://placehold.co/600x400/ffd700/000000?text=Golden+Mask',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-tutankhamun-history',
          type: 'info',
          position: { x: -8, y: 3, z: -10 },
          title: {
            en: 'King Tutankhamun',
            ar: 'الملك توت عنخ آمون',
          },
          content: {
            title: {
              en: 'The Boy King',
              ar: 'الملك الصبي',
            },
            description: {
              en: 'Tutankhamun became pharaoh at the age of 9 and ruled Egypt from about 1332 to 1323 BCE during the 18th Dynasty. Though his reign was relatively short and uneventful, he is one of the most famous pharaohs due to the discovery of his nearly intact tomb in the Valley of the Kings. His tomb, KV62, contained over 5,000 objects, providing unprecedented insights into royal burial practices and daily life in ancient Egypt. He died at approximately 19 years old, and the cause of his death remains debated among scholars.',
              ar: 'أصبح توت عنخ آمون فرعوناً في سن التاسعة وحكم مصر من حوالي 1332 إلى 1323 قبل الميلاد خلال الأسرة الثامنة عشرة. على الرغم من أن حكمه كان قصيراً نسبياً وهادئاً، إلا أنه أحد أشهر الفراعنة بسبب اكتشاف مقبرته شبه السليمة في وادي الملوك. احتوت مقبرته، KV62، على أكثر من 5,000 قطعة، مما وفر رؤى غير مسبوقة عن ممارسات الدفن الملكية والحياة اليومية في مصر القديمة. توفي في حوالي 19 عاماً، وسبب وفاته لا يزال محل نقاش بين العلماء.',
            },
            imageUrl: 'https://placehold.co/600x400/daa520/ffffff?text=Tutankhamun',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-tomb-discovery',
          type: 'info',
          position: { x: 8, y: 3, z: -10 },
          title: {
            en: 'Discovery of the Tomb',
            ar: 'اكتشاف المقبرة',
          },
          content: {
            title: {
              en: 'Howard Carter\'s Discovery',
              ar: 'اكتشاف هوارد كارتر',
            },
            description: {
              en: 'British archaeologist Howard Carter discovered Tutankhamun\'s tomb on November 4, 1922, after years of searching in the Valley of the Kings. The tomb was remarkably well-preserved, having escaped major looting that affected other royal tombs. The discovery caused a worldwide sensation and sparked renewed interest in ancient Egypt. Carter spent nearly a decade carefully cataloging and removing the tomb\'s treasures. The "curse of the pharaohs" legend also originated from several deaths that occurred after the tomb\'s opening, though scientifically dismissed.',
              ar: 'اكتشف عالم الآثار البريطاني هوارد كارتر مقبرة توت عنخ آمون في 4 نوفمبر 1922، بعد سنوات من البحث في وادي الملوك. كانت المقبرة محفوظة بشكل رائع، بعد أن نجت من عمليات النهب الكبيرة التي أثرت على المقابر الملكية الأخرى. تسبب الاكتشاف في ضجة عالمية وأثار اهتماماً متجدداً بمصر القديمة. قضى كارتر ما يقرب من عقد من الزمان في فهرسة كنوز المقبرة وإزالتها بعناية. نشأت أيضاً أسطورة "لعنة الفراعنة" من عدة وفيات حدثت بعد فتح المقبرة، على الرغم من رفضها علمياً.',
            },
            imageUrl: 'https://placehold.co/600x400/8b4513/ffffff?text=Discovery',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-golden-throne',
          type: 'info',
          position: { x: -5, y: 2, z: -8 },
          title: {
            en: 'The Golden Throne',
            ar: 'العرش الذهبي',
          },
          content: {
            title: {
              en: 'Tutankhamun\'s Ceremonial Throne',
              ar: 'عرش توت عنخ آمون الاحتفالي',
            },
            description: {
              en: 'This magnificent throne is covered in gold leaf and decorated with semi-precious stones, colored glass, and faience. The backrest depicts Tutankhamun and his wife Ankhesenamun in an intimate scene, with the sun god Aten shining down on them. The throne\'s legs are carved in the form of lion legs, a symbol of royal power. The throne dates from early in Tutankhamun\'s reign and shows artistic elements from the Amarna Period, reflecting the religious changes of his father Akhenaten\'s reign.',
              ar: 'هذا العرش الرائع مغطى بورق الذهب ومزين بالأحجار شبه الكريمة والزجاج الملون والفيانس. يصور ظهر العرش توت عنخ آمون وزوجته عنخ إسن آمون في مشهد حميم، مع إله الشمس آتون يشرق عليهما. أرجل العرش منحوتة على شكل أرجل أسد، رمز القوة الملكية. يعود العرش إلى وقت مبكر من عهد توت عنخ آمون ويظهر عناصر فنية من فترة العمارنة، تعكس التغييرات الدينية في عهد والده إخناتون.',
            },
            imageUrl: 'https://placehold.co/600x400/b8860b/ffffff?text=Throne',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-jewelry-collection',
          type: 'navigation',
          position: { x: 12, y: 2, z: -8 },
          title: {
            en: 'Jewelry Collection',
            ar: 'مجموعة المجوهرات',
          },
          description: {
            en: 'Explore ancient jewelry',
            ar: 'استكشف المجوهرات القديمة',
          },
          targetSceneId: 'jewelry-collection',
          previewImageUrl: 'https://placehold.co/400x300/9b59b6/ffffff?text=Jewelry',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'nav-back-entrance',
          type: 'navigation',
          position: { x: -12, y: 2, z: -8 },
          title: {
            en: 'Back to Entrance',
            ar: 'العودة إلى المدخل',
          },
          description: {
            en: 'Return to main hall',
            ar: 'العودة إلى القاعة الرئيسية',
          },
          targetSceneId: 'museum-entrance',
          previewImageUrl: 'https://placehold.co/400x300/d4c5b0/ffffff?text=Entrance',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'quiz-tutankhamun',
          type: 'quiz',
          position: { x: 5, y: 4, z: -10 },
          title: {
            en: 'Tutankhamun Quiz',
            ar: 'اختبار توت عنخ آمون',
          },
          question: {
            en: 'How old was Tutankhamun when he became pharaoh?',
            ar: 'كم كان عمر توت عنخ آمون عندما أصبح فرعوناً؟',
          },
          options: [
            {
              id: 'opt-1',
              text: { en: '5 years old', ar: '5 سنوات' },
              isCorrect: false,
            },
            {
              id: 'opt-2',
              text: { en: '9 years old', ar: '9 سنوات' },
              isCorrect: true,
            },
            {
              id: 'opt-3',
              text: { en: '15 years old', ar: '15 سنة' },
              isCorrect: false,
            },
            {
              id: 'opt-4',
              text: { en: '20 years old', ar: '20 سنة' },
              isCorrect: false,
            },
          ],
          explanation: {
            en: 'Tutankhamun became pharaoh at the age of 9 and ruled Egypt during the 18th Dynasty.',
            ar: 'أصبح توت عنخ آمون فرعوناً في سن التاسعة وحكم مصر خلال الأسرة الثامنة عشرة.',
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
        ambientIntensity: 0.6,
        ambientColor: '#ffd700',
        directionalIntensity: 0.7,
        directionalColor: '#ffcc00',
        directionalPosition: { x: 0, y: 10, z: 5 },
      },
    },
    {
      id: 'mummies-room',
      title: {
        en: 'Royal Mummies Room',
        ar: 'قاعة المومياوات الملكية',
      },
      description: {
        en: 'See the preserved remains of Egypt\'s greatest pharaohs',
        ar: 'شاهد البقايا المحفوظة لأعظم فراعنة مصر',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/2c3e50/ffffff?text=Mummies+Room',
      thumbnailUrl: 'https://placehold.co/400x300/2c3e50/ffffff?text=Mummies',
      hotspots: [
        {
          id: 'info-mummification',
          type: 'info',
          position: { x: 0, y: 3, z: -12 },
          title: {
            en: 'Mummification Process',
            ar: 'عملية التحنيط',
          },
          content: {
            title: {
              en: 'The Art of Mummification',
              ar: 'فن التحنيط',
            },
            description: {
              en: 'Ancient Egyptians perfected the art of mummification over thousands of years. The process took 70 days and involved removing internal organs (except the heart), drying the body with natron salt, and wrapping it in linen bandages. The brain was removed through the nose, while organs like the liver, lungs, stomach, and intestines were stored in canopic jars. The heart was left in place, as Egyptians believed it was needed for the afterlife judgment. Mummification preserved the body for the soul\'s journey in the afterlife.',
              ar: 'أتقن المصريون القدماء فن التحنيط على مدى آلاف السنين. استغرقت العملية 70 يوماً وتضمنت إزالة الأعضاء الداخلية (باستثناء القلب)، وتجفيف الجسم بملح النطرون، ولفه بضمادات كتانية. تمت إزالة الدماغ من خلال الأنف، بينما تم تخزين أعضاء مثل الكبد والرئتين والمعدة والأمعاء في الأواني الكانوبية. تُرك القلب في مكانه، حيث اعتقد المصريون أنه كان مطلوباً لحكم الآخرة. حفظ التحنيط الجسم لرحلة الروح في الآخرة.',
            },
            imageUrl: 'https://placehold.co/600x400/34495e/ffffff?text=Mummification',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-ramesses-ii',
          type: 'info',
          position: { x: -8, y: 2.5, z: -10 },
          title: {
            en: 'Ramesses II',
            ar: 'رمسيس الثاني',
          },
          content: {
            title: {
              en: 'Ramesses the Great',
              ar: 'رمسيس الأعظم',
            },
            description: {
              en: 'Ramesses II, also known as Ramesses the Great, ruled Egypt for 66 years (1279-1213 BCE) during the 19th Dynasty. He is regarded as one of Egypt\'s greatest pharaohs, known for his military campaigns, extensive building projects, and diplomatic achievements. He built numerous monuments including Abu Simbel, the Ramesseum, and expanded Karnak Temple. His mummy, discovered in 1881, shows he was tall for his time (about 1.75m) with red hair. He lived to about 90 years old, an exceptional age for ancient times.',
              ar: 'حكم رمسيس الثاني، المعروف أيضاً باسم رمسيس الأعظم، مصر لمدة 66 عاماً (1279-1213 قبل الميلاد) خلال الأسرة التاسعة عشرة. يُعتبر أحد أعظم فراعنة مصر، معروف بحملاته العسكرية ومشاريع البناء الواسعة والإنجازات الدبلوماسية. بنى العديد من الآثار بما في ذلك أبو سمبل والرامسيوم، ووسع معبد الكرنك. تُظهر مومياءه، المكتشفة عام 1881، أنه كان طويل القامة لوقته (حوالي 1.75 متر) بشعر أحمر. عاش حتى حوالي 90 عاماً، وهو عمر استثنائي للعصور القديمة.',
            },
            imageUrl: 'https://placehold.co/600x400/c0392b/ffffff?text=Ramesses+II',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-hatshepsut',
          type: 'info',
          position: { x: 8, y: 2.5, z: -10 },
          title: {
            en: 'Queen Hatshepsut',
            ar: 'الملكة حتشبسوت',
          },
          content: {
            title: {
              en: 'The Female Pharaoh',
              ar: 'الفرعونة',
            },
            description: {
              en: 'Hatshepsut was one of ancient Egypt\'s most successful pharaohs, ruling for about 22 years during the 18th Dynasty (1479-1458 BCE). Initially serving as regent for her young stepson Thutmose III, she eventually declared herself pharaoh. Her reign was marked by prosperity, extensive building projects, and successful trading expeditions to Punt. She is often depicted wearing the false beard and regalia of a male pharaoh. Her magnificent mortuary temple at Deir el-Bahari is one of ancient Egypt\'s architectural masterpieces.',
              ar: 'كانت حتشبسوت واحدة من أنجح فراعنة مصر القديمة، حكمت لحوالي 22 عاماً خلال الأسرة الثامنة عشرة (1479-1458 قبل الميلاد). بدأت كوصية على ربيبها الصغير تحتمس الثالث، ثم أعلنت نفسها فرعوناً في النهاية. تميز عهدها بالازدهار ومشاريع البناء الواسعة والبعثات التجارية الناجحة إلى بونت. غالباً ما تُصور وهي ترتدي اللحية المزيفة وشارات فرعون ذكر. معبدها الجنائزي الرائع في دير البحري هو واحد من روائع العمارة المصرية القديمة.',
            },
            imageUrl: 'https://placehold.co/600x400/e74c3c/ffffff?text=Hatshepsut',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-back-entrance2',
          type: 'navigation',
          position: { x: 0, y: 2, z: -15 },
          title: {
            en: 'Back to Entrance',
            ar: 'العودة إلى المدخل',
          },
          description: {
            en: 'Return to main hall',
            ar: 'العودة إلى القاعة الرئيسية',
          },
          targetSceneId: 'museum-entrance',
          previewImageUrl: 'https://placehold.co/400x300/d4c5b0/ffffff?text=Entrance',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'nav-hieroglyphics',
          type: 'navigation',
          position: { x: 10, y: 2, z: -8 },
          title: {
            en: 'Hieroglyphics Gallery',
            ar: 'قاعة الهيروغليفية',
          },
          description: {
            en: 'Learn about ancient writing',
            ar: 'تعلم عن الكتابة القديمة',
          },
          targetSceneId: 'hieroglyphics-gallery',
          previewImageUrl: 'https://placehold.co/400x300/16a085/ffffff?text=Hieroglyphics',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'quiz-mummies',
          type: 'quiz',
          position: { x: -5, y: 3.5, z: -10 },
          title: {
            en: 'Mummification Quiz',
            ar: 'اختبار التحنيط',
          },
          question: {
            en: 'How long did the mummification process take?',
            ar: 'كم من الوقت استغرقت عملية التحنيط؟',
          },
          options: [
            {
              id: 'opt-1',
              text: { en: '7 days', ar: '7 أيام' },
              isCorrect: false,
            },
            {
              id: 'opt-2',
              text: { en: '40 days', ar: '40 يوماً' },
              isCorrect: false,
            },
            {
              id: 'opt-3',
              text: { en: '70 days', ar: '70 يوماً' },
              isCorrect: true,
            },
            {
              id: 'opt-4',
              text: { en: '100 days', ar: '100 يوم' },
              isCorrect: false,
            },
          ],
          explanation: {
            en: 'The complete mummification process took 70 days, from removing organs to wrapping the body in linen.',
            ar: 'استغرقت عملية التحنيط الكاملة 70 يوماً، من إزالة الأعضاء إلى لف الجسم بالكتان.',
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
        zoomRange: { min: 1, max: 2.5 },
      },
      lighting: {
        ambientIntensity: 0.5,
        ambientColor: '#34495e',
        directionalIntensity: 0.4,
        directionalColor: '#7f8c8d',
        directionalPosition: { x: 0, y: 8, z: 0 },
      },
    },
    {
      id: 'jewelry-collection',
      title: {
        en: 'Ancient Jewelry Collection',
        ar: 'مجموعة المجوهرات القديمة',
      },
      description: {
        en: 'Exquisite gold and precious stone jewelry from royal tombs',
        ar: 'مجوهرات الذهب والأحجار الكريمة الرائعة من المقابر الملكية',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/9b59b6/ffffff?text=Jewelry+Collection',
      thumbnailUrl: 'https://placehold.co/400x300/9b59b6/ffffff?text=Jewelry',
      hotspots: [
        {
          id: 'info-jewelry-craftsmanship',
          type: 'info',
          position: { x: 0, y: 3, z: -10 },
          title: {
            en: 'Ancient Jewelry',
            ar: 'المجوهرات القديمة',
          },
          content: {
            title: {
              en: 'Egyptian Jewelry Craftsmanship',
              ar: 'حرفية المجوهرات المصرية',
            },
            description: {
              en: 'Ancient Egyptians were master jewelers who created stunning pieces using gold, silver, and semi-precious stones like lapis lazuli, turquoise, carnelian, and amethyst. They developed sophisticated techniques including granulation, cloisonné, and repoussé. Jewelry served both decorative and protective purposes, with many pieces featuring amulets and symbols believed to provide magical protection. The wealthy wore elaborate necklaces, bracelets, rings, and diadems, while even common people wore simpler jewelry as status symbols and protective charms.',
              ar: 'كان المصريون القدماء صاغة بارعين أنشأوا قطعاً مذهلة باستخدام الذهب والفضة والأحجار شبه الكريمة مثل اللازورد والفيروز والعقيق الأحمر والجمشت. طوروا تقنيات متطورة بما في ذلك الحبيبات والمينا والبارز. خدمت المجوهرات أغراضاً زخرفية ووقائية، مع العديد من القطع التي تضم تمائم ورموزاً يُعتقد أنها توفر حماية سحرية. ارتدى الأثرياء قلائد معقدة وأساور وخواتم وتيجان، بينما ارتدى حتى عامة الناس مجوهرات أبسط كرموز للمكانة وتمائم واقية.',
            },
            imageUrl: 'https://placehold.co/600x400/8e44ad/ffffff?text=Jewelry+Art',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-scarab-beetle',
          type: 'info',
          position: { x: -7, y: 2, z: -8 },
          title: {
            en: 'Scarab Jewelry',
            ar: 'مجوهرات الجعران',
          },
          content: {
            title: {
              en: 'The Sacred Scarab Beetle',
              ar: 'خنفساء الجعران المقدسة',
            },
            description: {
              en: 'The scarab beetle was one of ancient Egypt\'s most important symbols, representing transformation, rebirth, and the sun god Khepri. Scarab amulets and jewelry were incredibly popular, often carved from stones like lapis lazuli, carnelian, or faience. They were worn as protective charms and placed within mummy wrappings. The flat underside of scarab jewelry was often inscribed with hieroglyphic spells, royal names, or decorative patterns. Heart scarabs were placed over the mummy\'s heart to prevent it from testifying against the deceased in the afterlife judgment.',
              ar: 'كانت خنفساء الجعران واحدة من أهم رموز مصر القديمة، تمثل التحول والولادة الجديدة وإله الشمس خبري. كانت تمائم ومجوهرات الجعران شائعة بشكل لا يصدق، وغالباً ما كانت منحوتة من أحجار مثل اللازورد أو العقيق الأحمر أو الفيانس. كانت ترتدى كتمائم واقية وتوضع داخل لفائف المومياء. غالباً ما كان الجانب السفلي المسطح من مجوهرات الجعران منقوشاً بتعويذات هيروغليفية أو أسماء ملكية أو أنماط زخرفية. وُضعت جعارين القلب فوق قلب المومياء لمنعه من الشهادة ضد المتوفى في حكم الآخرة.',
            },
            imageUrl: 'https://placehold.co/600x400/27ae60/ffffff?text=Scarab',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-tutankhamun-gallery2',
          type: 'navigation',
          position: { x: 10, y: 2, z: -8 },
          title: {
            en: 'Back to Tutankhamun',
            ar: 'العودة إلى توت عنخ آمون',
          },
          description: {
            en: 'Return to Tut\'s treasures',
            ar: 'العودة إلى كنوز توت',
          },
          targetSceneId: 'tutankhamun-gallery',
          previewImageUrl: 'https://placehold.co/400x300/ffd700/ffffff?text=Tutankhamun',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'quiz-jewelry',
          type: 'quiz',
          position: { x: 5, y: 3, z: -9 },
          title: {
            en: 'Jewelry Quiz',
            ar: 'اختبار المجوهرات',
          },
          question: {
            en: 'What did the scarab beetle symbolize in ancient Egypt?',
            ar: 'ماذا ترمز خنفساء الجعران في مصر القديمة؟',
          },
          options: [
            {
              id: 'opt-1',
              text: { en: 'War and victory', ar: 'الحرب والنصر' },
              isCorrect: false,
            },
            {
              id: 'opt-2',
              text: { en: 'Transformation and rebirth', ar: 'التحول والولادة الجديدة' },
              isCorrect: true,
            },
            {
              id: 'opt-3',
              text: { en: 'Death and mourning', ar: 'الموت والحداد' },
              isCorrect: false,
            },
            {
              id: 'opt-4',
              text: { en: 'Wisdom and knowledge', ar: 'الحكمة والمعرفة' },
              isCorrect: false,
            },
          ],
          explanation: {
            en: 'The scarab beetle symbolized transformation, rebirth, and the sun god Khepri. It was one of ancient Egypt\'s most sacred symbols.',
            ar: 'رمزت خنفساء الجعران إلى التحول والولادة الجديدة وإله الشمس خبري. كانت واحدة من أقدس رموز مصر القديمة.',
          },
          points: 10,
          color: '#eab308',
        } as QuizHotspot,
      ],
      camera: {
        initialRotation: { x: 0, y: 0, z: 0 },
        enableZoom: true,
        zoomRange: { min: 1, max: 3 },
      },
      lighting: {
        ambientIntensity: 0.6,
        ambientColor: '#9b59b6',
        directionalIntensity: 0.8,
        directionalColor: '#e1bee7',
        directionalPosition: { x: 5, y: 10, z: 5 },
      },
    },
    {
      id: 'hieroglyphics-gallery',
      title: {
        en: 'Hieroglyphics Gallery',
        ar: 'قاعة الهيروغليفية',
      },
      description: {
        en: 'Discover the ancient Egyptian writing system',
        ar: 'اكتشف نظام الكتابة المصري القديم',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/16a085/ffffff?text=Hieroglyphics',
      thumbnailUrl: 'https://placehold.co/400x300/16a085/ffffff?text=Hieroglyphics',
      hotspots: [
        {
          id: 'info-rosetta-stone',
          type: 'info',
          position: { x: 0, y: 4, z: -12 },
          title: {
            en: 'The Rosetta Stone',
            ar: 'حجر رشيد',
          },
          content: {
            title: {
              en: 'Key to Deciphering Hieroglyphics',
              ar: 'مفتاح فك رموز الهيروغليفية',
            },
            description: {
              en: 'The Rosetta Stone, discovered in 1799, was the key to deciphering ancient Egyptian hieroglyphics. The stone features the same text written in three scripts: hieroglyphics, Demotic, and ancient Greek. French scholar Jean-François Champollion used the Greek text as a reference to decode the hieroglyphics in 1822. The original stone is now in the British Museum, but this replica allows Egyptians to see this crucial artifact. The decree on the stone dates to 196 BCE during the Ptolemaic period.',
              ar: 'حجر رشيد، المكتشف في عام 1799، كان مفتاح فك رموز الهيروغليفية المصرية القديمة. يحمل الحجر نفس النص مكتوباً بثلاث خطوط: الهيروغليفية، والديموطيقية، واليونانية القديمة. استخدم العالم الفرنسي جان فرانسوا شامبليون النص اليوناني كمرجع لفك رموز الهيروغليفية في عام 1822. الحجر الأصلي الآن في المتحف البريطاني، لكن هذه النسخة تسمح للمصريين برؤية هذه القطعة الأثرية الحاسمة. يعود المرسوم على الحجر إلى 196 قبل الميلاد خلال الفترة البطلمية.',
            },
            imageUrl: 'https://placehold.co/600x400/1abc9c/ffffff?text=Rosetta+Stone',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-hieroglyphics-system',
          type: 'info',
          position: { x: -8, y: 3, z: -10 },
          title: {
            en: 'Writing System',
            ar: 'نظام الكتابة',
          },
          content: {
            title: {
              en: 'Understanding Hieroglyphics',
              ar: 'فهم الهيروغليفية',
            },
            description: {
              en: 'Hieroglyphics combined logographic and alphabetic elements, using around 700 distinct symbols. Signs could represent sounds, ideas, or serve as determinatives to clarify meaning. The script was typically written in columns or rows, reading from right to left, left to right, or top to bottom - the direction indicated by which way figures faced. Hieroglyphics were used for religious texts, monuments, and official inscriptions. Scribes spent years learning to write, making literacy a mark of elite status. The script was used for over 3,500 years.',
              ar: 'جمعت الهيروغليفية بين العناصر اللوجوجرافية والأبجدية، باستخدام حوالي 700 رمز مميز. يمكن أن ترمز العلامات إلى أصوات أو أفكار أو تعمل كمحددات لتوضيح المعنى. عادة ما كان يُكتب الخط في أعمدة أو صفوف، يُقرأ من اليمين إلى اليسار، أو من اليسار إلى اليمين، أو من أعلى إلى أسفل - الاتجاه يشير إليه الطريقة التي تواجه بها الأشكال. استُخدمت الهيروغليفية للنصوص الدينية والآثار والنقوش الرسمية. أمضى الكتبة سنوات في تعلم الكتابة، مما جعل معرفة القراءة والكتابة علامة على المكانة النخبوية. استُخدم الخط لأكثر من 3,500 عام.',
            },
            imageUrl: 'https://placehold.co/600x400/27ae60/ffffff?text=Writing+System',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-scribes',
          type: 'info',
          position: { x: 8, y: 3, z: -10 },
          title: {
            en: 'Ancient Scribes',
            ar: 'الكتبة القدماء',
          },
          content: {
            title: {
              en: 'The Role of Scribes',
              ar: 'دور الكتبة',
            },
            description: {
              en: 'Scribes held prestigious positions in ancient Egyptian society. They were responsible for recording everything from tax records and legal documents to religious texts and royal decrees. Becoming a scribe required years of education in special schools, learning hieroglyphics, hieratic (cursive script), mathematics, and literature. Scribes used reed brushes and ink made from carbon (black) and ochre (red) on papyrus or ostraca (pottery shards). The god Thoth was their patron deity, often depicted with a scribe\'s palette.',
              ar: 'شغل الكتبة مناصب مرموقة في المجتمع المصري القديم. كانوا مسؤولين عن تسجيل كل شيء من سجلات الضرائب والوثائق القانونية إلى النصوص الدينية والمراسيم الملكية. أصبح الكاتب يتطلب سنوات من التعليم في مدارس خاصة، تعلم الهيروغليفية، والهيراطيقية (الخط المتصل)، والرياضيات، والأدب. استخدم الكتبة فرش القصب والحبر المصنوع من الكربون (أسود) والمغرة (أحمر) على ورق البردي أو الأوستراكا (شظايا الفخار). كان الإله تحوت إلههم الراعي، غالباً ما يُصور بلوحة الكاتب.',
            },
            imageUrl: 'https://placehold.co/600x400/e67e22/ffffff?text=Scribes',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-mummies-room2',
          type: 'navigation',
          position: { x: -10, y: 2, z: -8 },
          title: {
            en: 'To Mummies Room',
            ar: 'إلى قاعة المومياوات',
          },
          description: {
            en: 'Visit the royal mummies',
            ar: 'زُر المومياوات الملكية',
          },
          targetSceneId: 'mummies-room',
          previewImageUrl: 'https://placehold.co/400x300/2c3e50/ffffff?text=Mummies',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'nav-main-atrium',
          type: 'navigation',
          position: { x: 10, y: 2, z: -8 },
          title: {
            en: 'Main Atrium',
            ar: 'الردهة الرئيسية',
          },
          description: {
            en: 'See the grand statues',
            ar: 'شاهد التماثيل العظيمة',
          },
          targetSceneId: 'main-atrium',
          previewImageUrl: 'https://placehold.co/400x300/95a5a6/ffffff?text=Atrium',
          transitionDuration: 1000,
          color: '#8b5cf6',
        } as NavigationHotspot,
        {
          id: 'quiz-hieroglyphics',
          type: 'quiz',
          position: { x: 0, y: 3.5, z: -9 },
          title: {
            en: 'Writing Quiz',
            ar: 'اختبار الكتابة',
          },
          question: {
            en: 'What artifact was key to deciphering hieroglyphics?',
            ar: 'ما هي القطعة الأثرية التي كانت مفتاح فك رموز الهيروغليفية؟',
          },
          options: [
            {
              id: 'opt-1',
              text: { en: 'The Rosetta Stone', ar: 'حجر رشيد' },
              isCorrect: true,
            },
            {
              id: 'opt-2',
              text: { en: 'Tutankhamun\'s Mask', ar: 'قناع توت عنخ آمون' },
              isCorrect: false,
            },
            {
              id: 'opt-3',
              text: { en: 'The Pyramids', ar: 'الأهرامات' },
              isCorrect: false,
            },
            {
              id: 'opt-4',
              text: { en: 'The Sphinx', ar: 'أبو الهول' },
              isCorrect: false,
            },
          ],
          explanation: {
            en: 'The Rosetta Stone contained the same text in hieroglyphics, Demotic, and Greek, allowing scholars to decode hieroglyphics using the Greek translation.',
            ar: 'احتوى حجر رشيد على نفس النص بالهيروغليفية والديموطيقية واليونانية، مما سمح للعلماء بفك رموز الهيروغليفية باستخدام الترجمة اليونانية.',
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
        ambientColor: '#1abc9c',
        directionalIntensity: 0.7,
        directionalColor: '#a8e6cf',
        directionalPosition: { x: 5, y: 10, z: 5 },
      },
    },
    {
      id: 'main-atrium',
      title: {
        en: 'Main Atrium',
        ar: 'الردهة الرئيسية',
      },
      description: {
        en: 'The grand central hall with colossal statues',
        ar: 'القاعة المركزية الكبرى بالتماثيل الضخمة',
      },
      environmentType: '360-image',
      imageUrl: 'https://placehold.co/4096x2048/95a5a6/ffffff?text=Main+Atrium',
      thumbnailUrl: 'https://placehold.co/400x300/95a5a6/ffffff?text=Atrium',
      hotspots: [
        {
          id: 'info-colossal-statues',
          type: 'info',
          position: { x: 0, y: 6, z: -15 },
          title: {
            en: 'Colossal Statues',
            ar: 'التماثيل الضخمة',
          },
          content: {
            title: {
              en: 'Monumental Egyptian Sculpture',
              ar: 'النحت المصري الضخم',
            },
            description: {
              en: 'The main atrium showcases massive statues of pharaohs and gods, some standing over 10 meters tall. These sculptures were carved from single blocks of stone, including granite, limestone, and quartzite. Ancient Egyptians transported these enormous monuments hundreds of kilometers from quarries using boats, sledges, and ramps. The statues served to honor the gods and commemorate pharaohs, displaying royal power and divine connection. Many retain traces of their original paint - ancient Egyptian statues were vividly colored, not the plain stone we see today.',
              ar: 'تعرض الردهة الرئيسية تماثيل ضخمة للفراعنة والآلهة، يبلغ ارتفاع بعضها أكثر من 10 أمتار. نُحتت هذه المنحوتات من كتل حجرية واحدة، بما في ذلك الجرانيت والحجر الجيري والكوارتزيت. نقل المصريون القدماء هذه الآثار الضخمة مئات الكيلومترات من المحاجر باستخدام القوارب والزلاجات والمنحدرات. خدمت التماثيل لتكريم الآلهة وإحياء ذكرى الفراعنة، مظهرة القوة الملكية والارتباط الإلهي. يحتفظ الكثير بآثار طلائها الأصلي - كانت التماثيل المصرية القديمة ملونة بشكل حيوي، وليس الحجر العادي الذي نراه اليوم.',
            },
            imageUrl: 'https://placehold.co/600x400/7f8c8d/ffffff?text=Statues',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'info-amenhotep-iii',
          type: 'info',
          position: { x: -10, y: 4, z: -12 },
          title: {
            en: 'Amenhotep III',
            ar: 'أمنحتب الثالث',
          },
          content: {
            title: {
              en: 'Statue of Amenhotep III',
              ar: 'تمثال أمنحتب الثالث',
            },
            description: {
              en: 'This magnificent statue depicts Amenhotep III, one of ancient Egypt\'s greatest pharaohs who ruled during the 18th Dynasty (1390-1352 BCE). His 38-year reign was marked by unprecedented prosperity, diplomatic success, and prolific building projects. He constructed the massive temple complex at Luxor and commissioned hundreds of statues. Known as "Amenhotep the Magnificent," he maintained peace through diplomacy and strategic marriages. He was the grandfather of Tutankhamun and father of the controversial pharaoh Akhenaten.',
              ar: 'يصور هذا التمثال الرائع أمنحتب الثالث، أحد أعظم فراعنة مصر القديمة الذي حكم خلال الأسرة الثامنة عشرة (1390-1352 قبل الميلاد). تميز حكمه الذي دام 38 عاماً بازدهار غير مسبوق ونجاح دبلوماسي ومشاريع بناء غزيرة. بنى مجمع المعابد الضخم في الأقصر وكلف بمئات التماثيل. معروف باسم "أمنحتب العظيم"، حافظ على السلام من خلال الدبلوماسية والزيجات الاستراتيجية. كان جد توت عنخ آمون ووالد الفرعون المثير للجدل إخناتون.',
            },
            imageUrl: 'https://placehold.co/600x400/34495e/ffffff?text=Amenhotep',
          },
          color: '#3b82f6',
        } as InfoHotspot,
        {
          id: 'nav-back-entrance3',
          type: 'navigation',
          position: { x: 0, y: 2, z: -18 },
          title: {
            en: 'Back to Entrance',
            ar: 'العودة إلى المدخل',
          },
          description: {
            en: 'Return to entrance hall',
            ar: 'العودة إلى قاعة المدخل',
          },
          targetSceneId: 'museum-entrance',
          previewImageUrl: 'https://placehold.co/400x300/d4c5b0/ffffff?text=Entrance',
          transitionDuration: 1500,
          color: '#8b5cf6',
        } as NavigationHotspot,
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
        ambientColor: '#ecf0f1',
        directionalIntensity: 0.9,
        directionalColor: '#bdc3c7',
        directionalPosition: { x: 0, y: 15, z: 0 },
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
              <Building2 className="w-6 h-6 text-red-400" />
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
              className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
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
                        : 'border-gray-200 hover:border-red-400 hover:bg-red-50'
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
