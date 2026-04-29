import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import { StepProgressBar, getCompletedSteps, getCurrentWorkingStep } from './StepProgressBar';
import { Edit2, Trash2, ChevronDown, ChevronUp, Link as LinkIcon, Calendar, Clock } from 'lucide-react';
import { format, differenceInDays, startOfDay } from 'date-fns';

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const getStatusBadgeColor = (status: TaskStatus) => {
  if (status === '完了') return 'bg-green-50 text-green-700 border-green-200';
  if (status.includes('UP済み')) return 'bg-teal-50 text-teal-700 border-teal-200';
  if (status.includes('修正中')) return 'bg-orange-50 text-orange-700 border-orange-200';
  if (status.includes('作業中') || status === '公開準備中') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === '素材待ち' || status === '入金待ち') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '-';
  try {
    return format(new Date(dateStr), 'yyyy/MM/dd');
  } catch {
    return dateStr;
  }
};

const getDaysRemaining = (dateStr: string | undefined) => {
  if (!dateStr) return null;
  try {
    const deadlineDate = startOfDay(new Date(dateStr));
    const today = startOfDay(new Date());
    // 当日を「あと1日」として扱うため +1
    const diff = differenceInDays(deadlineDate, today) + 1;
    return diff;
  } catch {
    return null;
  }
};

// ステータスに応じて、現在目標とすべき期限を取得する関数
const getCurrentDeadlineInfo = (task: Task) => {
  const { status, milestones } = task;
  
  if (status.includes('2校')) {
    return { date: milestones?.secondDraft?.deadline, label: '2校' };
  }
  if (status.includes('3校')) {
    return { date: milestones?.thirdDraft?.deadline, label: '3校' };
  }
  if (status.includes('4校')) {
    return { date: milestones?.fourthDraft?.deadline, label: '4校' };
  }
  if (status === '公開準備中' || status === '入金待ち' || status === '完了') {
    return { date: milestones?.publish?.deadline, label: '公開' };
  }
  
  // 未着手、素材待ち、初稿関連などはすべて初稿の期限
  return { date: milestones?.firstDraft?.deadline, label: '初稿' };
};

export function TaskTable({ tasks, onEdit, onDelete }: TaskTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (tasks.length === 0) {
    return (
      <div className="w-full text-center py-16 px-4 border border-gray-100 rounded-xl bg-gray-50/50">
        <p className="text-gray-500 text-sm">該当する案件がありません。</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500">
            <th className="font-medium py-4 px-4 w-10"></th>
            <th className="font-medium py-4 px-4 min-w-[200px]">案件名</th>
            <th className="font-medium py-4 px-4 w-32">素材共有日</th>
            <th className="font-medium py-4 px-4 min-w-[150px]">次フェーズ期限</th>
            <th className="font-medium py-4 px-4 w-36">ステータス</th>
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
              { label: '初稿', url: task.milestones?.firstDraft?.url, deadline: task.milestones?.firstDraft?.deadline },
              { label: '2校', url: task.milestones?.secondDraft?.url, deadline: task.milestones?.secondDraft?.deadline },
              { label: '3校', url: task.milestones?.thirdDraft?.url, deadline: task.milestones?.thirdDraft?.deadline },
              { label: '4校', url: task.milestones?.fourthDraft?.url, deadline: task.milestones?.fourthDraft?.deadline },
              { label: '公開', url: task.milestones?.publish?.url, deadline: task.milestones?.publish?.deadline },
            ];

            return (
              <React.Fragment key={task.id}>
                {/* メイン行 */}
                <tr 
                  className={`hover:bg-gray-50/30 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/10' : ''}`}
                  onClick={() => toggleRow(task.id)}
                >
                  <td className="py-4 px-4 text-gray-400">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </td>
                  <td className="py-4 px-4 text-gray-900 font-medium">
                    {task.name}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {formatDate(task.materialSharedDate)}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span>{formatDate(currentDeadline.date)}</span>
                        {currentDeadline.date && (
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded">
                            {currentDeadline.label}
                          </span>
                        )}
                      </div>
                      {daysRemaining !== null && (
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium w-fit
                          ${daysRemaining < 0 ? 'bg-red-100 text-red-700' : 
                            daysRemaining <= 3 ? 'bg-orange-100 text-orange-700' : 
                            'bg-blue-50 text-blue-600'}
                        `}>
                          <Clock size={10} />
                          {daysRemaining < 0 ? `期限切れ` : `あと${daysRemaining}日`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusBadgeColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-full pr-4">
                      <StepProgressBar status={task.status} />
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
                        title="編集"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('この案件を削除してもよろしいですか？')) {
                            onDelete(task.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* 詳細展開行（アコーディオン） */}
                {isExpanded && (
                  <tr>
                    <td colSpan={7} className="p-0 border-b-0">
                      <div className="bg-gray-50/50 px-12 py-6 border-b border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                          <Calendar size={14} /> スケジュール詳細
                        </h4>
                        
                        {/* ステップインジケーター風のレイアウト */}
                        <div className="flex items-start justify-between relative mt-2">
                          {/* 背景のグレーの線 */}
                          <div className="absolute top-3 left-[10%] right-[10%] h-[2px] bg-gray-200"></div>
                          
                          {/* 進捗に応じた青い線 */}
                          <div 
                            className="absolute top-3 left-[10%] h-[2px] bg-blue-500 transition-all duration-500" 
                            style={{ width: `${(Math.min(getCompletedSteps(task.status), 4) / 4) * 80}%` }}
                          ></div>
                          
                          {milestones.map((ms, i) => {
                            const stepNum = i + 1;
                            const isCompleted = stepNum <= getCompletedSteps(task.status);
                            const isCurrent = stepNum === getCurrentWorkingStep(task.status) && task.status !== '完了';

                            return (
                              <div key={i} className="flex flex-col items-center relative z-10 w-1/5">
                                {/* 丸アイコン */}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mb-3 bg-white transition-colors duration-500
                                  ${isCompleted ? 'border-blue-500 text-blue-500' : isCurrent ? 'border-blue-400 ring-2 ring-blue-100 ring-offset-1' : 'border-gray-300 text-gray-300'}
                                `}>
                                  <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isCompleted ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                </div>
                                
                                <span className="text-xs font-semibold text-gray-700 mb-1">{ms.label}</span>
                                
                                {/* 期限表示 */}
                                {ms.deadline ? (
                                  <span className="text-[11px] text-gray-500 mb-2 font-mono bg-white px-1.5 py-0.5 rounded border border-gray-100 shadow-sm">
                                    {formatDate(ms.deadline)}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-gray-400 mb-2">-</span>
                                )}
                                
                                {/* URLリンク */}
                                {ms.url ? (
                                  <a
                                    href={ms.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded transition-colors border border-blue-100"
                                    title={ms.url}
                                  >
                                    <LinkIcon size={10} />
                                    開く
                                  </a>
                                ) : (
                                  <span className="text-[11px] text-gray-300">URL未設定</span>
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
  );
}
