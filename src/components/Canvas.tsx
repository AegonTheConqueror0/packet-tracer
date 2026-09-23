import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Device, Link, ActiveTool, SimulatedPacket } from '../types';
import { DeviceIcon, DEVICE_METADATA } from './DeviceIcon';
import { sounds } from '../utils/audio';
import { getLinkBetween, findPath } from '../utils/network';
import { Zap, AlertTriangle, Send, CheckCircle2, XCircle, Cable } from 'lucide-react';

interface CanvasProps {
  devices: Device[];
  links: Link[];
  activeTool: ActiveTool;
  simSpeed: number;
  onUpdateDevicePos: (id: string, x: number, y: number) => void;
  onConnectDevices: (fromId: string, toId: string) => void;
  onSelectLink: (link: Link) => void;
  onSelectDevice: (device: Device) => void;
  onDropNewDevice: (type: string, x: number, y: number) => void;
  activePacket: SimulatedPacket | null;
  setActivePacket: React.Dispatch<React.SetStateAction<SimulatedPacket | null>>;
  lastResult: { success: boolean; rtt: number; from: string; to: string } | null;
  setLastResult: (res: { success: boolean; rtt: number; from: string; to: string } | null) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  devices,
  links,
  activeTool,
  simSpeed,
  onUpdateDevicePos,
  onConnectDevices,
  onSelectLink,
  onSelectDevice,
  onDropNewDevice,
  activePacket,
  setActivePacket,
  lastResult,
  setLastResult,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging existing device state
  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Cable tool state: connecting from one device to another
  const [cableSourceId, setCableSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Packet tool state: picking source then target
  const [packetSourceId, setPacketSourceId] = useState<string | null>(null);

  // Active glowing device (when packet is processed)
  const [pulsingDeviceId, setPulsingDeviceId] = useState<string | null>(null);

  // Reset tool temporary state when tool changes
  useEffect(() => {
    setCableSourceId(null);
    setPacketSourceId(null);
  }, [activeTool]);

  // Handle Dragging an existing device
  const handleMouseDownDevice = (e: React.MouseEvent, device: Device) => {
    e.stopPropagation();

    if (activeTool === 'select') {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      setDraggingDeviceId(device.id);
      setDragOffset({
        x: e.clientX - containerRect.left - device.x,
        y: e.clientY - containerRect.top - device.y,
      });
    } else if (activeTool === 'cable') {
      sounds.playClick();
      if (!cableSourceId) {
        setCableSourceId(device.id);
      } else {
        if (cableSourceId !== device.id) {
          onConnectDevices(cableSourceId, device.id);
        }
        setCableSourceId(null);
      }
    } else if (activeTool === 'packet') {
      sounds.playClick();
      if (!packetSourceId) {
        setPacketSourceId(device.id);
      } else {
        if (packetSourceId !== device.id) {
          startPacketSimulation(packetSourceId, device.id);
        }
        setPacketSourceId(null);
      }
    }
  };

  // Start packet transfer simulation
  const startPacketSimulation = useCallback(
    (srcId: string, dstId: string) => {
      const route = findPath(srcId, dstId, devices, links);
      if (!route) {
        sounds.playError();
        setLastResult({
          success: false,
          rtt: 0,
          from: devices.find((d) => d.id === srcId)?.name || 'Device',
          to: devices.find((d) => d.id === dstId)?.name || 'Device',
        });
        return;
      }

      sounds.playSend();
      setLastResult(null);

      // Total round trip latency = one way * 2
      const rtt = route.totalLatency * 2;

      // Calculate duration for first segment
      const firstLink = route.links[0];
      const segLatency = firstLink ? firstLink.latencyMs : 20;
      // Map latency to visual duration in ms (min 400ms, max 2400ms)
      const baseDuration = Math.max(350, Math.min(2400, segLatency * 2.2));

      setActivePacket({
        id: `pkt-${Date.now()}`,
        sourceId: srcId,
        targetId: dstId,
        path: route.path,
        currentHop: 0,
        progress: 0,
        phase: 'forward',
        durationForSegment: baseDuration,
        totalLatency: rtt,
        status: 'flying',
        message: 'Ping Request transmitting...',
      });
    },
    [devices, links, setActivePacket, setLastResult]
  );

  // Packet animation loop: strictly pure state progression
  useEffect(() => {
    if (!activePacket || activePacket.status !== 'flying') return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const tick = (currentTime: number) => {
      const delta = (currentTime - lastTime) * simSpeed;
      lastTime = currentTime;

      let shouldContinue = true;

      setActivePacket((prev) => {
        if (!prev || prev.status !== 'flying') {
          shouldContinue = false;
          return prev;
        }

        const path = prev.phase === 'forward' ? prev.path : [...prev.path].reverse();
        const fromId = path[prev.currentHop];
        const toId = path[prev.currentHop + 1];

        if (!fromId || !toId) {
          shouldContinue = false;
          return prev;
        }

        const link = getLinkBetween(fromId, toId, links);
        if (link?.isBroken) {
          shouldContinue = false;
          return {
            ...prev,
            status: 'failed',
            message: 'Packet dropped: cable broken!',
          };
        }

        const speedFactor = prev.durationForSegment || 600;
        const progressIncrement = delta / speedFactor;
        const newProgress = prev.progress + progressIncrement;

        if (newProgress < 1) {
          return {
            ...prev,
            progress: newProgress,
          };
        }

        // Reached hop destination
        const nextHop = prev.currentHop + 1;
        const reachedTargetOfPhase = nextHop >= path.length - 1;

        if (!reachedTargetOfPhase) {
          const nextFromId = path[nextHop];
          const nextToId = path[nextHop + 1];
          const nextLink = getLinkBetween(nextFromId, nextToId, links);
          const nextLatency = nextLink ? nextLink.latencyMs : 20;
          const nextDuration = Math.max(350, Math.min(2400, nextLatency * 2.2));

          return {
            ...prev,
            currentHop: nextHop,
            progress: 0,
            durationForSegment: nextDuration,
          };
        } else {
          // Reached end of phase
          if (prev.phase === 'forward') {
            // First return segment
            const returnPath = [...prev.path].reverse();
            const returnLink = getLinkBetween(returnPath[0], returnPath[1], links);
            const returnLatency = returnLink ? returnLink.latencyMs : 20;
            const returnDuration = Math.max(350, Math.min(2400, returnLatency * 2.2));

            return {
              ...prev,
              phase: 'reply',
              currentHop: 0,
              progress: 0,
              durationForSegment: returnDuration,
              message: 'Destination received packet. Returning ACK reply...',
            };
          } else {
            // Reached source on reply! Ping complete!
            shouldContinue = false;
            return {
              ...prev,
              status: 'delivered',
              progress: 1,
              message: `Ping ACK received! Round-Trip: ${prev.totalLatency}ms`,
            };
          }
        }
      });

      if (shouldContinue) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activePacket?.id, activePacket?.status, simSpeed, links, setActivePacket]);

  // Intermediate hop sound and pulse side-effect
  useEffect(() => {
    if (!activePacket || activePacket.status !== 'flying') return;
    if (activePacket.currentHop > 0 || activePacket.phase === 'reply') {
      sounds.playHop();
      const path = activePacket.phase === 'forward' ? activePacket.path : [...activePacket.path].reverse();
      const devId = path[activePacket.currentHop];
      if (devId) {
        setPulsingDeviceId(devId);
        const timer = setTimeout(() => setPulsingDeviceId(null), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [activePacket?.currentHop, activePacket?.phase, activePacket?.id, activePacket?.status]);

  // Terminal state (delivered or failed) side-effects
  useEffect(() => {
    if (!activePacket) return;

    if (activePacket.status === 'delivered') {
      sounds.playSuccess();
      setPulsingDeviceId(activePacket.sourceId);
      const timer = setTimeout(() => setPulsingDeviceId(null), 600);

      const srcName = devices.find((d) => d.id === activePacket.sourceId)?.name || 'Device';
      const dstName = devices.find((d) => d.id === activePacket.targetId)?.name || 'Device';
      setLastResult({
        success: true,
        rtt: activePacket.totalLatency,
        from: srcName,
        to: dstName,
      });

      return () => clearTimeout(timer);
    }

    if (activePacket.status === 'failed') {
      sounds.playError();
      const srcName = devices.find((d) => d.id === activePacket.sourceId)?.name || 'Device';
      const dstName = devices.find((d) => d.id === activePacket.targetId)?.name || 'Device';
      setLastResult({
        success: false,
        rtt: 0,
        from: srcName,
        to: dstName,
      });
    }
  }, [activePacket?.status, activePacket?.id, activePacket?.totalLatency, activePacket?.sourceId, activePacket?.targetId, devices, setLastResult]);

  // Clear delivered packet after brief pause
  useEffect(() => {
    if (activePacket?.status === 'delivered' || activePacket?.status === 'failed') {
      const timer = setTimeout(() => {
        setActivePacket(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [activePacket?.status, setActivePacket]);

  // Window-level mouse move and mouse up when dragging a device on canvas
  useEffect(() => {
    if (!draggingDeviceId) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const newX = Math.round((e.clientX - containerRect.left - dragOffset.x) / 10) * 10;
      const newY = Math.round((e.clientY - containerRect.top - dragOffset.y) / 10) * 10;
      onUpdateDevicePos(
        draggingDeviceId,
        Math.max(50, Math.min(containerRect.width - 50, newX)),
        Math.max(50, Math.min(containerRect.height - 50, newY))
      );
    };

    const handleWindowMouseUp = () => {
      setDraggingDeviceId(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingDeviceId, dragOffset, onUpdateDevicePos]);

  // Global mouse move for drawing cable preview
  const handleMouseMove = (e: React.MouseEvent) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const x = Math.max(20, Math.min(containerRect.width - 20, e.clientX - containerRect.left));
    const y = Math.max(20, Math.min(containerRect.height - 20, e.clientY - containerRect.top));
    setMousePos({ x, y });
  };

  const handleMouseUp = () => {
    if (draggingDeviceId) {
      setDraggingDeviceId(null);
    }
  };

  // Drag & drop new device from palette
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type =
      e.dataTransfer.getData('application/device-type') ||
      e.dataTransfer.getData('text/plain');
    if (!type) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const x = Math.round((e.clientX - containerRect.left) / 10) * 10;
    const y = Math.round((e.clientY - containerRect.top) / 10) * 10;

    sounds.playClick();
    onDropNewDevice(
      type,
      Math.max(60, Math.min(containerRect.width - 60, x)),
      Math.max(60, Math.min(containerRect.height - 60, y))
    );
  };

  // Compute animated packet coordinates along currently active hop
  let packetCoords: { x: number; y: number; angle: number } | null = null;
  let trailingParticles: { x: number; y: number; opacity: number; size: number }[] = [];
  let currentActiveHopLink: { fromId: string; toId: string } | null = null;

  if (activePacket && activePacket.status === 'flying') {
    const path =
      activePacket.phase === 'forward'
        ? activePacket.path
        : [...activePacket.path].reverse();
    const fromId = path[activePacket.currentHop];
    const toId = path[activePacket.currentHop + 1];

    if (fromId && toId) {
      currentActiveHopLink = { fromId, toId };
      const fromDev = devices.find((d) => d.id === fromId);
      const toDev = devices.find((d) => d.id === toId);

      if (fromDev && toDev) {
        const t = activePacket.progress;
        const x = fromDev.x + (toDev.x - fromDev.x) * t;
        const y = fromDev.y + (toDev.y - fromDev.y) * t;
        const angle =
          (Math.atan2(toDev.y - fromDev.y, toDev.x - fromDev.x) * 180) / Math.PI;
        packetCoords = { x, y, angle };

        // 3 trailing particles along the active wire
        const offsets = [0.08, 0.16, 0.24];
        trailingParticles = offsets.map((offset, i) => {
          const pt = Math.max(0, t - offset);
          return {
            x: fromDev.x + (toDev.x - fromDev.x) * pt,
            y: fromDev.y + (toDev.y - fromDev.y) * pt,
            opacity: 0.7 - i * 0.22,
            size: Math.max(2, 5.5 - i * 1.4),
          };
        });
      }
    }
  }

  const cableSourceDevice = cableSourceId
    ? devices.find((d) => d.id === cableSourceId)
    : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => {
        if (activeTool === 'cable') setCableSourceId(null);
        if (activeTool === 'packet') setPacketSourceId(null);
      }}
      className="relative flex-1 w-full h-full bg-[#0a0f1d] overflow-hidden select-none cursor-default"
      style={{
        backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.07) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Dynamic SVG layer for all wires and packets */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <style>{`
            @keyframes dataWireFlow {
              from { stroke-dashoffset: 24; }
              to { stroke-dashoffset: 0; }
            }
            .wire-data-active {
              animation: dataWireFlow 0.45s linear infinite;
            }
          `}</style>
          {/* Subtle gradient for active cables */}
          <linearGradient id="cable-active" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          {/* Glowing filter for packets */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Existing Links / Cables */}
        {links.map((link) => {
          const fromDev = devices.find((d) => d.id === link.fromId);
          const toDev = devices.find((d) => d.id === link.toId);
          if (!fromDev || !toDev) return null;

          const isSatellite = link.linkType === 'satellite';
          const isBroken = link.isBroken;

          // Is this specific cable currently carrying the traveling packet?
          const isTransmitting = Boolean(
            currentActiveHopLink &&
              ((link.fromId === currentActiveHopLink.fromId &&
                link.toId === currentActiveHopLink.toId) ||
                (link.fromId === currentActiveHopLink.toId &&
                  link.toId === currentActiveHopLink.fromId))
          );

          // Wire styling
          let strokeColor = '#334155'; // default slate-700
          let strokeDash = isSatellite ? '6,6' : 'none';
          let strokeWidth = 2.5;

          if (isBroken) {
            strokeColor = '#f43f5e'; // broken red
            strokeDash = '4,4';
          } else if (isSatellite) {
            strokeColor = '#06b6d4'; // cyan satellite line
          } else if (link.linkType === 'fiber') {
            strokeColor = '#f59e0b'; // amber fiber
          } else {
            strokeColor = '#3b82f6'; // blue ethernet
          }

          return (
            <g key={link.id} className="pointer-events-auto cursor-pointer group">
              {/* Invisible thicker stroke for easy clicking */}
              <line
                x1={fromDev.x}
                y1={fromDev.y}
                x2={toDev.x}
                y2={toDev.y}
                stroke="transparent"
                strokeWidth={22}
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playClick();
                  onSelectLink(link);
                }}
              />
              {/* Base wire */}
              <line
                x1={fromDev.x}
                y1={fromDev.y}
                x2={toDev.x}
                y2={toDev.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDash}
                className="transition-colors group-hover:stroke-cyan-300"
              />

              {/* Active data transmission effect on wire */}
              {isTransmitting && (
                <>
                  {/* Energy halo along active line */}
                  <line
                    x1={fromDev.x}
                    y1={fromDev.y}
                    x2={toDev.x}
                    y2={toDev.y}
                    stroke={activePacket?.phase === 'forward' ? '#38bdf8' : '#34d399'}
                    strokeWidth={8}
                    strokeOpacity={0.4}
                    filter="url(#glow)"
                  />
                  {/* Flowing animated dashes simulating high-speed data stream */}
                  <line
                    x1={fromDev.x}
                    y1={fromDev.y}
                    x2={toDev.x}
                    y2={toDev.y}
                    stroke={activePacket?.phase === 'forward' ? '#7dd3fc' : '#6ee7b7'}
                    strokeWidth={3.5}
                    strokeDasharray="8,6"
                    className="wire-data-active"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Cable connection drag preview line */}
        {cableSourceDevice && (
          <line
            x1={cableSourceDevice.x}
            y1={cableSourceDevice.y}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="#38bdf8"
            strokeWidth={2}
            strokeDasharray="4,4"
            className="animate-pulse"
          />
        )}

        {/* Trailing data particles along wire */}
        {trailingParticles.map((p, i) => (
          <circle
            key={`particle-${i}`}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill={activePacket?.phase === 'forward' ? '#38bdf8' : '#34d399'}
            opacity={p.opacity}
            filter="url(#glow)"
          />
        ))}

        {/* Animated Flying Packet */}
        {packetCoords && activePacket && (
          <g
            transform={`translate(${packetCoords.x}, ${packetCoords.y})`}
            filter="url(#glow)"
          >
            {/* Outer pulsating beacon */}
            <circle
              r={18}
              fill={
                activePacket.phase === 'forward'
                  ? 'rgba(56, 189, 248, 0.35)'
                  : 'rgba(52, 211, 153, 0.35)'
              }
              className="animate-ping"
            />
            {/* Rotated badge in direction of movement */}
            <g transform={`rotate(${packetCoords.angle})`}>
              <rect
                x={-16}
                y={-10}
                width={32}
                height={20}
                rx={6}
                fill={activePacket.phase === 'forward' ? '#0284c7' : '#059669'}
                stroke="#ffffff"
                strokeWidth={1.8}
              />
              <text
                x={0}
                y={3.5}
                fill="#ffffff"
                fontSize={9}
                fontWeight="bold"
                fontFamily="ui-monospace, monospace"
                textAnchor="middle"
              >
                {activePacket.phase === 'forward' ? 'PING' : 'ACK'}
              </text>
            </g>
          </g>
        )}
      </svg>

      {/* Cable Latency Badges (rendered on top of SVG lines in DOM for crispness & accessibility) */}
      {links.map((link) => {
        const fromDev = devices.find((d) => d.id === link.fromId);
        const toDev = devices.find((d) => d.id === link.toId);
        if (!fromDev || !toDev) return null;

        const midX = (fromDev.x + toDev.x) / 2;
        const midY = (fromDev.y + toDev.y) / 2;

        const isTransmitting = Boolean(
          currentActiveHopLink &&
            ((link.fromId === currentActiveHopLink.fromId &&
              link.toId === currentActiveHopLink.toId) ||
              (link.fromId === currentActiveHopLink.toId &&
                link.toId === currentActiveHopLink.fromId))
        );

        return (
          <div
            key={`badge-${link.id}`}
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              onSelectLink(link);
            }}
            style={{ left: `${midX}px`, top: `${midY}px` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-mono cursor-pointer transition-all hover:scale-110 shadow-md ${
              isTransmitting
                ? 'scale-110 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 bg-cyan-950 text-cyan-200 border-cyan-400 animate-pulse'
                : link.isBroken
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-300'
                : link.linkType === 'satellite'
                ? 'bg-slate-900/90 border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
                : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
            title="Click to configure latency or cable settings"
          >
            {link.isBroken ? (
              <>
                <AlertTriangle size={11} className="text-rose-400" />
                <span>Broken</span>
              </>
            ) : (
              <>
                <Zap
                  size={11}
                  className={
                    isTransmitting
                      ? 'text-cyan-300 animate-bounce'
                      : link.latencyMs > 300
                      ? 'text-cyan-400'
                      : 'text-amber-400'
                  }
                />
                <span>{link.latencyMs}ms</span>
              </>
            )}
          </div>
        );
      })}

      {/* Network Device Nodes */}
      {devices.map((device) => {
        const meta = DEVICE_METADATA[device.type];
        const isSelectedCableStart = cableSourceId === device.id;
        const isSelectedPacketSource = packetSourceId === device.id;
        const isPulsing = pulsingDeviceId === device.id;

        return (
          <div
            key={device.id}
            onMouseDown={(e) => handleMouseDownDevice(e, device)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              onSelectDevice(device);
            }}
            style={{ left: `${device.x}px`, top: `${device.y}px` }}
            className={`group absolute -translate-x-1/2 -translate-y-1/2 z-20 select-none ${
              activeTool === 'select' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
            }`}
          >
            {/* Selection / Target Ring */}
            {(isSelectedCableStart || isSelectedPacketSource || isPulsing) && (
              <div
                className={`absolute inset-0 -m-2 rounded-2xl border-2 pointer-events-none animate-pulse ${
                  isPulsing
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : isSelectedPacketSource
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                    : 'border-blue-400 bg-blue-500/10'
                }`}
              />
            )}

            {/* Device Box */}
            <div
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-150 ${
                isPulsing
                  ? 'border-emerald-400 bg-slate-800 scale-105 shadow-xl shadow-emerald-500/20'
                  : isSelectedPacketSource
                  ? 'border-cyan-400 bg-slate-800/95 shadow-xl shadow-cyan-500/20'
                  : isSelectedCableStart
                  ? 'border-blue-400 bg-slate-800/95 shadow-xl shadow-blue-500/20'
                  : 'border-slate-800 bg-slate-900/90 hover:border-slate-600 hover:bg-slate-800/90 shadow-lg'
              }`}
            >
              {/* Device Icon Avatar */}
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105`}
              >
                <DeviceIcon type={device.type} size={20} />
              </div>

              {/* Label & IP */}
              <div className="mt-1.5 text-center max-w-[120px]">
                <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                  {device.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {device.ip}
                </div>
              </div>

              {/* Quick edit button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playClick();
                  onSelectDevice(device);
                }}
                title="Configure device name / IP"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <span className="text-[10px] leading-none">⚙</span>
              </button>
            </div>

            {/* In Packet Mode Tooltip */}
            {activeTool === 'packet' && !packetSourceId && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] px-2 py-0.5 rounded-md pointer-events-none shadow-md">
                Click as Sender
              </div>
            )}
            {activeTool === 'packet' && packetSourceId === device.id && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-cyan-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-md pointer-events-none shadow-md shadow-cyan-400/30 animate-bounce">
                SENDER
              </div>
            )}
            {activeTool === 'packet' && packetSourceId && packetSourceId !== device.id && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] px-2 py-0.5 rounded-md pointer-events-none shadow-md">
                Click as Destination
              </div>
            )}
          </div>
        );
      })}

      {/* Empty State when Canvas has no devices yet */}
      {devices.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none">
          <div className="flex flex-col items-center max-w-sm text-center p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 backdrop-blur-xs">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
              <Cable size={24} />
            </div>
            <h2 className="text-sm font-semibold text-slate-200 mb-1">Canvas is Ready</h2>
            <p className="text-xs text-slate-400">
              Drag devices from the left menu or click any device to place it on the board.
            </p>
          </div>
        </div>
      )}

      {/* Helpful Minimal Instruction Badge (Top Center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg text-xs text-slate-300 backdrop-blur-md">
          {activeTool === 'select' && (
            <span>💡 Drag devices to rearrange. Click any cable to edit latency.</span>
          )}
          {activeTool === 'cable' && (
            <span>
              {cableSourceId
                ? '🔌 Now click the second device to connect cable.'
                : '🔌 Click first device to start cable connection.'}
            </span>
          )}
          {activeTool === 'packet' && (
            <span>
              {packetSourceId
                ? '✉️ Now click destination device to transmit packet.'
                : '✉️ Click source device to begin packet trace.'}
            </span>
          )}
        </div>
      </div>

      {/* Live Simulation / Result Toast (Bottom Center) */}
      {(activePacket || lastResult) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div
            className={`flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-2xl backdrop-blur-md text-xs transition-all ${
              activePacket
                ? 'bg-slate-900/95 border-cyan-500/50 text-slate-200'
                : lastResult?.success
                ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-900/95 border-rose-500/50 text-rose-200'
            }`}
          >
            {activePacket ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-cyan-300">{activePacket.message}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    RTT Estimate: {activePacket.totalLatency}ms
                  </span>
                </div>
              </>
            ) : lastResult?.success ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-300">
                    Round-Trip Successful!
                  </span>
                  <span className="ml-2 text-slate-300">
                    {lastResult.from} ↔ {lastResult.to}
                  </span>
                  <span className="ml-2 px-1.5 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                    Latency: {lastResult.rtt} ms
                  </span>
                </div>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-rose-400 shrink-0" />
                <div>
                  <span className="font-semibold text-rose-300">
                    Host Unreachable!
                  </span>
                  <span className="ml-2 text-slate-400">
                    Check cable connection or broken link between {lastResult?.from} and {lastResult?.to}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
