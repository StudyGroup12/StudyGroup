export interface StudyTimerStatus {
  running: boolean;
  startedAt: string | null;
  todayMinutes: number;
  weekMinutes: number;
  totalMinutes: number;
}

export interface StudySession {
  id: number;
  groupId: number;
  memberId: number;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  running: boolean;
}
