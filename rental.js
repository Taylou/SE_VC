// rental.js
const DAILY_RATES = {
  'laptop': 10,
  'mac-desktop': 20,
  'tablet': 15
};
function calculateCharge(pcType, duration) {
  const dailyRate = DAILY_RATES[pcType];
  if (!dailyRate) {
    throw new Error(`Unknown PC type: ${pcType}`);
  }
  return dailyRate * duration;
}
module.exports = { calculateCharge };
