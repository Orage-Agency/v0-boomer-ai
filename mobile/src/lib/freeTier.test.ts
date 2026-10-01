import { chatCounterStorageKey, todayKey } from './freeTier';

describe('free-tier storage keys', () => {
  it('uses the local calendar date for a daily chat quota', () => {
    const date = new Date(2026, 9, 1, 23, 59);

    expect(todayKey(date)).toBe('2026-10-01');
    expect(chatCounterStorageKey(todayKey(date))).toBe(
      'boomer.freeTier.chat.2026-10-01',
    );
  });

  it('pads single-digit months and days', () => {
    expect(todayKey(new Date(2026, 0, 9))).toBe('2026-01-09');
  });
});
