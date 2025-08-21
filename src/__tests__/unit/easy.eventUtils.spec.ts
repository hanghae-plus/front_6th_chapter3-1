import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const currentDate = new Date(2025, 9, 12); // 2025-10-12
    const containedEvents = [
      { title: '이벤트 1', description: '이벤트 2', location: '', date: '2025-10-15' } as Event,
      {
        title: '이벤트 2',
        description: '이벤트 3',
        location: '선릉역',
        date: '2025-10-15',
      } as Event,
      { title: '이벤트 3', description: '', location: '이벤트 23', date: '2025-10-15' } as Event,
    ];

    const notContainedEvents = [
      { title: '이벤트 3', description: '이벤트 6', location: '집', date: '2025-10-15' } as Event,
    ];

    const searchView = 'month';
    const filteredEvents = getFilteredEvents(
      [...containedEvents, ...notContainedEvents],
      '이벤트 2',
      currentDate,
      searchView
    );

    expect(filteredEvents).toHaveLength(3);
    expect(filteredEvents).toMatchObject([
      { description: '이벤트 2' },
      { title: '이벤트 2' },
      { location: '이벤트 23' },
    ]);
  });

  it('2025-07-01에 대하여 주간 뷰에서 7월 첫째주의 이벤트만 반환한다', () => {
    const date = new Date(2025, 6, 1); // 2025-07-01
    const weekDay = [
      { title: '', description: '', location: '', date: '2025-06-30' } as Event,
      { title: '', description: '', location: '', date: '2025-07-02' } as Event,
    ];

    const notWeekDay = [{ title: '', description: '', location: '', date: '2025-10-15' } as Event];

    const searchView = 'week';
    const filteredEvents = getFilteredEvents([...weekDay, ...notWeekDay], '', date, searchView);

    expect(filteredEvents).toHaveLength(2);
    expect(filteredEvents).toMatchObject([{ date: '2025-06-30' }, { date: '2025-07-02' }]);
  });

  it('2025-07-01에 대하여 월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const date = new Date(2025, 6, 1); // 2025-07-01
    const monthDay = [
      { title: '', description: '', location: '', date: '2025-07-10' } as Event,
      { title: '', description: '', location: '', date: '2025-07-20' } as Event,
    ];

    const notMonthDay = [
      { title: '', description: '', location: '', date: '2025-6-15' } as Event,
      { title: '', description: '', location: '', date: '2025-8-15' } as Event,
    ];

    const searchView = 'month';
    const filteredEvents = getFilteredEvents([...monthDay, ...notMonthDay], '', date, searchView);

    expect(filteredEvents).toHaveLength(2);
    expect(filteredEvents).toMatchObject([{ date: '2025-07-10' }, { date: '2025-07-20' }]);
  });

  it("검색어 '이벤트'와 날짜 '2025-07-01'에 대하여 7월 첫째주에 발생하였고 이벤트 단어가 포함된 모든 이벤트를 반환한다.", () => {
    const currentDate = new Date(2025, 6, 1); // 2025-07-01
    const containedEvents = [
      { title: '이벤트 1', description: '이벤트 2', location: '', date: '2025-07-01' } as Event,
      {
        title: '이벤트 2',
        description: '이벤트 3',
        location: '',
        date: '2025-07-02',
      } as Event,
      { title: '이벤트 3', description: '', location: '이벤트 23', date: '2025-07-05' } as Event,
    ];

    const notContainedEvents = [
      { title: '파울로 벤투', description: '', location: '', date: '2025-06-30' } as Event,
      { title: '', description: '아반테', location: '', date: '2025-07-03' } as Event,
      { title: '', description: '이벤트', location: '', date: '2025-10-15' } as Event,
    ];

    const searchView = 'week';
    const filteredEvents = getFilteredEvents(
      [...containedEvents, ...notContainedEvents],
      '이벤트',
      currentDate,
      searchView
    );

    expect(filteredEvents).toHaveLength(3);
    expect(filteredEvents).toMatchObject([
      { title: '이벤트 1', date: '2025-07-01' },
      { title: '이벤트 2', date: '2025-07-02' },
      { title: '이벤트 3', date: '2025-07-05' },
    ]);
  });

  it('검색어가 없을 때 뷰의 기간에 해당하는 모든 이벤트를 반환한다', () => {
    const currentDate = new Date(2025, 6, 1); // 2025-07-01
    const events = [
      { title: '이벤트 1', description: '이벤트 2', location: '', date: '2025-07-01' } as Event,
      {
        title: '이벤트 2',
        description: '이벤트 3',
        location: '',
        date: '2025-07-02',
      } as Event,
      { title: '이벤트 3', description: '', location: '이벤트 23', date: '2025-07-05' } as Event,
      { title: '파울로 벤투', description: '', location: '', date: '2025-06-30' } as Event,
      { title: '', description: '아반테', location: '', date: '2025-07-03' } as Event,
      { title: '', description: '이벤트', location: '', date: '2025-06-30' } as Event,
    ];

    const filteredEvents = getFilteredEvents(events, '', currentDate, 'week');

    expect(filteredEvents).toHaveLength(6);
    expect(filteredEvents).toMatchObject([
      { title: '이벤트 1', date: '2025-07-01' },
      { title: '이벤트 2', date: '2025-07-02' },
      { title: '이벤트 3', date: '2025-07-05' },
      { title: '파울로 벤투', date: '2025-06-30' },
      { description: '아반테', date: '2025-07-03' },
      { description: '이벤트', date: '2025-06-30' },
    ]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const currentDate = new Date(2025, 6, 1); // 2025-07-01
    const events = [
      { title: 'case', description: '', location: '', date: '2025-07-01' } as Event,
      { title: 'CASE', description: '', location: '', date: '2025-07-01' } as Event,
    ];

    const lowercaseSearch = getFilteredEvents(events, 'case', currentDate, 'week');
    const uppercaseSearch = getFilteredEvents(events, 'CASE', currentDate, 'week');

    expect(lowercaseSearch).toHaveLength(2);
    expect(lowercaseSearch).toMatchObject([{ title: 'case' }, { title: 'CASE' }]);

    expect(uppercaseSearch).toHaveLength(2);
    expect(uppercaseSearch).toMatchObject([{ title: 'case' }, { title: 'CASE' }]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const date = new Date(2025, 6, 1); // 2025-07-01

    const firstDayOfMonth = {
      title: '',
      description: '',
      location: '',
      date: '2025-07-01',
    } as Event;

    const lastDayOfMonth = {
      title: '',
      description: '',
      location: '',
      date: '2025-07-31',
    } as Event;

    const monthDay = [firstDayOfMonth, lastDayOfMonth];

    const lastDayOfPrevMonth = {
      title: '',
      description: '',
      location: '',
      date: '2025-6-30',
    } as Event;

    const firstDayOfnextMonth = {
      title: '',
      description: '',
      location: '',
      date: '2025-8-01',
    } as Event;

    const notMonthDay = [lastDayOfPrevMonth, firstDayOfnextMonth];

    const searchView = 'month';
    const filteredEvents = getFilteredEvents([...monthDay, ...notMonthDay], '', date, searchView);

    expect(filteredEvents).toHaveLength(2);
    expect(filteredEvents).toMatchObject([{ date: '2025-07-01' }, { date: '2025-07-31' }]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const currentDate = new Date(2025, 9, 12); // 2025-10-12
    const emptyEventList = [] as Event[];

    const filteredEvents = getFilteredEvents(emptyEventList, '', currentDate, 'week');

    expect(filteredEvents).toHaveLength(0);
  });
});
