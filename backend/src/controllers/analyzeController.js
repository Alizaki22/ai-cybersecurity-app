/**
 * Controller to handle text analysis for cybersecurity threats
 */
console.log("API KEY:", process.env.GROQ_API_KEY);
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let history = [];

/**
 * Intelligent mock AI response generator to use as a fallback
 * when OpenAI API fails or runs out of quota.
 */
function generateMockResponse(text) {
  const lowerText = text.toLowerCase();
  
  let type = "Safe";
  let severity = "Low";
  let explanation = "The message appears to be safe. It does not contain common malicious keywords or suspicious requests.";
  let recommendations = ["No immediate action required.", "Always remain cautious of unexpected messages."];

  if (lowerText.includes("password") || lowerText.includes("credit card") || lowerText.includes("verify") || lowerText.includes("account")) {
    type = "Phishing";
    severity = lowerText.includes("urgent") || lowerText.includes("immediate") || lowerText.includes("suspend") ? "High" : "Medium";
    explanation = "The text contains requests for sensitive information or account actions, which is a classic phishing indicator.";
    recommendations = ["Do not share personal or financial information.", "Avoid clicking any unknown links.", "Verify the sender's identity independently."];
  } else if (lowerText.includes("download") || lowerText.includes("attachment") || lowerText.includes(".exe") || lowerText.includes("install")) {
    type = "Malware";
    severity = "High";
    explanation = "The message encourages downloading a file or attachment, which is a very common vector for malware distribution.";
    recommendations = ["Do not download or open the attachment.", "Delete the message immediately.", "Report the message to your IT security team."];
  } else if (lowerText.includes("urgent") || lowerText.includes("act now") || lowerText.includes("boss") || lowerText.includes("gift card")) {
    type = "Social Engineering";
    severity = "Medium";
    explanation = "The message attempts psychological manipulation by creating an artificial sense of urgency or authority.";
    recommendations = ["Pause and do not act immediately.", "Verify the request through a secondary, trusted communication channel.", "Do not comply with unusual financial demands."];
  }

  return { type, severity, explanation, recommendations };
}

const analyzeText = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text input is required' });
  }

  try {
    console.log("🚀 CALLING GROQ...");

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: `You are a cybersecurity expert.
Analyze the text and return ONLY valid JSON.

Detect:
- Phishing
- Malware
- Social Engineering
- Safe

Return in JSON format with:
type, severity, explanation, recommendations

Be strict and accurate.`
        },
        { role: "user", content: text }
      ],
    }); // ✅ ONLY ONE closing

    console.log("✅ GROQ API CALLED SUCCESSFULLY");
    console.log("FULL RESPONSE:", completion);

    const rawResponse = completion?.choices?.[0]?.message?.content || "";

    if (!rawResponse || rawResponse.trim() === "") {
  throw new Error("Empty response from Groq");
}

    // extract JSON from text
    let aiResponse;

try {
  const start = rawResponse.indexOf("{");
  const end = rawResponse.lastIndexOf("}") + 1;

  aiResponse = rawResponse.substring(start, end);
} catch {
  aiResponse = rawResponse;
}

let parsedAnalysis;

try {
  const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
  const cleanJson = jsonMatch ? jsonMatch[0] : rawResponse;

  parsedAnalysis = JSON.parse(cleanJson);
} catch (err) {
  parsedAnalysis = {
    type: "Unknown",
    severity: "Medium",
    explanation: rawResponse,
    recommendations: []
  };
}

    // Save to history
    const historyItem = {
      id: Date.now().toString(),
      text: text.length > 50 ? text.substring(0, 50) + '...' : text,
      ...parsedAnalysis,
      timestamp: new Date().toISOString()
    };
    
    history.unshift(historyItem);
    if (history.length > 50) {
      history = history.slice(0, 50);
    }

    return res.json(parsedAnalysis);

  } catch (error) {
    console.error("❌ GROQ ERROR FULL:", error);
    console.log("⚠️ USING MOCK");

    const mockAnalysis = generateMockResponse(text);

    const historyItem = {
      id: Date.now().toString(),
      text: text.length > 50 ? text.substring(0, 50) + '...' : text,
      ...mockAnalysis,
      timestamp: new Date().toISOString()
    };
    
    history.unshift(historyItem);
    if (history.length > 50) {
      history = history.slice(0, 50);
    }

    return res.json(mockAnalysis);
  }
};

const getHistory = (req, res) => {
  res.json(history);
};

module.exports = {
  analyzeText,
  getHistory
};