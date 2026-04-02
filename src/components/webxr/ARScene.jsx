import { createXRStore, XR } from '@react-three/xr';

const store = createXRStore();
import { Canvas } from '@react-three/fiber';
import { Environment, Text, Float } from '@react-three/drei';
import WaterPlane from '../shaders/WaterPlane';

export default function ARScene({ depth = 0.5, onBack, increaseWater, decreaseWater }) {
    return (
        <div className="w-full h-full relative bg-slate-900 overflow-hidden">

            {/* Back Button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 z-50 px-8 py-4 bg-slate-800/90 hover:bg-sky-600 border border-sky-500/50 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.3)] backdrop-blur-md transition-all flex items-center gap-3 active:scale-95 pointer-events-auto"
                >
                    <span className="text-2xl">←</span> Return Home
                </button>
            )}

            {/* Professional AR Overlay UI */}
            <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center bg-gradient-to-t from-slate-950/80 to-transparent">
                <h2 className="text-4xl font-black text-white mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight">Field Augmented Reality</h2>
                <p className="text-lg text-slate-200 drop-shadow-md bg-slate-800/60 p-6 rounded-2xl backdrop-blur-md max-w-md text-center border border-slate-600/50 shadow-2xl">
                    Point your device camera at the floor to anchor the digital true-to-life water simulation.<br /><br />
                    <span className="text-sky-400 font-semibold">Click the button below to initialize XR tracking.</span>
                </p>
            </div>

            <button onClick={() => store.enterAR()} className="!bg-sky-500 !text-white !px-8 !py-4 !rounded-full !font-black !text-lg !shadow-[0_0_30px_rgba(14,165,233,0.5)] hover:!scale-105 active:!scale-95 transition-transform !absolute !bottom-12 !left-1/2 !-translate-x-1/2 !z-50 !border-2 !border-sky-300">
                ENTER AR
            </button>

            <Canvas className="w-full h-full">
                <XR store={store}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 10]} intensity={1} />
                    <Environment preset="city" />

                    <group position={[0, 1.5, -2]}>
                        <Float speed={2} rotationIntensity={0} floatIntensity={1}>
                            {/* Status Readout */}
                            <Text fontSize={0.15} color={depth > 1.4 ? "#ef4444" : "#0ea5e9"} outlineWidth={0.015} outlineColor="black" fontWeight="bold" position={[0, 0.4, 0]}>
                                Projected Flood Plane: {depth.toFixed(2)}m
                            </Text>

                            {/* 3D Interactive Options */}
                            {decreaseWater && (
                                <mesh position={[-0.4, 0, 0]} onClick={decreaseWater}>
                                    <boxGeometry args={[0.3, 0.15, 0.05]} />
                                    <meshStandardMaterial color="#slate-700" metalness={0.8} roughness={0.2} emissive="#0ea5e9" emissiveIntensity={0.2} />
                                    <Text position={[0, 0, 0.03]} fontSize={0.08} color="white">- Water</Text>
                                </mesh>
                            )}

                            {increaseWater && (
                                <mesh position={[0.4, 0, 0]} onClick={increaseWater}>
                                    <boxGeometry args={[0.3, 0.15, 0.05]} />
                                    <meshStandardMaterial color="#slate-700" metalness={0.8} roughness={0.2} emissive="#ef4444" emissiveIntensity={0.5} />
                                    <Text position={[0, 0, 0.03]} fontSize={0.08} color="white">+ Water</Text>
                                </mesh>
                            )}
                        </Float>
                    </group>

                    {/* Stencil buffer / X-Ray mock */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                        <planeGeometry args={[100, 100]} />
                        <meshBasicMaterial colorWrite={false} depthWrite={true} />
                    </mesh>

                    <WaterPlane depth={depth} size={20} />
                </XR>
            </Canvas>
        </div>
    );
}
