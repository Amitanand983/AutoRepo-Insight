# generate_docs.py

import os
import sys
import importlib.util
import traceback
from io import StringIO
from pdoc import render

def generate_docs(repo_path: str) -> str:
    """
    Generate Markdown documentation for all Python modules in the repo using pdoc static rendering.
    Returns a single Markdown string. Skips modules that fail to render, and reports errors.
    """
    py_files = []
    for root, dirs, files in os.walk(repo_path):
        for f in files:
            if f.endswith(".py") and not f.startswith("."):
                rel_path = os.path.relpath(os.path.join(root, f), repo_path)
                module_name = rel_path[:-3].replace(os.sep, ".")
                py_files.append((module_name, os.path.join(root, f)))
    if not py_files:
        return "# No Python modules found for documentation."

    docs = []
    skipped = []
    for module_name, file_path in py_files:
        try:
            doc_md = render.module_docs(path=file_path, context="none", output_format="markdown")
            docs.append(f"## Module `{module_name}`\n\n" + doc_md)
        except Exception as e:
            tb = traceback.format_exc()
            skipped.append((module_name, str(e), tb))
    result = "\n\n".join(docs)
    if skipped:
        result += "\n\n---\n\n⚠️ **Skipped Modules**\n"
        for module_name, err, tb in skipped:
            result += (
                f"\n- `{module_name}.py`: {err}\n"
                "  <details><summary>Traceback</summary>\n\n"
                "```\n"
                f"{tb}"
                "```\n</details>\n"
            )
        result += "\nSome modules could not be documented due to import or render errors."
    return result or "# No documentation could be generated." 