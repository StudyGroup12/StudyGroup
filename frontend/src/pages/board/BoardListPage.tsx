import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { fetchBoards } from '../../api/board.api';
import { useAuth } from '../../hooks/useAuth';
import './Board.css';

const PAGE_SIZE = 10;

const BoardListPage = () => {
  const { groupId } = useParams();
  const numericGroupId = Number(groupId);
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const hasToken = !!sessionStorage.getItem('accessToken');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['boards', numericGroupId, page],
    queryFn: () => fetchBoards(numericGroupId, { page, size: PAGE_SIZE }),
    enabled: hasToken && Number.isFinite(numericGroupId),
  });

  const boards = data?.data.content ?? [];
  const pageData = data?.data;

  if (!hasToken) {
    return (
      <div className="empty-state">
        로그인 후 게시판을 이용할 수 있습니다.
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
        <div className="board-title-block">
          <h1>게시판</h1>
          <p>그룹원들과 자유롭게 글을 나눠보세요.</p>
        </div>
        <div className="board-toolbar-actions">
          <Link to={`/groups/${numericGroupId}`} className="button">
            그룹으로
          </Link>
          {user && (
            <Link to={`/groups/${numericGroupId}/boards/new`} className="button button-primary">
              글쓰기
            </Link>
          )}
        </div>
      </div>

      {isLoading && <div className="loading-state">게시글을 불러오는 중입니다.</div>}
      {isError && <div className="error-state">게시글 목록을 불러오지 못했습니다. 그룹 멤버만 접근할 수 있습니다.</div>}

      {!isLoading && !isError && boards.length === 0 && (
        <div className="empty-state">아직 작성된 게시글이 없습니다.</div>
      )}

      {!isLoading && !isError && boards.length > 0 && (
        <ul className="board-list">
          {boards.map((board) => (
            <li key={board.id} className="board-row">
              <Link to={`/groups/${numericGroupId}/boards/${board.id}`} className="board-row-link">
                <h2 className="board-row-title">{board.title}</h2>
                <div className="board-row-meta">
                  <span>{board.authorNickname}</span>
                  <span>♥ {board.likeCount}</span>
                  <span>💬 {board.commentCount}</span>
                  <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
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

export default BoardListPage;
