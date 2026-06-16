export interface Goal {
  id: number;
  groupId: number;
  creatorId: number;
  title: string;
  description: string | null;
  unit: string;
  targetValue: number;
  currentValue: number;
  progressRate: number;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalFormData {
  title: string;
  description: string;
  unit: string;
  targetValue: number;
  dueDate: string;
}
