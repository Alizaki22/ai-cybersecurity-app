/**
 * Controller to handle text analysis for cybersecurity threats
 */
const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI();

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
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a cybersecurity expert analyzing text for potential threats.
          Please provide a JSON response with the following strict structure:
          {
            "type": "Phishing | Malware | Safe | Social Engineering",
            "severity": "Low | Medium | High",
            "explanation": "A concise explanation of why this text is classified this way.",
            "recommendations": ["Recommendation 1", "Recommendation 2"]
          }`
        },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0].message.content;
    const parsedAnalysis = JSON.parse(aiResponse);

    // Save to history
    const historyItem = {
      id: Date.now().toString(),
      text: text.length > 50 ? text.substring(0, 50) + '...' : text,
      ...parsedAnalysis,
      timestamp: new Date().toISOString()
    };
    
    // Add to beginning of array
    history.unshift(historyItem);
    
    // Keep only the last 50 items
    if (history.length > 50) {
      history = history.slice(0, 50);
    }

    res.json(parsedAnalysis);
  } catch (error) {
    console.error("OpenAI API Error:", error.message || error);
    console.log("Using mock AI response as fallback.");
    
    // Generate intelligent mock response
    const mockAnalysis = generateMockResponse(text);

    // Save mock response to history
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

    // Return the mock analysis successfully to the frontend
    res.json(mockAnalysis);
  }
};

const getHistory = (req, res) => {
  res.json(history);
};

module.exports = {
  analyzeText,
  getHistory
};
