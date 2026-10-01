---
name: boomer-ai-ux
description: "Trigger: Boomer AI UX, Boomer AI design, older adult learning app, simplify the interface. Design and review calm, mistake-tolerant AI learning experiences for this product's audience."
license: Apache-2.0
metadata:
  author: "Orage Agency"
  version: "1.0"
---

## Activation Contract

Use for any Boomer AI interface design, critique, navigation, onboarding, content hierarchy, interaction, or visual-system task in the web or `mobile/` app. Read the root `AGENTS.md` and `references/design-principles.md` first.

## Hard Rules

- Start from the user's task and confidence, not the feature list. Make one primary next step apparent and disclose secondary options progressively.
- Use an adult, respectful, reassuring tone; never infantilize, stereotype, or equate age with inability.
- Keep surfaces neutral and restrained. Do not use gradients, decorative color, color-coded feature cards, confetti, or visual noise. Build hierarchy with layout, whitespace, readable type, labels, borders, and shape; never communicate by color or icon alone.
- Do not add points, scores, streaks, failure counts, graded practice, leaderboards, or pass/fail flows. Use concise, specific verbal acknowledgment for genuine progress without quantified rewards.
- Treat mistakes as ordinary exploration. Preserve user input, support edit/retry/undo where practical, explain system limits, and offer a clear recovery step without blame.
- For a vague prompt, answer the likely intent first. Add at most one optional improvement tip when it helps; never call the prompt bad or block help until it is rewritten.
- Protect readability and user control across age, vision, motor, cognitive, language, and device differences. Do not assume a single interaction mode.

## Decision Gates

| Situation | Direction |
|---|---|
| Learning vs. play | Put the learning task first; label play/exploration and place it secondarily. |
| Success feedback | Name the useful action in plain language; add no points or celebration mechanic. |
| Prompt could be clearer | Fulfill intent, then offer one optional, specific tip. |
| Failure or uncertain AI output | State what happened and a next step; preserve user control and dignity. |

## Execution Steps

1. Inspect the actual target screen, state transitions, content, and neighboring navigation; check whether web and mobile differ.
2. State the user's primary task, the current friction, and the proposed hierarchy before changing UI.
3. Keep the change focused; preserve product facts and established behavior outside the request.
4. Review empty, loading, success, uncertain, error, retry, keyboard, zoom, and touch states that the change affects.
5. Report changed files, rationale, verification performed, and any unverified user or device behavior.

## Output Contract

For analysis, return the current flow, evidence-based friction, and prioritized opportunities. For implementation, summarize hierarchy and behavior changes, file links, checks actually run, and remaining verification gaps.

## References

- [`references/design-principles.md`](references/design-principles.md)
- [`../../docs/ux-learning-resources.md`](../../docs/ux-learning-resources.md)
