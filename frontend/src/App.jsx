import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as Tabs from "@radix-ui/react-tabs";

const TABS = [
  { key: "readme", label: "📄 README.md", filename: "README.md" },
  { key: "requirements", label: "📦 requirements.txt", filename: "requirements.txt" },
  { key: "documentation", label: "📚 Documentation.md", filename: "documentation.md" },
  { key: "gitignore", label: "🛡️ .gitignore", filename: ".gitignore" },
  { key: "gptsummary", label: "🤖 GPT Summary (coming soon)", filename: "gpt-summary.md" },
];

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [results, setResults] = useState({});
  const [activeTab, setActiveTab] = useState("readme");
  const [theme, setTheme] = useState("light");
  const [downloadFeedback, setDownloadFeedback] = useState("");

  const showToast = (message, type = "success") => {
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setResults({});
    try {
      const res = await axios.post("http://localhost:8000/analyze", { github_url: url });
      setResults({
        readme: res.data.readme,
        requirements: res.data.requirements,
        documentation: res.data.documentation,
        gitignore: res.data.gitignore,
        gptsummary: res.data.gptsummary || "(Coming soon)"
      });
      showToast("✅ Repo analyzed successfully!");
    } catch (e) {
      const errorMessage = e.response?.data?.detail || 
                          e.message || 
                          "❌ Analysis failed. Please check the repo URL or try again later.";
      showToast(errorMessage, "error");
    }
    setLoading(false);
  };

  const handleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    document.documentElement.classList.toggle("dark");
  };

  const handleDownload = (content, filename) => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    // Show feedback
    setDownloadFeedback(`✅ Downloaded ${filename}!`);
    setTimeout(() => setDownloadFeedback(""), 2000);
  };

  const renderTabContent = () => {
    const currentTab = TABS.find(tab => tab.key === activeTab);
    const content = results[activeTab];
    
    const downloadButton = (
      <button
        onClick={() => handleDownload(content, currentTab.filename)}
        disabled={!content}
        className="absolute top-4 right-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        ⬇️ Download
      </button>
    );

    const CardContainer = ({ children }) => (
      <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
        {downloadButton}
        {children}
      </div>
    );

    switch (activeTab) {
      case "readme":
        return (
          <CardContainer>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📄 README.md</h2>
            <div className="overflow-auto max-h-[80vh]">
              {content ? (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
              ) : (
                <span className="text-gray-400">No README available.</span>
              )}
            </div>
          </CardContainer>
        );
      case "requirements":
        return (
          <CardContainer>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📦 requirements.txt</h2>
            <div className="overflow-auto max-h-[80vh]">
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm border">
                {content || <span className="text-gray-400">No requirements.txt available.</span>}
              </pre>
            </div>
          </CardContainer>
        );
      case "documentation":
        return (
          <CardContainer>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📚 Documentation.md</h2>
            <div className="overflow-auto max-h-[80vh]">
              {content ? (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
              ) : (
                <span className="text-gray-400">No documentation available.</span>
              )}
            </div>
          </CardContainer>
        );
      case "gitignore":
        return (
          <CardContainer>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🛡️ .gitignore</h2>
            <div className="overflow-auto max-h-[80vh]">
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm border">
                {content || <span className="text-gray-400">No .gitignore available.</span>}
              </pre>
            </div>
          </CardContainer>
        );
      case "gptsummary":
        return (
          <CardContainer>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🤖 GPT Summary (coming soon)</h2>
            <div className="overflow-auto max-h-[80vh]">
              {content ? (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
              ) : (
                <span className="text-gray-400">No GPT summary available.</span>
              )}
            </div>
          </CardContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-50 dark:bg-gray-900" : "bg-gray-50"} transition-colors flex flex-col`}>
      {/* Header */}
      <header className="flex-shrink-0">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                AutoRepo Insight
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                📊 AI-powered GitHub repo analyzer — Generate README, requirements, docs & more in seconds.
              </p>
            </div>
            <button 
              onClick={handleTheme} 
              className="ml-4 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 pb-8">
          {/* Input Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-3 mb-2">
              <input
                type="text"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste GitHub repo URL..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                disabled={loading}
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !url}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium min-w-[120px] md:min-w-[140px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
              Supports public GitHub URLs like https://github.com/user/repo
            </p>
          </div>
          
          {/* Toast Notifications */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-2">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}
          {downloadFeedback && (
            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-center border border-green-200 dark:border-green-800">
              {downloadFeedback}
            </div>
          )}
          
          {/* Tabbed Output */}
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
              {TABS.map(tab => (
                <Tabs.Trigger
                  key={tab.key}
                  value={tab.key}
                  className={`px-4 md:px-6 py-3 -mb-px border-b-2 font-medium cursor-pointer transition-colors rounded-t-lg whitespace-nowrap flex-shrink-0
                    ${activeTab === tab.key
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                      : 'border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'}
                  `}
                >
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <div className="min-h-[400px]">
              {renderTabContent()}
            </div>
          </Tabs.Root>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              © 2025 AutoRepo Insight · Built by Amit Anand
            </p>
            <div className="flex justify-center items-center gap-4">
              <a 
                href="https://github.com/Amitanand983" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <span className="text-lg">🐙</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/amit-anand-0015b2145/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <span className="text-lg">💼</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 