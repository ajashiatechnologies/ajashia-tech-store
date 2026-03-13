import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Box, Cylinder, Environment, Float, Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

interface ArduinoModelProps {
  color?: string;
}

const ArduinoBoard = ({ color = "#0066CC" }: ArduinoModelProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Main PCB Board */}
        <Box args={[3, 0.1, 2]} position={[0, 0, 0]}>
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
        </Box>

        {/* USB Port */}
        <Box args={[0.4, 0.2, 0.3]} position={[-1.4, 0.15, -0.7]}>
          <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
        </Box>

        {/* Power Jack */}
        <Cylinder args={[0.15, 0.15, 0.3]} rotation={[0, 0, Math.PI / 2]} position={[-1.4, 0.15, 0.5]}>
          <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.5} />
        </Cylinder>

        {/* Microcontroller Chip */}
        <Box args={[0.8, 0.15, 0.4]} position={[0.3, 0.125, 0]}>
          <meshStandardMaterial color="#333333" metalness={0.4} roughness={0.6} />
        </Box>

        {/* Crystal Oscillator */}
        <Cylinder args={[0.1, 0.1, 0.05]} rotation={[Math.PI / 2, 0, 0]} position={[0.3, 0.1, 0.5]}>
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
        </Cylinder>

        {/* Pin Headers - Top */}
        {Array.from({ length: 14 }).map((_, i) => (
          <Box key={`top-${i}`} args={[0.08, 0.2, 0.08]} position={[-1.2 + i * 0.18, 0.15, -0.85]}>
            <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
          </Box>
        ))}

        {/* Pin Headers - Bottom */}
        {Array.from({ length: 14 }).map((_, i) => (
          <Box key={`bottom-${i}`} args={[0.08, 0.2, 0.08]} position={[-1.2 + i * 0.18, 0.15, 0.85]}>
            <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
          </Box>
        ))}

        {/* LEDs */}
        <Box args={[0.08, 0.05, 0.08]} position={[1.2, 0.1, -0.3]}>
          <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={2} />
        </Box>
        <Box args={[0.08, 0.05, 0.08]} position={[1.2, 0.1, 0]}>
          <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={2} />
        </Box>

        {/* Reset Button */}
        <Cylinder args={[0.1, 0.1, 0.08]} position={[0.8, 0.14, -0.5]}>
          <meshStandardMaterial color="#FF4444" metalness={0.3} roughness={0.8} />
        </Cylinder>

        {/* Capacitors */}
        <Cylinder args={[0.08, 0.08, 0.2]} position={[-0.5, 0.15, 0.4]}>
          <meshStandardMaterial color="#444444" metalness={0.5} roughness={0.5} />
        </Cylinder>
        <Cylinder args={[0.08, 0.08, 0.2]} position={[-0.7, 0.15, 0.4]}>
          <meshStandardMaterial color="#444444" metalness={0.5} roughness={0.5} />
        </Cylinder>
      </group>
    </Float>
  );
};

const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#813FF1" wireframe />
  </mesh>
);

interface ProductViewer3DProps {
  productType?: "arduino" | "sensor" | "module";
  color?: string;
  className?: string;
}

export const ProductViewer3D = ({ productType = "arduino", color, className = "" }: ProductViewer3DProps) => {
  return (
    <div className={`w-full h-full min-h-[300px] rounded-2xl overflow-hidden bg-gradient-to-br from-card to-background ${className}`}>
      <Canvas camera={{ position: [4, 3, 4], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#813FF1" />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#1E90FF" />
        
        <Suspense fallback={<LoadingFallback />}>
          <ArduinoBoard color={color} />
          <Environment preset="city" />
        </Suspense>
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          minDistance={3} 
          maxDistance={10}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};
