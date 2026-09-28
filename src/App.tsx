/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Device,
  Link,
  ActiveTool,
  SimulatedPacket,
  DeviceType,
  LabActivity,
  StudentSubmission,
  PingReport,
} from './types';
import {
  PRESETS,
  findPath,
  findBestDemoPath,
  calculateAccuratePingReport,
} from './utils/network';
import { LAB_ACTIVITIES } from './utils/activities';
import { Toolbar } from './components/Toolbar';
import { DevicePalette } from './components/DevicePalette';
import { Canvas } from './components/Canvas';
import { LinkConfigModal } from './components/LinkConfigModal';
import { DeviceSettingsModal } from './components/DeviceSettingsModal';
import { PingModal } from './components/PingModal';
import { ActivityDrawer } from './components/ActivityDrawer';
import { TopologyReferenceModal } from './components/TopologyReferenceModal';
import { ActivitySubmitModal } from './components/ActivitySubmitModal';
import { SubmissionShowcaseModal } from './components/SubmissionShowcaseModal';
import { DEVICE_METADATA } from './components/DeviceIcon';
import { sounds } from './utils/audio';

export default function App() {
  // Network state: start with a completely plain canvas for lab practice
  const [devices, setDevices] = useState<Device[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isLectureDemoMode, setIsLectureDemoMode] = useState<boolean>(false);

  // Tool & simulation state
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activePacket, setActivePacket] = useState<SimulatedPacket | null>(null);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    rtt: number;
    from: string;
    to: string;
    fromId?: string;
    toId?: string;
  } | null>(null);

  // Laboratory Activity System State
  const [currentActivity, setCurrentActivity] = useState<LabActivity>(LAB_ACTIVITIES[0]);
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState<boolean>(true);
  const [isTopologyGuideOpen, setIsTopologyGuideOpen] = useState<boolean>(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [currentSubmission, setCurrentSubmission] = useState<StudentSubmission | null>(null);
  const [lastSuccessfulPing, setLastSuccessfulPing] = useState<PingReport | null>(null);

  // Modals state
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [isPingModalOpen, setIsPingModalOpen] = useState<boolean>(false);
  const [pingSourceId, setPingSourceId] = useState<string | undefined>();
  const [pingTargetId, setPingTargetId] = useState<string | undefined>();

  // Synchronize lastSuccessfulPing whenever a ping delivers
  useEffect(() => {
    if (lastResult?.success && lastResult.fromId && lastResult.toId) {
      const report = calculateAccuratePingReport(
        lastResult.fromId,
        lastResult.toId,
        devices,
        links
      );
      if (report.success) {
        setLastSuccessfulPing(report);
      }
    }
  }, [lastResult, devices, links]);

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingLink(null);
        setEditingDevice(null);
        setIsPingModalOpen(false);
        setIsTopologyGuideOpen(false);
        setIsSubmitModalOpen(false);
        setActiveTool('select');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update existing device coordinates
  const handleUpdateDevicePos = useCallback(
    (id: string, x: number, y: number) => {
      if (isLocked) return;
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, x, y } : d))
      );
    },
    [isLocked]
  );

  // Connect two devices with a link
  const handleConnectDevices = useCallback(
    (fromId: string, toId: string) => {
      if (isLocked) return;
      if (fromId === toId) return;

      // Check if already linked
      const exists = links.some(
        (l) =>
          (l.fromId === fromId && l.toId === toId) ||
          (l.fromId === toId && l.toId === fromId)
      );
      if (exists) return;

      const fromDev = devices.find((d) => d.id === fromId);
      const toDev = devices.find((d) => d.id === toId);
      if (!fromDev || !toDev) return;

      const isSatellite =
        fromDev.type === 'satellite' || toDev.type === 'satellite';

      const newLink: Link = {
        id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fromId,
        toId,
        latencyMs: isSatellite ? 550 : 5,
        linkType: isSatellite ? 'satellite' : 'ethernet',
      };

      sounds.playHop();
      setLinks((prev) => [...prev, newLink]);
    },
    [devices, links, isLocked]
  );

  // Add a new device to the canvas
  const handleDropNewDevice = useCallback(
    (typeStr: string, x: number, y: number) => {
      if (isLocked) return;
      const type = typeStr as DeviceType;
      const meta = DEVICE_METADATA[type];
      if (!meta) return;

      const existingCount = devices.filter((d) => d.type === type).length;
      const name =
        existingCount === 0 ? meta.defaultName : `${meta.defaultName} ${existingCount + 1}`;

      const newDevice: Device = {
        id: `dev-${Date.now()}`,
        type,
        name,
        ip: `192.168.1.${devices.length + 10}`,
        x,
        y,
      };

      setDevices((prev) => [...prev, newDevice]);
    },
    [devices, isLocked]
  );

  // Add device via palette click (centers on canvas)
  const handleAddDeviceCenter = (type: DeviceType) => {
    if (isLocked) return;
    const meta = DEVICE_METADATA[type];
    const existingCount = devices.filter((d) => d.type === type).length;
    const name =
      existingCount === 0 ? meta.defaultName : `${meta.defaultName} ${existingCount + 1}`;

    const newDevice: Device = {
      id: `dev-${Date.now()}`,
      type,
      name,
      ip: `192.168.1.${devices.length + 10}`,
      x: 340 + (devices.length % 5) * 45,
      y: 240 + (devices.length % 4) * 40,
    };

    setDevices((prev) => [...prev, newDevice]);
  };

  // Update link
  const handleUpdateLink = (updated: Partial<Link>) => {
    if (!editingLink) return;
    setLinks((prev) =>
      prev.map((l) => (l.id === editingLink.id ? { ...l, ...updated } : l))
    );
    setEditingLink((prev) => (prev ? { ...prev, ...updated } : null));
  };

  // Delete link
  const handleDeleteLink = (id: string) => {
    if (isLocked) return;
    setLinks((prev) => prev.filter((l) => l.id !== id));
    setEditingLink(null);
  };

  // Update device
  const handleUpdateDevice = (updated: Partial<Device>) => {
    if (!editingDevice) return;
    setDevices((prev) =>
      prev.map((d) => (d.id === editingDevice.id ? { ...d, ...updated } : d))
    );
    setEditingDevice((prev) => (prev ? { ...prev, ...updated } : null));
  };

  // Delete device
  const handleDeleteDevice = (id: string) => {
    if (isLocked) return;
    setDevices((prev) => prev.filter((d) => d.id !== id));
    setLinks((prev) => prev.filter((l) => l.fromId !== id && l.toId !== id));
    setEditingDevice(null);
  };

  // Clear canvas
  const handleClear = () => {
    sounds.playClick();
    setDevices([]);
    setLinks([]);
    setIsLocked(false);
    setIsLectureDemoMode(false);
    setActivePacket(null);
    setLastResult(null);
    setLastSuccessfulPing(null);
  };

  const handleToggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  // Instructor demo preset loader (activated via instructor passcode in TopologyReferenceModal)
  const handleInstructorLoadPreset = (index: number) => {
    sounds.playClick();
    const preset = PRESETS[index];
    if (preset) {
      setDevices(preset.devices);
      setLinks(preset.links);
      setIsLocked(true);
      setIsLectureDemoMode(true);
      setActivePacket(null);
      setLastResult(null);
      setLastSuccessfulPing(null);
    }
  };

  // Start packet simulation directly
  const runSimulationBetween = (srcId: string, dstId: string) => {
    const route = findPath(srcId, dstId, devices, links);
    const fromDev = devices.find((d) => d.id === srcId);
    const toDev = devices.find((d) => d.id === dstId);
    if (!fromDev || !toDev) return;

    if (!route) {
      sounds.playError();
      setLastResult({
        success: false,
        rtt: 0,
        from: fromDev.name,
        to: toDev.name,
        fromId: srcId,
        toId: dstId,
      });
      return;
    }

    sounds.playSend();
    setLastResult(null);

    const rtt = route.totalLatency * 2;
    const firstLink = route.links[0];
    const segLatency = firstLink ? firstLink.latencyMs : 20;
    const baseDuration = Math.max(300, Math.min(2600, 280 + segLatency * 2.4));

    setActivePacket({
      id: `pkt-${Date.now()}`,
      sourceId: fromDev.id,
      targetId: toDev.id,
      path: route.path,
      currentHop: 0,
      progress: 0,
      phase: 'forward',
      durationForSegment: baseDuration,
      totalLatency: rtt,
      status: 'flying',
      message: `Ping: ${fromDev.name} ➔ ${toDev.name} (${route.path.length - 1} hops)`,
    });

    // Also compute ping report and record
    const report = calculateAccuratePingReport(srcId, dstId, devices, links);
    if (report.success) {
      setLastSuccessfulPing(report);
    }
  };

  // Activity-aware intelligent simulation launcher
  const handleSimulationForActivity = () => {
    if (devices.length < 2) return;

    let srcId: string | null = null;
    let dstId: string | null = null;

    switch (currentActivity.id) {
      case 'lab-1': {
        // Star: find two client endpoints
        const clients = devices.filter((d) => d.type === 'pc' || d.type === 'laptop');
        if (clients.length >= 2) {
          srcId = clients[0].id;
          dstId = clients[1].id;
        }
        break;
      }
      case 'lab-2': {
        // Satellite: from client to server
        const client = devices.find((d) => d.type === 'laptop' || d.type === 'pc');
        const server = devices.find((d) => d.type === 'server');
        if (client && server) {
          srcId = client.id;
          dstId = server.id;
        }
        break;
      }
      case 'lab-3': {
        // Ring: two non-adjacent nodes or endpoints
        if (devices.length >= 4) {
          srcId = devices[0].id;
          dstId = devices[2].id;
        }
        break;
      }
      case 'lab-4': {
        // Bus: terminal ends
        const activeLinks = links.filter((l) => !l.isBroken);
        const degMap = new Map<string, number>();
        devices.forEach((d) => degMap.set(d.id, 0));
        activeLinks.forEach((l) => {
          degMap.set(l.fromId, (degMap.get(l.fromId) || 0) + 1);
          degMap.set(l.toId, (degMap.get(l.toId) || 0) + 1);
        });
        const ends = devices.filter((d) => degMap.get(d.id) === 1);
        if (ends.length >= 2) {
          srcId = ends[0].id;
          dstId = ends[1].id;
        }
        break;
      }
      case 'lab-5': {
        // Hybrid: across router
        const clients = devices.filter((d) => d.type === 'pc' || d.type === 'laptop');
        if (clients.length >= 2) {
          srcId = clients[0].id;
          dstId = clients[clients.length - 1].id;
        }
        break;
      }
      default:
        break;
    }

    if (!srcId || !dstId) {
      const demo = findBestDemoPath(devices, links);
      if (demo) {
        srcId = demo.sourceId;
        dstId = demo.targetId;
      } else {
        srcId = devices[0].id;
        dstId = devices[1].id;
      }
    }

    runSimulationBetween(srcId, dstId);
  };

  // Quick Test Ping across the topology
  const handleQuickDemo = () => {
    if (devices.length < 2) return;
    handleSimulationForActivity();
  };

  // Open the accurate Ping Inspector
  const handleOpenPingInspector = (srcId?: string, tgtId?: string) => {
    sounds.playClick();
    if (srcId && tgtId) {
      setPingSourceId(srcId);
      setPingTargetId(tgtId);
    } else {
      const demo = findBestDemoPath(devices, links);
      if (demo) {
        setPingSourceId(demo.sourceId);
        setPingTargetId(demo.targetId);
      } else if (devices.length >= 2) {
        setPingSourceId(devices[0].id);
        setPingTargetId(devices[devices.length - 1].id);
      }
    }
    setIsPingModalOpen(true);
  };

  // Switch Activity in Laboratory
  const handleSelectActivity = (act: LabActivity) => {
    sounds.playClick();
    setCurrentActivity(act);
    setLastSuccessfulPing(null);
    setLastResult(null);
    setActivePacket(null);
  };

  // Advancing to the next activity after submission
  const handleStartNextActivity = () => {
    const nextNum = (currentActivity.number % LAB_ACTIVITIES.length) + 1;
    const nextAct = LAB_ACTIVITIES.find((a) => a.number === nextNum) || LAB_ACTIVITIES[0];
    setCurrentActivity(nextAct);
    setCurrentSubmission(null);
    handleClear();
  };

  // Find names for editing link modal
  const editingLinkFrom = editingLink
    ? devices.find((d) => d.id === editingLink.fromId)?.name || 'Device'
    : '';
  const editingLinkTo = editingLink
    ? devices.find((d) => d.id === editingLink.toId)?.name || 'Device'
    : '';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      
      {/* Top Main Toolbar */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onClear={handleClear}
        simSpeed={simSpeed}
        setSimSpeed={setSimSpeed}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onQuickDemo={handleQuickDemo}
        onOpenPingInspector={() => handleOpenPingInspector()}
        isSimulating={activePacket !== null}
        deviceCount={devices.length}
        isLocked={isLocked}
        onToggleLock={handleToggleLock}
        onOpenTopologyGuide={() => setIsTopologyGuideOpen(true)}
        onOpenActivityDrawer={() => setIsActivityDrawerOpen(true)}
        onSubmitWork={() => setIsSubmitModalOpen(true)}
        activeActivityNumber={currentActivity.number}
      />

      {/* Lecture Demo Banner (if instructor bypassed presets) */}
      {isLectureDemoMode && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <span className="font-bold">⚠️ INSTRUCTOR LECTURE DEMO MODE:</span>
            <span>Pre-built topology loaded for demonstration. Laboratory grading is paused.</span>
          </div>
          <button
            onClick={handleClear}
            className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer"
          >
            Clear & Return to Student Lab
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <div className="relative flex-1 flex w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        
        {/* Left Drag & Drop Device Palette */}
        <DevicePalette
          onAddDevice={handleAddDeviceCenter}
          isLocked={isLocked}
          onUnlock={() => setIsLocked(false)}
        />

        {/* Network Canvas */}
        <Canvas
          devices={devices}
          links={links}
          activeTool={activeTool}
          simSpeed={simSpeed}
          onUpdateDevicePos={handleUpdateDevicePos}
          onConnectDevices={handleConnectDevices}
          onSelectLink={(link) => setEditingLink(link)}
          onSelectDevice={(device) => setEditingDevice(device)}
          onDropNewDevice={handleDropNewDevice}
          activePacket={activePacket}
          setActivePacket={setActivePacket}
          lastResult={lastResult}
          setLastResult={setLastResult}
          isLocked={isLocked}
          onToggleLock={handleToggleLock}
          onOpenPingInspector={handleOpenPingInspector}
        />

        {/* Floating / Docked Activity Laboratory Drawer */}
        <ActivityDrawer
          currentActivity={currentActivity}
          onSelectActivity={handleSelectActivity}
          devices={devices}
          links={links}
          lastPing={lastSuccessfulPing}
          onRunSimulation={handleSimulationForActivity}
          onSubmitActivity={() => setIsSubmitModalOpen(true)}
          onClearCanvas={handleClear}
        />
      </div>

      {/* Accurate Ping & Reachability Inspector Modal */}
      {isPingModalOpen && (
        <PingModal
          devices={devices}
          links={links}
          initialSourceId={pingSourceId}
          initialTargetId={pingTargetId}
          onStartSimulation={(src, dst) => {
            setIsPingModalOpen(false);
            runSimulationBetween(src, dst);
          }}
          onClose={() => setIsPingModalOpen(false)}
        />
      )}

      {/* Topology Reference Manual Modal (Locked Pre-built Examples) */}
      <TopologyReferenceModal
        isOpen={isTopologyGuideOpen}
        onClose={() => setIsTopologyGuideOpen(false)}
        onInstructorLoadPreset={handleInstructorLoadPreset}
      />

      {/* Activity Laboratory Submission Dialog */}
      {isSubmitModalOpen && (
        <ActivitySubmitModal
          activity={currentActivity}
          devices={devices}
          links={links}
          lastPing={lastSuccessfulPing}
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmitSuccess={(submission) => {
            setIsSubmitModalOpen(false);
            setCurrentSubmission(submission);
          }}
        />
      )}

      {/* Official Laboratory Submission Showcase & Certificate */}
      {currentSubmission && (
        <SubmissionShowcaseModal
          submission={currentSubmission}
          onClose={() => setCurrentSubmission(null)}
          onReviseWork={() => setCurrentSubmission(null)}
          onStartNewActivity={handleStartNextActivity}
        />
      )}

      {/* Link Configuration Modal */}
      {editingLink && (
        <LinkConfigModal
          link={editingLink}
          fromDeviceName={editingLinkFrom}
          toDeviceName={editingLinkTo}
          onUpdate={handleUpdateLink}
          onDelete={handleDeleteLink}
          onClose={() => setEditingLink(null)}
          isLocked={isLocked}
        />
      )}

      {/* Device Configuration Modal */}
      {editingDevice && (
        <DeviceSettingsModal
          device={editingDevice}
          onUpdate={handleUpdateDevice}
          onDelete={handleDeleteDevice}
          onClose={() => setEditingDevice(null)}
          isLocked={isLocked}
        />
      )}
    </div>
  );
}
