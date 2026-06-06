import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useAttendanceList,
  useCheckMyAttendance,
  useDeleteSchedule,
  useScheduleDetail,
  useUpdateMemberAttendance,
} from '../../hooks/useSchedules';
import { useAuth } from '../../hooks/useAuth';
import { fetchMyMembership } from '../../api/membership.api';
import { AttendanceStatus } from '../../types/schedule.types';
import './Schedule.css';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'PRESENT', label: '출석' },
  { value: 'LATE', label: '지각' },
  { value: 'ABSENT', label: '결석' },
];

const ScheduleDetailPage = () => {
  const { groupId, scheduleId } = useParams();
  const numericGroupId = Number(groupId);
  const numericScheduleId = Number(scheduleId);
  const navigate = useNavigate();
  const { user } = useAuth();

  const detailQuery = useScheduleDetail(numericGroupId, numericScheduleId);
  const attendanceQuery = useAttendanceList(numericGroupId, numericScheduleId);
  const checkMutation = useCheckMyAttendance(numericGroupId, numericScheduleId);
  const updateMemberMutation = useUpdateMemberAttendance(numericGroupId, numericScheduleId);
  const deleteMutation = useDeleteSchedule(numericGroupId, numericScheduleId);

  // 방장 여부 판단용 — 내 멤버십 정보 (role)
  const hasToken = !!sessionStorage.getItem('accessToken');
  const myMembershipQuery = useQuery({
    queryKey: ['my-membership', numericGroupId],
    queryFn: () => fetchMyMembership(numericGroupId),
    enabled: hasToken && Number.isFinite(numericGroupId),
  });
  const isOwner = myMembershipQuery.data?.role === 'OWNER';

  const detail = detailQuery.data?.data;
  const attendances = attendanceQuery.data?.data ?? [];

  const isWithinWindow = useMemo(() => {
    if (!detail) return false;
    const now = Date.now();
    const start = new Date(detail.startAt).getTime();
    const end = new Date(detail.endAt).getTime();
    return now >= start - 30 * 60_000 && now <= end + 30 * 60_000;
  }, [detail]);

  // 일정 수정/삭제 권한: 작성자 본인 또는 그룹 방장 (board 도메인 패턴과 동일)
  const canEditSchedule =
    !!user && !!detail && (detail.creatorId === user.id || isOwner);

  if (detailQuery.isLoading) {
    return <div className="loading-state">일정을 불러오는 중입니다.</div>;
  }
  if (detailQuery.isError || !detail) {
    return (
      <div className="error-state">
        일정을 불러오지 못했습니다.
        <div className="group-form-actions">
          <Link to={`/groups/${numericGroupId}/schedules`} className="button">목록으로</Link>
        </div>
      </div>
    );
  }

  const handleCheck = (status: AttendanceStatus) => {
    checkMutation.mutate(status, {
      onSuccess: (res) => {
        if (res.data?.autoAdjustedToLate) {
          alert('시작 10분이 지나 자동으로 지각(LATE) 처리되었습니다.');
        }
      },
      onError: (e: unknown) => {
        const err = e as { response?: { data?: { error?: { message?: string } } } };
        alert(err.response?.data?.error?.message ?? '출석 체크에 실패했습니다.');
      },
    });
  };

  const handleUpdateMember = (memberId: number, status: AttendanceStatus) => {
    updateMemberMutation.mutate(
      { memberId, status },
      {
        onError: (e: unknown) => {
          const err = e as { response?: { data?: { error?: { message?: string } } } };
          alert(err.response?.data?.error?.message ?? '출석 수정에 실패했습니다.');
        },
      }
    );
  };

  const handleDelete = () => {
    if (!confirm('정말 일정을 삭제하시겠습니까?')) return;
    deleteMutation.mutate(undefined, {
      onSuccess: () => navigate(`/groups/${numericGroupId}/schedules`),
      onError: (e: unknown) => {
        const err = e as { response?: { data?: { error?: { message?: string } } } };
        alert(err.response?.data?.error?.message ?? '삭제에 실패했습니다.');
      },
    });
  };

  return (
    <section className="schedule-page">
      <div className="schedule-detail">
        <div className="schedule-detail-header">
          <div>
            <h1 style={{ margin: 0 }}>{detail.title}</h1>
            <div className="schedule-detail-meta" style={{ marginTop: 8 }}>
              <span>{new Date(detail.startAt).toLocaleString()} ~ {new Date(detail.endAt).toLocaleString()}</span>
              {detail.location && <span>📍 {detail.location}</span>}
              <span>등록자: {detail.creatorNickname}</span>
            </div>
          </div>
          <div className="schedule-detail-actions">
            <Link to={`/groups/${numericGroupId}/schedules`} className="button">목록</Link>
            {canEditSchedule && (
              <>
                <Link
                  to={`/groups/${numericGroupId}/schedules/${numericScheduleId}/edit`}
                  className="button"
                >
                  수정
                </Link>
                <button type="button" className="button" onClick={handleDelete}>
                  삭제
                </button>
              </>
            )}
          </div>
        </div>

        {detail.description && <p className="schedule-description">{detail.description}</p>}

        <h2>출석 현황</h2>
        <div className="attendance-summary">
          <div className="attendance-summary-item">
            <span className="count">{detail.attendance.present}</span>
            <span className="label">출석</span>
          </div>
          <div className="attendance-summary-item">
            <span className="count">{detail.attendance.late}</span>
            <span className="label">지각</span>
          </div>
          <div className="attendance-summary-item">
            <span className="count">{detail.attendance.absent}</span>
            <span className="label">결석</span>
          </div>
          <div className="attendance-summary-item">
            <span className="count">{detail.attendance.pending}</span>
            <span className="label">미응답</span>
          </div>
        </div>

        {!isWithinWindow && (
          <div className="attendance-window-notice">
            출석 체크는 시작 30분 전부터 종료 30분 후까지만 가능합니다.
          </div>
        )}

        <h3>내 출석</h3>
        <div className="attendance-actions">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={detail.attendance.myStatus === opt.value ? 'active' : ''}
              onClick={() => handleCheck(opt.value)}
              disabled={!isWithinWindow || checkMutation.isPending}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <h3>그룹원 출석 명단</h3>
        {attendanceQuery.isLoading && <div className="loading-state">불러오는 중...</div>}
        {attendanceQuery.isError && (
          <div className="error-state">출석 명단을 불러오지 못했습니다.</div>
        )}
        {!attendanceQuery.isLoading && !attendanceQuery.isError && (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>닉네임</th>
                <th>상태</th>
                <th>체크 시각</th>
                {isOwner && <th>출석 수정</th>}
              </tr>
            </thead>
            <tbody>
              {attendances.map((a) => {
                const statusKey = a.status ?? 'PENDING';
                const statusLabel =
                  a.status === 'PRESENT'
                    ? '출석'
                    : a.status === 'LATE'
                    ? '지각'
                    : a.status === 'ABSENT'
                    ? '결석'
                    : '미응답';
                return (
                  <tr key={a.memberId}>
                    <td>{a.nickname}</td>
                    <td>
                      <span className={`status-badge status-${statusKey}`}>{statusLabel}</span>
                    </td>
                    <td>{a.checkedAt ? new Date(a.checkedAt).toLocaleString() : '-'}</td>
                    {isOwner && (
                      <td>
                        <select
                          value={a.status ?? ''}
                          onChange={(e) =>
                            handleUpdateMember(a.memberId, e.target.value as AttendanceStatus)
                          }
                          disabled={updateMemberMutation.isPending}
                        >
                          <option value="" disabled>선택</option>
                          <option value="PRESENT">출석</option>
                          <option value="LATE">지각</option>
                          <option value="ABSENT">결석</option>
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default ScheduleDetailPage;
