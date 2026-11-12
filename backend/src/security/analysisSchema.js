const ALLOWED_TYPES = new Set(['Safe', 'Phishing', 'Malware', 'Social Engineering']);
const ALLOWED_SEVERITIES = new Set(['Low', 'Medium', 'High']);
const MAX_EXPLANATION_LENGTH = 2000;
const MAX_RECOMMENDATIONS = 8;
const MAX_RECOMMENDATION_LENGTH = 400;

function sanitizeText(value, maxLength) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function validateAnalysisResponse(value) {
  const errors = [];

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { valid: false, errors: ['response must be an object'], value: null };
  }

  const keys = Object.keys(value);
  const unexpectedKeys = keys.filter((key) => !['type', 'severity', 'explanation', 'recommendations'].includes(key));
  if (unexpectedKeys.length) errors.push('response contains unexpected fields');
  if (!ALLOWED_TYPES.has(value.type)) errors.push('type is invalid');
  if (!ALLOWED_SEVERITIES.has(value.severity)) errors.push('severity is invalid');
  if (typeof value.explanation !== 'string' || !value.explanation.trim() || value.explanation.length > MAX_EXPLANATION_LENGTH) {
    errors.push('explanation is invalid');
  }
  if (!Array.isArray(value.recommendations) || value.recommendations.length < 1 || value.recommendations.length > MAX_RECOMMENDATIONS) {
    errors.push('recommendations are invalid');
  } else if (value.recommendations.some((item) => typeof item !== 'string' || !item.trim() || item.length > MAX_RECOMMENDATION_LENGTH)) {
    errors.push('recommendations contain invalid items');
  }

  if (errors.length) return { valid: false, errors, value: null };

  return {
    valid: true,
    errors: [],
    value: {
      type: value.type,
      severity: value.severity,
      explanation: sanitizeText(value.explanation, MAX_EXPLANATION_LENGTH),
      recommendations: value.recommendations.map((item) => sanitizeText(item, MAX_RECOMMENDATION_LENGTH)),
    },
  };
}

function parseStrictAnalysis(rawResponse) {
  if (typeof rawResponse !== 'string') return { valid: false, errors: ['response is not text'], value: null };

  const raw = rawResponse.trim();
  const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const jsonText = fenced ? fenced[1].trim() : raw;

  if (!jsonText.startsWith('{') || !jsonText.endsWith('}')) {
    return { valid: false, errors: ['response is not a JSON object'], value: null };
  }

  try {
    return validateAnalysisResponse(JSON.parse(jsonText));
  } catch {
    return { valid: false, errors: ['response is not valid JSON'], value: null };
  }
}

module.exports = { validateAnalysisResponse, parseStrictAnalysis };
