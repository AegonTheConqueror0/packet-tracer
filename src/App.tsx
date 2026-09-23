/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Device, Link, ActiveTool, SimulatedPacket, DeviceType } from './types';
import { PRESETS, findPath, findBestDemoPath } from './utils/network';
import { Toolbar } from './components/Toolbar';
import { DevicePalette } from './components/DevicePalette';
import { Canvas } from './components/Canvas';
import { LinkConfigModal } from './components/LinkConfigModal';
import { DeviceSettingsModal } from './components/DeviceSettingsModal';
import { DEVICE_METADATA } from './components/DeviceIcon';
import { sounds } from './utils/audio';

export default function App() {
  // Network state: start with a completely plain/empty board
  const [devices, setDevices] = useState<Device[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

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
  } | null>(null);

  // Modals state
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingLink(null);
        setEditingDevice(null);
        setActiveTool('select');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update existing device coordinates
  const handleUpdateDevicePos = useCallback((id: string, x: number, y: number) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, x, y } : d))
    );
  }, []);

  // Connect two devices with a link
  const handleConnectDevices = useCallback(
    (fromId: string, toId: string) => {
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
    [devices, links]
  );

  // Add a new device to the canvas
  const handleDropNewDevice = useCallback(
    (typeStr: string, x: number, y: number) => {
      const type = typeStr as DeviceType;
      const meta = DEVICE_METADATA[type];
      if (!meta) return;

      const existingCount = devices.filter((d) => d.type === type).length;
      const name = existingCount === 0 ? meta.defaultName : `${meta.defaultName} ${existingCount + 1}`;

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
    [devices]
  );

  // Add device via palette click (centers on canvas)
  const handleAddDeviceCenter = (type: DeviceType) => {
    const meta = DEVICE_METADATA[type];
    const existingCount = devices.filter((d) => d.type === type).length;
    const name = existingCount === 0 ? meta.defaultName : `${meta.defaultName} ${existingCount + 1}`;

    const newDevice: Device = {
      id: `dev-${Date.now()}`,
      type,
      name,
      ip: `192.168.1.${devices.length + 10}`,
      x: 350 + (devices.length % 5) * 40,
      y: 250 + (devices.length % 4) * 35,
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
    setDevices((prev) => prev.filter((d) => d.id !== id));
    // Also remove any links attached to this device
    setLinks((prev) => prev.filter((l) => l.fromId !== id && l.toId !== id));
    setEditingDevice(null);
  };

  // Presets
  const handleLoadPreset = (index: number) => {
    sounds.playClick();
    const preset = PRESETS[index];
    if (preset) {
      setDevices(preset.devices);
      setLinks(preset.links);
      setActivePacket(null);
      setLastResult(null);
    }
  };

  const handleClear = () => {
    sounds.playClick();
    setDevices([]);
    setLinks([]);
    setActivePacket(null);
    setLastResult(null);
  };

  // Quick Test Ping across the topology
  const handleQuickDemo = () => {
    if (devices.length < 2) return;

    const demo = findBestDemoPath(devices, links);
    if (!demo) {
      sounds.playError();
      setLastResult({
        success: false,
        rtt: 0,
        from: devices[0]?.name || 'Device 1',
        to: devices[1]?.name || 'Device 2',
      });
      return;
    }

    const fromDev = devices.find((d) => d.id === demo.sourceId);
    const toDev = devices.find((d) => d.id === demo.targetId);
    if (!fromDev || !toDev) return;

    sounds.playSend();
    setLastResult(null);

    const rtt = demo.route.totalLatency * 2;
    const firstLink = demo.route.links[0];
    const segLatency = firstLink ? firstLink.latencyMs : 20;
    const baseDuration = Math.max(400, Math.min(2200, segLatency * 2.2));

    setActivePacket({
      id: `pkt-${Date.now()}`,
      sourceId: fromDev.id,
      targetId: toDev.id,
      path: demo.route.path,
      currentHop: 0,
      progress: 0,
      phase: 'forward',
      durationForSegment: baseDuration,
      totalLatency: rtt,
      status: 'flying',
      message: `${fromDev.name} ➔ ${toDev.name} (${demo.route.path.length - 1} hops)`,
    });
  };

  // Find names for editing link modal
  const editingLinkFrom = editingLink ? devices.find((d) => d.id === editingLink.fromId)?.name || 'Device' : '';
  const editingLinkTo = editingLink ? devices.find((d) => d.id === editingLink.toId)?.name || 'Device' : '';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Top minimal toolbar */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onLoadPreset={handleLoadPreset}
        onClear={handleClear}
        simSpeed={simSpeed}
        setSimSpeed={setSimSpeed}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onQuickDemo={handleQuickDemo}
        isSimulating={activePacket !== null}
        deviceCount={devices.length}
      />

      {/* Main Workspace */}
      <div className="relative flex-1 flex w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left Drag & Drop Device Palette */}
        <DevicePalette onAddDevice={handleAddDeviceCenter} />

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
        />
      </div>

      {/* Link Configuration Modal */}
      {editingLink && (
        <LinkConfigModal
          link={editingLink}
          fromDeviceName={editingLinkFrom}
          toDeviceName={editingLinkTo}
          onUpdate={handleUpdateLink}
          onDelete={handleDeleteLink}
          onClose={() => setEditingLink(null)}
        />
      )}

      {/* Device Configuration Modal */}
      {editingDevice && (
        <DeviceSettingsModal
          device={editingDevice}
          onUpdate={handleUpdateDevice}
          onDelete={handleDeleteDevice}
          onClose={() => setEditingDevice(null)}
        />
      )}
    </div>
  );
}
