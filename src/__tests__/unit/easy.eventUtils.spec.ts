import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it('검색어에 맞는 이벤트만 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '신규 세미나',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '신규 프로젝트 세미나',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '점심 약속',
        date: '2025-07-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '친구와 점심 약속',
        location: '식당 C',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    expect(getFilteredEvents(events, '기존', new Date('2025-07-01'), 'month')).toEqual([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('주간 뷰에서 해당 주의 이벤트만 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '신규 세미나',
        date: '2025-07-10',
        startTime: '11:00',
        endTime: '12:00',
        description: '신규 프로젝트 세미나',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '점심 약속',
        date: '2025-08-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '친구와 점심 약속',
        location: '식당 C',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'week')).toEqual([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '신규 세미나',
        date: '2025-07-10',
        startTime: '11:00',
        endTime: '12:00',
        description: '신규 프로젝트 세미나',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '점심 약속',
        date: '2025-08-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '친구와 점심 약속',
        location: '식당 C',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    console.log(getFilteredEvents(events, '', new Date('2025-07-01'), 'month'));
    expect(getFilteredEvents(events, '기존', new Date('2025-07-01'), 'week')).toEqual([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('검색어가 없을 때 해당 월의 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '신규 세미나',
        date: '2025-07-10',
        startTime: '11:00',
        endTime: '12:00',
        description: '신규 프로젝트 세미나',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '점심 약속',
        date: '2025-08-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '친구와 점심 약속',
        location: '식당 C',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'month')).toEqual([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '신규 세미나',
        date: '2025-07-10',
        startTime: '11:00',
        endTime: '12:00',
        description: '신규 프로젝트 세미나',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '신규 세미나',
        date: '2025-07-10',
        startTime: '11:00',
        endTime: '12:00',
        description: '신규 프로젝트 세미나',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '점심 약속',
        date: '2025-08-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '친구와 점심 약속',
        location: '식당 C',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    expect(getFilteredEvents(events, '회의실 a', new Date('2025-07-01'), 'month')).toEqual([
      {
        id: '2',
        title: '신규 세미나',
        date: '2025-07-10',
        startTime: '11:00',
        endTime: '12:00',
        description: '신규 프로젝트 세미나',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    expect(getFilteredEvents(events, '회의실 A', new Date('2025-07-01'), 'month')).toEqual([
      {
        id: '2',
        title: '신규 세미나',
        date: '2025-07-10',
        startTime: '11:00',
        endTime: '12:00',
        description: '신규 프로젝트 세미나',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '신규 세미나',
        date: '2025-07-10',
        startTime: '11:00',
        endTime: '12:00',
        description: '신규 프로젝트 세미나',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '점심 약속',
        date: '2025-08-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '친구와 점심 약속',
        location: '식당 C',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'month')).toEqual([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '신규 세미나',
        date: '2025-07-10',
        startTime: '11:00',
        endTime: '12:00',
        description: '신규 프로젝트 세미나',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'month')).toEqual([]);
  });
});
