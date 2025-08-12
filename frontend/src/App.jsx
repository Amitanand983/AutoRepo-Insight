import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as Tabs from "@radix-ui/react-tabs";
import rehypeRaw from 'rehype-raw';

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
        className="absolute top-4 right-4 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md backdrop-blur-sm border border-white/20"
      >
        ⬇️ Download
      </button>
    );

    const CardContainer = ({ children }) => (
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.01]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-700/20 rounded-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-3xl pointer-events-none"></div>
        {downloadButton}
        {children}
      </div>
    );

    switch (activeTab) {
      case "readme":
        return (
          <CardContainer>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                📄 README.md
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Professional documentation generated for your repository
              </p>
            </div>
            
            {content ? (
              <div className="readme-enhanced prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-16 prose-h1:text-3xl prose-h1:font-bold prose-h1:text-gray-900 prose-h1:dark:text-white prose-h1:border-b prose-h1:border-gray-200 prose-h1:dark:border-gray-700 prose-h1:pb-2 prose-h1:mb-4 prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-gray-800 prose-h2:dark:text-gray-200 prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:font-medium prose-h3:text-gray-700 prose-h3:dark:text-gray-300 prose-h3:mt-4 prose-h3:mb-2 prose-p:text-gray-600 prose-p:dark:text-gray-400 prose-p:leading-relaxed prose-p:mb-3 prose-strong:text-gray-900 prose-strong:dark:text-white prose-strong:font-semibold prose-code:bg-gray-100 prose-code:dark:bg-gray-800 prose-code:text-gray-800 prose-code:dark:text-gray-200 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:dark:bg-gray-950 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:dark:text-gray-400 prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:text-gray-600 prose-li:dark:text-gray-400 prose-li:mb-1 prose-hr:border-gray-300 prose-hr:dark:border-gray-600 prose-hr:my-6 prose-table:border-collapse prose-table:w-full prose-table:border prose-table:border-gray-300 prose-table:dark:border-gray-600 prose-th:bg-gray-100 prose-th:dark:bg-gray-800 prose-th:text-gray-900 prose-th:dark:text-white prose-th:font-semibold prose-th:p-3 prose-th:border prose-th:border-gray-300 prose-th:dark:border-gray-600 prose-td:p-3 prose-td:border prose-td:border-gray-300 prose-td:dark:border-gray-600 prose-td:text-gray-600 prose-td:dark:text-gray-400 prose-a:text-blue-600 prose-a:dark:text-blue-400 prose-a:no-underline prose-a:hover:underline prose-img:rounded-lg prose-img:shadow-md">
                {(() => {
                  const hasFolderStructure = content.includes('├──') && content.includes('└──');
                  
                  if (hasFolderStructure) {
                    const lines = content.split('\n');
                    const folderLines = [];
                    let inFolderSection = false;
                    let folderStartIndex = -1;
                    
                    for (let i = 0; i < lines.length; i++) {
                      const line = lines[i];
                      if (line.includes('├──') || line.includes('└──') || line.includes('│')) {
                        if (!inFolderSection) {
                          inFolderSection = true;
                          folderStartIndex = i;
                        }
                        folderLines.push(line);
                      } else if (inFolderSection && line.trim() === '') {
                        break;
                      } else if (inFolderSection && !line.includes('│') && !line.includes('├──') && !line.includes('└──')) {
                        if (line.trim() !== '' && !line.startsWith('#')) {
                          break;
                        }
                        folderLines.push(line);
                      }
                    }
                    
                    if (folderLines.length > 0) {
                      const folderTree = folderLines.join('\n');
                      const beforeFolder = lines.slice(0, folderStartIndex).join('\n');
                      const afterFolder = lines.slice(folderStartIndex + folderLines.length).join('\n');
                      
                      return (
                        <>
                          {beforeFolder && (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                              {beforeFolder}
                            </ReactMarkdown>
                          )}
                          
                          <div className="my-8">
                            <div className="mb-6">
                              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                <span className="text-2xl">📁</span>
                                Project Structure
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                Visual representation of your repository's file and folder organization
                              </p>
                            </div>
                            
                            <div className="traditional-tree">
                              <pre className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 backdrop-blur-sm p-6 rounded-2xl overflow-x-auto text-sm border border-gray-200/50 dark:border-gray-700/50 shadow-inner font-mono">
                                {folderTree}
                              </pre>
                            </div>
                          </div>
                          
                          {afterFolder && (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                              {afterFolder}
                            </ReactMarkdown>
                          )}
                        </>
                      );
                    }
                  }
                  
                  return (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      rehypePlugins={[rehypeRaw]}
                    >
                      {content}
                    </ReactMarkdown>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No README Content
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Analyze a repository to generate README documentation
                </p>
              </div>
            )}
          </CardContainer>
        );
      case "requirements":
        return (
          <CardContainer>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                📦 Requirements.txt
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Python dependencies and package requirements
              </p>
            </div>
            
            {content ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <span className="text-xl">🔍</span>
                    Dependency Analysis
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/60 dark:bg-blue-800/40 rounded-xl p-3 text-center">
                      <div className="text-blue-600 dark:text-blue-300 font-semibold">
                        {(() => {
                          const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
                          return lines.length;
                        })()}
                      </div>
                      <div className="text-blue-700 dark:text-blue-400 text-xs">Total Packages</div>
                    </div>
                    <div className="bg-white/60 dark:bg-blue-800/40 rounded-xl p-3 text-center">
                      <div className="text-blue-600 dark:text-blue-300 font-semibold">
                        {(() => {
                          const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
                          const hasVersions = lines.some(line => line.includes('==') || line.includes('>=') || line.includes('<='));
                          return hasVersions ? 'With Versions' : 'No Versions';
                        })()}
                      </div>
                      <div className="text-blue-700 dark:text-blue-400 text-xs">Version Info</div>
                    </div>
                    <div className="bg-white/60 dark:bg-blue-800/40 rounded-xl p-3 text-center">
                      <div className="text-blue-600 dark:text-blue-300 font-semibold">
                        {(() => {
                          const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
                          const devDeps = lines.filter(line => line.includes('dev') || line.includes('test') || line.includes('lint'));
                          return devDeps.length > 0 ? 'Yes' : 'No';
                        })()}
                      </div>
                      <div className="text-blue-700 dark:text-blue-400 text-xs">Dev Dependencies</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    Package List
                  </h3>
                  <pre className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl overflow-x-auto text-sm border border-gray-200/50 dark:border-gray-600/50 font-mono">
                    {content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Requirements Found
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Analyze a repository to discover Python dependencies
                </p>
              </div>
            )}
          </CardContainer>
        );
      case "documentation":
        return (
          <CardContainer>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                📚 Documentation
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Auto-generated code documentation and API references
              </p>
            </div>
            
            {content ? (
              <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-16 prose-h1:text-2xl prose-h1:font-bold prose-h1:text-gray-900 prose-h1:dark:text-white prose-h1:border-b prose-h1:border-gray-200 prose-h1:dark:border-gray-700 prose-h1:pb-2 prose-h1:mb-4 prose-h2:text-xl prose-h2:font-semibold prose-h2:text-gray-800 prose-h2:dark:text-gray-200 prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:font-medium prose-h3:text-gray-700 prose-h3:dark:text-gray-300 prose-h3:mt-4 prose-h3:mb-2 prose-p:text-gray-600 prose-p:dark:text-gray-400 prose-p:leading-relaxed prose-p:mb-3 prose-strong:text-gray-900 prose-strong:dark:text-white prose-strong:font-semibold prose-code:bg-gray-100 prose-code:dark:bg-gray-800 prose-code:text-gray-800 prose-code:dark:text-gray-200 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:dark:bg-gray-950 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:dark:text-gray-400 prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:text-gray-600 prose-li:dark:text-gray-400 prose-li:mb-1 prose-hr:border-gray-300 prose-hr:dark:border-gray-600 prose-hr:my-6 prose-table:border-collapse prose-table:w-full prose-table:border prose-table:border-gray-300 prose-table:dark:border-gray-600 prose-th:bg-gray-100 prose-th:dark:bg-gray-800 prose-th:text-gray-900 prose-th:dark:text-white prose-th:font-semibold prose-th:p-3 prose-th:border prose-th:border-gray-300 prose-th:dark:border-gray-600 prose-td:p-3 prose-td:border prose-td:border-gray-300 prose-td:dark:border-gray-600 prose-td:text-gray-600 prose-td:dark:text-gray-400 prose-a:text-blue-600 prose-a:dark:text-blue-400 prose-a:no-underline prose-a:hover:underline prose-img:rounded-lg prose-img:shadow-md">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Documentation Available
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Analyze a repository to generate code documentation
                </p>
              </div>
            )}
          </CardContainer>
        );
      case "gitignore":
        return (
          <CardContainer>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                🛡️ .gitignore
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Recommended files and directories to exclude from version control
              </p>
            </div>
            
            {content ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    Gitignore Analysis
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/60 dark:bg-green-800/40 rounded-xl p-3 text-center">
                      <div className="text-green-600 dark:text-green-300 font-semibold">
                        {(() => {
                          const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
                          return lines.length;
                        })()}
                      </div>
                      <div className="text-green-700 dark:text-green-400 text-xs">Ignore Patterns</div>
                    </div>
                    <div className="bg-white/60 dark:bg-green-800/40 rounded-xl p-3 text-center">
                      <div className="text-green-600 dark:text-green-300 font-semibold">
                        {(() => {
                          const patterns = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
                          const hasComments = content.split('\n').some(line => line.trim().startsWith('#'));
                          return hasComments ? 'Yes' : 'No';
                        })()}
                      </div>
                      <div className="text-green-700 dark:text-green-400 text-xs">Has Comments</div>
                    </div>
                    <div className="bg-white/60 dark:bg-green-800/40 rounded-xl p-3 text-center">
                      <div className="text-green-600 dark:text-green-300 font-semibold">
                        {(() => {
                          const patterns = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
                          const hasWildcards = patterns.some(line => line.includes('*') || line.includes('?'));
                          return hasWildcards ? 'Yes' : 'No';
                        })()}
                      </div>
                      <div className="text-green-700 dark:text-green-400 text-xs">Wildcards</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    Ignore Patterns
                  </h3>
                  <pre className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl overflow-x-auto text-sm border border-gray-200/50 dark:border-gray-600/50 font-mono">
                    {content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Gitignore Available
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Analyze a repository to generate .gitignore recommendations
                </p>
              </div>
            )}
          </CardContainer>
        );
      case "gptsummary":
        return (
          <CardContainer>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                🤖 GPT Summary
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered repository analysis and insights
              </p>
            </div>
            
            {content ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    AI Analysis
                  </h3>
                  <p className="text-purple-700 dark:text-purple-300 text-sm">
                    This summary provides intelligent insights about your repository's architecture, 
                    code quality, and potential improvements.
                  </p>
                </div>
                
                <div className="bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    Summary Content
                  </h3>
                  <div className="prose prose-gray dark:prose-invert max-w-none prose-p:text-gray-600 prose-p:dark:text-gray-400 prose-p:leading-relaxed prose-p:mb-3 prose-strong:text-gray-900 prose-strong:dark:text-white prose-strong:font-semibold prose-ul:list-disc prose-ul:pl-6 prose-li:text-gray-600 prose-li:dark:text-gray-400 prose-li:mb-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No GPT Summary Available
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Analyze a repository to generate AI-powered insights
                </p>
              </div>
            )}
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
      <header className="relative z-20 py-8 border-b border-white/20 dark:border-gray-700/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">🚀</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AutoRepo Insight
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Intelligent GitHub Repository Analysis
                </p>
              </div>
            </div>
            <button
              onClick={handleTheme}
              className="p-3 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-300 transform hover:scale-105"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Enhanced Hero Section */}
          <div className="text-center mb-16">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Analyze Any GitHub Repository
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  in Seconds
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Get instant insights into project structure, dependencies, documentation, and more. 
                Perfect for developers, maintainers, and contributors.
              </p>
              
              {/* Enhanced Input Section */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Enter GitHub repository URL (e.g., https://github.com/user/repo)"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      disabled={loading}
                      className="enhanced-input w-full px-6 py-4 text-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !url}
                    className="enhanced-button px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl font-semibold min-w-[160px] flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Analyzing...
                      </>
                    ) : (
                      "🚀 Analyze Repository"
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                  Supports public GitHub URLs • Free to use • No authentication required
                </p>
              </div>
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
          
          {/* Repo Stats Cards */}
          {Object.keys(results).length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                📊 Repository Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Files */}
                <div 
                  className="stats-card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                  onClick={() => {
                    const count = (() => {
                      const readmeContent = results.readme || '';
                      const lines = readmeContent.split('\n');
                      let fileCount = 0;
                      lines.forEach(line => {
                        if (line.includes('├──') || line.includes('└──')) {
                          fileCount++;
                        }
                      });
                      return fileCount;
                    })();
                    showToast(`📁 Repository contains ${count} files and directories`, 'success');
                  }}
                >
                  <div className="text-2xl mb-2">📁</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {(() => {
                      const readmeContent = results.readme || '';
                      const lines = readmeContent.split('\n');
                      let fileCount = 0;
                      lines.forEach(line => {
                        if (line.includes('├──') || line.includes('└──')) {
                          fileCount++;
                        }
                      });
                      return fileCount;
                    })()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Files</div>
                </div>
                
                {/* Languages */}
                <div className="stats-card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
                  <div className="text-2xl mb-2">🐍</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {(() => {
                      const readmeContent = results.readme || '';
                      const languages = new Set();
                      if (readmeContent.includes('.py')) languages.add('Python');
                      if (readmeContent.includes('.js')) languages.add('JavaScript');
                      if (readmeContent.includes('.ts')) languages.add('TypeScript');
                      if (readmeContent.includes('.java')) languages.add('Java');
                      if (readmeContent.includes('.cpp')) languages.add('C++');
                      if (readmeContent.includes('.go')) languages.add('Go');
                      if (readmeContent.includes('.rs')) languages.add('Rust');
                      return languages.size || 'Unknown';
                    })()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Languages</div>
                </div>
                
                {/* Dependencies */}
                <div className="stats-card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
                  <div className="text-2xl mb-2">📦</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {(() => {
                      const requirements = results.requirements || '';
                      if (!requirements || requirements.includes('No requirements')) return 0;
                      const lines = requirements.split('\n').filter(line => line.trim() && !line.startsWith('#'));
                      return lines.length;
                    })()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Dependencies</div>
                </div>
                
                {/* Documentation */}
                <div className="stats-card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
                  <div className="text-2xl mb-2">📚</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {(() => {
                      let docCount = 0;
                      if (results.readme) docCount++;
                      if (results.documentation) docCount++;
                      if (results.gitignore) docCount++;
                      return docCount;
                    })()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Documents</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tabbed Output */}
          <div className={`transition-all duration-1000 delay-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="mt-12">
              <Tabs.List className="flex border-b border-white/20 dark:border-gray-700/30 mb-8 overflow-x-auto bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-2 shadow-lg">
                {TABS.map(tab => (
                  <Tabs.Trigger
                    key={tab.key}
                    value={tab.key}
                    className={`px-6 py-4 -mb-px border-b-2 font-medium cursor-pointer transition-all duration-300 rounded-2xl whitespace-nowrap flex-shrink-0 transform hover:scale-105
                      ${activeTab === tab.key
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg font-semibold'
                        : 'border-transparent text-gray-500 hover:text-blue-600 hover:bg-white/30 dark:hover:bg-gray-800/30 hover:border-blue-300'
                      }
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