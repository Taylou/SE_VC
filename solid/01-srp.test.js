// solid/01-srp.test.js
//
// The payoff of SRP shows up in the tests: because pricing and presentation are
// separate, we can test each responsibility ON ITS OWN. A pricing test never
// has to parse a receipt string, and a formatting test never has to know a rate.
const { calculateCharge, formatStatement } = require('./01-srp');

describe('SRP — pricing responsibility (in isolation)', () => {
  test('prices a laptop rental', () => {
    expect(calculateCharge('laptop', 3)).toBe(30);
  });

  test('prices a mac-desktop rental at the higher rate', () => {
    expect(calculateCharge('mac-desktop', 3)).toBe(60);
  });

  test('rejects an unknown PC type', () => {
    expect(() => calculateCharge('gaming-chair', 2)).toThrow('Unknown PC type');
  });
});

describe('SRP — presentation responsibility (in isolation)', () => {
  // Note: no rates appear in this test. Formatting only renders numbers it is
  // handed, so it is decoupled from however those numbers were produced.
  test('renders a multi-line statement with a total', () => {
    const statement = formatStatement('Ada', [
      { pcType: 'laptop', duration: 3, charge: 30 },
      { pcType: 'tablet', duration: 2, charge: 30 },
    ]);

    expect(statement).toContain('Rental statement for Ada');
    expect(statement).toContain('laptop — 3 day(s): $30');
    expect(statement).toContain('Total owed: $60');
  });
});

describe('SRP — the two responsibilities compose cleanly', () => {
  test('pricing feeds presentation without either knowing the other', () => {
    const items = [
      { pcType: 'laptop', duration: 2 },
      { pcType: 'mac-desktop', duration: 1 },
    ].map((r) => ({ ...r, charge: calculateCharge(r.pcType, r.duration) }));

    const statement = formatStatement('Grace', items);
    expect(statement).toContain('Total owed: $40'); // 20 + 20
  });
});
