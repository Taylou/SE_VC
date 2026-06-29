// solid/03-dip.test.js
const { createPricer, inMemoryRateProvider } = require('./03-dip');

describe('DIP — the pricer works with a normal provider', () => {
  const pricer = createPricer(
    inMemoryRateProvider({ 'laptop': 10, 'mac-desktop': 20, 'tablet': 15 })
  );

  test('prices using the injected rates', () => {
    expect(pricer.charge('laptop', 3)).toBe(30);
    expect(pricer.charge('mac-desktop', 3)).toBe(60);
  });

  test('rejects an unknown PC type', () => {
    expect(() => pricer.charge('gaming-chair', 2)).toThrow('Unknown PC type');
  });
});

describe('DIP — the payoff: inject a stub, no real data needed', () => {
  // Because the pricer depends on the abstraction, a test can supply ANY object
  // with a getDailyRate(type) method. No database, no config file, no network —
  // just a tiny hand-written stub. The high-level policy is testable in isolation.
  test('a one-line stub provider drives the pricer', () => {
    const stubProvider = { getDailyRate: () => 100 }; // every device is $100/day
    const pricer = createPricer(stubProvider);
    expect(pricer.charge('anything', 2)).toBe(200);
  });

  test('providers are interchangeable without touching the pricer', () => {
    const cheap = createPricer(inMemoryRateProvider({ laptop: 5 }));
    const premium = createPricer(inMemoryRateProvider({ laptop: 50 }));
    expect(cheap.charge('laptop', 2)).toBe(10);
    expect(premium.charge('laptop', 2)).toBe(100);
  });
});
