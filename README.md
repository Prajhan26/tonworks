# TONWORK

TONWORK is a Telegram-native bounty platform on TON.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in Supabase and TON env vars.
3. Run the Supabase schema from `supabase/schema.sql`.
4. Install dependencies and start the app.

Required env vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TON_WALLET_MNEMONIC`
- `BACKEND_WALLET_ADDRESS` (must match the mnemonic-derived wallet)
- `NEXT_PUBLIC_TON_MANIFEST_URL`
- `NEXT_PUBLIC_APP_URL`

## Current state

- Landing page and post-bounty page are scaffolded.
- Bounty list, detail, claim, submit, verdict, and release flows use a repository layer that falls back to local memory when Supabase is unavailable.
- Supabase schema is ready in `supabase/schema.sql`.
- TON Connect provider and wallet button are wired into the app shell.
- Posting a bounty now sends a real testnet TON transfer to the backend wallet before creating the bounty record.
- Releasing payment now sends a real testnet TON transfer from the backend wallet to the worker wallet.
