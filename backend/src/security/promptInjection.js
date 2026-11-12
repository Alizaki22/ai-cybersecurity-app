const PROMPT_INJECTION_RULES = [
  {
    code: 'instruction_override',
    pattern: /\b(?:ignore|disregard|forget|override)\s+(?:(?:all|any|the|your)\s+)?(?:(?:previous|prior|earlier)\s+)?(?:system\s+|developer\s+)?(?:instructions?|rules?|directions?)\b/i,
  },
  {
    code: 'privileged_prompt_probe',
    pattern: /\b(?:reveal|show|print|repeat|disclose|dump)\b.{0,80}\b(?:system prompt|developer message|hidden instructions?|secret|api key|credentials?)\b/i,
  },
  {
    code: 'role_escalation',
    pattern: /\b(?:you are now|act as|roleplay as|pretend to be)\b.{0,60}\b(?:developer|administrator|admin|system|root)\b/i,
  },
  {
    code: 'safety_bypass',
    pattern: /\b(?:bypass|disable|evade|circumvent)\b.{0,60}\b(?:safety|security|policy|guardrails?|validation|filter)/i,
  },
  {
    code: 'instruction_payload',
    pattern: /(?:^|\n)\s*(?:system|developer|assistant)\s*:\s*(?:ignore|override|reveal|execute)\b/i,
  },
];

function detectPromptInjection(input) {
  const text = typeof input === 'string' ? input : '';
  const matches = PROMPT_INJECTION_RULES
    .filter(({ pattern }) => pattern.test(text))
    .map(({ code }) => code);

  return {
    detected: matches.length > 0,
    matches,
  };
}

module.exports = { detectPromptInjection, PROMPT_INJECTION_RULES };
