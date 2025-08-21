import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-08-33', '13:00')).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-01', '25:00')).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14:30')).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    expect(
      convertEventToDateRange({
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
      } as Event)
    ).toEqual({
      start: new Date('2025-07-01T09:00:00'),
      end: new Date('2025-07-01T10:00:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(
      convertEventToDateRange({
        id: '1',
        title: '기존 회의',
        date: '2025-07-35',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      } as Event)
    ).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(
      convertEventToDateRange({
        id: '1',
        title: '기존 회의',
        date: '2025-07-01',
        startTime: '45:00',
        endTime: '55:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      } as Event)
    ).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;

    const event2 = {
      id: '2',
      title: '신규 회의',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: '신규 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = {
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
    } as Event;

    const event2 = {
      id: '2',
      title: '신규 회의',
      date: '2025-07-01',
      startTime: '15:30',
      endTime: '16:30',
      description: '신규 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
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

    const newEvent = {
      id: '4',
      title: '신규 회의',
      date: '2025-07-01',
      startTime: '09:30',
      endTime: '12:30',
      description: '신규 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;

    expect(findOverlappingEvents(newEvent, events)).toEqual([
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
    ]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
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

    const newEvent = {
      id: '4',
      title: '신규 회의',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '16:00',
      description: '신규 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;
    expect(findOverlappingEvents(newEvent, events)).toEqual([]);
  });
});
