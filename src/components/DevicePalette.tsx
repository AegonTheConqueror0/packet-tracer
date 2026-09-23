import React from 'react';
import { DeviceType } from '../types';
import { DeviceIcon, DEVICE_METADATA } from './DeviceIcon';
import { Plus } from 'lucide-react';
import { sounds } from '../utils/audio';

interface DevicePaletteProps {
  onAddDevice: (type: DeviceType) => void;
}

const PALETTE_ITEMS: DeviceType[] = ['pc', 'laptop', 'switch', 'router', 'satellite', 'server'];

export const DevicePalette: React.FC<DevicePaletteProps> = ({ onAddDevice }) => {
  const handleDragStart = (e: React.DragEvent, type: DeviceType) => {
    e.dataTransfer.setData('application/device-type', type);
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="absolute left-4 top-20 z-20 flex flex-col gap-1.5 p-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl select-none">
      <div className="px-2 py-1 flex items-center justify-between border-b border-slate-800/80 mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Devices
        </span>
        <span className="text-[10px] text-slate-500">Drag or click</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {PALETTE_ITEMS.map((type) => {
          const meta = DEVICE_METADATA[type];
          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => handleDragStart(e, type)}
              onClick={() => {
                sounds.playClick();
                onAddDevice(type);
              }}
              className="group flex items-center gap-2.5 p-2 rounded-xl border border-slate-800/60 bg-slate-800/40 hover:bg-slate-800 hover:border-cyan-500/40 cursor-grab active:cursor-grabbing transition text-left"
              title={`Drag onto canvas or click to add ${meta.label}`}
            >
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0`}
              >
                <DeviceIcon type={type} size={16} />
              </div>
              <div className="min-w-[100px]">
                <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {meta.label}
                </div>
                <div className="text-[10px] text-slate-400">{meta.badge}</div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 text-slate-500 group-hover:text-cyan-400 transition-opacity ml-auto">
                <Plus size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
