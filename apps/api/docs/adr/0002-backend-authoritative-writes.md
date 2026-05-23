# Backend-Authoritative Writes for Canonical Data

Canonical electricity usage, monthly summaries, and insight documents are written through backend APIs, not direct mobile Firestore writes. We chose this to enforce verification rules (`server_verified` status, trusted timestamps, summary integrity), reduce reconciliation bugs from client-side writes, and keep ownership of trusted fields in one place.
