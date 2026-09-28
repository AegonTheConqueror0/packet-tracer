import React from 'react';
import {
  MousePointer,
  Cable,
  Send,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Gauge,
  Lock,
  Unlock,
  Activity,
  FlaskConical,
  BookOpen,
  Award,
} from 'lucide-react';
import { ActiveTool } from '../types';
import { sounds } from '../utils/audio';

interface ToolbarProps {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  onClear: () => void;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onQuickDemo: () => void;
  onOpenPingInspector: () => void;
  isSimulating: boolean;
  deviceCount: number;
  isLocked: boolean;
  onToggleLock: () => void;
  onOpenTopologyGuide: () => void;
  onOpenActivityDrawer: () => void;
  onSubmitWork: () => void;
  activeActivityNumber: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  onClear,
  simSpeed,
  setSimSpeed,
  soundEnabled,
  setSoundEnabled,
  onQuickDemo,
  onOpenPingInspector,
  isSimulating,
  deviceCount,
  isLocked,
  onToggleLock,
  onOpenTopologyGuide,
  onOpenActivityDrawer,
  onSubmitWork,
  activeActivityNumber,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-900/30">
          <Cable size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight text-slate-100">
              Packet Tracer
            </h1>
            <span className="text-[10px] font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full">
              Activity Lab
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Laboratory Simulator & Topology Evaluator
          </p>
        </div>
      </div>

      {/* Primary Tool Switcher */}
      <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 shadow-inner">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTool('select');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTool === 'select'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title={
            isLocked
              ? 'Click to inspect devices and link latencies'
              : 'Drag and reposition devices'
          }
        >
          <MousePointer size={14} />
          <span>{isLocked ? 'Inspect' : 'Move'}</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTool('cable');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTool === 'cable'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="Connect devices with cable"
        >
          <Cable size={14} />
          <span>Connect Cable</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTool('packet');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTool === 'packet'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="Send packet from source to destination"
        >
          <Send size={14} />
          <span>Send Packet</span>
        </button>
      </div>

      {/* Activity Mode, Topology Guide & Actions */}
      <div className="flex items-center gap-2">
        
        {/* Activity Laboratory Launcher Pill */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenActivityDrawer();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-cyan-600/30 hover:from-blue-600/40 hover:to-cyan-600/40 border border-cyan-500/50 text-cyan-200 text-xs font-semibold shadow-xs transition cursor-pointer"
          title="Open Activity Laboratory Instructions & Live Checklist"
        >
          <FlaskConical size={14} className="text-cyan-400" />
          <span>Lab Activity {activeActivityNumber}</span>
        </button>

        {/* Topology Examples - Locked Reference Guide Modal */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenTopologyGuide();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition cursor-pointer"
          title="Topology Examples are locked for reference study only"
        >
          <Lock size={12} className="text-amber-400" />
          <span>Topology Guide</span>
        </button>

        {/* Quick Demo Test Ping Button */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl overflow-hidden shadow-xs">
          <button
            onClick={onQuickDemo}
            disabled={isSimulating || deviceCount < 2}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-medium shadow-md shadow-emerald-950/40 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title={
              deviceCount < 2
                ? 'Add at least 2 connected devices to test ping'
                : 'Instantly send test packet across the network'
            }
          >
            <Play size={13} fill="currentColor" />
            <span>Test Ping</span>
          </button>
          <button
            onClick={onOpenPingInspector}
            disabled={deviceCount < 2}
            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border-l border-slate-700/80 disabled:opacity-40 cursor-pointer"
            title="Open Ping & Reachability Inspector"
          >
            <Activity size={13} />
          </button>
        </div>

        {/* Submit Work Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onSubmitWork();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition cursor-pointer"
          title="Submit your laboratory work and generate official report"
        >
          <Award size={14} />
          <span>Submit Work</span>
        </button>

        {/* Speed toggle */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl px-1.5 py-1 text-slate-300 text-xs">
          <Gauge size={13} className="text-slate-400 mr-1" />
          {[0.5, 1, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => setSimSpeed(spd)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition cursor-pointer ${
                simSpeed === spd
                  ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            sounds.enabled = next;
            if (next) sounds.playClick();
          }}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            soundEnabled
              ? 'border-slate-700 bg-slate-800/80 text-cyan-400'
              : 'border-slate-800 bg-slate-900 text-slate-500'
          }`}
          title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        {/* Reset / Clear */}
        <button
          onClick={onClear}
          className="p-2 rounded-xl border border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          title="Clear canvas"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </header>
  );
};

