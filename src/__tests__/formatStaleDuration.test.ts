import { formatStaleDuration } from '@/lib/utils';

describe('formatStaleDuration', () => {
  it('shows minutes only from 0 to 59', () => {
    expect(formatStaleDuration(0)).toBe('0 min');
    expect(formatStaleDuration(15)).toBe('15 min');
    expect(formatStaleDuration(59)).toBe('59 min');
  });

  it('shows hours and minutes under one day', () => {
    expect(formatStaleDuration(60)).toBe('1h 0min');
    expect(formatStaleDuration(90)).toBe('1h 30min');
    expect(formatStaleDuration(1439)).toBe('23h 59min');
  });

  it('shows days, hours, and minutes at one day or more', () => {
    expect(formatStaleDuration(1440)).toBe('1d 0h 0min');
    expect(formatStaleDuration(1500)).toBe('1d 1h 0min');
    expect(formatStaleDuration(1565)).toBe('1d 2h 5min');
  });
});