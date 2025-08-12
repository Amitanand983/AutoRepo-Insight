import os
import textwrap
from collections import Counter
import ast
import json
import re
from datetime import datetime
import subprocess

def detect_license(repo_path):
    """Enhanced license detection with multiple file formats and content analysis."""
    license_files = ["LICENSE", "LICENSE.txt", "LICENSE.md", "COPYING", "COPYING.txt"]
    for license_file in license_files:
        license_path = os.path.join(repo_path, license_file)
        if os.path.exists(license_path):
            try:
                with open(license_path, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    # Try to extract license type from content
                    content_lower = content.lower()
                    if "mit" in content_lower:
                        return "MIT License"
                    elif "apache" in content_lower:
                        return "Apache License 2.0"
                    elif "gpl" in content_lower:
                        if "v3" in content_lower:
                            return "GNU GPL v3"
                        elif "v2" in content_lower:
                            return "GNU GPL v2"
                        else:
                            return "GNU GPL"
                    elif "bsd" in content_lower:
                        return "BSD License"
                    else:
                        return f"Custom License (see {license_file})"
            except Exception:
                continue
    return "No license detected."

def get_folder_tree(repo_path, max_depth=3):
    """Enhanced folder tree with file counts, better formatting, and intelligent organization."""
    tree = []
    exclude = {'.git', '__pycache__', 'venv', '.venv', '.ipynb_checkpoints', 'node_modules', 'dist', 'build', '.pytest_cache', '.mypy_cache', '.coverage', '.tox'}
    
    def count_files_in_dir(dir_path):
        count = 0
        for root, dirs, files in os.walk(dir_path):
            count += len(files)
        return count
    
    def get_directory_priority(dir_name):
        """Return priority for directory ordering (important dirs first)."""
        priorities = {
            'src': 1, 'app': 1, 'main': 1, 'core': 1,
            'tests': 2, 'test': 2, 'specs': 2,
            'docs': 3, 'documentation': 3,
            'examples': 4, 'samples': 4,
            'scripts': 5, 'tools': 5, 'utils': 5,
            'config': 6, 'settings': 6,
            'assets': 7, 'static': 7, 'media': 7,
            'data': 8, 'models': 8
        }
        return priorities.get(dir_name.lower(), 10)
    
    def walk(dir_path, depth, prefix):
        if depth > max_depth:
            return
        entries = [e for e in sorted(os.listdir(dir_path)) if e not in exclude]
        
        # Sort directories by priority, then files alphabetically
        dirs = []
        files = []
        for entry in entries:
            path = os.path.join(dir_path, entry)
            if os.path.isdir(path):
                dirs.append((entry, get_directory_priority(entry)))
            else:
                files.append(entry)
        
        # Sort directories by priority, then alphabetically
        dirs.sort(key=lambda x: (x[1], x[0]))
        files.sort()
        
        all_entries = [(name, True) for name, _ in dirs] + [(name, False) for name in files]
        
        for i, (entry, is_dir) in enumerate(all_entries):
            path = os.path.join(dir_path, entry)
            connector = "└── " if i == len(all_entries) - 1 else "├── "
            
            if is_dir:
                file_count = count_files_in_dir(path)
                tree.append(f"{prefix}{connector}📁 **{entry}/** ({file_count} files)")
                walk(path, depth + 1, prefix + ("    " if i == len(all_entries) - 1 else "│   "))
            else:
                # Add file type icons and better formatting
                ext = os.path.splitext(entry)[1].lower()
                icon = get_file_icon(ext)
                tree.append(f"{prefix}{connector}{icon} `{entry}`")
    
    walk(repo_path, 1, "")
    return "\n".join(tree)

def get_file_icon(ext):
    """Get appropriate icon for file types with enhanced coverage."""
    icon_map = {
        # Programming Languages
        '.py': '🐍', '.js': '📜', '.ts': '📘', '.jsx': '⚛️', '.tsx': '⚛️',
        '.java': '☕', '.cpp': '⚡', '.c': '⚡', '.h': '📋', '.cs': '🔷',
        '.go': '🐹', '.rs': '🦀', '.php': '🐘', '.rb': '💎', '.swift': '🍎',
        '.kt': '🔵', '.scala': '🔴', '.dart': '💙', '.lua': '🌙',
        
        # Web Technologies
        '.html': '🌐', '.css': '🎨', '.scss': '🎨', '.sass': '🎨', '.less': '🎨',
        '.vue': '💚', '.svelte': '🟠', '.elm': '🟢',
        
        # Data & Config
        '.json': '📋', '.xml': '📄', '.yaml': '⚙️', '.yml': '⚙️', '.toml': '⚙️',
        '.sql': '🗄️', '.db': '🗄️', '.sqlite': '🗄️',
        
        # Documentation
        '.md': '📝', '.rst': '📚', '.txt': '📄', '.pdf': '📕',
        
        # Build & Config
        '.gitignore': '🛡️', '.env': '🔐', '.dockerfile': '🐳', '.dockerignore': '🐳',
        '.makefile': '🔨', '.cmake': '🔨', '.gradle': '🔨', '.maven': '🔨',
        
        # Scripts
        '.sh': '🐚', '.bat': '🪟', '.ps1': '🪟', '.zsh': '🐚', '.fish': '🐚',
        
        # Archives
        '.zip': '📦', '.tar': '📦', '.gz': '📦', '.rar': '📦',
        
        # Images
        '.png': '🖼️', '.jpg': '🖼️', '.jpeg': '🖼️', '.gif': '🖼️', '.svg': '🖼️',
        '.ico': '🖼️', '.webp': '🖼️'
    }
    return icon_map.get(ext, '📄')

def detect_main_script(repo_path):
    """Enhanced main script detection with multiple patterns and intelligent analysis."""
    main_patterns = [
        # Python
        "main.py", "app.py", "server.py", "run.py", "start.py", "manage.py", 
        "wsgi.py", "asgi.py", "cli.py", "bot.py", "bot.py",
        
        # Node.js
        "index.js", "index.ts", "app.js", "app.ts", "server.js", "server.ts",
        "main.js", "main.ts", "start.js", "start.ts",
        
        # Java
        "Main.java", "Application.java", "App.java", "Server.java",
        
        # Go
        "main.go", "server.go", "app.go",
        
        # Rust
        "main.rs", "lib.rs",
        
        # PHP
        "index.php", "app.php", "server.php",
        
        # Ruby
        "app.rb", "main.rb", "server.rb"
    ]
    
    for pattern in main_patterns:
        for root, dirs, files in os.walk(repo_path):
            if pattern in files:
                rel_path = os.path.relpath(os.path.join(root, pattern), repo_path)
                return rel_path
    
    # Try to find files with main function or if __name__ == "__main__"
    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if file.endswith('.py'):
                try:
                    with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                        content = f.read()
                        if 'if __name__ == "__main__"' in content or 'def main(' in content:
                            rel_path = os.path.relpath(os.path.join(root, file), repo_path)
                            return rel_path
                except Exception:
                    continue
    
    return None

def count_files_and_languages(repo_path):
    """Enhanced file counting with better language detection and categorization."""
    total_files = 0
    lang_counts = Counter()
    total_size = 0
    file_sizes = []
    exclude = {'.git', '__pycache__', 'venv', '.venv', 'node_modules', 'dist', 'build'}
    
    # Enhanced language detection with framework identification
    language_patterns = {
        'Python': ['.py', '.pyx', '.pyi', '.pyw'],
        'JavaScript': ['.js', '.mjs'],
        'TypeScript': ['.ts', '.tsx'],
        'React': ['.jsx', '.tsx'],
        'Vue': ['.vue'],
        'Svelte': ['.svelte'],
        'HTML': ['.html', '.htm'],
        'CSS': ['.css', '.scss', '.sass', '.less'],
        'Java': ['.java', '.class'],
        'C++': ['.cpp', '.cc', '.cxx', '.hpp', '.h'],
        'C': ['.c', '.h'],
        'Go': ['.go'],
        'Rust': ['.rs'],
        'PHP': ['.php'],
        'Ruby': ['.rb'],
        'Swift': ['.swift'],
        'Kotlin': ['.kt', '.kts'],
        'Scala': ['.scala'],
        'Dart': ['.dart'],
        'Lua': ['.lua'],
        'Shell': ['.sh', '.bash', '.zsh', '.fish'],
        'Batch': ['.bat', '.cmd'],
        'PowerShell': ['.ps1'],
        'SQL': ['.sql'],
        'Markdown': ['.md', '.markdown'],
        'YAML': ['.yml', '.yaml'],
        'JSON': ['.json'],
        'XML': ['.xml'],
        'TOML': ['.toml'],
        'INI': ['.ini', '.cfg', '.conf'],
        'Docker': ['.dockerfile', '.dockerignore'],
        'Makefile': ['makefile', 'makefile.am', 'makefile.in'],
        'CMake': ['cmakelists.txt', '.cmake'],
        'Gradle': ['.gradle'],
        'Maven': ['pom.xml'],
        'Cargo': ['cargo.toml'],
        'Package': ['package.json', 'package-lock.json', 'yarn.lock'],
        'Requirements': ['requirements.txt', 'requirements-dev.txt', 'pyproject.toml', 'setup.py', 'setup.cfg'],
        'Go Modules': ['go.mod', 'go.sum'],
        'Pipenv': ['pipfile', 'pipfile.lock'],
        'Poetry': ['pyproject.toml', 'poetry.lock']
    }
    
    for root, dirs, files in os.walk(repo_path):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in exclude]
        
        for file in files:
            if not file.startswith('.'):
                total_files += 1
                file_path = os.path.join(root, file)
                
                try:
                    file_size = os.path.getsize(file_path)
                    total_size += file_size
                    file_sizes.append(file_size)
                    
                    # Detect language based on file extension
                    ext = os.path.splitext(file)[1].lower()
                    for lang, patterns in language_patterns.items():
                        if ext in patterns or file.lower() in patterns:
                            lang_counts[lang] += 1
                            break
                    else:
                        # If no specific language found, categorize by extension
                        if ext:
                            lang_counts[f'Other ({ext})'] += 1
                        else:
                            lang_counts['Unknown'] += 1
                            
                except Exception:
                    continue
    
    avg_size = total_size / total_files if total_files > 0 else 0
    return total_files, lang_counts, total_size, avg_size, file_sizes

