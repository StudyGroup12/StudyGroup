export interface AttendanceRankEntry {
  memberId: number;
  nickname: string;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
}

export interface StudyTimeRankEntry {
  memberId: number;
  nickname: string;
  weekMinutes: number;
  totalMinutes: number;
}

export interface TodoStat {
  totalCount: number;
  completedCount: number;
  progressRate: number;
}

export interface GoalStat {
  totalCount: number;
  completedCount: number;
}

export interface GroupStats {
  totalSchedules: number;
  attendanceRanking: AttendanceRankEntry[];
  studyTimeRanking: StudyTimeRankEntry[];
  todoStat: TodoStat;
  goalStat: GoalStat;
}
