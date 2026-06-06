import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  endOfWeek,
  getDay,
  endOfMonth,
  startOfMonth,
  startOfDay,
  endOfDay,
} from 'date-fns';
import ko from 'date-fns/locale/ko';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCalendarSchedules, useScheduleList } from '../../hooks/useSchedules';
import { useAuth } from '../../hooks/useAuth';
import { fetchMyMembership } from '../../api/membership.api';
import './Schedule.css';

const locales = { ko };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

type ViewMode = 'calendar' | 'list';

const toLocalIsoString = (date: Date): string => {
  // 백엔드 LocalDateTime용 ISO 문자열 (타임존 제거)
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const ScheduleListPage = () => {
  const { groupId } = useParams();
  const numericGroupId = Number(groupId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasToken = !!sessionStorage.getItem('accessToken');

  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<View>('month');
  const [page, setPage] = useState(0);

  // 캘린더 뷰가 실제로 보여주는 범위만 요청 (백엔드 최대 62일 제한 안에 들어가야 함)
  const { from, to } = useMemo(() => {
    let fromDate: Date;
    let toDate: Date;
    if (calendarView === 'month') {
      // 월 뷰: 보이는 6주 범위 (보통 35~42일)
      fromDate = startOfWeek(startOfMonth(calendarDate), { weekStartsOn: 0 });
      toDate = endOfWeek(endOfMonth(calendarDate), { weekStartsOn: 0 });
    } else if (calendarView === 'week') {
      fromDate = startOfWeek(calendarDate, { weekStartsOn: 0 });
      toDate = endOfWeek(calendarDate, { weekStartsOn: 0 });
    } else {
      // day 뷰
      fromDate = startOfDay(calendarDate);
      toDate = endOfDay(calendarDate);
    }
    return { from: toLocalIsoString(fromDate), to: toLocalIsoString(toDate) };
  }, [calendarDate, calendarView]);

  const calendarQuery = useCalendarSchedules(numericGroupId, from, to);
  const listQuery = useScheduleList(numericGroupId, page);

  // 가입 승인된 멤버만 일정 추가 가능 (비멤버는 버튼 숨김 — 백엔드도 403으로 재차 차단)
  const myMembershipQuery = useQuery({
    queryKey: ['my-membership', numericGroupId],
    queryFn: () => fetchMyMembership(numericGroupId),
    enabled: hasToken && Number.isFinite(numericGroupId),
  });
  const isMember = !!user && myMembershipQuery.data?.status === 'ACCEPTED';

  const calendarEvents = useMemo(() => {
    const items = calendarQuery.data?.data ?? [];
    return items.map((s) => ({
      id: s.id,
      title: s.title,
      start: new Date(s.startAt),
      end: new Date(s.endAt),
      resource: s,
    }));
  }, [calendarQuery.data]);

  if (!hasToken) {
    return (
      <div className="empty-state">
        로그인 후 일정을 이용할 수 있습니다.
        <div className="group-form-actions">
          <Link to="/login" className="button button-primary">로그인</Link>
        </div>
      </div>
    );
  }

  return (
    <section className="schedule-page">
      <div className="schedule-toolbar">
        <div className="schedule-title-block">
          <h1>일정</h1>
          <p>그룹원들과 함께 스터디 일정을 관리하세요.</p>
        </div>
        <div className="schedule-toolbar-actions">
          <div className="schedule-view-toggle">
            <button
              type="button"
              className={viewMode === 'calendar' ? 'active' : ''}
              onClick={() => setViewMode('calendar')}
            >
              캘린더
            </button>
            <button
              type="button"
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              리스트
            </button>
          </div>
          <Link to={`/groups/${numericGroupId}`} className="button">그룹으로</Link>
          {isMember && (
            <Link to={`/groups/${numericGroupId}/schedules/new`} className="button button-primary">
              일정 추가
            </Link>
          )}
        </div>
      </div>

      {viewMode === 'calendar' && (
        <div className="schedule-calendar-wrapper">
          {calendarQuery.isError && (
            <div className="error-state">
              {(calendarQuery.error as { response?: { data?: { error?: { message?: string } } } })
                ?.response?.data?.error?.message ?? '일정을 불러오지 못했습니다.'}
            </div>
          )}
          <Calendar
            localizer={localizer}
            culture="ko"
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            date={calendarDate}
            view={calendarView}
            onNavigate={(d) => setCalendarDate(d)}
            onView={(v) => setCalendarView(v)}
            onSelectEvent={(e) =>
              navigate(`/groups/${numericGroupId}/schedules/${(e as { id: number }).id}`)
            }
            onSelectSlot={(slot) => {
              if (!isMember) return;
              const start = toLocalIsoString(slot.start as Date).slice(0, 16);
              navigate(`/groups/${numericGroupId}/schedules/new?start=${encodeURIComponent(start)}`);
            }}
            selectable
            views={['month', 'week', 'day']}
            messages={{
              month: '월', week: '주', day: '일', today: '오늘', previous: '이전', next: '다음',
              date: '날짜', time: '시간', event: '일정', noEventsInRange: '해당 기간에 일정이 없습니다.',
            }}
            style={{ height: '100%' }}
          />
        </div>
      )}

      {viewMode === 'list' && (
        <>
          {listQuery.isLoading && <div className="loading-state">일정을 불러오는 중입니다.</div>}
          {listQuery.isError && (
            <div className="error-state">
              {(listQuery.error as { response?: { data?: { error?: { message?: string } } } })
                ?.response?.data?.error?.message ?? '일정 목록을 불러오지 못했습니다.'}
            </div>
          )}
          {!listQuery.isLoading && !listQuery.isError && (listQuery.data?.data.content ?? []).length === 0 && (
            <div className="empty-state">아직 등록된 일정이 없습니다.</div>
          )}
          {!listQuery.isLoading && !listQuery.isError && (listQuery.data?.data.content ?? []).length > 0 && (
            <ul className="schedule-list">
              {(listQuery.data?.data.content ?? []).map((s) => (
                <li key={s.id} className="schedule-row">
                  <Link
                    to={`/groups/${numericGroupId}/schedules/${s.id}`}
                    className="schedule-row-link"
                  >
                    <h2 className="schedule-row-title">{s.title}</h2>
                    <div className="schedule-row-meta">
                      <span>{new Date(s.startAt).toLocaleString()} ~ {new Date(s.endAt).toLocaleString()}</span>
                      {s.location && <span>📍 {s.location}</span>}
                      <span>등록자: {s.creatorNickname}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {listQuery.data?.data && listQuery.data.data.totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="button"
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
                disabled={listQuery.data.data.first}
              >
                이전
              </button>
              <span>
                {listQuery.data.data.number + 1} / {listQuery.data.data.totalPages}
              </span>
              <button
                type="button"
                className="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={listQuery.data.data.last}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ScheduleListPage;
