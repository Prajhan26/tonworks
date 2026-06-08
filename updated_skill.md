---
name: tonwork
description: Build TONWORK — a Telegram-native bounty platform on TON blockchain where Mira AI verifies work completion before releasing escrow payments. Use this skill for all TONWORK development sessions. Triggers on "tonwork", "bounty platform", "mira verify", "ton escrow", or "continue tonwork build".
---

# TONWORK

Bounty platform on TON. Post tasks, lock payment in escrow, Mira verifies completion, worker gets paid.

**Tagline:** "Post work. Get paid. Mira verifies."

**Hackathon:** STON.fi Vibe Coding Hackathon — Mira AI Track
**Deadline:** June 8, 8:00 AM UTC (1:30 PM IST)
**Builder:** Hijak (solo)
**Submit at:** https://identityhub.app/contests/stonfi-vibecoding-hackathon-cohort-2/submit?trackId=cmp59nxuw01fo01ntoxddo7iq

---

## The Problem

Crypto bounties run on trust. Poster pays, hopes worker delivers. Worker works, hopes poster approves. No neutral judge. No escrow. No proof.

## The Solution

TONWORK adds Mira as the neutral judge. Escrow holds TON. Mira reads requirements vs submitted work through submission-specific prompt templates. Mira gives verdict. Payment releases.

**The product story:** *"TONWORK uses Mira as the verification layer for work submissions."*

---

## Two User Types

### Poster (has money, needs work done)
1. Connects TON wallet (TonConnect)
2. Posts bounty: title + requirements + TON amount + work type
3. Sends TON to backend escrow wallet
4. Bounty goes live on board
5. Gets notified when worker submits
6. Clicks "Verify with Mira" → opens Mira via deep link
7. Follows verification flow for their work type
8. Mira outputs: APPROVED or REJECTED + reason
9. Clicks "Release Payment" → TON sent to worker wallet

### Worker (has skills, wants to earn TON)
1. Browses open bounties
2. Claims one
3. Does the work
4. Submits work (text, github link, or doc link)
5. If rejected — gets 1 revision attempt
6. Gets paid when Mira approves

---

## Mira Integration

Mira is IN the product. Users interact with Mira as the core verification step.

V1 should stay honest about the workflow:

- the app prepares a structured prompt
- the poster opens Mira via deep link
- the poster pastes the prompt into chat
- the poster copies Mira's verdict back into the app

Support the following submission types in the UI:

- text / writing
- code via GitHub or similar repo link
- research or fact-based writing via pasted text or a doc link
- document or file link via public URL

Do not hardcode capabilities that depend on a specific Mira feature unless you have verified that feature is available in the actual product flow.

### Prompt template

Use a single base prompt and vary only the submission label:
```
/verify

REQUIREMENTS:
[bounty requirements]

SUBMITTED WORK:
[worker submission]

Does the submitted work meet ALL the requirements? Output APPROVED or REJECTED with a 2-line reason.
```

---

## Mira Setup (do this before building)

**Custom Skill:** `/verify`
- Name: Work Verifier
- Command: `/verify`
- Instructions: "When I type /verify followed by requirements and submitted work, evaluate whether the work meets all the requirements. Output APPROVED or REJECTED followed by a 2-line reason. Be objective and specific. If I include a GitHub link, read the code. If I include a document link, read the document."
- Output: APPROVED or REJECTED + 2-line reason
- Criteria: dynamic (different requirements each time)

**Deep Link:** `https://t.me/mira?start=verify`
- Opens Mira with verify context
- 64 char limit on start param — just used as trigger
- Actual content goes in the chat message (4096 char Telegram limit)

---

## Architecture

```
FRONTEND (Next.js 14 app router + Tailwind)
  ↓
API ROUTES (Next.js API routes — no separate server)
  ↓
SUPABASE (database)
  ↓
BACKEND WALLET (ton npm — holds escrow TON)
  ↓
TON BLOCKCHAIN (payment release to worker)

MIRA (external — deep link integration)
  ← user clicks "Verify with Mira" in app
  → opens t.me/mira?start=verify in Telegram
  ← user types /verify + pastes formatted prompt
  → Mira gives APPROVED/REJECTED verdict
  ← user clicks verdict button in app
  → backend wallet releases TON to worker
```

---

## Tech Stack

| Layer | Package | Why |
|-------|---------|-----|
| Framework | Next.js 14 (app router) | Fast, API routes built-in |
| Styling | Tailwind CSS | Quick UI |
| TON Wallet | `@tonconnect/ui-react` | Recommended by hackathon |
| TON Backend | `ton` + `ton-crypto` npm | Backend wallet operations |
| Database | Supabase | Fast setup, free tier |
| Deploy | Vercel | One command |

