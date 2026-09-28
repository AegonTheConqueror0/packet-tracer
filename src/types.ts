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

export interface PingHop {
  fromId: string;
  fromName: string;
  fromIp: string;
  toId: string;
  toName: string;
  toIp: string;
  linkType: LinkType;
  latencyMs: number;
}

export interface PingReport {
  success: boolean;
  sourceDevice: Device;
  targetDevice: Device;
  path: string[];
  hops: PingHop[];
  oneWayLatency: number;
  rtt: number;
  ttl: number;
  packetsSent: number;
  packetsReceived: number;
  packetLossPercent: number;
  failureReason?: string;
  failedAtHop?: number;
  timestamp: number;
}

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

export interface LabActivityCriterion {
  id: string;
  label: string;
  description: string;
}

export interface LabActivity {
  id: string;
  number: number;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  objective: string;
  scenario: string;
  requiredTopology: string;
  instructions: string[];
  tips: string[];
  expectedDevices: {
    type: DeviceType;
    minCount: number;
    label: string;
  }[];
  criteria: LabActivityCriterion[];
}

export interface StudentSubmission {
  id: string;
  studentName: string;
  studentId: string;
  courseSection: string;
  instructorName?: string;
  activityId: string;
  activityTitle: string;
  activityNumber: number;
  submittedAt: string;
  devices: Device[];
  links: Link[];
  pingReport?: PingReport | null;
  score: number;
  maxScore: number;
  passed: boolean;
  rubric: {
    category: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  studentNotes?: string;
}

