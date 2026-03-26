'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { VRLanguage } from '@/types/vr';

/**
 * Organelle data with educational information
 */
export interface OrganelleData {
  id: string;
  name: { en: string; ar: string };
  position: [number, number, number];
  size: number;
  color: string;
  shape: 'sphere' | 'oval' | 'rod' | 'network';
  inPlantCell: boolean;
  inAnimalCell: boolean;
  description: { en: string; ar: string };
  function: { en: string; ar: string };
  facts: Array<{ en: string; ar: string }>;
}

/**
 * Complete list of cell organelles
 */
export const ORGANELLES_DATA: OrganelleData[] = [
  {
    id: 'nucleus',
    name: { en: 'Nucleus', ar: 'النواة' },
    position: [0, 0, 0],
    size: 3,
    color: '#8b5cf6',
    shape: 'sphere',
    inPlantCell: true,
    inAnimalCell: true,
    description: {
      en: 'The control center of the cell',
      ar: 'مركز التحكم في الخلية',
    },
    function: {
      en: 'Contains DNA and controls all cell activities',
      ar: 'يحتوي على الحمض النووي ويتحكم في جميع أنشطة الخلية',
    },
    facts: [
      { en: 'Contains genetic material (DNA)', ar: 'يحتوي على المادة الوراثية (DNA)' },
      { en: 'Surrounded by nuclear membrane', ar: 'محاط بغشاء نووي' },
      { en: 'Controls cell growth and reproduction', ar: 'يتحكم في نمو الخلية وتكاثرها' },
    ],
  },
  {
    id: 'mitochondria',
    name: { en: 'Mitochondria', ar: 'الميتوكوندريا' },
    position: [4, 1.5, 2],
    size: 1.2,
    color: '#ef4444',
    shape: 'oval',
    inPlantCell: true,
    inAnimalCell: true,
    description: {
      en: 'The powerhouse of the cell',
      ar: 'محطة توليد الطاقة في الخلية',
    },
    function: {
      en: 'Produces energy (ATP) through cellular respiration',
      ar: 'تنتج الطاقة (ATP) من خلال التنفس الخلوي',
    },
    facts: [
      { en: 'Converts glucose into ATP energy', ar: 'تحول الجلوكوز إلى طاقة ATP' },
      { en: 'Has its own DNA (inherited from mother)', ar: 'لها DNA خاص بها (موروث من الأم)' },
      { en: 'Cell may have hundreds of mitochondria', ar: 'قد تحتوي الخلية على مئات الميتوكوندريا' },
    ],
  },
  {
    id: 'ribosome',
    name: { en: 'Ribosomes', ar: 'الريبوسومات' },
    position: [-3, 2, 1],
    size: 0.6,
    color: '#f59e0b',
    shape: 'sphere',
    inPlantCell: true,
    inAnimalCell: true,
    description: {
      en: 'Protein factories',
      ar: 'مصانع البروتين',
    },
    function: {
      en: 'Synthesizes proteins from amino acids',
      ar: 'تركب البروتينات من الأحماض الأمينية',
    },
    facts: [
      { en: 'Made of RNA and proteins', ar: 'مصنوعة من RNA والبروتينات' },
      { en: 'Can be free-floating or attached to ER', ar: 'يمكن أن تكون حرة أو متصلة بالشبكة الإندوبلازمية' },
      { en: 'Thousands exist in each cell', ar: 'توجد بالآلاف في كل خلية' },
    ],
  },
  {
    id: 'endoplasmic-reticulum',
    name: { en: 'Endoplasmic Reticulum', ar: 'الشبكة الإندوبلازمية' },
    position: [2, -1, -2],
    size: 2,
    color: '#06b6d4',
    shape: 'network',
    inPlantCell: true,
    inAnimalCell: true,
    description: {
      en: 'Transportation network',
      ar: 'شبكة النقل',
    },
    function: {
      en: 'Transports materials and synthesizes proteins/lipids',
      ar: 'تنقل المواد وتركب البروتينات والدهون',
    },
    facts: [
      { en: 'Two types: Rough ER (with ribosomes) and Smooth ER', ar: 'نوعان: ER خشن (مع ريبوسومات) و ER أملس' },
      { en: 'Forms a maze-like network of membranes', ar: 'تشكل شبكة متاهة من الأغشية' },
      { en: 'Connected to nuclear envelope', ar: 'متصلة بالغلاف النووي' },
    ],
  },
  {
    id: 'golgi-apparatus',
    name: { en: 'Golgi Apparatus', ar: 'جهاز جولجي' },
    position: [-2, -2, 2],
    size: 1.8,
    color: '#10b981',
    shape: 'network',
    inPlantCell: true,
    inAnimalCell: true,
    description: {
      en: 'Processing and packaging center',
      ar: 'مركز المعالجة والتعبئة',
    },
    function: {
      en: 'Modifies, sorts, and packages proteins for export',
      ar: 'يعدل ويرتب ويعبئ البروتينات للتصدير',
    },
    facts: [
      { en: 'Looks like a stack of pancakes', ar: 'يشبه كومة من الفطائر' },
      { en: 'Receives proteins from ER', ar: 'يستقبل البروتينات من الشبكة الإندوبلازمية' },
      { en: 'Creates lysosomes and secretory vesicles', ar: 'ينتج الليزوسومات والحويصلات الإفرازية' },
    ],
  },
  {
    id: 'lysosome',
    name: { en: 'Lysosomes', ar: 'الليزوسومات' },
    position: [3, -2, 0],
    size: 0.9,
    color: '#ec4899',
    shape: 'sphere',
    inPlantCell: false,
    inAnimalCell: true,
    description: {
      en: 'Recycling centers',
      ar: 'مراكز إعادة التدوير',
    },
    function: {
      en: 'Breaks down waste materials and cellular debris',
      ar: 'تحلل المواد النفايات والحطام الخلوي',
    },
    facts: [
      { en: 'Contains digestive enzymes', ar: 'تحتوي على إنزيمات هاضمة' },
      { en: 'Called "suicide bags" of the cell', ar: 'تسمى "أكياس الانتحار" للخلية' },
      { en: 'More common in animal cells', ar: 'أكثر شيوعًا في الخلايا الحيوانية' },
    ],
  },
  {
    id: 'chloroplast',
    name: { en: 'Chloroplasts', ar: 'البلاستيدات الخضراء' },
    position: [-4, 1, -1],
    size: 1.5,
    color: '#22c55e',
    shape: 'oval',
    inPlantCell: true,
    inAnimalCell: false,
    description: {
      en: 'Solar panels of the plant cell',
      ar: 'الألواح الشمسية للخلية النباتية',
    },
    function: {
      en: 'Performs photosynthesis to produce glucose',
      ar: 'تقوم بعملية التمثيل الضوئي لإنتاج الجلوكوز',
    },
    facts: [
      { en: 'Contains chlorophyll (green pigment)', ar: 'تحتوي على الكلوروفيل (صبغة خضراء)' },
      { en: 'Converts sunlight into chemical energy', ar: 'تحول ضوء الشمس إلى طاقة كيميائية' },
      { en: 'Only found in plant cells', ar: 'توجد فقط في الخلايا النباتية' },
    ],
  },
  {
    id: 'vacuole',
    name: { en: 'Vacuole', ar: 'الفجوة' },
    position: [-1, 0, -3],
    size: 2.5,
    color: '#3b82f6',
    shape: 'sphere',
    inPlantCell: true,
    inAnimalCell: true,
    description: {
      en: 'Storage compartment',
      ar: 'حجرة التخزين',
    },
    function: {
      en: 'Stores water, nutrients, and waste products',
      ar: 'تخزن الماء والمواد الغذائية والنفايات',
    },
    facts: [
      { en: 'Much larger in plant cells (up to 90% of volume)', ar: 'أكبر بكثير في الخلايا النباتية (حتى 90٪ من الحجم)' },
      { en: 'Helps maintain cell shape and rigidity', ar: 'تساعد في الحفاظ على شكل الخلية وصلابتها' },
      { en: 'Small and numerous in animal cells', ar: 'صغيرة وعديدة في الخلايا الحيوانية' },
    ],
  },
  {
    id: 'cell-membrane',
    name: { en: 'Cell Membrane', ar: 'غشاء الخلية' },
    position: [0, 0, 0],
    size: 8,
    color: '#a78bfa',
    shape: 'sphere',
    inPlantCell: true,
    inAnimalCell: true,
    description: {
      en: 'The cell boundary',
      ar: 'حدود الخلية',
    },
    function: {
      en: 'Controls what enters and leaves the cell',
      ar: 'تتحكم في ما يدخل ويخرج من الخلية',
    },
    facts: [
      { en: 'Made of phospholipid bilayer', ar: 'مصنوعة من طبقة ثنائية من الفوسفوليبيد' },
      { en: 'Selectively permeable (acts as gatekeeper)', ar: 'نفاذية انتقائية (تعمل كحارس البوابة)' },
      { en: 'Contains proteins for transport and signaling', ar: 'تحتوي على بروتينات للنقل والإشارات' },
    ],
  },
  {
    id: 'cell-wall',
    name: { en: 'Cell Wall', ar: 'الجدار الخلوي' },
    position: [0, 0, 0],
    size: 8.5,
    color: '#a16207',
    shape: 'sphere',
    inPlantCell: true,
    inAnimalCell: false,
    description: {
      en: 'Rigid protective layer',
      ar: 'طبقة واقية صلبة',
    },
    function: {
      en: 'Provides structural support and protection',
      ar: 'توفر الدعم الهيكلي والحماية',
    },
    facts: [
      { en: 'Made of cellulose (in plants)', ar: 'مصنوع من السليلوز (في النباتات)' },
      { en: 'Located outside the cell membrane', ar: 'يقع خارج غشاء الخلية' },
      { en: 'Only in plant cells, fungi, and bacteria', ar: 'فقط في الخلايا النباتية والفطريات والبكتيريا' },
    ],
  },
];

