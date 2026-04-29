import React from 'react';
import { TaskStatus } from '@/types';

interface StepProgressBarProps {
  status: TaskStatus;
}

  // 達成済みのステップ（0〜5）を判定
export const getCompletedSteps = (s: TaskStatus) => {
  if (['未着手', '素材待ち', '初稿作業中', '初稿修正中'].includes(s)) return 0;
  if (['初稿UP済み', '2校作業中', '2校修正中'].includes(s)) return 1;
  if (['2校UP済み', '3校作業中', '3校修正中'].includes(s)) return 2;
  if (['3校UP済み', '4校作業中', '4校修正中'].includes(s)) return 3;
  if (['4校UP済み', '公開準備中', '入金待ち'].includes(s)) return 4;
  if (s === '完了') return 5;
  return 0;
};

// 現在作業中の目標ステップ（1〜5）を判定
export const getCurrentWorkingStep = (s: TaskStatus) => {
  if (['未着手', '素材待ち', '初稿作業中', '初稿修正中'].includes(s)) return 1;
  if (['初稿UP済み', '2校作業中', '2校修正中'].includes(s)) return 2;
  if (['2校UP済み', '3校作業中', '3校修正中'].includes(s)) return 3;
  if (['3校UP済み', '4校作業中', '4校修正中'].includes(s)) return 4;
  if (['4校UP済み', '公開準備中', '入金待ち'].includes(s)) return 5;
  if (s === '完了') return 5;
  return 1;
};

export function StepProgressBar({ status }: StepProgressBarProps) {
  const completedSteps = getCompletedSteps(status);
  const currentWorkingStep = getCurrentWorkingStep(status);
  const totalSteps = 5;

  return (
    <div className="w-full flex items-center">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum <= completedSteps;
        const isCurrent = stepNum === currentWorkingStep && status !== '完了';
        
        return (
          <React.Fragment key={i}>
            {/* 線 (最初の要素以外) */}
            {i > 0 && (
              <div className="flex-1 h-[2px] mx-1 relative overflow-hidden bg-gray-200">
                 <div 
                   className={`absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-out`}
                   style={{ width: stepNum <= completedSteps ? '100%' : '0%' }}
                 />
              </div>
            )}
            
            {/* 丸 */}
            <div 
              className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors duration-500 ${
                isCompleted ? 'bg-blue-500' : 'bg-gray-200'
              } ${isCurrent ? 'ring-2 ring-blue-200 ring-offset-1' : ''}`}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}
