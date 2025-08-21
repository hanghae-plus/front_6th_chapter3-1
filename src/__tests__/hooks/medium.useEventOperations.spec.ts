// import { http, HttpResponse } from 'msw';

import { act, renderHook } from '@testing-library/react';

import { useEventOperations } from '../../hooks/useEventOperations';

/**
 * toHaveBeenCalledWith: 특정 인자와 함께 호출되었는지 확인용
 */

// 가짜 함수 생성
const enqueueSnackbarFn = vi.fn();

//토스트(외부 UI 라이브러리)를 테스트 환경에서 사용할 수 있도록 모킹
vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack'); //모듈 가져오기
  return {
    ...actual, // 모듈 내용 유지
    useSnackbar: () => ({
      //해당 훅만 새로운 동작으로 대체
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

describe('useEventOperations: 이벤트 관리 훅', () => {
  it('저장되어있는 초기 이벤트 데이터를 불러오고 로딩 완료 메세지를 표시한다', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    // 초기 상태 확인
    expect(result.current.events).toEqual([]);

    await act(async () => {
      // 약간의 지연을 주어 useEffect 실행 대기
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // 로딩 완료 메세지 확인
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {});

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {});

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {});

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {});

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {});

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {});
});
