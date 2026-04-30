export const TaskStatuses = [
  '未着手',
  '素材待ち',
  '初稿作業中',
  '初稿UP済み',
  '2校作業中',
  '2校UP済み',
  '3校作業中',
  '3校UP済み',
  '4校作業中',
  '4校UP済み',
  '公開準備中',
  '入金待ち',
  '完了'
] as const;

export type TaskStatus = typeof TaskStatuses[number];

export interface Milestone {
  url?: string;
  deadline?: string;
}

export interface Task {
  id: string;
  name: string;
  materialSharedDate: string; // YYYY-MM-DD
  status: TaskStatus;
  price?: number; // 金額(税込)
  milestones: {
    firstDraft: Milestone;
    secondDraft: Milestone;
    thirdDraft: Milestone;
    fourthDraft: Milestone;
    publish: Milestone;
  };
}
