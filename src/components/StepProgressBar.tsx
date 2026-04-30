import { TaskStatus } from '@/types';

// 完了済みのステップ（塗りつぶす丸の数 0〜5）
export const getCompletedSteps = (status: TaskStatus): number => {
  if (status === '完了') return 5;
  if (status === '入金待ち' || status === '公開準備中') return 4;
  
  if (status.includes('4校UP済み')) return 4;
  if (status.includes('4校作業中')) return 3;
  
  if (status.includes('3校UP済み')) return 3;
  if (status.includes('3校作業中')) return 2;
  
  if (status.includes('2校UP済み')) return 2;
  if (status.includes('2校作業中')) return 1;
  
  if (status.includes('初稿UP済み')) return 1;
  if (status.includes('初稿作業中')) return 0;
  
  return 0;
};

// 現在取り組んでいるステップ（空の青丸にする番号 1〜5）
export const getCurrentWorkingStep = (status: TaskStatus): number => {
  if (status === '完了' || status === '入金待ち') return 0;
  if (status === '公開準備中' || status.includes('4校UP済み')) return 5;
  if (status.includes('4校作業中')) return 4;
  if (status.includes('3校UP済み')) return 4;
  if (status.includes('3校作業中')) return 3;
  if (status.includes('2校UP済み')) return 3;
  if (status.includes('2校作業中')) return 2;
  if (status.includes('初稿UP済み')) return 2;
  if (status.includes('初稿作業中')) return 1;
  return 1;
};

interface StepProgressBarProps {
  status: TaskStatus;
}

export function StepProgressBar({ status }: StepProgressBarProps) {
  const completed = getCompletedSteps(status);
  const current = getCurrentWorkingStep(status);
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((step) => {
        const isCompleted = step <= completed;
        const isCurrent = step === current;
        
        return (
          <div key={step} className="flex items-center gap-1">
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-500
                ${isCompleted ? 'bg-blue-500 border-blue-500' : 
                  isCurrent ? 'bg-white border-blue-400 ring-2 ring-blue-100 ring-offset-0' : 
                  'bg-gray-200 border-gray-200'}
              `}
            />
            {step < 5 && (
              <div 
                className={`w-4 h-0.5 rounded-full transition-all duration-700
                  ${isCompleted ? 'bg-blue-500' : 'bg-gray-100'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
