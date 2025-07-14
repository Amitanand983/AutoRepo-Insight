import os
from collections import Counter

def detect_stacks(repo_path):
    indicators = {
        "python": {"exts": {".py", ".egg-info"}, "folders": {"__pycache__", ".venv", "venv"}, "files": set()},
        "jupyter": {"exts": {".ipynb"}, "folders": {".ipynb_checkpoints"}, "files": set()},
        "node": {"exts": {".js"}, "folders": {"node_modules"}, "files": {"package.json"}},
        "react": {"exts": {".jsx", ".tsx"}, "folders": {"src", "public"}, "files": set()},
        "java": {"exts": {".java"}, "folders": set(), "files": {"pom.xml"}},
        "cpp": {"exts": {".cpp", ".h"}, "folders": set(), "files": {"Makefile", "CMakeLists.txt"}},
    }
    found = set()
    for root, dirs, files in os.walk(repo_path):
        for lang, keys in indicators.items():
            # Extensions
            for f in files:
                ext = os.path.splitext(f)[1].lower()
                if ext in keys["exts"]:
                    found.add(lang)
                if f in keys["files"]:
                    found.add(lang)
            # Folders
            for d in dirs:
                if d.lower() in keys["folders"]:
                    found.add(lang)
    # Special: if both python and jupyter, keep both
    return sorted(found)

GITIGNORE_TEMPLATES = {
    "python": """# Python\n__pycache__/\n*.py[cod]\n*.so\n.venv/\n.env\n.env.*\n*.egg-info/\ndist/\nbuild/\n.ipynb_checkpoints/\n""",
    "jupyter": """# Jupyter\n.ipynb_checkpoints/\n*.ipynb\n""",
    "node": """# Node.js\nnode_modules/\ndist/\nbuild/\n.env\n.env.*\n.npm/\n.cache/\n*.log\n""",
    "react": """# React\nbuild/\ndist/\nnode_modules/\n.env\n.env.*\n*.log\n""",
    "java": """# Java\n*.class\n*.jar\n*.war\n*.ear\n*.iml\n*.log\ntarget/\nbin/\n*.project\n*.classpath\n.settings/\n.idea/\n""",
    "cpp": """# C++\n*.o\n*.obj\n*.so\n*.exe\n*.out\nCMakeFiles/\nCMakeCache.txt\nMakefile\ncmake_install.cmake\nbuild/\n"""
}

GENERIC_TEMPLATE = """# General\n.DS_Store\nThumbs.db\n*.swp\n*.swo\n*.bak\n*.tmp\n.env\n.env.*\n"""

def generate_gitignore(repo_path: str) -> str:
    """
    Generate a .gitignore string based on detected stack/language(s).
    Combines templates and adds a summary comment.
    """
    stacks = detect_stacks(repo_path)
    sections = []
    if stacks:
        for stack in stacks:
            template = GITIGNORE_TEMPLATES.get(stack)
            if template:
                sections.append(template.strip())
        summary = f"# Auto-generated based on detected languages: {', '.join(s.capitalize() for s in stacks)}\n"
        result = summary + "\n\n".join(sections)
    else:
        result = "# Auto-generated generic .gitignore\n" + GENERIC_TEMPLATE
    return result.strip() 