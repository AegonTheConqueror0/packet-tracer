import React, { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  Send,
  Award,
  Sparkles,
  Info,
  Clock,
  Layers,
  Play,
  RotateCcw,
  Minimize2,
  Maximize2,
  FileCheck,
} from 'lucide-react';
import { LabActivity, Device, Link, PingReport } from '../types';
import { LAB_ACTIVITIES, evaluateActivityCriteria } from '../utils/activities';
import { sounds } from '../utils/audio';

interface ActivityDrawerProps {
  currentActivity: LabActivity;
  onSelectActivity: (activity: LabActivity) => void;
  devices: Device[];
  links: Link[];
  lastPing: PingReport | null;
  onRunSimulation: () => void;
  onSubmitActivity: () => void;
  onClearCanvas: () => void;
}

export const ActivityDrawer: React.FC<ActivityDrawerProps> = ({
  currentActivity,
  onSelectActivity,
  devices,
  links,
  lastPing,
  onRunSimulation,
  onSubmitActivity,
  onClearCanvas,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'checklist'>('guide');

  // Compute live criteria completion
  const evaluation = evaluateActivityCriteria(currentActivity, devices, links, lastPing);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
      case 'Intermediate':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
      case 'Advanced':
        return 'text-purple-400 bg-purple-950/60 border-purple-500/30';
      default:
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30';
    }
  };

  if (isCollapsed) {
    return (
      <div className="absolute right-4 top-4 z-20 pointer-events-auto">
        <button
          onClick={() => {
            sounds.playClick();
            setIsCollapsed(false);
          }}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl text-slate-100 hover:bg-slate-800 transition backdrop-blur-md cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-sm">
            <FlaskConical size={15} />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-semibold text-cyan-300">
              Lab {currentActivity.number}: {currentActivity.title}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span>{evaluation.completedCount}/{evaluation.totalCount} completed</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span className="font-semibold text-slate-300">{evaluation.score}%</span>
            </div>
          </div>
          <Maximize2 size={13} className="text-slate-400 group-hover:text-cyan-300 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute right-4 top-4 bottom-4 w-96 z-20 pointer-events-auto flex flex-col rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-slate-100 overflow-hidden">
      
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-950/40">
            <FlaskConical size={15} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Activity Laboratory
            </h2>
            <span className="text-[10px] text-slate-400">Cadet Hands-on Practice</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              sounds.playClick();
              setIsCollapsed(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            title="Minimize drawer"
          >
            <Minimize2 size={14} />
          </button>
        </div>
      </div>

      {/* Activity Selector Tabs (1 to 5) */}
      <div className="p-2 border-b border-slate-800/80 bg-slate-900 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {LAB_ACTIVITIES.map((act) => {
          const isSelected = act.id === currentActivity.id;
          return (
            <button
              key={act.id}
              onClick={() => {
                sounds.playClick();
                onSelectActivity(act);
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>Lab {act.number}</span>
            </button>
          );
        })}
      </div>

      {/* Current Activity Overview Banner */}
      <div className="p-3.5 bg-slate-950/40 border-b border-slate-800/80">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-cyan-400">
                ACTIVITY {currentActivity.number}
              </span>
              <span
                className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${getDifficultyColor(
                  currentActivity.difficulty
                )}`}
              >
                {currentActivity.difficulty}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                <Clock size={10} /> {currentActivity.estimatedMinutes}m
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 mt-0.5 leading-snug">
              {currentActivity.title}
            </h3>
            <p className="text-[11px] text-cyan-300/90 font-mono mt-0.5">
              Topology: {currentActivity.requiredTopology}
            </p>
          </div>
        </div>

        {/* Live Criteria Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400">Validation Progress</span>
            <span className="font-mono font-bold text-cyan-300">
              {evaluation.completedCount}/{evaluation.totalCount} Tasks ({evaluation.score}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                evaluation.isAllCompleted
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : 'bg-cyan-500'
              }`}
              style={{ width: `${evaluation.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation sub-tabs: Instructions vs Live Checklist */}
      <div className="flex border-b border-slate-800 text-xs font-medium bg-slate-950/50">
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-2 text-center transition border-b-2 ${
            activeTab === 'guide'
              ? 'border-cyan-500 text-cyan-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Instructions & Scenario
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex-1 py-2 text-center transition border-b-2 relative ${
            activeTab === 'checklist'
              ? 'border-cyan-500 text-cyan-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Live Checklist</span>
          {evaluation.isAllCompleted && (
            <span className="ml-1.5 px-1 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              Ready!
            </span>
          )}
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
        {activeTab === 'guide' ? (
          <>
            {/* Objective & Maritime Scenario */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Info size={12} className="text-cyan-400" />
                Scenario Briefing:
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {currentActivity.scenario}
              </p>
            </div>

            {/* Expected Hardware Specs */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={12} className="text-cyan-400" />
                Required Equipment:
              </span>
              <div className="space-y-1">
                {currentActivity.expectedDevices.map((dev, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px]"
                  >
                    <span className="text-slate-300 font-medium">{dev.label}</span>
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/50">
                      {dev.minCount}x ({dev.type})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Step-by-Step Procedure:
              </span>
              <ol className="space-y-2">
                {currentActivity.instructions.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[11px] text-slate-300 leading-relaxed"
                  >
                    <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Professional Maritime Tip */}
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1 text-[11px]">
              <span className="font-semibold text-cyan-300 flex items-center gap-1">
                <Sparkles size={12} /> Officer Cadet Note:
              </span>
              <p className="text-slate-300 leading-relaxed">{currentActivity.tips[0]}</p>
            </div>

            {/* Cable Connection Hint */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-300">
              <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">⚡</span>
              <span>
                <strong>Easy Cable Connection:</strong> Drag or click from any device's bottom <strong>Port</strong> pin directly to another device. Snaps magnetically!
              </span>
            </div>
          </>
        ) : (
          /* Live Checklist View */
          <div className="space-y-2.5">
            <p className="text-[11px] text-slate-400">
              The verification engine checks your network layout and simulation in real time:
            </p>
            {currentActivity.criteria.map((crit) => {
              const isPassed = evaluation.criterionResults[crit.id] || false;
              return (
                <div
                  key={crit.id}
                  className={`p-3 rounded-xl border transition flex items-start gap-2.5 ${
                    isPassed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle size={16} className="text-slate-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{crit.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {crit.description}
                    </div>
                  </div>
                </div>
              );
            })}

            {evaluation.isAllCompleted ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
                <CheckCircle2 size={16} />
                <span>All laboratory tasks passed! You are ready to submit your work.</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-slate-400 text-[11px] leading-relaxed">
                Complete all items above to unlock full 100% submission score.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Quick Ping Simulation Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onRunSimulation();
            }}
            disabled={devices.length < 2}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Run packet tracer simulation"
          >
            <Play size={13} fill="currentColor" className="text-cyan-400" />
            <span>Simulate Ping</span>
          </button>

          {/* Reset / Clear current lab work */}
          <button
            onClick={() => {
              sounds.playClick();
              onClearCanvas();
            }}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition cursor-pointer"
            title="Clear canvas to restart activity"
          >
            <RotateCcw size={12} />
            <span>Clear Canvas</span>
          </button>
        </div>

        {/* Primary Submit Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onSubmitActivity();
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer ${
            evaluation.isAllCompleted
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-950/50'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/50'
          }`}
        >
          <Award size={15} />
          <span>
            {evaluation.isAllCompleted
              ? 'Submit Laboratory Work (100% Ready)'
              : `Submit Laboratory Work (${evaluation.score}%)`}
          </span>
        </button>
      </div>

    </div>
  );
};
