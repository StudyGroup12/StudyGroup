import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  useCreateSchedule,
  useScheduleDetail,
  useUpdateSchedule,
} from '../../hooks/useSchedules';
import { ScheduleFormData } from '../../types/schedule.types';
import './Schedule.css';

const toInputValue = (iso: string): string => {
  // YYYY-MM-DDTHH:mm
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const ScheduleFormPage = () => {
  const { groupId, scheduleId } = useParams();
  const numericGroupId = Number(groupId);
  const numericScheduleId = scheduleId ? Number(scheduleId) : undefined;
  const isEdit = !!numericScheduleId;
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const detailQuery = useScheduleDetail(numericGroupId, numericScheduleId ?? 0);
  const createMutation = useCreateSchedule(numericGroupId);
  const updateMutation = useUpdateSchedule(numericGroupId, numericScheduleId ?? 0);

  const [form, setForm] = useState<ScheduleFormData>({
    title: '',
    description: '',
    location: '',
    startAt: params.get('start') ?? '',
    endAt: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && detailQuery.data?.data) {
      const d = detailQuery.data.data;
      setForm({
        title: d.title,
        description: d.description ?? '',
        location: d.location ?? '',
        startAt: toInputValue(d.startAt),
        endAt: toInputValue(d.endAt),
      });
    }
  }, [isEdit, detailQuery.data]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!form.startAt || !form.endAt) {
      setError('시작/종료 시각을 입력해주세요.');
      return;
    }
    if (new Date(form.startAt) >= new Date(form.endAt)) {
      setError('종료 시각은 시작 시각보다 뒤여야 합니다.');
      return;
    }

    const payload: ScheduleFormData = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      // datetime-local 입력값(YYYY-MM-DDTHH:mm)에 :00 초를 붙여 LocalDateTime 형태로
      startAt: form.startAt.length === 16 ? `${form.startAt}:00` : form.startAt,
      endAt: form.endAt.length === 16 ? `${form.endAt}:00` : form.endAt,
    };

    const onError = (e: unknown) => {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setError(err.response?.data?.error?.message ?? '저장에 실패했습니다.');
    };

    if (isEdit) {
      updateMutation.mutate(payload, {
        onSuccess: () => navigate(`/groups/${numericGroupId}/schedules/${numericScheduleId}`),
        onError,
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: (res) => {
          const id = res.data?.id;
          if (id) navigate(`/groups/${numericGroupId}/schedules/${id}`);
          else navigate(`/groups/${numericGroupId}/schedules`);
        },
        onError,
      });
    }
  };

  return (
    <section className="schedule-page">
      <form className="schedule-form" onSubmit={handleSubmit}>
        <h1 style={{ margin: 0 }}>{isEdit ? '일정 수정' : '일정 추가'}</h1>

        <label>
          제목
          <input
            type="text"
            value={form.title}
            maxLength={200}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </label>

        <label>
          설명 (선택)
          <textarea
            value={form.description}
            maxLength={2000}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <label>
          장소 / 링크 (선택)
          <input
            type="text"
            value={form.location}
            maxLength={200}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </label>

        <label>
          시작 시각
          <input
            type="datetime-local"
            value={form.startAt}
            onChange={(e) => setForm({ ...form, startAt: e.target.value })}
            required
          />
        </label>

        <label>
          종료 시각
          <input
            type="datetime-local"
            value={form.endAt}
            onChange={(e) => setForm({ ...form, endAt: e.target.value })}
            required
          />
        </label>

        {error && <div className="schedule-form-error">{error}</div>}

        <div className="schedule-form-actions">
          <Link
            to={
              isEdit
                ? `/groups/${numericGroupId}/schedules/${numericScheduleId}`
                : `/groups/${numericGroupId}/schedules`
            }
            className="button"
          >
            취소
          </Link>
          <button
            type="submit"
            className="button button-primary"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {isEdit ? '수정 저장' : '등록'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ScheduleFormPage;
