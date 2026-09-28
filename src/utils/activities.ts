import { Device, Link, PingReport, LabActivity, StudentSubmission } from '../types';
import { findPath } from './network';

export const LAB_ACTIVITIES: LabActivity[] = [
  {
    id: 'lab-1',
    number: 1,
    title: "Ship's Bridge Navigation LAN",
    category: 'Local Area Network (LAN)',
    difficulty: 'Beginner',
    estimatedMinutes: 10,
    requiredTopology: 'Star Topology',
    objective:
      'Design a Star topology network for the navigation bridge linking all bridge consoles to a central switch.',
    scenario:
      'During a shipyard refit, your vessel is installing a new integrated bridge system. As Cadet Communications Officer, you must interconnect the ECDIS (Electronic Chart Display), ARPA Radar workstation, GPS Gyro Console, and Captain’s Laptop to a central Bridge Core Switch so bridge officers can share real-time navigational telemetry.',
    expectedDevices: [
      { type: 'switch', minCount: 1, label: 'Bridge Core Switch' },
      { type: 'pc', minCount: 2, label: 'Bridge PCs (ECDIS, Radar)' },
      { type: 'laptop', minCount: 1, label: "Captain's Laptop" },
    ],
    instructions: [
      'Drag and place 1 Network Switch at the center of the workspace as the Bridge Core Switch.',
      'Place at least 3 endpoint devices around the switch (e.g., Navigation PC, Radar PC, and Captain Laptop).',
      'Select the Cable tool (🔌) and connect each endpoint workstation directly to the central Switch using Ethernet cables.',
      'Ensure no direct PC-to-PC connections exist; all traffic must traverse the central switch.',
      'Use the Send Packet tool (✉️) or click "Simulate Packet Tracer" to ping between any two workstations and verify 0% packet loss.',
    ],
    tips: [
      'In a Star topology, if one workstation cable is severed, other stations remain connected.',
      'Notice that the central switch acts as a multiport bridge with ~5ms internal switching latency.',
    ],
    criteria: [
      {
        id: 'crit-devices',
        label: 'Required Devices Deployed',
        description: 'Place 1 Switch and at least 3 client endpoints (PCs or Laptops).',
      },
      {
        id: 'crit-star-structure',
        label: 'Star Topology Physical Layout',
        description: 'All endpoint workstations must connect directly to the central switch.',
      },
      {
        id: 'crit-cables',
        label: 'Cable Connections Active',
        description: 'All client devices must have an unbroken Ethernet link connected to the switch.',
      },
      {
        id: 'crit-simulation',
        label: 'Packet Tracer Simulation Verified',
        description: 'Run a successful packet ping simulation between workstations through the central switch.',
      },
    ],
  },
  {
    id: 'lab-2',
    number: 2,
    title: 'Vessel-to-Shore Satellite VSAT Uplink',
    category: 'Wide Area Network (WAN)',
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    requiredTopology: 'Satellite WAN Bridge',
    objective:
      'Configure a high-latency trans-oceanic satellite uplink between the shipboard network and shore headquarters.',
    scenario:
      'Your container vessel is underway in the Mid-Atlantic. The Ship Master must transmit the official noon departure report and voyage engine logs to the Shore Fleet Management Server in Rotterdam. You must build an end-to-end satellite WAN link and observe the latency introduced by geostationary orbital transmission.',
    expectedDevices: [
      { type: 'laptop', minCount: 1, label: 'Master Laptop' },
      { type: 'router', minCount: 1, label: 'Shipboard Gateway Router' },
      { type: 'satellite', minCount: 1, label: 'VSAT Satellite Station' },
      { type: 'server', minCount: 1, label: 'Shore Fleet HQ Server' },
    ],
    instructions: [
      'Place a Master Laptop and a Marine Gateway Router on the left side (Shipboard LAN).',
      'Place a VSAT Satellite in the upper center of the canvas.',
      'Place a Fleet Headquarters Server on the right side (Shore LAN).',
      'Connect Master Laptop to Router (Ethernet), Router to Satellite (Satellite link ~550ms), and Satellite to Shore Server.',
      'Verify that the satellite link is set to Satellite link type with ~550ms latency.',
      'Simulate Packet Tracer from the Master Laptop to the Shore Server. Observe the ~1,100ms round-trip latency!',
    ],
    tips: [
      'Geostationary satellites orbit at 35,786 km above Earth, causing physical propagation delay of ~250-280ms each way.',
      'The Satellite link in your simulator realistically models this delay (~550ms one-way, ~1,100ms round-trip).',
    ],
    criteria: [
      {
        id: 'crit-devices',
        label: 'WAN Nodes Deployed',
        description: 'Include 1 Workstation/Laptop, 1 Router, 1 Satellite node, and 1 Server.',
      },
      {
        id: 'crit-path',
        label: 'Satellite Uplink Route Established',
        description: 'End-to-end connectivity: Ship Client ➔ Router ➔ Satellite ➔ Shore Server.',
      },
      {
        id: 'crit-latency',
        label: 'Satellite Latency Configured',
        description: 'Ensure the link to the satellite node has realistic satellite latency (>= 300ms).',
      },
      {
        id: 'crit-simulation',
        label: 'Packet Tracer Simulation Verified',
        description: 'Simulate packet transmission from ship to shore and verify RTT acknowledgment.',
      },
    ],
  },
  {
    id: 'lab-3',
    number: 3,
    title: 'Engine Room Redundant Ring Network',
    category: 'Industrial Control Systems (ICS)',
    difficulty: 'Intermediate',
    estimatedMinutes: 12,
    requiredTopology: 'Ring Topology',
    objective:
      'Construct a fault-tolerant closed circular ring network connecting automated machinery consoles in the Engine Control Room (ECR).',
    scenario:
      'The Chief Engineer requires an automation telemetry loop linking the Main Engine Propulsion Controller, Auxiliary Generator Power Management, Fuel Oil Purifier Station, and Chief Engineer Desk Console. In a ring topology, each node connects to two neighbors, preventing single points of total network collapse.',
    expectedDevices: [
      { type: 'pc', minCount: 3, label: 'Engine Room PCs / Consoles' },
      { type: 'laptop', minCount: 1, label: 'Chief Engineer Laptop' },
    ],
    instructions: [
      'Deploy 4 devices on the canvas arranged in a circular or oval layout.',
      'Using the Cable tool, connect Node 1 to Node 2, Node 2 to Node 3, Node 3 to Node 4, and finally Node 4 back to Node 1.',
      'Confirm that every device has exactly two connections and the loop is completely closed.',
      'Simulate Packet Tracer across the ring. Observe the packet hop through intermediate nodes.',
      'Optional experiment: Click a cable to simulate a break and observe alternative routing!',
    ],
    tips: [
      'A ring network requires every device to have exactly degree 2 (two connected peers).',
      'Industrial Ethernet rings (like MRP or DLR) use this principle for deterministic maritime machinery control.',
    ],
    criteria: [
      {
        id: 'crit-devices',
        label: 'At Least 4 Machinery Consoles',
        description: 'Place 4 or more devices representing ECR machinery monitoring units.',
      },
      {
        id: 'crit-ring-structure',
        label: 'Closed Ring Loop Verified',
        description: 'Every node in the ring must connect to exactly two adjacent neighbors in a single closed circuit.',
      },
      {
        id: 'crit-cables',
        label: 'Equal Ring Links',
        description: 'The number of cables must equal the number of devices in the closed loop.',
      },
      {
        id: 'crit-simulation',
        label: 'Packet Tracer Simulation Verified',
        description: 'Run packet simulation across non-adjacent nodes in the ring to verify ring routing.',
      },
    ],
  },
  {
    id: 'lab-4',
    number: 4,
    title: 'Cargo & Ballast Tank Telemetry Bus',
    category: 'Backbone Systems',
    difficulty: 'Beginner',
    estimatedMinutes: 10,
    requiredTopology: 'Bus Topology',
    objective:
      'Deploy a linear daisy-chained bus topology along the cargo tank deck trunking connecting pipeline sensors to the Cargo Office.',
    scenario:
      'Onboard an oil and chemical tanker, hazardous cargo tank monitoring sensors are installed along a linear pipe tunnel trunk. Because cabling space through explosion-proof bulkheads is constrained, devices are connected sequentially in a linear backbone bus: Draft Gauge ➔ Ballast Pump Control ➔ Cargo Valve Terminal ➔ Deck Cargo Office.',
    expectedDevices: [
      { type: 'pc', minCount: 3, label: 'Tank Telemetry Terminals' },
      { type: 'laptop', minCount: 1, label: 'Deck Cargo Office Laptop' },
    ],
    instructions: [
      'Place 4 devices in a straight horizontal or diagonal line across the canvas.',
      'Connect Device 1 to Device 2, Device 2 to Device 3, and Device 3 to Device 4.',
      'Do NOT create any branch or closed loop. Exactly two devices must be terminal ends (1 connection), and intermediate devices must have 2 connections.',
      'Total number of links must equal (Number of Devices - 1).',
      'Simulate Packet Tracer from the first terminal to the last terminal and observe sequential hops along the backbone.',
    ],
    tips: [
      'In a bus topology, the loss of any intermediate backbone link bisects the entire network into two isolated segments.',
      'Bus topologies require N-1 links for N devices.',
    ],
    criteria: [
      {
        id: 'crit-devices',
        label: 'Linear Telemetry Nodes',
        description: 'Place at least 4 devices along the linear cargo trunk corridor.',
      },
      {
        id: 'crit-bus-structure',
        label: 'Linear Backbone Chain Verified',
        description: 'Devices must form a single unbranched path with exactly two terminal ends.',
      },
      {
        id: 'crit-no-loops',
        label: 'Acyclic Bus Construction',
        description: 'No loops or multiple branches; total links must equal total devices minus 1.',
      },
      {
        id: 'crit-simulation',
        label: 'Packet Tracer Simulation Verified',
        description: 'Simulate packet ping from the first end terminal to the opposite end terminal.',
      },
    ],
  },
  {
    id: 'lab-5',
    number: 5,
    title: 'Maritime Cyber Security Subnet Segmentation',
    category: 'Routed & Hybrid Networks',
    difficulty: 'Advanced',
    estimatedMinutes: 15,
    requiredTopology: 'Hybrid Routed Topology',
    objective:
      'Satisfy IMO Maritime Cyber Risk Management requirements by segregating Crew Welfare Wi-Fi from Mission-Critical Bridge Navigation via an isolation Gateway Router.',
    scenario:
      'IMO Resolution MSC.428(98) mandates maritime cyber risk segregation. Unsecured crew personal devices must never be allowed on the same physical broadcast domain as the vessel’s safety navigation systems. You must build two distinct subnets (Bridge Subnet and Crew Subnet), each with its own switch, joined solely through a central Maritime Gateway Router with access control.',
    expectedDevices: [
      { type: 'router', minCount: 1, label: 'Central Maritime Gateway Router' },
      { type: 'switch', minCount: 2, label: 'Subnet Switches (Bridge & Crew)' },
      { type: 'pc', minCount: 2, label: 'Bridge Navigation PCs' },
      { type: 'laptop', minCount: 1, label: 'Crew Welfare Laptop' },
    ],
    instructions: [
      'Place 1 Router at the center of the canvas to act as the Maritime Security Gateway.',
      'Place 1 Switch on the left (Bridge Subnet Switch) and 1 Switch on the right (Crew Subnet Switch).',
      'Connect both switches to the central Router using Ethernet cables.',
      'Connect Bridge workstations (e.g. Navigation PC, Radar PC) to the Bridge Switch.',
      'Connect Crew workstations (e.g. Crew Laptop) to the Crew Switch.',
      'Simulate Packet Tracer from a Crew Laptop on Subnet B across the central Router to a Navigation PC on Subnet A, proving inter-subnet routing with isolation!',
    ],
    tips: [
      'Routers separate broadcast domains and enforce security boundaries between subnets.',
      'Packets traveling between subnets must make at least 3 hops: Client ➔ Switch A ➔ Router ➔ Switch B ➔ Destination.',
    ],
    criteria: [
      {
        id: 'crit-devices',
        label: 'Multi-Subnet Architecture Hardware',
        description: 'Deploy 1 Router, at least 2 Switches, and at least 3 client endpoints (total >= 5 devices).',
      },
      {
        id: 'crit-router-hub',
        label: 'Router Core Interconnection',
        description: 'The Router must connect to both Subnet Switches, forming the inter-subnet bridge.',
      },
      {
        id: 'crit-subnet-segmentation',
        label: 'Two Distinct Subnets Attached',
        description: 'Each Switch must host endpoint devices, with no direct cables bridging the two switches.',
      },
      {
        id: 'crit-simulation',
        label: 'Packet Tracer Simulation Verified',
        description: 'Simulate packet ping crossing from Subnet A to Subnet B through the central router.',
      },
    ],
  },
];

