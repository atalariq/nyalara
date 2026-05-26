# Nyalara Product Requirements Document

## Product Overview

Nyalara is a mobile-first electricity tracking app built around a simple idea: people understand their energy habits better when they can start from the devices they already recognize. Instead of asking users to reason from abstract utility data alone, Nyalara frames electricity usage through household devices, daily patterns, and practical next steps.

The current product is intentionally focused on electricity usage only. It does not attempt to become a full carbon lifestyle platform, a smart meter platform, or a generic sustainability dashboard.

## Problem

Household electricity usage is easy to ignore until it becomes expensive or wasteful. Users often know that their bill changes, but not which devices contribute the most, how their habits evolve day to day, or what specific actions would make a meaningful difference.

Nyalara addresses that gap by making device-level electricity tracking easier to follow and easier to act on.

## Target Users

Primary users:

- students and young adults living in rented rooms, apartments, or family homes
- households that want a simpler way to understand electricity patterns
- users who want guidance without needing deep technical knowledge of kWh or CO2e

Secondary users:

- developers joining the project and needing a clear product narrative
- technical reviewers who need to understand the product shape quickly

## Product Positioning

Nyalara is a device-centric electricity tracking app.

That wording matters. The product experience is centered on devices, daily visibility, and behavior change. Technical work around backend-verified usage records, summaries, and synchronization supports that experience, but it is not the primary public-facing story.

## Current Demo Highlights

- account access through email and Google sign-in, with guest access for lightweight exploration
- device onboarding and inventory management
- device toggle and monitoring flows
- dashboard views for daily electricity progress
- energy and history views for usage patterns
- smart recommendations and AI-powered insights
- basic user profile and household preferences

## Core User Flow

1. The user signs in.
2. The user adds the household devices they want to track.
3. The user monitors electricity behavior through those devices.
4. The app turns device usage into dashboard and history views.
5. The user receives recommendations and insight to improve energy habits.

## Product Direction

Nyalara is moving toward a stronger backend-verified platform while preserving its device-centric product story.

That direction includes:

- cleaner backend-owned persistence for electricity usage data
- more reliable summaries and derived insights
- clearer separation between estimated client-side feedback and verified server-side state
- stronger synchronization and future-ready data flows

This direction should be treated as platform evolution, not as a replacement for the public product narrative.

## Technical Foundation

The current system is built with:

- Expo and React Native for the mobile client
- Hono and TypeScript for the backend API
- Firebase Auth for authentication
- Firestore for data storage
- Google Cloud Run for backend deployment
- Gemini for insight generation

At a high level:

- the mobile app owns the user-facing experience
- Firebase Auth provides session identity
- the backend API handles protected logic and platform-level processing
- Firestore stores user-scoped and system data

## Non-Goals

Nyalara is not currently trying to be:

- a transport, food, or waste tracking product
- a smart home hardware platform
- a PLN billing reconstruction tool
- a carbon offset marketplace
- a gamified rewards system
- a full compliance-grade carbon accounting product

## Success Criteria

For the current product stage, success means:

- a new user can get into the app and understand the value quickly
- the device-centric tracking flow is easy to follow
- the dashboard and history views feel coherent and useful
- insights are practical enough to support behavior change
- the product narrative stays aligned across mobile, backend, and documentation
