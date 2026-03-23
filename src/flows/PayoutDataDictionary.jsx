import { useState } from "react";

const SECTIONS = [
  {
    id: "statuses",
    title: "Payout Statuses",
    subtitle: "The six discrete states a payout can occupy in its lifecycle",
    items: [
      {
        term: "Ready for Review",
        type: "Status",
        color: "#818CF8",
        bg: "#EEF2FF",
        definition: "The payout has been prepared and is awaiting Toby approval before funds can be transferred. This is the entry point for every new payout.",
        uiTreatment: "Indigo badge. Primary action: Approve. Secondary actions: Hold, Abandon.",
        useCases: [
          "Daily automated sweep creates a payout for Merchant X with a positive balance of $4,200.",
          "Toby opens the payout, reviews the included transactions, and either approves, places a hold, or abandons.",
        ],
        auditExamples: [
          { actor: "System", entry: "Payout prepared — Merchant balance swept. 14 transactions included." },
          { actor: "System", entry: "Status changed to Ready for Review — Awaiting FinOps approval." },
        ],
        uxJustification: "Ready for Review signals a human gate. Financial operations teams expect an explicit review step before money moves. The name avoids ambiguity — it's not 'Pending' (which could mean anything) or 'Draft' (which implies incompleteness).",
      },
      {
        term: "Ready for Transfer",
        type: "Status",
        color: "#22C55E",
        bg: "#F0FDF4",
        definition: "The payout has been approved and is eligible for execution. The earliest execution window has been reached. Funds can now be sent via NPP.",
        uiTreatment: "Green badge. Primary action: Begin transfer. Secondary actions: Hold, Abandon.",
        useCases: [
          "Toby approves payout PO-2026-0220-005. It moves to Ready for Transfer and appears in the execution queue.",
          "A retryable failure is manually retried by Toby — the payout transitions back here for re-execution.",
        ],
        auditExamples: [
          { actor: "Tom Wright (Toby)", entry: "Approved — Status changed to Ready for Transfer." },
          { actor: "Tom Wright (Toby)", entry: "Manual retry — Status changed to Ready for Transfer." },
        ],
        uxJustification: "'Ready for Transfer' is deliberately specific about what it's ready for — the actual bank transfer. This prevents confusion with 'Ready for Review' and clearly communicates the next expected action.",
      },
      {
        term: "Transferring",
        type: "Status",
        color: "#A78BFA",
        bg: "#F5F3FF",
        definition: "The NPP transfer has been initiated. The payout is in-flight — funds are being sent to the merchant's bank. This status MUST be set before the NPP request is made.",
        uiTreatment: "Purple badge. No user actions available — this is a system-driven transitional state.",
        useCases: [
          "Toby clicks \"Begin transfer\" on PO-2026-0220-005. The system sets status to Transferring, then initiates the NPP request.",
          "In Pilot/BAU mode, the system auto-initiates transfers for approved payouts and sets Transferring programmatically.",
        ],
        auditExamples: [
          { actor: "Sarah Chen (Toby)", entry: "Transfer initiated — NPP request submitted. Transfer ID: TRF-2026-0220-005." },
          { actor: "System", entry: "Status changed to Transferring — Awaiting NPP confirmation." },
        ],
        uxJustification: "'Transferring' uses the progressive tense (-ing) to signal an active, in-progress operation. FinOps users understand at a glance that this payout is mid-flight and cannot be interrupted. We chose not to call this 'Processing' because that's too generic and doesn't convey the specificity of a bank transfer. Note: this state cannot be held or abandoned — once money is moving, it must resolve.",
      },
      {
        term: "Completed",
        type: "Status (terminal)",
        color: "#22C55E",
        bg: "#F0FDF4",
        definition: "Terminal state. The merchant has been paid successfully, or the payout amount was zero/negative (debt deferred, no transfer needed).",
        uiTreatment: "Green badge with rounded pill shape. No actions available. Displayed in success styling.",
        useCases: [
          "NPP confirms the transfer for PO-2026-0220-005 was received by the merchant's bank. Status moves to Completed.",
          "Payout PO-2026-0220-008 has a $0 balance at approval. It auto-completes (no transfer needed).",
        ],
        auditExamples: [
          { actor: "System", entry: "Transfer completed — NPP confirmation received. Merchant bank: ANZ, BSB: 013-140." },
          { actor: "System", entry: "Auto-completed — Payout amount is $0.00. No transfer required." },
        ],
        uxJustification: "'Completed' is universally understood as a terminal success state. We avoid 'Paid' because the zero-balance auto-completion path means not all Completed payouts involve actual fund transfers.",
      },
      {
        term: "Failed",
        type: "Status",
        color: "#F87171",
        bg: "#FEF2F2",
        definition: "The transfer has failed. Distinguished by a retryable flag: retryable failures (transient NPP/Cuscal issues) require manual retry by Toby; non-retryable failures (invalid BSB, closed account) require root cause resolution before the payout can proceed.",
        uiTreatment: "Red badge. Additional sub-badge: 'Retryable' (purple) or 'Non-retryable' (grey). Retryable payouts show a Retry action button. Non-retryable payouts show a recommended resolution action and Abandon.",
        useCases: [
          "NPP returns a gateway timeout. Payout is marked Failed + retryable. Toby reviews and clicks Retry to re-queue it.",
          "NPP returns 'Invalid BSB'. Payout is marked Failed + non-retryable. FinOps coordinates with merchant to correct bank details, then retries.",
          "A retryable payout has been retried 3 times manually. On the 4th failure, the system flags it for escalation — something deeper may be wrong.",
        ],
        auditExamples: [
          { actor: "System", entry: "Transfer failed (retryable) — Cuscal gateway timeout. Manual retry available." },
          { actor: "System", entry: "Transfer failed (non-retryable) — Invalid BSB: 062-999. Resolution required: Correct merchant bank details." },
          { actor: "Tom Wright (Toby)", entry: "Manual retry initiated — Attempt 2. Status changed to Ready for Transfer." },
          { actor: "System", entry: "Transfer failed (retryable) — Attempt 3 exhausted. Escalation recommended." },
        ],
        uxJustification: "The retryable/non-retryable sub-classification lets FinOps immediately triage failures. Retryable failures have a clear action path (Retry button). Non-retryable failures surface a recommended resolution so FinOps doesn't have to interpret raw error codes. The sub-badges make this scannable at the table level without opening each payout.",
      },
      {
        term: "Abandoned",
        type: "Status (terminal)",
        color: "#9CA3AF",
        bg: "#F9FAFB",
        definition: "Terminal state. The payout has been permanently cancelled. The merchant's ledger entries are released back to the balance for inclusion in a future payout. This action is irreversible.",
        uiTreatment: "Grey badge with rounded pill shape. No actions available. Requires typing 'ABANDON' to confirm.",
        useCases: [
          "Toby discovers PO-2026-0220-010 is a duplicate. They abandon it from Ready for Review.",
          "A non-retryable Failed payout cannot be resolved (merchant account permanently closed). After documenting evidence, FinOps abandons it.",
        ],
        auditExamples: [
          { actor: "Sarah Chen (Toby)", entry: "Abandoned — Reason: Duplicate payout. Merchant ledger entries released." },
          { actor: "System", entry: "Status changed to Abandoned — Payout permanently cancelled." },
        ],
        uxJustification: "'Abandoned' carries appropriate weight for an irreversible cancellation. We chose it over 'Cancelled' (too casual, implies it can be undone) and 'Voided' (accounting-specific, not universally understood by FinOps). The confirmation dialog requiring 'ABANDON' typed out adds friction proportional to the severity of the action.",
      },
    ],
  },
  {
    id: "flags",
    title: "Payout Flags",
    subtitle: "Boolean overlays that modify behaviour without changing the underlying status",
    items: [
      {
        term: "On Hold",
        type: "Flag (boolean overlay)",
        color: "#FBBF24",
        bg: "#FFFBEB",
        definition: "A hold placed on a payout to temporarily freeze all progression. The underlying status (Ready for Review or Ready for Transfer) is preserved. While on hold, no status transitions occur except Release Hold and Abandon. Holds can be placed at three scopes: fleet level (\"Hold all payouts\"), merchant level (\"Hold payouts for [Merchant Name]\"), or individual payout level (\"Place on hold\").",
        uiTreatment: "Amber 'On Hold' badge displayed alongside the status badge. Actions change to: Release Hold (primary) and Abandon (secondary). The underlying status badge remains visible so FinOps always knows where the payout was when the hold was placed. Merchant-level holds use the actual merchant name in the button, dialog, and banner to disambiguate from fleet-level holds.",
        useCases: [
          "Sarah notices an unusually high payout amount for Merchant Y. She places a hold while she investigates with the merchant team.",
          "Regulatory compliance flags a merchant for review. FinOps places a hold on all their pending payouts until clearance is received.",
          "A hold is placed on a Ready for Transfer payout at 3pm. At 5pm, compliance confirms the merchant is clear. FinOps releases the hold and the payout returns to Ready for Transfer — the transfer can now be executed.",
        ],
        auditExamples: [
          { actor: "Sarah Chen (Toby)", entry: "Hold placed — Reason: Suspicious activity review. Unusually high payout amount flagged for manual verification." },
          { actor: "System", entry: "Payout on hold — Underlying status: Ready for Transfer. Progression frozen." },
          { actor: "Sarah Chen (Toby)", entry: "Hold released — Investigation complete. Payout cleared for transfer." },
          { actor: "System", entry: "Hold cleared — Payout resumed at Ready for Transfer." },
        ],
        uxJustification: "We chose 'Hold' over alternatives for several reasons. (1) vs 'Paused': Paused implies a state the payout moves into, which contradicts the flag-based architecture. 'On Hold' naturally describes something applied to a payout. (2) vs 'Disable progression': Too technical and system-oriented. FinOps teams think in terms of holds, not UI state management. It also risks confusion with disabled/enabled UI patterns. (3) vs 'Freeze/Unfreeze': Carries fraud-investigation connotations that would be misleading for routine holds like regulatory review or scheduling conflicts. (4) vs 'Suspend/Reinstate': Overly formal and bureaucratic. 'Hold' and 'Release Hold' are natural language FinOps teams already use. The flag model means the audit trail preserves the true underlying status, so when a hold is released, there's no ambiguity about where the payout should resume from.",
        alternatives: [
          { term: "Paused", verdict: "Rejected", reason: "Implies a discrete state, not a flag. Would conflict with the data model and confuse the audit trail." },
          { term: "Disable Progression", verdict: "Rejected", reason: "Backend-oriented terminology. Sounds like a system config toggle. 'Disable' conflicts with enabled/disabled UI patterns." },
          { term: "Frozen", verdict: "Considered", reason: "Carries fraud-specific connotations. Could alarm merchants unnecessarily if exposed in any downstream reporting." },
          { term: "Suspended", verdict: "Considered", reason: "More formal than needed. 'Hold' is simpler, more intuitive, and more commonly used in FinOps vernacular." },
        ],
      },
      {
        term: "Retryable / Non-retryable",
        type: "Flag (on Failed status only)",
        color: "#A78BFA",
        bg: "#F5F3FF",
        definition: "A boolean flag on Failed payouts indicating whether the failure is transient (can be retried with the same data) or persistent (requires root cause resolution before retry). See the Failure Conditions section below for the full classification.",
        uiTreatment: "Sub-badge next to the Failed badge: purple 'Retryable' or grey 'Non-retryable'. Retryable payouts show a Retry button. Non-retryable payouts show a recommended resolution action and only allow Abandon until the underlying issue is resolved.",
        useCases: [
          "NPP returns a gateway timeout (retryable). Toby reviews the failure, confirms it's transient, and clicks Retry.",
          "NPP returns 'Invalid BSB' (non-retryable). FinOps contacts the merchant to correct their bank details. Once updated, they manually retry.",
        ],
        auditExamples: [
          { actor: "System", entry: "Transfer failed — Retryable (Cuscal gateway timeout). Manual retry available." },
          { actor: "System", entry: "Transfer failed — Non-retryable (Invalid BSB: 062-999). Resolution required: Correct merchant bank details." },
          { actor: "Tom Wright (Toby)", entry: "Manual retry initiated — Attempt 2. Transitioned to Ready for Transfer." },
        ],
        uxJustification: "The retryable distinction lets FinOps immediately triage their failure queue. Retryable failures have a clear, low-friction action path (click Retry). Non-retryable failures surface a recommended resolution so FinOps doesn't have to interpret raw error codes. The sub-badge makes this scannable at the table level — FinOps can filter to non-retryable failures and prioritise those.",
      },
    ],
  },
  {
    id: "failure-conditions",
    title: "Failure Conditions & Rules",
    subtitle: "How failures are classified, what actions are available, and retry governance",
    items: [
      {
        term: "Retryable Failure Conditions",
        type: "Classification rules",
        color: "#A78BFA",
        bg: "#F5F3FF",
        definition: "Transient failures where the same payout data, sent again, has a reasonable chance of succeeding. The issue is with the infrastructure or downstream system, not the payout data itself.",
        conditions: [
          { code: "GATEWAY_TIMEOUT", description: "Cuscal gateway timeout", detail: "Cuscal did not respond within the SLA window. The payment may or may not have been received — reconciliation required.", recommendedAction: "Retry after confirming no duplicate payment was processed." },
          { code: "NPP_UNAVAILABLE", description: "NPP network unavailability", detail: "The NPP rail is temporarily down or degraded. Nothing wrong with the payout data.", recommendedAction: "Retry. Check NPP status page if multiple payouts are affected." },
          { code: "RATE_LIMITED", description: "Rate limiting / throttling", detail: "Cuscal or NPP returned a capacity error (429 or equivalent). The payout is valid.", recommendedAction: "Retry after a brief wait. If persistent, check if batch volume is too high." },
          { code: "RECEIVER_TEMP_UNAVAIL", description: "Receiving bank temporarily unavailable", detail: "The merchant's bank is momentarily unable to process inbound credits. Transient infrastructure issue on the receiving end.", recommendedAction: "Retry. If the same bank fails repeatedly, escalate to Cuscal support." },
          { code: "CUSCAL_5XX", description: "Cuscal internal server error", detail: "5xx error from Cuscal's API — their internal issue, not related to payout data.", recommendedAction: "Retry. If recurring, raise a support ticket with Cuscal." },
          { code: "INSUFFICIENT_FUNDS", description: "Insufficient funds (sender-side)", detail: "mx51's pooled settlement account temporarily doesn't have enough to cover the transfer. The payout data is valid.", recommendedAction: "Retry after confirming account has been funded. Alert treasury/finance team if recurring." },
        ],
        rules: [
          { rule: "Manual retry", detail: "All retries are manually initiated by Toby via the Retry button. The payout transitions to Ready for Transfer for re-execution.", futureAutomation: true },
          { rule: "Retry attempt tracking", detail: "Each retry attempt is logged in the audit trail with the attempt number and error code. The UI displays the current attempt count.", futureAutomation: false },
          { rule: "Escalation after 3 attempts", detail: "After 3 failed retry attempts, the system adds an 'Escalation recommended' indicator. FinOps should investigate the root cause rather than continuing to retry blindly.", futureAutomation: true },
          { rule: "Escalation after 5 attempts", detail: "After 5 failed retry attempts, the system flags the payout for mandatory review. At this point, a transient issue likely has a deeper systemic cause.", futureAutomation: true },
          { rule: "Duplicate payment check", detail: "Before retrying a GATEWAY_TIMEOUT failure, FinOps should confirm the original payment was not processed (reconciliation check). The UI surfaces a warning for timeout-based retries.", futureAutomation: true },
        ],
        futureAutomationNotes: [
          "Auto-retry with exponential backoff (e.g. 5 min, 30 min, 2 hours) for transient failures — removes the need for FinOps to manually click Retry for obvious infrastructure blips.",
          "Auto-escalation: after N failed auto-retries, the system stops retrying and creates an alert for FinOps review instead of continuing silently.",
          "Duplicate payment detection: system automatically reconciles with Cuscal before retrying timeout failures, preventing double-payments.",
          "Insufficient funds: system alerts treasury/finance team automatically and queues the retry for when the account is funded.",
          "Circuit breaker: if multiple payouts to the same bank fail within a window, the system pauses retries for that bank and alerts FinOps (likely a receiving bank outage).",
        ],
        auditExamples: [
          { actor: "System", entry: "Transfer failed — GATEWAY_TIMEOUT: Cuscal did not respond within 30s SLA. Retryable. Attempt 1 of 3." },
          { actor: "Tom Wright (Toby)", entry: "Manual retry initiated — Attempt 2. Reconciliation check: no duplicate payment found." },
          { actor: "System", entry: "Transfer failed — RATE_LIMITED: Cuscal returned 429. Retryable. Attempt 2 of 3." },
          { actor: "Tom Wright (Toby)", entry: "Manual retry initiated — Attempt 3." },
          { actor: "System", entry: "Transfer failed — GATEWAY_TIMEOUT. Attempt 3 exhausted. Escalation recommended." },
        ],
        uxJustification: "Making all retries manual in POC ensures FinOps has full visibility and control over every transfer attempt. This is critical while the team builds confidence in the system. The attempt counter and escalation thresholds prevent runaway manual retries. Future automation will handle the obvious cases (timeouts, rate limits) while escalating ambiguous ones to humans.",
      },
      {
        term: "Non-retryable Failure Conditions",
        type: "Classification rules",
        color: "#6B7280",
        bg: "#F9FAFB",
        definition: "Persistent failures where resending the exact same payout data will fail again. The root cause must be resolved before the payout can proceed.",
        conditions: [
          { code: "INVALID_BSB", description: "Invalid BSB", detail: "The BSB does not exist or does not route to a valid bank branch. The merchant's bank details need correction.", recommendedAction: "Contact merchant to verify and update BSB. Update bank details in the system, then retry." },
          { code: "INVALID_ACCOUNT", description: "Invalid account number", detail: "The account number doesn't match the BSB or doesn't exist at that branch.", recommendedAction: "Contact merchant to verify and update account number. Update bank details, then retry." },
          { code: "ACCOUNT_CLOSED", description: "Account closed", detail: "The merchant's bank account has been permanently closed. Funds cannot be delivered.", recommendedAction: "Contact merchant for new bank account details. Update in system, then retry." },
          { code: "ACCOUNT_BLOCKED", description: "Account frozen or blocked", detail: "The receiving bank has blocked the account (regulatory, fraud, or legal reasons). The bank will not accept credits.", recommendedAction: "Contact merchant. May require new bank details or resolution of the block with their bank. Escalate if suspected fraud." },
          { code: "NAME_MISMATCH", description: "Account holder name mismatch", detail: "NPP PayID validation detected a mismatch between the expected account holder name and the registered name at the receiving bank.", recommendedAction: "Verify merchant's legal entity name against their bank records. Update payout reference name if needed." },
          { code: "COMPLIANCE_BLOCK", description: "Compliance / sanctions rejection", detail: "The payment was blocked by AML/CTF screening or sanctions checks. This is a regulatory block that cannot be bypassed by retry.", recommendedAction: "Escalate to compliance team. Do not retry until compliance provides clearance. Document all findings." },
          { code: "PAYMENT_REJECTED", description: "Payment rejected by receiving institution", detail: "The receiving bank explicitly refused the credit for a permanent, non-transient reason.", recommendedAction: "Review the rejection reason code from the receiving bank. Contact merchant's bank if the reason is unclear." },
          { code: "DUPLICATE_REFERENCE", description: "Duplicate payment reference", detail: "The NPP payment reference has already been used. A new unique reference is needed, which changes the payload.", recommendedAction: "System should generate a new payment reference. FinOps confirms and retries with the new reference." },
        ],
        rules: [
          { rule: "No auto-retry", detail: "Non-retryable payouts cannot be retried until the underlying issue is resolved. The Retry button is hidden.", futureAutomation: false },
          { rule: "Recommended action surfaced", detail: "The UI displays a specific recommended resolution based on the failure code, so FinOps knows exactly what to do without interpreting raw error codes.", futureAutomation: false },
          { rule: "Resolution then retry", detail: "Once the root cause is fixed (e.g. bank details updated), FinOps manually transitions the payout to Ready for Transfer. This is a fresh attempt, not a retry of the old data.", futureAutomation: false },
          { rule: "Stringent abandon criteria", detail: "Abandoning a non-retryable Failed payout requires documented evidence that the issue cannot be resolved. The abandon dialog shows an additional warning for Failed payouts.", futureAutomation: false },
          { rule: "Compliance escalation path", detail: "COMPLIANCE_BLOCK failures are treated differently — they require compliance team sign-off before any action. FinOps cannot retry or abandon without compliance clearance.", futureAutomation: true },
        ],
        futureAutomationNotes: [
          "Auto-notification to merchant: when bank details are invalid (INVALID_BSB, INVALID_ACCOUNT, ACCOUNT_CLOSED), the system could automatically email the merchant asking them to update their bank details.",
          "Bank detail validation: pre-validate BSB and account number format before attempting transfer, catching INVALID_BSB and INVALID_ACCOUNT errors before they happen.",
          "Compliance workflow integration: COMPLIANCE_BLOCK failures could auto-create a compliance review ticket and link to the payout for streamlined resolution.",
          "Duplicate reference auto-fix: system automatically generates a new unique payment reference for DUPLICATE_REFERENCE failures and retries without FinOps intervention.",
        ],
        auditExamples: [
          { actor: "System", entry: "Transfer failed — INVALID_BSB: BSB 062-999 does not exist. Non-retryable. Resolution: Correct merchant bank details." },
          { actor: "System", entry: "Transfer failed — ACCOUNT_CLOSED: Merchant's account at ANZ has been closed. Non-retryable. Resolution: Obtain new bank details from merchant." },
          { actor: "System", entry: "Transfer failed — COMPLIANCE_BLOCK: AML screening flagged transaction. Non-retryable. Escalation: Compliance review required." },
          { actor: "Sarah Chen (Toby)", entry: "Merchant contacted — New bank details received. BSB updated from 062-999 to 062-000." },
          { actor: "Sarah Chen (Toby)", entry: "Resolution applied — Status changed to Ready for Transfer. Fresh transfer attempt." },
        ],
        uxJustification: "Surfacing the recommended action directly in the UI eliminates guesswork. A Toby seeing 'Invalid BSB → Contact merchant to update bank details' can act immediately instead of looking up error codes in documentation. The strict separation between retryable and non-retryable ensures FinOps never wastes time retrying something that will fail again.",
      },
      {
        term: "Retry Governance",
        type: "Operational rules",
        color: "#4F46E5",
        bg: "#EEF2FF",
        definition: "Rules governing how retries are managed, tracked, and escalated across both retryable and non-retryable failure types.",
        rules: [
          { rule: "All retries are manual (POC)", detail: "In the POC phase, every retry is initiated by a Toby clicking the Retry button. No automatic retries occur. This ensures full human oversight while the team builds confidence in the payout pipeline.", futureAutomation: true },
          { rule: "Retry transitions to Ready for Transfer", detail: "When a retry is initiated, the payout status changes from Failed to Ready for Transfer. FinOps must then begin the transfer as a separate step. This maintains the two-step (approve → begin transfer) control flow.", futureAutomation: false },
          { rule: "Attempt counter", detail: "The system tracks the number of transfer attempts (including the original). This is displayed in the payout detail view and logged in every audit entry.", futureAutomation: false },
          { rule: "Soft escalation at attempt 3", detail: "After 3 failed attempts (including the original), the system displays an amber 'Escalation recommended' indicator. FinOps should investigate the root cause rather than retrying again.", futureAutomation: true },
          { rule: "Hard escalation at attempt 5", detail: "After 5 failed attempts, the system displays a red 'Investigation required' indicator. At this point, the failure likely has a systemic cause that won't resolve with more retries.", futureAutomation: true },
          { rule: "Cross-merchant failure detection", detail: "If multiple payouts to different merchants fail within a short time window, the system should surface a fleet-level alert — this likely indicates a Cuscal or NPP outage rather than individual payout issues.", futureAutomation: true },
          { rule: "Timeout reconciliation", detail: "Before retrying a GATEWAY_TIMEOUT failure, the UI warns FinOps to confirm the original payment was not processed. Timeout failures are ambiguous — the payment may have succeeded without confirmation.", futureAutomation: true },
        ],
        futureAutomationNotes: [
          "Pilot phase: introduce auto-retry for RATE_LIMITED and NPP_UNAVAILABLE (clearly transient, zero risk of duplicate payment). All other conditions remain manual.",
          "BAU phase: auto-retry with exponential backoff for all retryable conditions. GATEWAY_TIMEOUT gets automatic duplicate-payment reconciliation before retry.",
          "Auto-escalation rules: system stops retrying and creates an alert after N auto-retries, ensuring humans review persistent failures.",
          "Circuit breaker pattern: if >X payouts to the same receiving bank fail within Y minutes, the system pauses all transfers to that bank and alerts FinOps. Prevents flooding a failing bank endpoint.",
          "Dashboard-level failure analytics: aggregate failure rates by error code, merchant, and receiving bank to identify patterns and inform operational decisions.",
        ],
        auditExamples: [
          { actor: "System", entry: "Transfer attempt 1 — Failed (GATEWAY_TIMEOUT). Retryable." },
          { actor: "Tom Wright (Toby)", entry: "Manual retry initiated — Attempt 2." },
          { actor: "System", entry: "Transfer attempt 2 — Failed (GATEWAY_TIMEOUT). Retryable." },
          { actor: "Tom Wright (Toby)", entry: "Manual retry initiated — Attempt 3." },
          { actor: "System", entry: "Transfer attempt 3 — Failed (CUSCAL_5XX). Retryable. Escalation recommended — 3 attempts exhausted." },
          { actor: "Tom Wright (Toby)", entry: "Escalated — Raised Cuscal support ticket CSL-2026-0412. Awaiting resolution." },
        ],
        uxJustification: "Manual-first retry in POC gives the FinOps team direct control and builds operational familiarity with the failure modes. The escalation thresholds (3 and 5 attempts) create natural checkpoints that prevent blind retrying. The phased automation plan (POC → Pilot → BAU) gradually shifts routine retries to the system while keeping edge cases under human control.",
      },
    ],
  },
  {
    id: "actions",
    title: "Payout Actions",
    subtitle: "The verbs used in the UI to trigger state transitions and flag changes",
    items: [
      {
        term: "Prepare Payout",
        type: "Action (system-initiated)",
        color: "#818CF8",
        bg: "#EEF2FF",
        definition: "Creates a new payout by sweeping the merchant's positive balance. Automated daily job.",
        uiTreatment: "Triggered by system. Also available as a manual 'Prepare payout' button for Toby.",
        auditExamples: [
          { actor: "System", entry: "Payout prepared — Merchant balance swept. 14 transactions included. Amount: $4,200.00." },
        ],
        uxJustification: "'Prepare' signals that the payout is being assembled, not yet approved or sent. It's a setup action.",
      },
      {
        term: "Approve",
        type: "Action (manual)",
        color: "#4F46E5",
        bg: "#EEF2FF",
        definition: "Toby reviews and approves a payout, moving it from Ready for Review to Ready for Transfer.",
        uiTreatment: "Primary solid button. Confirmation dialog shows payout summary and included transactions.",
        auditExamples: [
          { actor: "Tom Wright (Toby)", entry: "Approved — Status changed to Ready for Transfer." },
        ],
        uxJustification: "'Approve' is the standard financial operations term for authorising a payment to proceed. Direct, unambiguous.",
      },
      {
        term: "Begin Transfer",
        type: "Action (manual / automated)",
        color: "#4F46E5",
        bg: "#EEF2FF",
        definition: "Initiates the NPP bank transfer. The payout status changes to Transferring before the NPP request is made.",
        uiTreatment: "Primary solid button labelled \"Begin transfer\". Triggers immediately without confirmation dialog (the approval step already served as the gate).",
        auditExamples: [
          { actor: "Sarah Chen (Toby)", entry: "Begin transfer — NPP request submitted. Transfer ID: TRF-2026-0220-005." },
        ],
        uxJustification: "We chose 'Begin transfer' because it's clear, approachable, and naturally pairs with the resulting 'Transferring' status — you begin a transfer, and it's now transferring. 'Begin' is direct without being overly technical or authoritarian. Including the noun 'transfer' makes the action scannable alongside other actions (Approve, Hold, Abandon). The verb 'begin' signals intent to start the process, which is accurate — the NPP transfer is asynchronous and the system tracks it to completion. Considered and rejected: 'Execute transfer' (too authoritarian for a FinOps tool), 'Send payout' (too casual), 'Submit for transfer' (implies another approval step).",
        alternatives: [
          { term: "Execute Transfer", verdict: "Considered", reason: "Authoritative but overly formal. 'Execute' carries connotations of finality that don't match the asynchronous NPP flow. 'Begin' better reflects the initiation-then-tracking pattern." },
          { term: "Execute (standalone)", verdict: "Considered", reason: "Less scannable without the noun. Also inherits the same formality concern as 'Execute Transfer'." },
          { term: "Initiate Transfer", verdict: "Rejected", reason: "Verbose and passive. Doesn't feel like a button label — reads more like a system log entry." },
          { term: "Run Transfer", verdict: "Rejected", reason: "Reads as a batch/pipeline operation. 'Run' is engineer-oriented, not FinOps-oriented." },
          { term: "Send Payout", verdict: "Considered", reason: "Too casual for a FinOps tool. 'Send' is consumer-grade language (Venmo, PayPal)." },
          { term: "Submit for Transfer", verdict: "Rejected", reason: "Implies an additional approval queue. Misleading — Begin transfer triggers it directly." },
          { term: "Dispatch", verdict: "Considered", reason: "Precise but uncommon in financial ops. Would add friction to onboarding." },
        ],
      },
      {
        term: "Hold / Release Hold",
        type: "Action (manual)",
        color: "#D97706",
        bg: "#FFFBEB",
        definition: "Hold: Places a hold flag on a payout, freezing all progression. Release Hold: Removes the hold, allowing the payout to resume from its underlying status.",
        uiTreatment: "'Hold' appears as an outline button on Ready for Review and Ready for Transfer payouts. 'Release Hold' appears as a primary button when a payout is on hold. Confirmation dialog requires selecting a reason.",
        auditExamples: [
          { actor: "Sarah Chen (Toby)", entry: "Hold placed — Reason: Suspicious activity review." },
          { actor: "Sarah Chen (Toby)", entry: "Hold released — Investigation complete. Payout cleared." },
        ],
        uxJustification: "See the Hold flag entry above for full terminology analysis. The action names mirror the flag: 'Hold' to set it, 'Release Hold' to clear it. 'Release Hold' is preferred over just 'Release' to avoid any ambiguity with releasing funds.",
      },
      {
        term: "Retry",
        type: "Action (manual in POC)",
        color: "#4F46E5",
        bg: "#EEF2FF",
        definition: "Manually re-queues a Failed + retryable payout for transfer. Transitions the payout from Failed to Ready for Transfer. Only available on retryable failures — non-retryable payouts must have their root cause resolved first.",
        uiTreatment: "Primary button shown only on Failed + retryable payouts. Non-retryable payouts hide this button. The button label includes the attempt number: 'Retry (attempt 2)'. After 3 attempts, an amber escalation warning appears alongside the button.",
        auditExamples: [
          { actor: "Tom Wright (Toby)", entry: "Manual retry initiated — Attempt 2. Status changed to Ready for Transfer." },
          { actor: "Tom Wright (Toby)", entry: "Manual retry initiated — Attempt 4. Warning: Escalation recommended (3+ attempts)." },
        ],
        uxJustification: "'Retry' is simple and universally understood. Making it manual in POC ensures FinOps reviews each failure before re-attempting. The attempt counter prevents blind repeated retries. The escalation indicators at attempts 3 and 5 create natural review checkpoints.",
      },
      {
        term: "Abandon",
        type: "Action (manual, irreversible)",
        color: "#6B7280",
        bg: "#F9FAFB",
        definition: "Permanently cancels a payout. Available from Ready for Review, Ready for Transfer, On Hold, and Failed (with stringent criteria). Requires typing 'ABANDON' to confirm.",
        uiTreatment: "Red outline button. Confirmation dialog is deliberately high-friction: shows at-risk amounts, requires reason selection, and demands typing 'ABANDON' in uppercase.",
        auditExamples: [
          { actor: "Sarah Chen (Toby)", entry: "Abandoned — Reason: Duplicate payout. Merchant ledger entries released to balance." },
        ],
        uxJustification: "See the Abandoned status entry above. The high-friction confirmation pattern (type-to-confirm) is standard for irreversible financial actions. For Failed payouts, an additional criteria warning is shown to ensure abandonment is a last resort.",
      },
    ],
  },
  {
    id: "roles",
    title: "User Roles",
    subtitle: "Who can do what in the payout lifecycle",
    items: [
      {
        term: "Toby",
        type: "Role",
        color: "#4F46E5",
        bg: "#EEF2FF",
        definition: "Full read-write access to all payout operations. Can Approve, Begin Transfer, Hold, Release Hold, Retry, and Abandon payouts. Can place fleet-level holds (\"Hold all payouts\") and merchant-level holds (\"Hold payouts for [Merchant Name]\").",
        uiTreatment: "All action buttons are enabled. Role displayed in the header toolbar dropdown.",
        auditExamples: [
          { actor: "Sarah Chen (Toby)", entry: "Approved — Status changed to Ready for Transfer." },
          { actor: "Tom Wright (Toby)", entry: "Hold placed — Reason: Regulatory review." },
        ],
        uxJustification: "'Toby' replaced 'FinOps Tier 1' to be more descriptive of the role's capability. 'Admin' immediately conveys write access and authority.",
      },
      {
        term: "FinOps View Only",
        type: "Role",
        color: "#6B7280",
        bg: "#F9FAFB",
        definition: "Read-only access. Can view all payouts, statuses, audit logs, and transfers but cannot perform any actions.",
        uiTreatment: "All action buttons are disabled with a read-only banner: 'You have read-only access. Contact a Toby user to perform actions.'",
        auditExamples: [],
        uxJustification: "'FinOps View Only' replaced 'FinOps Tier 2' to clearly communicate the restriction. 'View Only' is immediately understood without needing to look up what 'Tier 2' means.",
      },
    ],
  },
];

