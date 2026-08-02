"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";

function PulsingSphere({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const s = scale + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>
    </Float>
  );
}

function ConnectionLine({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.4}
    />
  );
}

function Particles() {
  const count = 40;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#3b82f6" transparent opacity={0.4} />
    </points>
  );
}

function Scene() {
  // Node positions: claim (left) -> 3 agents (center column) -> settlement (right)
  const claimPos: [number, number, number] = [-4, 0, 0];
  const agent1Pos: [number, number, number] = [-0.5, 2, 0];
  const agent2Pos: [number, number, number] = [-0.5, 0, 0];
  const agent3Pos: [number, number, number] = [-0.5, -2, 0];
  const settlementPos: [number, number, number] = [4, 0, 0];

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />

      {/* Claim node */}
      <PulsingSphere position={claimPos} color="#3b82f6" scale={1.2} />

      {/* Agent nodes */}
      <PulsingSphere position={agent1Pos} color="#06b6d4" />
      <PulsingSphere position={agent2Pos} color="#06b6d4" />
      <PulsingSphere position={agent3Pos} color="#06b6d4" />

      {/* Settlement node */}
      <PulsingSphere position={settlementPos} color="#22c55e" scale={1.2} />

      {/* Connection lines */}
      <ConnectionLine start={claimPos} end={agent1Pos} color="#3b82f6" />
      <ConnectionLine start={claimPos} end={agent2Pos} color="#3b82f6" />
      <ConnectionLine start={claimPos} end={agent3Pos} color="#3b82f6" />
      <ConnectionLine start={agent1Pos} end={settlementPos} color="#22c55e" />
      <ConnectionLine start={agent2Pos} end={settlementPos} color="#22c55e" />
      <ConnectionLine start={agent3Pos} end={settlementPos} color="#22c55e" />

      <Particles />
    </>
  );
}

export default function HowItWorksScene() {
  return (
    <div className="w-full h-[300px] md:h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
