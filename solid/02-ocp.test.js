// solid/02-ocp.test.js
const { registerPricingStrategy, priceRental } = require('./02-ocp');

describe('OCP — existing behaviour still works', () => {
  test('flat-rate devices price as before', () => {
    expect(priceRental('laptop', 3)).toBe(30);      // 10 * 3
    expect(priceRental('mac-desktop', 3)).toBe(60);  // 20 * 3
    expect(priceRental('tablet', 2)).toBe(30);       // 15 * 2
  });

  test('the built-in weekly-discount device applies its own rule', () => {
    // projector: $12/day, each full week billed as 6 days.
    expect(priceRental('projector', 3)).toBe(36);    // 3 * 12
    expect(priceRental('projector', 7)).toBe(72);    // 1 week => 6 * 12
    expect(priceRental('projector', 9)).toBe(96);    // 6 days + 2 days => 8 * 12
  });

  test('an unregistered type is rejected', () => {
    expect(() => priceRental('gaming-chair', 2)).toThrow('Unknown PC type');
  });
});

describe('OCP — the payoff: extend without modifying', () => {
  // We add a brand-new pricing rule RIGHT HERE in the test — never editing
  // 02-ocp.js. If the core were a switch/if-chain, this would be impossible
  // without changing (and risking) the shipped code.
  test('a freshly registered strategy just works', () => {
    registerPricingStrategy('vr-headset', (duration) => 25 * duration + 5); // + cleaning fee
    expect(priceRental('vr-headset', 2)).toBe(55); // 25*2 + 5
  });

  test('registering a type can also override it (closed core, open catalogue)', () => {
    registerPricingStrategy('laptop', (duration) => 8 * duration); // promo rate
    expect(priceRental('laptop', 3)).toBe(24);
  });
});
