import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const MOCK_EVENTS: Event[] = [
    {
      id: '1',
      title: '이벤트 2', // title에 포함
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-07-21',
      startTime: '12:30',
      endTime: '13:30',
      description: '동료와 점심 식사 이벤트 2', // description에 포함
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '3',
      title: '운동',
      date: '2025-07-22',
      startTime: '18:00',
      endTime: '19:00',
      description: '',
      location: '헬스장 이벤트 2', // location에 포함
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '4',
      title: '회의',
      date: '2025-07-23',
      startTime: '10:00',
      endTime: '11:00',
      description: '정기 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '5',
      title: '회의',
      date: '2025-09-21',
      startTime: '10:00',
      endTime: '11:00',
      description: '정기 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  /** searchEvent를 테스트하고 이부분 없애는 게 나을 수도 있을 것 같음 */
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const filtered = getFilteredEvents(MOCK_EVENTS, '이벤트 2', new Date(2025, 6, 1), 'month');

    expect(filtered).toEqual([MOCK_EVENTS[0], MOCK_EVENTS[1], MOCK_EVENTS[2]]);
  });

  /** filterEventsByDateRangeAtWeek를 테스트하고 이부분 없애는 게 나을 수도 있을 것 같음 */
  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const filtered = getFilteredEvents(MOCK_EVENTS, '', new Date(2025, 6, 1), 'week');
    expect(filtered).toEqual([MOCK_EVENTS[0]]);
  });

  /** filterEventsByDateRangeAtMonth를 테스트하고 이부분 없애는 게 나을 수도 있을 것 같음 */
  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const filtered = getFilteredEvents(MOCK_EVENTS, '', new Date(2025, 6, 1), 'month');
    expect(filtered).toEqual([MOCK_EVENTS[0], MOCK_EVENTS[1], MOCK_EVENTS[2], MOCK_EVENTS[3]]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const filtered = getFilteredEvents(MOCK_EVENTS, '이벤트', new Date(2025, 6, 1), 'week');
    expect(filtered).toEqual([MOCK_EVENTS[0]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const filtered = getFilteredEvents(MOCK_EVENTS, '', new Date(2025, 6, 1), 'month');
    expect(filtered).toEqual([MOCK_EVENTS[0], MOCK_EVENTS[1], MOCK_EVENTS[2], MOCK_EVENTS[3]]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filtered = getFilteredEvents(
      MOCK_EVENTS,
      '이벤트 2'.toUpperCase(),
      new Date(2025, 6, 1),
      'month'
    );
    // 공백/대소문자 무시 가정
    expect(filtered).toEqual([MOCK_EVENTS[0], MOCK_EVENTS[1], MOCK_EVENTS[2]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const filtered = getFilteredEvents(MOCK_EVENTS, '', new Date(2025, 8, 1), 'month'); // 9월
    expect(filtered).toEqual([MOCK_EVENTS[4]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filtered = getFilteredEvents([], '이벤트 2', new Date(2025, 6, 1), 'month');
    expect(filtered).toEqual([]);
  });
});
