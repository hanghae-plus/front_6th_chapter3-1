import { createEventData, CreateEventDataParams } from '../../utils/eventFormUtils';
import { Event } from '../../types';

describe('createEventData', () => {
  it('새로운 이벤트 데이터를 생성할 때 올바른 데이터를 반환한다', () => {
    const params: CreateEventDataParams = {
      editingEvent: null,
      title: '회의',
      date: '2023-10-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      isRepeating: false,
      repeatType: 'none',
      repeatInterval: 0,
      repeatEndDate: '',
      notificationTime: 10,
    };

    const result = createEventData(params);

    expect(result).toEqual({
      id: undefined,
      title: '회의',
      date: '2023-10-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
        endDate: undefined,
      },
      notificationTime: 10,
    });
  });

  it('기존 이벤트를 편집할 때 올바른 데이터를 반환한다', () => {
    const existingEvent: Event = {
      id: '1',
      title: '기존 회의',
      date: '2023-10-09',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 회의',
      location: '회의실 B',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2023-12-31',
      },
      notificationTime: 60,
    };

    const params: CreateEventDataParams = {
      editingEvent: existingEvent,
      title: '수정된 회의',
      date: '2023-10-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '수정된 팀 회의',
      location: '회의실 A',
      category: '업무',
      isRepeating: true,
      repeatType: 'daily',
      repeatInterval: 1,
      repeatEndDate: '2023-11-30',
      notificationTime: 10,
    };

    const result = createEventData(params);

    expect(result).toEqual({
      id: '1',
      title: '수정된 회의',
      date: '2023-10-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '수정된 팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2023-11-30',
      },
      notificationTime: 10,
    });
  });
});
