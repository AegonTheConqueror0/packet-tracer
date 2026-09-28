import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertCircle,
  User,
  Hash,
  GraduationCap,
  FileText,
  Send,
  Sparkles,
} from 'lucide-react';
import { LabActivity, Device, Link, PingReport, StudentSubmission } from '../types';
import { evaluateActivityCriteria, createStudentSubmission } from '../utils/activities';
import { sounds } from '../utils/audio';

interface ActivitySubmitModalProps {
  activity: LabActivity;
  devices: Device[];
  links: Link[];
  lastPing: PingReport | null;
  onClose: () => void;
  onSubmitSuccess: (submission: StudentSubmission) => void;
}

export const ActivitySubmitModal: React.FC<ActivitySubmitModalProps> = ({
  activity,
  devices,
  links,
  lastPing,
  onClose,
  onSubmitSuccess,
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [courseSection, setCourseSection] = useState('BS Marine Transportation 3-A');
  const [instructorName, setInstructorName] = useState('Prof. Edgardo Rojas');
  const [studentNotes, setStudentNotes] = useState('');
  const [nameError, setNameError] = useState(false);

  const evaluation = evaluateActivityCriteria(activity, devices, links, lastPing);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setNameError(true);
      sounds.playError();
      return;
    }

    sounds.playSend();
    const submission = createStudentSubmission(
      studentName,
      studentId,
      courseSection,
      activity,
      devices,
      links,
      lastPing,
      studentNotes,
      instructorName
    );

    onSubmitSuccess(submission);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/30">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Submit Laboratory Work
              </h2>
              <p className="text-xs text-slate-400">
                Activity {activity.number}: {activity.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Activity Readiness Status */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              evaluation.isAllCompleted
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {evaluation.isAllCompleted ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <AlertCircle size={18} className="text-amber-400" />
              )}
              <div>
                <div className="text-xs font-bold">
                  {evaluation.isAllCompleted
                    ? 'All Activity Criteria Verified!'
                    : `Partial Completion (${evaluation.completedCount}/${evaluation.totalCount} Tasks Met)`}
                </div>
                <div className="text-[11px] text-slate-300">
                  {evaluation.isAllCompleted
                    ? 'Your topology and packet simulation are ready for grading.'
                    : 'You can submit now, or return to complete remaining tasks for full score.'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-bold text-cyan-300">
                {evaluation.score}%
              </span>
            </div>
          </div>

          {/* Student Information Fields */}
          <div className="space-y-4">
            
            {/* Student Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User size={13} className="text-cyan-400" />
                Cadet / Student Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  if (nameError && e.target.value.trim()) setNameError(false);
                }}
                placeholder="e.g. Cadet Juan Dela Cruz"
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden ${
                  nameError
                    ? 'border-rose-500 ring-1 ring-rose-500'
                    : 'border-slate-700 focus:border-cyan-500'
                }`}
              />
              {nameError && (
                <p className="text-[11px] text-rose-400 mt-1">
                  Please enter your student name before submitting.
                </p>
              )}
            </div>

            {/* Student ID & Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Hash size={13} className="text-cyan-400" />
                  Cadet ID / Student Number
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 2026-MAR-0842"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-cyan-400" />
                  Course & Section
                </label>
                <input
                  type="text"
                  value={courseSection}
                  onChange={(e) => setCourseSection(e.target.value)}
                  placeholder="e.g. BSMT 3-Alpha"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Instructor Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User size={13} className="text-slate-400" />
                Instructor / Evaluator
              </label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="e.g. Prof. Edgardo Rojas"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden"
              />
            </div>

            {/* Student Notes / Technical Observations */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText size={13} className="text-cyan-400" />
                Laboratory Observations & Technical Reflection (Optional)
              </label>
              <textarea
                rows={3}
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="State your findings: packet latency (RTT in ms), topology resilience, hop path, or why this architecture fits the maritime scenario..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden leading-relaxed resize-none"
              />
            </div>

          </div>

          {/* Topology Snapshot Preview Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Network Proof of Work:
            </span>
            <div className="flex items-center justify-between text-slate-300">
              <span>Deployed Devices:</span>
              <span className="font-mono text-cyan-300 font-semibold">{devices.length} devices</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Physical Cable Links:</span>
              <span className="font-mono text-cyan-300 font-semibold">{links.length} links</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Packet Tracer Simulation:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {lastPing?.success
                  ? `Verified (${lastPing.sourceDevice.name} ➔ ${lastPing.targetDevice.name}, RTT: ${lastPing.rtt}ms)`
                  : 'Pending simulation'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition cursor-pointer"
            >
              <Award size={15} />
              <span>Submit & Show My Work</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
