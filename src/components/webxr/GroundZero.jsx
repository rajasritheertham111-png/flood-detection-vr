import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Sky, ContactShadows, Text, Float } from '@react-three/drei';
import { createXRStore, XR } from '@react-three/xr';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import WaterPlane from '../shaders/WaterPlane';
import HumanModel from '../HumanModel';

const store = createXRStore();

export default function GroundZero({ depth = 0.5, onBack }) {
    // First-person perspective ground-level VR experience for Headsets

    const isCritical = depth > 1.4;

    return (
        <div className="w-full h-full relative bg-slate-950 overflow-hidden">
            {/* Return Home Button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 z-50 px-8 py-4 bg-slate-800/90 hover:bg-red-600 border border-red-500/50 text-white font-black rounded-2xl shadow-xl transition-all flex items-center gap-3 active:scale-95"
                >
                    <span className="text-2xl">←</span> Return Home
                </button>
            )}

            {/* VR HUD UI overlay for desktop preview */}
            <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950/80 to-transparent pb-32">
                <h2 className="text-5xl font-black text-red-500 mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight uppercase animate-pulse">Ground Zero VR</h2>
                <p className="text-xl text-slate-200 drop-shadow-md bg-slate-800/80 p-8 rounded-3xl backdrop-blur-md max-w-xl text-center border border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                    <strong>WARNING:</strong> This is a first-person immersive simulation.<br /><br />
                    Put on your VR Headset and click "ENTER VR" to experience the physical scale of the rising floodwaters from the ground level.
                </p>
            </div>

            <button onClick={() => store.enterVR()} className="!bg-red-600 !text-white !p-6 !text-lg !rounded-2xl !font-black !shadow-[0_0_40px_rgba(220,38,38,0.8)] border-2 border-red-400 hover:!bg-red-500 hover:!scale-105 active:!scale-95 transition-all !absolute !bottom-12 !right-12 !z-50 uppercase tracking-widest pointer-events-auto">
                ENTER GROUND ZERO VR
            </button>

            {/* Camera positioned at 1.6m (average human eye level) */}
            <Canvas camera={{ position: [0, 1.6, 2], fov: 75 }}>
                <XR store={store}>
                    <Sky sunPosition={[50, -5, 50]} turbidity={20} rayleigh={8} /> {/* Gloomy storm sky */}
                    <ambientLight intensity={0.2} color="#94a3b8" />
                    <directionalLight position={[10, 10, 10]} intensity={0.5} color="#cbd5e1" castShadow />

                    <Environment preset="night" />

                    {/* Flooded Street Ground */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                        <planeGeometry args={[100, 100]} />
                        <meshStandardMaterial color="#020617" roughness={0.9} />
                    </mesh>

                    {/* Another human standing directly in front of the user for terrifying scale reference */}
                    <group position={[0, 0, -2]}>
                        <HumanModel depth={depth} />
                    </group>

                    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} position={[-2, 1.5, -2]}>
                        <Text fontSize={0.2} color={isCritical ? "#f87171" : "#38bdf8"} outlineWidth={0.01} outlineColor="black">
                            Depth: {depth.toFixed(2)}m
                        </Text>
                    </Float>

                    {/* Infinite Rising Water */}
                    <WaterPlane depth={depth} size={150} />

                    <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.8} far={5} color="#000000" />

                    {/* Cinematic Under-water / Gloomy Post Processing */}
                    <EffectComposer disableNormalPass>
                        {/* If water is above eye level (1.6m), apply heavy blur to simulate being underwater */}
                        {depth > 1.6 && <DepthOfField focusDistance={0} focalLength={0.1} bokehScale={8} height={480} />}
                        <Bloom luminanceThreshold={0.1} mipmapBlur intensity={depth > 1.6 ? 3.0 : 0.8} />
                        <Vignette eskil={false} offset={0.1} darkness={1.2} />
                    </EffectComposer>
                </XR>
            </Canvas>
        </div>
    );
}
