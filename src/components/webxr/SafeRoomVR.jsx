import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Text, ContactShadows, RoundedBox } from '@react-three/drei';
import { createXRStore, XR } from '@react-three/xr';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import WaterPlane from '../shaders/WaterPlane';

const store = createXRStore();

export default function SafeRoomVR({ depth = 0.5, onBack }) {
    // If water touches the monitor base (around 1m), alarm triggers
    const isCritical = depth > 1.0;
    const alarmColor = isCritical ? "#ef4444" : "#10b981";

    return (
        <div className="w-full h-full relative bg-slate-950 overflow-hidden">
            {onBack && (
                <button onClick={onBack} className="absolute top-6 left-6 z-50 px-8 py-4 bg-slate-800/90 hover:bg-emerald-600 border border-emerald-500/50 text-white font-black rounded-2xl shadow-xl transition-all flex items-center gap-3">
                    <span className="text-2xl">←</span> Return Home
                </button>
            )}

            {/* VR HUD UI overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950/80 to-transparent pb-32">
                <h2 className="text-5xl font-black text-emerald-500 mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight uppercase">Safe Room VR</h2>
                <p className="text-xl text-slate-200 drop-shadow-md bg-slate-800/80 p-8 rounded-3xl backdrop-blur-md max-w-xl text-center border border-emerald-900/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <strong>META QUEST READY:</strong> Welcome to the indoor facility.<br /><br />
                    This enclosed control room features an emergency data monitor. Experience what happens when internal structural seals fail.
                </p>
            </div>

            <button onClick={() => store.enterVR()} className="!bg-emerald-600 !text-white !p-6 !text-lg !rounded-2xl !font-black border-2 border-emerald-400 hover:!bg-emerald-500 hover:scale-105 active:scale-95 transition-all !absolute !bottom-12 !right-12 !z-50 uppercase shadow-[0_0_40px_rgba(16,185,129,0.8)] pointer-events-auto">
                ENTER SAFE ROOM VR
            </button>

            <Canvas camera={{ position: [0, 1.6, 2], fov: 70 }}>
                <XR store={store}>
                    {/* Lighting dynamically changes to emergency red if critical */}
                    <ambientLight intensity={isCritical ? 0.3 : 0.7} color={isCritical ? "#fecaca" : "white"} />
                    <pointLight position={[0, 2.8, 0]} intensity={isCritical ? 2 : 1} color={alarmColor} className={isCritical ? "animate-pulse" : ""} />

                    <Environment preset="warehouse" />

                    {/* The Physical Room */}
                    <group>
                        {/* Floor */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                            <planeGeometry args={[10, 10]} />
                            <meshStandardMaterial color="#334155" roughness={0.8} />
                        </mesh>
                        {/* Ceiling */}
                        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
                            <planeGeometry args={[10, 10]} />
                            <meshStandardMaterial color="#1e293b" />
                        </mesh>
                        {/* Front Wall */}
                        <mesh position={[0, 1.5, -5]}>
                            <boxGeometry args={[10, 3, 0.2]} />
                            <meshStandardMaterial color="#475569" />
                        </mesh>
                        {/* Back Wall */}
                        <mesh position={[0, 1.5, 5]}>
                            <boxGeometry args={[10, 3, 0.2]} />
                            <meshStandardMaterial color="#475569" />
                        </mesh>
                        {/* Left Wall */}
                        <mesh position={[-5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                            <boxGeometry args={[10, 3, 0.2]} />
                            <meshStandardMaterial color="#475569" />
                        </mesh>
                        {/* Right Wall is completely Glass */}
                        <mesh position={[5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                            <boxGeometry args={[10, 3, 0.1]} />
                            <meshStandardMaterial color="#7dd3fc" transparent opacity={0.15} roughness={0.1} metalness={0.9} />
                        </mesh>
                    </group>

                    {/* Terminal / Monitor */}
                    <group position={[0, 1.4, -4.8]}>
                        <RoundedBox args={[3.0, 1.8, 0.1]} radius={0.05} smoothness={2}>
                            <meshStandardMaterial color="#0f172a" />
                        </RoundedBox>

                        {/* Monitor Screen Glass */}
                        <mesh position={[0, 0, 0.06]}>
                            <planeGeometry args={[2.8, 1.6]} />
                            <meshBasicMaterial color={isCritical ? "#450a0a" : "#022c22"} />
                        </mesh>

                        {/* UI rendered physically inside the VR room */}
                        <Text position={[0, 0.5, 0.08]} fontSize={0.25} color={alarmColor} anchorY="middle" outlineWidth={0.01} outlineColor="black">
                            {isCritical ? "EMERGENCY SEAL BREACH" : "O2 BAY SECURE"}
                        </Text>

                        <Text position={[0, 0, 0.08]} fontSize={0.6} color="white" anchorY="middle" font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf">
                            WATER LEVEL: {depth.toFixed(2)}m
                        </Text>

                        <Text position={[0, -0.6, 0.08]} fontSize={0.15} color="#94a3b8" anchorY="middle">
                            Room 4 - Ground Floor - Station Alpha
                        </Text>
                    </group>

                    {/* Rising Indoor Flood Water */}
                    <WaterPlane depth={depth} size={9.8} />

                    <EffectComposer disableNormalPass>
                        <Bloom luminanceThreshold={isCritical ? 0.3 : 0.6} mipmapBlur intensity={1.5} />
                        <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    </EffectComposer>
                </XR>
            </Canvas>
        </div>
    );
}
