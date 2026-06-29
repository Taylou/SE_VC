// solid/01-srp.js
//
//
// SOLID · "S" — Single Responsibility Principle (SRP)                      
// "A module should have one, and only one, reason to change."             
//
//
// ── BEFORE (the session-1 smell) ────────────────────────────────────────────
// In ../rental.js, calculateCharge() does exactly one thing — it prices a
// rental. That is fine today. But watch what happens the moment the business
// says "we also need to email customers a statement":
//
//     function calculateCharge(pcType, duration) {
//       const dailyRate = DAILY_RATES[pcType];
//       const charge = dailyRate * duration;
//       // ...now we start formatting a human-readable receipt right here:
//       return `Receipt for ${pcType}: ${duration} days @ $${dailyRate} = $${charge}`;
//     }
//
// That one function now has TWO reasons to change:
//   1. The PRICING RULES change (rates, discounts, taxes).
//   2. The PRESENTATION changes (wording, currency symbol, HTML email, PDF...).
// Two reasons to change in one place = a violation of SRP. A copy tweak now
// risks breaking the maths, and a tax change now risks breaking the wording.
//
// ── AFTER (one responsibility per module) ───────────────────────────────────
// We split the work along its two reasons to change. Each function below is
// pure and does ONE job, so each has exactly one reason to change.

const DAILY_RATES = {
  'laptop': 10,
  'mac-desktop': 20,
  'tablet': 15,
};

// Responsibility #1: PRICING. Changes only when pricing rules change.
// (Rates are passed in by default so the function never reaches out to global
//  state — that also sets up the Dependency Inversion lesson in 03-dip.js.)
function calculateCharge(pcType, duration, rates = DAILY_RATES) {
  const dailyRate = rates[pcType];
  if (!dailyRate) {
    throw new Error(`Unknown PC type: ${pcType}`);
  }
  return dailyRate * duration;
}

// Responsibility #2: PRESENTATION. Changes only when the receipt's look changes.
// It knows NOTHING about how a charge is calculated — it just renders numbers.
// lineItems: Array<{ pcType: string, duration: number, charge: number }>
function formatStatement(customer, lineItems) {
  const lines = lineItems.map(
    (item) =>
      `  ${item.pcType} — ${item.duration} day(s): $${item.charge}`
  );
  const total = lineItems.reduce((sum, item) => sum + item.charge, 0);
  return [
    `Rental statement for ${customer}`,
    ...lines,
    `  Total owed: $${total}`,
  ].join('\n');
}

// ── NOTE ───────────────────────────────────────────────────────
// SRP is a guideline, not a law. Splitting a small, cohesive function into many
// one-liners can HURT readability. Separate things that change for *different*
// reasons; keep together things that change together. If pricing and formatting
// always changed as a pair, leaving them fused would be the better call.
//
// ── TODO · YOUR TURN (practice) ─────────────────────────────────────────────
// We separated TWO responsibilities (pricing, presentation). A third one is
// creeping in: TAX. Right now nobody applies tax. Your exercise:
//   1. Add a new single-responsibility function, e.g.
//        function applyTax(charge, taxRate) { ... }
//      that takes a pre-tax charge and returns the taxed amount. It must know
//      NOTHING about rates or formatting — one job, one reason to change.
//   2. Export it below.
//   3. In 01-srp.test.js, test it IN ISOLATION (no rates, no statement strings),
//      mirroring the existing "in isolation" describe blocks.
// Hint: keep it pure — pass taxRate in, don't read a global.

module.exports = { calculateCharge, formatStatement, DAILY_RATES };