interface CellSceneProps {
  language: VRLanguage;
  cellType: 'animal' | 'plant';
  onOrganelleClick: (organelle: OrganelleData) => void;
  cutawayAngle: number;
}

/**
 * Individual Organelle Component
 */
function Organelle({
  data,
  onClick,
  cutawayAngle,
}: {
  data: OrganelleData;
  onClick: () => void;
  cutawayAngle: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Slow rotation for visual interest
  useFrame((state, delta) => {
    if (meshRef.current && data.id !== 'cell-membrane' && data.id !== 'cell-wall') {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  // Calculate if this organelle should be visible based on cutaway angle
  const isVisible = useMemo(() => {
    if (data.id === 'cell-membrane' || data.id === 'cell-wall') return true;

    // Convert cutaway angle to radians
    const cutawayRad = (cutawayAngle * Math.PI) / 180;
    const organelleAngle = Math.atan2(data.position[2], data.position[0]);

    // Show organelles in the visible hemisphere
    const angleDiff = Math.abs(organelleAngle - cutawayRad);
    return angleDiff > Math.PI / 2;
  }, [cutawayAngle, data.position, data.id]);

  // Render different shapes based on organelle type
  const renderShape = () => {
    const scale = hovered ? 1.1 : 1;

    switch (data.shape) {
      case 'oval':
        return <sphereGeometry args={[data.size * scale, 16, 16, 0, Math.PI * 2, 0, Math.PI]} />;
      case 'rod':
        return <capsuleGeometry args={[data.size * 0.3 * scale, data.size * scale, 8, 16]} />;
      case 'network':
        return <boxGeometry args={[data.size * scale, data.size * 0.5 * scale, data.size * 0.5 * scale]} />;
      default:
        return <sphereGeometry args={[data.size * scale, 32, 32]} />;
    }
  };

  // Special rendering for membrane and wall
  if (data.id === 'cell-membrane' || data.id === 'cell-wall') {
    const isWall = data.id === 'cell-wall';
    const cutawayRad = (cutawayAngle * Math.PI) / 180;

    return (
      <mesh
        ref={meshRef}
        position={data.position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry
          args={[
            data.size,
            32,
            32,
            cutawayRad - Math.PI,
            Math.PI,
            0,
            Math.PI,
          ]}
        />
        <meshStandardMaterial
          color={data.color}
          transparent
          opacity={hovered ? 0.4 : 0.2}
          side={THREE.DoubleSide}
          wireframe={isWall}
        />
      </mesh>
    );
  }

  if (!isVisible) return null;

  return (
    <mesh
      ref={meshRef}
      position={data.position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {renderShape()}
      <meshStandardMaterial
        color={data.color}
        emissive={data.color}
        emissiveIntensity={hovered ? 0.4 : 0.1}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

/**
 * Cell Scene Component
 *
 * Renders an interactive 3D model of a plant or animal cell with labeled organelles.
 * Features cutaway view to see internal structures.
 */
export function CellScene({
  language,
  cellType,
  onOrganelleClick,
  cutawayAngle,
}: CellSceneProps) {
  // Filter organelles based on cell type
  const visibleOrganelles = useMemo(() => {
    return ORGANELLES_DATA.filter((organelle) =>
      cellType === 'plant' ? organelle.inPlantCell : organelle.inAnimalCell
    );
  }, [cellType]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Organelles */}
      {visibleOrganelles.map((organelle) => (
        <Organelle
          key={organelle.id}
          data={organelle}
          onClick={() => onOrganelleClick(organelle)}
          cutawayAngle={cutawayAngle}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={15}
        maxDistance={50}
        zoomSpeed={1}
      />
    </>
  );
}


