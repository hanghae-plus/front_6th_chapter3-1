// easy.dateUtils.spec.ts
export const pad = (n: number) => n.toString().padStart(2, '0');
export const formatDateToStr = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const formatDateList = (dates: Date[]) => dates.map(formatDateToStr);