**package.json dependencies:**
```json
{
  "@tonconnect/ui-react": "latest",
  "ton": "latest",
  "ton-crypto": "latest",
  "tonweb": "latest",
  "@supabase/supabase-js": "latest",
  "@supabase/ssr": "latest"
}
```

---

## Database Schema (Supabase)

```sql
create table bounties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  requirements text not null,
  work_type text not null, -- 'writing' | 'code' | 'research' | 'document'
  amount_ton numeric not null,
  poster_wallet text not null,
  worker_wallet text,
  status text default 'open',
  -- open | claimed | submitted | approved | rejected | paid
  submitted_work text,     -- text content or link
  mira_verdict text,       -- 'approved' | 'rejected'
  mira_reason text,        -- Mira's 2-line reason
  revision_count integer default 0,  -- max 1 revision
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast queries
create index bounties_status_idx on bounties(status);
create index bounties_poster_idx on bounties(poster_wallet);
create index bounties_worker_idx on bounties(worker_wallet);
```

---

## IMPORTANT: tonconnect-manifest.json

Create this file at `/public/tonconnect-manifest.json` — TON Connect will break without it:

```json
{
  "url": "https://your-domain.example",
  "name": "TONWORK",
  "iconUrl": "https://your-domain.example/icon.png",
  "termsOfUseUrl": "https://your-domain.example/terms",
  "privacyPolicyUrl": "https://your-domain.example/privacy"
}
```

Set in env:
```
NEXT_PUBLIC_TON_MANIFEST_URL=https://your-domain.example/tonconnect-manifest.json
```

Update URL after Vercel deployment. Use localhost version for local dev:
```
NEXT_PUBLIC_TON_MANIFEST_URL=http://localhost:3000/tonconnect-manifest.json
```

---

## Scope — LOCKED

### IN SCOPE
- Post bounty (title, description, requirements, work type, TON amount)
- TON wallet connect (TonConnect)
- Send TON to backend escrow on post
- Open bounties dashboard (homepage)
- Claim bounty
- Submit work (text, GitHub link, or doc link)
- 1 revision allowed if rejected
- Mira verification flow (deep link + submission-specific prompt templates)
- Verdict recording (approved / rejected buttons)
- Payment release (backend wallet sends TON to worker wallet)
- Status tracking: open → claimed → submitted → approved/rejected → paid

### OUT OF SCOPE (V2)
- Smart contract / trustless escrow
- Reputation / ratings
- Direct file uploads
- Push notifications / Telegram bot notifications
- Search and filters
- Dispute resolution
- Multiple revisions
- STON.fi swap integration
- Mobile app
- Categories and tags

---

## Page Structure

```
/ — homepage
  Hero + open bounties list

/post — post a bounty
  Form: title, description, requirements, work type, TON amount
  Connect wallet + send TON to escrow

/bounties/[id] — bounty detail page
  Bounty info
  Claim button (if open, not poster)
  Submit work form (if claimed by current wallet)
  Verify with Mira section (if submitted, poster only)
    → shows the matching prompt template for the submission type
    → copy prompt button
    → Open Mira button (deep link)
    → APPROVED / REJECTED verdict buttons
  Release Payment button (if approved, poster only)
  Revision notice (if rejected, worker can resubmit once)

/api/bounties — GET list, POST create
/api/bounties/[id]/claim — POST claim
/api/bounties/[id]/submit — POST submit work
/api/bounties/[id]/verdict — POST record mira verdict
/api/bounties/[id]/release — POST release payment
/api/wallet/address — GET backend escrow wallet address
```

---

## Verify with Mira UI Component

When poster clicks "Verify with Mira" on a submitted bounty:

```
┌─────────────────────────────────────────┐
│  🔍 Verify with Mira                    │
│                                         │
│  Step 1: Open Mira                      │
│  [Open Mira →] (deep link button)       │
│                                         │
│  Step 2: Type /verify then send this:  │
│  ┌───────────────────────────────────┐  │
│  │ /verify                           │  │
│  │                                   │  │
│  │ REQUIREMENTS:                     │  │
│  │ [bounty requirements]             │  │
│  │                                   │  │
│  │ SUBMITTED WORK:                   │  │
│  │ [submitted work / link]           │  │
│  └───────────────────────────────────┘  │
│  [Copy Prompt]                          │
│                                         │
│  Step 3: What did Mira say?            │
│  [✅ APPROVED]  [❌ REJECTED]           │
└─────────────────────────────────────────┘
```

Auto-selects correct prompt template based on `work_type`.

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# TON Backend Wallet (escrow — NEVER expose to client)
TON_WALLET_MNEMONIC=        # 24-word mnemonic, generate fresh
TON_NETWORK=testnet          # testnet for demo, mainnet for prod

