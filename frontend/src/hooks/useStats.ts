import { useQuery } from '@tanstack/react-query';
import { fetchGroupStats } from '../api/stats.api';

export const useGroupStats = (groupId: number) => {
  const hasToken = !!sessionStorage.getItem('accessToken');
  return useQuery({
    queryKey: ['group-stats', groupId],
    queryFn: () => fetchGroupStats(groupId),
    enabled: hasToken && Number.isFinite(groupId),
  });
};
