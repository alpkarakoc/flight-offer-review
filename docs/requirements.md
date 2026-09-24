# Requirements baseline — v0.1

## Context and boundaries

The product is a portfolio demonstration, not a booking service. All offers, prices, and availability are synthetic. No customer accounts, payment, ticket issuance, or third-party API access are in scope.

## User stories and acceptance criteria

### R1 — Browse offers

Given a valid origin, destination, and departure date, when a search completes, the user sees a list of offers with departure/arrival time, duration, stops, total price, currency, and a stable offer identifier. Empty results have a distinct message. Loading and request failure have distinct visible states.

### R2 — Filter and sort

The user can filter by maximum stops and sort by total price or duration. Filtering and sorting are deterministic and never mutate the source collection. Price comparisons apply only within a single currency; mixed-currency results are rejected until conversion is designed.

### R3 — Inspect an offer

The user can inspect segments and a transparent total price breakdown. No UI label may imply that a displayed offer is already booked.

### R4 — Select an offer

Selecting an offer sends its identifier and version to the server for revalidation. The server responds with a selection confirmation or an explicit unavailable/stale response. A stale selection cannot be presented as confirmed.

### R5 — Accessibility

The main flow works with keyboard navigation, visible focus, labeled inputs, and text announcements of loading, error, and empty states. Verify with automated checks plus a manual keyboard pass.

## Proposed API contract (to implement in slice 2)

`GET /api/offers?origin=IST&destination=FRA&date=YYYY-MM-DD` returns a JSON array of typed offers. Invalid input returns 400 with a documented error body. `POST /api/selections` accepts `{ "offerId": "...", "version": 1 }`; a stale version or unavailable offer returns 409. No payment or booking is performed.

## Quality attributes and gates

| Attribute | Requirement | Verification |
| --- | --- | --- |
| Correctness | Sorting and filtering preserve the fixture set and yield deterministic order | Unit tests with ties, empty results, and invalid inputs |
| Failure safety | Network failure and stale offer never appear as successful selection | Component and API contract tests |
| Accessibility | Core flow is keyboard operable and status text is perceivable | Automated checks and documented manual pass |
| Maintainability | API models have one documented schema and client mapping is isolated | Type checks and contract tests |
| Reproducibility | A clean checkout can run checks with pinned dependencies | CI on a clean runner |

No numerical performance threshold is asserted before representative fixtures and a measurement environment exist.

## Release criteria

The first slice is done only when the offer list runs locally, typed fixtures cover success/empty/error cases, and its tests pass. A public README must state what was actually run and what remains unimplemented.