// Helper: Check Star Topology
export function checkStarTopology(devices: Device[], links: Link[]): {
  isStar: boolean;
  hubNode?: Device;
  spokeCount: number;
} {
  const activeLinks = links.filter((l) => !l.isBroken);
  // Find a hub candidate: switch or router with highest connections
  const degreeMap = new Map<string, string[]>();
  devices.forEach((d) => degreeMap.set(d.id, []));
  activeLinks.forEach((l) => {
    degreeMap.get(l.fromId)?.push(l.toId);
    degreeMap.get(l.toId)?.push(l.fromId);
  });

  let bestHub: Device | null = null;
  let maxDegree = 0;

  for (const d of devices) {
    const deg = degreeMap.get(d.id)?.length || 0;
    if (deg > maxDegree) {
      maxDegree = deg;
      bestHub = d;
    }
  }

  if (!bestHub || maxDegree < 3) {
    return { isStar: false, spokeCount: maxDegree };
  }

  // Hub must be a switch or router, or at least connected to all other nodes
  const hubNeighbors = new Set(degreeMap.get(bestHub.id) || []);
  let spokeCount = 0;

  for (const d of devices) {
    if (d.id === bestHub.id) continue;
    const neighbors = degreeMap.get(d.id) || [];
    // Spoke should only connect to hub (or at least must connect to hub)
    if (neighbors.includes(bestHub.id)) {
      spokeCount++;
    }
  }

  return {
    isStar: spokeCount >= 3 && (bestHub.type === 'switch' || bestHub.type === 'router' || spokeCount >= devices.length - 1),
    hubNode: bestHub,
    spokeCount,
  };
}

