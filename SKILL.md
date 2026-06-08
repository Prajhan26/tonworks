---
name: tonwork
description: Build TONWORK, a Telegram-native bounty platform on TON where Mira AI helps verify completed work before escrowed funds are released. Use this skill for all TONWORK development sessions. Triggers on "tonwork", "bounty platform", "mira verify", "ton escrow", or "continue tonwork build".
---

# TONWORK

TONWORK is a Telegram-native bounty platform on TON.

Posters publish tasks, fund escrow, workers complete the work, and Mira helps verify whether the submission meets the requirements before payout is released.

**Tagline:** "Post work. Get paid. Mira verifies."

## Project Goal

Build a demo-ready hackathon product for the STON.fi Vibe Coding Hackathon, Mira AI Track.

The demo should prove one core idea:

1. A poster can post a bounty and fund it.
2. A worker can claim the bounty and submit work.
3. Mira can be used as the verification layer.
4. The app can release TON to the worker after approval.

## Product Summary

Crypto bounties usually depend on trust between strangers.

TONWORK adds:

- escrowed funds
- structured work submission
- AI-assisted verification through Mira
- payout release after approval

This is not yet a trustless smart contract protocol. V1 is a fast demo product with a custodial backend wallet. If asked, describe the tradeoff clearly: V2 should move escrow logic into a Tact smart contract.

## Core User Types

### Poster

The poster has work that needs to be done and funds the bounty.

Primary flow:

1. Connect TON wallet.
2. Create bounty with title, description, requirements, and TON amount.
3. Send TON to the escrow wallet.
4. Wait for a worker submission.
5. Open Mira for verification.
6. Record approved or rejected verdict in the app.
7. Release payment if approved.

### Worker

The worker wants to earn TON by completing posted work.

Primary flow:

1. Browse open bounties.
2. Claim a bounty.
3. Complete the work.
4. Submit text or a URL.
5. Receive payment after approval.

## Verification Model

Mira is part of the product experience, but V1 uses a manual deep-link workflow rather than a direct API integration.

### Verification command

`/verify`

The poster sends Mira:

- bounty requirements
- submitted work

Mira returns:

- `APPROVED` or `REJECTED`
- a short reason

### Deep link

`https://t.me/mira?start=verify`

Rules:

- keep the start parameter minimal
- send the real verification context as a chat message
- keep the in-app prompt easy to copy and paste

### Supported work types

Keep the UI and copy aligned with these supported categories:

- written content
- research and analysis
- translations
- code review from a GitHub link or similar repo link

Avoid positioning V1 as suitable for:

- visual design review
- video review
- highly subjective creative judgment

## Locked Scope

### In Scope

- TON wallet connect
- create bounty
- escrow funding flow
- open bounties board
- claim bounty
- submit work as text or URL
- Mira verification handoff
- record approval or rejection
- release payment from backend wallet
- status tracking from creation to payout

### Out of Scope

- smart contract escrow
- reputation system
- file uploads
- push notifications
- advanced search and filters
- categories and tags
- dispute resolution workflow
- mobile app
- multi-token support
- ratings and reviews

If a feature is not in scope, move it to V2 instead of adding it mid-build.

## Technical Direction

### Stack

- Next.js 14 App Router
- TypeScript in strict mode
- Tailwind CSS
- Supabase for database and auth
- `@tonconnect/ui-react` for wallet connect
- `ton` and `ton-crypto` for server-side wallet operations
- Vercel for deployment

### Important clarification

Use `@tonconnect/ui-react` as the wallet connection library for V1.

The earlier draft referenced "AppKit" in parts of the flow. For implementation, treat TON Connect as the chosen wallet integration unless the project intentionally switches later.

### Architecture

```text
Frontend (Next.js App Router)
  -> API Routes (Next.js server routes)
  -> Supabase (database + auth)
  -> Backend escrow wallet (server-side TON operations)
  -> TON blockchain

Mira (external Telegram bot)
  <- user opens deep link from app
  <- user pastes verification prompt
  <- user copies verdict back into app
```

## Bounty Lifecycle

Use a simple, explicit state machine.

Recommended statuses:

- `draft`
- `funding_pending`
- `open`
- `claimed`
- `submitted`
- `approved`
- `rejected`
- `paid`
- `cancelled`

Interpretation:

