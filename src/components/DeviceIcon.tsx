import React from 'react';
import { Monitor, Laptop, Router, Server, Radio, Network } from 'lucide-react';
import { DeviceType } from '../types';

interface DeviceIconProps {
  type: DeviceType;
  className?: string;
  size?: number;
}

export const DeviceIcon: React.FC<DeviceIconProps> = ({ type, className = '', size = 24 }) => {
  switch (type) {
    case 'pc':
      return <Monitor size={size} className={className} />;
    case 'laptop':
      return <Laptop size={size} className={className} />;
    case 'switch':
      return <Network size={size} className={className} />;
    case 'router':
      return <Router size={size} className={className} />;
    case 'satellite':
      return <Radio size={size} className={className} />;
    case 'server':
      return <Server size={size} className={className} />;
    default:
      return <Monitor size={size} className={className} />;
  }
};

export const DEVICE_METADATA: Record<
  DeviceType,
  { label: string; defaultName: string; defaultIp: string; color: string; badge: string }
> = {
  pc: {
    label: 'Computer (PC)',
    defaultName: 'Bridge Workstation',
    defaultIp: '192.168.1.10',
    color: 'from-blue-500 to-indigo-600',
    badge: 'End Device',
  },
  laptop: {
    label: 'Laptop',
    defaultName: "Officer's Laptop",
    defaultIp: '192.168.1.15',
    color: 'from-cyan-500 to-blue-600',
    badge: 'End Device',
  },
  switch: {
    label: 'Network Switch',
    defaultName: 'Deck Switch',
    defaultIp: '192.168.1.2',
    color: 'from-emerald-500 to-teal-600',
    badge: 'Layer 2',
  },
  router: {
    label: 'Router / Gateway',
    defaultName: 'Vessel Gateway',
    defaultIp: '192.168.1.1',
    color: 'from-amber-500 to-orange-600',
    badge: 'Gateway',
  },
  satellite: {
    label: 'VSAT Satellite',
    defaultName: 'Maritime VSAT',
    defaultIp: '10.0.0.1',
    color: 'from-purple-500 to-indigo-600',
    badge: 'Satellite',
  },
  server: {
    label: 'Shore Server',
    defaultName: 'Shore Data Center',
    defaultIp: '142.250.190.46',
    color: 'from-rose-500 to-pink-600',
    badge: 'Host',
  },
};
