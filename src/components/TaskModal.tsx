import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskStatuses } from '@/types';
import { X, Link as LinkIcon, Calendar } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  initialData?: Task;
}

export function TaskModal({ isOpen, onClose, onSave, initialData }: TaskModalProps) {
  const [name, setName] = useState('');
  const [materialSharedDate, setMaterialSharedDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('未着手');
  
  // マイルストーンのURLと期限
  const [firstDraftUrl, setFirstDraftUrl] = useState('');
  const [firstDraftDeadline, setFirstDraftDeadline] = useState('');
  const [secondDraftUrl, setSecondDraftUrl] = useState('');
  const [secondDraftDeadline, setSecondDraftDeadline] = useState('');
  const [thirdDraftUrl, setThirdDraftUrl] = useState('');
  const [thirdDraftDeadline, setThirdDraftDeadline] = useState('');
  const [fourthDraftUrl, setFourthDraftUrl] = useState('');
  const [fourthDraftDeadline, setFourthDraftDeadline] = useState('');
  const [publishUrl, setPublishUrl] = useState('');
  const [publishDeadline, setPublishDeadline] = useState('');

  // 日付文字列を YYYY-MM-DD に整形するヘルパー
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setMaterialSharedDate(formatDateForInput(initialData.materialSharedDate));
      setStatus(initialData.status || '未着手');
      
      setFirstDraftUrl(initialData.milestones?.firstDraft?.url || '');
      setFirstDraftDeadline(formatDateForInput(initialData.milestones?.firstDraft?.deadline));
      setSecondDraftUrl(initialData.milestones?.secondDraft?.url || '');
      setSecondDraftDeadline(formatDateForInput(initialData.milestones?.secondDraft?.deadline));
      setThirdDraftUrl(initialData.milestones?.thirdDraft?.url || '');
      setThirdDraftDeadline(formatDateForInput(initialData.milestones?.thirdDraft?.deadline));
      setFourthDraftUrl(initialData.milestones?.fourthDraft?.url || '');
      setFourthDraftDeadline(formatDateForInput(initialData.milestones?.fourthDraft?.deadline));
      setPublishUrl(initialData.milestones?.publish?.url || '');
      setPublishDeadline(formatDateForInput(initialData.milestones?.publish?.deadline));
    } else {
      setName('');
      setMaterialSharedDate('');
      setStatus('未着手');
      setFirstDraftUrl('');
      setFirstDraftDeadline('');
      setSecondDraftUrl('');
      setSecondDraftDeadline('');
      setThirdDraftUrl('');
      setThirdDraftDeadline('');
      setFourthDraftUrl('');
      setFourthDraftDeadline('');
      setPublishUrl('');
      setPublishDeadline('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || crypto.randomUUID(),
      name,
      materialSharedDate,
      status,
      milestones: {
        firstDraft: { url: firstDraftUrl, deadline: firstDraftDeadline },
        secondDraft: { url: secondDraftUrl, deadline: secondDraftDeadline },
        thirdDraft: { url: thirdDraftUrl, deadline: thirdDraftDeadline },
        fourthDraft: { url: fourthDraftUrl, deadline: fourthDraftDeadline },
        publish: { url: publishUrl, deadline: publishDeadline },
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-medium text-gray-800">
            {initialData ? '案件の編集' : '新規案件の追加'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 基本情報 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">基本情報</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="〇〇デザイン制作"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    素材共有日
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={materialSharedDate}
                      onChange={(e) => setMaterialSharedDate(e.target.value)}
                      className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                    {materialSharedDate && (
                      <button
                        type="button"
                        onClick={() => setMaterialSharedDate('')}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                        title="日付をクリア"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ステータス */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">ステータス</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
                  >
                    {TaskStatuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* スケジュールごとの期限と共有URL */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-semibold text-gray-900">マイルストーン (期限と共有URL)</h3>
                <span className="text-xs text-gray-500">※必要なフェーズのみ入力（空欄可）</span>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: '初稿', urlValue: firstDraftUrl, urlSetter: setFirstDraftUrl, dateValue: firstDraftDeadline, dateSetter: setFirstDraftDeadline },
                  { label: '2校', urlValue: secondDraftUrl, urlSetter: setSecondDraftUrl, dateValue: secondDraftDeadline, dateSetter: setSecondDraftDeadline },
                  { label: '3校', urlValue: thirdDraftUrl, urlSetter: setThirdDraftUrl, dateValue: thirdDraftDeadline, dateSetter: setThirdDraftDeadline },
                  { label: '4校', urlValue: fourthDraftUrl, urlSetter: setFourthDraftUrl, dateValue: fourthDraftDeadline, dateSetter: setFourthDraftDeadline },
                  { label: '公開', urlValue: publishUrl, urlSetter: setPublishUrl, dateValue: publishDeadline, dateSetter: setPublishDeadline },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                    <label className="w-12 text-sm font-medium text-gray-700 shrink-0 text-center">
                      {item.label}
                    </label>
                    <div className="relative w-44 shrink-0">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={14} className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={item.dateValue}
                        onChange={(e) => item.dateSetter(e.target.value)}
                        className="w-full pl-9 pr-8 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      />
                      {item.dateValue && (
                        <button
                          type="button"
                          onClick={() => item.dateSetter('')}
                          className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                          title="日付をクリア"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon size={14} className="text-gray-400" />
                      </div>
                      <input
                        type="url"
                        value={item.urlValue}
                        onChange={(e) => item.urlSetter(e.target.value)}
                        className="w-full pl-9 pr-8 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        placeholder="共有URL (https://...)"
                      />
                      {item.urlValue && (
                        <button
                          type="button"
                          onClick={() => item.urlSetter('')}
                          className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                          title="URLをクリア"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            form="task-form"
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            保存
          </button>
        </div>

      </div>
    </div>
  );
}
