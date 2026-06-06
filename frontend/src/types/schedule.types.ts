export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';

export interface ScheduleSummary {
  id: number;
  groupId: number;
  title: string;
  location: string | null;
  startAt: string;
  endAt: string;
  creatorId: number;
  creatorNickname: string;
  createdAt: string;
}

export interface AttendanceSummary {
  present: number;
  late: number;
  absent: number;
  pending: number;
  myStatus: AttendanceStatus | null;
}

export interface ScheduleDetail {
  id: number;
  groupId: number;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string;
  creatorId: number;
  creatorNickname: string;
  createdAt: string;
  updatedAt: string;
  attendance: AttendanceSummary;
}

export interface ScheduleFormData {
  title: string;
  description: string;
  location: string;
  startAt: string; // datetime-local 입력값 (YYYY-MM-DDTHH:mm)
  endAt: string;
}

export interface AttendanceEntry {
  memberId: number;
  nickname: string;
  status: AttendanceStatus | null;
  checkedAt: string | null;
}

export interface AttendanceResult {
  scheduleId: number;
  memberId: number;
  nickname: string;
  status: AttendanceStatus;
  checkedAt: string;
  autoAdjustedToLate: boolean;
}
