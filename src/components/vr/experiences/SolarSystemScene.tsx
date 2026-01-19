'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { VRLanguage, InfoHotspot } from '@/types/vr';

/**
 * Planet data with accurate relative sizes and orbital characteristics
 */
interface PlanetData {
  name: { en: string; ar: string };
  radiusKm: number; // Actual radius in km
  distanceFromSunAU: number; // Actual distance in Astronomical Units
  color: string;
  orbitalPeriodDays: number; // Time to complete one orbit
  rotationPeriodHours: number; // Time to complete one rotation
  moons: number;
  description: { en: string; ar: string };
  facts: Array<{ en: string; ar: string }>;
}

const PLANETS_DATA: PlanetData[] = [
  {
    name: { en: 'Mercury', ar: 'عطارد' },
    radiusKm: 2439,
    distanceFromSunAU: 0.39,
    color: '#8c7853',
    orbitalPeriodDays: 88,
    rotationPeriodHours: 1407.6,
    moons: 0,
    description: {
      en: 'The smallest and fastest planet, closest to the Sun',
      ar: 'أصغر وأسرع كوكب، الأقرب إلى الشمس',
    },
    facts: [
      { en: 'Extreme temperature variations (-173°C to 427°C)', ar: 'تغيرات حرارة شديدة (-173 إلى 427 درجة مئوية)' },
      { en: 'No atmosphere to retain heat', ar: 'لا غلاف جوي للاحتفاظ بالحرارة' },
      { en: 'Named after the Roman messenger god', ar: 'سمي على اسم إله الرسائل الروماني' },
    ],
  },
  {
    name: { en: 'Venus', ar: 'الزهرة' },
    radiusKm: 6051,
    distanceFromSunAU: 0.72,
    color: '#ffc649',
    orbitalPeriodDays: 225,
    rotationPeriodHours: 5832.5,
    moons: 0,
    description: {
      en: 'The hottest planet with a thick toxic atmosphere',
      ar: 'أسخن كوكب مع غلاف جوي سام كثيف',
    },
    facts: [
      { en: 'Surface temperature: 462°C (hot enough to melt lead)', ar: 'درجة حرارة السطح: 462 درجة مئوية (كافية لصهر الرصاص)' },
      { en: 'Rotates backwards (retrograde rotation)', ar: 'يدور بالعكس (دوران رجعي)' },
      { en: 'Brightest planet visible from Earth', ar: 'أسطع كوكب يُرى من الأرض' },
    ],
  },
  {
    name: { en: 'Earth', ar: 'الأرض' },
    radiusKm: 6371,
    distanceFromSunAU: 1.0,
    color: '#4169e1',
    orbitalPeriodDays: 365,
    rotationPeriodHours: 24,
    moons: 1,
    description: {
      en: 'Our home planet, the only known world with life',
      ar: 'كوكبنا الأم، العالم الوحيد المعروف بالحياة',
    },
    facts: [
      { en: 'The only planet with liquid water on surface', ar: 'الكوكب الوحيد بمياه سائلة على السطح' },
      { en: '71% of surface covered by oceans', ar: '71٪ من السطح مغطى بالمحيطات' },
      { en: 'Perfect distance from Sun for life', ar: 'مسافة مثالية من الشمس للحياة' },
    ],
  },
  {
    name: { en: 'Mars', ar: 'المريخ' },
    radiusKm: 3389,
    distanceFromSunAU: 1.52,
    color: '#cd5c5c',
    orbitalPeriodDays: 687,
    rotationPeriodHours: 24.6,
    moons: 2,
    description: {
      en: 'The Red Planet, target for future human exploration',
      ar: 'الكوكب الأحمر، هدف للاستكشاف البشري المستقبلي',
    },
    facts: [
      { en: 'Has the largest volcano in solar system (Olympus Mons)', ar: 'يحتوي على أكبر بركان في النظام الشمسي (جبل أوليمبوس)' },
      { en: 'Evidence of ancient river valleys', ar: 'أدلة على وديان أنهار قديمة' },
      { en: 'Day length similar to Earth (24.6 hours)', ar: 'طول اليوم مماثل للأرض (24.6 ساعة)' },
    ],
  },
  {
    name: { en: 'Jupiter', ar: 'المشتري' },
    radiusKm: 69911,
    distanceFromSunAU: 5.2,
    color: '#daa520',
    orbitalPeriodDays: 4333,
    rotationPeriodHours: 9.9,
    moons: 95,
    description: {
      en: 'The largest planet, a gas giant with the Great Red Spot',
      ar: 'أكبر كوكب، عملاق غازي مع البقعة الحمراء العظيمة',
    },
    facts: [
      { en: 'Great Red Spot is a storm larger than Earth', ar: 'البقعة الحمراء العظيمة عاصفة أكبر من الأرض' },
      { en: 'Has 95 known moons, including Ganymede (largest moon)', ar: 'لديه 95 قمراً معروفاً، بما في ذلك جانيميد (أكبر قمر)' },
      { en: 'Protects Earth from asteroids with its gravity', ar: 'يحمي الأرض من الكويكبات بجاذبيته' },
    ],
  },
  {
    name: { en: 'Saturn', ar: 'زحل' },
    radiusKm: 58232,
    distanceFromSunAU: 9.54,
    color: '#f4a460',
    orbitalPeriodDays: 10759,
    rotationPeriodHours: 10.7,
    moons: 146,
    description: {
      en: 'Famous for its spectacular ring system',
      ar: 'مشهور بنظام حلقاته الرائع',
    },
    facts: [
      { en: 'Rings made of ice and rock particles', ar: 'الحلقات مصنوعة من جزيئات الجليد والصخور' },
      { en: 'Has 146 known moons, most in solar system', ar: 'لديه 146 قمراً معروفاً، الأكثر في النظام الشمسي' },
      { en: 'Density less than water - would float!', ar: 'كثافته أقل من الماء - سيطفو!' },
    ],
  },
  {
    name: { en: 'Uranus', ar: 'أورانوس' },
    radiusKm: 25362,
    distanceFromSunAU: 19.19,
    color: '#4fd0e7',
    orbitalPeriodDays: 30687,
    rotationPeriodHours: 17.2,
    moons: 28,
    description: {
      en: 'An ice giant that rotates on its side',
      ar: 'عملاق جليدي يدور على جانبه',
    },
    facts: [
      { en: 'Rotates on its side (98° axial tilt)', ar: 'يدور على جانبه (ميل محوري 98 درجة)' },
      { en: 'Coldest planetary atmosphere (-224°C)', ar: 'أبرد غلاف جوي كوكبي (-224 درجة مئوية)' },
      { en: 'Has faint rings discovered in 1977', ar: 'لديه حلقات خفيفة اكتشفت عام 1977' },
    ],
  },
  {
    name: { en: 'Neptune', ar: 'نبتون' },
    radiusKm: 24622,
    distanceFromSunAU: 30.07,
    color: '#4169e1',
    orbitalPeriodDays: 60190,
    rotationPeriodHours: 16.1,
    moons: 16,
    description: {
      en: 'The windiest planet, furthest from the Sun',
      ar: 'أكثر كوكب عاصف، الأبعد عن الشمس',
    },
    facts: [
      { en: 'Fastest winds in solar system (2,100 km/h)', ar: 'أسرع رياح في النظام الشمسي (2,100 كم/ساعة)' },
      { en: 'Takes 165 Earth years to orbit the Sun', ar: 'يستغرق 165 عاماً أرضياً للدوران حول الشمس' },
      { en: 'Discovered mathematically before observation', ar: 'اكتشف رياضياً قبل الرصد' },
    ],
  },
];

