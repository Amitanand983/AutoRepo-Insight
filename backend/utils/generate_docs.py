# generate_docs.py

import os
import sys
import importlib.util
import traceback
from io import StringIO

def generate_docs(repo_path: str) -> str:
    """
    Generate Markdown documentation for all Python modules in the repo using pdoc.
    Returns a single Markdown string. Handles errors gracefully.
    """
    try:
        import pdoc
    except ImportError:
        return "# Error: pdoc is not installed. Please install it with 'pip install pdoc'."

    sys.path.insert(0, repo_path)
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
    for module_name, file_path in py_files:
        try:
            # Dynamically import the module
            spec = importlib.util.spec_from_file_location(module_name, file_path)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            # Generate docs using pdoc
            doc_md = pdoc.pdoc(module_name, output_format="markdown", context={"docformat": "google"})
            docs.append(f"## Module `{module_name}`\n\n" + doc_md)
        except Exception as e:
            docs.append(f"## Module `{module_name}`\n\nError generating docs: {e}\n{traceback.format_exc()}")
    sys.path.pop(0)
    return "\n\n".join(docs) 