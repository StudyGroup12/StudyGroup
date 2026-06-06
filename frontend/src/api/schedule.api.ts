import api from './axios';
import { ApiResponse } from '../types/auth.types';
import { PageResponse } from '../types/group.types';
import {
  AttendanceEntry,
  AttendanceResult,
  AttendanceStatus,
  ScheduleDetail,
  ScheduleFormData,
  ScheduleSummary,
} from '../types/schedule.types';

interface ScheduleListParams {
  page?: number;
  size?: number;
}

export const fetchSchedules = async (
  groupId: number,
  params: ScheduleListParams = {}
): Promise<ApiResponse<PageResponse<ScheduleSummary>>> => {
  const response = await api.get(`/api/groups/${groupId}/schedules`, { params });
  return response.data;
};

export const fetchCalendarSchedules = async (
  groupId: number,
  from: string,
  to: string
): Promise<ApiResponse<ScheduleSummary[]>> => {
  const response = await api.get(`/api/groups/${groupId}/schedules/calendar`, {
    params: { from, to },
  });
  return response.data;
};

export const fetchScheduleDetail = async (
  groupId: number,
  scheduleId: number
): Promise<ApiResponse<ScheduleDetail>> => {
  const response = await api.get(`/api/groups/${groupId}/schedules/${scheduleId}`);
  return response.data;
};

export const createSchedule = async (
  groupId: number,
  data: ScheduleFormData
): Promise<ApiResponse<ScheduleDetail>> => {
  const response = await api.post(`/api/groups/${groupId}/schedules`, data);
  return response.data;
};

export const updateSchedule = async (
  groupId: number,
  scheduleId: number,
  data: ScheduleFormData
): Promise<ApiResponse<ScheduleDetail>> => {
  const response = await api.put(`/api/groups/${groupId}/schedules/${scheduleId}`, data);
  return response.data;
};

export const deleteSchedule = async (
  groupId: number,
  scheduleId: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/api/groups/${groupId}/schedules/${scheduleId}`);
  return response.data;
};

export const fetchAttendances = async (
  groupId: number,
  scheduleId: number
): Promise<ApiResponse<AttendanceEntry[]>> => {
  const response = await api.get(`/api/groups/${groupId}/schedules/${scheduleId}/attendances`);
  return response.data;
};

export const checkMyAttendance = async (
  groupId: number,
  scheduleId: number,
  status: AttendanceStatus
): Promise<ApiResponse<AttendanceResult>> => {
  const response = await api.post(`/api/groups/${groupId}/schedules/${scheduleId}/attendances`, {
    status,
  });
  return response.data;
};

export const updateMemberAttendance = async (
  groupId: number,
  scheduleId: number,
  memberId: number,
  status: AttendanceStatus
): Promise<ApiResponse<AttendanceResult>> => {
  const response = await api.put(
    `/api/groups/${groupId}/schedules/${scheduleId}/attendances/${memberId}`,
    { status }
  );
  return response.data;
};
