import os
import textwrap
from collections import Counter
import ast

def detect_license(repo_path):
    license_path = os.path.join(repo_path, "LICENSE")
    if os.path.exists(license_path):
        with open(license_path, "r") as f:
            first_line = f.readline().strip()
            return first_line if first_line else "See LICENSE file."
    return "No license detected."

def get_folder_tree(repo_path, max_depth=2):
    tree = []
    exclude = {'.git', '__pycache__', 'venv', '.venv', '.ipynb_checkpoints'}
    def walk(dir_path, depth, prefix):
        if depth > max_depth:
            return
        entries = [e for e in sorted(os.listdir(dir_path)) if e not in exclude]
        for i, entry in enumerate(entries):
            path = os.path.join(dir_path, entry)
            connector = "└── " if i == len(entries) - 1 else "├── "
            tree.append(f"{prefix}{connector}{entry}")
            if os.path.isdir(path):
                walk(path, depth + 1, prefix + ("    " if i == len(entries) - 1 else "│   "))
    walk(repo_path, 1, "")
    return "\n".join(tree)

def detect_main_script(repo_path):
    for fname in ["main.py", "app.py", "index.js"]:
        for root, dirs, files in os.walk(repo_path):
            if fname in files:
                rel_path = os.path.relpath(os.path.join(root, fname), repo_path)
                return rel_path
    return None

def extract_module_docstring(repo_path):
    for fname in ["main.py", "app.py"]:
        for root, dirs, files in os.walk(repo_path):
            if fname in files:
                file_path = os.path.join(root, fname)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        node = ast.parse(f.read())
                        docstring = ast.get_docstring(node)
                        if docstring:
                            return docstring
                except Exception:
                    continue
    return None

def count_files_and_languages(repo_path):
    exts = []
    total = 0
    for root, dirs, files in os.walk(repo_path):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext:
                exts.append(ext)
            total += 1
    lang_map = {".py": "Python", ".js": "JavaScript", ".ts": "TypeScript", ".md": "Markdown", ".json": "JSON"}
    lang_counts = Counter([lang_map.get(e, e) for e in exts])
    return total, lang_counts

def get_project_name(repo_path):
    # Try .git/config first
    git_config = os.path.join(repo_path, ".git", "config")
    if os.path.exists(git_config):
        with open(git_config) as f:
            for line in f:
                if line.strip().startswith("url ="):
                    url = line.split("=", 1)[1].strip()
                    return os.path.splitext(os.path.basename(url))[0]
    # Fallback to folder name
    return os.path.basename(os.path.abspath(repo_path))

def generate_readme(repo_path: str) -> str:
    """
    Generate a professional README.md for the given repo path.
    If a README.md exists, use it as a base and append extra sections.
    """
    readme_path = os.path.join(repo_path, "README.md")
    base_readme = None
    if os.path.exists(readme_path):
        with open(readme_path, "r", encoding="utf-8") as f:
            base_readme = f.read().strip()

    project_name = get_project_name(repo_path)
    folder_tree = get_folder_tree(repo_path)
    main_script = detect_main_script(repo_path)
    total_files, lang_counts = count_files_and_languages(repo_path)
    license_info = detect_license(repo_path)
    docstring = extract_module_docstring(repo_path)
    description = docstring or "No description found. (Future: Use GPT to summarize)"

    extra_sections = textwrap.dedent(f"""
    ## ⚙️ Installation
    ```bash
    pip install -r requirements.txt
    ```

    ## 🚀 Usage
    {'python ' + main_script if main_script else 'See source code for entry point.'}

    ## 📁 Folder Structure
    ```
    {folder_tree}
    ```

    ## 📃 License
    {license_info}

    ## 📊 Repo Stats
    - Total files: {total_files}
    - Languages: {', '.join(f'{k} ({v})' for k, v in lang_counts.items()) or 'Unknown'}

    ## 🗂️ Detected Main File
    {main_script or 'Not detected'}

    ## 🙌 Contributing / Contact
    Pull requests welcome! For major changes, please open an issue first.
    
    Contact: [maintainer](mailto:email@example.com)
    """)

    if base_readme:
        # Try to preserve user-provided description, append extra sections
        return f"{base_readme}\n\n---\n\n{extra_sections.strip()}"
    else:
        # Compose a new README from scratch
        return textwrap.dedent(f"""
        # 📌 {project_name}

        ## 📄 Description
        {description}

        {extra_sections}
        """).strip() 