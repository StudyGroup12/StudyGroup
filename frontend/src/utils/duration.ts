/** 분 단위를 "N시간 M분" 형태로 표현 */
export const formatMinutes = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0분';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
};

/** 초 단위를 "HH:MM:SS" 형태로 표현 (실시간 타이머용) */
export const formatStopwatch = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
};
