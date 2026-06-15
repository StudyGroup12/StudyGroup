import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreatePersonalTodo,
  usePersonalTodoDetail,
  useUpdatePersonalTodo,
} from '../../hooks/useTodos';
import { LoginRequired, TodoFormView } from './TodoShared';
import { getApiErrorMessage } from '../../utils/apiError';

const PersonalTodoFormPage = () => {
  const { todoId } = useParams();
  const numericTodoId = todoId ? Number(todoId) : undefined;
  const isEdit = numericTodoId !== undefined;
  const hasToken = !!sessionStorage.getItem('accessToken');
  const navigate = useNavigate();

  const detailQuery = usePersonalTodoDetail(numericTodoId);
  const createMutation = useCreatePersonalTodo();
  const updateMutation = useUpdatePersonalTodo(numericTodoId ?? 0);

  if (!hasToken) {
    return <LoginRequired message="로그인 후 내 할일을 작성할 수 있습니다." />;
  }

  const handleSubmit = (payload: { title: string; description: string; dueDate: string }) => {
    const mutation = isEdit ? updateMutation : createMutation;
    mutation.mutate(payload, {
      onSuccess: () => navigate('/todos'),
      onError: (error) => alert(getApiErrorMessage(error, '할일 저장에 실패했습니다.')),
    });
  };

  return (
    <TodoFormView
      title={isEdit ? '내 할일 수정' : '새 내 할일'}
      subtitle={isEdit ? '개인 체크리스트 내용을 다듬어보세요.' : '개인적으로 챙길 일을 적어두세요.'}
      cancelTo="/todos"
      titlePlaceholder="예: 오늘 복습할 내용 정리하기"
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

export default PersonalTodoFormPage;
