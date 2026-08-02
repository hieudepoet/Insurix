"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function Dodecahedron() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <dodecahedronGeometry args={[1.5, 0]} />
      <meshStandardMaterial
        color="#3b82f6"
        wireframe
        emissive="#3b82f6"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function FloatingOctahedron({ position, speed }: { position: [number, number, number]; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed;
      meshRef.current.rotation.z = state.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={0.4}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#06b6d4"
          wireframe
          emissive="#06b6d4"
          emissiveIntensity={0.4}
        />
      </mesh>
    </Float>
  );
}

function FloatingSphere({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={3} rotationIntensity={0.2} floatIntensity={2}>
      <mesh position={position} scale={0.15}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.8}
        />
      </mesh>
    </Float>
  );
}

function Particles() {
  const count = 50;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#3b82f6" transparent opacity={0.6} />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} color="#06b6d4" intensity={0.3} />

      <Dodecahedron />

      <FloatingOctahedron position={[3, 1, -2]} speed={0.3} />
      <FloatingOctahedron position={[-3, -1, -1]} speed={0.4} />
      <FloatingOctahedron position={[1, -2.5, 1]} speed={0.25} />

      <FloatingSphere position={[2, 2, 1]} />
      <FloatingSphere position={[-2, 1.5, -1]} />
      <FloatingSphere position={[-1, -2, 2]} />

      <Particles />

      <Environment preset="night" />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={1.5}
        />
      </EffectComposer>
    </>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "linear-gradient(180deg, #0a0e27 0%, #1a1a3e 100%)" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
