import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import ARScene from './components/webxr/ARScene';
import DigitalTwin from './components/webxr/DigitalTwin';
import GroundZero from './components/webxr/GroundZero';
import SafeRoomVR from './components/webxr/SafeRoomVR';
import WaterPlane from './components/shaders/WaterPlane';
import HumanModel from './components/HumanModel';
import { calculateSubmergenceRisk } from './lib/waterLogic';

// Visualizer Component for the Dashboard
function DashboardVisualizer({ depth }) {
  return (
    <Canvas camera={{ position: [2, 2, 4], fov: 50 }} className="rounded-2xl shadow-xl w-full h-full bg-slate-900">
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <Environment preset="city" />

      {/* Ground Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <cylinderGeometry args={[2, 2, 0.1, 64]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Realistic Animated Soldier Model */}
      <HumanModel depth={depth} />

      {/* Water overlays the scene depending on depth */}
      {depth > 0 && <WaterPlane depth={depth} size={4.1} />}

      <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={5} blur={2} />
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} minDistance={2} maxDistance={10} />
    </Canvas>
  );
}

export default function App() {
  const [viewMode, setViewMode] = useState('dashboard');
  const [sensorLevel, setSensorLevel] = useState(7.0); // Starts safe at 7.0m
  const [groundElevation] = useState(7.0); // Constant 7m for simple visualization

  const { depth, severity } = calculateSubmergenceRisk(sensorLevel, groundElevation);
  const isAlertTriggered = depth > 0;
  // 1.4m is roughly chest height for the scaled HumanModel
  const isCritical = depth > 1.4;

  const increaseWater = () => setSensorLevel(prev => Math.min(prev + 0.2, 12.0));
  const decreaseWater = () => setSensorLevel(prev => Math.max(prev - 0.2, 5.0));

  return (
    <div className={`flex flex-col h-screen text-white font-sans overflow-hidden transition-colors duration-1000 ${isCritical ? 'bg-red-950' : 'bg-slate-950'}`}>

      <header className="p-4 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex justify-between items-center z-20 shadow-lg">
        <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2 text-sky-400">
          <span className="text-3xl">🌊</span> FloodAlert <span className="text-xs ml-1 bg-sky-900/50 text-sky-400 px-2 py-0.5 rounded-full border border-sky-800 font-mono tracking-normal">v2.0</span>
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('dashboard')} className={`px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'dashboard' ? 'bg-sky-500 shadow-sky-500/50 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}>Dashboard</button>
          <button onClick={() => setViewMode('ar')} className={`px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'ar' ? 'bg-sky-500 shadow-sky-500/50 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}>Field AR</button>
          <button onClick={() => setViewMode('vr')} className={`px-4 py-2 text-sm lg:text-base rounded-lg font-bold transition-all ${viewMode === 'vr' ? 'bg-sky-500 shadow-sky-500/50 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}>War Room VR</button>
          <button onClick={() => setViewMode('ground-zero')} className={`px-4 py-2 text-sm lg:text-base rounded-lg font-black transition-all ${viewMode === 'ground-zero' ? 'bg-red-600 shadow-red-500/50 shadow-lg border border-red-400' : 'bg-slate-800 hover:bg-red-900 border border-slate-700'}`}>Ground Zero VR</button>
          <button onClick={() => setViewMode('saferoom')} className={`px-4 py-2 text-sm lg:text-base rounded-lg font-black transition-all ${viewMode === 'saferoom' ? 'bg-emerald-600 shadow-emerald-500/50 shadow-lg border border-emerald-400' : 'bg-slate-800 hover:bg-emerald-900 border border-slate-700'}`}>Safe Room VR</button>
        </div>
      </header>

      <main className="flex-1 relative">

        {/* Fullscreen Threat Vignette */}
        {isCritical && viewMode === 'dashboard' && (
          <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_150px_rgba(220,38,38,0.5)] animate-pulse" />
        )}

        {viewMode === 'dashboard' && (
          <div className="h-full flex flex-col xl:flex-row p-6 gap-6 max-w-7xl mx-auto z-20 relative">

            {/* Left Column: UI Controls & Readouts */}
            <div className="flex-1 flex flex-col gap-6 justify-center max-w-lg">

              <div
                className={`p-8 rounded-3xl border-2 shadow-2xl transition-all duration-500 transform ${isCritical ? 'bg-red-600 border-red-400 scale-105 shadow-red-600/50' :
                  isAlertTriggered ? 'bg-amber-500 border-amber-300 scale-100 shadow-amber-500/30' :
                    'bg-slate-800 border-slate-700 scale-100'
                  }`}
              >
                {!isAlertTriggered ? (
                  <div className="text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <h2 className="text-3xl font-black text-slate-200">System Normal</h2>
                    <p className="text-slate-400 mt-2 font-medium">Water level is below ground elevation.</p>
                  </div>
                ) : (
                  <div className="text-center animate-pulse">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-wider">{severity} ALERT</h2>
                    <p className="text-white/90 mt-3 font-semibold text-lg bg-black/20 py-2 rounded-xl">
                      Water depth: <span className="font-bold">{depth.toFixed(2)}m</span> above ground
                    </p>
                    {isCritical && (
                      <p className="mt-4 font-bold text-white uppercase text-xl animate-bounce">Evacuate Immediately!</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-slate-800/80 backdrop-blur p-8 rounded-3xl border border-slate-700 shadow-lg">
                <h3 className="text-xl font-bold text-slate-300 mb-6 flex items-center justify-between">
                  Water Level Control
                  <span className="text-sky-400 font-mono text-2xl bg-sky-950 px-4 py-1 rounded-lg border border-sky-800">{sensorLevel.toFixed(2)}m</span>
                </h3>

                <div className="flex gap-4">
                  <button
                    onClick={decreaseWater}
                    className="flex-1 py-6 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white rounded-2xl font-black text-3xl transition-transform active:scale-95 shadow-md flex flex-col items-center justify-center gap-1"
                  >
                    <span>-</span>
                    <span className="text-xs font-medium text-slate-300 uppercase tracking-widest">Decrease</span>
                  </button>
                  <button
                    onClick={increaseWater}
                    className={`flex-1 py-6 rounded-2xl font-black text-3xl transition-transform active:scale-95 shadow-lg flex flex-col items-center justify-center gap-1 ${isCritical ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-sky-500 hover:bg-sky-400 text-white'
                      }`}
                  >
                    <span>+</span>
                    <span className="text-xs font-medium text-white/90 uppercase tracking-widest">Increase</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: 3D Visualizer */}
            <div className="flex-1 flex justify-center items-center p-2">
              <div className={`w-full h-full min-h-[500px] max-h-[800px] rounded-3xl overflow-hidden border-4 transition-colors duration-500 ${isCritical ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'border-slate-800'}`}>
                <DashboardVisualizer depth={depth} />
              </div>
            </div>

          </div>
        )}

        {viewMode === 'ar' && (
          <ARScene
            depth={depth}
            onBack={() => setViewMode('dashboard')}
            increaseWater={increaseWater}
            decreaseWater={decreaseWater}
          />
        )}
        {viewMode === 'vr' && <DigitalTwin depth={depth} onBack={() => setViewMode('dashboard')} users={[{ position: [2, 1, -2], color: '#3b82f6' }]} />}
        {viewMode === 'ground-zero' && <GroundZero depth={depth} onBack={() => setViewMode('dashboard')} />}
        {viewMode === 'saferoom' && <SafeRoomVR depth={depth} onBack={() => setViewMode('dashboard')} />}

      </main>
    </div>
  );
}
