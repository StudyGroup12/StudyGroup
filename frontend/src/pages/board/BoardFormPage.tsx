import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createBoard, fetchBoardDetail, updateBoard } from '../../api/board.api';
import { getApiErrorMessage } from '../../utils/apiError';
import './Board.css';

const BoardFormPage = () => {
  const { groupId, boardId } = useParams();
  const numericGroupId = Number(groupId);
  const numericBoardId = boardId ? Number(boardId) : undefined;
  const isEdit = numericBoardId !== undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasToken = !!sessionStorage.getItem('accessToken');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: detail } = useQuery({
    queryKey: ['board', numericGroupId, numericBoardId],
    queryFn: () => fetchBoardDetail(numericGroupId, numericBoardId as number),
    enabled: hasToken && isEdit && Number.isFinite(numericGroupId),
  });

  useEffect(() => {
    if (detail?.data) {
      setTitle(detail.data.title);
      setContent(detail.data.content);
    }
  }, [detail]);

  const saveMutation = useMutation({
    mutationFn: () =>
      isEdit
        ? updateBoard(numericGroupId, numericBoardId as number, { title, content })
        : createBoard(numericGroupId, { title, content }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['boards', numericGroupId] });
      navigate(`/groups/${numericGroupId}/boards/${response.data.id}`);
    },
    onError: (error) => {
      alert(getApiErrorMessage(error, '저장에 실패했습니다.'));
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    saveMutation.mutate();
  };

  if (!hasToken) {
    return (
      <div className="empty-state">
        로그인 후 글을 작성할 수 있습니다.
        <div className="group-form-actions">
          <Link to="/login" className="button button-primary">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="board-page">
      <div className="board-toolbar">
        <h1>{isEdit ? '게시글 수정' : '새 게시글'}</h1>
      </div>

      <form className="board-form" onSubmit={handleSubmit}>
        <label className="board-form-field">
          <span>제목</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={200}
          />
        </label>
        <label className="board-form-field">
          <span>내용</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="내용을 입력하세요"
            rows={12}
            maxLength={5000}
          />
        </label>
        <div className="board-form-actions">
          <Link
            to={isEdit ? `/groups/${numericGroupId}/boards/${numericBoardId}` : `/groups/${numericGroupId}/boards`}
            className="button"
          >
            취소
          </Link>
          <button type="submit" className="button button-primary" disabled={saveMutation.isPending}>
            {isEdit ? '수정' : '등록'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default BoardFormPage;
