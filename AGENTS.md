# Boomer AI project guidance

Boomer AI helps adults, especially people with limited experience using AI, learn what AI can do and practice using it with confidence. Treat the current web app and `mobile/` app as separate frontends that share this product direction.

## Product and UX rules

- Optimize for understanding, confidence, and practical learning. Make the next useful action obvious; do not make feature discovery or decoration the main event.
- Use a calm, adult, respectful voice. Do not stereotype older adults, assume low ability, or make the interface feel childish or patronizing.
- Keep the visual system simple and predominantly neutral. Do not add gradients, decorative color fields, confetti, or color-coded feature tiles. Establish hierarchy with placement, spacing, typography, plain labels, borders, and consistent control shapes. Do not rely on color or icons alone to communicate meaning.
- Do not create points, scores, streaks, leaderboards, failure counts, graded prompt quality, or penalty states. Do not turn practice into a pass/fail test.
- Let users try, revise, undo, retry, and leave without shame. When AI output is uncertain, limited, or mistaken, explain it plainly and offer a useful next step.
- Reinforce a successful action with brief, specific, adult-sounding acknowledgment that names what worked. Keep praise contextual and non-quantified; avoid generic celebration, animation, badges, and reward currency.
- If a prompt is vague, first respond to the user's likely request. Then, where useful, offer one optional, concrete tip for adding a detail such as audience, purpose, format, or constraints. Never label the prompt bad, wrong, or failed, and do not require a rewrite before helping.
- Prefer progressive disclosure: show the primary learning path first and place optional play and creation tools in a clearly secondary area. Explain what an activity teaches before asking users to choose it.
- Design for readability, keyboard and screen-reader access, zoom, touch, and different levels of familiarity. Do not infer capability from age; test with representative users whenever possible.

## Project skills

- For interface design, critique, information architecture, interaction, or visual changes, read [`.agents/skills/boomer-ai-ux/SKILL.md`](skills/boomer-ai-ux/SKILL.md) and its local design principles reference.
- For AI coaching, prompt feedback, or learning-oriented assistant responses, read [`.agents/skills/boomer-ai-prompt-coach/SKILL.md`](skills/boomer-ai-prompt-coach/SKILL.md).
- Read [`.agents/docs/ux-learning-resources.md`](docs/ux-learning-resources.md) for the curated study videos and references.

## Working constraints

- Preserve existing behavior and product content unless the user asks to change them.
- Before UI edits, inspect the target screen and its neighboring navigation/state flows in both the relevant web or mobile app and shared guidance.
- Do not claim a behavior works from source inspection alone. State what was inspected and what was actually verified.
- Do not commit, push, deploy, or modify unrelated files without an explicit request.
