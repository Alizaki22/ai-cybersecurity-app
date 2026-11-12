const REDACTION_RULES = [
  { name: 'email', pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: '[REDACTED_EMAIL]' },
  { name: 'credit_card', pattern: /\b(?:\d[ -]*?){13,19}\b/g, replacement: '[REDACTED_CARD]' },
  { name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[REDACTED_SSN]' },
  { name: 'jwt', pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, replacement: '[REDACTED_TOKEN]' },
  { name: 'api_key', pattern: /\b(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|AIza[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})\b/g, replacement: '[REDACTED_API_KEY]' },
  { name: 'bearer_token', pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}\b/gi, replacement: '[REDACTED_BEARER_TOKEN]' },
  { name: 'secret_assignment', pattern: /\b(?:password|passwd|passcode|secret|token|api[_ -]?key)\s*[:=]\s*[^\s,;]+/gi, replacement: '[REDACTED_SECRET]' },
  { name: 'phone', pattern: /(?<!\w)(?:\+?\d[\d ()-]{8,}\d)(?!\w)/g, replacement: '[REDACTED_PHONE]' },
  { name: 'ipv4', pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g, replacement: '[REDACTED_IP]' },
];

function redactSensitiveData(input) {
  if (typeof input !== 'string') return { text: '', redacted: false, categories: [] };

  let text = input;
  const categories = new Set();

  for (const rule of REDACTION_RULES) {
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(text)) {
      categories.add(rule.name);
      rule.pattern.lastIndex = 0;
      text = text.replace(rule.pattern, rule.replacement);
    }
  }

  return { text, redacted: categories.size > 0, categories: [...categories] };
}

module.exports = { redactSensitiveData, REDACTION_RULES };
