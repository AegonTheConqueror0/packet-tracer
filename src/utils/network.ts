import { Device, Link } from '../types';

export function findPath(
  sourceId: string,
  targetId: string,
  devices: Device[],
  links: Link[]
): { path: string[]; links: Link[]; totalLatency: number } | null {
  if (sourceId === targetId) return null;

  // Build adjacency list
  const adj = new Map<string, { neighborId: string; link: Link }[]>();
  devices.forEach((d) => adj.set(d.id, []));

  links.forEach((l) => {
    if (l.isBroken) return; // Skip broken links
    if (adj.has(l.fromId) && adj.has(l.toId)) {
      adj.get(l.fromId)!.push({ neighborId: l.toId, link: l });
      adj.get(l.toId)!.push({ neighborId: l.fromId, link: l });
    }
  });

  // BFS for simplest hop path
  const queue: { id: string; path: string[]; linkPath: Link[]; latency: number }[] = [
    { id: sourceId, path: [sourceId], linkPath: [], latency: 0 },
  ];
  const visited = new Set<string>([sourceId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.id === targetId) {
      return {
        path: current.path,
        links: current.linkPath,
        totalLatency: current.latency,
      };
    }

    const neighbors = adj.get(current.id) || [];
    for (const { neighborId, link } of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push({
          id: neighborId,
          path: [...current.path, neighborId],
          linkPath: [...current.linkPath, link],
          latency: current.latency + link.latencyMs,
        });
      }
    }
  }

  return null;
}

export function getLinkBetween(
  fromId: string,
  toId: string,
  links: Link[]
): Link | undefined {
  return links.find(
    (l) =>
      (l.fromId === fromId && l.toId === toId) ||
      (l.fromId === toId && l.toId === fromId)
  );
}

/**
 * Finds the most informative path across the network (longest hop distance between end-devices)
 * so that students see the packet travel through all intermediate devices (switches, routers, satellites)
 */
export function findBestDemoPath(
  devices: Device[],
  links: Link[]
): {
  sourceId: string;
  targetId: string;
  route: { path: string[]; links: Link[]; totalLatency: number };
} | null {
  if (devices.length < 2) return null;

  const endDevices = devices.filter(
    (d) => d.type === 'pc' || d.type === 'laptop' || d.type === 'server'
  );
  const pool = endDevices.length >= 2 ? endDevices : devices;

  let best: {
    sourceId: string;
    targetId: string;
    route: { path: string[]; links: Link[]; totalLatency: number };
    hopCount: number;
  } | null = null;

  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const route = findPath(pool[i].id, pool[j].id, devices, links);
      if (route) {
        const hopCount = route.path.length;
        if (!best || hopCount > best.hopCount) {
          best = {
            sourceId: pool[i].id,
            targetId: pool[j].id,
            route,
            hopCount,
          };
        }
      }
    }
  }

  if (!best) {
    for (let i = 0; i < devices.length; i++) {
      for (let j = 0; j < devices.length; j++) {
        if (i !== j) {
          const route = findPath(devices[i].id, devices[j].id, devices, links);
          if (route) {
            return { sourceId: devices[i].id, targetId: devices[j].id, route };
          }
        }
      }
    }
  }

  return best ? { sourceId: best.sourceId, targetId: best.targetId, route: best.route } : null;
}

