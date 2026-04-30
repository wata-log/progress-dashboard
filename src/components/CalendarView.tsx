'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
const WEEKDAYS = ['日','月','火','水','木','金','土'];

const PHASES = ['初稿','2校','3校','4校','完了'] as const;
const PHASE_COLORS: Record<string, string> = {
  '初稿': 'bg-blue-300',
  '2校':  'bg-violet-300',
  '3校':  'bg-emerald-300',
  '4校':  'bg-orange-300',
  '完了': 'bg-rose-300',
};
const PHASE_DOT: Record<string, string> = {
  '初稿': 'bg-blue-500',
  '2校':  'bg-violet-500',
  '3校':  'bg-emerald-500',
  '4校':  'bg-orange-500',
  '完了': 'bg-rose-500',
};

function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const m = dateStr.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return new Date(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate());
  } catch { return null; }
}

function getPhaseForDay(task: Task, day: Date): string | null {
  const t = day.getTime();
  const mat = parseDate(task.materialSharedDate)?.getTime();
  const d1  = parseDate(task.milestones?.firstDraft?.deadline)?.getTime();
  const d2  = parseDate(task.milestones?.secondDraft?.deadline)?.getTime();
  const d3  = parseDate(task.milestones?.thirdDraft?.deadline)?.getTime();
  const d4  = parseDate(task.milestones?.fourthDraft?.deadline)?.getTime();
  const d5  = parseDate(task.milestones?.publish?.deadline)?.getTime();

  if (mat && d1 && t >= mat && t <= d1) return '初稿';
  if (d1  && d2 && t > d1  && t <= d2) return '2校';
  if (d2  && d3 && t > d2  && t <= d3) return '3校';
  if (d3  && d4 && t > d3  && t <= d4) return '4校';
  if (d4  && d5 && t > d4  && t <= d5) return '完了';
  return null;
}

interface Props { tasks: Task[]; }

export function CalendarView({ tasks }: Props) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Date[] = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const DAY_W = 28; // px per day column

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><ChevronLeft size={18}/></button>
          <h2 className="text-base font-semibold text-gray-800 w-32 text-center">{year}年 {MONTHS[month]}</h2>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><ChevronRight size={18}/></button>
        </div>
        <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}
          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 font-medium transition-colors">今日</button>
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-4 px-5 py-2 border-b border-gray-50 flex-wrap">
        {PHASES.map(p => (
          <div key={p} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${PHASE_COLORS[p]}`}/>
            <span className="text-[11px] text-gray-500">{p}</span>
          </div>
        ))}
      </div>

      {/* ガントチャート */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${180 + daysInMonth * DAY_W}px` }}>

          {/* 日付ヘッダー */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <div className="w-44 shrink-0 px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">案件名</div>
            <div className="flex">
              {days.map((day, i) => {
                const dow = day.getDay();
                const isToday = day.getTime() === todayTime;
                return (
                  <div key={i} style={{ width: DAY_W }} className="shrink-0 flex flex-col items-center py-1.5 border-l border-gray-100 first:border-l-0">
                    <span className={`text-[9px] font-bold ${dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                      {WEEKDAYS[dow]}
                    </span>
                    <span className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-blue-600 text-white' : dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-gray-600'}`}>
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* タスク行 */}
          {tasks.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">案件がありません</div>
          ) : (
            tasks.map((task) => {
              const phases = days.map(day => getPhaseForDay(task, day));
              return (
                <div key={task.id} className="flex border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                  {/* 案件名 */}
                  <div className="w-44 shrink-0 px-3 py-2 flex items-center">
                    <span className="text-xs font-medium text-gray-700 truncate" title={task.name}>{task.name}</span>
                  </div>
                  {/* フェーズバー */}
                  <div className="flex">
                    {days.map((day, i) => {
                      const phase = phases[i];
                      const prevPhase = i > 0 ? phases[i - 1] : null;
                      const nextPhase = i < days.length - 1 ? phases[i + 1] : null;
                      const isStart = phase && phase !== prevPhase;
                      const isEnd   = phase && phase !== nextPhase;
                      const isToday = day.getTime() === todayTime;
                      const dow = day.getDay();

                      return (
                        <div key={i} style={{ width: DAY_W }}
                          className={`shrink-0 relative h-10 border-l border-gray-50 first:border-l-0 flex items-center justify-center
                            ${isToday ? 'border-l-2 border-l-blue-400' : ''}
                            ${dow === 0 ? 'bg-red-50/30' : dow === 6 ? 'bg-blue-50/20' : ''}
                          `}>
                          {phase && (
                            <div className={`absolute inset-y-1 ${PHASE_COLORS[phase]} transition-all
                              ${isStart ? 'left-1 rounded-l-sm' : 'left-0'}
                              ${isEnd   ? 'right-1 rounded-r-sm' : 'right-0'}
                            `}>
                              {/* フェーズラベル（開始時のみ） */}
                              {isStart && (
                                <span className="absolute inset-0 flex items-center px-1 text-[9px] font-bold text-white/80 whitespace-nowrap overflow-hidden">
                                  {phase}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