interface SolarSystemSceneProps {
  language: VRLanguage;
  onPlanetClick: (planet: PlanetData, index: number) => void;
  realisticScale: boolean;
  animationSpeed: number;
}

/**
 * Individual Planet Component
 */
function Planet({
  data,
  index,
  scale,
  distanceScale,
  onClick,
  animationSpeed,
}: {
  data: PlanetData;
  index: number;
  scale: number;
  distanceScale: number;
  onClick: () => void;
  animationSpeed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate scaled sizes
  const displayRadius = (data.radiusKm / 6371) * scale; // Relative to Earth
  const orbitRadius = data.distanceFromSunAU * distanceScale;

  // Animate planet rotation and orbital movement
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate planet on its axis
      const rotationSpeed = (24 / data.rotationPeriodHours) * animationSpeed;
      meshRef.current.rotation.y += delta * rotationSpeed;
    }

    if (groupRef.current) {
      // Orbit around the sun
      const orbitalSpeed = (365 / data.orbitalPeriodDays) * animationSpeed * 0.1;
      groupRef.current.rotation.y += delta * orbitalSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        position={[orbitRadius, 0, 0]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <sphereGeometry args={[displayRadius, 32, 32]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={hovered ? 0.4 : 0.2}
        />
        {/* Orbit path */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[-orbitRadius, 0, 0]}>
          <ringGeometry args={[orbitRadius - 0.05, orbitRadius + 0.05, 64]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      </mesh>
    </group>
  );
}

/**
 * Sun Component
 */
function Sun({ scale }: { scale: number }) {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={sunRef} position={[0, 0, 0]}>
      <sphereGeometry args={[scale * 20, 32, 32]} />
      <meshBasicMaterial color="#FDB813" />
      {/* Sun glow */}
      <pointLight color="#FDB813" intensity={2} distance={1000} />
      <mesh scale={1.2}>
        <sphereGeometry args={[scale * 20, 32, 32]} />
        <meshBasicMaterial
          color="#FDB813"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
    </mesh>
  );
}

/**
 * Solar System Scene Component
 *
 * Renders an interactive 3D model of the solar system with all 8 planets,
 * orbital animations, and clickable info hotspots.
 */
export function SolarSystemScene({
  language,
  onPlanetClick,
  realisticScale,
  animationSpeed,
}: SolarSystemSceneProps) {
  // Scale factors
  const planetScale = realisticScale ? 0.3 : 1.5; // Size multiplier for planets
  const distanceScale = realisticScale ? 15 : 8; // Distance multiplier for orbits

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#FDB813" />

      {/* Stars background */}
      <Stars
        radius={300}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Sun */}
      <Sun scale={planetScale} />

      {/* Planets */}
      {PLANETS_DATA.map((planet, index) => (
        <Planet
          key={planet.name.en}
          data={planet}
          index={index}
          scale={planetScale}
          distanceScale={distanceScale}
          onClick={() => onPlanetClick(planet, index)}
          animationSpeed={animationSpeed}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={20}
        maxDistance={500}
        zoomSpeed={1.5}
      />
    </>
  );
}

export { PLANETS_DATA };
export type { PlanetData };
