import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
// import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
// import { server } from '../setupTests';
import { Event } from '../types';
import { createMockEvent } from './utils';
import { createNotificationMessage } from '../utils/notificationUtils';

const theme = createTheme();

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  // ? Medium: 여기서 Provider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
  /**
   * 나의 생각 : Provider로 묶어주는 것은 실제 앱 환경과 동일한 컨텍스트를 제공하기 위함이라 생각함.
   *            ThemeProvider: Material-UI 테마 적용, 일관된 스타일링
   *            CssBaseline: 브라우저 기본 스타일 리셋, 일관된 렌더링
   *            SnackbarProvider: 알림 메시지 기능 (성공/에러 메시지 표시)
   *            실제 앱과 동일한 환경에서 테스트해야 정확한 결과를 얻을 수 있음.
   */

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  await user.click(screen.getByTestId('event-submit-button'));
};

// 뷰 타입 선택 유틸리티
const selectViewType = async (user: UserEvent, viewType: 'week' | 'month') => {
  const selectViewTypeElement = screen.getByLabelText('뷰 타입 선택');
  await user.click(within(selectViewTypeElement).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${viewType}-option` }));
};

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
/**
 * 나의 생각 : 초기 상태를 기준점으로 설정하고, 액션 후 변화를 검증하는 것이 맞음.
 *            단순히 초기 상태를 assert하는 것이 아니라, 액션 실행 전에 기준점을 확인하고,
 *            액션 실행 후에 실제 변화(일정 추가, 성공 메시지 등)를 검증해야 함.
 *            그래야 테스트 기준이 있으니 신뢰성이나 검증 되는 테스트 코드가 됨.
 */
describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    // 모든 테스트가 깨끗한 상태에서 시작하도록 설정
    setupMockHandlerCreation([]);
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    /**
     * 나의 생각 :
     * 1. Mock 데이터와 실제 입력 데이터 불일치 문제가 생길 수 있을 듯. (그 json 데이터는 사실 실제 데이터라 생각하고 있음 나는.)
     * 2. 상태 동기화 문제 (POST 후 GET이 업데이트되지 않을 수 있음)
     * 3. 테스트 격리 문제 (테스트 간 상태 공유)
     * 해결책: 빈 배열로 시작하고 실제 UI 상태로 검증, 성공 메시지로 API 호출 확인
     */
    const { user } = setup(<App />);

    // 초기에는 검색 결과가 없어야 함
    await screen.findByText('검색 결과가 없습니다.');

    await saveSchedule(user, {
      title: '새로운 회의',
      date: '2025-10-12',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
    });

    await screen.findByText('일정이 추가되었습니다.');

    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText('새로운 회의');
    expect(within(eventList).getByText('2025-10-12')).toBeInTheDocument();
    expect(within(eventList).getByText('10:00 - 11:00')).toBeInTheDocument();
    expect(within(eventList).getByText('새로운 팀 미팅')).toBeInTheDocument();
    expect(within(eventList).getByText('회의실 A')).toBeInTheDocument();
    expect(within(eventList).getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const mockEditButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    const [editButton1, editButton2] = mockEditButtons;
    await user.click(editButton1);

    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('기존 회의')).toBeInTheDocument();

    const locationInput = screen.getByLabelText('위치');
    await user.type(locationInput, '회의실 C');

    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    await user.click(editButton2);

    expect(screen.getByDisplayValue('기존 회의2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('회의실 C')).toBeInTheDocument();

    const locationInput2 = screen.getByLabelText('위치');
    await user.type(locationInput2, '회의실 D');

    await user.click(screen.getByRole('button', { name: '일정 수정' }));
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    const mockDeleteButtons = await screen.findAllByRole('button', { name: 'Delete event' });
    await user.click(mockDeleteButtons[0]);

    await screen.findByText('일정이 삭제되었습니다.');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    // 모든 테스트가 깨끗한 상태에서 시작하도록 설정
    setupMockHandlerCreation([]);
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const { user } = setup(<App />);

    await selectViewType(user, 'week');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const mockEvent = createMockEvent(1, {
      title: '주간 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
    });

    setupMockHandlerCreation([mockEvent]);
    const { user } = setup(<App />);

    await selectViewType(user, 'week');

    expect(screen.getByText('Week')).toBeInTheDocument();

    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText('주간 회의');
    expect(within(eventList).getByText('2025-10-02')).toBeInTheDocument();
    expect(within(eventList).getByText('09:00 - 10:00')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    await selectViewType(user, 'month');

    expect(screen.getByText('Month')).toBeInTheDocument();

    await screen.findByText('검색 결과가 없습니다.');
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const mockEvent = createMockEvent(1, {
      title: '월간 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
    });

    setupMockHandlerCreation([mockEvent]);
    const { user } = setup(<App />);

    await selectViewType(user, 'month');

    expect(screen.getByText('Month')).toBeInTheDocument();

    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText('월간 회의');
    expect(within(eventList).getByText('2025-10-15')).toBeInTheDocument();
    expect(within(eventList).getByText('14:00 - 15:00')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    for (let i = 0; i < 9; i++) {
      await user.click(screen.getByLabelText('Previous'));
    }

    expect(screen.getByText('2025년 1월')).toBeInTheDocument();

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    // 모든 테스트가 깨끗한 상태에서 시작하도록 설정
    setupMockHandlerCreation([]);
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('일정 검색'), '존재하지 않는 일정');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const mockEvent = createMockEvent(1, {
      title: '팀 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
    });

    setupMockHandlerCreation([mockEvent]);
    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('일정 검색'), '팀 회의');

    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText('팀 회의');
    expect(within(eventList).getByText('2025-10-15')).toBeInTheDocument();
    expect(within(eventList).getByText('14:00 - 15:00')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const mockEvents = [
      createMockEvent(1, {
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
      }),
      createMockEvent(2, {
        title: '개인 미팅',
        date: '2025-10-16',
        startTime: '10:00',
        endTime: '11:00',
      }),
    ];

    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText('팀 회의');
    await within(eventList).findByText('개인 미팅');

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '팀');

    await within(eventList).findByText('팀 회의');
    expect(within(eventList).queryByText('개인 미팅')).not.toBeInTheDocument();

    await user.clear(searchInput);

    await within(eventList).findByText('팀 회의');
    await within(eventList).findByText('개인 미팅');
  });
});

describe('일정 충돌', () => {
  beforeEach(() => {
    // 모든 테스트가 깨끗한 상태에서 시작하도록 설정
    setupMockHandlerCreation([]);
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const existingEvent = createMockEvent(1, {
      title: '기존 회의',
      date: '2025-10-01',
      startTime: '10:00',
      endTime: '11:00',
    });

    setupMockHandlerCreation([existingEvent]);
    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText('기존 회의');

    await saveSchedule(user, {
      title: '새로운 회의',
      date: '2025-10-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '겹치는 시간의 회의',
      location: '회의실 B',
      category: '업무',
    });

    await screen.findByText('일정 겹침 경고');
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText(/기존 회의.*2025-10-01.*10:00-11:00/)).toBeInTheDocument();
    expect(screen.getByText(/계속 진행하시겠습니까/)).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    // 두 개의 기존 일정 생성
    const existingEvents = [
      createMockEvent(1, {
        title: '첫 번째 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createMockEvent(2, {
        title: '두 번째 회의',
        date: '2025-10-01',
        startTime: '11:00',
        endTime: '12:00',
      }),
    ];

    setupMockHandlerCreation(existingEvents);
    const { user } = setup(<App />);

    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[0]);

    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();

    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');

    await user.clear(startTimeInput);
    await user.type(startTimeInput, '10:30');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '11:30');

    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    await screen.findByText('일정 겹침 경고');
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText(/두 번째 회의.*2025-10-01.*11:00-12:00/)).toBeInTheDocument();
    expect(screen.getByText(/계속 진행하시겠습니까/)).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  // 모든 테스트가 깨끗한 상태에서 시작하도록 설정
  setupMockHandlerCreation([]);

  const mockEvent = createMockEvent(1, {
    title: '알림 테스트 회의',
    date: '2025-10-01',
    startTime: '14:00',
    endTime: '15:00',
    notificationTime: 10,
  });

  setupMockHandlerCreation([mockEvent]);
  setup(<App />);

  const eventList = screen.getByTestId('event-list');
  await within(eventList).findByText('알림 테스트 회의');
  expect(within(eventList).getByText('2025-10-01')).toBeInTheDocument();
  expect(within(eventList).getByText('14:00 - 15:00')).toBeInTheDocument();

  const expectedNotificationMessage = createNotificationMessage(mockEvent);
  expect(within(eventList).getByText('알림: 10분 전')).toBeInTheDocument();
  expect(expectedNotificationMessage).toBe('10분 후 알림 테스트 회의 일정이 시작됩니다.');
});
