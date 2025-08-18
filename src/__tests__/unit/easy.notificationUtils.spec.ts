import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-10',
        startTime: '11:10',
        endTime: '12:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 20,
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
    expect(getUpcomingEvents(events, new Date('2025-07-10T10:50:00'), [])).toEqual([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-10',
        startTime: '11:10',
        endTime: '12:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 20,
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

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-10',
        startTime: '11:10',
        endTime: '12:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 20,
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
    expect(getUpcomingEvents(events, new Date('2025-07-10T10:50:00'), ['1'])).toEqual([
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

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-10',
        startTime: '13:10',
        endTime: '14:10',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 20,
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
    expect(getUpcomingEvents(events, new Date('2025-07-10T10:50:00'), [])).toEqual([
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

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-10',
        startTime: '09:50',
        endTime: '10:50',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 20,
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
    expect(getUpcomingEvents(events, new Date('2025-07-10T10:50:00'), [])).toEqual([
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
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-07-10',
        startTime: '09:50',
        endTime: '10:50',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 20,
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
    expect(createNotificationMessage(events[0])).toBe('20분 후 기존 회의 일정이 시작됩니다.');
    expect(createNotificationMessage(events[1])).toBe('10분 후 신규 세미나 일정이 시작됩니다.');
    expect(createNotificationMessage(events[2])).toBe('10분 후 점심 약속 일정이 시작됩니다.');
  });
});
