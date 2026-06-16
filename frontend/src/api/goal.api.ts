import api from './axios';
import { ApiResponse } from '../types/auth.types';
import { PageResponse } from '../types/group.types';
import { Goal, GoalFormData } from '../types/goal.types';

interface GoalListParams {
  page?: number;
  size?: number;
}

const toRequestBody = (data: GoalFormData) => ({
  title: data.title,
  description: data.description,
  unit: data.unit,
  targetValue: data.targetValue,
  dueDate: data.dueDate || null,
});

export const fetchGoals = async (
  groupId: number,
  params: GoalListParams = {}
): Promise<ApiResponse<PageResponse<Goal>>> => {
  const response = await api.get(`/api/groups/${groupId}/goals`, { params });
  return response.data;
};

export const fetchGoalDetail = async (
  groupId: number,
  goalId: number
): Promise<ApiResponse<Goal>> => {
  const response = await api.get(`/api/groups/${groupId}/goals/${goalId}`);
  return response.data;
};

export const createGoal = async (
  groupId: number,
  data: GoalFormData
): Promise<ApiResponse<Goal>> => {
  const response = await api.post(`/api/groups/${groupId}/goals`, toRequestBody(data));
  return response.data;
};

export const updateGoal = async (
  groupId: number,
  goalId: number,
  data: GoalFormData
): Promise<ApiResponse<Goal>> => {
  const response = await api.put(`/api/groups/${groupId}/goals/${goalId}`, toRequestBody(data));
  return response.data;
};

export const updateGoalProgress = async (
  groupId: number,
  goalId: number,
  currentValue: number
): Promise<ApiResponse<Goal>> => {
  const response = await api.patch(`/api/groups/${groupId}/goals/${goalId}/progress`, {
    currentValue,
  });
  return response.data;
};

export const deleteGoal = async (
  groupId: number,
  goalId: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/api/groups/${groupId}/goals/${goalId}`);
  return response.data;
};