// Helper: Check Ring Topology
export function checkRingTopology(devices: Device[], links: Link[]): {
  isRing: boolean;
  nodeCount: number;
} {
  const activeLinks = links.filter((l) => !l.isBroken);
  if (devices.length < 4 || activeLinks.length < 4) {
    return { isRing: false, nodeCount: devices.length };
  }

  const adj = new Map<string, Set<string>>();
  devices.forEach((d) => adj.set(d.id, new Set()));
  activeLinks.forEach((l) => {
    adj.get(l.fromId)?.add(l.toId);
    adj.get(l.toId)?.add(l.fromId);
  });

  // Check degree of each device: in a simple ring, every node has degree == 2
  for (const d of devices) {
    const neighbors = adj.get(d.id);
    if (!neighbors || neighbors.size !== 2) {
      return { isRing: false, nodeCount: devices.length };
    }
  }

  // Check that the whole graph forms a single connected cycle
  const visited = new Set<string>();
  let current = devices[0].id;
  let previous: string | null = null;

  while (current && !visited.has(current)) {
    visited.add(current);
    const neighbors = Array.from(adj.get(current) || []);
    const next = neighbors.find((n) => n !== previous);
    previous = current;
    current = next || '';
  }

  const isConnectedRing = visited.size === devices.length && activeLinks.length === devices.length;

  return {
    isRing: isConnectedRing,
    nodeCount: devices.length,
  };
}

