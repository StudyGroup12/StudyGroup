import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TodoFormData, TodoProgress } from '../../types/todo.types';
import { TodoFilter } from '../../utils/todoFilter';
import './Todo.css';

export type { TodoFilter };

/** 목록/폼에서 공통으로 쓰는 todo 형태 (Todo · PersonalTodo 모두 충족) */
export interface TodoItem {
  id: number;
  memberId: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

interface PageInfo {
  number: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/** 로그인 안내 화면 */
export const LoginRequired = ({ message }: { message: string }) => (
  <div className="empty-state">
    {message}
    <div className="group-form-actions">
      <Link to="/login" className="button button-primary">
        로그인
      </Link>
    </div>
  </div>
);

const FILTERS: { value: TodoFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '미완료' },
  { value: 'completed', label: '완료' },
];

interface TodoListViewProps {
  title: string;
  subtitle: string;
  actions: ReactNode;
  progressLabel: string;
  progress: TodoProgress;
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  emptyText: string;
  todos: TodoItem[];
  pageData?: PageInfo;
  onPageChange: (updater: (current: number) => number) => void;
  togglePending: boolean;
  onToggle: (todoId: number, completed: boolean) => void;
  renderActions: (todo: TodoItem) => ReactNode;
}

export const TodoListView = ({
  title,
  subtitle,
  actions,
  progressLabel,
  progress,
  filter,
  onFilterChange,
  isLoading,
  isError,
  errorMessage,
  emptyText,
  todos,
  pageData,
  onPageChange,
  togglePending,
  onToggle,
  renderActions,
}: TodoListViewProps) => {
  const remainingCount = Math.max(progress.totalCount - progress.completedCount, 0);

  return (
    <section className="todo-page">
      <div className="todo-toolbar">
        <div className="todo-title-block">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="todo-toolbar-actions">{actions}</div>
      </div>

      <div className="todo-progress-card">
        <div>
          <span className="todo-progress-label">{progressLabel}</span>
          <strong>{progress.progressRate}%</strong>
          <p>
            완료 {progress.completedCount}개 · 남은 할일 {remainingCount}개
          </p>
        </div>
        <div className="todo-progress-track" aria-label={`진행률 ${progress.progressRate}%`}>
          <span style={{ width: `${progress.progressRate}%` }} />
        </div>
      </div>

      <div className="todo-filter-row">
        <div className="todo-filter-toggle">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={filter === value ? 'active' : ''}
              onClick={() => onFilterChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="loading-state">할일을 불러오는 중입니다.</div>}
      {isError && <div className="error-state">{errorMessage}</div>}

      {!isLoading && !isError && todos.length === 0 && (
        <div className="empty-state">{emptyText}</div>
      )}

      {!isLoading && !isError && todos.length > 0 && (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={`todo-row${todo.completed ? ' is-completed' : ''}`}>
              <label className="todo-check">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  disabled={togglePending}
                  onChange={(event) => onToggle(todo.id, event.target.checked)}
                />
                <span />
              </label>
              <div className="todo-row-content">
                <h2>{todo.title}</h2>
                {todo.description && <p>{todo.description}</p>}
                <div className="todo-row-meta">
                  {todo.dueDate && <span>마감일 {new Date(todo.dueDate).toLocaleDateString()}</span>}
                  <span>{todo.completed ? '완료' : '진행 중'}</span>
                  <span>등록일 {new Date(todo.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {renderActions(todo)}
            </li>
          ))}
        </ul>
      )}

      {pageData && pageData.totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="button"
            onClick={() => onPageChange((current) => Math.max(current - 1, 0))}
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
            onClick={() => onPageChange((current) => current + 1)}
            disabled={pageData.last}
          >
            다음
          </button>
        </div>
      )}
    </section>
  );
};

interface TodoFormViewProps {
  title: string;
  subtitle: string;
  cancelTo: string;
  titlePlaceholder: string;
  descPlaceholder: string;
  isEdit: boolean;
  detail?: { title: string; description: string | null; dueDate: string | null };
  isError: boolean;
  errorMessage: string;
  submitting: boolean;
  onSubmit: (payload: TodoFormData) => void;
}

export const TodoFormView = ({
  title,
  subtitle,
  cancelTo,
  titlePlaceholder,
  descPlaceholder,
  isEdit,
  detail,
  isError,
  errorMessage,
  submitting,
  onSubmit,
}: TodoFormViewProps) => {
  const [todoTitle, setTodoTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (detail) {
      setTodoTitle(detail.title);
      setDescription(detail.description ?? '');
      setDueDate(detail.dueDate ?? '');
    }
  }, [detail]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!todoTitle.trim()) {
      alert('할일 제목을 입력해주세요.');
      return;
    }
    onSubmit({ title: todoTitle, description, dueDate });
  };

  if (isEdit && isError) {
    return <div className="error-state">{errorMessage}</div>;
  }

  return (
    <section className="todo-page todo-page--narrow">
      <div className="todo-toolbar">
        <div className="todo-title-block">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <form className="todo-form" onSubmit={handleSubmit}>
        <label className="todo-form-field">
          <span>제목</span>
          <input
            value={todoTitle}
            onChange={(event) => setTodoTitle(event.target.value)}
            placeholder={titlePlaceholder}
            maxLength={200}
          />
        </label>
        <label className="todo-form-field">
          <span>설명</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={descPlaceholder}
            rows={8}
            maxLength={2000}
          />
        </label>
        <label className="todo-form-field">
          <span>마감일</span>
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
        <div className="todo-form-actions">
          <Link to={cancelTo} className="button">
            취소
          </Link>
          <button
            type="submit"
            className="button button-primary"
            disabled={submitting}
          >
            {isEdit ? '수정' : '등록'}
          </button>
        </div>
      </form>
    </section>
  );
};
