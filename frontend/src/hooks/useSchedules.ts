import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  checkMyAttendance,
  createSchedule,
  deleteSchedule,
  fetchAttendances,
  fetchCalendarSchedules,
  fetchScheduleDetail,
  fetchSchedules,
  updateMemberAttendance,
  updateSchedule,
} from '../api/schedule.api';
import {
  AttendanceStatus,
  ScheduleFormData,
} from '../types/schedule.types';

const PAGE_SIZE = 10;

export const useScheduleList = (groupId: number, page: number) => {
  const hasToken = !!sessionStorage.getItem('accessToken');
  return useQuery({
    queryKey: ['schedules', groupId, page],
    queryFn: () => fetchSchedules(groupId, { page, size: PAGE_SIZE }),
    enabled: hasToken && Number.isFinite(groupId),
  });
};

export const useCalendarSchedules = (groupId: number, from: string, to: string) => {
  const hasToken = !!sessionStorage.getItem('accessToken');
  return useQuery({
    queryKey: ['schedules', 'calendar', groupId, from, to],
    queryFn: () => fetchCalendarSchedules(groupId, from, to),
    enabled: hasToken && Number.isFinite(groupId) && !!from && !!to,
  });
};

export const useScheduleDetail = (groupId: number, scheduleId: number) => {
  const hasToken = !!sessionStorage.getItem('accessToken');
  return useQuery({
    queryKey: ['schedule', groupId, scheduleId],
    queryFn: () => fetchScheduleDetail(groupId, scheduleId),
    enabled: hasToken && Number.isFinite(groupId) && Number.isFinite(scheduleId),
  });
};

export const useAttendanceList = (groupId: number, scheduleId: number) => {
  const hasToken = !!sessionStorage.getItem('accessToken');
  return useQuery({
    queryKey: ['attendances', groupId, scheduleId],
    queryFn: () => fetchAttendances(groupId, scheduleId),
    enabled: hasToken && Number.isFinite(groupId) && Number.isFinite(scheduleId),
  });
};

export const useCreateSchedule = (groupId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ScheduleFormData) => createSchedule(groupId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules', groupId] });
      qc.invalidateQueries({ queryKey: ['schedules', 'calendar', groupId] });
    },
  });
};

export const useUpdateSchedule = (groupId: number, scheduleId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ScheduleFormData) => updateSchedule(groupId, scheduleId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule', groupId, scheduleId] });
      qc.invalidateQueries({ queryKey: ['schedules', groupId] });
      qc.invalidateQueries({ queryKey: ['schedules', 'calendar', groupId] });
    },
  });
};

export const useDeleteSchedule = (groupId: number, scheduleId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteSchedule(groupId, scheduleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules', groupId] });
      qc.invalidateQueries({ queryKey: ['schedules', 'calendar', groupId] });
    },
  });
};

export const useCheckMyAttendance = (groupId: number, scheduleId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: AttendanceStatus) => checkMyAttendance(groupId, scheduleId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule', groupId, scheduleId] });
      qc.invalidateQueries({ queryKey: ['attendances', groupId, scheduleId] });
    },
  });
};

export const useUpdateMemberAttendance = (groupId: number, scheduleId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { memberId: number; status: AttendanceStatus }) =>
      updateMemberAttendance(groupId, scheduleId, params.memberId, params.status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule', groupId, scheduleId] });
      qc.invalidateQueries({ queryKey: ['attendances', groupId, scheduleId] });
    },
  });
};
