import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Grid, Text, Float, Sparkles, ContactShadows, RoundedBox } from '@react-three/drei';
import { createXRStore, XR } from '@react-three/xr';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import WaterPlane from '../shaders/WaterPlane';

const store = createXRStore();

// A flying drone that patrols around a center point
function PatrolDrone({ center, radius, speed, height, isCritical }) {
    const ref = useRef();

    useFrame(({ clock }) => {
        const t = clock.elapsedTime * speed;
        if (ref.current) {
            // Circle mathematically
            ref.current.position.x = center[0] + Math.cos(t) * radius;
            ref.current.position.z = center[2] + Math.sin(t) * radius;
            // Bob up and down
            ref.current.position.y = height + Math.sin(t * 8) * 0.3;
            // Look forward along trajectory
            ref.current.rotation.y = -t;
        }
    });

    const droneColor = isCritical ? "#ef4444" : "#38bdf8";

    return (
        <group ref={ref}>
            <RoundedBox args={[0.5, 0.1, 0.5]} radius={0.02} smoothness={2}>
                <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
            </RoundedBox>
            <mesh position={[0, -0.05, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
                <meshStandardMaterial color={droneColor} emissive={droneColor} emissiveIntensity={2} />
            </mesh>
            {/* Light cast by the drone */}
            <spotLight position={[0, 0, 0]} angle={0.5} penumbra={0.5} intensity={2} color={droneColor} target-position={[0, -2, 0]} />
        </group>
    );
}

// In-world VR Dashboard Panel
function VRDashboard({ depth }) {
    const isCritical = depth > 3.0; // Assume 3m is a major threshold for the city
    const statusColor = isCritical ? "#fca5a5" : "#86efac";
    const statusText = isCritical ? "CRITICAL FLOOD WARNING" : "ALL SYSTEMS NOMINAL";

    return (
        <Float speed={2} rotationIntensity={0.05} floatIntensity={0.2} position={[0, 5, -5]}>
            <mesh>
                <boxGeometry args={[6, 3, 0.1]} />
                <meshStandardMaterial color="#0f172a" opacity={0.8} transparent border />
            </mesh>

            <Text position={[0, 0.8, 0.06]} fontSize={0.4} color={statusColor} anchorY="middle" outlineWidth={0.02} outlineColor="black">
                {statusText}
            </Text>

            <Text position={[0, 0, 0.06]} fontSize={1.2} color="white" anchorY="middle" font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf">
                {depth.toFixed(2)}m
            </Text>

            <Text position={[0, -0.8, 0.06]} fontSize={0.25} color="#94a3b8" anchorY="middle">
                Live Topographical Deviation
            </Text>
        </Float>
    );
}

function Building({ position, args, name, waterDepth }) {
    const height = args[1];
    const isSubmerged = waterDepth > height * 0.5;
    const isSafe = waterDepth <= 0;

    const color = isSubmerged ? "#ef4444" : isSafe ? "#22c55e" : "#eab308";

    return (
        <group position={position}>
            <mesh position={[0, height / 2, 0]}>
                <boxGeometry args={args} />
                <meshStandardMaterial color={color} roughness={0.2} metalness={0.6} emissive={color} emissiveIntensity={0.1} />
            </mesh>

            <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
                <Text
                    position={[0, height + 1.5, 0]}
                    fontSize={0.6}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="#000000"
                    font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf"
                >
                    {name}
                </Text>
            </Float>

            {isSubmerged && (
                <Text
                    position={[0, height + 0.6, 0]}
                    fontSize={0.4}
                    color="#fca5a5"
                    anchorX="center"
                    anchorY="middle"
                >
                    ⚠️ EVACUATE
                </Text>
            )}
        </group>
    );
}

export default function DigitalTwin({ depth = 0.5, users = [], onBack }) {
    const isCritical = depth > 3.0;

    return (
        <div className="w-full h-full relative bg-slate-950 overflow-hidden">

            {/* Back Button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 z-50 px-8 py-4 bg-slate-800/90 hover:bg-sky-600 border border-sky-500/50 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.3)] backdrop-blur-md transition-all flex items-center gap-3 active:scale-95"
                >
                    <span className="text-2xl">←</span> Return Home
                </button>
            )}

            {/* Instructional Graphic Overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-3xl pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-2xl flex items-center gap-6">
                    <div className="text-4xl">🥽</div>
                    <div>
                        <h2 className="text-2xl font-black text-white">Immersive VR Experience</h2>
                        <p className="text-slate-300">
                            Use your mouse or touch to pan safely from an orbital view.<br />
                            <span className="font-bold text-sky-400">If you have a VR headset, click the "ENTER VR" button in the bottom right corner</span> to immerse yourself securely into the War Room Twin.
                        </p>
                    </div>
                </div>
            </div>

            <button onClick={() => store.enterVR()} className="!bg-sky-600 !text-white !p-6 !text-lg !rounded-2xl !font-black !shadow-[0_0_40px_rgba(2,132,199,0.8)] border hover:!bg-sky-500 hover:!scale-105 active:!scale-95 transition-all !absolute !bottom-8 !right-8 !z-50 uppercase tracking-widest">
                ENTER VR
            </button>

            <Canvas camera={{ position: [-5, 12, 15], fov: 50 }}>
                <XR store={store}>
                    {/* Dynamic Sky and Lighting */}
                    <Sky sunPosition={isCritical ? [0, 5, -100] : [100, 20, 100]} turbidity={isCritical ? 10 : 0.1} rayleigh={isCritical ? 5 : 0.5} />
                    <ambientLight intensity={isCritical ? 0.2 : 0.4} color={isCritical ? "#fca5a5" : "white"} />
                    <directionalLight position={[10, 20, 10]} intensity={isCritical ? 0.5 : 1.5} shadow-mapSize={1024} castShadow color={isCritical ? "#f87171" : "white"} />

                    <Grid
                        infiniteGrid
                        fadeDistance={50}
                        sectionColor={isCritical ? "#ef4444" : "#0ea5e9"}
                        cellColor={isCritical ? "#991b1b" : "#0284c7"}
                        position={[0, -0.01, 0]}
                        cellThickness={0.5}
                    />

                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                        <planeGeometry args={[100, 100]} />
                        <meshStandardMaterial color="#0f172a" />
                    </mesh>

                    {/* In-World Floating Dashboard facing the user */}
                    <VRDashboard depth={depth} />

                    {/* IoT Array */}
                    <group position={[8, 0, -8]}>
                        <mesh position={[0, 0.1, 0]}>
                            <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
                            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.8} />
                        </mesh>
                        <Float speed={6} rotationIntensity={1} floatIntensity={2}>
                            <mesh position={[0, 2.5, 0]}>
                                <octahedronGeometry args={[0.7]} />
                                <meshStandardMaterial color="#7dd3fc" wireframe />
                            </mesh>
                            <Text position={[0, 4, 0]} fontSize={0.6} color="#bae6fd" outlineWidth={0.05} outlineColor="black">IoT Array Alpha</Text>
                        </Float>
                    </group>

                    {/* Emergency Patrol Drones */}
                    <PatrolDrone center={[0, 0, 0]} radius={8} speed={0.5} height={8} isCritical={isCritical} />
                    <PatrolDrone center={[-7, 0, 4]} radius={5} speed={-0.8} height={6} isCritical={isCritical} />

                    <Building position={[0, 0, 0]} args={[4, 6, 4]} name="Central Hospital" waterDepth={depth} />
                    <Building position={[-7, 0, 4]} args={[3, 3, 3]} name="Residential Block A" waterDepth={depth} />
                    <Building position={[-10, 0, -2]} args={[3, 2.5, 3]} name="Residential Block B" waterDepth={depth} />
                    <Building position={[7, 0, 5]} args={[2, 10, 2]} name="Comms Tower" waterDepth={depth} />
                    <Building position={[-2, 0, -8]} args={[6, 2, 4]} name="Power Substation" waterDepth={depth} />
                    <Building position={[5, 0, -2]} args={[3, 4, 3]} name="Logistics Hub" waterDepth={depth} />

                    <WaterPlane depth={depth} size={70} />

                    <Sparkles count={800} scale={60} size={isCritical ? 10 : 5} speed={isCritical ? 2.0 : 0.4} opacity={0.4} color={isCritical ? "#f87171" : "white"} />
                    <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.6} far={10} color="#000000" />

                    {users.map((u, i) => (
                        <group key={i} position={u.position}>
                            <mesh>
                                <sphereGeometry args={[0.5, 16, 16]} />
                                <meshStandardMaterial color={u.color || "hotpink"} roughness={0.2} metalness={0.8} emissive={u.color} emissiveIntensity={0.5} />
                            </mesh>
                            <Text position={[0, 1.5, 0]} fontSize={0.4} color={u.color} outlineWidth={0.02} outlineColor="black">Manager {i + 1}</Text>
                        </group>
                    ))}

                    <EffectComposer disableNormalPass>
                        <Bloom luminanceThreshold={isCritical ? 0.2 : 0.5} mipmapBlur intensity={1.5} />
                        <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    </EffectComposer>
                </XR>
                <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.05} minDistance={5} maxDistance={40} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
