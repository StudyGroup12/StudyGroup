import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { fetchGroupDetail } from '../../api/group.api';
import { useGroupStats } from '../../hooks/useStats';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatMinutes } from '../../utils/duration';
import { AttendanceRankEntry, StudyTimeRankEntry } from '../../types/stats.types';
import './dashboard.css';

const rankBadgeClass = (index: number) => {
  if (index === 0) return 'rank-badge top1';
  if (index === 1) return 'rank-badge top2';
  if (index === 2) return 'rank-badge top3';
  return 'rank-badge';
};

const GroupStatsPage = () => {
  const { groupId } = useParams();
  const numericGroupId = Number(groupId);
  const hasToken = !!sessionStorage.getItem('accessToken');

  const statsQuery = useGroupStats(numericGroupId);
  const groupQuery = useQuery({
    queryKey: ['group', numericGroupId],
    queryFn: () => fetchGroupDetail(numericGroupId),
    enabled: hasToken && Number.isFinite(numericGroupId),
  });

  if (!hasToken) {
    return <div className="study-empty">로그인 후 통계를 확인할 수 있습니다.</div>;
  }

  if (statsQuery.isLoading) {
    return <div className="study-empty">통계를 불러오는 중입니다.</div>;
  }

  if (statsQuery.isError || !statsQuery.data?.data) {
    return (
      <div className="study-empty">
        {getApiErrorMessage(statsQuery.error, '통계를 불러오지 못했습니다.')}
      </div>
    );
  }

  const stats = statsQuery.data.data;
  const groupName = groupQuery.data?.data.name ?? '스터디';
  const goalRate =
    stats.goalStat.totalCount === 0
      ? 0
      : Math.round((stats.goalStat.completedCount * 100) / stats.goalStat.totalCount);

  return (
    <section className="study-page">
      <div className="study-page-header">
        <div>
          <h1>{groupName} · 학습 통계</h1>
          <p>출석·학습시간·목표·할일 현황을 한눈에 확인하세요.</p>
        </div>
        <div className="study-page-actions">
          <Link to={`/groups/${numericGroupId}`} className="button">
            그룹으로
          </Link>
          <Link to={`/groups/${numericGroupId}/study-timer`} className="button">
            학습 타이머
          </Link>
          <Link to={`/groups/${numericGroupId}/goals`} className="button">
            스터디 목표
          </Link>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">진행된 일정</span>
          <span className="summary-value">
            {stats.totalSchedules}
            <span className="unit">회</span>
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">할일 진행률</span>
          <span className="summary-value">
            {stats.todoStat.progressRate}
            <span className="unit">%</span>
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">목표 달성</span>
          <span className="summary-value">
            {stats.goalStat.completedCount}/{stats.goalStat.totalCount}
            <span className="unit">({goalRate}%)</span>
          </span>
        </div>
      </div>

      <div className="section-card">
        <h2>🏆 출석 랭킹</h2>
        {stats.attendanceRanking.length === 0 ? (
          <p className="study-empty">아직 집계할 멤버가 없습니다.</p>
        ) : (
          <table className="rank-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>순위</th>
                <th>닉네임</th>
                <th className="num">출석률</th>
                <th className="num">출석</th>
                <th className="num">지각</th>
                <th className="num">결석</th>
              </tr>
            </thead>
            <tbody>
              {stats.attendanceRanking.map((entry: AttendanceRankEntry, index: number) => (
                <tr key={entry.memberId}>
                  <td>
                    <span className={rankBadgeClass(index)}>{index + 1}</span>
                  </td>
                  <td>{entry.nickname}</td>
                  <td className="num">{entry.attendanceRate}%</td>
                  <td className="num">{entry.presentCount}</td>
                  <td className="num">{entry.lateCount}</td>
                  <td className="num">{entry.absentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section-card">
        <h2>⏱️ 학습시간 랭킹</h2>
        {stats.studyTimeRanking.length === 0 ? (
          <p className="study-empty">아직 기록된 학습시간이 없습니다.</p>
        ) : (
          <table className="rank-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>순위</th>
                <th>닉네임</th>
                <th className="num">이번 주</th>
                <th className="num">누적</th>
              </tr>
            </thead>
            <tbody>
              {stats.studyTimeRanking.map((entry: StudyTimeRankEntry, index: number) => (
                <tr key={entry.memberId}>
                  <td>
                    <span className={rankBadgeClass(index)}>{index + 1}</span>
                  </td>
                  <td>{entry.nickname}</td>
                  <td className="num">{formatMinutes(entry.weekMinutes)}</td>
                  <td className="num">{formatMinutes(entry.totalMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default GroupStatsPage;