def extract_module_docstring(repo_path):
    """Extract module docstring from main Python files."""
    docstrings = []
    
    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if file.endswith('.py') and not file.startswith('.'):
                try:
                    with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Look for module docstring
                        match = re.search(r'"""(.*?)"""', content, re.DOTALL)
                        if match:
                            docstring = match.group(1).strip()
                            if docstring and len(docstring) > 20:  # Only meaningful docstrings
                                docstrings.append(docstring)
                except Exception:
                    continue
    
    # Return the best docstring (longest and most descriptive)
    if docstrings:
        return max(docstrings, key=len)
    return None

def get_project_name(repo_path):
    """Enhanced project name detection from multiple sources."""
    # Try setup.py or pyproject.toml first
    for config_file in ["setup.py", "pyproject.toml"]:
        config_path = os.path.join(repo_path, config_file)
        if os.path.exists(config_path):
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    if config_file == "setup.py":
                        match = re.search(r'name\s*=\s*["\']([^"\']+)["\']', content)
                        if match:
                            return match.group(1)
                    elif config_file == "pyproject.toml":
                        match = re.search(r'name\s*=\s*["\']([^"\']+)["\']', content)
                        if match:
                            return match.group(1)
            except Exception:
                pass
    
    # Try package.json for Node.js projects
    package_json = os.path.join(repo_path, "package.json")
    if os.path.exists(package_json):
        try:
            with open(package_json, "r", encoding="utf-8") as f:
                data = json.load(f)
                if "name" in data:
                    return data["name"]
        except Exception:
            pass
    
    # Try .git/config
    git_config = os.path.join(repo_path, ".git", "config")
    if os.path.exists(git_config):
        try:
            with open(git_config, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip().startswith("url ="):
                        url = line.split("=", 1)[1].strip()
                        return os.path.splitext(os.path.basename(url))[0]
        except Exception:
            pass
    
    # Fallback to folder name
    return os.path.basename(os.path.abspath(repo_path))

def analyze_dependencies(repo_path):
    """Enhanced dependency analysis with multiple package managers and frameworks."""
    dependencies = {}
    
    # Python dependencies
    python_files = ["requirements.txt", "requirements-dev.txt", "pyproject.toml", "setup.py", "setup.cfg", "pipfile", "pipfile.lock"]
    for req_file in python_files:
        req_path = os.path.join(repo_path, req_file)
        if os.path.exists(req_path):
            dependencies["Python"] = req_file
            break
    
    # Node.js dependencies
    node_files = ["package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"]
    for node_file in node_files:
        if os.path.exists(os.path.join(repo_path, node_file)):
            dependencies["Node.js"] = node_file
            break
    
    # Java dependencies
    java_files = ["pom.xml", "build.gradle", "build.gradle.kts", "gradle.properties"]
    for java_file in java_files:
        if os.path.exists(os.path.join(repo_path, java_file)):
            dependencies["Java"] = java_file
            break
    
    # Go dependencies
    if os.path.exists(os.path.join(repo_path, "go.mod")):
        dependencies["Go"] = "go.mod"
    
    # Rust dependencies
    if os.path.exists(os.path.join(repo_path, "Cargo.toml")):
        dependencies["Rust"] = "Cargo.toml"
    
    # PHP dependencies
    if os.path.exists(os.path.join(repo_path, "composer.json")):
        dependencies["PHP"] = "composer.json"
    
    # Ruby dependencies
    if os.path.exists(os.path.join(repo_path, "Gemfile")):
        dependencies["Ruby"] = "Gemfile"
    
    # .NET dependencies
    if os.path.exists(os.path.join(repo_path, "*.csproj")) or os.path.exists(os.path.join(repo_path, "*.sln")):
        dependencies[".NET"] = "*.csproj/*.sln"
    
    return dependencies

def get_git_info(repo_path):
    """Extract comprehensive Git repository information."""
    git_info = {}
    
    try:
        # Get last commit info
        result = subprocess.run(
            ["git", "log", "-1", "--format=%H|%an|%ae|%ad|%s"],
            cwd=repo_path, capture_output=True, text=True
        )
        if result.returncode == 0:
            parts = result.stdout.strip().split('|')
            if len(parts) >= 5:
                git_info["last_commit"] = {
                    "hash": parts[0][:8],
                    "author": parts[1],
                    "email": parts[2],
                    "date": parts[3],
                    "message": parts[4]
                }
        
        # Get branch info
        result = subprocess.run(
            ["git", "branch", "--show-current"],
            cwd=repo_path, capture_output=True, text=True
        )
        if result.returncode == 0:
            git_info["branch"] = result.stdout.strip()
        
        # Get remote origin
        result = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            cwd=repo_path, capture_output=True, text=True
        )
        if result.returncode == 0:
            git_info["remote"] = result.stdout.strip()
        
        # Get commit count
        result = subprocess.run(
            ["git", "rev-list", "--count", "HEAD"],
            cwd=repo_path, capture_output=True, text=True
        )
        if result.returncode == 0:
            git_info["commit_count"] = result.stdout.strip()
            
    except Exception:
        pass
    
    return git_info

