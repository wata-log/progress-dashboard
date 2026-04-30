import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import { StepProgressBar, getCompletedSteps, getCurrentWorkingStep } from './StepProgressBar';
import { Edit2, Trash2, ChevronDown, ChevronUp, Link as LinkIcon, Calendar, Clock, Copy, Check } from 'lucide-react';
import { format, differenceInDays, startOfDay } from 'date-fns';

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const getStatusBadgeColor = (status: TaskStatus) => {
  if (status === '完了') return 'bg-green-50 text-green-700 border-green-200';
  if (status.includes('UP済み')) return 'bg-teal-50 text-teal-700 border-teal-200';
  if (status.includes('作業中') || status === '公開準備中') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === '素材待ち' || status === '入金待ち') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '-';
  try {
    // YYYY-MM-DD 形式なら正規表現で直接変換（タイムゾーンズレなし）
    const isoMatch = dateStr.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
    if (isoMatch) {
      return `${isoMatch[1]}/${isoMatch[2].padStart(2,'0')}/${isoMatch[3].padStart(2,'0')}`;
    }
    // "Fri Apr 17 2026 ..." などの形式はDateオブジェクト経由
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    // UTCではなくJSTで表示するため+9時間
    const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const y = jst.getUTCFullYear();
    const m = String(jst.getUTCMonth() + 1).padStart(2, '0');
    const d = String(jst.getUTCDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  } catch {
    return '-';
  }
};

const formatPrice = (price: number | undefined) => {
  if (price === undefined || price === null || price === 0) return '-';
  return new Intl.NumberFormat('ja-JP').format(price) + '円';
};

// 【修正】期限のカウントロジック：当日なら「あと1日」と表示
const getDaysRemaining = (dateStr: string | undefined) => {
  if (!dateStr) return null;
  try {
    let y: number, mo: number, d: number;
    const isoMatch = dateStr.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
    if (isoMatch) {
      y = Number(isoMatch[1]); mo = Number(isoMatch[2]) - 1; d = Number(isoMatch[3]);
    } else {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      // JSTに変換
      const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      y = jst.getUTCFullYear(); mo = jst.getUTCMonth(); d = jst.getUTCDate();
    }
    const deadlineDate = startOfDay(new Date(y, mo, d));
    const now = new Date();
    const today = startOfDay(new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })));
    const diff = differenceInDays(deadlineDate, today);
    return diff + 1; // 当日なら「あと1日」
  } catch {
    return null;
  }
};

const getCurrentDeadlineInfo = (task: Task) => {
  const { status, milestones } = task;
  if (status === '公開準備中' || status === '入金待ち' || status === '完了') return { date: milestones?.publish?.deadline, label: '公開' };
  if (status.includes('4校UP済み') || status.includes('4校作業中')) return { date: milestones?.publish?.deadline, label: '公開' };
  if (status.includes('3校UP済み') || status.includes('4校')) return { date: milestones?.fourthDraft?.deadline, label: '4校' };
  if (status.includes('2校UP済み') || status.includes('3校')) return { date: milestones?.thirdDraft?.deadline, label: '3校' };
  if (status.includes('初稿UP済み') || status.includes('2校')) return { date: milestones?.secondDraft?.deadline, label: '2校' };
  return { date: milestones?.firstDraft?.deadline, label: '初稿' };
};

