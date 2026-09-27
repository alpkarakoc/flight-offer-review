# Flight Offer Review

A portfolio project for exploring airline offers with a frontend-first architecture. This is an independent demonstration using synthetic data; it does not integrate with Amadeus or issue tickets.

## Goal

Help a user inspect, filter, compare, and select a flight offer while preserving clear states for loading, errors, and unavailable offers.

## Planned stack

- Angular and TypeScript for the client.
- Java and Spring Boot for a small REST API.
- In-memory synthetic fixtures for the first vertical slice; persistence is deferred.
- Angular unit/component tests and JUnit API tests.

The planned stack describes future work, not implemented functionality. See `docs/requirements.md` for the contract and `docs/decisions.md` for scope decisions.

## Current status

The Angular client displays one synthetic flight offer from a typed fixture. The offer list has separate success, empty, loading, and error views. Component tests verify the displayed offer fields and these views.

Verified locally with `npm test -- --watch=false`: 2 test files, 5 tests passed.

The component can search a synthetic fixture source and display loading followed by results. Search inputs are not connected to the UI yet, and no network request is made. There is no backend, real fare data, booking, payment, or ticket issuance.

## Delivery sequence

1. Implement an accessible, responsive offer list against typed fixtures; test sorting, filtering, and state transitions.
2. Add a Java REST read endpoint, contract checks, and client integration.
3. Add offer selection with server-side revalidation and explicit conflict handling.
4. Add CI, run instructions, screenshots, and a short limitations section after execution evidence exists.
