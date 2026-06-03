import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createComment,
  deleteBoard,
  deleteComment,
  fetchBoardDetail,
  fetchComments,
  toggleBoardLike,
} from '../../api/board.api';
import { fetchGroupDetail } from '../../api/group.api';
import { useAuth } from '../../hooks/useAuth';
import './Board.css';

const BoardDetailPage = () => {
  const { groupId, boardId } = useParams();
  const numericGroupId = Number(groupId);
  const numericBoardId = Number(boardId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hasToken = !!sessionStorage.getItem('accessToken');
  const [commentInput, setCommentInput] = useState('');

  const enabled = hasToken && Number.isFinite(numericGroupId) && Number.isFinite(numericBoardId);

  const { data: boardData, isLoading, isError } = useQuery({
    queryKey: ['board', numericGroupId, numericBoardId],
    queryFn: () => fetchBoardDetail(numericGroupId, numericBoardId),
    enabled,
  });

  const { data: groupData } = useQuery({
    queryKey: ['group', numericGroupId],
    queryFn: () => fetchGroupDetail(numericGroupId),
    enabled,
  });

  const { data: commentsData } = useQuery({
    queryKey: ['comments', numericGroupId, numericBoardId],
    queryFn: () => fetchComments(numericGroupId, numericBoardId),
    enabled,
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleBoardLike(numericGroupId, numericBoardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', numericGroupId, numericBoardId] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || '좋아요 처리에 실패했습니다.');
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: () => deleteBoard(numericGroupId, numericBoardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', numericGroupId] });
      navigate(`/groups/${numericGroupId}/boards`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || '게시글 삭제에 실패했습니다.');
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: () => createComment(numericGroupId, numericBoardId, commentInput.trim()),
    onSuccess: () => {
      setCommentInput('');
      queryClient.invalidateQueries({ queryKey: ['comments', numericGroupId, numericBoardId] });
      queryClient.invalidateQueries({ queryKey: ['board', numericGroupId, numericBoardId] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || '댓글 작성에 실패했습니다.');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(numericGroupId, numericBoardId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', numericGroupId, numericBoardId] });
      queryClient.invalidateQueries({ queryKey: ['board', numericGroupId, numericBoardId] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || '댓글 삭제에 실패했습니다.');
    },
  });

  if (!hasToken) {
    return (
      <div className="empty-state">
        로그인 후 게시글을 볼 수 있습니다.
        <div className="group-form-actions">
          <Link to="/login" className="button button-primary">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="loading-state">게시글을 불러오는 중입니다.</div>;
  }

  const board = boardData?.data;
  if (isError || !board) {
    return <div className="error-state">게시글을 찾을 수 없습니다.</div>;
  }

  const comments = commentsData?.data ?? [];
  const isGroupOwner = !!user && groupData?.data?.ownerId === user.id;
  const isAuthor = !!user && board.authorId === user.id;
  const canDeleteBoard = isAuthor || isGroupOwner;

  const handleDeleteBoard = () => {
    if (window.confirm('이 게시글을 삭제할까요?')) {
      deleteBoardMutation.mutate();
    }
  };

  const handleSubmitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!commentInput.trim()) return;
    createCommentMutation.mutate();
  };

  const handleDeleteComment = (commentId: number) => {
    if (window.confirm('댓글을 삭제할까요?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  return (
    <section className="board-page">
      <div className="board-detail-header">
        <h1>{board.title}</h1>
        <div className="board-detail-meta">
          <span>{board.authorNickname}</span>
          <span>{new Date(board.createdAt).toLocaleString()}</span>
        </div>
        <div className="board-detail-actions">
          <Link to={`/groups/${numericGroupId}/boards`} className="button">
            목록
          </Link>
          {isAuthor && (
            <Link to={`/groups/${numericGroupId}/boards/${numericBoardId}/edit`} className="button button-primary">
              수정
            </Link>
          )}
          {canDeleteBoard && (
            <button
              type="button"
              className="button button-danger"
              onClick={handleDeleteBoard}
              disabled={deleteBoardMutation.isPending}
            >
              삭제
            </button>
          )}
        </div>
      </div>

      <article className="board-content">{board.content}</article>

      <div className="board-like-bar">
        <button
          type="button"
          className={`like-button ${board.likedByMe ? 'liked' : ''}`}
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending}
        >
          ♥ 좋아요 {board.likeCount}
        </button>
      </div>

      <section className="comment-section">
        <h2>댓글 {comments.length}</h2>

        <form className="comment-form" onSubmit={handleSubmitComment}>
          <input
            value={commentInput}
            onChange={(event) => setCommentInput(event.target.value)}
            placeholder="댓글을 입력하세요"
            maxLength={1000}
          />
          <button type="submit" className="button button-primary" disabled={createCommentMutation.isPending}>
            등록
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="empty-msg">첫 댓글을 남겨보세요.</p>
        ) : (
          <ul className="comment-list">
            {comments.map((comment) => {
              const canDeleteComment = (!!user && comment.authorId === user.id) || isGroupOwner;
              return (
                <li key={comment.id} className="comment-item">
                  <div className="comment-body">
                    <span className="comment-author">{comment.authorNickname}</span>
                    <p className="comment-text">{comment.content}</p>
                    <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  {canDeleteComment && (
                    <button
                      type="button"
                      className="comment-delete-btn"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      삭제
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </section>
  );
};

export default BoardDetailPage;
