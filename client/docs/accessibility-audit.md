# Manual Accessibility and E2E Keyboard Verification Report

**Context:** This report validates the R5 requirements (Keyboard navigation, Focus management, Screen Reader compatibility) for the Flight Offer Portfolio Demo.

## 1. Search Flow & Live Regions
* **Input:** `[Tab]` through "Origin", "Destination", "Departure date" inputs. Press `[Enter]` on "Search offers".
* **System:** Angular triggers `search()` and state transitions.
* **Output:** Focus shifts correctly. VoiceOver detects `aria-live="polite"` region and announces: "Loading offers...".

## 2. Filtering & Focus Retention
* **Input:** `[Tab]` to "Max stops" select element. Press `[Arrow Down]` to change to "Direct only".
* **System:** Angular filters results and executes `ensureFocusMaintained()`.
* **Output:** Focus is successfully forced back to the select element. VoiceOver reads the new selection without losing context.

## 3. Offer Details Expansion (aria-controls & aria-expanded)
* **Input:** `[Tab]` to the first offer's action buttons. Focus lands on "Show details for offer OFFER-1". Press `[Space]` or `[Enter]`.
* **System:** `toggleDetails` fires. `expandedOfferIds` mutates.
* **Output:** `aria-expanded` shifts from "false" to "true". The `#details-OFFER-1` region renders. VoiceOver announces the expanded state and the price breakdown elements natively. Pressing `[Enter]` again collapses the region, reverting `aria-expanded` to "false". Focus remains on the toggle button.

## 4. Selection & Conflict Handling (OFFER_STALE)
* **Input:** `[Tab]` to "Validate selection for offer OFFER-1" button. Press `[Enter]`.
* **System:** Client disables the button, changes status to `validating`, and dispatches HTTP POST. Server delays, then rejects with `409 OFFER_STALE`.
* **Output:** 
  1. Immediate VoiceOver announcement via `aria-live="assertive"`: "Validating selection…"
  2. Post-rejection announcement via `aria-live="assertive"`: "This offer has changed. Search again."
  3. Visual state shifts to conflict styling without any implicit booking confirmations.

**Verdict:** The application fully supports keyboard-only operation, maintains explicit focus lifecycle during DOM mutations, and broadcasts strict, descriptive state transitions to screen readers. R5 criteria met.
