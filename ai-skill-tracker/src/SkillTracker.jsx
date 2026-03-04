import { useState, useEffect, useRef, useCallback } from "react";

// ── Utility helpers ──────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const greetTime = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

// ── Storage helpers (localStorage) ──────────────────────────
const store = {
  get: (k, fallback = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ── Claude API call ──────────────────────────────────────────
async function askClaude(systemPrompt, userMessage, history = []) {
  const messages = [...history, { role: "user", content: userMessage }];
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.map((b) => b.text).join("") || "I couldn't respond right now.";
}

// ── System prompt for AI coach ───────────────────────────────
const COACH_SYSTEM = `You are AXIS — an elite AI skill development coach embedded in a personal growth tracker. 
You are precise, encouraging, and data-driven. You speak with authority but warmth.
You help users track daily skill practice, identify patterns, give actionable feedback, and celebrate wins.
Keep responses concise (2-4 sentences) unless asked for detail.
When analyzing skill logs, reference specific data the user has shared.
Never be generic. Always be personal and specific.`;

// ── Color palette ─────────────────────────────────────────────
const COLORS = {
  bg: "#080b14",
  surface: "#0e1320",
  panel: "#111827",
  border: "rgba(99,179,237,0.12)",
  borderHi: "rgba(99,179,237,0.30)",
  accent: "#63b3ed",
  accentGlow: "rgba(99,179,237,0.15)",
  green: "#68d391",
  orange: "#f6ad55",
  red: "#fc8181",
  purple: "#b794f4",
  text1: "#f0f4f8",
  text2: "#8899aa",
  text3: "#4a5568",
};

// ── Skill categories ──────────────────────────────────────────
const SKILL_CATEGORIES = [
  "Programming", "Mathematics", "Design", "Writing", "Communication",
  "Leadership", "Language", "Music", "Art", "Fitness", "Reading", "Research", "Other",
];

// ═══════════════════════════════════════════════════════════════
// SCREEN 1 — GREETING
// ═══════════════════════════════════════════════════════════════
function GreetingScreen({ onDone }) {
  const [phase, setPhase] = useState(0); // 0=logo 1=text 2=button
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: COLORS.bg, position: "relative", overflow: "hidden",
    }}>
      {/* Grid lines */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(99,179,237,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,179,237,0.03) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      {/* Glow orb */}
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,179,237,0.07) 0%, transparent 70%)",
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
      }} />

      {/* AXIS logo */}
      <div style={{
        opacity: phase >= 0 ? 1 : 0,
        transform: phase >= 0 ? "scale(1)" : "scale(0.8)",
        transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
        textAlign: "center", zIndex: 1,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20, margin: "0 auto 24px",
          background: "linear-gradient(135deg, rgba(99,179,237,0.2), rgba(183,148,244,0.2))",
          border: `1px solid ${COLORS.borderHi}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 40px rgba(99,179,237,0.15)",
          backdropFilter: "blur(12px)",
        }}>
          <span style={{ fontSize: 32, fontFamily: "monospace", color: COLORS.accent, fontWeight: 700 }}>⊕</span>
        </div>

        <div style={{
          opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s cubic-bezier(0.4,0,0.2,1) 0.2s",
        }}>
          <h1 style={{
            fontFamily: "'Syne', 'Outfit', sans-serif", fontWeight: 800,
            fontSize: "clamp(2.5rem,8vw,5rem)", letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #f0f4f8 30%, #63b3ed 70%, #b794f4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: "0 0 8px",
          }}>AXIS</h1>
          <p style={{ color: COLORS.text2, fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 6px" }}>
            AI Skill Intelligence System
          </p>
          <p style={{ color: COLORS.text3, fontSize: 12, letterSpacing: "0.15em" }}>
            {greetTime()} — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        <div style={{
          marginTop: 48,
          opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <button onClick={onDone} style={{
            padding: "14px 48px", borderRadius: 10,
            background: "linear-gradient(135deg, rgba(99,179,237,0.15), rgba(183,148,244,0.10))",
            border: `1px solid ${COLORS.borderHi}`,
            color: COLORS.text1, fontSize: 14, fontWeight: 500,
            letterSpacing: "0.08em", cursor: "pointer",
            backdropFilter: "blur(12px)",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.target.style.background = "rgba(99,179,237,0.2)"; e.target.style.boxShadow = "0 0 24px rgba(99,179,237,0.2)"; }}
            onMouseLeave={e => { e.target.style.background = "linear-gradient(135deg, rgba(99,179,237,0.15), rgba(183,148,244,0.10))"; e.target.style.boxShadow = "none"; }}
          >
            Begin Session →
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 2 — LOGIN
// ═══════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    const users = store.get("axis_users", {});

    if (mode === "register") {
      if (users[username]) { setError("Username already exists."); return; }
      users[username] = { password, createdAt: today(), name: username };
      store.set("axis_users", users);
      onLogin(username);
    } else {
      if (!users[username] || users[username].password !== password) {
        setError("Invalid username or password.");
        return;
      }
      onLogin(username);
    }
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px", borderRadius: 8,
    background: "rgba(255,255,255,0.04)", border: `1px solid ${COLORS.border}`,
    color: COLORS.text1, fontSize: 14, outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: COLORS.bg, padding: 20, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(99,179,237,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,179,237,0.025) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,179,237,0.05) 0%, transparent 70%)",
        top: "30%", right: "10%",
      }} />

      <div style={{
        width: "100%", maxWidth: 400, zIndex: 1,
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.6s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, margin: "0 auto 16px",
            background: "rgba(99,179,237,0.1)", border: `1px solid ${COLORS.borderHi}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 20, color: COLORS.accent }}>⊕</span>
          </div>
          <h2 style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 24, color: COLORS.text1, margin: "0 0 6px" }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ color: COLORS.text2, fontSize: 13 }}>
            {mode === "login" ? "Sign in to your AXIS dashboard" : "Start your skill growth journey"}
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: 16, padding: "28px 28px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.text3, marginBottom: 8 }}>Username</label>
              <input
                style={inputStyle} value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                onFocus={e => e.target.style.borderColor = COLORS.accent}
                onBlur={e => e.target.style.borderColor = COLORS.border}
                placeholder="your_username" autoComplete="username"
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.text3, marginBottom: 8 }}>Password</label>
              <input
                type={visible ? "password" : "text"}
                style={inputStyle} value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                onFocus={e => e.target.style.borderColor = COLORS.accent}
                onBlur={e => e.target.style.borderColor = COLORS.border}
                placeholder="••••••••" autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
            </div>
            {error && <p style={{ color: COLORS.red, fontSize: 12, marginBottom: 16, textAlign: "center" }}>{error}</p>}
            <button type="submit" style={{
              width: "100%", padding: "13px", borderRadius: 8,
              background: `linear-gradient(135deg, ${COLORS.accent}, #b794f4)`,
              border: "none", color: "#080b14", fontSize: 14, fontWeight: 600,
              cursor: "pointer", letterSpacing: "0.04em",
              transition: "opacity 0.2s, transform 0.15s",
            }}
              onMouseEnter={e => { e.target.style.opacity = "0.9"; e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; }}
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: COLORS.text2 }}>
            {mode === "login" ? "No account? " : "Already have one? "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ background: "none", border: "none", color: COLORS.accent, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 3 — MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════
function Dashboard({ username, onLogout }) {
  const userKey = `axis_logs_${username}`;
  const [logs, setLogs] = useState(() => store.get(userKey, []));
  const [activeTab, setActiveTab] = useState("today");
  const [aiMessage, setAiMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ skill: "", category: "Programming", duration: 30, notes: "", rating: 3 });
  const chatEndRef = useRef(null);

  // Persist logs
  useEffect(() => { store.set(userKey, logs); }, [logs]);

  // Scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  // Initial AI greeting on dashboard load
  useEffect(() => {
    (async () => {
      setAiLoading(true);
      const todayLogs = logs.filter(l => l.date === today());
      const totalMinutes = logs.reduce((s, l) => s + l.duration, 0);
      const context = todayLogs.length
        ? `Today the user has logged: ${todayLogs.map(l => `${l.skill} (${l.duration}min)`).join(", ")}.`
        : "The user has not logged any skills yet today.";
      const msg = await askClaude(COACH_SYSTEM,
        `${greetTime()}, ${username}! ${context} Total lifetime practice: ${totalMinutes} minutes. Give a personalized 2-sentence greeting and one specific suggestion for today.`
      );
      setAiMessage(msg);
      setAiLoading(false);
    })();
  }, []);

  // Computed stats
  const todayLogs = logs.filter(l => l.date === today());
  const todayMinutes = todayLogs.reduce((s, l) => s + l.duration, 0);
  const totalMinutes = logs.reduce((s, l) => s + l.duration, 0);
  const streak = (() => {
    let s = 0, d = new Date();
    while (true) {
      const ds = d.toISOString().slice(0, 10);
      if (!logs.some(l => l.date === ds)) break;
      s++; d.setDate(d.getDate() - 1);
    }
    return s;
  })();

  const skillTotals = logs.reduce((acc, l) => {
    acc[l.skill] = (acc[l.skill] || 0) + l.duration;
    return acc;
  }, {});
  const topSkills = Object.entries(skillTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const addLog = () => {
    if (!logForm.skill.trim()) return;
    const entry = { id: Date.now(), ...logForm, date: today(), timestamp: new Date().toISOString() };
    setLogs(prev => [entry, ...prev]);
    setShowLogForm(false);
    setLogForm({ skill: "", category: "Programming", duration: 30, notes: "", rating: 3 });

    // AI reaction to new log
    (async () => {
      setAiLoading(true);
      const msg = await askClaude(COACH_SYSTEM,
        `${username} just logged: "${logForm.skill}" for ${logForm.duration} minutes (${logForm.category}). Rating: ${logForm.rating}/5. Notes: "${logForm.notes || "none"}". Give a specific 2-sentence reaction and micro-tip.`
      );
      setAiMessage(msg);
      setAiLoading(false);
    })();
  };

  const sendChat = async () => {
    if (!chatInput.trim() || aiLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newHistory = [...chatHistory, { role: "user", content: userMsg }];
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatHistory(newHistory);
    setAiLoading(true);

    const context = `User: ${username}. Skill log summary: ${JSON.stringify(topSkills)}. Today: ${todayMinutes} min, streak: ${streak} days.`;
    const reply = await askClaude(COACH_SYSTEM, `${context}\n\nUser message: ${userMsg}`, chatHistory);
    setChatMessages(prev => [...prev, { role: "ai", text: reply }]);
    setChatHistory(prev => [...prev, { role: "assistant", content: reply }]);
    setAiLoading(false);
  };

  const analyzeWeek = async () => {
    setAiLoading(true);
    const week = logs.filter(l => {
      const d = new Date(l.date);
      const now = new Date();
      return (now - d) / 86400000 <= 7;
    });
    const summary = week.map(l => `${l.skill} (${l.duration}min, ${l.category})`).join("; ");
    const msg = await askClaude(COACH_SYSTEM,
      `Analyze this week's skill data for ${username}: ${summary || "No logs this week"}. Give a structured 3-4 sentence analysis: what they're doing well, a gap you notice, and one priority for next week.`
    );
    setAiMessage(msg);
    setAiLoading(false);
  };

  // ── Styles ──
  const tabStyle = (t) => ({
    padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: "pointer", border: "none", transition: "all 0.15s",
    background: activeTab === t ? "rgba(99,179,237,0.15)" : "transparent",
    color: activeTab === t ? COLORS.accent : COLORS.text2,
    borderBottom: activeTab === t ? `2px solid ${COLORS.accent}` : "2px solid transparent",
  });

  const panelStyle = {
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    borderRadius: 14, padding: "20px 22px", marginBottom: 16,
  };

  const statCard = (label, value, sub, color = COLORS.accent) => (
    <div style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: 12, padding: "18px 20px", flex: 1, minWidth: 120,
    }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.text3, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: COLORS.text3, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Top nav */}
      <nav style={{
        background: "rgba(8,11,20,0.85)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: COLORS.accent, fontSize: 18 }}>⊕</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: COLORS.text1, letterSpacing: "0.08em" }}>AXIS</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["today", "progress", "chat"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={tabStyle(t)}>
              {t === "today" ? "Dashboard" : t === "progress" ? "Progress" : "AI Coach"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: COLORS.text2 }}>{username}</span>
          <button onClick={onLogout} style={{
            padding: "6px 14px", borderRadius: 6, background: "transparent",
            border: `1px solid ${COLORS.border}`, color: COLORS.text2,
            fontSize: 12, cursor: "pointer",
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── AI Message Banner ── */}
        <div style={{
          ...panelStyle, marginBottom: 20,
          background: "linear-gradient(135deg, rgba(99,179,237,0.06), rgba(183,148,244,0.04))",
          borderColor: COLORS.borderHi,
          display: "flex", alignItems: "flex-start", gap: 14,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "rgba(99,179,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${COLORS.borderHi}`,
          }}>
            <span style={{ color: COLORS.accent }}>◈</span>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: COLORS.accent, marginBottom: 4 }}>AXIS AI</div>
            {aiLoading && !aiMessage
              ? <div style={{ color: COLORS.text2, fontSize: 13 }}>
                  <span style={{ animation: "pulse 1.4s ease-in-out infinite" }}>Thinking...</span>
                </div>
              : <p style={{ color: COLORS.text1, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{aiMessage || "Initializing..."}</p>
            }
          </div>
        </div>

        {/* ═══ TAB: TODAY / DASHBOARD ═══ */}
        {activeTab === "today" && (
          <>
            {/* Stat row */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {statCard("Today", `${todayMinutes}m`, "minutes practiced")}
              {statCard("Streak", `${streak}d`, "consecutive days", COLORS.green)}
              {statCard("Total", `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, "lifetime practice", COLORS.purple)}
              {statCard("Sessions", logs.length, "total logs", COLORS.orange)}
            </div>

            {/* Log form toggle */}
            <div style={{ marginBottom: 16 }}>
              <button onClick={() => setShowLogForm(!showLogForm)} style={{
                padding: "11px 24px", borderRadius: 10,
                background: showLogForm ? "rgba(255,255,255,0.04)" : `linear-gradient(135deg, ${COLORS.accent}, #b794f4)`,
                border: showLogForm ? `1px solid ${COLORS.border}` : "none",
                color: showLogForm ? COLORS.text2 : "#080b14",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                letterSpacing: "0.04em",
              }}>
                {showLogForm ? "× Cancel" : "+ Log New Skill"}
              </button>
            </div>

            {/* Log form */}
            {showLogForm && (
              <div style={{ ...panelStyle, marginBottom: 20 }}>
                <h3 style={{ color: COLORS.text1, fontSize: 14, fontWeight: 600, marginBottom: 18 }}>Log Practice Session</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    { label: "Skill / Topic", key: "skill", type: "text", placeholder: "e.g. React Hooks, Calculus..." },
                  ].map(f => (
                    <div key={f.key} style={{ gridColumn: "1/-1" }}>
                      <label style={{ display: "block", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.text3, marginBottom: 6 }}>{f.label}</label>
                      <input value={logForm[f.key]} onChange={e => setLogForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${COLORS.border}`, color: COLORS.text1, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.text3, marginBottom: 6 }}>Category</label>
                    <select value={logForm.category} onChange={e => setLogForm(p => ({ ...p, category: e.target.value }))}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: COLORS.panel, border: `1px solid ${COLORS.border}`, color: COLORS.text1, fontSize: 14, outline: "none" }}>
                      {SKILL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.text3, marginBottom: 6 }}>Duration (min)</label>
                    <input type="number" min={1} max={480} value={logForm.duration} onChange={e => setLogForm(p => ({ ...p, duration: Number(e.target.value) }))}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${COLORS.border}`, color: COLORS.text1, fontSize: 14, outline: "none" }} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ display: "block", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.text3, marginBottom: 6 }}>Rating: {logForm.rating}/5</label>
                    <input type="range" min={1} max={5} value={logForm.rating} onChange={e => setLogForm(p => ({ ...p, rating: Number(e.target.value) }))}
                      style={{ width: "100%", accentColor: COLORS.accent }} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ display: "block", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.text3, marginBottom: 6 }}>Notes (optional)</label>
                    <textarea value={logForm.notes} onChange={e => setLogForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="What did you learn? Any challenges?"
                      rows={2}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${COLORS.border}`, color: COLORS.text1, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                  </div>
                </div>
                <button onClick={addLog} style={{
                  marginTop: 16, padding: "11px 28px", borderRadius: 8,
                  background: `linear-gradient(135deg, ${COLORS.accent}, #b794f4)`,
                  border: "none", color: "#080b14", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  Save & Get AI Feedback
                </button>
              </div>
            )}

            {/* Today's logs */}
            <div style={panelStyle}>
              <h3 style={{ color: COLORS.text1, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                Today's Sessions — {fmt(today())}
              </h3>
              {todayLogs.length === 0
                ? <p style={{ color: COLORS.text3, fontSize: 13 }}>No sessions logged today. Start with something small.</p>
                : todayLogs.map(log => (
                  <div key={log.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 0", borderBottom: `1px solid ${COLORS.border}`,
                  }}>
                    <div>
                      <div style={{ color: COLORS.text1, fontSize: 14, fontWeight: 500 }}>{log.skill}</div>
                      <div style={{ color: COLORS.text3, fontSize: 11, marginTop: 2 }}>{log.category} · {log.notes || "No notes"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: COLORS.accent, fontSize: 14, fontWeight: 600 }}>{log.duration}m</div>
                      <div style={{ color: COLORS.text3, fontSize: 11 }}>{"★".repeat(log.rating)}{"☆".repeat(5 - log.rating)}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        )}

        {/* ═══ TAB: PROGRESS ═══ */}
        {activeTab === "progress" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ color: COLORS.text1, fontSize: 18, fontWeight: 700 }}>Skill Progress</h2>
              <button onClick={analyzeWeek} style={{
                padding: "9px 20px", borderRadius: 8,
                background: "rgba(99,179,237,0.1)", border: `1px solid ${COLORS.borderHi}`,
                color: COLORS.accent, fontSize: 12, fontWeight: 500, cursor: "pointer",
              }}>
                {aiLoading ? "Analyzing..." : "◈ AI Weekly Analysis"}
              </button>
            </div>

            {/* Top skills bar chart */}
            <div style={panelStyle}>
              <h3 style={{ color: COLORS.text1, fontSize: 13, fontWeight: 600, marginBottom: 18 }}>Top Skills by Total Time</h3>
              {topSkills.length === 0
                ? <p style={{ color: COLORS.text3, fontSize: 13 }}>Log some sessions to see your top skills.</p>
                : topSkills.map(([skill, mins], i) => {
                  const pct = Math.round((mins / topSkills[0][1]) * 100);
                  const hues = [COLORS.accent, COLORS.purple, COLORS.green, COLORS.orange, COLORS.red];
                  return (
                    <div key={skill} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, color: COLORS.text1 }}>{skill}</span>
                        <span style={{ fontSize: 12, color: COLORS.text2 }}>{Math.floor(mins / 60)}h {mins % 60}m</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`, borderRadius: 4,
                          background: hues[i] || COLORS.accent,
                          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                        }} />
                      </div>
                    </div>
                  );
                })
              }
            </div>

            {/* Recent 7-day heatmap */}
            <div style={panelStyle}>
              <h3 style={{ color: COLORS.text1, fontSize: 13, fontWeight: 600, marginBottom: 18 }}>Last 14 Days</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Array.from({ length: 14 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (13 - i));
                  const ds = d.toISOString().slice(0, 10);
                  const mins = logs.filter(l => l.date === ds).reduce((s, l) => s + l.duration, 0);
                  const intensity = Math.min(mins / 120, 1);
                  return (
                    <div key={ds} title={`${fmt(ds)}: ${mins} min`} style={{
                      flex: 1, minWidth: 36, height: 48, borderRadius: 6,
                      background: mins > 0
                        ? `rgba(99,179,237,${0.1 + intensity * 0.7})`
                        : "rgba(255,255,255,0.04)",
                      border: `1px solid ${mins > 0 ? COLORS.borderHi : COLORS.border}`,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 2,
                      cursor: "default",
                    }}>
                      <span style={{ fontSize: 9, color: COLORS.text3 }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                      {mins > 0 && <span style={{ fontSize: 9, color: COLORS.accent, fontWeight: 600 }}>{mins}m</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* All logs */}
            <div style={panelStyle}>
              <h3 style={{ color: COLORS.text1, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>All Sessions</h3>
              {logs.length === 0
                ? <p style={{ color: COLORS.text3, fontSize: 13 }}>No sessions yet.</p>
                : logs.slice(0, 20).map(log => (
                  <div key={log.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 0", borderBottom: `1px solid ${COLORS.border}`,
                  }}>
                    <div>
                      <span style={{ color: COLORS.text1, fontSize: 13, fontWeight: 500 }}>{log.skill}</span>
                      <span style={{ color: COLORS.text3, fontSize: 12, marginLeft: 8 }}>{log.category}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: COLORS.accent, fontSize: 13 }}>{log.duration}m</span>
                      <span style={{ color: COLORS.text3, fontSize: 11, marginLeft: 10 }}>{fmt(log.date)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        )}

        {/* ═══ TAB: AI CHAT ═══ */}
        {activeTab === "chat" && (
          <div style={{ ...panelStyle, display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(99,179,237,0.1)", border: `1px solid ${COLORS.borderHi}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: COLORS.accent }}>◈</span>
              </div>
              <div>
                <div style={{ color: COLORS.text1, fontSize: 14, fontWeight: 600 }}>AXIS AI Coach</div>
                <div style={{ color: COLORS.text3, fontSize: 11 }}>Ask about your skills, get analysis, request a plan</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingRight: 4 }}>
              {chatMessages.length === 0 && (
                <div style={{ color: COLORS.text3, fontSize: 13, textAlign: "center", marginTop: 40 }}>
                  Start a conversation. Ask AXIS anything about your skill development.
                  <br /><br />
                  <span style={{ color: COLORS.text3, fontSize: 12 }}>
                    Try: "What should I focus on this week?" or "Analyze my progress" or "Give me a 30-day plan for Python"
                  </span>
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                  {m.role === "ai" && (
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: "rgba(99,179,237,0.1)", border: `1px solid ${COLORS.borderHi}`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: COLORS.accent,
                    }}>◈</div>
                  )}
                  <div style={{
                    maxWidth: "75%", padding: "11px 15px", borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                    background: m.role === "user" ? "rgba(99,179,237,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${m.role === "user" ? COLORS.borderHi : COLORS.border}`,
                    color: COLORS.text1, fontSize: 14, lineHeight: 1.65,
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {aiLoading && chatMessages.length > 0 && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(99,179,237,0.1)", border: `1px solid ${COLORS.borderHi}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: COLORS.accent }}>◈</div>
                  <span style={{ color: COLORS.text3, fontSize: 13 }}>Thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                placeholder="Ask AXIS anything about your skills..."
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 10,
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${COLORS.border}`,
                  color: COLORS.text1, fontSize: 14, outline: "none", fontFamily: "inherit",
                }}
              />
              <button onClick={sendChat} disabled={aiLoading || !chatInput.trim()} style={{
                padding: "12px 22px", borderRadius: 10,
                background: aiLoading || !chatInput.trim() ? "rgba(255,255,255,0.04)" : `linear-gradient(135deg, ${COLORS.accent}, #b794f4)`,
                border: "none", color: aiLoading ? COLORS.text3 : "#080b14",
                fontSize: 13, fontWeight: 600, cursor: aiLoading ? "default" : "pointer",
              }}>
                {aiLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("greeting"); // greeting | login | dashboard
  const [username, setUsername] = useState(null);

  const handleLogin = (u) => { setUsername(u); setScreen("dashboard"); };
  const handleLogout = () => { setUsername(null); setScreen("login"); };

  return (
    <div style={{ fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #080b14; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,179,237,0.2); border-radius: 2px; }
        input[type=range] { height: 4px; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>

      {screen === "greeting" && <GreetingScreen onDone={() => setScreen("login")} />}
      {screen === "login"    && <LoginScreen onLogin={handleLogin} />}
      {screen === "dashboard" && username && <Dashboard username={username} onLogout={handleLogout} />}
    </div>
  );
}
