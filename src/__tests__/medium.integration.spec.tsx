import { screen, within, RenderResult } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { renderWithProvider } from './renderProvider';
import { createTestEvent } from './utils';
import { createMockHandlers } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';

const createForm = (renderResult: Pick<RenderResult, 'getByLabelText'>) => {
  const { getByLabelText } = renderResult;

  return {
    title: getByLabelText('제목'),
    date: getByLabelText('날짜'),
    startTime: getByLabelText('시작 시간'),
    endTime: getByLabelText('종료 시간'),
    description: getByLabelText('설명'),
    location: getByLabelText('위치'),
    category: getByLabelText('카테고리'),
  };
};

type formKeys = keyof typeof createForm;

describe('일정 CRUD 및 기본 기능', () => {
  // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const user = userEvent.setup();
    const { handlers } = createMockHandlers();
    server.use(...handlers);

    const { getByLabelText, getByTestId } = renderWithProvider(<App />);

    const form = createForm({ getByLabelText });

    const eventData = createTestEvent({
      title: '테스트 이벤트',
      date: '2025-08-21',
    });

    // 입력 필드 초기화
    for (const [key, value] of Object.entries(form)) {
      await user.type(value, eventData[key as formKeys] as string);
    }

    await user.click(getByTestId('event-submit-button'));

    // 추가된 일정 확인
    const eventList = getByTestId('event-list');
    const addedEvent = await within(eventList).findByText(eventData.title);
    const date = await within(eventList).findByText(eventData.date);

    expect(addedEvent).toBeInTheDocument();
    expect(date).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const user = userEvent.setup();
    const { handlers } = createMockHandlers();
    server.use(...handlers);

    const { getByTestId, getByLabelText, getByRole } = renderWithProvider(<App />);

    const eventData = createTestEvent({
      title: '테스트 이벤트',
      date: '2025-08-21',
    });

    const form = createForm({ getByLabelText });

    // 일정 초기화 및 추가
    for (const [key, value] of Object.entries(form)) {
      await user.type(value, eventData[key as formKeys] as string);
    }

    await user.click(getByTestId('event-submit-button'));

    // 수정하기
    await user.click(getByRole('button', { name: 'Edit event' }));

    await user.clear(form.title);
    await user.type(form.title, '수정된 테스트 이벤트');
    await user.click(getByTestId('event-submit-button'));

    // 변경사항 확인하기
    const eventList = getByTestId('event-list');
    await within(eventList).findByText('수정된 테스트 이벤트');
    expect(within(eventList).queryByText('테스트 이벤트')).not.toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const user = userEvent.setup();
    const { handlers } = createMockHandlers();
    server.use(...handlers);

    const { getByTestId, getByLabelText } = renderWithProvider(<App />);

    const eventData = createTestEvent({
      title: '삭제할 이벤트',
      date: '2025-08-21',
    });

    const form = createForm({ getByLabelText });

    // 일정 초기화
    for (const [key, value] of Object.entries(form)) {
      await user.type(value, eventData[key as formKeys] as string);
    }

    await user.click(getByTestId('event-submit-button'));

    // 기존 일정 가져오기
    const eventList = getByTestId('event-list');
    const addedEvent = await within(eventList).findByText(eventData.title);
    const date = await within(eventList).findByText(eventData.date);

    expect(addedEvent).toBeInTheDocument();
    expect(date).toBeInTheDocument();

    // 일정 삭제하기
    const deleteButton = within(eventList).getByRole('button', { name: 'Delete event' });
    await user.click(deleteButton);

    await screen.findByText('일정이 삭제되었습니다.');

    // 조회 확인하기
    const deletedEvent = within(eventList).queryByText('삭제할 이벤트');
    expect(deletedEvent).not.toBeInTheDocument();

    server.resetHandlers();
  });
});

