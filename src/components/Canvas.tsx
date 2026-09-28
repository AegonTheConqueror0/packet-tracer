import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Device, Link, ActiveTool, SimulatedPacket } from '../types';
import { DeviceIcon, DEVICE_METADATA } from './DeviceIcon';
import { sounds } from '../utils/audio';
import { getLinkBetween, findPath } from '../utils/network';
import {
  Zap,
  AlertTriangle,
  Send,
  CheckCircle2,
  XCircle,
  Cable,
  Lock,
  Activity,
  AlertCircle,
  HelpCircle,
  Plus,
  MousePointer,
  RotateCcw,
} from 'lucide-react';

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
  lastResult: {
    success: boolean;
    rtt: number;
    from: string;
    to: string;
    fromId?: string;
    toId?: string;
  } | null;
  setLastResult: (
    res: {
      success: boolean;
      rtt: number;
      from: string;
      to: string;
      fromId?: string;
      toId?: string;
    } | null
  ) => void;
  isLocked?: boolean;
  onToggleLock?: () => void;
  onOpenPingInspector?: (sourceId?: string, targetId?: string) => void;
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
  isLocked = false,
  onToggleLock,
  onOpenPingInspector,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging existing device state
  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Cable tool state: connecting from one device to another
  const [cableSourceId, setCableSourceId] = useState<string | null>(null);
  const [isDraggingCable, setIsDraggingCable] = useState<boolean>(false);
  const [snappedTargetId, setSnappedTargetId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Quick selected device for in-canvas context options
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // Packet tool state: picking source then target
  const [packetSourceId, setPacketSourceId] = useState<string | null>(null);

  // Active glowing device (when packet is processed)
  const [pulsingDeviceId, setPulsingDeviceId] = useState<string | null>(null);

  // Canvas Toast Notifications
  const [canvasToast, setCanvasToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setCanvasToast({ message, type });
    const timer = setTimeout(() => setCanvasToast(null), 3200);
    return () => clearTimeout(timer);
  }, []);

  const triggerLockNotice = useCallback((msg: string) => {
    sounds.playError();
    showToast(msg, 'error');
  }, [showToast]);

  // Reset tool temporary state when tool changes
  useEffect(() => {
    setCableSourceId(null);
    setIsDraggingCable(false);
    setSnappedTargetId(null);
    setPacketSourceId(null);
  }, [activeTool]);

  // Keyboard Escape listener to cancel connection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (cableSourceId) {
          setCableSourceId(null);
          setIsDraggingCable(false);
          setSnappedTargetId(null);
          showToast('Cable connection cancelled', 'info');
        }
        if (packetSourceId) {
          setPacketSourceId(null);
        }
        setSelectedDeviceId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cableSourceId, packetSourceId, showToast]);

  // Helper to map link latency to realistic animation duration (ms)
  const getVisualDurationForLatency = (latencyMs: number) => {
    return Math.max(300, Math.min(2600, 280 + latencyMs * 2.4));
  };

  // Complete a cable connection effortlessly
  const handleCompleteConnection = useCallback(
    (fromId: string, toId: string) => {
      if (isLocked) {
        triggerLockNotice('Topology is locked. Unlock in toolbar to add cables.');
        setCableSourceId(null);
        setIsDraggingCable(false);
        setSnappedTargetId(null);
        return;
      }

      if (fromId === toId) {
        setCableSourceId(null);
        setIsDraggingCable(false);
        setSnappedTargetId(null);
        return;
      }

      const fromDev = devices.find((d) => d.id === fromId);
      const toDev = devices.find((d) => d.id === toId);
      if (!fromDev || !toDev) return;

      // Check if already linked
      const alreadyLinked = links.some(
        (l) =>
          (l.fromId === fromId && l.toId === toId) ||
          (l.fromId === toId && l.toId === fromId)
      );

      if (alreadyLinked) {
        sounds.playError();
        showToast(`"${fromDev.name}" and "${toDev.name}" are already connected!`, 'info');
        setCableSourceId(null);
        setIsDraggingCable(false);
        setSnappedTargetId(null);
        return;
      }

      sounds.playHop();
      onConnectDevices(fromId, toId);
      showToast(`Cable connected: ${fromDev.name} ⟷ ${toDev.name} (5ms Ethernet)`, 'success');
      setCableSourceId(null);
      setIsDraggingCable(false);
      setSnappedTargetId(null);
    },
    [devices, links, isLocked, onConnectDevices, showToast, triggerLockNotice]
  );

  // Start cable connection from port or device
  const handleStartCable = (deviceId: string, e?: React.MouseEvent) => {
    if (isLocked) {
      triggerLockNotice('Topology is locked. Unlock in toolbar to connect cables.');
      return;
    }
    sounds.playClick();
    setCableSourceId(deviceId);
    setIsDraggingCable(true);

    if (e && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  // Handle Dragging an existing device
  const handleMouseDownDevice = (e: React.MouseEvent, device: Device) => {
    e.stopPropagation();

    // If currently in cable mode and clicking a device
    if (cableSourceId) {
      if (cableSourceId !== device.id) {
        handleCompleteConnection(cableSourceId, device.id);
      } else {
        // Clicked same device again -> cancel
        setCableSourceId(null);
        setIsDraggingCable(false);
      }
      return;
    }

    if (activeTool === 'select') {
      setSelectedDeviceId(device.id);

      if (isLocked) {
        triggerLockNotice('Topology is locked. Unlock in toolbar to reposition devices.');
        return;
      }

      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      setDraggingDeviceId(device.id);
      setDragOffset({
        x: e.clientX - containerRect.left - device.x,
        y: e.clientY - containerRect.top - device.y,
      });
    } else if (activeTool === 'cable') {
      handleStartCable(device.id, e);
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
      const srcDev = devices.find((d) => d.id === srcId);
      const dstDev = devices.find((d) => d.id === dstId);

      if (!route) {
        sounds.playError();
        setLastResult({
          success: false,
          rtt: 0,
          from: srcDev?.name || 'Source Device',
          to: dstDev?.name || 'Destination Device',
          fromId: srcId,
          toId: dstId,
        });
        return;
      }

      sounds.playSend();
      setLastResult(null);

      // Exact round trip latency = one way * 2
      const rtt = route.totalLatency * 2;

      // Duration for first segment based on latency
      const firstLink = route.links[0];
      const segLatency = firstLink ? firstLink.latencyMs : 20;
      const baseDuration = getVisualDurationForLatency(segLatency);

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
        message: `Echo Request: ${srcDev?.name} ➔ ${dstDev?.name} (${route.path.length - 1} hops)`,
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
          const nextDuration = getVisualDurationForLatency(nextLatency);

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
            const returnDuration = getVisualDurationForLatency(returnLatency);

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

  // Terminal state side-effects
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
        fromId: activePacket.sourceId,
        toId: activePacket.targetId,
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
        fromId: activePacket.sourceId,
        toId: activePacket.targetId,
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

  // Global mouse move for drawing cable preview and magnetic snapping
  const handleMouseMove = (e: React.MouseEvent) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const x = Math.max(20, Math.min(containerRect.width - 20, e.clientX - containerRect.left));
    const y = Math.max(20, Math.min(containerRect.height - 20, e.clientY - containerRect.top));
    setMousePos({ x, y });

    // Magnetic proximity detection for effortless cable connection
    if (cableSourceId) {
      let nearestDev: Device | null = null;
      let minDistance = 75; // 75px magnetic snap radius

      for (const dev of devices) {
        if (dev.id === cableSourceId) continue;
        const dist = Math.hypot(dev.x - x, dev.y - y);
        if (dist < minDistance) {
          minDistance = dist;
          nearestDev = dev;
        }
      }

      setSnappedTargetId(nearestDev ? nearestDev.id : null);
    }
  };

  // Mouse up handler supporting Drag-and-Drop cable creation
  const handleMouseUp = () => {
    if (draggingDeviceId) {
      setDraggingDeviceId(null);
    }

    // If user dragged a cable and released over a snapped candidate device
    if (isDraggingCable && cableSourceId && snappedTargetId) {
      handleCompleteConnection(cableSourceId, snappedTargetId);
    } else if (isDraggingCable) {
      // Stopped dragging, but keep cableSourceId active so user can also just click destination
      setIsDraggingCable(false);
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

  // Active packet calculation along segment
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

  const snappedTargetDevice = snappedTargetId
    ? devices.find((d) => d.id === snappedTargetId)
    : null;

  // The end coordinate for the preview cable: snaps to target device if nearby
  const previewCableEnd = snappedTargetDevice
    ? { x: snappedTargetDevice.x, y: snappedTargetDevice.y }
    : mousePos;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => {
        if (activeTool === 'cable' && !isDraggingCable) {
          setCableSourceId(null);
          setSnappedTargetId(null);
        }
        if (activeTool === 'packet') setPacketSourceId(null);
        setSelectedDeviceId(null);
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

          const isTransmitting = Boolean(
            currentActiveHopLink &&
              ((link.fromId === currentActiveHopLink.fromId &&
                link.toId === currentActiveHopLink.toId) ||
                (link.fromId === currentActiveHopLink.toId &&
                  link.toId === currentActiveHopLink.fromId))
          );

          let strokeColor = '#334155';
          let strokeDash = isSatellite ? '6,6' : 'none';
          let strokeWidth = 2.5;

          if (isBroken) {
            strokeColor = '#f43f5e';
            strokeDash = '4,4';
          } else if (isSatellite) {
            strokeColor = '#06b6d4';
          } else if (link.linkType === 'fiber') {
            strokeColor = '#f59e0b';
          } else {
            strokeColor = '#3b82f6';
          }

          return (
            <g key={link.id} className="pointer-events-auto cursor-pointer group">
              <line
                x1={fromDev.x}
                y1={fromDev.y}
                x2={toDev.x}
                y2={toDev.y}
                stroke="transparent"
                strokeWidth={24}
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playClick();
                  onSelectLink(link);
                }}
              />
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

              {isTransmitting && (
                <>
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

        {/* Cable connection drag preview line with Magnetic Snapping feedback */}
        {cableSourceDevice && (
          <g>
            {/* Soft halo */}
            <line
              x1={cableSourceDevice.x}
              y1={cableSourceDevice.y}
              x2={previewCableEnd.x}
              y2={previewCableEnd.y}
              stroke={snappedTargetDevice ? '#10b981' : '#38bdf8'}
              strokeWidth={snappedTargetDevice ? 6 : 4}
              strokeOpacity={0.35}
              filter="url(#glow)"
            />
            {/* Core rubberband wire */}
            <line
              x1={cableSourceDevice.x}
              y1={cableSourceDevice.y}
              x2={previewCableEnd.x}
              y2={previewCableEnd.y}
              stroke={snappedTargetDevice ? '#34d399' : '#38bdf8'}
              strokeWidth={snappedTargetDevice ? 3 : 2}
              strokeDasharray="6,4"
              className="animate-pulse"
            />
            {/* Target snap dot */}
            <circle
              cx={previewCableEnd.x}
              cy={previewCableEnd.y}
              r={snappedTargetDevice ? 7 : 4}
              fill={snappedTargetDevice ? '#10b981' : '#38bdf8'}
              className="animate-ping"
            />
          </g>
        )}

        {/* Trailing data particles */}
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
            <circle
              r={18}
              fill={
                activePacket.phase === 'forward'
                  ? 'rgba(56, 189, 248, 0.35)'
                  : 'rgba(52, 211, 153, 0.35)'
              }
              className="animate-ping"
            />
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

      {/* Cable Latency Badges */}
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
        const isSnappedTarget = snappedTargetId === device.id;

        // Check if this device is already connected to the cable source
        const isAlreadyConnectedToSource = Boolean(
          cableSourceId &&
            cableSourceId !== device.id &&
            links.some(
              (l) =>
                (l.fromId === cableSourceId && l.toId === device.id) ||
                (l.fromId === device.id && l.toId === cableSourceId)
            )
        );

        return (
          <div
            key={device.id}
            onMouseDown={(e) => handleMouseDownDevice(e, device)}
            onMouseUp={(e) => {
              if (cableSourceId && cableSourceId !== device.id) {
                e.stopPropagation();
                handleCompleteConnection(cableSourceId, device.id);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              onSelectDevice(device);
            }}
            style={{ left: `${device.x}px`, top: `${device.y}px` }}
            className={`group absolute -translate-x-1/2 -translate-y-1/2 z-20 select-none ${
              cableSourceId
                ? 'cursor-crosshair'
                : activeTool === 'select'
                ? 'cursor-grab active:cursor-grabbing'
                : 'cursor-pointer'
            }`}
          >
            {/* Magnetic Snap / Target Highlight Ring */}
            {isSnappedTarget && (
              <div className="absolute inset-0 -m-3 rounded-3xl border-2 border-emerald-400 bg-emerald-500/15 pointer-events-none animate-pulse shadow-xl shadow-emerald-500/30 scale-105 transition-transform" />
            )}

            {/* Selection / Target Ring */}
            {(isSelectedCableStart || isSelectedPacketSource || isPulsing) && (
              <div
                className={`absolute inset-0 -m-2 rounded-2xl border-2 pointer-events-none animate-pulse ${
                  isPulsing
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : isSelectedPacketSource
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                    : 'border-blue-400 bg-blue-500/15 shadow-xl shadow-blue-500/30'
                }`}
              />
            )}

            {/* Device Box */}
            <div
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-150 relative ${
                isSnappedTarget
                  ? 'border-emerald-400 bg-slate-800 scale-105 shadow-xl shadow-emerald-500/30'
                  : isPulsing
                  ? 'border-emerald-400 bg-slate-800 scale-105 shadow-xl shadow-emerald-500/20'
                  : isSelectedPacketSource
                  ? 'border-cyan-400 bg-slate-800/95 shadow-xl shadow-cyan-500/20'
                  : isSelectedCableStart
                  ? 'border-blue-400 bg-slate-800/95 shadow-xl shadow-blue-500/25 ring-2 ring-blue-400/50'
                  : isAlreadyConnectedToSource
                  ? 'border-slate-700 bg-slate-900/60 opacity-60'
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
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
              >
                <span className="text-[10px] leading-none">⚙</span>
              </button>

              {/* ALWAYS-AVAILABLE INTUITIVE CABLE PORT HANDLE (At Bottom) */}
              {!isLocked && (
                <button
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleStartCable(device.id, e);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (cableSourceId && cableSourceId !== device.id) {
                      handleCompleteConnection(cableSourceId, device.id);
                    } else {
                      handleStartCable(device.id, e);
                    }
                  }}
                  title="Connect Cable: Drag or Click to connect to another device"
                  className={`absolute -bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold transition-all duration-150 shadow-md cursor-pointer ${
                    isSelectedCableStart
                      ? 'bg-blue-600 border-blue-300 text-white scale-110 ring-2 ring-blue-400'
                      : isSnappedTarget
                      ? 'bg-emerald-600 border-emerald-300 text-white scale-110 ring-2 ring-emerald-400'
                      : 'bg-slate-800/95 border-cyan-500/50 text-cyan-300 hover:bg-cyan-600 hover:border-cyan-400 hover:text-white hover:scale-110 opacity-80 group-hover:opacity-100'
                  }`}
                >
                  <Cable size={10} />
                  <span>{isSelectedCableStart ? 'Port Active' : 'Port'}</span>
                </button>
              )}
            </div>

            {/* Quick Context Toolbar when Selected */}
            {selectedDeviceId === device.id && activeTool === 'select' && !cableSourceId && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 border border-cyan-500/40 rounded-xl p-1 shadow-2xl z-30 whitespace-nowrap animate-in fade-in zoom-in-95">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartCable(device.id, e);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
                >
                  <Cable size={12} />
                  <span>Connect Cable</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playClick();
                    onSelectDevice(device);
                  }}
                  className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition cursor-pointer"
                >
                  Settings
                </button>
              </div>
            )}

            {/* Visual Indicators during Cable Connection */}
            {cableSourceId && cableSourceId === device.id && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full pointer-events-none shadow-md shadow-blue-500/30 animate-pulse">
                SOURCE 🔌
              </div>
            )}

            {cableSourceId && cableSourceId !== device.id && isSnappedTarget && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-500 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-full pointer-events-none shadow-lg shadow-emerald-500/40 animate-bounce">
                🎯 Drop or Click to Connect!
              </div>
            )}

            {cableSourceId && cableSourceId !== device.id && !isSnappedTarget && (
              <div
                className={`opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] px-2 py-0.5 rounded-md pointer-events-none shadow-md ${
                  isAlreadyConnectedToSource
                    ? 'bg-amber-950 border border-amber-500/40 text-amber-300'
                    : 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                }`}
              >
                {isAlreadyConnectedToSource ? 'Already Connected' : 'Plug Cable Here'}
              </div>
            )}

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

      {/* Locked Status Badge on Canvas */}
      {isLocked && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 backdrop-blur-md text-xs shadow-lg">
          <Lock size={12} className="text-amber-400" />
          <span>Preset Topology Locked</span>
          {onToggleLock && (
            <button
              onClick={onToggleLock}
              className="ml-1 text-[11px] underline hover:text-white font-medium cursor-pointer"
            >
              Unlock
            </button>
          )}
        </div>
      )}

      {/* Floating Guided Banner during Cable Connection (Top Center) */}
      {cableSourceId && cableSourceDevice && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-slate-900/95 border border-cyan-500/60 text-cyan-200 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-medium animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span>
              Connecting from <strong className="text-white">{cableSourceDevice.name}</strong> ➔{' '}
              <span className="text-emerald-300 font-semibold">
                Click or drop on target device to plug in
              </span>
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCableSourceId(null);
              setIsDraggingCable(false);
              setSnappedTargetId(null);
            }}
            className="ml-2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 transition cursor-pointer"
          >
            Cancel (Esc)
          </button>
        </div>
      )}

      {/* Instruction Badge when not connecting */}
      {!cableSourceId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg text-xs text-slate-300 backdrop-blur-md">
            {activeTool === 'select' && (
              <span>
                {isLocked
                  ? '🔒 Topology is locked. Click devices to inspect.'
                  : '💡 Drag devices to move. Drag from any device "Port" to connect cables easily.'}
              </span>
            )}
            {activeTool === 'cable' && (
              <span>
                {isLocked
                  ? '🔒 Topology is locked. Click 🔓 Unlock in toolbar to connect new cables.'
                  : '🔌 Click or drag from any device to connect with cable.'}
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
      )}

      {/* Canvas Toast Notifications (Bottom Center) */}
      {canvasToast && (
        <div
          className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-2xl border backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 ${
            canvasToast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200'
              : canvasToast.type === 'error'
              ? 'bg-rose-950/95 border-rose-500/60 text-rose-200'
              : 'bg-slate-900/95 border-cyan-500/60 text-cyan-200'
          }`}
        >
          {canvasToast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
          {canvasToast.type === 'error' && <AlertCircle size={16} className="text-rose-400" />}
          {canvasToast.type === 'info' && <Zap size={16} className="text-cyan-400" />}
          <span>{canvasToast.message}</span>
        </div>
      )}

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
                    RTT: {activePacket.totalLatency}ms
                  </span>
                </div>
              </>
            ) : lastResult?.success ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <div className="flex items-center gap-2">
                  <div>
                    <span className="font-semibold text-emerald-300">
                      Round-Trip Ping Successful!
                    </span>
                    <span className="ml-2 text-slate-300">
                      {lastResult.from} ↔ {lastResult.to}
                    </span>
                    <span className="ml-2 px-1.5 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                      RTT: {lastResult.rtt} ms
                    </span>
                  </div>
                  {onOpenPingInspector && lastResult.fromId && lastResult.toId && (
                    <button
                      onClick={() =>
                        onOpenPingInspector(lastResult.fromId, lastResult.toId)
                      }
                      className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-medium text-[11px] transition cursor-pointer"
                    >
                      <Activity size={11} />
                      <span>Ping Report</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-rose-400 shrink-0" />
                <div className="flex items-center gap-2">
                  <div>
                    <span className="font-semibold text-rose-300">
                      Host Unreachable!
                    </span>
                    <span className="ml-2 text-slate-400">
                      Broken link or no route between {lastResult?.from} and {lastResult?.to}
                    </span>
                  </div>
                  {onOpenPingInspector && lastResult?.fromId && lastResult?.toId && (
                    <button
                      onClick={() =>
                        onOpenPingInspector(lastResult.fromId, lastResult.toId)
                      }
                      className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-medium text-[11px] transition cursor-pointer"
                    >
                      <Activity size={11} />
                      <span>Diagnose</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
