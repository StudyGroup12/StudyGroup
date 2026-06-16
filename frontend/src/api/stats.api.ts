import api from './axios';
import { ApiResponse } from '../types/auth.types';
import { GroupStats } from '../types/stats.types';

export const fetchGroupStats = async (
  groupId: number
): Promise<ApiResponse<GroupStats>> => {
  const response = await api.get(`/api/groups/${groupId}/stats`);
  return response.data;
};
