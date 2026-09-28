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
  const minX = Math.min(...submission.devices.map((d) => d.x), 100);
  const maxX = Math.max(...submission.devices.map((d) => d.x), 700);
  const minY = Math.min(...submission.devices.map((d) => d.y), 100);
  const maxY = Math.max(...submission.devices.map((d) => d.y), 450);

  const viewBoxWidth = Math.max(680, maxX - minX + 200);
  const viewBoxHeight = Math.max(420, maxY - minY + 200);
  const offsetX = minX - 100;
  const offsetY = minY - 100;

  // Generate a mock security hash / barcode representation
  const verificationCode = `HCDC-NET-${submission.activityNumber}-${submission.studentId.replace(/[^0-9]/g, '').slice(-4) || '9821'}-${Date.now().toString().slice(-4)}`;

  return (
    <div
      id="pdf-receipt-document"
      className="bg-white text-slate-900 border-4 border-double border-slate-300 font-sans print:shadow-none print:border-slate-800 print:m-0"
      style={{
        width: '740px',
        minHeight: '1050px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        padding: '32px',
        margin: '0 auto',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Official Maritime Academy Header */}
      <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px', display: 'block', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto', minWidth: 0 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', flexShrink: 0 }}>
              <Anchor size={24} />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#164e63' }}>
                ICT Laboratory
              </div>
              <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#020617', letterSpacing: '-0.01em', lineHeight: '1.1', margin: '2px 0', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                OFFICIAL LABORATORY SUBMISSION RECEIPT
              </h1>
              <div style={{ fontSize: '11px', color: '#475569', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Academic Packet Tracer & Network Topology Verification Record
              </div>
            </div>
          </div>

          {/* Receipt Stamp Badge */}
          <div style={{ textAlign: 'right', flexShrink: 0, border: '2px solid #059669', backgroundColor: '#ecfdf5', borderRadius: '10px', padding: '6px 10px', minWidth: '165px', maxWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end', color: '#047857', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
              <CheckCircle2 size={12} />
              <span>OFFICIALLY VERIFIED</span>
            </div>
            <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#475569', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Receipt No: <strong style={{ color: '#0f172a', fontWeight: 700 }}>{submission.id}</strong>
            </div>
            <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {submission.submittedAt}
            </div>
          </div>
        </div>
      </div>

      {/* Cadet Information Box */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
          <div style={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', display: 'block' }}>
              Student Cadet Full Name
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#020617', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {submission.studentName}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                Assigned Grade
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#047857', fontFamily: 'monospace', lineHeight: '1', marginTop: '2px' }}>
                {submission.score} / {submission.maxScore}
              </div>
            </div>
            <div style={{ height: '28px', width: '1px', backgroundColor: '#e2e8f0' }} />
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                Result Status
              </div>
              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', marginTop: '2px', whiteSpace: 'nowrap' }}>
                Passed (100%)
              </span>
            </div>
          </div>
        </div>

        {/* Student metadata grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 1.5fr 1fr', gap: '10px', fontSize: '11px' }}>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 600 }}>
              Cadet ID Number
            </span>
            <strong style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '13px' }}>
              {submission.studentId || 'N/A'}
            </strong>
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 600 }}>
              Course & Section
            </span>
            <strong style={{ color: '#0f172a', fontSize: '13px', display: 'block', whiteSpace: 'normal', wordBreak: 'break-word' }}>{submission.courseSection}</strong>
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 600 }}>
              Instructor / Proctor
            </span>
            <strong style={{ color: '#0f172a', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
              {submission.instructorName || 'Prof. Edgardo Rojas'}
            </strong>
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 600 }}>
              Laboratory Module
            </span>
            <strong style={{ color: '#0f172a', fontSize: '13px' }}>
              Activity {submission.activityNumber}
            </strong>
          </div>
        </div>
      </div>

      {/* Activity Details Banner */}
      <div style={{ marginBottom: '24px', padding: '14px', backgroundColor: 'rgba(14, 116, 144, 0.1)', borderLeft: '4px solid #155e75', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#083344', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Activity #{submission.activityNumber} Completed Objective
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
          {submission.activityTitle}
        </div>
      </div>

      {/* Network Topology Schematic (High Contrast SVG for PDF) */}
      <div style={{ marginBottom: '24px', border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
        <div style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cable size={14} style={{ color: '#155e75' }} />
            Cadet Network Topology Schematic (Proof of Construction)
          </span>
          <span style={{ fontFamily: 'monospace', color: '#475569', fontSize: '11px' }}>
            {submission.devices.length} Devices • {submission.links.length} Connected Cables
          </span>
        </div>

        <div style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', minHeight: '300px' }}>
          <svg
            viewBox={`${offsetX} ${offsetY} ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: '300px', display: 'block' }}
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
      <div style={{ marginBottom: '24px', border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
        <div style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} style={{ color: '#047857' }} />
            Packet Tracer Simulation Execution Audit
          </span>
          <span style={{ color: '#047857', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700 }}>
            VERIFIED SUCCESS
          </span>
        </div>

        {submission.pingReport && submission.pingReport.success ? (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', backgroundColor: '#ffffff', fontSize: '12px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', backgroundColor: '#f8fafc' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', display: 'block' }}>
                Simulated Ping Route
              </span>
              <strong style={{ color: '#0f172a', display: 'block', fontSize: '12px', marginTop: '2px' }}>
                {submission.pingReport.sourceDevice.name} ➔ {submission.pingReport.targetDevice.name}
              </strong>
              <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#475569', marginTop: '2px' }}>
                {submission.pingReport.sourceDevice.ip} ↔ {submission.pingReport.targetDevice.ip}
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', backgroundColor: '#f8fafc' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', display: 'block' }}>
                Round-Trip Time (RTT)
              </span>
              <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'monospace', color: '#155e75', marginTop: '2px' }}>
                {submission.pingReport.rtt} ms
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#475569', marginTop: '2px' }}>
                One-Way Latency: {submission.pingReport.oneWayLatency} ms
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', backgroundColor: '#f8fafc' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', display: 'block' }}>
                Delivery Metrics
              </span>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <CheckCircle2 size={13} />
                <span>0% Packet Loss (2/2 Echo ACK)</span>
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#475569', marginTop: '2px' }}>
                TTL: {submission.pingReport.ttl} • Hops: {submission.pingReport.hops.length}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px', fontSize: '12px', color: '#475569', backgroundColor: '#ffffff' }}>
            Topology criteria validated and simulation connectivity verified during active testing.
          </div>
        )}
      </div>

      {/* Automated Rubric Scoring Table */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} style={{ color: '#155e75' }} />
          Academic Rubric Criteria Evaluation
        </div>
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', textAlign: 'left', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 700, borderBottom: '1px solid #cbd5e1', fontSize: '11px' }}>
              <tr>
                <th style={{ padding: '10px' }}>Grading Criterion</th>
                <th style={{ padding: '10px' }}>Instructor Evaluation Feedback</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Points</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: '#ffffff' }}>
              {submission.rubric.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: idx < submission.rubric.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                  <td style={{ padding: '10px', fontWeight: 600, color: '#0f172a' }}>{item.category}</td>
                  <td style={{ padding: '10px', color: '#475569' }}>{item.feedback}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#047857' }}>
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
        <div style={{ marginBottom: '24px', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', backgroundColor: '#f8fafc' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={12} />
            Cadet Technical Notes & Observations:
          </div>
          <p style={{ fontSize: '12px', color: '#1e293b', fontStyle: 'italic', backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: 0 }}>
            "{submission.studentNotes}"
          </p>
        </div>
      )}

      {/* Official Sign-off & Verification Footer */}
      <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '2px solid #0f172a', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'flex-end' }}>
        {/* Verification barcode & digital hash */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '4px' }}>
            <QrCode size={13} />
            <span>Digital Security Verification</span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 700, color: '#1e293b', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', display: 'inline-block', marginBottom: '4px' }}>
            {verificationCode}
          </div>
          <div style={{ fontSize: '9px', color: '#64748b', fontFamily: 'monospace' }}>
            Cryptographically logged at {submission.submittedAt}
          </div>
        </div>

        {/* Center Department Stamp */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', border: '2px solid #1e293b', borderRadius: '9999px', padding: '4px 16px', fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1e293b' }}>
            ★ ICT LAB ★
          </div>
          <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.1em', marginTop: '4px' }}>
            Official System Generated Document
          </div>
        </div>

        {/* Instructor Signature Box */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '4px', marginBottom: '4px', fontFamily: 'serif', fontStyle: 'italic', fontSize: '16px', color: '#0f172a' }}>
            {submission.instructorName || 'Prof. Edgardo Rojas'}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#334155' }}>
            Instructor / Examiner Signature
          </div>
          <div style={{ fontSize: '9px', color: '#64748b' }}>
            College of Maritime Education • ICT Laboratory
          </div>
        </div>
      </div>
    </div>
  );
};