// Helper: Check Bus Topology
export function checkBusTopology(devices: Device[], links: Link[]): {
  isBus: boolean;
  terminalCount: number;
} {
  const activeLinks = links.filter((l) => !l.isBroken);
  if (devices.length < 4 || activeLinks.length !== devices.length - 1) {
    return { isBus: false, terminalCount: 0 };
  }

  const adj = new Map<string, Set<string>>();
  devices.forEach((d) => adj.set(d.id, new Set()));
  activeLinks.forEach((l) => {
    adj.get(l.fromId)?.add(l.toId);
    adj.get(l.toId)?.add(l.fromId);
  });

  let deg1Count = 0;
  let deg2Count = 0;

  for (const d of devices) {
    const deg = adj.get(d.id)?.size || 0;
    if (deg === 1) deg1Count++;
    else if (deg === 2) deg2Count++;
    else return { isBus: false, terminalCount: deg1Count };
  }

  // Exactly 2 endpoints with degree 1, all others with degree 2
  const isBus = deg1Count === 2 && deg2Count === devices.length - 2;

  return {
    isBus,
    terminalCount: deg1Count,
  };
}

// Helper: Check Satellite WAN Topology
export function checkSatelliteWanTopology(devices: Device[], links: Link[]): {
  isSatWan: boolean;
  hasSatellite: boolean;
  hasRouter: boolean;
  hasServer: boolean;
  hasClient: boolean;
} {
  const activeLinks = links.filter((l) => !l.isBroken);
  const satNode = devices.find((d) => d.type === 'satellite');
  const routerNode = devices.find((d) => d.type === 'router');
  const serverNode = devices.find((d) => d.type === 'server');
  const clientNode = devices.find((d) => d.type === 'laptop' || d.type === 'pc');

  const hasSatellite = !!satNode;
  const hasRouter = !!routerNode;
  const hasServer = !!serverNode;
  const hasClient = !!clientNode;

  if (!satNode || !serverNode || !clientNode) {
    return { isSatWan: false, hasSatellite, hasRouter, hasServer, hasClient };
  }

  // Check if a path exists between client and server that passes through satellite
  const pathData = findPath(clientNode.id, serverNode.id, devices, activeLinks);
  const pathCrossesSatellite = pathData?.path.includes(satNode.id) ?? false;

  return {
    isSatWan: pathCrossesSatellite,
    hasSatellite,
    hasRouter,
    hasServer,
    hasClient,
  };
}

