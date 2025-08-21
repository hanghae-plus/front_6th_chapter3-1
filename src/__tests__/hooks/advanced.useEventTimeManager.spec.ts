import { renderHook, act } from '@testing-library/react';
import React from 'react';

import { useEventTimeManager } from '../../hooks/useEventTimeManager';

describe('useEventTimeManager', () => {
  describe('초기화', () => {
    it('초기값이 에러 없는 상태로 설정된다', () => {
      const { result } = renderHook(() => useEventTimeManager());

      expect(result.current.startTimeError).toBeNull();
      expect(result.current.endTimeError).toBeNull();
    });
  });

  // easy.timeValidation.spec.ts에서 검증에 대한 상세 테스트를 진행중이므로 여기서는 생략함
  describe.skip('validateTime', () => {
    it('올바른 시간일 때 에러가 없다', () => {});
    it('시작 시간이 종료 시간보다 늦을 때 에러가 발생한다', () => {});
    it('빈 값일 때 에러가 없다', () => {});
  });

  describe('createTimeChangeHandler', () => {
    it('시작 시간 변경 핸들러가 올바르게 동작한다', () => {
      const { result } = renderHook(() => useEventTimeManager());
      const mockSetTime = vi.fn();

      const handler = result.current.createTimeChangeHandler('start', '11:00', mockSetTime);

      const mockEvent = {
        target: { value: '10:00' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        handler(mockEvent);
      });

      expect(mockSetTime).toHaveBeenCalledWith('10:00');
      expect(result.current.startTimeError).toBeNull();
      expect(result.current.endTimeError).toBeNull();
    });

    it('종료 시간 변경 핸들러가 올바르게 동작한다', () => {
      const { result } = renderHook(() => useEventTimeManager());
      const mockSetTime = vi.fn();

      const handler = result.current.createTimeChangeHandler('end', '09:00', mockSetTime);

      const mockEvent = {
        target: { value: '10:00' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        handler(mockEvent);
      });

      expect(mockSetTime).toHaveBeenCalledWith('10:00');
      expect(result.current.startTimeError).toBeNull();
      expect(result.current.endTimeError).toBeNull();
    });
  });

  describe('clearTimeErrors', () => {
    it('에러 상태를 초기화한다', () => {
      const { result } = renderHook(() => useEventTimeManager());

      // 에러를 발생시킴
      act(() => {
        result.current.validateTime('11:00', '10:00');
      });

      expect(result.current.startTimeError).toBeTruthy();
      expect(result.current.endTimeError).toBeTruthy();

      // 에러를 초기화
      act(() => {
        result.current.clearTimeErrors();
      });

      expect(result.current.startTimeError).toBeNull();
      expect(result.current.endTimeError).toBeNull();
    });
  });
});
