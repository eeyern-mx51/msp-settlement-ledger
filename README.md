# MSP Settlement & Ledger Prototype

A React 19 + Vite 7 + Tailwind CSS 4 single-page application for managing payout lifecycle, holds, and automation in a merchant settlement system. Currently deployed on Vercel (free plan).

**Repository**: [github.com/eeyern-mx51/msp-settlement-ledger](https://github.com/eeyern-mx51/msp-settlement-ledger)

**Branches**:
- `main` — Production-ready primary branch
- `feature/full-scope` — Experimental features

## Key Features

### Payout Lifecycle
Payouts progress through a 5-stage lifecycle: Preparation → Ready for Review → Ready for Transfer → Transferring → Completed/Failed/Abandoned

### Hold System
Independent hold records at 3 levels (fleet, merchant, payout) with 2 UI phases:
- **Preparation** phase: Individual holds
- **Progression** phase: Approval + begin_transfer grouped together

Holds use OR logic — any active hold at any level blocks the action. The hold system acts as an emergency brake independent of automation settings.

Data model: `{ id, level, entity, phase, trigger, reason, note, createdBy, createdAt, active }`

### Three-Pillar Architecture
- **Holds** — Emergency brake mechanism
- **Automation Config** — On/off toggles per phase with rule-based processing
- **Permissions** — Role-based access control

### Automation Config Panel
Phase-by-phase toggles for:
- Auto-preparation
- Auto-approval with rules
- Auto-transfer

Displays hold warnings with the principle: "Holds always override automation."

### Payout Preview
Prepare Payout dialog with:
- Mandatory date field (7-day future cap)
- Breakdown: Transactions, Chargebacks, Adjustments (Manual / Debt deferral / Debt rollover)
- Payout Total

### Role-Based Access
- **FinOps Administrator** — Full read/write access
- **FinOps View Only** — Read-only access
- **Administrator** — No settlement access

### Audit Logs
Per-payout timeline including hold events and status changes.

### Additional Features
- DTE Generator for mock DTE file ingestion
- Adjustment workflows (manual + system debt deferral/rollover)
- Built-in flow diagrams and reference pages

## Architecture

### Codebase
- **Main component**: `src/MSPDashboard.jsx` (~2950 lines) — All components, mock data, and business logic
- **Flow reference pages**: `src/flows/*.jsx`
- **Routing**: Hash-based (`#payouts`, `#merchant-facilities/detail/payouts`, `#debugging-tools`, etc.)

### Hold System Data Model
```javascript
{
  id: string,
  level: 'fleet' | 'merchant' | 'payout',
  entity: { type, id },
  phase: 'preparation' | 'approval' | 'begin_transfer',
  trigger: string,
  reason: string,
  note: string,
  createdBy: string,
  createdAt: ISO 8601 timestamp,
  active: boolean
}
```

**UI Phase Mapping**:
- Preparation: Single hold phase
- Progression: Approval + begin_transfer combined

**HOLDABLE_STATUSES**: Ready for Review, Ready for Transfer (shows hold badge on status)

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Install and Run
```bash
npm install
npm run dev
```

The app will start on `http://localhost:5173` with HMR enabled.

### Build for Production
```bash
npm run build
npm run preview
```

## Documentation

Detailed architecture and design documentation:
- **Hold System Architecture**: `/Settlement and ledger/Hold System Architecture.html`
- **Hold System - Automation & Control Separation**: `/Settlement and ledger/Hold System - Automation & Control Separation.html`
- **Hold System Design - Analysis**: `/Settlement and ledger/Hold System Design - Analysis.html`

## Tech Stack

- **React 19** — UI framework
- **Vite 7** — Build tool and dev server
- **Tailwind CSS 4** — Styling
- **Hash Routing** — Client-side navigation

## Deployment

Currently deployed on Vercel (free plan). Push to `main` branch to trigger automatic deployment.
