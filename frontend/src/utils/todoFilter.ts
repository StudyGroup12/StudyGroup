export type TodoFilter = 'all' | 'active' | 'completed';

/** 필터 값을 API의 completed 쿼리 파라미터(boolean | undefined)로 변환한다. */
export const toCompletedParam = (filter: TodoFilter): boolean | undefined => {
  if (filter === 'active') return false;
  if (filter === 'completed') return true;
  return undefined;
};