// Helper: Check Hybrid Routed Topology
export function checkHybridTopology(devices: Device[], links: Link[]): {
  isHybrid: boolean;
  routerCount: number;
  switchCount: number;
  endpointCount: number;
} {
  const activeLinks = links.filter((l) => !l.isBroken);
  const routers = devices.filter((d) => d.type === 'router');
  const switches = devices.filter((d) => d.type === 'switch');
  const endpoints = devices.filter((d) => d.type === 'pc' || d.type === 'laptop' || d.type === 'server');

  if (routers.length < 1 || switches.length < 2 || endpoints.length < 2) {
    return {
      isHybrid: false,
      routerCount: routers.length,
      switchCount: switches.length,
      endpointCount: endpoints.length,
    };
  }

  // Check if router is linked to at least two switches
  const router = routers[0];
  const linkedSwitches = switches.filter((sw) =>
    activeLinks.some(
      (l) =>
        (l.fromId === router.id && l.toId === sw.id) ||
        (l.fromId === sw.id && l.toId === router.id)
    )
  );

  const isHybrid = linkedSwitches.length >= 2;

  return {
    isHybrid,
    routerCount: routers.length,
    switchCount: switches.length,
    endpointCount: endpoints.length,
  };
}

// Live Validation Engine for Student Progress
export function evaluateActivityCriteria(
  activity: LabActivity,
  devices: Device[],
  links: Link[],
  lastSuccessfulPing?: PingReport | null
): {
  criterionResults: { [criterionId: string]: boolean };
  completedCount: number;
  totalCount: number;
  isAllCompleted: boolean;
  score: number;
} {
  const activeLinks = links.filter((l) => !l.isBroken);
  const results: { [criterionId: string]: boolean } = {};

  const pingWorked =
    lastSuccessfulPing !== undefined &&
    lastSuccessfulPing !== null &&
    lastSuccessfulPing.success === true &&
    lastSuccessfulPing.packetLossPercent === 0;

  switch (activity.id) {
    case 'lab-1': {
      // 1. Devices
      const swCount = devices.filter((d) => d.type === 'switch').length;
      const clientCount = devices.filter((d) => d.type === 'pc' || d.type === 'laptop').length;
      results['crit-devices'] = swCount >= 1 && clientCount >= 3;

      // 2. Star Structure
      const star = checkStarTopology(devices, links);
      results['crit-star-structure'] = star.isStar;

      // 3. Cables
      results['crit-cables'] = activeLinks.length >= 3 && devices.length >= 4;

      // 4. Simulation
      results['crit-simulation'] = pingWorked;
      break;
    }

    case 'lab-2': {
      // 1. Devices
      const hasClient = devices.some((d) => d.type === 'laptop' || d.type === 'pc');
      const hasSat = devices.some((d) => d.type === 'satellite');
      const hasServer = devices.some((d) => d.type === 'server');
      results['crit-devices'] = hasClient && hasSat && hasServer && devices.length >= 3;

      // 2. Path
      const wan = checkSatelliteWanTopology(devices, links);
      results['crit-path'] = wan.isSatWan;

      // 3. Latency
      const satLinks = activeLinks.filter((l) => {
        const fromDev = devices.find((d) => d.id === l.fromId);
        const toDev = devices.find((d) => d.id === l.toId);
        return (
          fromDev?.type === 'satellite' ||
          toDev?.type === 'satellite' ||
          l.linkType === 'satellite' ||
          l.latencyMs >= 300
        );
      });
      results['crit-latency'] = satLinks.length >= 1;

      // 4. Simulation
      results['crit-simulation'] =
        pingWorked && (lastSuccessfulPing?.rtt || 0) >= 500;
      break;
    }

    case 'lab-3': {
      // 1. Devices
      results['crit-devices'] = devices.length >= 4;

      // 2. Ring Structure
      const ring = checkRingTopology(devices, links);
      results['crit-ring-structure'] = ring.isRing;

      // 3. Cables
      results['crit-cables'] = activeLinks.length >= 4 && activeLinks.length === devices.length;

      // 4. Simulation
      results['crit-simulation'] = pingWorked;
      break;
    }

    case 'lab-4': {
      // 1. Devices
      results['crit-devices'] = devices.length >= 4;

      // 2. Bus Structure
      const bus = checkBusTopology(devices, links);
      results['crit-bus-structure'] = bus.isBus;

      // 3. No Loops
      results['crit-no-loops'] = activeLinks.length === devices.length - 1 && devices.length >= 4;

      // 4. Simulation
      results['crit-simulation'] = pingWorked;
      break;
    }

    case 'lab-5': {
      // 1. Devices
      const rtrCount = devices.filter((d) => d.type === 'router').length;
      const swCount = devices.filter((d) => d.type === 'switch').length;
      const endCount = devices.filter((d) => d.type === 'pc' || d.type === 'laptop').length;
      results['crit-devices'] = rtrCount >= 1 && swCount >= 2 && endCount >= 2;

      // 2. Router Hub
      const hy = checkHybridTopology(devices, links);
      results['crit-router-hub'] = hy.isHybrid;

      // 3. Subnet Segmentation
      results['crit-subnet-segmentation'] = hy.isHybrid && swCount >= 2;

      // 4. Simulation
      results['crit-simulation'] = pingWorked;
      break;
    }

    default:
      activity.criteria.forEach((c) => {
        results[c.id] = devices.length >= 2 && links.length >= 1;
      });
      break;
  }

  const completedCount = Object.values(results).filter(Boolean).length;
  const totalCount = activity.criteria.length;
  const isAllCompleted = completedCount === totalCount;
  const score = Math.round((completedCount / totalCount) * 100);

  return {
    criterionResults: results,
    completedCount,
    totalCount,
    isAllCompleted,
    score,
  };
}

