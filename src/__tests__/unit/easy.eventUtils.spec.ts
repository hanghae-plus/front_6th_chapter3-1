import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const events: Event[] = [
  {
    id: '1',
    title: '이벤트 a',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 이벤트 1',
    location: '장소 1',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '이벤트 b',
    date: '2025-07-02',
    startTime: '11:00',
    endTime: '12:00',
    description: '테스트 이벤트 2',
    location: '장소 2',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  },
  {
    id: '3',
    title: '다른 일정',
    date: '2025-07-03',
    startTime: '13:00',
    endTime: '14:00',
    description: '테스트3',
    location: '장소 3',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '4',
    title: '다른 일정ㅋㅋㅋㅋㅋ',
    date: '2025-08-31',
    startTime: '13:00',
    endTime: '14:00',
    description: '테스트',
    location: '장소 3',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 b'에 맞는 이벤트만 반환한다", () => {
    const searchTerm = '이벤트 b';
    const currentDate = new Date('2025-07-01');
    const view: 'week' | 'month' = 'month';

    const result = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 b');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const currentDate = new Date('2025-07-01');

    const result = getFilteredEvents(events, '', currentDate, 'week');

    expect(result).toHaveLength(3);
    expect(result.map((e) => e.title)).toEqual(
      expect.arrayContaining(['이벤트 a', '이벤트 b', '다른 일정'])
    );
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07-01');

    const result = getFilteredEvents(events, '', currentDate, 'week');

    expect(result).toHaveLength(3);
    expect(result.map((e) => e.title)).toEqual(
      expect.arrayContaining(['이벤트 a', '이벤트 b', '다른 일정'])
    );
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const searchTerm = '이벤트';
    const currentDate = new Date('2025-07-01');
    const view = 'week';

    const result = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(result).toHaveLength(2);
    expect(result.map((e) => e.title)).toEqual(expect.arrayContaining(['이벤트 a', '이벤트 b']));
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'week';

    const result = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(result).toHaveLength(3);
    expect(result.map((e) => e.title)).toEqual(
      expect.arrayContaining(['이벤트 a', '이벤트 b', '다른 일정'])
    );
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const searchTerm = 'B';
    const currentDate = new Date('2025-07-01');
    const view = 'week';

    const result = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(result).toHaveLength(1);
    expect(result.map((e) => e.title)).toEqual(expect.arrayContaining(['이벤트 b']));
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'month';

    const result = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(result).toHaveLength(3);

    expect(result.map((e) => e.title)).not.toEqual(expect.arrayContaining(['다른 일정ㅋㅋㅋㅋㅋ']));
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'week';

    const result = getFilteredEvents([], searchTerm, currentDate, view);

    expect(result).toHaveLength(0);
  });
});
