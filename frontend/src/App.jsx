import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const FILES = ["README.md", "requirements.txt", "documentation.md", ".gitignore"];

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState({});
  const [documentation, setDocumentation] = useState("");
  const [theme, setTheme] = useState("light");

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResults({});
    setDocumentation("");
    try {
      const res = await axios.post("http://localhost:8000/analyze", { github_url: url });
      setResults({
        "README.md": res.data.readme,
        "requirements.txt": res.data.requirements,
        "documentation.md": res.data.documentation,
        ".gitignore": res.data.gitignore,
      });
      setDocumentation(res.data.documentation || "");
    } catch (e) {
      setError(e.response?.data?.detail || "Error analyzing repo");
    }
    setLoading(false);
  };

  const handleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"} transition-colors`}>
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">AutoRepo Insight</h1>
          <button onClick={handleTheme} className="px-3 py-1 rounded border">
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
        </div>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            className="flex-1 px-3 py-2 border rounded"
            placeholder="Paste GitHub repo URL..."
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <button
            onClick={handleAnalyze}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading || !url}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="space-y-4">
          {FILES.map(file => (
            <div key={file} className="border rounded p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{file}</span>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    const blob = new Blob([results[file] || ""], { type: "text/plain" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = file;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  disabled={!results[file]}
                >
                  Download
                </button>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm max-h-64">
                {results[file] || <span className="text-gray-400">No data</span>}
              </pre>
            </div>
          ))}
        </div>
        {/* Documentation Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">📚 Documentation</h2>
          <div className="border rounded bg-gray-50 dark:bg-gray-800 p-4 max-h-96 overflow-auto">
            {documentation ? (
              <ReactMarkdown className="prose dark:prose-invert max-w-none">{documentation}</ReactMarkdown>
            ) : (
              <span className="text-gray-400">No documentation available.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 