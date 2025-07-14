import os
from collections import Counter

def detect_stack(repo_path):
    exts = []
    folders = set()
    for root, dirs, files in os.walk(repo_path):
        for d in dirs:
            folders.add(d.lower())
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext:
                exts.append(ext)
    ext_counts = Counter(exts)
    # Heuristic: most common extension
    if ext_counts:
        main_ext = ext_counts.most_common(1)[0][0]
        if main_ext == ".py" or "__pycache__" in folders or ".venv" in folders:
            return "python"
        if main_ext == ".js" or "node_modules" in folders:
            return "node"
        if main_ext == ".ipynb":
            return "python-jupyter"
        if main_ext == ".ts":
            return "node-typescript"
    return None

GITIGNORE_TEMPLATES = {
    "python": """# Python
__pycache__/
*.py[cod]
*.so
.venv/
.env
.env.*
*.egg-info/
dist/
build/
.ipynb_checkpoints/
""",
    "python-jupyter": """# Python + Jupyter
__pycache__/
*.py[cod]
*.so
.venv/
.env
.env.*
*.egg-info/
dist/
build/
.ipynb_checkpoints/
*.ipynb
""",
    "node": """# Node
node_modules/
dist/
build/
.env
.env.*
.npm/
.cache/
*.log
""",
    "node-typescript": """# Node + TypeScript
node_modules/
dist/
build/
.env
.env.*
.npm/
.cache/
*.log
*.tsbuildinfo
"""
}

def generate_gitignore(repo_path: str) -> str:
    """
    Generate a .gitignore string based on detected stack/language.
    """
    stack = detect_stack(repo_path)
    if stack and stack in GITIGNORE_TEMPLATES:
        return GITIGNORE_TEMPLATES[stack]
    return "# No suitable .gitignore template found. Please customize as needed." 