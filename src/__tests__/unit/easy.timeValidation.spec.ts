import { getTimeErrorMessage } from '../../utils/timeValidation';

// export function getTimeErrorMessage(start: string, end: string): TimeValidationResult {
//   if (!start || !end) {
//     return { startTimeError: null, endTimeError: null };
//   }

//   const startDate = new Date(`2000-01-01T${start}`);
//   const endDate = new Date(`2000-01-01T${end}`);

//   if (startDate >= endDate) {
//     return {
//       startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
//       endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
//     };
//   }

//   return { startTimeError: null, endTimeError: null };
// }

const mockEvents = [
  {
    id: '1',
    title: '시작 시간이 종료시간 보다늦는다',
    date: '2025-08-19',
    startTime: '11:00',
    endTime: '10:00',
    description: '면접 준비',
    location: '내 방',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '시작 시간이 종료시간이랑 같다',
    date: '2025-07-01',
    startTime: '12:00',
    endTime: '12:00',
    description: '회의',
    location: '카페',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '정상 시간',
    date: '2025-07-01',
    startTime: '12:00',
    endTime: '13:00',
    description: '회의',
    location: '카페',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    expect(getTimeErrorMessage(mockEvents[0].startTime, mockEvents[0].endTime)).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    expect(getTimeErrorMessage(mockEvents[1].startTime, mockEvents[1].endTime)).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    expect(getTimeErrorMessage(mockEvents[2].startTime, mockEvents[2].endTime)).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('', mockEvents[2].endTime)).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage(mockEvents[2].startTime, '')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('', '')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });
});
