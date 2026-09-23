import React from 'react';
import { X, Trash2, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { Link, LinkType } from '../types';

interface LinkConfigModalProps {
  link: Link;
  fromDeviceName: string;
  toDeviceName: string;
  onUpdate: (updated: Partial<Link>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const LinkConfigModal: React.FC<LinkConfigModalProps> = ({
  link,
  fromDeviceName,
  toDeviceName,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const presets: { label: string; latency: number; type: LinkType; tag: string }[] = [
    { label: 'Shipboard LAN', latency: 5, type: 'ethernet', tag: 'Fast' },
    { label: 'Deck Wi-Fi', latency: 30, type: 'ethernet', tag: 'Medium' },
    { label: 'Maritime VSAT', latency: 550, type: 'satellite', tag: 'Satellite delay' },
    { label: 'Heavy Weather VSAT', latency: 1200, type: 'satellite', tag: 'High delay' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100">Cable Link Settings</h3>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">
                {fromDeviceName} ↔ {toDeviceName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 pt-4 text-xs">
          {/* Latency Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-medium text-slate-300">Link Latency (Delay)</span>
              <span className="font-mono text-sm font-bold text-cyan-400 px-2 py-0.5 bg-cyan-950/60 border border-cyan-500/30 rounded-md">
                {link.latencyMs} ms
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="1500"
              step="5"
              value={link.latencyMs}
              onChange={(e) => onUpdate({ latencyMs: Number(e.target.value) })}
              className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>2ms (Fast LAN)</span>
              <span>550ms (VSAT)</span>
              <span>1500ms (High delay)</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="font-medium text-slate-300 block mb-2">Maritime Presets</span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => {
                const isSelected =
                  link.latencyMs === preset.latency && link.linkType === preset.type;
                return (
                  <button
                    key={preset.label}
                    onClick={() =>
                      onUpdate({ latencyMs: preset.latency, linkType: preset.type })
                    }
                    className={`flex flex-col text-left p-2.5 rounded-xl border transition ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-sm'
                        : 'border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-medium">{preset.label}</span>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {preset.latency} ms • {preset.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Link Type */}
          <div>
            <span className="font-medium text-slate-300 block mb-2">Cable Appearance</span>
            <div className="flex gap-2">
              {(
                [
                  { type: 'ethernet', label: 'Ethernet' },
                  { type: 'fiber', label: 'Fiber' },
                  { type: 'satellite', label: 'Satellite (Dashed)' },
                ] as const
              ).map((t) => (
                <button
                  key={t.type}
                  onClick={() => onUpdate({ linkType: t.type })}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition border ${
                    link.linkType === t.type
                      ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Link Status: Normal vs Broken */}
          <div>
            <span className="font-medium text-slate-300 block mb-2">Cable Condition</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdate({ isBroken: false })}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border transition ${
                  !link.isBroken
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 size={15} />
                <span>Connected</span>
              </button>
              <button
                onClick={() => onUpdate({ isBroken: true })}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border transition ${
                  link.isBroken
                    ? 'border-rose-500/50 bg-rose-500/15 text-rose-400'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-rose-300'
                }`}
              >
                <AlertTriangle size={15} />
                <span>Cut Cable (Break)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-800">
          <button
            onClick={() => {
              onDelete(link.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition text-xs"
          >
            <Trash2 size={14} />
            <span>Remove Cable</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
