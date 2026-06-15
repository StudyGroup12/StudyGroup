import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { fetchGroupDetail } from '../../api/group.api';
import { useAuth } from '../../hooks/useAuth';
import {
  useDeleteTodo,
  useTodoList,
  useTodoProgress,
  useUpdateTodoComplete,
} from '../../hooks/useTodos';
import { LoginRequired, TodoFilter, TodoItem, TodoListView } from './TodoShared';
import { toCompletedParam } from '../../utils/todoFilter';
import { getApiErrorMessage } from '../../utils/apiError';

const TodoListPage = () => {
  const { groupId } = useParams();
  const numericGroupId = Number(groupId);
  const { user } = useAuth();
  const hasToken = !!sessionStorage.getItem('accessToken');
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<TodoFilter>('all');

  const todoQuery = useTodoList(numericGroupId, page, toCompletedParam(filter));
  const progressQuery = useTodoProgress(numericGroupId);
  const groupQuery = useQuery({
    queryKey: ['group', numericGroupId],
    queryFn: () => fetchGroupDetail(numericGroupId),
    enabled: hasToken && Number.isFinite(numericGroupId),
  });
  const completeMutation = useUpdateTodoComplete(numericGroupId);
  const deleteMutation = useDeleteTodo(numericGroupId);

  const pageData = todoQuery.data?.data;
  const progress = progressQuery.data?.data ?? { totalCount: 0, completedCount: 0, progressRate: 0 };

  const handleFilterChange = (nextFilter: TodoFilter) => {
    setFilter(nextFilter);
    setPage(0);
  };

  const handleToggle = (todoId: number, completed: boolean) => {
    completeMutation.mutate(
      { todoId, completed },
      { onError: (error) => alert(getApiErrorMessage(error, '완료 상태 변경에 실패했습니다.')) }
    );
  };

  const handleDelete = (todoId: number) => {
    if (!window.confirm('이 할일을 삭제할까요?')) return;
    deleteMutation.mutate(todoId, {
      onError: (error) => alert(getApiErrorMessage(error, '할일 삭제에 실패했습니다.')),
    });
  };

  if (!hasToken) {
    return <LoginRequired message="로그인 후 할일을 이용할 수 있습니다." />;
  }

  const ownerId = groupQuery.data?.data.ownerId;
  const renderActions = (todo: TodoItem) => {
    if (!user || (user.id !== todo.memberId && user.id !== ownerId)) return null;
    return (
      <div className="todo-row-actions">
        <Link to={`/groups/${numericGroupId}/todos/${todo.id}/edit`} className="button">
          수정
        </Link>
        <button
          type="button"
          className="button button-danger"
          onClick={() => handleDelete(todo.id)}
          disabled={deleteMutation.isPending}
        >
          삭제
        </button>
      </div>
    );
  };

  return (
    <TodoListView
      title="공동 할일"
      subtitle="그룹원들과 함께 진행할 할일을 관리하세요."
      actions={
        <>
          <Link to={`/groups/${numericGroupId}`} className="button">
            그룹으로
          </Link>
          <Link to={`/groups/${numericGroupId}/todos/new`} className="button button-primary">
            할일 추가
          </Link>
        </>
      }
      progressLabel="그룹 진행률"
      progress={progress}
      filter={filter}
      onFilterChange={handleFilterChange}
      isLoading={todoQuery.isLoading}
      isError={todoQuery.isError}
      errorMessage={getApiErrorMessage(todoQuery.error, '할일 목록을 불러오지 못했습니다.')}
      emptyText="아직 등록된 할일이 없습니다."
      todos={todoQuery.data?.data.content ?? []}
      pageData={pageData}
      onPageChange={setPage}
      togglePending={completeMutation.isPending}
      onToggle={handleToggle}
      renderActions={renderActions}
    />
  );
};

export default TodoListPage;
