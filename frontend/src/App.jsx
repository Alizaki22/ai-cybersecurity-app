import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, AlertTriangle, ShieldCheck, Search, Info, CheckCircle2, History, Activity, Award, GraduationCap, XCircle, ChevronRight, Mail, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ── Google Font injection ──────────────────────────────────────────
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// ── CSS variables & global styles ────────────────────────────────
const globalStyles = `
  :root {
    --bg:       #080c14;
    --surface:  #0d1520;
    --surface2: #111d2e;
    --border:   #1a2d45;
    --border2:  #243a55;
    --accent:   #00c2ff;
    --accent2:  #0077ff;
    --red:      #ff3d5a;
    --amber:    #ffb83d;
    --green:    #00e5a0;
    --text:     #e8edf5;
    --muted:    #5a7a99;
    --mono:     'Space Mono', monospace;
    --sans:     'DM Sans', sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--sans);
    min-height: 100vh;
  }

  /* Scanline overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,194,255,0.015) 2px,
      rgba(0,194,255,0.015) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  /* Grid background */
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,194,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,194,255,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  #root { position: relative; z-index: 1; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--accent); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 8px rgba(0,194,255,0.3); }
    50%       { box-shadow: 0 0 20px rgba(0,194,255,0.6); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .fade-up   { animation: fadeUp  0.5s ease both; }
  .slide-in  { animation: slideIn 0.35s ease both; }
  .spin-anim { animation: spin 0.9s linear infinite; }

  /* Nav */
  .nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(8,12,20,0.92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .nav-inner {
    max-width: 1080px; margin: 0 auto;
    padding: 0 24px;
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .logo {
    display: flex; align-items: center; gap: 10px;
    cursor: pointer; text-decoration: none;
  }
  .logo-icon {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, var(--accent2), var(--accent));
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    animation: glowPulse 3s ease-in-out infinite;
  }
  .logo-text {
    font-family: var(--mono);
    font-size: 18px; font-weight: 700;
    color: var(--accent);
    letter-spacing: 0.05em;
  }
  .logo-text span { color: var(--text); }

  .score-chip {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,184,61,0.08);
    border: 1px solid rgba(255,184,61,0.25);
    color: var(--amber);
    padding: 5px 14px;
    border-radius: 20px;
    font-family: var(--mono);
    font-size: 13px; font-weight: 700;
  }

  .nav-tabs { display: flex; gap: 4px; }
  .nav-tab {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px;
    border-radius: 8px;
    border: none; cursor: pointer;
    font-family: var(--sans); font-size: 14px; font-weight: 500;
    background: transparent; color: var(--muted);
    transition: all 0.2s;
  }
  .nav-tab:hover { background: var(--surface2); color: var(--text); }
  .nav-tab.active {
    background: rgba(0,194,255,0.1);
    color: var(--accent);
    border: 1px solid rgba(0,194,255,0.2);
  }

  /* Page wrapper */
  .page { max-width: 900px; margin: 0 auto; padding: 48px 24px 80px; }

  /* Section headings */
  .page-title {
    font-family: var(--mono);
    font-size: clamp(26px, 4vw, 38px);
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .page-title .accent { color: var(--accent); }
  .page-sub {
    font-size: 15px; color: var(--muted);
    margin-top: 10px; line-height: 1.6;
  }

  /* Cards */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .card:hover { border-color: var(--border2); }
  .card-header {
    background: var(--surface2);
    border-bottom: 1px solid var(--border);
    padding: 18px 24px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .card-body { padding: 24px; }

  /* Textarea */
  .threat-input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--text);
    font-family: var(--sans); font-size: 14px;
    padding: 16px;
    resize: none;
    line-height: 1.6;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .threat-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0,194,255,0.1);
  }
  .threat-input::placeholder { color: var(--muted); }
  .input-label {
    font-family: var(--mono);
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 10px;
    display: block;
  }

  /* Buttons */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 28px;
    background: linear-gradient(135deg, var(--accent2), var(--accent));
    color: #fff;
    font-family: var(--mono); font-size: 13px; font-weight: 700;
    letter-spacing: 0.05em;
    border: none; border-radius: 10px; cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(0,194,255,0.25);
  }
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(0,194,255,0.4);
  }
  .btn-primary:active:not(:disabled) { transform: translateY(0) scale(0.98); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px;
    background: transparent;
    border: 1px solid var(--border2);
    color: var(--text);
    font-family: var(--mono); font-size: 12px; font-weight: 700;
    letter-spacing: 0.05em;
    border-radius: 10px; cursor: pointer;
    transition: all 0.2s;
  }
  .btn-ghost:hover { background: var(--surface2); border-color: var(--accent); color: var(--accent); }

  .btn-dark {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 28px;
    background: var(--surface2);
    border: 1px solid var(--border2);
    color: var(--text);
    font-family: var(--mono); font-size: 13px; font-weight: 700;
    border-radius: 10px; cursor: pointer;
    transition: all 0.2s;
  }
  .btn-dark:hover { background: var(--border); border-color: var(--text); }

  /* Error / info banners */
  .banner-error {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 16px;
    background: rgba(255,61,90,0.08);
    border: 1px solid rgba(255,61,90,0.3);
    border-radius: 10px;
    color: #ff8fa0;
    font-size: 13px; font-weight: 500;
  }

  /* Risk badge */
  .risk-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-family: var(--mono); font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em;
    border: 1px solid;
  }
  .risk-high   { background: rgba(255,61,90,0.1);  border-color: rgba(255,61,90,0.35);  color: var(--red);   }
  .risk-medium { background: rgba(255,184,61,0.1); border-color: rgba(255,184,61,0.35); color: var(--amber); }
  .risk-low    { background: rgba(0,229,160,0.1);  border-color: rgba(0,229,160,0.35);  color: var(--green); }
  .risk-default{ background: rgba(90,122,153,0.1); border-color: rgba(90,122,153,0.35); color: var(--muted); }

  /* Result grid */
  .result-meta { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; }
  @media (max-width: 600px) { .result-meta { grid-template-columns: 1fr; } }

  .meta-box {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 20px;
  }
  .meta-label {
    font-family: var(--mono);
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .meta-value { font-size: 20px; font-weight: 600; color: var(--text); }
  .meta-text  { font-size: 14px; color: #a8bdd0; line-height: 1.65; }

  /* Recommendations */
  .rec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 600px) { .rec-grid { grid-template-columns: 1fr; } }

  .rec-item {
    display: flex; align-items: flex-start; gap: 12px;
    background: rgba(0,119,255,0.05);
    border: 1px solid rgba(0,119,255,0.15);
    border-left: 3px solid var(--accent2);
    border-radius: 10px;
    padding: 14px 16px;
    font-size: 13px; color: #a8bdd0; line-height: 1.55;
  }

  /* Section label */
  .section-label {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--mono);
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 16px;
  }
  .section-label::after {
    content: '';
    flex: 1; height: 1px;
    background: var(--border);
  }

  /* History items */
  .history-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 18px 20px;
    display: flex; align-items: flex-start; gap: 14px;
    transition: border-color 0.2s, transform 0.2s;
  }
  .history-item:hover { border-color: var(--border2); transform: translateX(3px); }
  .history-dot {
    width: 10px; height: 10px; border-radius: 50%;
    margin-top: 5px; flex-shrink: 0;
  }
  .history-type {
    font-family: var(--mono);
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.06em;
    padding: 3px 10px;
    border-radius: 6px;
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--muted);
  }
  .history-time { font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .history-text {
    font-size: 13px; color: var(--muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    margin-top: 8px;
    font-style: italic;
  }

  /* Training */
  .email-header {
    background: var(--surface2);
    border-bottom: 1px solid var(--border);
    padding: 18px 24px;
    display: flex; align-items: center; gap: 14px;
  }
  .email-row { font-size: 13px; color: var(--muted); margin-bottom: 3px; }
  .email-row span { color: var(--text); font-weight: 500; }
  .email-body {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
    font-size: 14px; line-height: 1.75;
    color: #a8bdd0;
    white-space: pre-wrap;
    font-family: var(--sans);
  }
  .classify-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  @media (min-width: 600px) { .classify-grid { grid-template-columns: repeat(4, 1fr); } }

  .classify-btn {
    padding: 14px 10px;
    border: 2px solid var(--border);
    border-radius: 12px;
    background: transparent;
    color: var(--muted);
    font-family: var(--mono); font-size: 12px; font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: all 0.2s;
  }
  .classify-btn:hover {
    border-color: var(--accent);
    background: rgba(0,194,255,0.06);
    color: var(--accent);
    transform: translateY(-2px);
  }

  .result-correct {
    background: rgba(0,229,160,0.06);
    border: 1px solid rgba(0,229,160,0.25);
    border-left: 4px solid var(--green);
    border-radius: 14px;
    padding: 22px 24px;
    display: flex; gap: 16px;
  }
  .result-wrong {
    background: rgba(255,61,90,0.06);
    border: 1px solid rgba(255,61,90,0.25);
    border-left: 4px solid var(--red);
    border-radius: 14px;
    padding: 22px 24px;
    display: flex; gap: 16px;
  }
  .result-title-correct { font-size: 18px; font-weight: 700; color: var(--green); margin-bottom: 6px; }
  .result-title-wrong   { font-size: 18px; font-weight: 700; color: var(--red);   margin-bottom: 6px; }
  .result-expl { font-size: 13px; color: #a8bdd0; line-height: 1.65; }

  .scenario-dots { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
  .dot-active   { width: 24px; height: 8px; border-radius: 4px; background: var(--accent); }
  .dot-inactive { width: 8px;  height: 8px; border-radius: 50%;  background: var(--border); }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 72px 24px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
  }
  .empty-icon { color: var(--muted); margin: 0 auto 20px; opacity: 0.4; }
  .empty-title { font-family: var(--mono); font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .empty-sub { font-size: 14px; color: var(--muted); }

  /* Spinner */
  .spinner {
    width: 20px; height: 20px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: #fff;
    border-radius: 50%;
  }

  /* Terminal cursor blink */
  .cursor::after {
    content: '▌';
    animation: blink 1s step-end infinite;
    color: var(--accent);
    margin-left: 2px;
  }
`;

