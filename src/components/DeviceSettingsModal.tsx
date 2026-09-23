import React, { useState } from 'react';
import { X, Trash2, Edit3 } from 'lucide-react';
import { Device } from '../types';
import { DeviceIcon, DEVICE_METADATA } from './DeviceIcon';

interface DeviceSettingsModalProps {
  device: Device;
  onUpdate: (updated: Partial<Device>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  device,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [name, setName] = useState(device.name);
  const [ip, setIp] = useState(device.ip);
  const meta = DEVICE_METADATA[device.type];

  const handleSave = () => {
    onUpdate({ name: name.trim() || device.name, ip: ip.trim() || device.ip });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm shadow-2xl p-5 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${meta.color} text-white shadow-sm`}>
              <DeviceIcon type={device.type} size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100">Configure Device</h3>
              <span className="text-[10px] text-slate-400 font-medium">{meta.label}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3.5 pt-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Device Label / Location</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bridge Radar PC"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500 font-medium"
              />
              <Edit3 size={14} className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">IP Address</label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="e.g. 192.168.1.10"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-cyan-500 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-800">
          <button
            onClick={() => {
              onDelete(device.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition text-xs"
          >
            <Trash2 size={14} />
            <span>Delete Device</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
