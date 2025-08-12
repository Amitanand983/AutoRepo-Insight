# generate_docs.py

import os
import sys
import re
import traceback
from io import StringIO

def generate_docs(repo_path: str) -> str:
    """
    Generate Markdown documentation for all Python modules in the repo.
    Returns a single Markdown string. Parses files without importing them.
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
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Generate basic documentation
            doc_content = []
            doc_content.append(f"## Module `{module_name}`\n")
            
            # Extract module docstring
            module_doc_match = re.search(r'"""(.*?)"""', content, re.DOTALL)
            if module_doc_match:
                doc_content.append(f"**Description:** {module_doc_match.group(1).strip()}\n")
            
            # Find class definitions
            class_matches = re.finditer(r'class\s+(\w+).*?:', content)
            classes = []
            for match in class_matches:
                class_name = match.group(1)
                # Look for class docstring
                class_start = match.start()
                class_content = content[class_start:]
                class_doc_match = re.search(r'"""(.*?)"""', class_content, re.DOTALL)
                if class_doc_match:
                    classes.append((class_name, class_doc_match.group(1).strip()))
                else:
                    classes.append((class_name, "No description available"))
            
            # Find function definitions
            function_matches = re.finditer(r'def\s+(\w+).*?:', content)
            functions = []
            for match in function_matches:
                func_name = match.group(1)
                # Look for function docstring
                func_start = match.start()
                func_content = content[func_start:]
                func_doc_match = re.search(r'"""(.*?)"""', func_content, re.DOTALL)
                if func_doc_match:
                    functions.append((func_name, func_doc_match.group(1).strip()))
                else:
                    functions.append((func_name, "No description available"))
            
            # Add classes documentation
            if classes:
                doc_content.append("\n### Classes\n")
                for name, doc in classes:
                    doc_content.append(f"#### `{name}`\n")
                    doc_content.append(f"{doc}\n")
                    doc_content.append("---\n")
            
            # Add functions documentation
            if functions:
                doc_content.append("\n### Functions\n")
                for name, doc in functions:
                    doc_content.append(f"#### `{name}`\n")
                    doc_content.append(f"{doc}\n")
                    doc_content.append("---\n")
            
            # Add file info
            doc_content.append(f"\n**File:** `{rel_path}`\n")
            doc_content.append(f"**Lines of Code:** {len(content.splitlines())}\n")
            
            docs.append("\n".join(doc_content))
                
        except Exception as e:
            tb = traceback.format_exc()
            skipped.append((module_name, str(e), tb))
    
    result = "\n\n".join(docs)
    if skipped:
        result += "\n\n---\n\n⚠️ **Skipped Modules**\n"
        for module_name, err, tb in skipped:
            result += (
                f"\n- `{module_name}.py`: {err}\n"
            )
            if tb:
                result += (
                    "  <details><summary>Traceback</summary>\n\n"
                    "```\n"
                    f"{tb}"
                    "```\n</details>\n"
                )
        result += "\nSome modules could not be documented due to import or render errors."
    
    return result or "# No documentation could be generated." 