// Preset configurations tailored for Maritime students & general basic networking
export const PRESETS: {
  name: string;
  description: string;
  devices: Device[];
  links: Link[];
}[] = [
  {
    name: 'Bus Topology',
    description: 'Devices connected in a single linear backbone chain',
    devices: [
      {
        id: 'bus-1',
        type: 'pc',
        name: 'Bridge PC 1',
        ip: '192.168.1.10',
        x: 220,
        y: 280,
      },
      {
        id: 'bus-2',
        type: 'laptop',
        name: 'Deck Office 2',
        ip: '192.168.1.11',
        x: 440,
        y: 280,
      },
      {
        id: 'bus-3',
        type: 'pc',
        name: 'Radio Room 3',
        ip: '192.168.1.12',
        x: 660,
        y: 280,
      },
      {
        id: 'bus-4',
        type: 'pc',
        name: 'Cargo Control 4',
        ip: '192.168.1.13',
        x: 880,
        y: 280,
      },
    ],
    links: [
      {
        id: 'l-bus-1',
        fromId: 'bus-1',
        toId: 'bus-2',
        latencyMs: 5,
        linkType: 'ethernet',
      },
      {
        id: 'l-bus-2',
        fromId: 'bus-2',
        toId: 'bus-3',
        latencyMs: 5,
        linkType: 'ethernet',
      },
      {
        id: 'l-bus-3',
        fromId: 'bus-3',
        toId: 'bus-4',
        latencyMs: 5,
        linkType: 'ethernet',
      },
    ],
  },
  {
    name: 'Star Topology',
    description: 'All workstations connected directly to a central network switch',
    devices: [
      {
        id: 'star-sw',
        type: 'switch',
        name: 'Central Bridge Switch',
        ip: '192.168.1.1',
        x: 540,
        y: 290,
      },
      {
        id: 'star-1',
        type: 'pc',
        name: 'Navigation PC',
        ip: '192.168.1.10',
        x: 540,
        y: 130,
      },
      {
        id: 'star-2',
        type: 'pc',
        name: 'Radar Console',
        ip: '192.168.1.11',
        x: 750,
        y: 220,
      },
      {
        id: 'star-3',
        type: 'pc',
        name: 'Engine Console',
        ip: '192.168.1.12',
        x: 680,
        y: 440,
      },
      {
        id: 'star-4',
        type: 'pc',
        name: 'Cargo Control',
        ip: '192.168.1.13',
        x: 400,
        y: 440,
      },
      {
        id: 'star-5',
        type: 'laptop',
        name: "Captain's Laptop",
        ip: '192.168.1.14',
        x: 330,
        y: 220,
      },
    ],
    links: [
      {
        id: 'l-star-1',
        fromId: 'star-sw',
        toId: 'star-1',
        latencyMs: 5,
        linkType: 'ethernet',
      },
      {
        id: 'l-star-2',
        fromId: 'star-sw',
        toId: 'star-2',
        latencyMs: 5,
        linkType: 'ethernet',
      },
      {
        id: 'l-star-3',
        fromId: 'star-sw',
        toId: 'star-3',
        latencyMs: 5,
        linkType: 'ethernet',
      },
      {
        id: 'l-star-4',
        fromId: 'star-sw',
        toId: 'star-4',
        latencyMs: 5,
        linkType: 'ethernet',
      },
      {
        id: 'l-star-5',
        fromId: 'star-sw',
        toId: 'star-5',
        latencyMs: 5,
        linkType: 'ethernet',
      },
    ],
  },
  {
    name: 'Ring Topology',
    description: 'Circular network where each device connects to two neighbors',
    devices: [
      {
        id: 'ring-1',
        type: 'pc',
        name: 'Bridge Station 1',
        ip: '192.168.1.1',
        x: 540,
        y: 130,
      },
      {
        id: 'ring-2',
        type: 'laptop',
        name: 'Radio Console 2',
        ip: '192.168.1.2',
        x: 750,
        y: 250,
      },
      {
        id: 'ring-3',
        type: 'pc',
        name: 'Engine Room 3',
        ip: '192.168.1.3',
        x: 670,
        y: 440,
      },
      {
        id: 'ring-4',
        type: 'pc',
        name: 'Cargo Deck 4',
        ip: '192.168.1.4',
        x: 410,
        y: 440,
      },
      {
        id: 'ring-5',
        type: 'pc',
        name: 'ECDIS Console 5',
        ip: '192.168.1.5',
        x: 330,
        y: 250,
      },
    ],
    links: [
      {
        id: 'l-ring-1',
        fromId: 'ring-1',
        toId: 'ring-2',
        latencyMs: 6,
        linkType: 'ethernet',
      },
      {
        id: 'l-ring-2',
        fromId: 'ring-2',
        toId: 'ring-3',
        latencyMs: 6,
        linkType: 'ethernet',
      },
      {
        id: 'l-ring-3',
        fromId: 'ring-3',
        toId: 'ring-4',
        latencyMs: 6,
        linkType: 'ethernet',
      },
      {
        id: 'l-ring-4',
        fromId: 'ring-4',
        toId: 'ring-5',
        latencyMs: 6,
        linkType: 'ethernet',
      },
      {
        id: 'l-ring-5',
        fromId: 'ring-5',
        toId: 'ring-1',
        latencyMs: 6,
        linkType: 'ethernet',
      },
    ],
  },
  {
    name: 'Mesh Topology',
    description: 'Fully interconnected nodes providing redundant failover routes',
    devices: [
      {
        id: 'mesh-1',
        type: 'pc',
        name: 'Bridge Navigation',
        ip: '192.168.1.10',
        x: 380,
        y: 170,
      },
      {
        id: 'mesh-2',
        type: 'pc',
        name: 'ECDIS Radar',
        ip: '192.168.1.11',
        x: 700,
        y: 170,
      },
      {
        id: 'mesh-3',
        type: 'pc',
        name: 'Engine Control',
        ip: '192.168.1.12',
        x: 700,
        y: 410,
      },
      {
        id: 'mesh-4',
        type: 'router',
        name: 'Safety Gateway',
        ip: '192.168.1.1',
        x: 380,
        y: 410,
      },
    ],
    links: [
      {
        id: 'l-mesh-1',
        fromId: 'mesh-1',
        toId: 'mesh-2',
        latencyMs: 5,
        linkType: 'ethernet',
      },
      {
        id: 'l-mesh-2',
        fromId: 'mesh-2',
        toId: 'mesh-3',
        latencyMs: 5,
        linkType: 'ethernet',
      },
      {
        id: 'l-mesh-3',
        fromId: 'mesh-3',
        toId: 'mesh-4',
        latencyMs: 5,
        linkType: 'ethernet',
      },
      {
        id: 'l-mesh-4',
        fromId: 'mesh-4',
        toId: 'mesh-1',
        latencyMs: 5,
        linkType: 'ethernet',
      },
      {
        id: 'l-mesh-cross1',
        fromId: 'mesh-1',
        toId: 'mesh-3',
        latencyMs: 5,
        linkType: 'fiber',
      },
      {
        id: 'l-mesh-cross2',
        fromId: 'mesh-2',
        toId: 'mesh-4',
        latencyMs: 5,
        linkType: 'fiber',
      },
    ],
  },
  {
    name: 'Hybrid Topology',
    description: 'Star-to-Star network linked through a central gateway router',
    devices: [
      {
        id: 'hy-sw1',
        type: 'switch',
        name: 'Bridge Deck Switch',
        ip: '192.168.1.1',
        x: 350,
        y: 280,
      },
      {
        id: 'hy-pc1',
        type: 'pc',
        name: 'Navigation Console',
        ip: '192.168.1.10',
        x: 180,
        y: 180,
      },
      {
        id: 'hy-pc2',
        type: 'laptop',
        name: "Captain's Laptop",
        ip: '192.168.1.11',
        x: 180,
        y: 380,
      },
      {
        id: 'hy-rtr',
        type: 'router',
        name: 'Vessel Backbone Router',
        ip: '192.168.1.254',
        x: 540,
        y: 280,
      },
      {
        id: 'hy-sw2',
        type: 'switch',
        name: 'Engine Deck Switch',
        ip: '192.168.2.1',
        x: 730,
        y: 280,
      },
      {
        id: 'hy-pc3',
        type: 'pc',
        name: 'Engine Control PC',
        ip: '192.168.2.10',
        x: 900,
        y: 180,
      },
      {
        id: 'hy-pc4',
        type: 'pc',
        name: 'Propulsion Monitor',
        ip: '192.168.2.11',
        x: 900,
        y: 380,
      },
    ],
    links: [
      {
        id: 'l-hy-1',
        fromId: 'hy-pc1',
        toId: 'hy-sw1',
        latencyMs: 4,
        linkType: 'ethernet',
      },
      {
        id: 'l-hy-2',
        fromId: 'hy-pc2',
        toId: 'hy-sw1',
        latencyMs: 4,
        linkType: 'ethernet',
      },
      {
        id: 'l-hy-3',
        fromId: 'hy-sw1',
        toId: 'hy-rtr',
        latencyMs: 6,
        linkType: 'fiber',
      },
      {
        id: 'l-hy-4',
        fromId: 'hy-rtr',
        toId: 'hy-sw2',
        latencyMs: 6,
        linkType: 'fiber',
      },
      {
        id: 'l-hy-5',
        fromId: 'hy-sw2',
        toId: 'hy-pc3',
        latencyMs: 4,
        linkType: 'ethernet',
      },
      {
        id: 'l-hy-6',
        fromId: 'hy-sw2',
        toId: 'hy-pc4',
        latencyMs: 4,
        linkType: 'ethernet',
      },
    ],
  },
  {
    name: 'Vessel to Shore (VSAT)',
    description: 'Bridge navigation PC sending data to Shore Station via satellite link',
    devices: [
      {
        id: 'dev-1',
        type: 'pc',
        name: 'Bridge Navigation PC',
        ip: '192.168.1.10',
        x: 140,
        y: 220,
      },
      {
        id: 'dev-2',
        type: 'laptop',
        name: "Captain's Laptop",
        ip: '192.168.1.11',
        x: 140,
        y: 400,
      },
      {
        id: 'dev-3',
        type: 'switch',
        name: 'Ship LAN Switch',
        ip: '192.168.1.2',
        x: 350,
        y: 310,
      },
      {
        id: 'dev-4',
        type: 'router',
        name: 'Vessel Gateway Router',
        ip: '192.168.1.1',
        x: 540,
        y: 310,
      },
      {
        id: 'dev-5',
        type: 'satellite',
        name: 'Maritime VSAT Satellite',
        ip: '10.0.0.1',
        x: 750,
        y: 200,
      },
      {
        id: 'dev-6',
        type: 'server',
        name: 'Port Authority Shore Server',
        ip: '142.250.190.46',
        x: 960,
        y: 310,
      },
    ],
    links: [
      {
        id: 'link-1',
        fromId: 'dev-1',
        toId: 'dev-3',
        latencyMs: 5,
        linkType: 'ethernet',
      },
      {
        id: 'link-2',
        fromId: 'dev-2',
        toId: 'dev-3',
        latencyMs: 5,
        linkType: 'ethernet',
      },
      {
        id: 'link-3',
        fromId: 'dev-3',
        toId: 'dev-4',
        latencyMs: 5,
        linkType: 'ethernet',
      },
      {
        id: 'link-4',
        fromId: 'dev-4',
        toId: 'dev-5',
        latencyMs: 550,
        linkType: 'satellite',
      },
      {
        id: 'link-5',
        fromId: 'dev-5',
        toId: 'dev-6',
        latencyMs: 550,
        linkType: 'satellite',
      },
    ],
  },
];
