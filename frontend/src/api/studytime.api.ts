import api from './axios';
import { ApiResponse } from '../types/auth.types';
import { StudySession, StudyTimerStatus } from '../types/studytime.types';

export const fetchTimerStatus = async (
  groupId: number
): Promise<ApiResponse<StudyTimerStatus>> => {
  const response = await api.get(`/api/groups/${groupId}/study-sessions/me`);
  return response.data;
};

export const startStudySession = async (
  groupId: number
): Promise<ApiResponse<StudySession>> => {
  const response = await api.post(`/api/groups/${groupId}/study-sessions/start`);
  return response.data;
};

export const stopStudySession = async (
  groupId: number
): Promise<ApiResponse<StudySession>> => {
  const response = await api.post(`/api/groups/${groupId}/study-sessions/stop`);
  return response.data;
};