export function TaskTable({ tasks, onEdit, onDelete }: TaskTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (tasks.length === 0) {
    return (
      <div className="w-full text-center py-16 px-4 border border-gray-100 rounded-xl bg-gray-50/50">
        <p className="text-gray-500 text-sm">該当する案件がありません。</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* PC用テーブル表示 (md以上) */}
      <div className="hidden md:block overflow-hidden bg-white border border-gray-100 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500">
              <th className="font-medium py-4 px-4 w-10"></th>
              <th className="font-medium py-4 px-4 min-w-[200px]">案件名</th>
              <th className="font-medium py-4 px-4 w-32">素材共有日</th>
              <th className="font-medium py-4 px-4 min-w-[150px]">次フェーズ期限</th>
              <th className="font-medium py-4 px-4 w-36">ステータス</th>
              <th className="font-medium py-4 px-4 w-32">金額(税込)</th>
              <th className="font-medium py-4 px-4 min-w-[150px]">進捗</th>
              <th className="font-medium py-4 px-4 w-24 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => {
              const isExpanded = expandedRows.has(task.id);
              const currentDeadline = getCurrentDeadlineInfo(task);
              const daysRemaining = getDaysRemaining(currentDeadline.date);
              
              const milestones = [
                { id: 'first', label: '初稿', url: task.milestones?.firstDraft?.url, deadline: task.milestones?.firstDraft?.deadline },
                { id: 'second', label: '2校', url: task.milestones?.secondDraft?.url, deadline: task.milestones?.secondDraft?.deadline },
                { id: 'third', label: '3校', url: task.milestones?.thirdDraft?.url, deadline: task.milestones?.thirdDraft?.deadline },
                { id: 'fourth', label: '4校', url: task.milestones?.fourthDraft?.url, deadline: task.milestones?.fourthDraft?.deadline },
                { id: 'publish', label: '公開', url: task.milestones?.publish?.url, deadline: task.milestones?.publish?.deadline },
              ];

              return (
                <React.Fragment key={task.id}>
                  <tr 
                    className={`hover:bg-gray-50/30 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/10' : ''}`}
                    onClick={() => toggleRow(task.id)}
                  >
                    <td className="py-4 px-4 text-gray-400">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-medium">{task.name}</td>
                    <td className="py-4 px-4 text-gray-600">{formatDate(task.materialSharedDate)}</td>
                    <td className="py-4 px-4 text-gray-600">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span>{formatDate(currentDeadline.date)}</span>
                          {currentDeadline.date && <span className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded">{currentDeadline.label}</span>}
                        </div>
                        {daysRemaining !== null && task.status !== '入金待ち' && task.status !== '完了' && (
                          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium w-fit
                            ${daysRemaining < 0 ? 'bg-red-100 text-red-700' : daysRemaining <= 3 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}
                          `}>
                            <Clock size={10} /> {daysRemaining < 0 ? `期限切れ` : `あと${daysRemaining}日`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusBadgeColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 font-mono text-xs">
                      {formatPrice(task.price)}
                    </td>
                    <td className="py-4 px-4"><div className="w-full pr-4"><StepProgressBar status={task.status} /></div></td>
                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onEdit(task)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => { if (window.confirm('削除しますか？')) onDelete(task.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} className="p-0">
                        <div className="bg-gray-50/50 px-12 py-6 border-b border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex items-start justify-between relative mt-2">
                            <div className="absolute top-3 left-[10%] right-[10%] h-[2px] bg-gray-200"></div>
                            <div className="absolute top-3 left-[10%] h-[2px] bg-blue-500 transition-all duration-500" style={{ width: `${(Math.min(getCompletedSteps(task.status), 4) / 4) * 80}%` }}></div>
                            {milestones.map((ms, i) => {
                              const stepNum = i + 1;
                              const completedCount = getCompletedSteps(task.status);
                              const workingStep = getCurrentWorkingStep(task.status);
                              const isCompleted = stepNum <= completedCount;
                              const isCurrent = stepNum === workingStep;
                              const copyKey = `${task.id}-${ms.id}`;
                              const label = i === 4 ? '完了' : ms.label;
                              return (
                                <div key={i} className="flex flex-col items-center relative z-10 w-1/5">
                                  {/* 丸アイコン */}
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mb-3 bg-white transition-colors duration-500 
                                    ${isCompleted ? 'border-blue-500 bg-blue-500 text-white' : isCurrent ? 'border-blue-400 ring-2 ring-blue-100 ring-offset-1' : 'border-gray-300 text-gray-300'}
                                  `}>
                                    {isCompleted ? <Check size={14} strokeWidth={3} /> : <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-blue-400' : 'bg-transparent'}`}></div>}
                                  </div>
                                  <span className="text-xs font-semibold text-gray-700 mb-1">{label}</span>
                                  <span className="text-[11px] text-gray-500 mb-3 font-mono">{formatDate(ms.deadline)}</span>
                                  
                                  {ms.url ? (
                                    <div className="flex flex-col gap-1.5 w-full px-2">
                                      <a href={ms.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-[10px] text-white bg-blue-600 hover:bg-blue-700 px-2 py-1.5 rounded shadow-sm transition-colors">
                                        <LinkIcon size={10} />開く
                                      </a>
                                      <button 
                                        onClick={() => handleCopy(ms.url!, copyKey)}
                                        className={`flex items-center justify-center gap-1 text-[10px] px-2 py-1.5 rounded border transition-all ${copiedId === copyKey ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                      >
                                        {copiedId === copyKey ? <Check size={10} /> : <Copy size={10} />}
                                        {copiedId === copyKey ? '完了' : 'コピー'}
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-gray-300">URL未設定</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* モバイル用カード表示 (md未満) */}
      <div className="md:hidden space-y-4">
        {tasks.map((task) => {
          const isExpanded = expandedRows.has(task.id);
          const currentDeadline = getCurrentDeadlineInfo(task);
          const daysRemaining = getDaysRemaining(currentDeadline.date);
          const milestones = [
            { id: 'first', label: '初稿', url: task.milestones?.firstDraft?.url, deadline: task.milestones?.firstDraft?.deadline },
            { id: 'second', label: '2校', url: task.milestones?.secondDraft?.url, deadline: task.milestones?.secondDraft?.deadline },
            { id: 'third', label: '3校', url: task.milestones?.thirdDraft?.url, deadline: task.milestones?.thirdDraft?.deadline },
            { id: 'fourth', label: '4校', url: task.milestones?.fourthDraft?.url, deadline: task.milestones?.fourthDraft?.deadline },
            { id: 'publish', label: '公開', url: task.milestones?.publish?.url, deadline: task.milestones?.publish?.deadline },
          ];

          return (
            <div key={task.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-4" onClick={() => toggleRow(task.id)}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <h3 className="text-base font-bold text-gray-900 leading-tight">{task.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeColor(task.status)}`}>
                        {task.status}
                      </span>
                      {daysRemaining !== null && task.status !== '入金待ち' && task.status !== '完了' && (
                        <span className={`text-[10px] font-bold ${daysRemaining < 0 ? 'text-red-600' : daysRemaining <= 3 ? 'text-orange-600' : 'text-blue-600'}`}>
                          あと{daysRemaining < 0 ? '0' : daysRemaining}日
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onEdit(task)} className="p-2 text-gray-400 active:bg-gray-100 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => onDelete(task.id)} className="p-2 text-gray-400 active:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50/30 p-2.5 rounded-lg border border-gray-50">
                   <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">金額(税込)</span>
                      <span className="text-sm font-mono font-bold text-gray-800">{formatPrice(task.price)}</span>
                   </div>
                   <div className="text-right">
                      <span className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">次期限 ({currentDeadline.label === '公開' ? '完了' : currentDeadline.label})</span>
                      <span className="text-xs font-mono font-medium text-gray-700">{formatDate(currentDeadline.date)}</span>
                   </div>
                </div>

                <div className="mb-4">
                  <StepProgressBar status={task.status} />
                </div>
                <div className="flex items-center justify-between text-gray-500">
                   <span className="text-xs text-gray-400">共有日: {formatDate(task.materialSharedDate)}</span>
                   <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                      {isExpanded ? '閉じる' : '詳細'}
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                   </div>
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-gray-50 bg-gray-50/30 px-4 py-6 animate-in fade-in slide-in-from-top-2 duration-200">
                   <div className="flex flex-col gap-6 relative">
                      <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-200"></div>
                      {milestones.map((ms, i) => {
                        const stepNum = i + 1;
                        const completedCount = getCompletedSteps(task.status);
                        const workingStep = getCurrentWorkingStep(task.status);
                        const isCompleted = stepNum <= completedCount;
                        const isCurrent = stepNum === workingStep;
                        const copyKey = `mobile-${task.id}-${ms.id}`;
                        const label = i === 4 ? '完了' : ms.label;
                        return (
                          <div key={i} className="flex items-start gap-4 relative z-10">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white shrink-0 ${isCompleted ? 'border-blue-500 bg-blue-500 text-white' : isCurrent ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300 text-gray-300'}`}>
                              {isCompleted ? <Check size={14} strokeWidth={3} /> : <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-blue-400' : 'bg-transparent'}`}></div>}
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-sm font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
                                <span className="text-xs font-mono text-gray-400 bg-white px-1 py-0.5 rounded border border-gray-100">{formatDate(ms.deadline)}</span>
                              </div>
                              {ms.url ? (
                                <div className="flex gap-2">
                                  <a href={ms.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-white bg-blue-600 px-3 py-1.5 rounded shadow-sm">
                                    <LinkIcon size={12} />
                                    開く
                                  </a>
                                  <button 
                                    onClick={() => handleCopy(ms.url!, copyKey)}
                                    className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border transition-all ${copiedId === copyKey ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-gray-600 border-gray-200 active:bg-gray-100'}`}
                                  >
                                    {copiedId === copyKey ? <Check size={12} /> : <Copy size={12} />}
                                    {copiedId === copyKey ? '完了' : 'コピー'}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-300">URL未設定</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
