import { describe, it, expect } from 'vitest';

import { notificationOptions, categories, weekDays } from '../../utils/constants';

describe('constants', () => {
  describe('notificationOptions', () => {
    it('알림 옵션이 올바른 구조를 가져야 한다', () => {
      expect(notificationOptions).toHaveLength(5);

      notificationOptions.forEach((option) => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.value).toBe('number');
        expect(typeof option.label).toBe('string');
      });
    });

    it('알림 옵션 값이 올바른 순서로 정렬되어야 한다', () => {
      const values = notificationOptions.map((option) => option.value);
      expect(values).toEqual([1, 10, 60, 120, 1440]);
    });

    it('알림 옵션 라벨이 올바르게 설정되어야 한다', () => {
      const labels = notificationOptions.map((option) => option.label);
      expect(labels).toEqual(['1분 전', '10분 전', '1시간 전', '2시간 전', '1일 전']);
    });

    it('알림 옵션 값이 분 단위로 정확해야 한다', () => {
      expect(notificationOptions[0].value).toBe(1); // 1분
      expect(notificationOptions[1].value).toBe(10); // 10분
      expect(notificationOptions[2].value).toBe(60); // 1시간 (60분)
      expect(notificationOptions[3].value).toBe(120); // 2시간 (120분)
      expect(notificationOptions[4].value).toBe(1440); // 1일 (1440분)
    });
  });

  describe('categories', () => {
    it('카테고리가 올바른 개수여야 한다', () => {
      expect(categories).toHaveLength(4);
    });

    it('카테고리가 올바른 순서로 정렬되어야 한다', () => {
      expect(categories).toEqual(['업무', '개인', '가족', '기타']);
    });

    it('모든 카테고리가 문자열이어야 한다', () => {
      categories.forEach((category) => {
        expect(typeof category).toBe('string');
        expect(category.length).toBeGreaterThan(0);
      });
    });

    it('카테고리에 중복이 없어야 한다', () => {
      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBe(categories.length);
    });
  });

  describe('weekDays', () => {
    it('요일이 7개여야 한다', () => {
      expect(weekDays).toHaveLength(7);
    });

    it('요일이 올바른 순서로 정렬되어야 한다', () => {
      expect(weekDays).toEqual(['일', '월', '화', '수', '목', '금', '토']);
    });

    it('모든 요일이 한 글자여야 한다', () => {
      weekDays.forEach((day) => {
        expect(typeof day).toBe('string');
        expect(day.length).toBe(1);
      });
    });

    it('요일에 중복이 없어야 한다', () => {
      const uniqueDays = new Set(weekDays);
      expect(uniqueDays.size).toBe(weekDays.length);
    });

    it('요일이 한국어로 표시되어야 한다', () => {
      const koreanDays = ['일', '월', '화', '수', '목', '금', '토'];
      expect(weekDays).toEqual(koreanDays);
    });
  });
});
