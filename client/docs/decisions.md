# Decision log

## D1 — Domain and honesty

Use synthetic flight offers to demonstrate a travel workflow. Do not use Amadeus branding, private APIs, or claims of real fares or ticket issuance. This keeps the project independently reproducible.

## D2 — Frontend first

The target role explicitly emphasizes frontend work with Angular/TypeScript and Java/Spring on the backend. Build one testable UI workflow before adding backend infrastructure. Do not introduce Kubernetes, authentication, or multiple services without a requirement.

## D3 — Selection is not booking

An offer can change after display. Selection requires a server check of offer identifier and version; a conflict is shown explicitly. Payment and reservation semantics remain out of scope.

## D4 — AI-assisted work

Any generated suggestion is reviewed against the requirements, inspected in the diff, and exercised with relevant tests. Project claims describe the developer's actual decisions and verified results. No fabricated experience or test evidence.
