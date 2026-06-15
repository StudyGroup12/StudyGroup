/** axios 등에서 던진 에러 객체에서 서버 에러 메시지를 안전하게 추출한다. */
export const getApiErrorMessage = (error: unknown, fallback: string): string =>
  (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
    ?.message ?? fallback;