// ─── Condition card sub-component ───
function ConditionRow({ condition }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
        <code className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded flex-shrink-0">{condition.code}</code>
        <span className="text-sm font-medium text-gray-800 flex-1">{condition.description}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}><polyline points="6,9 12,15 18,9" /></svg>
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2 border-t border-gray-100 pt-2 bg-gray-50">
          <p className="text-sm text-gray-600">{condition.detail}</p>
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">Recommended</span>
            <span className="text-sm text-gray-700">{condition.recommendedAction}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function TermCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-sm transition-shadow">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-5 py-4 flex items-start gap-4">
        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900">{item.term}</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: item.bg, color: item.color }}>{item.type}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{item.definition}</p>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}><polyline points="6,9 12,15 18,9" /></svg>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4 ml-7">
          {item.uiTreatment && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">UI Treatment</h4>
              <p className="text-sm text-gray-700">{item.uiTreatment}</p>
            </div>
          )}

          {/* Failure conditions (expandable list) */}
          {item.conditions && item.conditions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Failure Conditions ({item.conditions.length})</h4>
              <div className="space-y-1.5">
                {item.conditions.map((c) => <ConditionRow key={c.code} condition={c} />)}
              </div>
            </div>
          )}

          {/* Rules */}
          {item.rules && item.rules.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rules</h4>
              <div className="space-y-2">
                {item.rules.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-indigo-400 flex-shrink-0 font-bold mt-0.5">{i + 1}.</span>
                    <div>
                      <span className="font-semibold text-gray-800">{r.rule}</span>
                      {r.futureAutomation && <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">Future: automate</span>}
                      <p className="text-gray-600 mt-0.5">{r.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Future automation notes */}
          {item.futureAutomationNotes && item.futureAutomationNotes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <span className="inline-flex items-center gap-1.5">Future Automation Opportunities <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">Pilot / BAU</span></span>
              </h4>
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 space-y-2">
                {item.futureAutomationNotes.map((note, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-blue-800">
                    <span className="text-blue-400 flex-shrink-0 mt-0.5">→</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.useCases && item.useCases.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Use Cases</h4>
              <div className="space-y-2">
                {item.useCases.map((uc, i) => (
                  <div key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-indigo-400 flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <span>{uc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.auditExamples && item.auditExamples.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Audit Log Examples</h4>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                {item.auditExamples.map((ex, i) => (
                  <div key={i} className={`flex gap-3 px-4 py-2.5 text-sm ${i > 0 ? "border-t border-gray-200" : ""}`}>
                    <span className={`font-medium flex-shrink-0 ${ex.actor === "System" ? "text-gray-400" : "text-indigo-600"}`}>{ex.actor}</span>
                    <span className="text-gray-700">{ex.entry}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">UX Justification</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{item.uxJustification}</p>
          </div>

          {item.alternatives && item.alternatives.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alternatives Considered</h4>
              <div className="space-y-1.5">
                {item.alternatives.map((alt, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className={`font-medium px-1.5 py-0.5 rounded text-xs flex-shrink-0 mt-0.5 ${alt.verdict === "Rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>{alt.verdict}</span>
                    <span><strong className="text-gray-800">{alt.term}</strong> — <span className="text-gray-600">{alt.reason}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Text-only flat view for print / export ───
function TextOnlyView() {
  const DESIGN_PRINCIPLES = [
    { num: 1, title: "Persona-first language.", body: "Every term is chosen for how a Toby would naturally describe it in conversation: \"place a hold on that payout,\" \"begin the transfer,\" \"abandon this one.\" We avoid engineering jargon (disable progression, state machine, flag toggle)." },
    { num: 2, title: "Unambiguous action verbs.", body: "Each action button uses a single, decisive verb that maps to exactly one transition. No ambiguity about what clicking a button will do." },
    { num: 3, title: "Friction proportional to consequence.", body: "Reversible actions (Approve, Begin Transfer, Hold) have lightweight confirmations. Irreversible actions (Abandon) require high-friction confirmation (type-to-confirm). This follows established patterns in financial software." },
    { num: 4, title: "Status names describe what's true right now.", body: "\"Ready for Review\" means the payout is ready to be reviewed. \"Transferring\" means funds are in transit. \"On Hold\" means progression is frozen. Every name answers \"what's the current state of this payout?\"" },
    { num: 5, title: "Flags vs states are architecturally honest.", body: "\"On Hold\" is a flag because the underlying status matters — when the hold is released, the payout resumes from where it was. \"Retryable\" is a flag because it's a property of the failure, not a separate lifecycle state. This distinction prevents data model confusion and ensures accurate audit trails." },
    { num: 6, title: "Manual-first, automate later.", body: "POC keeps all retry and escalation actions manual to build FinOps familiarity and confidence. Future automation opportunities are documented alongside each rule, creating a clear roadmap from POC to Pilot to BAU." },
  ];

  return (
    <div className="max-w-4xl mx-auto text-sm text-gray-800 leading-relaxed">
      {SECTIONS.map((section) => (
        <div key={section.id} className="mb-8">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-300 pb-1 mb-4">{section.title}</h2>
          <p className="text-gray-500 mb-4">{section.subtitle}</p>

          {section.items.map((item) => (
            <div key={item.term} className="mb-6 pl-0">
              <h3 className="text-sm font-bold text-gray-900 mb-1">{item.term} <span className="font-normal text-gray-500">({item.type})</span></h3>

              <p className="mb-2">{item.definition}</p>

              {item.uiTreatment && (
                <p className="mb-2"><span className="font-semibold text-gray-700">UI treatment: </span>{item.uiTreatment}</p>
              )}

              {item.conditions && item.conditions.length > 0 && (
                <div className="mb-2">
                  <p className="font-semibold text-gray-700 mb-1">Failure conditions:</p>
                  {item.conditions.map((c) => (
                    <p key={c.code} className="ml-4 mb-1"><span className="font-mono font-semibold">{c.code}</span> — {c.description}. {c.detail} Recommended: {c.recommendedAction}</p>
                  ))}
                </div>
              )}

              {item.rules && item.rules.length > 0 && (
                <div className="mb-2">
                  <p className="font-semibold text-gray-700 mb-1">Rules:</p>
                  {item.rules.map((r, i) => (
                    <p key={i} className="ml-4 mb-1">{i + 1}. {r.rule}{r.futureAutomation ? " [Future: automate]" : ""} — {r.detail}</p>
                  ))}
                </div>
              )}

              {item.futureAutomationNotes && item.futureAutomationNotes.length > 0 && (
                <div className="mb-2">
                  <p className="font-semibold text-gray-700 mb-1">Future automation opportunities:</p>
                  {item.futureAutomationNotes.map((note, i) => (
                    <p key={i} className="ml-4 mb-1">- {note}</p>
                  ))}
                </div>
              )}

              {item.useCases && item.useCases.length > 0 && (
                <div className="mb-2">
                  <p className="font-semibold text-gray-700 mb-1">Use cases:</p>
                  {item.useCases.map((uc, i) => (
                    <p key={i} className="ml-4 mb-1">{i + 1}. {uc}</p>
                  ))}
                </div>
              )}

              {item.auditExamples && item.auditExamples.length > 0 && (
                <div className="mb-2">
                  <p className="font-semibold text-gray-700 mb-1">Audit log examples:</p>
                  {item.auditExamples.map((ex, i) => (
                    <p key={i} className="ml-4 mb-1">[{ex.actor}] {ex.entry}</p>
                  ))}
                </div>
              )}

              <p className="mb-2"><span className="font-semibold text-gray-700">UX justification: </span>{item.uxJustification}</p>

              {item.alternatives && item.alternatives.length > 0 && (
                <div className="mb-2">
                  <p className="font-semibold text-gray-700 mb-1">Alternatives considered:</p>
                  {item.alternatives.map((alt, i) => (
                    <p key={i} className="ml-4 mb-1">{alt.term} ({alt.verdict}) — {alt.reason}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="mb-8">
        <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-300 pb-1 mb-4">Terminology Design Principles</h2>
        {DESIGN_PRINCIPLES.map((p) => (
          <p key={p.num} className="mb-2">{p.num}. <span className="font-semibold">{p.title}</span> {p.body}</p>
        ))}
      </div>
    </div>
  );
}

export default function PayoutDataDictionary() {
  const [textOnly, setTextOnly] = useState(false);

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Payout Data Dictionary</h1>
          <button
            onClick={() => setTextOnly(!textOnly)}
            className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors flex-shrink-0 ${textOnly ? "bg-indigo-600 text-white border-indigo-600" : "text-gray-600 border-gray-300 hover:bg-gray-50"}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="17" y2="12" /><line x1="3" y1="18" x2="13" y2="18" /></svg>
            {textOnly ? "Card view" : "Text only"}
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-1">Comprehensive terminology reference for the POSPay Plus payout lifecycle</p>
        {!textOnly && <p className="text-xs text-gray-400 mb-6">Click any term to expand its full definition, use cases, audit log examples, and UX justification.</p>}
        {textOnly && <p className="text-xs text-gray-400 mb-6">Flat text view — optimised for print and document export.</p>}

        {textOnly ? (
          <TextOnlyView />
        ) : (
          <>
            <div className="flex gap-2 mb-8 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-3 h-3 rounded-full bg-indigo-400" /><span>Status</span></div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-3 h-3 rounded-full bg-amber-400" /><span>Flag</span></div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-3 h-3 rounded-full bg-gray-400" /><span>Terminal</span></div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-3 h-3 rounded-full bg-blue-400" /><span>Automation candidate</span></div>
            </div>

            {SECTIONS.map((section) => (
              <div key={section.id} className="mb-10">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-800">{section.title}</h2>
                  <p className="text-sm text-gray-500">{section.subtitle}</p>
                </div>
                <div className="space-y-3">
                  {section.items.map((item) => <TermCard key={item.term} item={item} />)}
                </div>
              </div>
            ))}

            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h2 className="text-sm font-bold text-gray-800 mb-3">Terminology Design Principles</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex gap-3"><span className="text-indigo-500 font-bold flex-shrink-0">1.</span><span><strong>Persona-first language.</strong> Every term is chosen for how a Toby would naturally describe it in conversation: "place a hold on that payout," "begin the transfer," "abandon this one." We avoid engineering jargon (disable progression, state machine, flag toggle).</span></div>
                <div className="flex gap-3"><span className="text-indigo-500 font-bold flex-shrink-0">2.</span><span><strong>Unambiguous action verbs.</strong> Each action button uses a single, decisive verb that maps to exactly one transition. No ambiguity about what clicking a button will do.</span></div>
                <div className="flex gap-3"><span className="text-indigo-500 font-bold flex-shrink-0">3.</span><span><strong>Friction proportional to consequence.</strong> Reversible actions (Approve, Begin Transfer, Hold) have lightweight confirmations. Irreversible actions (Abandon) require high-friction confirmation (type-to-confirm). This follows established patterns in financial software.</span></div>
                <div className="flex gap-3"><span className="text-indigo-500 font-bold flex-shrink-0">4.</span><span><strong>Status names describe what's true right now.</strong> "Ready for Review" means the payout is ready to be reviewed. "Transferring" means funds are in transit. "On Hold" means progression is frozen. Every name answers "what's the current state of this payout?"</span></div>
                <div className="flex gap-3"><span className="text-indigo-500 font-bold flex-shrink-0">5.</span><span><strong>Flags vs states are architecturally honest.</strong> "On Hold" is a flag because the underlying status matters — when the hold is released, the payout resumes from where it was. "Retryable" is a flag because it's a property of the failure, not a separate lifecycle state. This distinction prevents data model confusion and ensures accurate audit trails.</span></div>
                <div className="flex gap-3"><span className="text-indigo-500 font-bold flex-shrink-0">6.</span><span><strong>Manual-first, automate later.</strong> POC keeps all retry and escalation actions manual to build FinOps familiarity and confidence. Future automation opportunities are documented alongside each rule, creating a clear roadmap from POC → Pilot → BAU.</span></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
