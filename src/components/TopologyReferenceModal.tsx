import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Info, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { PRESETS } from '../utils/network';

interface TopologyReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstructorLoadPreset?: (index: number) => void;
}

const TOPOLOGY_SPECS = [
  {
    name: 'Bus Topology',
    tag: 'Linear Backbone',
    maritimeUse: 'Hazardous cargo tank pipeline sensor corridor & ballast valve telemetry.',
    cableRule: 'N devices require exactly N - 1 cable segments in a daisy chain.',
    pros: 'Minimal cabling required; simple to install along long narrow bulkheads.',
    cons: 'Cable break partitions the entire network into isolated halves.',
    schematic: 'Terminal A ── Terminal B ── Terminal C ── Terminal D',
  },
  {
    name: 'Star Topology',
    tag: 'Central Switch Hub',
    maritimeUse: 'Ship navigation bridge LAN (ECDIS, ARPA Radar, Gyro, Master PC).',
    cableRule: 'All client devices connect exclusively to a central multiport switch.',
    pros: 'High resilience; single station failure does not affect other bridge systems.',
    cons: 'Central switch is a single point of failure (requires dual-redundant switch onboard).',
    schematic: 'Navigation PC ─── [ Bridge Switch ] ─── Radar PC\n      |                                |\nCaptains Laptop                   Engine Console',
  },
  {
    name: 'Ring Topology',
    tag: 'Circular Redundant Loop',
    maritimeUse: 'Engine Control Room (ECR) machinery telemetry (Main Engine, Purifiers, Aux Gen).',
    cableRule: 'Every device connects to exactly two adjacent neighbors (degree = 2).',
    pros: 'Deterministic traffic flow; can support bidirectional failover if a cable is cut.',
    cons: 'Adding or moving a device temporarily interrupts the ring circuit.',
    schematic: 'Node 1 ════ Node 2\n  ║          ║\nNode 4 ════ Node 3',
  },
  {
    name: 'Mesh Topology',
    tag: 'Full Interconnection',
    maritimeUse: 'Critical Dynamic Positioning (DP-3) and GMDSS Distress Communication.',
    cableRule: 'High redundancy; N(N-1)/2 links for full mesh.',
    pros: 'Ultimate fault tolerance; multiple alternate routes available if links fail.',
    cons: 'Heavy cabling overhead and complex routing protocols onboard.',
    schematic: 'Bridge ══════ Radar\n  ║   \\     /   ║\n  ║     \\ /     ║\nSafety ══════ Engine',
  },
  {
    name: 'Hybrid Topology',
    tag: 'Multi-Tier Routed',
    maritimeUse: 'Shipboard Cyber Security segmentation: Bridge Subnet isolated from Crew Wi-Fi.',
    cableRule: 'Two distinct subnet switches linked through an isolation gateway router.',
    pros: 'Enforces IMO MSC.428(98) cyber security boundaries and restricts malware broadcast.',
    cons: 'Requires IP routing configuration and firewall rule management.',
    schematic: '[Bridge Subnet] ── [Core Router] ── [Crew Subnet]',
  },
  {
    name: 'Vessel to Shore',
    tag: 'Satellite WAN',
    maritimeUse: 'Trans-oceanic communications between Shipboard LAN and Shore HQ via VSAT.',
    cableRule: 'High-latency satellite uplink (550ms propagation delay to geostationary orbit).',
    pros: 'Global reach even in open ocean outside terrestrial 4G/5G coastal coverage.',
    cons: 'High propagation latency (~1.1s RTT) and susceptibility to rain fade.',
    schematic: 'Ship Master ── Router ── [ VSAT Satellite ] ── Shore Server',
  },
];

