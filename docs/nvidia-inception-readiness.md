# NVIDIA Inception readiness: first pass

**Product:** Track by Soma  
**Website:** https://www.trackwithsoma.com/  
**Repository:** https://github.com/Wuraola-Adebisi/Soma  
**Assessment date:** 25 November 2026  
**Current stage:** Working MVP. No AI capability or NVIDIA technology is integrated.

This is an internal planning record. It separates shipped functionality from a proposed direction. It must not be used to imply that Soma already has an AI model, predictive system, bank integration, GPU workload or NVIDIA partnership.

## 1. Product today

Soma brings personal money planning and shared-expense tracking into one web product. The MVP supports recording income and expenses, budgets, bills, savings goals, separate shared-expense spaces, expense splits, member balances, settlement records and reports.

Current boundaries:
- Personal and shared records are stored in browser local storage.
- Records do not sync across devices and are not backed by a Soma account.
- Shared spaces are managed by the person using the browser. Adding a name or email label does not invite another person or grant access.
- Soma does not connect to bank accounts, import transactions, initiate payments or independently verify financial information.
- Calculations depend on information entered by the user.
- No AI model, AI API, inference service, NVIDIA SDK or GPU workload is connected.

These boundaries should remain explicit in application materials until product changes are implemented and verified.

## 2. AI opportunity to validate

### Working direction: personal cash-flow intelligence

The opportunity is to help people move from recording financial activity to understanding the likely implications of their plans.

Questions the product could help users explore:
- What does my current plan suggest will be available before my next income date?
- Which upcoming bills and commitments are likely to put pressure on that plan?
- If I change an expense date or savings contribution, how does that affect the rest of the period?
- Which parts of an estimate are based on recorded information, and which depend on assumptions?

The initial hypothesis is a cash-flow planning and decision-support layer built from records the user chooses to enter into Soma. It should show inputs, calculations, assumptions and uncertainty. It must not present estimates as guaranteed outcomes or personalised investment, lending or regulated financial advice.

The deterministic projection and one-change scenario comparison now exist in the working branch. Statistical or machine-learning enhancements remain proposed and require user validation; they are not implemented.

## 3. Proposed capability sequence

### Stage A — Reliable data foundations
- Define canonical structures for income, transactions, bills, goals, schedules and currencies.
- Establish date, timezone, currency-precision and recurrence rules.
- Separate actual records from plans, estimates and assumptions.
- Test totals, allocations, recurring schedules and cash-flow calculations.
- Define consent, export, deletion, retention and access-control requirements before hosting financial records.
- Design an explicit, consent-based route from browser-local records to any future account model. No silent migration.

### Stage B — Deterministic planning baseline
- Project dated inflows and outflows from user-entered records.
- Show expected balances across a selected planning period.
- Flag periods where planned commitments exceed the available amount under stated assumptions.
- Let users change dates, amounts and savings contributions in scenario calculations.
- Show the inputs, formula and limitations behind each result.

This stage can use conventional application logic. It becomes the baseline against which later models must demonstrate measurable value.

### Stage C — Evaluated intelligence
Only after sufficient consented, representative data and a reliable baseline exist, investigate whether statistical or machine-learning methods improve specific tasks, such as identifying unusual changes in a user's spending history, estimating variable spending ranges, or estimating cash-flow pressure under explicit assumptions.

Evaluation should use time-based holdouts, simple baselines, calibration and error measures, tests across income patterns and currencies, and visible failure cases. Private financial records must not be used for training without a lawful basis, clear consent and appropriate safeguards.

### Stage D — Evidence-grounded explanations
If a language model later proves useful, it should explain structured calculations and retrieve the exact records used as evidence. It must not invent transactions or alter amounts. Numerical outputs should come from tested calculation services; language generation should be a constrained explanation layer.

## 4. Potential NVIDIA relevance

