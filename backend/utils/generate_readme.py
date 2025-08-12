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
    """Enhanced folder tree with file counts and better formatting."""
    tree = []
    exclude = {'.git', '__pycache__', 'venv', '.venv', '.ipynb_checkpoints', 'node_modules', 'dist', 'build', '.pytest_cache'}
    
    def count_files_in_dir(dir_path):
        count = 0
        for root, dirs, files in os.walk(dir_path):
            count += len(files)
        return count
    
    def walk(dir_path, depth, prefix):
        if depth > max_depth:
            return
        entries = [e for e in sorted(os.listdir(dir_path)) if e not in exclude]
        for i, entry in enumerate(entries):
            path = os.path.join(dir_path, entry)
            connector = "└── " if i == len(entries) - 1 else "├── "
            
            if os.path.isdir(path):
                file_count = count_files_in_dir(path)
                tree.append(f"{prefix}{connector}📁 {entry}/ ({file_count} files)")
                walk(path, depth + 1, prefix + ("    " if i == len(entries) - 1 else "│   "))
            else:
                # Add file type icons
                ext = os.path.splitext(entry)[1].lower()
                icon = get_file_icon(ext)
                tree.append(f"{prefix}{connector}{icon} {entry}")
    
    walk(repo_path, 1, "")
    return "\n".join(tree)

def get_file_icon(ext):
    """Get appropriate icon for file types."""
    icon_map = {
        '.py': '🐍', '.js': '📜', '.ts': '📘', '.jsx': '⚛️', '.tsx': '⚛️',
        '.md': '📝', '.json': '📋', '.yml': '⚙️', '.yaml': '⚙️',
        '.html': '🌐', '.css': '🎨', '.scss': '🎨', '.sql': '🗄️',
        '.java': '☕', '.cpp': '⚡', '.c': '⚡', '.h': '📋',
        '.txt': '📄', '.log': '📋', '.sh': '🐚', '.bat': '🪟',
        '.gitignore': '🛡️', '.env': '🔐', '.dockerfile': '🐳'
    }
    return icon_map.get(ext, '📄')

