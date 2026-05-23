# Guest vs Full Account Access Policy

The system supports guest sessions via Firebase anonymous authentication for core tracking APIs, while AI insight generation requires a full account session (non-anonymous identity). We chose this split to preserve low-friction onboarding and offline-capable tracking with real user IDs, while reserving higher-cost/personalized AI features for permanent accounts.
