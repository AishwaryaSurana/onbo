import { safeDisplayName } from '@/store/sessionStore';

describe('safeDisplayName (PLAN.md 4.7 — never greet with a raw email)', () => {
  it('returns first name for a normal display name', () => {
    expect(safeDisplayName('Alex Rivera')).toBe('Alex');
  });
  it('falls back to "there" for an email', () => {
    expect(safeDisplayName('alex+test@aragon.ai')).toBe('there');
  });
  it('falls back to "there" for null/empty', () => {
    expect(safeDisplayName(null)).toBe('there');
    expect(safeDisplayName('   ')).toBe('there');
  });
});
