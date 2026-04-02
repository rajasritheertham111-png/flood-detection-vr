import React, { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Create a custom shader material for the water
const WaterShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color('#0ea5e9'),
        uOpacity: 0.65,
    },
    // Vertex Shader
    `
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 pos = position;
      // Physics-based wave animation
      float wave1 = sin(pos.x * 4.0 + uTime * 1.5) * 0.05;
      float wave2 = cos(pos.y * 3.0 + uTime * 1.2) * 0.05;
      pos.z += wave1 + wave2;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;
    void main() {
      // Create a reflective/gradient look
      float mixValue = (sin(vUv.x * 10.0) + cos(vUv.y * 10.0)) * 0.1 + 0.5;
      vec3 finalColor = mix(uColor, vec3(0.0, 0.5, 0.9), mixValue);
      gl_FragColor = vec4(finalColor, uOpacity);
    }
  `
);

// Register the material to be used declaratively in React Three Fiber
extend({ WaterShaderMaterial });

/**
 * Animated water plane using a custom GLSL shader
 * @param {number} depth - The height/depth of the water
 */
export default function WaterPlane({ depth = 0, size = 10, ...props }) {
    const materialRef = useRef();

    // Animate the uTime uniform every frame
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
        }
    });

    return (
        // position.y is determined by depth from the WaterLogic script
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, depth, 0]} {...props}>
            <planeGeometry args={[size, size, 64, 64]} />
            {/* depthWrite={false} helps with transparency sorting */}
            <waterShaderMaterial ref={materialRef} transparent depthWrite={false} />
        </mesh>
    );
}
