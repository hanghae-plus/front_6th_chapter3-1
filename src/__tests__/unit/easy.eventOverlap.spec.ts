import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('유효한 날짜와 시간 문자열을 받으면 올바른 Date 객체를 반환한다', () => {
    // Given: 2025년 7월 1일 오후 2시 30분을 나타내는 유효한 날짜와 시간 문자열
    const dateString = '2025-07-01';
    const timeString = '14:30';

    // When: parseDateTime 함수를 호출하면
    const result = parseDateTime(dateString, timeString);

    // Then: 해당 날짜와 시간에 맞는 올바른 Date 객체를 반환한다
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 형식의 날짜 문자열을 받으면 Invalid Date를 반환한다', () => {
    // Given: 잘못된 형식의 날짜 문자열과 유효한 시간 문자열
    const invalidDateString = '잘못된날짜형식';
    const validTimeString = '14:30';

    // When: parseDateTime 함수를 호출하면
    const result = parseDateTime(invalidDateString, validTimeString);

    // Then: Invalid Date를 반환한다
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 형식의 시간 문자열을 받으면 Invalid Date를 반환한다', () => {
    // Given: 유효한 날짜 문자열과 잘못된 형식의 시간 문자열
    const validDateString = '2025-07-01';
    const invalidTimeString = '잘못된시간형식';

    // When: parseDateTime 함수를 호출하면
    const result = parseDateTime(validDateString, invalidTimeString);

    // Then: Invalid Date를 반환한다
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('빈 문자열을 받으면 Invalid Date를 반환한다', () => {
    // Given: 빈 날짜 문자열과 빈 시간 문자열
    const emptyDateString = '';
    const emptyTimeString = '';

    // When: parseDateTime 함수를 호출하면
    const result = parseDateTime(emptyDateString, emptyTimeString);

    // Then: Invalid Date를 반환한다
    expect(result).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('유효한 이벤트 정보를 받으면 시작과 종료 시간이 포함된 날짜 범위 객체를 반환한다', () => {
    // Given: 2025년 7월 10일 오전 9시부터 10시까지 진행되는 일일 스탠드업 미팅 이벤트
    const dailyStandupMeetingEvent = {
      id: 'meeting-001',
      title: '일일 스탠드업 미팅',
      date: '2025-07-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀원들과 함께하는 일일 진행상황 공유 미팅',
      location: '2층 회의실 Alpha',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    // When: convertEventToDateRange 함수를 호출하면
    const convertedEventDateRange = convertEventToDateRange(dailyStandupMeetingEvent as Event);

    // Then: 시작과 종료 시간이 Date 객체로 변환된 범위 객체를 반환한다
    expect(convertedEventDateRange).toEqual({
      start: new Date('2025-07-10T09:00:00'),
      end: new Date('2025-07-10T10:00:00'),
    });
  });

  it('잘못된 날짜 형식을 가진 이벤트를 받으면 Invalid Date가 포함된 객체를 반환한다', () => {
    // Given: 잘못된 날짜 형식을 가진 프로젝트 킥오프 미팅 이벤트
    const eventWithInvalidDateFormat = {
      id: 'invalid-date-001',
      title: '프로젝트 킥오프 미팅',
      date: '잘못된날짜형식',
      startTime: '09:00',
      endTime: '10:00',
      description: '새로운 프로젝트 시작을 위한 킥오프 미팅',
      location: '3층 회의실 Beta',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    } as Event;

    // When: convertEventToDateRange 함수를 호출하면
    const convertedEventDateRange = convertEventToDateRange(eventWithInvalidDateFormat);

    // Then: Invalid Date가 포함된 객체를 반환한다
    expect(convertedEventDateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식을 가진 이벤트를 받으면 Invalid Date가 포함된 객체를 반환한다', () => {
    // Given: 잘못된 시간 형식을 가진 고객사 프레젠테이션 이벤트
    const eventWithInvalidTimeFormat = {
      id: 'invalid-time-001',
      title: '고객사 프레젠테이션',
      date: '2025-07-10',
      startTime: '잘못된시간형식',
      endTime: '잘못된시간형식',
      description: '신규 서비스에 대한 고객사 프레젠테이션',
      location: '1층 프레젠테이션룸',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    } as Event;

    // When: convertEventToDateRange 함수를 호출하면
    const convertedEventDateRange = convertEventToDateRange(eventWithInvalidTimeFormat);

    // Then: Invalid Date가 포함된 객체를 반환한다
    expect(convertedEventDateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('시간대가 겹치는 두 이벤트를 비교하면 true를 반환한다', () => {
    // Given: 2025년 7월 10일에 시간대가 겹치는 두 이벤트
    const quarterlyReviewMeetingEvent = {
      id: 'meeting-002',
      title: '분기별 성과 검토 미팅',
      date: '2025-07-10',
      startTime: '12:00',
      endTime: '13:00',
      description: '지난 3개월간의 성과와 다음 분기 계획 검토',
      location: '4층 대회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    } as Event;

    const teamLunchTimeEvent = {
      id: 'personal-001',
      title: '팀 점심식사',
      date: '2025-07-10',
      startTime: '11:30',
      endTime: '13:00',
      description: '팀원들과 함께하는 점심식사 시간',
      location: '1층 직원식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;

    // When: isOverlapping 함수로 두 이벤트를 비교하면
    const overlappingResult = isOverlapping(quarterlyReviewMeetingEvent, teamLunchTimeEvent);

    // Then: true를 반환한다
    expect(overlappingResult).toBe(true);
  });

  it('시간대가 겹치지 않는 두 이벤트를 비교하면 false를 반환한다', () => {
    // Given: 2025년 7월 10일에 시간대가 겹치지 않는 두 이벤트
    const morningCodeReviewEvent = {
      id: 'meeting-003',
      title: '오전 코드 리뷰 미팅',
      date: '2025-07-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '전날 작성한 코드에 대한 리뷰 및 피드백',
      location: '3층 개발팀 회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    } as Event;

    const afternoonClientMeetingEvent = {
      id: 'meeting-004',
      title: '오후 고객사 미팅',
      date: '2025-07-10',
      startTime: '14:00',
      endTime: '15:30',
      description: '신규 프로젝트 요구사항 논의',
      location: '1층 고객 상담실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    } as Event;

    // When: isOverlapping 함수로 두 이벤트를 비교하면
    const nonOverlappingResult = isOverlapping(morningCodeReviewEvent, afternoonClientMeetingEvent);

    // Then: false를 반환한다
    expect(nonOverlappingResult).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 시간이 겹치는 기존 이벤트들을 모두 찾아서 반환한다', () => {
    // Given: 2025년 7월 10일에 새로 추가할 집중 개발 작업 이벤트와 기존 이벤트 목록
    const focusedDevelopmentWorkEvent = {
      id: 'work-001',
      title: '집중 개발 작업 시간',
      date: '2025-07-10',
      startTime: '10:00',
      endTime: '14:00',
      description: '새로운 기능 개발을 위한 방해받지 않는 집중 작업 시간',
      location: '5층 조용한 개발실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    } as Event;

    const existingCalendarEvents = [
      {
        id: 'personal-002',
        title: '팀 점심 식사',
        date: '2025-07-10',
        startTime: '12:00',
        endTime: '13:00',
        description: '동료들과 함께하는 점심 식사 및 일상 대화',
        location: '2층 직원 카페테리아',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'meeting-005',
        title: '주간 진행상황 보고 미팅',
        date: '2025-07-10',
        startTime: '11:30',
        endTime: '12:30',
        description: '각 팀원의 주간 업무 진행상황 공유 및 다음 주 계획 논의',
        location: '3층 팀 회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      },
    ] as Event[];

    // When: findOverlappingEvents 함수를 호출하면
    const overlappingEventsResult = findOverlappingEvents(
      focusedDevelopmentWorkEvent,
      existingCalendarEvents
    );

    // Then: 시간이 겹치는 모든 기존 이벤트를 반환한다
    expect(overlappingEventsResult).toEqual([
      {
        id: 'personal-002',
        title: '팀 점심 식사',
        date: '2025-07-10',
        startTime: '12:00',
        endTime: '13:00',
        description: '동료들과 함께하는 점심 식사 및 일상 대화',
        location: '2층 직원 카페테리아',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'meeting-005',
        title: '주간 진행상황 보고 미팅',
        date: '2025-07-10',
        startTime: '11:30',
        endTime: '12:30',
        description: '각 팀원의 주간 업무 진행상황 공유 및 다음 주 계획 논의',
        location: '3층 팀 회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      },
    ]);
  });

  it('새 이벤트와 시간이 겹치는 기존 이벤트가 없으면 빈 배열을 반환한다', () => {
    // Given: 2025년 7월 10일에 새로 추가할 저녁 면접 이벤트와 시간이 겹치지 않는 기존 이벤트 목록
    const eveningInterviewEvent = {
      id: 'interview-001',
      title: '신입 개발자 최종 면접',
      date: '2025-07-10',
      startTime: '17:00',
      endTime: '18:30',
      description: '신입 프론트엔드 개발자 최종 면접 및 기술 질의응답',
      location: '6층 면접실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    } as Event;

    const nonOverlappingExistingEvents = [
      {
        id: 'personal-003',
        title: '오전 운동',
        date: '2025-07-10',
        startTime: '08:00',
        endTime: '09:30',
        description: '건강 관리를 위한 헬스장 운동',
        location: '지하 1층 피트니스센터',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      },
      {
        id: 'meeting-006',
        title: '오후 기획 회의',
        date: '2025-07-10',
        startTime: '14:00',
        endTime: '15:30',
        description: '다음 분기 서비스 기획 방향 논의',
        location: '4층 기획팀 회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 20,
      },
    ] as Event[];

    // When: findOverlappingEvents 함수를 호출하면
    const noOverlapResult = findOverlappingEvents(
      eveningInterviewEvent,
      nonOverlappingExistingEvents
    );

    // Then: 빈 배열을 반환한다
    expect(noOverlapResult).toEqual([]);
  });
});
