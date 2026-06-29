// rental.test.js
const { calculateCharge } = require('./rental');
test('calculates charge for a laptop rental', () => {
  const charge = calculateCharge('laptop', 3);
  expect(charge).toBe(30);
});

// rental.test.js
test('calculates a higher charge for a mac desktop rental', () => {
  const charge = calculateCharge('mac-desktop', 3);
  expect(charge).toBe(60);
});

test('throws an error for an unrecognised PC type', () => {
  expect(() => calculateCharge('gaming-chair', 2)).toThrow('Unknown PC type');
});
