# Boomer AI UX principles

## Audience and purpose

Design for adults who want to understand AI and use it in everyday life. Users vary widely in vision, hearing, dexterity, confidence, language, and prior technology experience. Age is not a proxy for ability. Use real user research instead of caricatures or assumptions.

The product should help a person move from curiosity to a small, useful action, then understand what the AI did. Favor learning-by-doing over feature catalogs and abstract explanations.

## Visual hierarchy without decoration

- Default to a quiet neutral palette. Use color only if a real semantic need remains after layout, text, shape, and contrast have been considered; never use gradients or saturated feature tiles.
- Give the primary task the clearest position and strongest typographic hierarchy. Use whitespace and alignment to group related information and separate secondary activities.
- Distinguish **Learn**, **Practice**, and **Explore** with explicit words and consistent placement. Play can be enjoyable but should be visibly optional and should explain what the user may learn.
- Keep text readable, controls comfortably large, labels explicit, and focus states visible. Support zoom and reflow. Never make color, animation, or an icon the only carrier of meaning.
- Keep motion quiet and purposeful. Do not use confetti, flashing, pulsing, or surprise transitions as reward.

## Mistake-tolerant interaction

- Do not frame experimentation as a test. Avoid score, grade, streak, penalty, ranking, failure counter, and pass/fail language or mechanics.
- Let people edit, retry, back out, and recover without losing useful work. Use confirmation only when an action has meaningful consequences.
- Explain the system's limits and uncertainty in plain language. When the AI misunderstands, acknowledge it, offer a repair path, and keep the user's original goal in view.
- Reinforce a useful action with specific, brief language (for example, “Adding who the note is for helped make the tone clearer.”). Do not award points or overpraise routine actions.

## Onboarding and progress

- Preserve the current onboarding structure as the starting point; improve orientation without adding more prerequisite steps.
- Place an overall progress indicator at the top. During question sequences, also state how many questions remain in plain text.
- Offer “Skip for now” so users can reach the app without completing every setup question. Use neutral beginner defaults, avoid inferring age or ability, and let users fill in optional details later.
- Make skip behavior clear before the user chooses it. Skipping must not look like failure or create a lower status.

## Web and mobile relationship

- Compare the web and mobile app through actual user tasks before recommending consolidation. Similar branding or feature names alone do not prove the experiences are equivalent.
- If their core flows substantially overlap, propose one coherent product experience and one source of truth for identity and learning progress. Explain any remaining platform-specific behavior before implementation; do not start a migration without user direction.

## Prompt-learning pattern

For an unclear or broad prompt, respond to the likely intent first. Then optionally show one concrete detail that can improve a future request: who it is for, what outcome is wanted, preferred format, or an important constraint. Demonstrate with a short before/after only when it makes the lesson easier to understand. Keep it invitational; do not demand a rewrite or label the user's wording as wrong.

For a prompt that works well, briefly name what helped (context, audience, desired format, or constraints). Make the reason visible so encouragement also teaches.

## Content and IA checks

- Can a first-time user identify the next useful learning action without comparing a grid of unrelated features?
- Does each activity say what it helps the user understand or do?
- Are primary learning actions visually distinct from optional play and creation tools without relying on bright color?
- Can the user explore without risking progress, embarrassment, or data loss?
- Does the interface speak to an adult as a capable person and offer help without taking control?

## Research loop

Test realistic tasks with adults from the intended audience, including people with different levels of AI familiarity and access needs. Ask participants to think aloud; observe hesitation, misinterpretation, and recovery rather than only task completion. Do not claim usability from heuristic inspection alone. See [`../../../docs/ux-learning-resources.md`](../../../docs/ux-learning-resources.md).
