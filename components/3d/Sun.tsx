'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y -= 0.0005;
    }
  });

  return (
    <group>
      {/* Core Sun */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>

      {/* Glow layer */}
      <mesh ref={glowRef} scale={1.2}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color="#ff6b00"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Point light for illumination */}
      <pointLight position={[0, 0, 0]} intensity={3} distance={500} decay={2} />
    </group>
  );
}
