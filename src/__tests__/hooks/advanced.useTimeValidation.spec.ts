import { renderHook, act } from '@testing-library/react';

import { useTimeValidation } from '../../hooks/useTimeValidation';
describe('useTimeValidation', () => {
  describe('초기 상태', () => {
    it('초기 에러 상태가 null로 설정되어야 한다', () => {
      // Given & When: useTimeValidation 훅을 초기화하면
      const { result } = renderHook(() => useTimeValidation());

      // Then: 모든 에러 상태가 null이어야 한다
      expect(result.current.startTimeError).toBeNull();
      expect(result.current.endTimeError).toBeNull();
    });
  });

  describe('상태 업데이트', () => {
    it('validateStartTime 호출 시 상태가 업데이트되어야 한다', () => {
      // Given: useTimeValidation 훅이 초기화되어 있고
      const { result } = renderHook(() => useTimeValidation());

      // When: validateStartTime을 호출하면
      act(() => {
        result.current.validateStartTime('11:00', '10:00');
      });

      // Then: 상태가 업데이트되어야 한다
      expect(result.current.startTimeError).not.toBeNull();
      expect(result.current.endTimeError).not.toBeNull();
    });

    it('validateEndTime 호출 시 상태가 업데이트되어야 한다', () => {
      // Given: useTimeValidation 훅이 초기화되어 있고
      const { result } = renderHook(() => useTimeValidation());

      // When: validateEndTime을 호출하면
      act(() => {
        result.current.validateEndTime('11:00', '10:00');
      });

      // Then: 상태가 업데이트되어야 한다
      expect(result.current.startTimeError).not.toBeNull();
      expect(result.current.endTimeError).not.toBeNull();
    });
  });

  describe('에러 상태 초기화', () => {
    it('오류 상태에서 정상적인 값으로 변경하면 상태가 초기화되어야 한다', () => {
      // Given: 오류 상태인 useTimeValidation 훅이 있고
      const { result } = renderHook(() => useTimeValidation());

      act(() => {
        result.current.validateStartTime('11:00', '10:00');
      });

      expect(result.current.startTimeError).not.toBeNull();

      // When: 정상적인 값으로 다시 검증하면
      act(() => {
        result.current.validateStartTime('09:00', '10:00');
      });

      // Then: 오류가 초기화되어야 한다
      expect(result.current.startTimeError).toBeNull();
      expect(result.current.endTimeError).toBeNull();
    });
  });
});
