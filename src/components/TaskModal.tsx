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
  const [price, setPrice] = useState<string>('');
  
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
      setPrice(initialData.price?.toString() || '');
      
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
      setPrice('');
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
    
    // 日付のみを抽出するヘルパー (ISO文字列から YYYY-MM-DD を取得)
    const toDateOnly = (val: string) => {
      if (!val) return '';
      return val.split('T')[0];
    };

    onSave({
      id: initialData?.id || crypto.randomUUID(),
      name,
      materialSharedDate: toDateOnly(materialSharedDate),
      status,
      price: price ? parseInt(price, 10) : undefined,
      milestones: {
        firstDraft: { url: firstDraftUrl, deadline: toDateOnly(firstDraftDeadline) },
        secondDraft: { url: secondDraftUrl, deadline: toDateOnly(secondDraftDeadline) },
        thirdDraft: { url: thirdDraftUrl, deadline: toDateOnly(thirdDraftDeadline) },
        fourthDraft: { url: fourthDraftUrl, deadline: toDateOnly(fourthDraftDeadline) },
        publish: { url: publishUrl, deadline: toDateOnly(publishDeadline) },
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
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-8">
          {/* 基本情報 */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">案件名</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: #123 プロジェクトA"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">金額 (税込)</label>
                <div className="relative group">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="例: 150000"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {price && (
                      <button type="button" onClick={() => setPrice('')} className="p-0.5 hover:bg-gray-200 rounded text-gray-400"><X size={14}/></button>
                    )}
                    <span className="text-gray-400 text-[10px] font-bold">円</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">素材共有日</label>
                <div className="relative group">
                  <input
                    type="date"
                    value={materialSharedDate}
                    onChange={(e) => setMaterialSharedDate(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                  {materialSharedDate && (
                    <button type="button" onClick={() => setMaterialSharedDate('')} className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-md text-gray-400"><X size={14} /></button>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">ステータス</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                >
                  {TaskStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* スケジュール詳細 */}
          <div className="space-y-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-800">スケジュール詳細</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {[
                { label: '初稿', url: firstDraftUrl, setUrl: setFirstDraftUrl, deadline: firstDraftDeadline, setDeadline: setFirstDraftDeadline },
                { label: '2校', url: secondDraftUrl, setUrl: setSecondDraftUrl, deadline: secondDraftDeadline, setDeadline: setSecondDraftDeadline },
                { label: '3校', url: thirdDraftUrl, setUrl: setThirdDraftUrl, deadline: thirdDraftDeadline, setDeadline: setThirdDraftDeadline },
                { label: '4校', url: fourthDraftUrl, setUrl: setFourthDraftUrl, deadline: fourthDraftDeadline, setDeadline: setFourthDraftDeadline },
                { label: '公開', url: publishUrl, setUrl: setPublishUrl, deadline: publishDeadline, setDeadline: setPublishDeadline },
              ].map((m) => (
                <div key={m.label} className="bg-gray-50/50 p-4 rounded-xl space-y-4 border border-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">{m.label}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">共有用URL</label>
                      <div className="relative">
                        <input
                          type="url"
                          value={m.url}
                          onChange={(e) => m.setUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full pl-9 pr-8 py-2 bg-white border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                        />
                        <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        {m.url && (
                          <button type="button" onClick={() => m.setUrl('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-md text-gray-400"><X size={12} /></button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">期限日</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={m.deadline}
                          onChange={(e) => m.setDeadline(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                        />
                        {m.deadline && (
                          <button type="button" onClick={() => m.setDeadline('')} className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-md text-gray-400"><X size={12} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all shadow-md active:scale-95"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}
