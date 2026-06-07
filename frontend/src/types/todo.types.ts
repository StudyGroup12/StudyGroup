export interface Todo {
  id: number;
  groupId: number;
  memberId: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalTodo {
  id: number;
  memberId: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodoProgress {
  totalCount: number;
  completedCount: number;
  progressRate: number;
}

export interface TodoFormData {
  title: string;
  description: string;
  dueDate: string;
}
