import os
import shutil
from git import Repo, GitCommandError
from urllib.parse import urlparse

def clone_repo(github_url: str, dest_base: str = "/tmp") -> str:
    """
    Clone the given GitHub repo to /tmp/<repo_name>. Returns local path.
    If already exists, remove and re-clone. Raises exception on failure.
    """
    parsed = urlparse(github_url)
    repo_name = os.path.splitext(os.path.basename(parsed.path))[0]
    dest_path = os.path.join(dest_base, repo_name)

    # Remove existing directory if it exists
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path)

    try:
        Repo.clone_from(github_url, dest_path)
    except GitCommandError as e:
        raise RuntimeError(f"Failed to clone repo: {e}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error: {e}")

    return dest_path 