import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTimerStatus,
  startStudySession,
  stopStudySession,
} from '../api/studytime.api';

export const useTimerStatus = (groupId: number) => {
  const hasToken = !!sessionStorage.getItem('accessToken');
  return useQuery({
    queryKey: ['study-timer', groupId],
    queryFn: () => fetchTimerStatus(groupId),
    enabled: hasToken && Number.isFinite(groupId),
  });
};

export const useStartStudySession = (groupId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => startStudySession(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-timer', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-stats', groupId] });
    },
  });
};

export const useStopStudySession = (groupId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => stopStudySession(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-timer', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-stats', groupId] });
    },
  });
};
