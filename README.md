# 🔐 CySec AI – AI-Based Cybersecurity Threat Analyzer

CySec AI is a full-stack web application that uses AI to analyze text messages and detect cybersecurity threats such as **phishing, social engineering, malware, and scams** in real time.

---

## 🚀 Live Demo

* 🌐 Frontend (Vercel): https://ai-cybersecurity-app.vercel.app
* ⚙ Backend (Render): https://ai-cybersecurity-app.onrender.com

---

## 📌 Features

* 🧠 AI-powered threat detection using Groq API
* 🔍 Detects:

  * Phishing attacks
  * Social engineering attempts
  * Malware-related messages
  * Scam messages
* 📊 Risk classification:

  * Low Risk
  * Medium Risk
  * High Risk
* 📝 Detailed explanation for each analysis
* 💡 Security recommendations
* 📜 History tracking of analyzed messages
* ⚡ Fast and responsive UI

---

## 🛠 Tech Stack

### Frontend

* React.js (Vite)
* Tailwind CSS
* Axios
* Recharts (for visualization)

### Backend

* Node.js
* Express.js
* Groq AI API
* Helmet (security)
* Morgan (logging)
* CORS

### Deployment

* Frontend → Vercel
* Backend → Render

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Alizaki22/ai-cybersecurity-app.git
cd ai-cybersecurity-app
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
GROQ_API_KEY=your_api_key_here
PORT=5000
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Environment Variables

### Backend (.env)

* `GROQ_API_KEY` → Your Groq API key
* `PORT` → Server port (Render sets automatically)

---

## 🧠 How It Works

1. User enters suspicious text
2. Frontend sends request to backend
3. Backend sends text to Groq AI
4. AI returns structured JSON:

```json
{
  "type": "Phishing",
  "severity": "High",
  "explanation": "...",
  "recommendations": []
}
```

5. Backend parses response
6. Frontend displays results in UI

---

## 🧪 Example Test Cases

| Input                             | Output             |
| --------------------------------- | ------------------ |
| "Click this link to claim reward" | Phishing           |
| "Send me your OTP"                | Social Engineering |
| "Download this attachment"        | Malware            |
| "Hello, how are you?"             | Safe               |

---

## ⚠️ Known Limitations

* Some edge cases may return **"Unknown"** if AI response format varies
* Malware detection can be improved further
* No authentication system (yet)

---

## 🔥 Future Improvements

* ✅ Add user authentication
* ✅ Store history in database (MongoDB)
* ✅ Improve AI prompt for higher accuracy
* ✅ Add confidence score (%)
* ✅ Export reports (PDF)
* ✅ Real-time URL scanning

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repo and submit a pull request.

---

## 📜 License

This project is open-source and available under the MIT License.

---

## 🙌 Acknowledgements

* Groq AI API
* React & Node.js community

---

## 👨‍💻 Author

**Aliyu Gambo Abubakar**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