describe('일정 뷰', () => {
  let mockHandlers: ReturnType<typeof createMockHandlers>;

  beforeEach(() => {
    mockHandlers = createMockHandlers();
    server.use(...mockHandlers.handlers);
  });

  afterEach(() => {
    mockHandlers.reset();
    server.resetHandlers();
    vi.clearAllMocks();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const { getByTestId } = renderWithProvider(<App />);

    // 이벤트 리스트는 항상 존재해야 함
    const eventList = getByTestId('event-list');
    expect(eventList).toBeInTheDocument();

    // 기본적으로 월별 뷰가 렌더링되어 있음을 확인
    const monthView = getByTestId('month-view');
    expect(monthView).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const { getByTestId } = renderWithProvider(<App />);

    const eventList = getByTestId('event-list');
    expect(eventList).toBeInTheDocument();

    const monthView = getByTestId('month-view');
    expect(monthView).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const { getByTestId } = renderWithProvider(<App />);

    // 월별 뷰가 기본으로 선택되어 있는지 확인
    const monthView = getByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 일정이 없으면 검색 결과 없음 메시지가 표시됨
    const noResultsMessage = screen.getByText('검색 결과가 없습니다.');
    expect(noResultsMessage).toBeInTheDocument();

    // 특정 일정들이 표시되지 않음을 확인
    expect(screen.queryByText('월간 회의')).not.toBeInTheDocument();
    expect(screen.queryByText('프로젝트 리뷰')).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const user = userEvent.setup();
    const { getByTestId, getByLabelText } = renderWithProvider(<App />);

    const eventData = createTestEvent({
      title: '월간 회의',
      date: '2025-08-15',
      startTime: '14:00',
      endTime: '15:00',
    });

    const form = createForm({ getByLabelText });

    for (const [key, value] of Object.entries(form)) {
      await user.type(value, eventData[key as formKeys] as string);
    }
    await user.click(getByTestId('event-submit-button'));

    // 월별 뷰가 렌더링되었는지 확인
    const monthView = getByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 일정이 정확히 표시되는지 확인
    const eventList = getByTestId('event-list');
    expect(await within(eventList).findByText('월간 회의')).toBeInTheDocument();
    expect(await within(eventList).findByText('2025-08-15')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  let mockHandlers: ReturnType<typeof createMockHandlers>;

  beforeEach(() => {
    mockHandlers = createMockHandlers();
    server.use(...mockHandlers.handlers);
  });

  afterEach(() => {
    mockHandlers.reset();
    server.resetHandlers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const user = userEvent.setup();
    const { getByText } = renderWithProvider(<App />);

    // 검색 입력 필드 찾기
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    // 존재하지 않는 일정 검색
    await user.type(searchInput, '존재하지 않는 일정');

    // 검색 결과 없음 메시지 확인
    const noResultsMessage = getByText('검색 결과가 없습니다.');
    expect(noResultsMessage).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const user = userEvent.setup();
    const { getByTestId, getByLabelText } = renderWithProvider(<App />);

    const eventData = createTestEvent({
      title: '팀 회의',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '11:00',
    });

    const form = createForm({ getByLabelText });

    for (const [key, value] of Object.entries(form)) {
      await user.type(value, eventData[key as formKeys] as string);
    }

    await user.click(getByTestId('event-submit-button'));

    // 검색 입력 필드 찾고 검색
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = getByTestId('event-list');
    const searchResult = await within(eventList).findByText('팀 회의');
    expect(searchResult).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const user = userEvent.setup();
    const { getByTestId, getByLabelText } = renderWithProvider(<App />);

    const eventData1 = createTestEvent({
      title: '팀 회의',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '11:00',
    });

    const eventData2 = createTestEvent({
      title: '점심 약속',
      date: '2025-08-22',
      startTime: '12:00',
      endTime: '13:00',
    });

    const form = createForm({ getByLabelText });

    // 첫 번째 일정 추가
    for (const [key, value] of Object.entries(form)) {
      await user.type(value, eventData1[key as formKeys] as string);
    }
    await user.click(getByTestId('event-submit-button'));

    // 폼 초기화
    for (const [_key, value] of Object.entries(form)) {
      if (value instanceof HTMLInputElement || value instanceof HTMLTextAreaElement) {
        await user.clear(value);
      }
    }

    // 두 번째 일정 추가
    for (const [key, value] of Object.entries(form)) {
      await user.type(value, eventData2[key as formKeys] as string);
    }
    await user.click(getByTestId('event-submit-button'));

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = getByTestId('event-list');
    expect(await within(eventList).findByText('팀 회의')).toBeInTheDocument();

    // 검색어 지우기
    await user.clear(searchInput);

    // 모든 일정이 다시 표시되는지 확인
    expect(await within(eventList).findByText('팀 회의')).toBeInTheDocument();
    expect(await within(eventList).findByText('점심 약속')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  let mockHandlers: ReturnType<typeof createMockHandlers>;

  beforeEach(() => {
    mockHandlers = createMockHandlers();
    server.use(...mockHandlers.handlers);
  });

  afterEach(() => {
    mockHandlers.reset();
    server.resetHandlers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const user = userEvent.setup();
    const { getByTestId, getByLabelText } = renderWithProvider(<App />);

    const existingEvent = createTestEvent({
      title: '기존 회의',
      date: '2025-08-21',
      startTime: '14:00',
      endTime: '15:00',
    });

    const form = createForm({ getByLabelText });

    for (const [key, value] of Object.entries(form)) {
      await user.type(value, existingEvent[key as formKeys] as string);
    }
    await user.click(getByTestId('event-submit-button'));

    for (const [_key, value] of Object.entries(form)) {
      if (value instanceof HTMLInputElement || value instanceof HTMLTextAreaElement) {
        await user.clear(value);
      }
    }

    // 겹치는 시간으로 새 일정 추가
    await user.type(form.title, '새로운 회의');
    await user.type(form.date, '2025-08-21');
    await user.type(form.startTime, '14:30');
    await user.type(form.endTime, '15:30');

    await user.click(getByTestId('event-submit-button'));

    // 일정 충돌 경고 다이얼로그가 표시되는지 확인
    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
    expect(await screen.findByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/기존 회의/)).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const user = userEvent.setup();
    const { getByTestId, getByLabelText } = renderWithProvider(<App />);

    const eventData1 = createTestEvent({
      title: '첫 번째 회의',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '11:00',
    });

    const eventData2 = createTestEvent({
      title: '두 번째 회의',
      date: '2025-08-21',
      startTime: '14:00',
      endTime: '15:00',
    });

    const form = createForm({ getByLabelText });

    // 첫 번째 일정 추가
    for (const [key, value] of Object.entries(form)) {
      await user.type(value, eventData1[key as formKeys] as string);
    }
    await user.click(getByTestId('event-submit-button'));

    // 폼 초기화
    for (const [_key, value] of Object.entries(form)) {
      if (value instanceof HTMLInputElement || value instanceof HTMLTextAreaElement) {
        await user.clear(value);
      }
    }

    // 두 번째 일정 추가
    for (const [key, value] of Object.entries(form)) {
      await user.type(value, eventData2[key as formKeys] as string);
    }
    await user.click(getByTestId('event-submit-button'));

    // 첫 번째 일정 수정
    const eventList = getByTestId('event-list');
    const firstEvent = await within(eventList).findByText('첫 번째 회의');
    // 첫 번째 일정의 Edit 버튼을 찾기 위해 부모 요소를 찾고 그 안에서 Edit 버튼을 찾음
    const firstEventContainer = firstEvent.closest('[data-testid="event-list"] > div');
    const editButton = within(firstEventContainer as HTMLElement).getByRole('button', {
      name: 'Edit event',
    });
    await user.click(editButton);

    // 겹치는 시간으로 수정
    await user.clear(form.startTime);
    await user.type(form.startTime, '14:30');
    await user.clear(form.endTime);
    await user.type(form.endTime, '15:30');

    await user.click(getByTestId('event-submit-button'));

    // 경고 확인
    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
    expect(await screen.findByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/두 번째 회의/)).toBeInTheDocument();
  });
});

describe('알림 기능', () => {
  let mockHandlers: ReturnType<typeof createMockHandlers>;

  beforeEach(() => {
    mockHandlers = createMockHandlers();
    server.use(...mockHandlers.handlers);
  });

  afterEach(() => {
    mockHandlers.reset();
    server.resetHandlers();
  });

  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    const user = userEvent.setup();
    const { getByTestId, getByLabelText } = renderWithProvider(<App />);

    // 알림 시간이 10분으로 설정된 일정 생성
    const eventData = createTestEvent({
      title: '알림 테스트 회의',
      date: '2025-08-21',
      startTime: '09:00',
      endTime: '10:00',
      notificationTime: 10,
    });

    const form = createForm({ getByLabelText });

    for (const [key, value] of Object.entries(form)) {
      await user.type(value, eventData[key as formKeys] as string);
    }
    await user.click(getByTestId('event-submit-button'));

    // 일정이 추가되었는지 확인
    const eventList = getByTestId('event-list');
    expect(await within(eventList).findByText('알림 테스트 회의')).toBeInTheDocument();

    const notificationText = within(eventList).getByText(/알림:.*10분 전/);
    expect(notificationText).toBeInTheDocument();
  });
});
