"use client";

import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { TaskTable } from '@/components/TaskTable';
import { TaskModal } from '@/components/TaskModal';
import { Plus, CheckCircle2, Clock, LayoutList, CalendarDays } from 'lucide-react';
import { CalendarView } from '@/components/CalendarView';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // タブの状態（進行中 | 入金待ち | 完了）
  const [activeTab, setActiveTab] = useState<'ongoing' | 'payment_pending' | 'completed'>('ongoing');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  // 初回レンダリング時にAPIからデータを読み込む
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log('Fetched tasks:', data);
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error('Invalid data format received from API', data);
        }
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchTasks();
  }, []);



  const handleSaveTask = async (taskToSave: Task) => {
    // 画面上はすぐに反映する（楽観的UI更新）
    if (editingTask) {
      setTasks(tasks.map(t => t.id === taskToSave.id ? taskToSave : t));
    } else {
      setTasks([...tasks, taskToSave]);
    }
    
    // 裏側でAPI（スプレッドシート）に保存
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', task: taskToSave }),
      });
    } catch (error) {
      console.error('Failed to save task to DB', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    // 画面上はすぐに削除する
    setTasks(tasks.filter(t => t.id !== id));
    
    // 裏側でAPI（スプレッドシート）に削除リクエスト
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
    } catch (error) {
      console.error('Failed to delete task from DB', error);
    }
  };

  const handleOpenNewModal = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  // タブに応じたフィルタリング
  const ongoingTasks = tasks.filter(t => t.status !== '入金待ち' && t.status !== '完了');
  const paymentPendingTasks = tasks.filter(t => t.status === '入金待ち');
  const completedTasks = tasks.filter(t => t.status === '完了');

  const displayedTasks = 
    activeTab === 'ongoing' ? ongoingTasks : 
    activeTab === 'payment_pending' ? paymentPendingTasks : 
    completedTasks;

  if (!isLoaded) {
    return <div className="min-h-screen bg-white" />; // ハイドレーションエラー防止
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4 md:gap-6">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900 text-center md:text-left">
              進捗管理ダッシュボード
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* ビュー切り替えボタン */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutList size={14} />
                リスト
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CalendarDays size={14} />
                カレンダー
              </button>
            </div>
            <button
              onClick={handleOpenNewModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm active:scale-[0.98]"
            >
              <Plus size={18} />
              新規追加
            </button>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="flex items-center gap-1 md:gap-2 mb-6 border-b border-gray-100 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'ongoing' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Clock size={14} className="md:w-4 md:h-4" />
            進行中 ({ongoingTasks.length})
          </button>
          
          <button
            onClick={() => setActiveTab('payment_pending')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'payment_pending' 
                ? 'border-orange-500 text-orange-600 bg-orange-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${activeTab === 'payment_pending' ? 'bg-orange-500' : 'bg-gray-300'}`} />
            入金待ち ({paymentPendingTasks.length})
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'completed' 
                ? 'border-green-600 text-green-600 bg-green-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 size={14} className="md:w-4 md:h-4" />
            完了案件 ({completedTasks.length})
          </button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
          {viewMode === 'calendar' ? (
            <CalendarView tasks={ongoingTasks} />
          ) : (
            <TaskTable 
              tasks={displayedTasks} 
              onEdit={handleEditTask} 
              onDelete={handleDeleteTask} 
            />
          )}
        </div>

      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialData={editingTask}
      />
    </div>
  );
}