export const TopologyReferenceModal: React.FC<TopologyReferenceModalProps> = ({
  isOpen,
  onClose,
  onInstructorLoadPreset,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [instructorCode, setInstructorCode] = useState('');
  const [showInstructorOverride, setShowInstructorOverride] = useState(false);
  const [overrideUnlocked, setOverrideUnlocked] = useState(false);
  const [codeError, setCodeError] = useState(false);

  if (!isOpen) return null;

  const currentPreset = PRESETS[selectedIdx];
  const spec = TOPOLOGY_SPECS[selectedIdx] || TOPOLOGY_SPECS[0];

  const handleVerifyInstructor = () => {
    if (instructorCode.trim().toLowerCase() === 'instructor' || instructorCode.trim().toLowerCase() === 'demo') {
      setOverrideUnlocked(true);
      setCodeError(false);
    } else {
      setCodeError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Topology Architecture Reference Guide
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Lock size={10} /> Locked for Laboratory Work
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pre-built topologies are locked for study only. Build your network on the canvas to complete your lab activity!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Why is this locked banner */}
        <div className="mx-6 mt-4 p-3.5 rounded-xl bg-slate-800/80 border border-amber-500/30 flex items-start gap-3">
          <Info size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-amber-300">
              Academic Anti-Cheating & Activity Requirement
            </p>
            <p className="text-slate-400 leading-relaxed">
              To evaluate your mastery of network engineering, pre-built topologies cannot be directly loaded onto the canvas. Use these architectural blueprints and guidelines as reference material, select an activity in the <strong className="text-cyan-400">Activity Laboratory</strong>, and place the devices and cables yourself.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Navigation: Topologies List */}
          <div className="md:col-span-4 space-y-1.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Topologies (Reference Specs)
            </p>
            {PRESETS.map((preset, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={preset.name}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-200 shadow-md'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{preset.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {preset.devices.length} devices • {preset.links.length} links
                    </div>
                  </div>
                  <Lock size={13} className="text-slate-500 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Right Detail: Blueprint Specs & Diagram */}
          <div className="md:col-span-8 bg-slate-950/60 rounded-xl border border-slate-800 p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">{spec.name}</h3>
                <span className="text-[11px] font-mono text-cyan-400">{spec.tag}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                <Eye size={13} />
                <span>Reference Study Only</span>
              </div>
            </div>

            {/* Maritime Practical Application */}
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-1">
                Practical Application:
              </p>
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                {spec.maritimeUse}
              </p>
            </div>

            {/* Architectural Rule & Schematic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 mb-1">Cabling & Rule:</p>
                <p className="text-xs text-slate-300 leading-relaxed">{spec.cableRule}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 mb-1">Key Advantage:</p>
                <p className="text-xs text-emerald-400 leading-relaxed">{spec.pros}</p>
              </div>
            </div>

            {/* ASCII Schematic Diagram */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                Architectural Schematic:
              </p>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800/90 text-cyan-300 font-mono text-xs whitespace-pre overflow-x-auto leading-relaxed">
                {spec.schematic}
              </pre>
            </div>

            {/* Included Devices in this topology */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 mb-1">
                Components in Blueprint ({currentPreset.devices.length} Devices, {currentPreset.links.length} Links):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentPreset.devices.map((d) => (
                  <span
                    key={d.id}
                    className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono"
                  >
                    {d.name} ({d.type})
                  </span>
                ))}
              </div>
            </div>

            {/* Instructor Classroom Demonstration Override */}
            <div className="pt-3 border-t border-slate-800/80">
              {!showInstructorOverride ? (
                <button
                  onClick={() => setShowInstructorOverride(true)}
                  className="text-[11px] text-slate-500 hover:text-slate-400 underline cursor-pointer"
                >
                  Instructor demonstration override
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Instructor Mode (Classroom Demo Only)
                    </span>
                    <button
                      onClick={() => setShowInstructorOverride(false)}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Hide
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Enter instructor passcode to load this example on screen for lectures.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder="Passcode (instructor or demo)"
                      value={instructorCode}
                      onChange={(e) => setInstructorCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyInstructor()}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                    />
                    <button
                      onClick={handleVerifyInstructor}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition"
                    >
                      Verify
                    </button>
                  </div>
                  {codeError && (
                    <p className="text-[11px] text-rose-400">
                      Incorrect passcode. Use standard student mode to build your own network.
                    </p>
                  )}
                  {overrideUnlocked && (
                    <div className="mt-2 flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <span className="text-[11px] text-amber-300 font-semibold">
                        Instructor verified. Loading will mark workspace as Lecture Demo.
                      </span>
                      {onInstructorLoadPreset && (
                        <button
                          onClick={() => {
                            onInstructorLoadPreset(selectedIdx);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-md transition"
                        >
                          Load for Lecture
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Select an activity from the <strong>Activity Laboratory</strong> menu to start building!
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/40 transition cursor-pointer"
          >
            Got It, Return to Canvas
          </button>
        </div>

      </div>
    </div>
  );
};
