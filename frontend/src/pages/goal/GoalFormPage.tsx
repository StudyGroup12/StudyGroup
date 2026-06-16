import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCreateGoal, useGoalDetail, useUpdateGoal } from '../../hooks/useGoals';
import { getApiErrorMessage } from '../../utils/apiError';
import '../todo/Todo.css';

const GoalFormPage = () => {
  const { groupId, goalId } = useParams();
  const numericGroupId = Number(groupId);
  const numericGoalId = goalId ? Number(goalId) : undefined;
  const isEdit = numericGoalId !== undefined;
  const hasToken = !!sessionStorage.getItem('accessToken');
  const navigate = useNavigate();

  const detailQuery = useGoalDetail(numericGroupId, numericGoalId);
  const createMutation = useCreateGoal(numericGroupId);
  const updateMutation = useUpdateGoal(numericGroupId, numericGoalId ?? 0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [dueDate, setDueDate] = useState('');

  const detail = detailQuery.data?.data;
  useEffect(() => {
    if (detail) {
      setTitle(detail.title);
      setDescription(detail.description ?? '');
      setUnit(detail.unit);
      setTargetValue(String(detail.targetValue));
      setDueDate(detail.dueDate ?? '');
    }
  }, [detail]);

  if (!hasToken) {
    return <div className="empty-state">로그인 후 목표를 작성할 수 있습니다.</div>;
  }

  if (isEdit && detailQuery.isError) {
    return (
      <div className="error-state">
        {getApiErrorMessage(detailQuery.error, '목표 정보를 불러오지 못했습니다.')}
      </div>
    );
  }

  const submitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      alert('목표 제목을 입력해주세요.');
      return;
    }
    if (!unit.trim()) {
      alert('단위를 입력해주세요. (예: 장, 페이지, 회)');
      return;
    }
    const target = Number(targetValue);
    if (!Number.isFinite(target) || target < 1) {
      alert('목표치는 1 이상이어야 합니다.');
      return;
    }

    const payload = { title, description, unit, targetValue: target, dueDate };
    const mutation = isEdit ? updateMutation : createMutation;
    mutation.mutate(payload, {
      onSuccess: () => navigate(`/groups/${numericGroupId}/goals`),
      onError: (error) => alert(getApiErrorMessage(error, '목표 저장에 실패했습니다.')),
    });
  };

  return (
    <section className="todo-page todo-page--narrow">
      <div className="todo-toolbar">
        <div className="todo-title-block">
          <h1>{isEdit ? '목표 수정' : '새 스터디 목표'}</h1>
          <p>측정 가능한 목표를 세우면 진도를 추적할 수 있어요.</p>
        </div>
      </div>

      <form className="todo-form" onSubmit={handleSubmit}>
        <label className="todo-form-field">
          <span>목표 제목</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 모던 자바 인 액션 완독"
            maxLength={200}
          />
        </label>
        <label className="todo-form-field">
          <span>설명</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="목표에 대한 메모를 남겨두세요"
            rows={5}
            maxLength={1000}
          />
        </label>
        <label className="todo-form-field">
          <span>단위</span>
          <input
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            placeholder="예: 장, 페이지, 회"
            maxLength={20}
          />
        </label>
        <label className="todo-form-field">
          <span>목표치</span>
          <input
            type="number"
            min={1}
            value={targetValue}
            onChange={(event) => setTargetValue(event.target.value)}
            placeholder="예: 12"
          />
        </label>
        <label className="todo-form-field">
          <span>목표 기한</span>
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
        <div className="todo-form-actions">
          <Link to={`/groups/${numericGroupId}/goals`} className="button">
            취소
          </Link>
          <button type="submit" className="button button-primary" disabled={submitting}>
            {isEdit ? '수정' : '등록'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default GoalFormPage;
