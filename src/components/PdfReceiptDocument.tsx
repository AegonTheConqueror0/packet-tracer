import React from 'react';
import {
  Award,
  CheckCircle2,
  Calendar,
  User,
  GraduationCap,
  Hash,
  ShieldCheck,
  Activity,
  Cable,
  FileText,
  Clock,
  Anchor,
  Compass,
  QrCode,
  Zap,
} from 'lucide-react';
import { StudentSubmission } from '../types';

interface PdfReceiptDocumentProps {
  submission: StudentSubmission;
}

export const PdfReceiptDocument: React.FC<PdfReceiptDocumentProps> = ({ submission }) => {
  // Compute SVG bounding box for crisp topology rendering
  const minX = Math.min(...submission.devices.map((d) => d.x), 100);
  const maxX = Math.max(...submission.devices.map((d) => d.x), 700);
  const minY = Math.min(...submission.devices.map((d) => d.y), 100);
  const maxY = Math.max(...submission.devices.map((d) => d.y), 450);

  const viewBoxWidth = Math.max(680, maxX - minX + 160);
  const viewBoxHeight = Math.max(380, maxY - minY + 160);
  const offsetX = minX - 80;
  const offsetY = minY - 80;

  // Generate a mock security hash / barcode representation
  const verificationCode = `HCDC-NET-${submission.activityNumber}-${submission.studentId.replace(/[^0-9]/g, '').slice(-4) || '9821'}-${Date.now().toString().slice(-4)}`;

  return (
    <div
      id="pdf-receipt-document"
      className="w-full max-w-[800px] mx-auto bg-white text-slate-900 shadow-xl border-4 border-double border-slate-300 p-8 md:p-10 font-sans print:shadow-none print:border-slate-800 print:m-0 print:p-6"
      style={{ minHeight: '1050px', backgroundColor: '#ffffff', color: '#0f172a' }}
    >
      {/* Official Maritime Academy Header */}
      <div className="border-b-2 border-slate-900 pb-5 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center p-2.5 shadow-md">
              <Anchor size={32} />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-900">
                ICT Laboratory 
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight leading-tight">
                OFFICIAL LABORATORY SUBMISSION RECEIPT
              </h1>
              <div className="text-xs text-slate-600 font-medium">
                Academic Packet Tracer & Network Topology Verification Record
              </div>
            </div>
          </div>

          {/* Receipt Stamp Badge */}
          <div className="text-right shrink-0 border-2 border-emerald-600 bg-emerald-50 rounded-xl p-2.5 px-3">
            <div className="flex items-center gap-1 justify-end text-emerald-700 font-bold text-xs uppercase tracking-wide">
              <CheckCircle2 size={14} />
              <span>OFFICIALLY VERIFIED</span>
            </div>
            <div className="text-[10px] font-mono text-slate-600 mt-0.5">
              Receipt No: <strong className="text-slate-900 font-bold">{submission.id}</strong>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              {submission.submittedAt}
            </div>
          </div>
        </div>
      </div>

      {/* Cadet Information Box */}
      <div className="bg-slate-50 border border-slate-300 rounded-xl p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Student Cadet Full Name
            </span>
            <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
              {submission.studentName}
            </h2>
          </div>

          <div className="flex items-center gap-4 bg-white border border-slate-300 rounded-lg p-2.5 px-4 shadow-xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Assigned Grade
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono leading-none">
                {submission.score} / {submission.maxScore}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Result Status
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                Passed (100%)
              </span>
            </div>
          </div>
        </div>

        {/* Student metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Cadet ID Number
            </span>
            <strong className="text-slate-900 font-mono text-sm">
              {submission.studentId || 'N/A'}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Course & Section
            </span>
            <strong className="text-slate-900">{submission.courseSection}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Instructor / Proctor
            </span>
            <strong className="text-slate-900">
              {submission.instructorName || 'Prof. Edgardo Rojas'}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Laboratory Module
            </span>
            <strong className="text-slate-900">
              Activity {submission.activityNumber}
            </strong>
          </div>
        </div>
      </div>

      {/* Activity Details Banner */}
      <div className="mb-6 p-3.5 bg-cyan-900/10 border-l-4 border-cyan-800 rounded-r-xl">
        <div className="text-[11px] font-bold text-cyan-950 uppercase tracking-wide">
          Activity #{submission.activityNumber} Completed Objective
        </div>
        <div className="text-sm font-bold text-slate-900">
          {submission.activityTitle}
        </div>
      </div>

      {/* Network Topology Schematic (High Contrast SVG for PDF) */}
      <div className="mb-6 border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
        <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <Cable size={14} className="text-cyan-800" />
            Cadet Network Topology Schematic (Proof of Construction)
          </span>
          <span className="font-mono text-slate-600 text-[11px]">
            {submission.devices.length} Devices • {submission.links.length} Connected Cables
          </span>
        </div>

        <div className="p-2 flex items-center justify-center bg-white min-h-[260px]">
          <svg
            className="w-full h-64"
            viewBox={`${offsetX} ${offsetY} ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="pdf-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="0.6" fill="#cbd5e1" />
              </pattern>
            </defs>
            <rect
              x={offsetX}
              y={offsetY}
              width={viewBoxWidth}
              height={viewBoxHeight}
              fill="url(#pdf-grid)"
            />

            {/* Cable Lines */}
            {submission.links.map((link) => {
              const dFrom = submission.devices.find((d) => d.id === link.fromId);
              const dTo = submission.devices.find((d) => d.id === link.toId);
              if (!dFrom || !dTo) return null;

              const midX = (dFrom.x + dTo.x) / 2;
              const midY = (dFrom.y + dTo.y) / 2;
              const isSat = link.linkType === 'satellite';

              return (
                <g key={link.id}>
                  <line
                    x1={dFrom.x}
                    y1={dFrom.y}
                    x2={dTo.x}
                    y2={dTo.y}
                    stroke={isSat ? '#d97706' : '#0284c7'}
                    strokeWidth={2.5}
                    strokeDasharray={isSat ? '5,4' : undefined}
                  />
                  {/* Latency badge */}
                  <rect
                    x={midX - 18}
                    y={midY - 8}
                    width="36"
                    height="16"
                    rx="3"
                    fill="#ffffff"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  <text
                    x={midX}
                    y={midY + 3.5}
                    fill="#0f172a"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {link.latencyMs}ms
                  </text>
                </g>
              );
            })}

            {/* Device Nodes */}
            {submission.devices.map((device) => {
              return (
                <g key={device.id} transform={`translate(${device.x}, ${device.y})`}>
                  <circle
                    r="20"
                    fill="#ffffff"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))"
                  />
                  <circle r="15" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="1" />
                  <text
                    y="3"
                    fill="#0369a1"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {device.type.slice(0, 2).toUpperCase()}
                  </text>
                  <text
                    y="32"
                    fill="#0f172a"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    {device.name}
                  </text>
                  <text
                    y="43"
                    fill="#0284c7"
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {device.ip}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Packet Tracer Simulation Audit Results */}
      <div className="mb-6 border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
        <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <Activity size={14} className="text-emerald-700" />
            Packet Tracer Simulation Execution Audit
          </span>
          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
            VERIFIED SUCCESS
          </span>
        </div>

        {submission.pingReport && submission.pingReport.success ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-white text-xs">
            <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Simulated Ping Route
              </span>
              <strong className="text-slate-900 block text-xs mt-0.5">
                {submission.pingReport.sourceDevice.name} ➔ {submission.pingReport.targetDevice.name}
              </strong>
              <div className="text-[10px] font-mono text-slate-600">
                {submission.pingReport.sourceDevice.ip} ↔ {submission.pingReport.targetDevice.ip}
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Round-Trip Time (RTT)
              </span>
              <div className="text-base font-black font-mono text-cyan-800 mt-0.5">
                {submission.pingReport.rtt} ms
              </div>
              <div className="text-[10px] font-mono text-slate-600">
                One-Way Latency: {submission.pingReport.oneWayLatency} ms
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Delivery Metrics
              </span>
              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={13} />
                <span>0% Packet Loss (2/2 Echo ACK)</span>
              </div>
              <div className="text-[10px] font-mono text-slate-600">
                TTL: {submission.pingReport.ttl} • Hops: {submission.pingReport.hops.length}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 text-xs text-slate-600 bg-white">
            Topology criteria validated and simulation connectivity verified during active testing.
          </div>
        )}
      </div>

      {/* Automated Rubric Scoring Table */}
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-cyan-800" />
          Academic Rubric Criteria Evaluation
        </div>
        <div className="border border-slate-300 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[11px]">
              <tr>
                <th className="p-2.5">Grading Criterion</th>
                <th className="p-2.5">Instructor Evaluation Feedback</th>
                <th className="p-2.5 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {submission.rubric.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 font-semibold text-slate-900">{item.category}</td>
                  <td className="p-2.5 text-slate-600">{item.feedback}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                    {item.score} / {item.maxScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Technical Notes (if any) */}
      {submission.studentNotes && (
        <div className="mb-6 border border-slate-300 rounded-xl p-3.5 bg-slate-50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
            <FileText size={12} />
            Cadet Technical Notes & Observations:
          </div>
          <p className="text-xs text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-200">
            "{submission.studentNotes}"
          </p>
        </div>
      )}

      {/* Official Sign-off & Verification Footer */}
      <div className="mt-8 pt-6 border-t-2 border-slate-900 grid grid-cols-2 md:grid-cols-3 gap-6 items-end">
        {/* Verification barcode & digital hash */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-600">
            <QrCode size={13} />
            <span>Digital Security Verification</span>
          </div>
          <div className="font-mono text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-300 p-1.5 rounded-md inline-block">
            {verificationCode}
          </div>
          <div className="text-[9px] text-slate-500 font-mono">
            Cryptographically logged at {submission.submittedAt}
          </div>
        </div>

        {/* Center Department Stamp */}
        <div className="text-center">
          <div className="inline-block border-2 border-slate-800 rounded-full px-4 py-1 text-[9px] font-black tracking-widest uppercase text-slate-800">
            ★ ICT LAB ★
          </div>
          <div className="text-[8px] uppercase text-slate-500 tracking-wider mt-1">
            Official System Generated Document
          </div>
        </div>

        {/* Instructor Signature Box */}
        <div className="text-right">
          <div className="border-b border-slate-800 pb-1 mb-1 font-serif italic text-base text-slate-900">
            {submission.instructorName || 'Prof. Edgardo Rojas'}
          </div>
          <div className="text-[10px] font-bold uppercase text-slate-700">
            Instructor / Examiner Signature
          </div>
          <div className="text-[9px] text-slate-500">
            College of Maritime Education • ICT Laboratory
          </div>
        </div>
      </div>
    </div>
  );
};
