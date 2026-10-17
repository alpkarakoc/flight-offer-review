# Accessibility and Focus Lifecycle Audit

**Context:** A limited-scope portfolio demo implementing a synthetic flight offer inspection and revalidation flow, passing automated tests, production build, and real HTTP smoke checks on CI.

## Testing Environment
* **Date:** 2026-10-17
* **OS / Browser / Screen Reader:** Not run (Automated DOM logic validation only)

## 1. Search Flow & Live Regions
* **Expected Behavior:** Keyboard navigation reaches "Search offers". On submission, the `aria-live="polite"` region renders the "Loading offers..." text.
* **Status:** DOM logic verified. Manual VoiceOver test: Not run.

## 2. Filtering & Focus Retention
* **Expected Behavior:** Changing the "Max stops" filter triggers a re-render. If the active focus drops to the `body` during this DOM update, `ensureFocusMaintained()` explicitly forces focus to the **"Sort offers"** select element to prevent the user from losing their navigation context.
* **Status:** Code logic verified. Manual keyboard test: Not run.

## 3. Offer Details Expansion
* **Expected Behavior:** Activating the "Show details" button toggles its `aria-expanded` state to `true` and mounts the region linked by `aria-controls`. A screen reader will announce the state change of the button, but the user must manually navigate into the newly rendered region to read the segments and price breakdown. Focus remains on the toggle button.
* **Status:** DOM logic verified. Manual VoiceOver test: Not run.

## 4. Selection & Conflict Handling
* **Expected Behavior (Validation):** Selecting an offer disables the button and updates the `aria-live="assertive"` region to "Validating selection…".
* **Expected Behavior (Success vs Conflict):** Under normal flow, the client sends the current version (e.g., `2`), and the server returns `200 VALIDATED`. To verify the `409 OFFER_STALE` handling in the UI, the client payload must be artificially modified to send an older version. Upon a `409` response, the `aria-live` region updates to "This offer has changed. Search again."
* **Status:** Component logic verified. Manual VoiceOver test: Not run.
