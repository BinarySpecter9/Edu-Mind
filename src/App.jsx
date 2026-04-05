import { useState, useRef, useEffect } from "react";

const MODES = {
  chat:       { label: "Ask Anything",    icon: "✦",  color: "#10a37f", desc: "General learning & explanations" },
  notes:      { label: "Smart Notes",     icon: "◈",  color: "#10a37f", desc: "Structured summaries & outlines" },
  quiz:       { label: "Quiz Mode",       icon: "◎",  color: "#10a37f", desc: "Test your knowledge with MCQs" },
  exam:       { label: "Exam Prep",       icon: "◆",  color: "#10a37f", desc: "Strategic exam preparation" },
  assignment: { label: "Assignments",     icon: "◉",  color: "#10a37f", desc: "Guided assignment support" },
  pastpaper:  { label: "Past Papers",     icon: "▣",  color: "#10a37f", desc: "Realistic exam questions" },
  research:   { label: "Deep Research",   icon: "⬡",  color: "#10a37f", desc: "In-depth topic research" },
};

const SYSTEM_PROMPTS = {
  chat:       "You are EduMind, a brilliant and warm AI tutor. Help students at all levels with clear, engaging explanations. Use examples, analogies, and well-structured markdown — headers, bullets, bold key terms. Be concise but thorough.",
  notes:      "You are EduMind in Smart Notes mode. Generate beautifully structured notes: brief overview, key concepts as bullets, important definitions in bold, and a quick summary. Keep it scannable and exam-friendly.",
  quiz:       "You are EduMind in Quiz mode. Generate MCQs with A/B/C/D options. After the user answers, evaluate it, explain the correct answer clearly, give encouragement, then ask if they want to continue.",
  exam:       "You are EduMind in Exam Prep mode. Help students prepare strategically: identify key topics, provide formulas/dates/facts, share exam strategies, predict question types, offer mnemonics and memory techniques.",
  assignment: "You are EduMind in Assignment mode. Help students understand requirements, structure their work, develop arguments, and improve writing. Guide step-by-step — don't just do it for them.",
  pastpaper:  "You are EduMind in Past Paper mode. Generate realistic exam-style questions — MCQ, short answer, and essay. Provide detailed model answers and marking schemes.",
  research:   "You are EduMind in Deep Research mode. Provide thorough, well-structured research: executive summary, multi-perspective analysis, key findings, practical implications, and further reading. Be comprehensive.",
};

const STARTERS = [
  { icon: "◈", label: "Summarize a topic",   prompt: "Create concise smart notes on the causes of World War I" },
  { icon: "◎", label: "Quiz me",             prompt: "Quiz me on the human digestive system — 5 multiple choice questions" },
  { icon: "◆", label: "Prep for an exam",    prompt: "I have a Calculus exam tomorrow — give me the most important formulas and strategies" },
  { icon: "▣", label: "Past paper practice", prompt: "Generate past-paper style questions on Newton's Laws of Motion with model answers" },
  { icon: "⬡", label: "Research a topic",    prompt: "Do deep research on how climate change affects global food security" },
  { icon: "✦", label: "Explain a concept",   prompt: "Explain quantum entanglement in simple terms with analogies" },
];

