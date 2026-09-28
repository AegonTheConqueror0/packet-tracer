import React, { useState } from 'react';
import {
  X,
  Send,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Terminal,
  Activity,
  Layers,
  ArrowLeftRight,
} from 'lucide-react';
import { Device, Link, PingReport } from '../types';
import { calculateAccuratePingReport } from '../utils/network';
import { DeviceIcon } from './DeviceIcon';

interface PingModalProps {
  devices: Device[];
  links: Link[];
  initialSourceId?: string;
  initialTargetId?: string;
  onStartSimulation: (sourceId: string, targetId: string) => void;
  onClose: () => void;
}

export const PingModal: React.FC<PingModalProps> = ({
  devices,
  links,
  initialSourceId,
  initialTargetId,
  onStartSimulation,
  onClose,
}) => {
  const [sourceId, setSourceId] = useState<string>(
    initialSourceId || devices[0]?.id || ''
  );
  const [targetId, setTargetId] = useState<string>(
    initialTargetId ||
      (devices.length > 1 ? devices[devices.length - 1].id : devices[0]?.id || '')
  );
  const [showTerminal, setShowTerminal] = useState<boolean>(false);

  // Calculate real-time accurate ping report
  const report: PingReport | null =
    sourceId && targetId && sourceId !== targetId
      ? calculateAccuratePingReport(sourceId, targetId, devices, links)
      : null;

  const handleSwap = () => {
    const temp = sourceId;
    setSourceId(targetId);
    setTargetId(temp);
  };

  const handleSendPing = () => {
    if (sourceId && targetId && sourceId !== targetId) {
      onStartSimulation(sourceId, targetId);
    }
  };

  const sourceDev = devices.find((d) => d.id === sourceId);
  const targetDev = devices.find((d) => d.id === targetId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Ping & Reachability Inspector
              </h2>
              <p className="text-[11px] text-slate-400">
                Accurate ICMP latency & hop tracer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Node Selectors */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Source Host
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-hidden focus:border-cyan-500"
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id} disabled={d.id === targetId}>
                      {d.name} ({d.ip})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-5">
                <button
                  onClick={handleSwap}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-cyan-400 transition"
                  title="Swap Source and Destination"
                >
                  <ArrowLeftRight size={14} />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Target Host
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-hidden focus:border-cyan-500"
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id} disabled={d.id === sourceId}>
                      {d.name} ({d.ip})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Test Action Button */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span className="text-[11px] text-slate-400">
                {sourceDev && targetDev ? `${sourceDev.name} ➔ ${targetDev.name}` : ''}
              </span>
              <button
                onClick={handleSendPing}
                disabled={!sourceId || !targetId || sourceId === targetId}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs shadow-md transition"
              >
                <Send size={13} />
                <span>Simulate Ping on Wire</span>
              </button>
            </div>
          </div>

          {/* Result Card */}
          {report && (
            <div
              className={`p-3.5 rounded-xl border ${
                report.success
                  ? 'bg-slate-950/80 border-emerald-500/30'
                  : 'bg-slate-950/80 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {report.success ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-rose-400 shrink-0" />
                  )}
                  <span
                    className={`font-semibold text-xs ${
                      report.success ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {report.success
                      ? 'Destination Host Reachable'
                      : 'Destination Host Unreachable'}
                  </span>
                </div>

                {report.success && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold">
                    <Zap size={11} className="text-amber-400" />
                    <span>RTT: {report.rtt} ms</span>
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              {report.success ? (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">One-Way</span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {report.oneWayLatency} ms
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Round Trip</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {report.rtt} ms
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Hops</span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {report.hops.length}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Packet Loss</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">0%</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs mb-3">
                  <p className="font-semibold">{report.failureReason}</p>
                  <p className="text-[11px] text-rose-400/80 mt-1">
                    Check that cables are connected and ensure cables are not marked broken.
                  </p>
                </div>
              )}

              {/* Hop Breakdown */}
              {report.success && report.hops.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1.5">
                    <Layers size={12} />
                    <span>Routing Path (Hops):</span>
                  </div>
                  <div className="space-y-1">
                    {report.hops.map((hop, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px]"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-4 text-center font-mono text-slate-500">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-200 truncate">
                            {hop.fromName}
                          </span>
                          <ArrowRight size={11} className="text-slate-500 shrink-0" />
                          <span className="font-medium text-slate-200 truncate">
                            {hop.toName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                              hop.linkType === 'satellite'
                                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {hop.linkType}
                          </span>
                          <span className="font-mono text-cyan-400 font-semibold">
                            +{hop.latencyMs}ms
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terminal View Toggle */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => setShowTerminal(!showTerminal)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition text-[11px]"
                >
                  <Terminal size={12} />
                  <span>{showTerminal ? 'Hide Console Output' : 'View Terminal ICMP Log'}</span>
                </button>
              </div>

              {/* Terminal ICMP Raw Output */}
              {showTerminal && (
                <div className="mt-2.5 p-3 rounded-lg bg-black/90 font-mono text-[11px] text-slate-300 leading-relaxed border border-slate-800 select-text overflow-x-auto">
                  <div className="text-slate-500">
                    $ ping -c 2 {targetDev?.ip || '192.168.1.1'}
                  </div>
                  <div>
                    PING {targetDev?.ip} ({targetDev?.name}): 56 data bytes
                  </div>
                  {report.success ? (
                    <>
                      <div>
                        64 bytes from {targetDev?.ip}: icmp_seq=1 ttl={report.ttl}{' '}
                        time={report.rtt.toFixed(1)} ms
                      </div>
                      <div>
                        64 bytes from {targetDev?.ip}: icmp_seq=2 ttl={report.ttl}{' '}
                        time={report.rtt.toFixed(1)} ms
                      </div>
                      <div className="text-slate-500 mt-1">
                        --- {targetDev?.ip} ping statistics ---
                      </div>
                      <div>
                        2 packets transmitted, 2 received, 0% packet loss, time{' '}
                        {report.rtt}ms
                      </div>
                      <div className="text-emerald-400">
                        rtt min/avg/max = {report.rtt.toFixed(1)}/{report.rtt.toFixed(1)}/
                        {report.rtt.toFixed(1)} ms
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-rose-400">
                        From {sourceDev?.ip}: Destination Host Unreachable
                      </div>
                      <div className="text-slate-500 mt-1">
                        --- {targetDev?.ip} ping statistics ---
                      </div>
                      <div className="text-rose-400">
                        2 packets transmitted, 0 received, 100% packet loss
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            💡 Latency includes total forward request and ACK reply across all cables.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
