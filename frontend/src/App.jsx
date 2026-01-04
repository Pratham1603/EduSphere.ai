import { useState } from "react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/orchestrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          user_role: "teacher",
        }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: "Backend not reachable" });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>EduSphere AI – Teacher Console</h1>

      <textarea
        rows="5"
        cols="60"
        placeholder="Enter your instruction here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <br /><br />

      <button onClick={sendPrompt} disabled={loading}>
        {loading ? "Processing..." : "Run AI"}
      </button>

      <br /><br />

      {response && (
        <pre style={{ background: "#f4f4f4", padding: "15px" }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
