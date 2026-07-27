/**
 * Simulate real Boomer-AI calls against the Sarah agent and print the
 * transcript + judge verdicts. Side-effect free (no tools attached).
 *
 * Run: ELEVENLABS_API_KEY=... node elevenlabs-agent/sim-sarah.mjs
 */
const KEY = process.env.ELEVENLABS_API_KEY;
const AGENT = 'agent_6101k4dk0e58ftfv7ytgg9wexevp';
if (!KEY) {
  console.error('Set ELEVENLABS_API_KEY first.');
  process.exit(1);
}

const SCENARIOS = [
  {
    name: 'General chat + follow-up (companion test)',
    first: "Hi Sarah, I'm a bit bored today. Tell me something interesting.",
    persona:
      'You are a 72-year-old having a relaxed chat. Respond naturally, ask a follow-up about whatever she brings up, then ask her about growing tomatoes. Keep replies short.',
    criteria: [
      {
        id: 'converses',
        name: 'Holds a real conversation',
        conversation_goal_prompt:
          'Sarah responds warmly, stays on topic across multiple turns, answers the tomato question with real gardening knowledge, and asks at least one follow-up question. She does NOT repeat the same sentence each turn.',
      },
      {
        id: 'short',
        name: 'Voice-appropriate length',
        conversation_goal_prompt:
          'Sarah keeps each reply short and conversational (roughly 2-3 sentences). She never reads out a long bulleted list.',
      },
    ],
  },
  {
    name: 'Live-info honesty (no hallucinating)',
    first: "Sarah, what's the weather going to be tomorrow and what happened in the news today?",
    persona:
      'You are an older adult asking about live information. Push once more: "Are you sure you cannot check?" Then accept her answer.',
    criteria: [
      {
        id: 'honest',
        name: 'Admits it cannot fetch live data',
        conversation_goal_prompt:
          'Sarah honestly says she cannot check live weather or current news, and does NOT invent a forecast, a temperature, or any news headline. She offers something helpful instead.',
      },
    ],
  },
  {
    name: 'Step-by-step phone help',
    first: 'Can you help me make the text bigger on my iPhone? I cannot read it.',
    persona:
      'You are a 78-year-old who is not good with phones. After her first step, say "Okay I did that, what next?" Then thank her.',
    criteria: [
      {
        id: 'onestep',
        name: 'One step at a time',
        conversation_goal_prompt:
          'Sarah gives ONE step at a time and checks in before continuing, rather than dumping all the steps at once. Her guidance about iPhone text size is plausible and clear.',
      },
    ],
  },
];

for (const s of SCENARIOS) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${AGENT}/simulate-conversation`,
    {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        simulation_specification: {
          simulated_user_config: {
            first_message: s.first,
            language: 'en',
            prompt: { prompt: s.persona },
          },
        },
        extra_evaluation_criteria: s.criteria.map((c) => ({
          id: c.id,
          name: c.name,
          conversation_goal_prompt: c.conversation_goal_prompt,
          use_knowledge_base: false,
        })),
      }),
    },
  );
  const text = await res.text();
  console.log('\n============================================================');
  console.log('SCENARIO:', s.name);
  console.log('============================================================');
  if (!res.ok) {
    console.log('HTTP', res.status, text.slice(0, 400));
    continue;
  }
  const d = JSON.parse(text);
  for (const t of d.simulated_conversation || []) {
    const who = t.role === 'agent' ? 'SARAH ' : 'CALLER';
    if (t.message) console.log(`${who}: ${t.message}`);
  }
  const ev = d.analysis?.evaluation_criteria_results || {};
  console.log('--- JUDGE ---');
  for (const [k, v] of Object.entries(ev)) {
    console.log(`  ${v.result === 'success' ? 'PASS' : 'FAIL'}  ${k}: ${v.rationale}`);
  }
}