- A bounty should not become `open` until escrow funding is confirmed.
- `claimed` means one worker owns the current attempt.
- `submitted` means the worker has delivered work for review.
- `approved` means the poster has recorded a positive Mira verdict.
- `paid` means the payout transaction has been initiated and persisted.

Avoid skipping states in code. Transitions should be validated server-side.

## Data Model

Start with a single `bounties` table, but include enough ownership and payment fields to support the actual flow.

```sql
create table bounties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  requirements text not null,
  amount_ton numeric not null check (amount_ton > 0),

  poster_wallet text not null,
  worker_wallet text,

  status text not null default 'draft',
  funded_at timestamp,
  claimed_at timestamp,
  submitted_at timestamp,
  approved_at timestamp,
  rejected_at timestamp,
  paid_at timestamp,

  escrow_address text,
  escrow_tx_hash text,
  payout_tx_hash text,

  submitted_work text,
  mira_verdict text,
  mira_reason text,

  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);
```

If auth is added beyond wallet identity, extend this model with user IDs rather than replacing the wallet fields.

## Funding and Escrow Rules

These rules matter for the demo and should be treated as product constraints:

1. The backend wallet is custodial in V1.
2. Server-side code must hold and use the mnemonic. Never expose it to the client.
3. Posting a bounty is a two-step flow:
   - create the bounty record
   - confirm escrow funding
4. Only mark a bounty `open` after payment to escrow is confirmed.
5. Only allow payout when status is `approved`.

For hackathon speed, it is acceptable to start with a simple confirmation model if full chain confirmation polling takes too long. If simplified, document the exact assumption in code comments or README.

## App Structure

Recommended pages:

```text
/                  homepage with product pitch and open bounties
/post              create bounty flow
/bounties          bounty board
/bounties/[id]     single bounty details and actions
```

Recommended API routes:

```text
/app/api/bounties/route.ts
/app/api/bounties/[id]/claim/route.ts
/app/api/bounties/[id]/submit/route.ts
/app/api/bounties/[id]/verdict/route.ts
/app/api/bounties/[id]/release/route.ts
```

## Mira Prompt Template

When the poster clicks "Verify with Mira", the app should generate a clean prompt like this:

```text
REQUIREMENTS:
[requirements]

SUBMITTED WORK:
[submitted work]
```

Suggested UX:

1. Open Mira via deep link.
2. Tell the user to type `/verify`.
3. Show the prompt in a copyable block.
4. Ask the user to paste Mira's verdict back into the app.

For the demo, a pair of buttons such as `Approve` and `Reject` is acceptable if the user manually confirms Mira's answer.

## Environment Variables

Use testnet by default during development and demo prep unless there is a deliberate, explicit switch to mainnet.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# TON backend wallet
TON_WALLET_MNEMONIC=
TON_NETWORK=testnet

# TON Connect
NEXT_PUBLIC_TON_MANIFEST_URL=https://your-app.vercel.app/tonconnect-manifest.json
```

## Build Order

Build in this order and protect momentum. Do not jump ahead unless a blocker forces it.

1. Scaffold Next.js, Tailwind, TypeScript, and Supabase.
2. Create the database schema.
3. Build bounty creation and persistence without payment.
4. Show open bounties on the homepage or board.
5. Add TON wallet connection.
6. Add escrow funding flow and confirmation.
7. Add claim and submit flow.
8. Add Mira verification UI and verdict recording.
9. Add payout release.
10. Polish the UI for demo quality.
11. Deploy to Vercel.

If time runs short, steps 1 through 9 are the minimum viable demo.

## Demo Story

Use a short, punchy walkthrough:

1. Poster creates a writing bounty and funds it.
2. Worker claims it and submits a response.
3. Poster opens Mira and verifies the submission.
4. Poster records approval in the app.
5. App releases TON and shows proof of payout.

Core message:

"Crypto bounties usually run on trust. TONWORK adds escrow and AI verification."

## Delivery Rules

Follow these rules during implementation:

- build against the locked scope
- prefer server actions or API routes only where they keep the flow clear
- keep wallet secrets server-side only
- use strict TypeScript
- keep code demo-friendly over over-engineered
- deploy early once the app can render and basic flows exist
- commit after each stable milestone

## Success Criteria

TONWORK is successful for the hackathon if a judge can see:

1. a bounty get created
2. a worker claim it
3. a submission get verified with Mira
4. a payout get released on TON

Everything else is secondary.
