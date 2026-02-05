'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useStore, PlanetData } from '@/store/useStore';
import * as Astronomy from 'astronomy-engine';

interface PlanetProps {
  name: string;
  data: PlanetData;
  initialAngle: number;
  currentDate: Date;
}

export default function Planet({ name, data, initialAngle, currentDate }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);

  const isSelected = selectedPlanet === name;
  const distance = data.distance * 10;
  const size = data.radius * 0.5;

  // Calculate real position using astronomy-engine
  useFrame(() => {
    if (meshRef.current && orbitRef.current) {
      try {
        // Get heliocentric position
        const body = name.charAt(0).toUpperCase() + name.slice(1);
        const astroBody = Astronomy.Body[body as keyof typeof Astronomy.Body];

        if (astroBody) {
          const position = Astronomy.HelioVector(astroBody, currentDate);

          // Scale down for visualization (AU to scene units)
          const scale = 10;
          meshRef.current.position.set(
            position.x * scale,
            position.y * scale,
            position.z * scale
          );
        }
      } catch (error) {
        // Fallback to simple circular orbit
        const angle = (initialAngle + Date.now() * 0.0001 * (1 / data.distance)) % (Math.PI * 2);
        meshRef.current.position.set(
          Math.cos(angle) * distance,
          0,
          Math.sin(angle) * distance
        );
      }

      // Rotate planet
      meshRef.current.rotation.y += 0.01;
    }
  });

  // Generate orbit path
  const orbitPoints = useMemo(() => {
    const points = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
      ));
    }
    return points;
  }, [distance]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    setSelectedPlanet(isSelected ? null : name);
  };

  return (
    <group ref={orbitRef}>
      {/* Orbit line */}
      <Line
        points={orbitPoints}
        color={data.color}
        lineWidth={1}
        transparent
        opacity={0.3}
      />

      {/* Planet */}
      <mesh ref={meshRef} onClick={handleClick}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={meshRef.current?.position} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.5, size * 1.7, 32]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
