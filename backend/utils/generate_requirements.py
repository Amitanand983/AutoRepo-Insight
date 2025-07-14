import os
import subprocess

def generate_requirements(repo_path: str) -> str:
    """
    Use pipreqs to generate requirements.txt in the repo and return its contents as a string.
    Handles errors for missing pipreqs or no imports found.
    """
    req_path = os.path.join(repo_path, "requirements.txt")
    try:
        # Run pipreqs to generate requirements.txt
        result = subprocess.run([
            "pipreqs", repo_path, "--force", "--savepath", req_path
        ], capture_output=True, text=True)
        if result.returncode != 0:
            if "No module named pipreqs" in result.stderr:
                raise RuntimeError("pipreqs is not installed. Please install it with 'pip install pipreqs'.")
            raise RuntimeError(f"pipreqs error: {result.stderr.strip()}")
        if not os.path.exists(req_path):
            raise RuntimeError("requirements.txt was not generated. The repo may not have any imports.")
        with open(req_path, "r") as f:
            content = f.read().strip()
        if not content:
            return "# No imports found in the repository."
        return content
    except Exception as e:
        return f"# Error generating requirements.txt: {e}" 