// Inject styles
const styleTag = document.createElement('style');
styleTag.textContent = globalStyles;
document.head.appendChild(styleTag);

// ── DATA (unchanged) ──────────────────────────────────────────────
const TRAINING_SCENARIOS = [
  {
    id: 1,
    sender: "IT Support <admin-update@company-secure.net>",
    subject: "URGENT: Required Password Reset",
    content: "Dear Employee,\n\nOur security system detected suspicious login attempts on your account. Your password will expire in 2 hours. Please click the link below to verify your identity and retain access to your account.\n\nhttp://login-company-portal.update-security.com\n\nThank you,\nIT Support",
    correctType: "Phishing",
    explanation: "This is a classic phishing email. Notice the urgency ('expire in 2 hours'), the suspicious sender domain ('company-secure.net'), and the link that does not match a real internal portal."
  },
  {
    id: 2,
    sender: "HR Department <hr@yourcompany.com>",
    subject: "Updated Holiday Schedule 2026",
    content: "Hi Team,\n\nPlease review the updated holiday schedule for 2026. Let your manager know if you have any questions.\n\nBest,\nHuman Resources",
    correctType: "Safe",
    explanation: "This is a standard internal communication. The sender email matches the company domain, there is no urgent request for sensitive information, and no suspicious links are provided."
  },
  {
    id: 3,
    sender: "CEO <ceo.executive.urgent@gmail.com>",
    subject: "Quick Favor Needed",
    content: "Are you at your desk right now? I'm in a meeting and need you to purchase 5 Apple gift cards ($100 each) for a client presentation. I'll reimburse you by end of day. Reply ASAP.",
    correctType: "Social Engineering",
    explanation: "This is a targeted social engineering attack (CEO Fraud). The attacker uses a free email provider (gmail.com), creates a false sense of authority and urgency, and asks for an unusual financial transaction (gift cards)."
  },
  {
    id: 4,
    sender: "Invoice Processing <billing@vendor-services.com>",
    subject: "Overdue Invoice #4492 - Action Required",
    content: "Hello,\n\nYour account is severely past due. Please download and review the attached 'Invoice_4492.pdf.exe' immediately and process payment to avoid service suspension.\n\nRegards,\nBilling Dept",
    correctType: "Malware",
    explanation: "This is a malware delivery attempt. The attachment has a double extension ('.pdf.exe'), meaning it is an executable program disguised as a PDF. Clicking it would likely install malware."
  }
];

