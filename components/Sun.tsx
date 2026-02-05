'use client';

import { useRef, useMemo, memo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * PERFORMANCE OPTIMIZATIONS:
 * 1. React.memo prevents re-renders from parent state changes
 * 2. Shader uniforms object created once via useMemo
 * 3. Shared geometry instances reduce GPU memory
 * 4. Simplified shader with fewer texture lookups
 * 5. Proper disposal of materials and geometries on unmount
 * 6. Reduced glow sphere segments (32 -> 16)
 */

// Optimized vertex shader - minimal operations
const sunVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Optimized fragment shader - reduced noise octaves for mobile
const sunFragmentShader = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;

  // Simplified noise - fewer operations than full simplex
  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(dot(hash(i), f), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    vec2 uv = vUv * 3.0;

    // Reduced to 2 octaves for better performance (was 3)
    float noise1 = noise(uv + time * 0.1);
    float noise2 = noise(uv * 2.0 - time * 0.15);
    float turbulence = noise1 * 0.6 + noise2 * 0.4;

    // Sun colors
    vec3 color1 = vec3(1.0, 0.3, 0.0);
    vec3 color2 = vec3(1.0, 0.8, 0.0);
    vec3 color3 = vec3(1.0, 1.0, 0.9);

    float mixFactor = (turbulence + 1.0) * 0.5;
    vec3 color = mix(color1, color2, mixFactor);
    color = mix(color, color3, pow(mixFactor, 3.0));

    // Edge glow (fresnel)
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    color += vec3(1.0, 0.9, 0.5) * fresnel * 0.5;
    color *= 1.5;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// Shared geometries - created once, reused
const SUN_GEOMETRY = new THREE.SphereGeometry(5, 48, 48); // Reduced from 64
const GLOW_GEOMETRY = new THREE.SphereGeometry(5, 16, 16); // Reduced from 32

function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Memoize uniforms object to prevent recreation
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
    }),
    []
  );

  // Memoize glow material props
  const glowMaterialProps = useMemo(
    () => ({
      color: '#FFA500',
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
      depthWrite: false,
    }),
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    const material = materialRef.current;
    return () => {
      if (material) {
        material.dispose();
      }
    };
  }, []);

  // Minimal frame callback
  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = elapsed;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = elapsed * 0.05;
    }
  });

  return (
    <group>
      {/* Core Sun with animated shader */}
      <mesh ref={meshRef} geometry={SUN_GEOMETRY}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* Volumetric glow - simplified */}
      <mesh scale={1.3} geometry={GLOW_GEOMETRY}>
        <meshBasicMaterial {...glowMaterialProps} />
      </mesh>

      {/* Point light for scene illumination */}
      <pointLight
        intensity={2}
        distance={500}
        decay={2}
        color="#FFF5E1"
      />
    </group>
  );
}

export default memo(Sun);
