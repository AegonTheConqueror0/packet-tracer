export type DeviceType = 'pc' | 'laptop' | 'switch' | 'router' | 'satellite' | 'server';

export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  x: number;
  y: number;
  ip: string;
}

export type LinkType = 'ethernet' | 'fiber' | 'satellite';

export interface Link {
  id: string;
  fromId: string;
  toId: string;
  latencyMs: number; // in milliseconds
  linkType: LinkType;
  isBroken?: boolean;
}

export type ActiveTool = 'select' | 'cable' | 'packet';

export interface SimulatedPacket {
  id: string;
  sourceId: string;
  targetId: string;
  path: string[]; // device IDs in order
  currentHop: number; // index in path
  progress: number; // 0 to 1 along current segment
  phase: 'forward' | 'reply'; // Request (Ping) -> Reply (ACK)
  durationForSegment: number; // ms
  totalLatency: number;
  status: 'flying' | 'delivered' | 'failed';
  message: string;
}