// ── HELPERS ───────────────────────────────────────────────────────
const getRiskClass = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high': return 'risk-badge risk-high';
    case 'medium': return 'risk-badge risk-medium';
    case 'low': return 'risk-badge risk-low';
    default: return 'risk-badge risk-default';
  }
};

const getRiskIcon = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high': return <AlertTriangle style={{ width: 14, height: 14 }} />;
    case 'medium': return <AlertTriangle style={{ width: 14, height: 14 }} />;
    case 'low': return <ShieldCheck style={{ width: 14, height: 14 }} />;
    default: return <Info style={{ width: 14, height: 14 }} />;
  }
};

const getDotColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high': return 'var(--red)';
    case 'medium': return 'var(--amber)';
    case 'low': return 'var(--green)';
    default: return 'var(--muted)';
  }
};

// ── COMPONENT ─────────────────────────────────────────────────────
function App() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [awarenessScore, setAwarenessScore] = useState(() => {
    const saved = localStorage.getItem('awarenessScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);
  const [showTrainingResult, setShowTrainingResult] = useState(false);

  useEffect(() => {
    localStorage.setItem('awarenessScore', awarenessScore.toString());
  }, [awarenessScore]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await axios.get('/api/analyze/history');
      setHistoryData(response.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  const handleAnalyze = async () => {
    if (!text.trim()) { setError('Please enter some text to analyze.'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const response = await axios.post('/api/analyze', { text });
      setResult(response.data);
      setAwarenessScore(prev => prev + 10);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze text. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrainingAnswer = (selectedType) => {
    setUserAnswer(selectedType);
    setShowTrainingResult(true);
    if (selectedType === TRAINING_SCENARIOS[currentScenarioIndex].correctType) {
      setAwarenessScore(prev => prev + 25);
    }
  };

  const nextScenario = () => {
    setUserAnswer(null);
    setShowTrainingResult(false);
    setCurrentScenarioIndex((prev) => (prev + 1) % TRAINING_SCENARIOS.length);
  };

  const currentScenario = TRAINING_SCENARIOS[currentScenarioIndex];
  const isCorrect = userAnswer === currentScenario.correctType;

  const getCategoryData = () => {
    const counts = { 'Phishing': 0, 'Malware': 0, 'Safe': 0, 'Social Engineering': 0 };
    historyData.forEach(item => {
      if (counts[item.type] !== undefined) counts[item.type]++;
      else counts[item.type] = 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).filter(d => d.value > 0);
  };
  
  const COLORS = {
    'Phishing': '#ffb83d',
    'Malware': '#ff3d5a',
    'Social Engineering': '#00c2ff',
    'Safe': '#00e5a0'
  };

  const exportPDF = async () => {
    const reportElement = document.getElementById('report-container');
    if (!reportElement) return;
    
    try {
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true, backgroundColor: '#080c14' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('CyberSecurity_Awareness_Report.pdf');
    } catch (err) {
      console.error("PDF Export failed", err);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── NAV ──────────────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="logo" onClick={() => setActiveTab('analyzer')}>
            <div className="logo-icon">
              <Shield style={{ width: 20, height: 20, color: '#fff' }} />
            </div>
            <span className="logo-text">Cy<span>Sec</span> AI</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="score-chip" style={{ display: window.innerWidth < 480 ? 'none' : 'flex' }}>
              <Award style={{ width: 14, height: 14 }} />
              {awarenessScore} pts
            </div>
            <div className="nav-tabs">
              {[
                { id: 'analyzer', icon: <Activity style={{ width: 15, height: 15 }} />, label: 'Analyzer' },
                { id: 'history', icon: <History style={{ width: 15, height: 15 }} />, label: 'History' },
                { id: 'training', icon: <GraduationCap style={{ width: 15, height: 15 }} />, label: 'Training' },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span style={{ display: window.innerWidth < 560 ? 'none' : 'inline' }}>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ── ANALYZER ─────────────────────────────────────── */}
      {activeTab === 'analyzer' && (
        <main className="page fade-up">
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.12em', color: 'var(--accent)',
                background: 'rgba(0,194,255,0.08)', border: '1px solid rgba(0,194,255,0.2)',
                padding: '3px 10px', borderRadius: 4
              }}>THREAT INTELLIGENCE</span>
            </div>
            <h1 className="page-title">Cyber Threat<br /><span className="accent">Analyzer</span></h1>
            <p className="page-sub" style={{ maxWidth: 520 }}>
              Paste suspicious emails, messages, or text to detect phishing, malware,
              and social engineering in real time.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label className="input-label" htmlFor="threat-input">
                ▸ Message Content
              </label>
              <textarea
                id="threat-input"
                className="threat-input"
                rows={7}
                placeholder={"E.g., 'URGENT: Your account will be suspended in 24 hours. Click here to verify…'"}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              {error && (
                <div className="banner-error">
                  <AlertTriangle style={{ width: 15, height: 15, flexShrink: 0 }} />
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
                  {loading
                    ? <div className="spinner spin-anim" />
                    : <Search style={{ width: 16, height: 16 }} />}
                  {loading ? 'Analyzing…' : 'Analyze Threat'}
                </button>
              </div>
            </div>
          </div>

          {result && (
            <div className="card slide-in">
              <div className="card-header">
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em' }}>
                  ANALYSIS RESULTS
                </span>
                <div className={getRiskClass(result.severity)}>
                  {getRiskIcon(result.severity)}
                  {result.severity?.toUpperCase()} RISK
                </div>
              </div>

              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="result-meta">
                  <div className="meta-box">
                    <div className="meta-label">Threat Type</div>
                    <div className="meta-value">{result.type}</div>
                  </div>
                  <div className="meta-box">
                    <div className="meta-label">Explanation</div>
                    <div className="meta-text">{result.explanation}</div>
                  </div>
                </div>

                <div>
                  <div className="section-label">
                    <ShieldCheck style={{ width: 13, height: 13 }} />
                    Recommendations
                  </div>
                  <div className="rec-grid">
                    {result.recommendations?.map((rec, idx) => (
                      <div key={idx} className="rec-item">
                        <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--accent2)', flexShrink: 0, marginTop: 1 }} />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ── HISTORY ──────────────────────────────────────── */}
      {activeTab === 'history' && (
        <main className="page fade-up">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <h1 className="page-title">Analysis<br /><span className="accent">History</span></h1>
              <p className="page-sub">Previously analyzed texts and detected threats.</p>
            </div>
            <button
              className="btn-ghost"
              onClick={fetchHistory}
              style={{ marginTop: 8 }}
              title="Refresh"
            >
              <Activity
                style={{ width: 14, height: 14 }}
                className={loadingHistory ? 'spin-anim' : ''}
              />
              Refresh
            </button>
          </div>

          {loadingHistory && historyData.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, gap: 16 }}>
              <div className="spinner spin-anim" style={{ width: 32, height: 32, borderWidth: 3, borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
              <span style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 13 }}>Loading records…</span>
            </div>
          ) : historyData.length === 0 ? (
            <div className="empty-state">
              <History className="empty-icon" style={{ width: 48, height: 48 }} />
              <div className="empty-title">No history yet</div>
              <div className="empty-sub">Analyze some text to see it appear here.</div>
              <button
                className="btn-ghost"
                style={{ marginTop: 24 }}
                onClick={() => setActiveTab('analyzer')}
              >
                Go to Analyzer
              </button>
            </div>
          ) : (
            <div id="report-container" style={{ padding: '20px 0' }}>
              {/* Dashboard Row */}
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 30 }}>
                 <div className="card">
                    <div className="card-header">
                       <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>THREAT BREAKDOWN</span>
                    </div>
                    <div className="card-body" style={{ height: 220, padding: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={getCategoryData()} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {getCategoryData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#5a7a99'} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)', borderRadius: 8 }} itemStyle={{ color: 'var(--text)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
                 
                 <div className="card">
                    <div className="card-header">
                       <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>AWARENESS SUMMARY</span>
                       <button className="btn-ghost" onClick={exportPDF} style={{ padding: '6px 12px', fontSize: 11 }}>
                         <Download style={{ width: 14, height: 14 }} /> PDF Export
                       </button>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                       <div className="meta-box" style={{ background: 'var(--surface2)', padding: '14px 20px' }}>
                          <div className="meta-label">Total Analyzed</div>
                          <div className="meta-value" style={{ fontSize: 24 }}>{historyData.length}</div>
                       </div>
                       <div className="meta-box" style={{ background: 'var(--surface2)', padding: '14px 20px' }}>
                          <div className="meta-label">Awareness Score</div>
                          <div className="meta-value" style={{ fontSize: 24, color: 'var(--amber)' }}>{awarenessScore} pts</div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="section-label" style={{ marginTop: 40, marginBottom: 20 }}>
                <History style={{ width: 13, height: 13 }} />
                Recent History
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {historyData.map((item) => (
                <div key={item.id} className="history-item">
                  <div
                    className="history-dot"
                    style={{ background: getDotColor(item.severity) }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      <div className={getRiskClass(item.severity)} style={{ fontSize: 10, padding: '2px 9px' }}>
                        {item.severity?.toUpperCase()}
                      </div>
                      <span className="history-type">{item.type}</span>
                      <span className="history-time" style={{ marginLeft: 'auto' }}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' · '}
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="history-text">"{item.text}"</div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ── TRAINING ─────────────────────────────────────── */}
      {activeTab === 'training' && (
        <main className="page fade-up">
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.12em', color: 'var(--amber)',
                background: 'rgba(255,184,61,0.08)', border: '1px solid rgba(255,184,61,0.2)',
                padding: '3px 10px', borderRadius: 4
              }}>SIMULATION MODE</span>
            </div>
            <h1 className="page-title">Phishing<br /><span className="accent">Simulation</span></h1>
            <p className="page-sub">Classify these simulated emails and earn points for correct answers.</p>
          </div>

          <div className="card">
            {/* Email header */}
            <div className="email-header">
              <Mail style={{ width: 18, height: 18, color: 'var(--muted)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="email-row">From: <span>{currentScenario.sender}</span></div>
                <div className="email-row" style={{ marginBottom: 0 }}>Subject: <span>{currentScenario.subject}</span></div>
              </div>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Email body */}
              <div className="email-body">{currentScenario.content}</div>

              {/* Classification */}
              {!showTrainingResult ? (
                <div>
                  <div className="section-label">Classify this email</div>
                  <div className="classify-grid">
                    {['Safe', 'Phishing', 'Malware', 'Social Engineering'].map((type) => (
                      <button
                        key={type}
                        className="classify-btn"
                        onClick={() => handleTrainingAnswer(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className={isCorrect ? 'result-correct' : 'result-wrong'}>
                    {isCorrect
                      ? <CheckCircle2 style={{ width: 28, height: 28, color: 'var(--green)', flexShrink: 0, marginTop: 2 }} />
                      : <XCircle style={{ width: 28, height: 28, color: 'var(--red)', flexShrink: 0, marginTop: 2 }} />}
                    <div>
                      <div className={isCorrect ? 'result-title-correct' : 'result-title-wrong'}>
                        {isCorrect
                          ? '✓ Correct — +25 points'
                          : `✗ Incorrect — It was "${currentScenario.correctType}"`}
                      </div>
                      <p className="result-expl">{currentScenario.explanation}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-dark" onClick={nextScenario}>
                      Next Scenario
                      <ChevronRight style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress dots */}
          <div className="scenario-dots">
            {TRAINING_SCENARIOS.map((_, idx) => (
              <div
                key={idx}
                className={idx === currentScenarioIndex ? 'dot-active' : 'dot-inactive'}
              />
            ))}
          </div>
        </main>
      )}
    </div>
  );
}

export default App;