// Generate an official Student Submission Record
export function createStudentSubmission(
  studentName: string,
  studentId: string,
  courseSection: string,
  activity: LabActivity,
  devices: Device[],
  links: Link[],
  pingReport?: PingReport | null,
  studentNotes?: string,
  instructorName?: string
): StudentSubmission {
  const evalResult = evaluateActivityCriteria(activity, devices, links, pingReport);

  const rubric = activity.criteria.map((c) => {
    const passed = evalResult.criterionResults[c.id] || false;
    return {
      category: c.label,
      score: passed ? 25 : 10,
      maxScore: 25,
      feedback: passed
        ? `Successfully met requirements: ${c.description}`
        : `Partially met: Verify your topology layout and connectivity for ${c.label}.`,
    };
  });

  const totalScore = rubric.reduce((sum, item) => sum + item.score, 0);

  const submissionDate = new Date().toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    studentName: studentName.trim() || 'Cadet Engineer',
    studentId: studentId.trim() || '2026-CADET-01',
    courseSection: courseSection.trim() || 'BSMT / BSMarE',
    instructorName: instructorName?.trim() || 'Instructor / Evaluator',
    activityId: activity.id,
    activityTitle: activity.title,
    activityNumber: activity.number,
    submittedAt: submissionDate,
    devices: JSON.parse(JSON.stringify(devices)),
    links: JSON.parse(JSON.stringify(links)),
    pingReport: pingReport ? JSON.parse(JSON.stringify(pingReport)) : null,
    score: totalScore,
    maxScore: 100,
    passed: totalScore >= 75,
    rubric,
    studentNotes: studentNotes?.trim(),
  };
}