function parseMarkdown(text) {
  return text
    .replace(/^### (.+)$/gm, '<h4 style="color:#10a37f;margin:14px 0 5px;font-size:13px;font-weight:600;letter-spacing:0.02em">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="color:#ececec;margin:16px 0 7px;font-size:15px;font-weight:600">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="color:#fff;margin:16px 0 8px;font-size:17px;font-weight:700">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#ececec;font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:#c5c5c5">$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#2a2a2a;padding:1px 7px;border-radius:5px;font-family:monospace;font-size:12px;color:#10a37f">$1</code>')
    .replace(/^[-•] (.+)$/gm, '<li style="margin:5px 0;padding-left:2px;color:#d1d5db">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin:5px 0;padding-left:2px;color:#d1d5db"><span style="color:#10a37f;font-weight:600;margin-right:4px">$1.</span>$2</li>')
    .replace(/(<li.*<\/li>\n?)+/gs, m => `<ul style="padding-left:16px;margin:8px 0;list-style:none">${m}</ul>`)
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function EduMind() {
  const [mode, setMode] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  const switchMode = (m) => { setMode(m); setMessages([]); setFiles([]); };
  const removeFile = (i) => setFiles(f => f.filter((_, idx) => idx !== i));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFiles(f => [...f, { name: file.name, content: ev.target.result, type: file.type }]);
    if (file.type.startsWith("image/")) reader.readAsDataURL(file);
    else reader.readAsText(file);
    e.target.value = "";
  };

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text && files.length === 0) return;

    let userContent = text;
    if (files.length > 0) {
      const ft = files.map(f => f.type.startsWith("image/") ? `[Image: ${f.name}]` : `\n--- File: ${f.name} ---\n${f.content}\n---`).join("\n");
      userContent = text ? `${text}\n${ft}` : ft;
    }

    const userMsg = { role: "user", text: text || files.map(f => f.name).join(", "), content: userContent };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    const history = newMessages.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content || m.text }));

    try {
      const useWeb = mode === "research";
      const body = {
      
        system: SYSTEM_PROMPTS[mode],
        messages: history,
      };
      if (useWeb) body.tools = [{ type: "web_search_20250305", name: "web_search" }];

      const resp = await fetch("git add .", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      const aiText = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n")
        || "I couldn't generate a response. Please try again.";
      setMessages(m => [...m, { role: "assistant", text: aiText, content: aiText, webSearched: useWeb }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "Something went wrong. Please check your connection and try again.", content: "" }]);
    }
    setLoading(false);
  };

  const modeInfo = MODES[mode];

  return (
    <div style={{ display:"flex", height:"100vh", background:"#212121", color:"#ececec", fontFamily:"-apple-system,'Söhne',ui-sans-serif,'Segoe UI',sans-serif", overflow:"hidden" }}>

      {/* SIDEBAR */}
      <div style={{
        width: sidebarOpen ? 260 : 0, minWidth: sidebarOpen ? 260 : 0,
        background:"#171717", display:"flex", flexDirection:"column",
        overflow:"hidden", transition:"all 0.25s cubic-bezier(.4,0,.2,1)",
        borderRight:"1px solid #2d2d2d"
      }}>
        {/* Logo */}
        <div style={{ padding:"16px 14px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:30, height:30, background:"#10a37f", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>✦</div>
            <span style={{ fontSize:16, fontWeight:600, letterSpacing:"-0.3px" }}>EduMind</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background:"none", border:"none", color:"#8e8ea0", cursor:"pointer", fontSize:18, padding:4, borderRadius:6, lineHeight:1 }}>‹</button>
        </div>

        {/* New Chat */}
        <div style={{ padding:"0 10px 8px" }}>
          <button onClick={() => { setMessages([]); setFiles([]); }} style={{
            width:"100%", padding:"8px 12px", borderRadius:8, background:"none",
            border:"1px solid #3d3d3d", color:"#ececec", fontFamily:"inherit",
            fontSize:13, textAlign:"left", cursor:"pointer", display:"flex", alignItems:"center", gap:8,
            transition:"background 0.15s"
          }}
            onMouseEnter={e => e.currentTarget.style.background="#2a2a2a"}
            onMouseLeave={e => e.currentTarget.style.background="none"}
          >
            <span style={{ fontSize:16 }}>+</span> New session
          </button>
        </div>

        {/* Modes */}
        <div style={{ padding:"6px 10px", flex:1, overflowY:"auto" }}>
          <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1.5, color:"#8e8ea0", marginBottom:6, paddingLeft:8 }}>Modes</div>
          {Object.entries(MODES).map(([key, m]) => (
            <button key={key} onClick={() => switchMode(key)} style={{
              width:"100%", padding:"8px 10px", borderRadius:8,
              background: mode===key ? "#2a2a2a" : "none",
              border:"none",
              color: mode===key ? "#ececec" : "#8e8ea0",
              fontFamily:"inherit", fontSize:13.5,
              textAlign:"left", cursor:"pointer", display:"flex", alignItems:"center", gap:10, marginBottom:1,
              transition:"all 0.15s"
            }}
              onMouseEnter={e => { if(mode!==key) e.currentTarget.style.background="#1e1e1e"; }}
              onMouseLeave={e => { if(mode!==key) e.currentTarget.style.background="none"; }}
            >
              <span style={{ color: mode===key ? "#10a37f" : "#8e8ea0", fontSize:14, width:18, textAlign:"center" }}>{m.icon}</span>
              <div style={{ lineHeight:1 }}>
                <div style={{ fontSize:13 }}>{m.label}</div>
                {mode===key && <div style={{ fontSize:10, color:"#8e8ea0", marginTop:2 }}>{m.desc}</div>}
              </div>
            </button>
          ))}
        </div>

        <div style={{ padding:"10px 12px 14px", borderTop:"1px solid #2d2d2d" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px", borderRadius:8 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"#10a37f", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>S</div>
            <div>
              <div style={{ fontSize:12.5, fontWeight:500 }}>Student</div>
              <div style={{ fontSize:10, color:"#8e8ea0" }}>Free Plan</div>
            </div>
            <div style={{ marginLeft:"auto", fontSize:10, color:"#10a37f", background:"rgba(16,163,127,0.1)", padding:"2px 7px", borderRadius:10, border:"1px solid rgba(16,163,127,0.2)", whiteSpace:"nowrap" }}>Upgrade</div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>

        {/* Collapsed sidebar toggle */}
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} style={{
            position:"absolute", top:14, left:14, zIndex:10,
            background:"#2a2a2a", border:"1px solid #3d3d3d", color:"#ececec",
            borderRadius:8, cursor:"pointer", fontSize:18, padding:"4px 10px", lineHeight:1
          }}>›</button>
        )}

        {/* Chat area */}
        <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"0 0 20px" }}>
          {messages.length === 0 ? (
            <div style={{ maxWidth:680, margin:"0 auto", padding:"60px 24px 24px", animation:"fadeUp 0.4s ease" }}>
              <div style={{ textAlign:"center", marginBottom:40 }}>
                <div style={{ width:52, height:52, background:"#10a37f", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 18px" }}>✦</div>
                <h1 style={{ fontSize:26, fontWeight:600, margin:"0 0 8px", letterSpacing:"-0.5px" }}>How can I help you learn today?</h1>
                <p style={{ color:"#8e8ea0", fontSize:14, margin:0 }}>
                  {modeInfo.icon} {modeInfo.label} — {modeInfo.desc}
                </p>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {STARTERS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s.prompt)} style={{
                    background:"#2a2a2a", border:"1px solid #3d3d3d", borderRadius:12,
                    padding:"14px 16px", cursor:"pointer", textAlign:"left",
                    fontFamily:"inherit", color:"#ececec", transition:"all 0.15s"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background="#333"; e.currentTarget.style.borderColor="#555"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="#2a2a2a"; e.currentTarget.style.borderColor="#3d3d3d"; }}
                  >
                    <div style={{ color:"#10a37f", fontSize:14, marginBottom:6 }}>{s.icon}</div>
                    <div style={{ fontSize:12.5, fontWeight:500, marginBottom:3, color:"#ececec" }}>{s.label}</div>
                    <div style={{ fontSize:11.5, color:"#8e8ea0", lineHeight:1.4 }}>{s.prompt.slice(0,55)}…</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth:740, margin:"0 auto", padding:"24px 24px 0" }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom:24, display:"flex", gap:14, alignItems:"flex-start", animation:"fadeUp 0.25s ease" }}>
                  {msg.role === "user" ? (
                    <>
                      <div style={{ flex:1 }} />
                      <div style={{ maxWidth:"80%", padding:"12px 16px", borderRadius:18, borderBottomRightRadius:4, background:"#2f2f2f", fontSize:14, lineHeight:1.65, color:"#ececec", whiteSpace:"pre-wrap" }}>{msg.text}</div>
                      <div style={{ width:30, height:30, borderRadius:"50%", background:"#10a37f", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0, marginTop:2 }}>S</div>
                    </>
                  ) : (
                    <>
                      <div style={{ width:30, height:30, borderRadius:"50%", background:"#10a37f", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0, marginTop:2 }}>✦</div>
                      <div style={{ flex:1, fontSize:14, lineHeight:1.75, color:"#d1d5db" }}>
                        {msg.webSearched && (
                          <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"2px 9px", borderRadius:20, fontSize:10.5, background:"rgba(16,163,127,0.1)", color:"#10a37f", border:"1px solid rgba(16,163,127,0.2)", marginBottom:10 }}>
                            <span style={{ width:5, height:5, background:"#10a37f", borderRadius:"50%", display:"inline-block" }} /> Searched the web
                          </div>
                        )}
                        <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} />
                      </div>
                    </>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:24 }}>
                  <div style={{ width:30, height:30, borderRadius:"50%", background:"#10a37f", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>✦</div>
                  <div style={{ paddingTop:8, display:"flex", gap:4 }}>
                    {[0,1,2].map(j => (
                      <div key={j} style={{ width:6, height:6, background:"#8e8ea0", borderRadius:"50%", animation:`pulse 1.2s ${j*0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={{ padding:"0 24px 24px", maxWidth:740, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>
          {files.length > 0 && (
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
              {files.map((f, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:8, background:"#2a2a2a", border:"1px solid #3d3d3d", fontSize:12, color:"#ececec" }}>
                  📎 {f.name}
                  <button onClick={() => removeFile(i)} style={{ background:"none", border:"none", color:"#8e8ea0", cursor:"pointer", fontSize:15, lineHeight:1, padding:0 }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ background:"#2f2f2f", border:"1px solid #3d3d3d", borderRadius:16, padding:"10px 14px", display:"flex", gap:8, alignItems:"flex-end", boxShadow:"0 4px 24px rgba(0,0,0,0.3)" }}>
            <button onClick={() => fileInputRef.current?.click()} style={{
              width:32, height:32, borderRadius:8, background:"none", border:"none",
              color:"#8e8ea0", fontSize:18, cursor:"pointer", flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"color 0.15s"
            }}
              onMouseEnter={e => e.currentTarget.style.color="#ececec"}
              onMouseLeave={e => e.currentTarget.style.color="#8e8ea0"}
              title="Attach file"
            >⊕</button>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg" onChange={handleFile} style={{ display:"none" }} />

            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,140)+"px"; }}
              onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendMessage(); }}}
              placeholder={
                mode==="notes" ? "Enter a topic for smart notes..." :
                mode==="quiz" ? "Enter a topic to be quizzed on..." :
                mode==="exam" ? "Enter your subject for exam prep..." :
                mode==="assignment" ? "Describe your assignment..." :
                mode==="pastpaper" ? "Enter subject for past paper questions..." :
                mode==="research" ? "Enter a topic for deep research..." :
                "Message EduMind..."
              }
              rows={1}
              style={{
                flex:1, background:"none", border:"none", outline:"none",
                color:"#ececec", fontFamily:"inherit", fontSize:14.5,
                resize:"none", maxHeight:140, lineHeight:1.6, padding:"4px 0",
              }}
            />

            <button
              onClick={() => sendMessage()}
              disabled={loading || (!input.trim() && files.length===0)}
              style={{
                width:32, height:32, borderRadius:8, border:"none", cursor:"pointer",
                background: (loading||(!input.trim()&&files.length===0)) ? "#3d3d3d" : "#10a37f",
                color: (loading||(!input.trim()&&files.length===0)) ? "#8e8ea0" : "#fff",
                fontSize:16, display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0, transition:"all 0.15s"
              }}
            >↑</button>
          </div>
          <div style={{ textAlign:"center", fontSize:11, color:"#6e6e80", marginTop:8 }}>
            EduMind can make mistakes. Verify important information.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,60%,100%{opacity:0.3;transform:scale(1)} 30%{opacity:1;transform:scale(1.3)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#3d3d3d;border-radius:10px}
        textarea::placeholder{color:#8e8ea0}
      `}</style>
    </div>
  );
}