def analyze_code_complexity(repo_path):
    """Enhanced code complexity analysis with better metrics."""
    complexity = {
        "total_lines": 0,
        "code_lines": 0,
        "comment_lines": 0,
        "blank_lines": 0,
        "functions": 0,
        "classes": 0,
        "imports": 0,
        "docstrings": 0
    }
    
    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if file.endswith('.py') and not file.startswith('.'):
                try:
                    with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                        content = f.read()
                        lines = content.split('\n')
                        
                        complexity["total_lines"] += len(lines)
                        
                        for line in lines:
                            stripped = line.strip()
                            if stripped.startswith('#'):
                                complexity["comment_lines"] += 1
                            elif stripped == '':
                                complexity["blank_lines"] += 1
                            else:
                                complexity["code_lines"] += 1
                        
                        # Count functions and classes
                        complexity["functions"] += len(re.findall(r'^def\s+', content, re.MULTILINE))
                        complexity["classes"] += len(re.findall(r'^class\s+', content, re.MULTILINE))
                        complexity["imports"] += len(re.findall(r'^import\s+|^from\s+', content, re.MULTILINE))
                        complexity["docstrings"] += len(re.findall(r'""".*?"""', content, re.DOTALL))
                        
                except Exception:
                    continue
    
    return complexity

