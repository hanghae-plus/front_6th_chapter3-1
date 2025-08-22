import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const events: Event[] = [
    {
      id: 'a6b7c8d9-1111-2222-3333-444455556666',
      title: '디자인 QA',
      date: '2025-07-01',
      startTime: '16:00',
      endTime: '17:00',
      description: '신규 장바구니 페이지 픽셀 퍼펙트 검수',
      location: 'Figma/Jira',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(getUpcomingEvents(events, new Date('2025-07-01 15:50'), [])).toEqual([events[0]]);
    expect(getUpcomingEvents(events, new Date('2025-07-01 15:59'), [])).toEqual([events[0]]);
    expect(getUpcomingEvents(events, new Date('2025-07-01 16:00'), [])).toEqual([]);
    expect(getUpcomingEvents(events, new Date('2025-07-01 16:01'), [])).toEqual([]);
    expect(getUpcomingEvents(events, new Date('2025-07-01 16:09'), [])).toEqual([]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(
      getUpcomingEvents(events, new Date('2025-07-01 15:50'), [
        'a6b7c8d9-1111-2222-3333-444455556666',
      ])
    ).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date('2025-07-01 14:00'), [])).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date('2025-07-01 16:20'), [])).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  const events: Event[] = [
    {
      id: 'a6b7c8d9-1111-2222-3333-444455556666',
      title: '디자인 QA',
      date: '2025-07-01',
      startTime: '16:00',
      endTime: '17:00',
      description: '신규 장바구니 페이지 픽셀 퍼펙트 검수',
      location: 'Figma/Jira',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '11112222-3333-4444-5555-666677778888',
      title: '코드리뷰 타임',
      date: '2025-07-22',
      startTime: '11:00',
      endTime: '11:30',
      description: 'PR #124 ~ #129 리뷰',
      location: 'GitHub PR',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 5,
    },
    {
      id: '9999aaaa-bbbb-cccc-dddd-eeeeffff0001',
      title: 'PT 상담',
      date: '2025-09-23',
      startTime: '19:30',
      endTime: '20:00',
      description: '체형 분석 및 루틴 점검',
      location: '동네 헬스장',
      category: '건강',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 30,
    },
    {
      id: '9999aaaa-bbbb-ffff-dddd-eeeeffff0002',
      title: '이벤트 2',
      date: '2025-10-31',
      startTime: '10:00',
      endTime: '10:30',
      description: '이벤트 2 테스트',
      location: '이벤트 장소',
      category: '건강',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 30,
    },
  ];

  it('올바른 알림 메시지를 생성해야 한다', () => {
    expect(createNotificationMessage(events[0])).toEqual('10분 후 디자인 QA 일정이 시작됩니다.');
    expect(createNotificationMessage(events[1])).toEqual('5분 후 코드리뷰 타임 일정이 시작됩니다.');
    expect(createNotificationMessage(events[2])).toEqual('30분 후 PT 상담 일정이 시작됩니다.');
    expect(createNotificationMessage(events[3])).toEqual('30분 후 이벤트 2 일정이 시작됩니다.');
  });
});