# TON Connect
NEXT_PUBLIC_TON_MANIFEST_URL=http://localhost:3000/tonconnect-manifest.json

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Build Order — Follow Exactly

| Step | Task | Time Est |
|------|------|----------|
| 1 | Scaffold: Next.js + Tailwind + Supabase + folder structure | 30 min |
| 2 | DB: Create bounties table in Supabase | 15 min |
| 3 | Post bounty: form + store in DB (no payment yet) | 45 min |
| 4 | Bounties list: homepage showing open bounties | 30 min |
| 5 | TON Connect: wallet connection via TonConnect | 45 min |
| 6 | Escrow: send TON to backend wallet on post | 60 min |
| 7 | Claim + Submit: worker flow | 45 min |
| 8 | Mira verify UI: deep link + prompt templates + verdict buttons | 60 min |
| 9 | Payment release: backend wallet sends TON to worker | 60 min |
| 10 | Deploy to Vercel | 30 min |
| 11 | UI polish + demo data | 45 min |
| 12 | Demo video (Loom, max 5 min) | 60 min |
| 13 | README + submit | 30 min |

**Total target: ~10 hours. Buffer time is reserved for debugging and payment flow issues.**

Stop at step 10 if blocked. Steps 1-10 = valid submission.

---

## Key Technical Decisions

- **No smart contract** — backend custodial wallet V1. Say it clearly in demo: "V2 is on-chain via a Tact contract."
- **No Mira API claim** — deep link approach. Manual paste step. Keep the demo honest.
- **Poster triggers verification** — not worker. Poster approves, less gaming.
- **Text + links only** — no direct file uploads. Worker pastes Google Doc / GitHub link.
- **1 revision max** — worker can resubmit once if rejected. Prevents abuse.
- **Testnet for demo** — get testnet TON from https://t.me/testgiver_ton_bot

---

## Demo Script (3 minutes)

```
0:00 — HOOK
"Crypto bounties run on blind trust.
What if the judge was AI? What if payment was automatic?"

0:15 — POST A BOUNTY (poster flow)
Go to /post
Fill: "Write 300 words about TON blockchain. Must include 3 use cases and be under 8th grade reading level."
Set: 2 TON
Connect wallet. Send to escrow. Bounty live.

0:45 — CLAIM + SUBMIT (worker flow)
Browse bounties. Claim.
Submit: paste a written article.

1:10 — THE MIRA MOMENT (money shot)
Poster gets notified. Clicks "Verify with Mira."
App shows the formatted /verify prompt — pre-filled, ready to copy.
Click "Open Mira." Telegram opens.
Type /verify. Paste the prompt.
Mira reads it.
Mira: "APPROVED — 310 words, 3 clear use cases identified, simple language throughout. All requirements met."
Back to app. Click APPROVED.

1:45 — PAYMENT RELEASES
Click "Release Payment."
2 TON sent to worker wallet. Show transaction on testnet explorer.

2:10 — THE SUBMISSION TYPES
"And it's not just text. Worker submits a GitHub link?
Mira reads the actual code."
Show code submission template.
"Research task? Mira fact-checks it.
Document? Mira reads the file link."

2:40 — CLOSE
"TONWORK. Post work. Get paid. Mira verifies.
No blind trust required."
```

---

## Hackathon Submission Checklist

```
□ GitHub repo created and public
□ tonwork deployed on Vercel (live URL works)
□ Core demo flow works end to end
□ Mira /verify skill set up in @mira
□ Mira chat history exported (profile → ... → Export chat history)
□ Demo video recorded on Loom (max 5 min)
□ README written (what it is, how to run, how to test)
□ Submit at: https://identityhub.app/contests/stonfi-vibecoding-hackathon-cohort-2/submit?trackId=cmp59nxuw01fo01ntoxddo7iq
  □ Select: Mira AI Track
  □ Paste Mira chat export link in description
  □ Live URL
  □ GitHub link
  □ Loom video link
```

---

## CLAUDE.md Rules for Claude Code

```markdown
# TONWORK

## Rules
- Read SKILL.md before every session
- Follow build order — no skipping steps
- No new features during build — V2 list only
- Backend wallet mnemonic = server-side only, never in client code
- Deploy after step 5 even if broken — need URL early
- Commit after each working step
- TypeScript strict mode
- tonconnect-manifest.json must exist at /public/

## Stack
- Next.js 14 app router
- Tailwind CSS
- Supabase
- @tonconnect/ui-react
- ton + ton-crypto npm packages

## Current Phase
DEVELOPER — follow build order in SKILL.md
```
