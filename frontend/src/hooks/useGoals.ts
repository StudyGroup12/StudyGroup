import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createGoal,
  deleteGoal,
  fetchGoalDetail,
  fetchGoals,
  updateGoal,
  updateGoalProgress,
} from '../api/goal.api';
import { GoalFormData } from '../types/goal.types';

const PAGE_SIZE = 10;

export const useGoalList = (groupId: number, page: number) => {
  const hasToken = !!sessionStorage.getItem('accessToken');
  return useQuery({
    queryKey: ['goals', groupId, page],
    queryFn: () => fetchGoals(groupId, { page, size: PAGE_SIZE }),
    enabled: hasToken && Number.isFinite(groupId),
  });
};

export const useGoalDetail = (groupId: number, goalId: number | undefined) => {
  const hasToken = !!sessionStorage.getItem('accessToken');
  return useQuery({
    queryKey: ['goal', groupId, goalId],
    queryFn: () => fetchGoalDetail(groupId, goalId as number),
    enabled: hasToken && Number.isFinite(groupId) && goalId !== undefined && Number.isFinite(goalId),
  });
};

const invalidateGoals = (
  queryClient: ReturnType<typeof useQueryClient>,
  groupId: number
) => {
  queryClient.invalidateQueries({ queryKey: ['goals', groupId] });
  queryClient.invalidateQueries({ queryKey: ['group-stats', groupId] });
};

export const useCreateGoal = (groupId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GoalFormData) => createGoal(groupId, data),
    onSuccess: () => invalidateGoals(queryClient, groupId),
  });
};

export const useUpdateGoal = (groupId: number, goalId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GoalFormData) => updateGoal(groupId, goalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal', groupId, goalId] });
      invalidateGoals(queryClient, groupId);
    },
  });
};

export const useUpdateGoalProgress = (groupId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { goalId: number; currentValue: number }) =>
      updateGoalProgress(groupId, params.goalId, params.currentValue),
    onSuccess: () => invalidateGoals(queryClient, groupId),
  });
};

export const useDeleteGoal = (groupId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: number) => deleteGoal(groupId, goalId),
    onSuccess: () => invalidateGoals(queryClient, groupId),
  });
};
