import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { fetchGroupDetail } from '../../api/group.api';
import { useAuth } from '../../hooks/useAuth';
import {
  useDeleteGoal,
  useGoalList,
  useUpdateGoalProgress,
} from '../../hooks/useGoals';
import { getApiErrorMessage } from '../../utils/apiError';
import { Goal } from '../../types/goal.types';
import './../stats/dashboard.css';

const GoalListPage = () => {
  const { groupId } = useParams();
  const numericGroupId = Number(groupId);
  const { user } = useAuth();
  const hasToken = !!sessionStorage.getItem('accessToken');
  const [page, setPage] = useState(0);

  const goalQuery = useGoalList(numericGroupId, page);
  const groupQuery = useQuery({
    queryKey: ['group', numericGroupId],
    queryFn: () => fetchGroupDetail(numericGroupId),
    enabled: hasToken && Number.isFinite(numericGroupId),
  });
  const progressMutation = useUpdateGoalProgress(numericGroupId);
  const deleteMutation = useDeleteGoal(numericGroupId);

  if (!hasToken) {
    return <div className="study-empty">로그인 후 스터디 목표를 이용할 수 있습니다.</div>;
  }

  const ownerId = groupQuery.data?.data.ownerId;
  const pageData = goalQuery.data?.data;
  const goals = pageData?.content ?? [];

  const canManage = (goal: Goal) =>
    !!user && (user.id === goal.creatorId || user.id === ownerId);

  const handleProgress = (goal: Goal, delta: number) => {
    const next = Math.max(0, Math.min(goal.currentValue + delta, goal.targetValue));
    if (next === goal.currentValue) return;
    progressMutation.mutate(
      { goalId: goal.id, currentValue: next },
      { onError: (error) => alert(getApiErrorMessage(error, '진도 갱신에 실패했습니다.')) }
    );
  };

  const handleDelete = (goalId: number) => {
    if (!window.confirm('이 목표를 삭제할까요?')) return;
    deleteMutation.mutate(goalId, {
      onError: (error) => alert(getApiErrorMessage(error, '목표 삭제에 실패했습니다.')),
    });
  };

  return (
    <section className="study-page">
      <div className="study-page-header">
        <div>
          <h1>스터디 목표</h1>
          <p>측정 가능한 목표를 세우고 진도를 함께 채워가세요.</p>
        </div>
        <div className="study-page-actions">
          <Link to={`/groups/${numericGroupId}`} className="button">
            그룹으로
          </Link>
          <Link to={`/groups/${numericGroupId}/stats`} className="button">
            학습 통계
          </Link>
          <Link to={`/groups/${numericGroupId}/goals/new`} className="button button-primary">
            목표 추가
          </Link>
        </div>
      </div>

      {goalQuery.isLoading && <div className="study-empty">목표를 불러오는 중입니다.</div>}
      {goalQuery.isError && (
        <div className="study-empty">
          {getApiErrorMessage(goalQuery.error, '목표를 불러오지 못했습니다.')}
        </div>
      )}

      {!goalQuery.isLoading && !goalQuery.isError && goals.length === 0 && (
        <div className="study-empty">아직 등록된 목표가 없습니다.</div>
      )}

      {goals.length > 0 && (
        <div className="goal-list">
          {goals.map((goal) => (
            <div key={goal.id} className={`goal-card${goal.completed ? ' completed' : ''}`}>
              <div className="goal-card-head">
                <h3>{goal.title}</h3>
                <span className={`goal-badge${goal.completed ? ' done' : ''}`}>
                  {goal.completed ? '달성 완료' : `${goal.progressRate}%`}
                </span>
              </div>
              {goal.description && <p className="goal-card-desc">{goal.description}</p>}

              <div className="goal-progress-row">
                <div className="progress-bar">
                  <div
                    className={`progress-bar-fill${goal.completed ? ' done' : ''}`}
                    style={{ width: `${goal.progressRate}%` }}
                  />
                </div>
                <span className="goal-progress-text">
                  {goal.currentValue} / {goal.targetValue}
                  {goal.unit}
                </span>
              </div>

              <div className="goal-card-foot">
                <div className="goal-stepper">
                  <button
                    type="button"
                    className="button"
                    onClick={() => handleProgress(goal, -1)}
                    disabled={progressMutation.isPending || goal.currentValue <= 0}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={() => handleProgress(goal, 1)}
                    disabled={progressMutation.isPending || goal.currentValue >= goal.targetValue}
                  >
                    +
                  </button>
                  {goal.dueDate && (
                    <span className="goal-due">
                      기한 {new Date(goal.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {canManage(goal) && (
                  <div className="goal-stepper">
                    <Link to={`/groups/${numericGroupId}/goals/${goal.id}/edit`} className="button">
                      수정
                    </Link>
                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => handleDelete(goal.id)}
                      disabled={deleteMutation.isPending}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pageData && pageData.totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="button"
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            disabled={pageData.first}
          >
            이전
          </button>
          <span>
            {pageData.number + 1} / {pageData.totalPages}
          </span>
          <button
            type="button"
            className="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={pageData.last}
          >
            다음
          </button>
        </div>
      )}
    </section>
  );
};

export default GoalListPage;
