import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useDeletePersonalTodo,
  usePersonalTodoList,
  usePersonalTodoProgress,
  useUpdatePersonalTodoComplete,
} from '../../hooks/useTodos';
import { LoginRequired, TodoFilter, TodoItem, TodoListView } from './TodoShared';
import { toCompletedParam } from '../../utils/todoFilter';
import { getApiErrorMessage } from '../../utils/apiError';

const PersonalTodoListPage = () => {
  const hasToken = !!sessionStorage.getItem('accessToken');
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<TodoFilter>('all');

  const todoQuery = usePersonalTodoList(page, toCompletedParam(filter));
  const progressQuery = usePersonalTodoProgress();
  const completeMutation = useUpdatePersonalTodoComplete();
  const deleteMutation = useDeletePersonalTodo();

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
    return <LoginRequired message="로그인 후 내 할일을 이용할 수 있습니다." />;
  }

  const renderActions = (todo: TodoItem) => (
    <div className="todo-row-actions">
      <Link to={`/todos/${todo.id}/edit`} className="button">
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

  return (
    <TodoListView
      title="내 할일"
      subtitle="개인 체크리스트를 따로 관리하세요."
      actions={
        <>
          <Link to="/groups" className="button">
            스터디 그룹
          </Link>
          <Link to="/todos/new" className="button button-primary">
            할일 추가
          </Link>
        </>
      }
      progressLabel="내 진행률"
      progress={progress}
      filter={filter}
      onFilterChange={handleFilterChange}
      isLoading={todoQuery.isLoading}
      isError={todoQuery.isError}
      errorMessage={getApiErrorMessage(todoQuery.error, '할일 목록을 불러오지 못했습니다.')}
      emptyText="아직 등록된 개인 할일이 없습니다."
      todos={todoQuery.data?.data.content ?? []}
      pageData={todoQuery.data?.data}
      onPageChange={setPage}
      togglePending={completeMutation.isPending}
      onToggle={handleToggle}
      renderActions={renderActions}
    />
  );
};

export default PersonalTodoListPage;