NVIDIA Inception is relevant as a development and ecosystem programme for an AI startup progressing from product opportunity and prototype work toward production. The immediate case is access to technical guidance, developer education, relevant tools and ecosystem support while the AI workload is being validated.

Technology selection must follow workload assessment:
- GPU-accelerated data processing may become relevant if data volume and processing requirements justify it.
- Model training or GPU inference may become relevant if a validated workload benefits from acceleration.
- Model-serving infrastructure may become relevant when there is a real model and production serving requirement.
- Language-model tooling may become relevant if evidence-grounded explanations prove useful and reliable.

No NVIDIA technology is currently integrated. This roadmap does not commit Soma to a particular NVIDIA stack. The first baseline may be CPU-based and deterministic; using GPUs without a demonstrated workload would add cost and complexity without a technical reason.

## 5. Readiness work

### Product
- [ ] Validate the cash-flow planning problem through user conversations and observed planning tasks.
- [ ] Define the initial user segment and the highest-value decision Soma should help with.
- [ ] Capture genuine product screenshots and document current workflows.
- [ ] Separate shipped functionality from roadmap items across the website, README and deck.
- [ ] Define success measures; do not invent adoption, revenue, retention or model-performance metrics.

### Engineering
- [x] Extract the shared-money balance calculation into a pure, testable module and correct settlement direction.
- [x] Add automated unit tests for initial balances, partial/full settlements, reverse-direction settlements and cent precision.
- [ ] Run a clean dependency install, full TypeScript check and production build.
- [ ] Review browser-storage failure handling, exports and data-loss risks.
- [ ] Resolve the account and collaboration architecture before cloud persistence.
- [ ] Document data models, trust boundaries, threat model and privacy controls for future AI workloads.
- [ ] Keep generated dependencies and build output out of source control; verify tracked files before cleanup.
- [ ] Reconcile or close stale stacked pull requests only after comparing them with current main and validating the result.

### Application
- [x] Legal applicant confirmed: Soma is the incorporated entity submitting the application.
- [ ] Confirm the founder/developer arrangement against NVIDIA's employed-developer eligibility wording; do not assume founder status automatically satisfies it.
- [ ] Ensure the website, contact email, repository and deck tell the same factual story.
- [ ] Prepare a deck covering problem, product, target users, market, differentiation, current stage, AI opportunity, technical roadmap, team, business-model hypotheses and the specific support sought from Inception.

## 6. Application positioning draft

Soma is an early-stage software product bringing personal money planning and shared-expense tracking into one place. Its working MVP helps people organise income, spending, budgets, bills, savings goals and shared household costs.

The next product direction is a privacy-conscious cash-flow intelligence layer that helps people understand how their recorded financial activity and upcoming commitments affect their plans. The work begins with reliable financial data structures and transparent deterministic projections, then evaluates where statistical or machine-learning methods can improve planning. Any generated explanations will be grounded in underlying records and calculations.

Soma has not yet integrated an AI model or NVIDIA technology. The team is seeking technical guidance, developer resources and ecosystem support to validate the right AI workloads and develop them responsibly, rather than claiming a capability before it exists.

This is a working draft. Update it after user validation, technical testing and confirmation of the applicant entity.

## 7. Open decisions

1. **Initial user segment:** Which group has the most acute cash-flow planning problem Soma can credibly serve first?
2. **Data architecture:** What secure account and persistence architecture is appropriate before financial records leave the browser?
3. **AI workload:** Which specific task demonstrates measurable improvement over a deterministic baseline?
4. **Business model:** Which revenue model should be tested, and what evidence supports it?

## 8. Sources

- NVIDIA Inception: https://www.nvidia.com/en-us/startups/
- Soma public website: https://www.trackwithsoma.com/
- Soma repository: https://github.com/Wuraola-Adebisi/Soma

NVIDIA's public programme materials describe Inception as supporting AI startups from prototype toward production. Public guidance does not require a startup to already use NVIDIA GPUs or SDKs. Verify current eligibility and benefit terms with NVIDIA at application time.
