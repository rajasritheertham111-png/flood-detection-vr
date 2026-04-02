import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

export default function HumanModel({ depth, ...props }) {
    const group = useRef();
    const leftArm = useRef();
    const rightArm = useRef();

    // Panicking state makes arms wave
    const isPanicking = depth > 1.4;

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (isPanicking) {
            // Wave arms wildly
            if (leftArm.current) leftArm.current.rotation.x = Math.sin(time * 10) * 0.5 - 2.5;
            if (rightArm.current) rightArm.current.rotation.x = Math.cos(time * 10) * 0.5 - 2.5;
            // Bobbing body
            if (group.current) group.current.position.y = Math.abs(Math.sin(time * 8)) * 0.1;
        } else {
            // Calm idle breathing
            if (leftArm.current) leftArm.current.rotation.x = Math.sin(time) * 0.05;
            if (rightArm.current) rightArm.current.rotation.x = -Math.sin(time) * 0.05;
            if (group.current) group.current.position.y = Math.sin(time * 2) * 0.02;
        }
    });

    return (
        <group ref={group} {...props} dispose={null}>
            {/* Head - White Skin Tone */}
            <mesh position={[0, 1.55, 0]} castShadow>
                <sphereGeometry args={[0.12, 32, 32]} />
                <meshStandardMaterial color="#fcd34d" roughness={0.3} />
            </mesh>

            {/* Torso - White Shirt */}
            <RoundedBox args={[0.35, 0.55, 0.2]} position={[0, 1.15, 0]} radius={0.05} smoothness={4} castShadow>
                <meshStandardMaterial color="#ffffff" roughness={0.6} />
            </RoundedBox>

            {/* Left Arm - White Shirt Sleeve + Hand */}
            <group position={[-0.25, 1.35, 0]} ref={leftArm}>
                <RoundedBox args={[0.1, 0.5, 0.1]} position={[0, -0.25, 0]} radius={0.04} smoothness={4} castShadow>
                    <meshStandardMaterial color="#ffffff" />
                </RoundedBox>
                {/* Hand */}
                <mesh position={[0, -0.55, 0]} castShadow>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshStandardMaterial color="#fcd34d" />
                </mesh>
            </group>

            {/* Right Arm - White Shirt Sleeve + Hand */}
            <group position={[0.25, 1.35, 0]} ref={rightArm}>
                <RoundedBox args={[0.1, 0.5, 0.1]} position={[0, -0.25, 0]} radius={0.04} smoothness={4} castShadow>
                    <meshStandardMaterial color="#ffffff" />
                </RoundedBox>
                {/* Hand */}
                <mesh position={[0, -0.55, 0]} castShadow>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshStandardMaterial color="#fcd34d" />
                </mesh>
            </group>

            {/* Left Leg - Black Pants */}
            <RoundedBox args={[0.14, 0.7, 0.14]} position={[-0.09, 0.45, 0]} radius={0.03} smoothness={4} castShadow>
                <meshStandardMaterial color="#1e293b" />
            </RoundedBox>

            {/* Right Leg - Black Pants */}
            <RoundedBox args={[0.14, 0.7, 0.14]} position={[0.09, 0.45, 0]} radius={0.03} smoothness={4} castShadow>
                <meshStandardMaterial color="#1e293b" />
            </RoundedBox>

            {/* Shoes - Dark Leather */}
            <RoundedBox args={[0.15, 0.1, 0.2]} position={[-0.09, 0.05, 0.03]} radius={0.02} smoothness={2} castShadow>
                <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.5} />
            </RoundedBox>
            <RoundedBox args={[0.15, 0.1, 0.2]} position={[0.09, 0.05, 0.03]} radius={0.02} smoothness={2} castShadow>
                <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.5} />
            </RoundedBox>
        </group>
    );
}