def generate_readme(repo_path: str) -> str:
    """
    Generate a comprehensive professional README.md for the given repo path.
    Enhanced with better formatting, intelligent analysis, and professional structure.
    """
    readme_path = os.path.join(repo_path, "README.md")
    base_readme = None
    if os.path.exists(readme_path):
        with open(readme_path, "r", encoding="utf-8") as f:
            base_readme = f.read().strip()

    # Enhanced data collection
    project_name = get_project_name(repo_path)
    folder_tree = get_folder_tree(repo_path)
    main_script = detect_main_script(repo_path)
    total_files, lang_counts, total_size, avg_size, file_sizes = count_files_and_languages(repo_path)
    license_info = detect_license(repo_path)
    docstring = extract_module_docstring(repo_path)
    dependencies = analyze_dependencies(repo_path)
    git_info = get_git_info(repo_path)
    complexity = analyze_code_complexity(repo_path)
    
    # Enhanced description with fallback
    description = docstring or f"A professional {', '.join(dependencies.keys() or ['Python'])} project with comprehensive documentation and analysis."
    
    # Format file sizes
    def format_size(size_bytes):
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        else:
            return f"{size_bytes / (1024 * 1024):.1f} MB"
    
    # Enhanced extra sections with better formatting
    extra_sections = f"""## 🚀 Quick Start

### 📋 Prerequisites
- Python 3.8+ (if Python project)
- Node.js 16+ (if Node.js project)
- Git

### ⚙️ Installation
```bash
# Clone the repository
git clone <repository-url>
cd {project_name}

# Install dependencies
{'pip install -r requirements.txt' if 'Python' in dependencies else 'npm install' if 'Node.js' in dependencies else 'See dependency files for installation instructions'}
```

### 🎯 Usage
```bash
{'python ' + main_script if main_script else 'See source code for entry point'}
```

## 📁 Project Structure
```
{folder_tree}
```

## 🛠️ Technology Stack
{chr(10).join([f"- **{tech}**: {file}" for tech, file in dependencies.items()]) if dependencies else "No dependency files detected."}

## 📊 Repository Statistics
| Metric | Value |
|--------|-------|
| **Total Files** | {total_files:,} |
| **Total Size** | {format_size(total_size)} |
| **Average File Size** | {format_size(int(avg_size))} |
| **Languages** | {', '.join(f'{k} ({v:,})' for k, v in lang_counts.items()) or 'Unknown'} |

## 🔍 Code Analysis
| Metric | Value |
|--------|-------|
| **Total Lines** | {complexity['total_lines']:,} |
| **Code Lines** | {complexity['code_lines']:,} |
| **Comment Lines** | {complexity['comment_lines']:,} |
| **Functions** | {complexity['functions']:,} |
| **Classes** | {complexity['classes']:,} |
| **Imports** | {complexity['imports']:,} |
| **Docstrings** | {complexity['docstrings']:,} |

## 🎯 Entry Point
{main_script or 'Not detected'}

## 📃 License
{license_info}

## 🔗 Repository Information
{f"- **Branch**: `{git_info.get('branch', 'Unknown')}`" if git_info.get('branch') else ""}
{f"- **Last Commit**: `{git_info.get('last_commit', {}).get('hash', 'Unknown')}` by {git_info.get('last_commit', {}).get('author', 'Unknown')}" if git_info.get('last_commit') else ""}
{f"- **Total Commits**: {git_info.get('commit_count', 'Unknown')}" if git_info.get('commit_count') else ""}
{f"- **Remote**: {git_info.get('remote', 'Unknown')}" if git_info.get('remote') else ""}

## 🤝 Contributing
We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Contribution Guidelines
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact & Support
- **Issues**: [GitHub Issues](https://github.com/username/{project_name}/issues)
- **Discussions**: [GitHub Discussions](https://github.com/username/{project_name}/discussions)
- **Email**: [maintainer@example.com](mailto:maintainer@example.com)

## ⭐ Show your support
Give a ⭐️ if this project helped you!

---

<div align="center">

**Generated with ❤️ by [AutoRepo Insight](https://github.com/Amitanand983/AutoRepo-Insight)**

*Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*

</div>"""

    if base_readme:
        return f"{base_readme}\n\n---\n\n{extra_sections.strip()}"
    else:
        return f"""# 📌 {project_name}

<div align="center">

![Repository Size](https://img.shields.io/badge/Size-{format_size(total_size)}-blue)
![Total Files](https://img.shields.io/badge/Files-{total_files}-green)
![Languages](https://img.shields.io/badge/Languages-{len(lang_counts)}-orange)
![License](https://img.shields.io/badge/License-{license_info.replace(' ', '%20')}-red)

</div>

## 📄 Description
{description}

{extra_sections}""" 