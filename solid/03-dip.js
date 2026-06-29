// solid/03-dip.js
//
// 
// SOLID · "D" — Dependency Inversion Principle (DIP)                        
// "High-level modules should not depend on low-level modules. Both should  
//  depend on abstractions. Abstractions should not depend on details;      
//  details should depend on abstractions."                                 
// 
//
// ── BEFORE (the session-1 smell) ────────────────────────────────────────────
// In ../rental.js the high-level POLICY (how we charge) reaches straight down
// and grabs a low-level DETAIL (a hardcoded constant living in this same file):
//
//     const DAILY_RATES = { 'laptop': 10, ... };   // <-- the detail
//     function calculateCharge(pcType, duration) {
//       const dailyRate = DAILY_RATES[pcType];      // <-- policy bound to detail
//       ...
//     }
//
// The pricing policy now CANNOT exist without that one in-memory object. Want
// rates from a database? a config file? a remote API? a different table in a
// test? You must rewrite calculateCharge every time. The arrow of dependency
// points the wrong way: high-level → low-level detail.
//
// ── AFTER (depend on an abstraction, inject the detail) ─────────────────────
// We INVERT the arrow. The high-level pricer is handed a `rateProvider` — an
// abstraction defined only by its shape (a "contract"):
//
//     interface RateProvider { getDailyRate(type): number }   // (conceptual; this is plain JS)
//
// The pricer depends on that contract, not on any concrete source of rates.
// Concrete providers (in-memory, DB, HTTP, a test stub...) all implement the
// same shape and are passed IN. Now both the policy and the details depend on
// the abstraction — exactly what DIP asks for.

// High-level module: knows the pricing POLICY, knows nothing about where rates
// come from. `rateProvider` is the injected abstraction.
function createPricer(rateProvider) {
  return {
    charge(pcType, duration) {
      const dailyRate = rateProvider.getDailyRate(pcType);
      if (dailyRate == null) {
        throw new Error(`Unknown PC type: ${pcType}`);
      }
      return dailyRate * duration;
    },
  };
}

// One concrete detail that satisfies the contract: rates held in memory.
// Swapping this for a databaseRateProvider / httpRateProvider would require
// ZERO changes to createPricer above — that is the whole point.
function inMemoryRateProvider(rates) {
  return {
    getDailyRate(type) {
      return rates[type]; // undefined for unknown types -> caller throws
    },
  };
}

// ── NOTE ───────────────────────────────────────────────────────
// DIP is a guideline, not a law. Injecting a provider is worth it only when the
// source of rates genuinely varies. If rates are a fixed constant forever, a
// hardcoded object is clearer — the abstraction would just hide the one thing a
// reader wants to see, and add wiring with no payoff. Don't invert a dependency
// that was never going to change.
//
// ── TODO · YOUR TURN (practice) ─────────────────────────────────────────────
// The worked example above is `inMemoryRateProvider`. Your exercise: write a
// SECOND provider that satisfies the SAME contract — any object with a
// getDailyRate(type) method — and feed it to the UNCHANGED createPricer().
//   1. Implement e.g. envRateProvider() that reads rates from environment
//      variables, like process.env.RATE_LAPTOP (parse it to a number).
//   2. Export it below.
//   3. In 03-dip.test.js, set a couple of env vars, build the pricer with your
//      new provider, and assert the charge — proving createPricer didn't change.
// Takeaway: the high-level policy stayed frozen; only a new detail plugged in.

module.exports = { createPricer, inMemoryRateProvider };
