// solid/02-ocp.js
//
// 
// SOLID · "O" — Open/Closed Principle (OCP)                                 
// "Software entities should be OPEN for extension, but CLOSED for          
//  modification."                                                           
//
//
// ── BEFORE (the session-1 smell) ────────────────────────────────────────────
// ../rental.js prices everything by looking up one flat table:
//
//     const DAILY_RATES = { 'laptop': 10, 'mac-desktop': 20, 'tablet': 15 };
//     function calculateCharge(pcType, duration) {
//       const dailyRate = DAILY_RATES[pcType];
//       if (!dailyRate) throw new Error(`Unknown PC type: ${pcType}`);
//       return dailyRate * duration;       // <-- ONE pricing rule for everyone
//     }
//
// Every new requirement forces us to EDIT this working function:
//   • A new device?            → edit the table.
//   • "Rent a week, get a day free"? → add an `if (duration > 7) ...`.
//   • A premium tier with setup fees? → another `if`.
// The function grows an ever-longer chain of conditionals, and each edit risks
// breaking the cases that already worked. That is "closed for extension".
//
// ── AFTER (open for extension, closed for modification) ─────────────────────
// We invert the shape: instead of one function that knows every rule, we keep
// a REGISTRY of pricing strategies. Each device type maps to a small function
// (duration) => charge. Adding behaviour = REGISTERING a new strategy. The core
// priceRental() below never has to change again — it is closed for modification
// yet the system stays open for extension.

const strategies = new Map();

// Register (or override) the pricing strategy for a device type.
// strategyFn: (duration: number) => number
function registerPricingStrategy(type, strategyFn) {
  strategies.set(type, strategyFn);
}

// The stable core. Notice there are NO device-specific `if`s here — it simply
// dispatches to whichever strategy was registered. This body stays frozen even
// as the catalogue of devices and deals grows without bound.
function priceRental(type, duration) {
  const strategy = strategies.get(type);
  if (!strategy) {
    throw new Error(`Unknown PC type: ${type}`);
  }
  return strategy(duration);
}

// A tiny helper for the common "flat daily rate" case so registrations read well.
const flatRate = (perDay) => (duration) => perDay * duration;

// ── Built-in strategies ─────────────────────────────────────────────────────
// The original three, expressed as strategies instead of table rows...
registerPricingStrategy('laptop', flatRate(10));
registerPricingStrategy('mac-desktop', flatRate(20));
registerPricingStrategy('tablet', flatRate(15));

// ...plus a NEW kind of rule the old flat table simply could not express:
// a weekly-discount device — $12/day, but every full week is billed as 6 days.
// We added this WITHOUT touching priceRental(). That is OCP in action.
registerPricingStrategy('projector', (duration) => {
  const weeks = Math.floor(duration / 7);
  const remainder = duration % 7;
  return (weeks * 6 + remainder) * 12;
});

// ── NOTE ───────────────────────────────────────────────────────
// OCP is a guideline, not a law. A registry adds indirection: to know how a
// laptop is priced you must now hunt for its registration instead of reading one
// table. For a short list of stable cases, a plain object or a 3-case `switch`
// is clearer. Reach for this machinery when the catalogue is ACTUALLY volatile.
//
// ── TODO · YOUR TURN (practice) ─────────────────────────────────────────────
// The worked example above is the `projector` weekly-discount strategy — added
// without touching priceRental(). Your exercise: do the same for a `monitor`.
//   1. Invent a rule of your own (e.g. $8/day, but the first day is free).
//   2. Register it with registerPricingStrategy('monitor', (duration) => ...).
//      DO NOT edit priceRental() — that is the whole point of OCP.
//   3. In 02-ocp.test.js, add a test proving your `monitor` prices correctly.
// Bonus: try also registering it at runtime *inside the test* and confirm the
// shipped module never had to change.

module.exports = { registerPricingStrategy, priceRental };
