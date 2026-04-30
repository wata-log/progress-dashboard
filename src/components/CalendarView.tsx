'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const PHASE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  '初稿':  { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500' },
  '2校':   { bg: 'bg-violet-100', text: 'text-violet-800', dot: 'bg-violet-500' },
  '3校':   { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500' },
  '4校':   { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  '完了':  { bg: 'bg-rose-100',   text: 'text-rose-800',   dot: 'bg-rose-500' },
};

interface CalendarEvent {
  taskName: string;
  phase: string;
  dateStr: string; // YYYY-MM-DD
}

function parseToYMD(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const isoMatch = dateStr.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = String(Number(isoMatch[2])).padStart(2, '0');
    const d = String(Number(isoMatch[3])).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const y = jst.getUTCFullYear();
    const m = String(jst.getUTCMonth() + 1).padStart(2, '0');
    const d = String(jst.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return null;
  }
}

function buildEvents(tasks: Task[]): Record<string, CalendarEvent[]> {
  const map: Record<string, CalendarEvent[]> = {};
  const addEvent = (dateStr: string | undefined, taskName: string, phase: string) => {
    const key = parseToYMD(dateStr);
    if (!key) return;
    if (!map[key]) map[key] = [];
    map[key].push({ taskName, phase, dateStr: key });
  };

  tasks.forEach(task => {
    const name = task.name.length > 14 ? task.name.slice(0, 14) + '…' : task.name;
    addEvent(task.milestones?.firstDraft?.deadline, name, '初稿');
    addEvent(task.milestones?.secondDraft?.deadline, name, '2校');
    addEvent(task.milestones?.thirdDraft?.deadline, name, '3校');
    addEvent(task.milestones?.fourthDraft?.deadline, name, '4校');
    addEvent(task.milestones?.publish?.deadline, name, '完了');
  });
  return map;
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const events = buildEvents(tasks);
  const todayStr = parseToYMD(today.toISOString());

  // カレンダーの日付を生成
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base font-semibold text-gray-800 w-28 text-center">
            {viewYear}年 {MONTHS[viewMonth]}
          </h2>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <ChevronRight size={18} />
          </button>
        </div>
        <button onClick={goToday} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 font-medium transition-colors">
          今日
        </button>
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-3 px-5 py-2 border-b border-gray-50 flex-wrap">
        {Object.entries(PHASE_COLORS).map(([phase, color]) => (
          <div key={phase} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${color.dot}`} />
            <span className="text-[11px] text-gray-500">{phase}</span>
          </div>
        ))}
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={`py-2 text-center text-xs font-bold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
            {w}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-50">
        {cells.map((day, idx) => {
          const col = idx % 7;
          const dateKey = day ? `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}` : null;
          const dayEvents = dateKey ? (events[dateKey] || []) : [];
          const isToday = dateKey === todayStr;
          const isSun = col === 0;
          const isSat = col === 6;

          return (
            <div
              key={idx}
              className={`min-h-[90px] md:min-h-[110px] p-1.5 transition-colors ${day ? 'hover:bg-gray-50/50' : ''} ${!day ? 'bg-gray-50/30' : ''}`}
            >
              {day && (
                <>
                  <div className="flex justify-end mb-1">
                    <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-blue-600 text-white' : isSun ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-gray-600'}
                    `}>
                      {day}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dayEvents.slice(0, 3).map((ev, i) => {
                      const c = PHASE_COLORS[ev.phase] || PHASE_COLORS['完了'];
                      return (
                        <div
                          key={i}
                          title={`${ev.taskName} - ${ev.phase}`}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-medium leading-tight truncate ${c.bg} ${c.text}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                          <span className="truncate hidden md:block">{ev.taskName}</span>
                          <span className="shrink-0">{ev.phase}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-gray-400 pl-1">+{dayEvents.length - 3}件</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
