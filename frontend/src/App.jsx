import React, { useState, useEffect } from "react";
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
        className="absolute top-4 right-4 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
      >
        ⬇️ Download
      </button>
    );

    const CardContainer = ({ children }) => (
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-gray-700/10 rounded-3xl pointer-events-none"></div>
        {downloadButton}
        {children}
      </div>
    );

    switch (activeTab) {
      case "readme":
        return (
          <CardContainer>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">📄 README.md</h2>
            <div 
              className="overflow-y-auto max-h-[60vh] pr-4 tab-content-scroll" 
              style={{ 
                overflowY: 'auto', 
                maxHeight: '60vh',
                minHeight: '200px',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                borderRadius: '8px',
                padding: '16px'
              }}
            >
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
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">📦 requirements.txt</h2>
            <div className="overflow-y-auto max-h-[60vh] pr-4 tab-content-scroll" style={{ overflowY: 'auto', maxHeight: '60vh' }}>
              <pre className="bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl overflow-x-auto text-sm border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
                {content || <span className="text-gray-400">No requirements.txt available.</span>}
              </pre>
            </div>
          </CardContainer>
        );
      case "documentation":
        return (
          <CardContainer>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">📚 Documentation.md</h2>
            <div className="overflow-y-auto max-h-[60vh] pr-4 tab-content-scroll" style={{ overflowY: 'auto', maxHeight: '60vh' }}>
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
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">🛡️ .gitignore</h2>
            <div className="overflow-y-auto max-h-[60vh] pr-4 tab-content-scroll" style={{ overflowY: 'auto', maxHeight: '60vh' }}>
              <pre className="bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl overflow-x-auto text-sm border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
                {content || <span className="text-gray-400">No .gitignore available.</span>}
              </pre>
            </div>
          </CardContainer>
        );
      case "gptsummary":
        return (
          <CardContainer>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">🤖 GPT Summary (coming soon)</h2>
            <div className="overflow-y-auto max-h-[60vh] pr-4 tab-content-scroll" style={{ overflowY: 'auto', maxHeight: '60vh' }}>
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
    <div className={`min-h-screen ${theme === "dark" ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"} transition-all duration-700 flex flex-col`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs with different animation patterns */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Additional moving elements with custom animations */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-green-400/15 to-blue-500/15 rounded-full blur-2xl animate-float delay-700"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-red-500/20 rounded-full blur-2xl animate-float-slow delay-300"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-br from-purple-400/25 to-pink-500/25 rounded-full blur-xl animate-drift delay-1000"></div>
        
        {/* Floating particles with custom floating animation */}
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-400/40 rounded-full animate-float delay-200"></div>
        <div className="absolute top-3/4 right-1/3 w-2 h-2 bg-purple-400/40 rounded-full animate-float-slow delay-500"></div>
        <div className="absolute top-1/2 left-1/4 w-2.5 h-2.5 bg-pink-400/40 rounded-full animate-drift delay-800"></div>
        <div className="absolute bottom-1/4 right-1/4 w-3.5 h-3.5 bg-indigo-400/40 rounded-full animate-float delay-400"></div>
        
        {/* Moving gradient lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-purple-400/30 to-transparent animate-pulse delay-500"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-1/6 right-1/6 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-lg blur-lg animate-float-slow delay-1000"></div>
        <div className="absolute bottom-1/6 left-1/6 w-12 h-12 bg-gradient-to-br from-orange-400/25 to-red-500/25 rounded-full blur-lg animate-drift delay-500"></div>
        
        {/* Wavy lines */}
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/20 to-transparent animate-pulse delay-300"></div>
        <div className="absolute bottom-1/3 right-0 w-full h-px bg-gradient-to-l from-transparent via-purple-400/20 to-transparent animate-pulse delay-700"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/5 left-1/5 w-8 h-8 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-full blur-md animate-glow delay-600"></div>
        <div className="absolute bottom-1/5 right-1/5 w-6 h-6 bg-gradient-to-br from-rose-400/35 to-pink-500/35 rounded-full blur-md animate-glow delay-900"></div>
      </div>

      {/* Header */}
      <header className="flex-shrink-0 relative z-10">
        <div className="max-w-5xl mx-auto py-12 px-4">
          <div className="text-center mb-12">
            <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-2xl">
                AutoRepo Insight
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                📊 AI-powered GitHub repo analyzer — Generate README, requirements, docs & more in seconds.
              </p>
            </div>
            <div className={`transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <button 
                onClick={handleTheme} 
                className="mt-8 px-6 py-3 rounded-2xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl shadow-xl"
              >
                <span className="text-2xl">{theme === "dark" ? "🌙" : "☀️"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-5xl mx-auto px-4 pb-12">
          {/* Input Section */}
          <div className={`mb-12 transition-all duration-1000 delay-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-3xl p-8 border border-white/30 dark:border-gray-700/30 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                  type="text"
                  className="flex-1 px-6 py-4 border border-white/30 dark:border-gray-600/30 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-500/30 focus:border-transparent transition-all duration-300 transform focus:scale-[1.02]"
                  placeholder="Paste GitHub repo URL..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  disabled={loading}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !url}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl font-semibold text-lg min-w-[140px] md:min-w-[160px] flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    "🚀 Analyze"
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
                Supports public GitHub URLs like https://github.com/user/repo
              </p>
            </div>
          </div>
          
          {/* Toast Notifications */}
          {error && (
            <div className="mb-8 p-6 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-xl text-red-800 dark:text-red-200 rounded-2xl border border-red-200/50 dark:border-red-800/50 flex items-center gap-3 shadow-xl animate-in slide-in-from-top-2">
              <span className="text-2xl">❌</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-8 p-6 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-xl text-green-800 dark:text-green-200 rounded-2xl border border-green-200/50 dark:border-green-800/50 flex items-center gap-3 shadow-xl animate-in slide-in-from-top-2">
              <span className="text-2xl">✅</span>
              <span>{success}</span>
            </div>
          )}
          {downloadFeedback && (
            <div className="mb-8 p-4 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-xl text-green-800 dark:text-green-200 rounded-2xl text-center border border-green-200/50 dark:border-green-800/50 shadow-xl animate-in slide-in-from-top-2">
              {downloadFeedback}
            </div>
          )}
          
          {/* Tabbed Output */}
          <div className={`transition-all duration-1000 delay-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="mt-12">
              <Tabs.List className="flex border-b border-white/20 dark:border-gray-700/30 mb-8 overflow-x-auto bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-2">
                {TABS.map(tab => (
                  <Tabs.Trigger
                    key={tab.key}
                    value={tab.key}
                    className={`px-6 py-4 -mb-px border-b-2 font-medium cursor-pointer transition-all duration-300 rounded-2xl whitespace-nowrap flex-shrink-0 transform hover:scale-105
                      ${activeTab === tab.key
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg'
                        : 'border-transparent text-gray-500 hover:text-blue-600 hover:bg-white/30 dark:hover:bg-gray-800/30'}
                    `}
                  >
                    {tab.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              <div className="min-h-[500px]">
                {renderTabContent()}
              </div>
            </Tabs.Root>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 relative z-10 py-8 border-t border-white/20 dark:border-gray-700/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              © 2025 AutoRepo Insight · Built by Amit Anand
            </p>
            <div className="flex justify-center items-center gap-6">
              <a 
                href="https://github.com/Amitanand983" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-300 transform hover:scale-125"
              >
                <span className="text-2xl">🐙</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/amit-anand-0015b2145/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-300 transform hover:scale-125"
              >
                <span className="text-2xl">💼</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 