def detect_main_script(repo_path):
    """Enhanced main script detection with multiple patterns."""
    main_patterns = [
        "main.py", "app.py", "index.js", "index.ts", "server.py", "run.py",
        "start.py", "manage.py", "wsgi.py", "asgi.py", "main.js", "app.js"
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
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        if "if __name__ == '__main__'" in content or "def main(" in content:
                            rel_path = os.path.relpath(file_path, repo_path)
                            return rel_path
                except Exception:
                    continue
    return None

def extract_module_docstring(repo_path):
    """Enhanced docstring extraction with fallback to file content analysis."""
    for fname in ["main.py", "app.py", "README.md", "index.js"]:
        for root, dirs, files in os.walk(repo_path):
            if fname in files:
                file_path = os.path.join(root, fname)
                try:
                    if fname.endswith('.py'):
                        with open(file_path, "r", encoding="utf-8") as f:
                            node = ast.parse(f.read())
                            docstring = ast.get_docstring(node)
                            if docstring:
                                return docstring
                    elif fname.endswith('.md'):
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()
                            # Extract first paragraph after title
                            lines = content.split('\n')
                            for i, line in enumerate(lines):
                                if line.startswith('#') and i + 1 < len(lines):
                                    next_line = lines[i + 1].strip()
                                    if next_line and not next_line.startswith('#'):
                                        return next_line
                except Exception:
                    continue
    return None

def count_files_and_languages(repo_path):
    """Enhanced file counting with more language detection and file size analysis."""
    exts = []
    total = 0
    total_size = 0
    file_sizes = {}
    
    for root, dirs, files in os.walk(repo_path):
        for f in files:
            file_path = os.path.join(root, f)
            ext = os.path.splitext(f)[1].lower()
            if ext:
                exts.append(ext)
                try:
                    size = os.path.getsize(file_path)
                    total_size += size
                    if ext not in file_sizes:
                        file_sizes[ext] = 0
                    file_sizes[ext] += size
                except Exception:
                    pass
            total += 1
    
    # Enhanced language mapping
    lang_map = {
        ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript", 
        ".jsx": "React JSX", ".tsx": "React TSX", ".md": "Markdown", 
        ".json": "JSON", ".yml": "YAML", ".yaml": "YAML",
        ".html": "HTML", ".css": "CSS", ".scss": "SCSS", ".sql": "SQL",
        ".java": "Java", ".cpp": "C++", ".c": "C", ".h": "C Header",
        ".sh": "Shell", ".bat": "Batch", ".ps1": "PowerShell",
        ".php": "PHP", ".rb": "Ruby", ".go": "Go", ".rs": "Rust",
        ".swift": "Swift", ".kt": "Kotlin", ".scala": "Scala"
    }
    
    lang_counts = Counter([lang_map.get(e, e) for e in exts])
    
    # Calculate average file size
    avg_size = total_size / total if total > 0 else 0
    
    return total, lang_counts, total_size, avg_size, file_sizes

def get_project_name(repo_path):
    """Enhanced project name detection with multiple sources."""
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
    
    # Try setup.py for Python projects
    setup_py = os.path.join(repo_path, "setup.py")
    if os.path.exists(setup_py):
        try:
            with open(setup_py, "r", encoding="utf-8") as f:
                content = f.read()
                match = re.search(r'name\s*=\s*["\']([^"\']+)["\']', content)
                if match:
                    return match.group(1)
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
    """Analyze project dependencies and package managers."""
    dependencies = {}
    
    # Python dependencies
    requirements_files = ["requirements.txt", "requirements-dev.txt", "pyproject.toml", "setup.py"]
    for req_file in requirements_files:
        req_path = os.path.join(repo_path, req_file)
        if os.path.exists(req_path):
            dependencies["python"] = req_file
            break
    
    # Node.js dependencies
    if os.path.exists(os.path.join(repo_path, "package.json")):
        dependencies["nodejs"] = "package.json"
    
    # Java dependencies
    if os.path.exists(os.path.join(repo_path, "pom.xml")):
        dependencies["java"] = "pom.xml"
    elif os.path.exists(os.path.join(repo_path, "build.gradle")):
        dependencies["java"] = "build.gradle"
    
    # Go dependencies
    if os.path.exists(os.path.join(repo_path, "go.mod")):
        dependencies["go"] = "go.mod"
    
    # Rust dependencies
    if os.path.exists(os.path.join(repo_path, "Cargo.toml")):
        dependencies["rust"] = "Cargo.toml"
    
    return dependencies

def get_git_info(repo_path):
    """Extract Git repository information."""
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
            
    except Exception:
        pass
    
    return git_info

def analyze_code_complexity(repo_path):
    """Analyze code complexity and structure."""
    complexity = {
        "total_lines": 0,
        "code_lines": 0,
        "comment_lines": 0,
        "blank_lines": 0,
        "functions": 0,
        "classes": 0,
        "imports": 0
    }
    
    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if file.endswith(('.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        lines = f.readlines()
                        complexity["total_lines"] += len(lines)
                        
                        for line in lines:
                            stripped = line.strip()
                            if stripped.startswith('#') or stripped.startswith('//') or stripped.startswith('/*'):
                                complexity["comment_lines"] += 1
                            elif stripped == '':
                                complexity["blank_lines"] += 1
                            else:
                                complexity["code_lines"] += 1
                                
                        # Count functions and classes (basic regex approach)
                        content = ''.join(lines)
                        complexity["functions"] += len(re.findall(r'def\s+\w+', content))
                        complexity["functions"] += len(re.findall(r'function\s+\w+', content))
                        complexity["classes"] += len(re.findall(r'class\s+\w+', content))
                        complexity["imports"] += len(re.findall(r'^import\s+|^from\s+', content, re.MULTILINE))
                        
                except Exception:
                    continue
    
    return complexity

def generate_readme(repo_path: str) -> str:
    """
    Generate a comprehensive professional README.md for the given repo path.
    If a README.md exists, use it as a base and append extra sections.
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
    
    description = docstring or "No description found. (Future: Use GPT to summarize)"
    
    # Format file sizes
    def format_size(size_bytes):
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        else:
            return f"{size_bytes / (1024 * 1024):.1f} MB"
    
    # Enhanced extra sections
    extra_sections = f"""## ⚙️ Installation
```bash
pip install -r requirements.txt
```

## 🚀 Usage
{'python ' + main_script if main_script else 'See source code for entry point.'}

## 📁 Project Structure
```
{folder_tree}
```

## 📦 Dependencies
{chr(10).join([f"- **{tech}**: {file}" for tech, file in dependencies.items()]) if dependencies else "No dependency files detected."}

## 📊 Repository Statistics
- **Total Files**: {total_files:,}
- **Total Size**: {format_size(total_size)}
- **Average File Size**: {format_size(int(avg_size))}
- **Languages**: {', '.join(f'{k} ({v:,})' for k, v in lang_counts.items()) or 'Unknown'}

## 🔍 Code Analysis
- **Total Lines**: {complexity['total_lines']:,}
- **Code Lines**: {complexity['code_lines']:,}
- **Comment Lines**: {complexity['comment_lines']:,}
- **Functions**: {complexity['functions']:,}
- **Classes**: {complexity['classes']:,}
- **Imports**: {complexity['imports']:,}

## 🗂️ Entry Point
{main_script or 'Not detected'}

## 📃 License
{license_info}

## 🔗 Repository Info
{f"- **Branch**: {git_info.get('branch', 'Unknown')}" if git_info.get('branch') else ""}
{f"- **Last Commit**: {git_info.get('last_commit', {}).get('hash', 'Unknown')} by {git_info.get('last_commit', {}).get('author', 'Unknown')}" if git_info.get('last_commit') else ""}
{f"- **Remote**: {git_info.get('remote', 'Unknown')}" if git_info.get('remote') else ""}

## 🙌 Contributing
Pull requests welcome! For major changes, please open an issue first.

## 📞 Contact
Contact: [maintainer](mailto:email@example.com)

---
*Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*"""

    if base_readme:
        return f"{base_readme}\n\n---\n\n{extra_sections.strip()}"
    else:
        return f"""# 📌 {project_name}

## 📄 Description
{description}

{extra_sections}""" 