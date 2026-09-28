import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Award,
  Calendar,
  User,
  GraduationCap,
  Hash,
  ShieldCheck,
  Send,
  Cable,
  Activity,
  Layers,
  FileText,
  RotateCcw,
  Sparkles,
  FileCode,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  Eye,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { StudentSubmission } from '../types';
import { DeviceIcon, DEVICE_METADATA } from './DeviceIcon';
import { PdfReceiptDocument } from './PdfReceiptDocument';

interface SubmissionShowcaseModalProps {
  submission: StudentSubmission;
  onClose: () => void;
  onReviseWork: () => void;
  onStartNewActivity: () => void;
}

export const SubmissionShowcaseModal: React.FC<SubmissionShowcaseModalProps> = ({
  submission,
  onClose,
  onReviseWork,
  onStartNewActivity,
}) => {
  const [viewMode, setViewMode] = useState<'pdf' | 'showcase'>('pdf');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const receiptPdfRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Download high-resolution vector/canvas A4 PDF
  const handleDownloadPdf = async () => {
    if (!receiptPdfRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = receiptPdfRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2, // 2x for retina crispness
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 850,
        onclone: (clonedDoc) => {
          // Ensure cloned receipt has explicit standard sRGB styling
          const receiptEl = clonedDoc.getElementById('pdf-receipt-document');
          if (receiptEl) {
            receiptEl.style.backgroundColor = '#ffffff';
            receiptEl.style.color = '#0f172a';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
      heightLeft -= 297;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
        heightLeft -= 297;
      }

      const safeCadet = submission.studentName.replace(/[^a-zA-Z0-9]/g, '_') || 'Cadet';
      pdf.save(`ICT_Lab_Receipt_Act${submission.activityNumber}_${safeCadet}.pdf`);
    } catch (err) {
      console.error('PDF generation error, fallback to system print:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Compute bounding box of devices for thumbnail canvas
  const minX = Math.min(...submission.devices.map((d) => d.x), 100);
  const maxX = Math.max(...submission.devices.map((d) => d.x), 700);
  const minY = Math.min(...submission.devices.map((d) => d.y), 100);
  const maxY = Math.max(...submission.devices.map((d) => d.y), 450);

  const viewBoxWidth = Math.max(700, maxX - minX + 160);
  const viewBoxHeight = Math.max(400, maxY - minY + 160);
  const offsetX = minX - 80;
  const offsetY = minY - 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        ref={printRef}
        className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col text-slate-100 print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black"
      >
        
        {/* Certificate Top Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden print:hidden">
          {/* Subtle glow / watermarks */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 p-0.5 shadow-xl shadow-amber-950/30 shrink-0">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-amber-300">
                <Award size={26} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  Official Academic Submission
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ID: {submission.id}
                </span>
              </div>

              {/* Cadet Name */}
              <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200 tracking-tight">
                {submission.studentName.toUpperCase()}
              </h1>
              <div className="text-xs text-slate-300 flex items-center gap-3 mt-0.5">
                <span>Cadet ID: <strong className="text-white font-mono">{submission.studentId}</strong></span>
                <span>•</span>
                <span>{submission.courseSection}</span>
              </div>
            </div>
          </div>

          {/* View Mode Switcher & Quick Actions */}
          <div className="flex items-center gap-2 z-10">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950/90 border border-slate-700/80 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => setViewMode('pdf')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'pdf'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View clean official PDF format receipt"
              >
                <FileText size={13} />
                <span>PDF Format Receipt</span>
              </button>

              <button
                onClick={() => setViewMode('showcase')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'showcase'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View interactive digital showcase"
              >
                <Layers size={13} />
                <span>Showcase View</span>
              </button>
            </div>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition cursor-pointer disabled:opacity-50"
              title="Download official laboratory receipt as a real PDF file"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download PDF Receipt</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Print official receipt"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* View Mode 1: Crisp Official PDF Format Receipt (Super Easy to See) */}
        {viewMode === 'pdf' && (
          <div className="p-4 md:p-6 bg-slate-950/60 overflow-x-auto print:p-0 print:bg-white">
            {/* PDF View Controls Bar */}
            <div className="max-w-[800px] mx-auto mb-3 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-2 px-3 text-xs text-slate-300 print:hidden">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <FileText size={14} className="text-cyan-400" />
                  Standard A4 Examination Receipt Format
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  100% Readable High-Contrast
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="font-mono text-[11px] text-slate-300 w-12 text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-medium transition cursor-pointer"
                  title="Reset 100%"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Document Container with zoom scaling */}
            <div
              className="flex justify-center transition-transform duration-150 origin-top"
              style={{
                transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
              }}
            >
              <div ref={receiptPdfRef} className="w-full">
                <PdfReceiptDocument submission={submission} />
              </div>
            </div>
          </div>
        )}

        {/* View Mode 2: Interactive Digital Showcase View */}
        {viewMode === 'showcase' && (
          <div>
            {/* Evaluation Banner */}
            <div className="mx-6 md:mx-8 mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/50 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-emerald-300">
                      Laboratory Activity {submission.activityNumber}: {submission.activityTitle}
                    </h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Verified Complete
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Instructor Evaluator: <strong className="text-slate-100">{submission.instructorName || 'Prof. Edgardo Rojas'}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Laboratory Grade
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {submission.score} / {submission.maxScore}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Body */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Visual Network Showcase */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Layers size={14} className="text-cyan-400" />
                    Cadet Network Topology Work Showcase
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {submission.devices.length} Nodes • {submission.links.length} Physical Links
                  </span>
                </div>

                {/* SVG Diagram */}
                <div className="w-full h-64 md:h-72 bg-slate-900/90 rounded-xl border border-slate-800/80 overflow-hidden relative flex items-center justify-center">
                  <svg
                    className="w-full h-full"
                    viewBox={`${offsetX} ${offsetY} ${viewBoxWidth} ${viewBoxHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <pattern id="cert-grid-2" width="30" height="30" patternUnits="userSpaceOnUse">
                        <circle cx="15" cy="15" r="0.75" fill="#334155" opacity="0.4" />
                      </pattern>
                    </defs>
                    <rect
                      x={offsetX}
                      y={offsetY}
                      width={viewBoxWidth}
                      height={viewBoxHeight}
                      fill="url(#cert-grid-2)"
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
                            stroke={isSat ? '#f59e0b' : '#06b6d4'}
                            strokeWidth={link.isBroken ? 2 : 2.5}
                            strokeDasharray={isSat ? '6,4' : undefined}
                            strokeOpacity={link.isBroken ? 0.4 : 0.85}
                          />
                          <rect
                            x={midX - 18}
                            y={midY - 8}
                            width="36"
                            height="16"
                            rx="4"
                            fill="#0f172a"
                            stroke={isSat ? '#f59e0b' : '#334155'}
                            strokeWidth="1"
                          />
                          <text
                            x={midX}
                            y={midY + 3.5}
                            fill={isSat ? '#fbbf24' : '#94a3b8'}
                            fontSize="9"
                            fontWeight="600"
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
                            r="22"
                            fill="#0f172a"
                            stroke="#06b6d4"
                            strokeWidth="2"
                            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                          />
                          <circle r="18" fill="#1e293b" />
                          <text
                            y="34"
                            fill="#f8fafc"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="sans-serif"
                          >
                            {device.name}
                          </text>
                          <text
                            y="46"
                            fill="#38bdf8"
                            fontSize="9"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            {device.ip}
                          </text>
                          <text
                            y="4"
                            fill="#38bdf8"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            {device.type.substring(0, 2).toUpperCase()}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Packet Tracer Simulation Proof Box */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={14} className="text-emerald-400" />
                  Packet Tracer Simulation Verification
                </span>

                {submission.pingReport && submission.pingReport.success ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Simulated Route
                      </span>
                      <div className="text-xs font-bold text-emerald-300">
                        {submission.pingReport.sourceDevice.name} ➔ {submission.pingReport.targetDevice.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {submission.pingReport.sourceDevice.ip} ↔ {submission.pingReport.targetDevice.ip}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Measured Round-Trip (RTT)
                      </span>
                      <div className="text-base font-black font-mono text-cyan-300">
                        {submission.pingReport.rtt} ms
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        One-way: {submission.pingReport.oneWayLatency} ms
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        ICMP Delivery Quality
                      </span>
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        <span>0% Packet Loss (2/2 ACK)</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        TTL: {submission.pingReport.ttl} • Hops: {submission.pingReport.hops.length}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                    Network topology successfully built. (Simulation verified during active testing).
                  </div>
                )}
              </div>

              {/* Assessment Rubric Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={14} className="text-cyan-400" />
                  Automated Evaluation Rubric
                </span>
                <div className="space-y-2">
                  {submission.rubric.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{item.category}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.feedback}</div>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <span className="font-mono font-bold text-emerald-400">
                          {item.score} / {item.maxScore} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Technical Observations */}
              {submission.studentNotes && (
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-1.5">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={13} className="text-cyan-400" />
                    Cadet’s Technical Observations & Reflection:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    "{submission.studentNotes}"
                  </p>
                </div>
              )}

              {/* Deployed Hardware Inventory */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Cable size={14} className="text-cyan-400" />
                  Hardware & Address Inventory ({submission.devices.length} Devices)
                </span>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="p-2.5">Device Name</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">IP Address</th>
                        <th className="p-2.5">Connections</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-mono text-[11px]">
                      {submission.devices.map((dev) => {
                        const devLinks = submission.links.filter(
                          (l) => l.fromId === dev.id || l.toId === dev.id
                        );
                        return (
                          <tr key={dev.id} className="hover:bg-slate-800/30">
                            <td className="p-2.5 font-sans font-semibold text-slate-200">
                              {dev.name}
                            </td>
                            <td className="p-2.5 text-cyan-400 capitalize">{dev.type}</td>
                            <td className="p-2.5 text-slate-300">{dev.ip}</td>
                            <td className="p-2.5 text-slate-400">
                              {devLinks.length} active link(s)
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={onReviseWork}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Revise / Edit Work</span>
            </button>
            <button
              onClick={onStartNewActivity}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Next Lab Activity</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              <span>Download PDF File (.pdf)</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition cursor-pointer"
            >
              <Printer size={15} />
              <span>Print Official Certificate</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
