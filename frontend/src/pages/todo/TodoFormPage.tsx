import { useNavigate, useParams } from 'react-router-dom';
import { useCreateTodo, useTodoDetail, useUpdateTodo } from '../../hooks/useTodos';
import { LoginRequired, TodoFormView } from './TodoShared';
import { getApiErrorMessage } from '../../utils/apiError';

const TodoFormPage = () => {
  const { groupId, todoId } = useParams();
  const numericGroupId = Number(groupId);
  const numericTodoId = todoId ? Number(todoId) : undefined;
  const isEdit = numericTodoId !== undefined;
  const hasToken = !!sessionStorage.getItem('accessToken');
  const navigate = useNavigate();

  const detailQuery = useTodoDetail(numericGroupId, numericTodoId);
  const createMutation = useCreateTodo(numericGroupId);
  const updateMutation = useUpdateTodo(numericGroupId, numericTodoId ?? 0);

  if (!hasToken) {
    return <LoginRequired message="로그인 후 할일을 작성할 수 있습니다." />;
  }

  const handleSubmit = (payload: { title: string; description: string; dueDate: string }) => {
    const mutation = isEdit ? updateMutation : createMutation;
    mutation.mutate(payload, {
      onSuccess: () => navigate(`/groups/${numericGroupId}/todos`),
      onError: (error) => alert(getApiErrorMessage(error, '할일 저장에 실패했습니다.')),
    });
  };

  return (
    <TodoFormView
      title={isEdit ? '할일 수정' : '새 할일'}
      subtitle={isEdit ? '공동 할일 내용을 다듬어보세요.' : '그룹원들과 함께할 할일을 등록하세요.'}
      cancelTo={`/groups/${numericGroupId}/todos`}
      titlePlaceholder="예: 알고리즘 문제 3개 풀기"
      descPlaceholder="필요한 메모를 남겨두세요"
      isEdit={isEdit}
      detail={detailQuery.data?.data}
      isError={detailQuery.isError}
      errorMessage={getApiErrorMessage(detailQuery.error, '할일 정보를 불러오지 못했습니다.')}
      submitting={createMutation.isPending || updateMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
};

export default TodoFormPage;
