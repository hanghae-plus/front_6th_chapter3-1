import { Event } from '../types';

/**
 * 주어진 년도와 월의 일수를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 주어진 날짜가 속한 주의 모든 날짜를 반환합니다.
 * @description 인자로 받아온 날짜의 불변성을 보장하기 위해 복사본을 생성합니다.
 */
export function getWeekDates(date: Date): Date[] {
  const copiedDate = new Date(date);

  const day = copiedDate.getDay();
  const diff = copiedDate.getDate() - day;
  const sunday = new Date(copiedDate.setDate(diff));
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(copiedDate);
    nextDate.setDate(sunday.getDate() + i);
    weekDates.push(nextDate);
  }
  return weekDates;
}

/**
 * 주어진 날짜가 속한 월의 주별 날짜 배열을 생성합니다.
 * 각 주는 7개 요소의 배열이며, 해당 월에 속하지 않는 날짜는 null로 표시됩니다.
 *
 * @param currentDate - 대상 월을 나타내는 날짜
 * @returns 월의 주별 날짜 배열. 각 주는 [일, 월, 화, 수, 목, 금, 토] 순서의 배열
 *
 * @example
 * const weeks = getWeeksAtMonth(new Date('2025-07-01'));
 * // 결과: [[null, null, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11, 12], ...]
 */
export function getWeeksAtMonth(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];

  const initWeek = () => Array(7).fill(null);

  let week: Array<number | null> = initWeek();

  for (let i = 0; i < firstDayOfMonth; i++) {
    week[i] = null;
  }

  for (const day of days) {
    const dayIndex = (firstDayOfMonth + day - 1) % 7;
    week[dayIndex] = day;
    if (dayIndex === 6 || day === daysInMonth) {
      weeks.push(week);
      week = initWeek();
    }
  }

  return weeks;
}

/**
 * 특정 일자에 해당하는 이벤트들을 필터링하여 반환합니다.
 *
 * @param events - 전체 이벤트 배열
 * @param date - 필터링할 일자 (1-31)
 * @returns 해당 일자에 해당하는 이벤트 배열
 *
 * @example
 * const dayEvents = getEventsForDay(events, 15);
 * // 15일에 해당하는 모든 이벤트 반환
 */
export function getEventsForDay(events: Readonly<Event[]>, date: number): Readonly<Event[]> {
  return events.filter((event) => new Date(event.date).getDate() === date);
}

/**
 * 주어진 날짜가 속한 "월 기준 주차"를 문자열로 반환합니다.
 *
 * 동작 개요:
 * - 한 주의 기준일을 목요일로 간주합니다. 이는 ISO-8601의 아이디어(주차 귀속을 목요일로 판단)를 차용한 것으로,
 *   월의 경계(월초/월말)에서 주차를 일관되게 계산하기 위함입니다.
 * - 해당 주의 목요일(`thursday`)을 구한 뒤, 그 목요일이 속한 달의 첫 번째 목요일(`firstThursday`)로부터
 *   몇 주가 지났는지를 계산해 주차를 산출합니다.
 * - 반환 형식: "YYYY년 M월 N주".
 *
 * 매개변수:
 * - targetDate: 주차를 계산할 기준 날짜
 *
 * 반환값:
 * - "YYYY년 M월 N주" 형식의 문자열
 *
 * 예시:
 * - formatWeek(new Date('2025-08-15')) => "2025년 8월 2주"
 */
/**
 * 주어진 날짜가 속한 주의 정보를 "YYYY년 M월 N주" 형식으로 반환합니다.
 * 주차 계산은 해당 월의 첫 번째 목요일을 기준으로 합니다.
 *
 * @param targetDate - 주차를 계산할 날짜
 * @returns "YYYY년 M월 N주" 형식의 문자열
 *
 * @example
 * const weekInfo = formatWeek(new Date('2025-08-15'));
 * // 결과: "2025년 8월 2주"
 */
export function formatWeek(targetDate: Date) {
  const copiedTargetDate = new Date(targetDate);

  const dayOfWeek = copiedTargetDate.getDay();
  const diffToThursday = 4 - dayOfWeek;

  const thursday = new Date(copiedTargetDate);
  thursday.setDate(copiedTargetDate.getDate() + diffToThursday);

  const year = copiedTargetDate.getFullYear();
  const month = copiedTargetDate.getMonth() + 1;

  const firstDayOfMonth = new Date(year, month - 1, 1);

  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));

  const weekNumber = Math.max(
    1,
    Math.floor((thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
  );

  return `${year}년 ${month}월 ${weekNumber}주`;
}

/**
 * 주어진 날짜의 월 정보를 "YYYY년 M월" 형식으로 반환합니다.
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}

/**
 * 날짜에서 시간 정보를 제거하여 날짜만 남긴 새로운 Date 객체를 반환합니다.
 *
 * @param d - 시간을 제거할 Date 객체
 * @returns 시간이 00:00:00으로 설정된 새로운 Date 객체
 */
const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * 주어진 날짜가 특정 범위 내에 있는지 확인합니다.
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  const normalizedDate = stripTime(date);
  const normalizedStart = stripTime(rangeStart);
  const normalizedEnd = stripTime(rangeEnd);

  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}

/**
 * 숫자를 지정된 자릿수만큼 0으로 패딩하여 문자열로 반환합니다.
 *
 * @param value - 패딩할 숫자
 * @param size - 총 자릿수 (기본값: 2)
 * @returns 0으로 패딩된 문자열
 *
 * @example
 * fillZero(5) // "05"
 * fillZero(3, 3) // "003"
 * fillZero(100) // "100" (원래 값이 지정된 자릿수보다 클 때)
 */
export function fillZero(value: number, size = 2) {
  return String(value).padStart(size, '0');
}

/**
 * 날짜를 문자열(YYYY-MM-DD)로 포맷팅합니다.
 *
 * - 월과 일은 `fillZero`를 사용해 2자리로 0 패딩합니다.
 * - `day`가 제공되면 `currentDate`의 일자를 무시하고 해당 일자로 대체합니다.
 * - `day`가 제공되지 않으면 `currentDate`의 일자를 사용합니다.
 *
 * @param currentDate 포맷팅의 기준이 되는 날짜
 * @param day 선택적 일자(1~31). 제공 시 결과의 일자를 이 값으로 사용
 * @returns "YYYY-MM-DD" 형식의 날짜 문자열
 *
 * @example
 * formatDate(new Date('2025-07-09')) // "2025-07-09"
 * formatDate(new Date('2025-07-09'), 1) // "2025-07-01"
 */
/**
 * Date 객체를 "YYYY-MM-DD" 형식의 문자열로 변환합니다.
 *
 * @param currentDate - 포맷할 날짜
 * @param day - 특정 일자를 지정할 경우 (선택적)
 * @returns "YYYY-MM-DD" 형식의 날짜 문자열
 *
 * @example
 * formatDate(new Date('2025-08-15')) // "2025-08-15"
 * formatDate(new Date('2025-08-15'), 10) // "2025-08-10"
 */
export function formatDate(currentDate: Date, day?: number) {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
}

/**
 * 날짜를 오름차순으로 정렬합니다.
 * @param dates 정렬할 날짜 배열
 * @returns 정렬된 날짜 배열
 */
export function sortByDate(dates: Date[]) {
  return dates.sort((a, b) => a.getTime() - b.getTime());
}
