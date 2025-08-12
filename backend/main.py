from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from utils.clone import clone_repo
from utils.generate_requirements import generate_requirements
from utils.generate_readme import generate_readme
from utils.generate_docs import generate_docs
from utils.generate_gitignore import generate_gitignore

app = FastAPI()

# Allow CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    github_url: str

@app.post("/analyze")
async def analyze_repo(request: AnalyzeRequest):
    try:
        github_url = request.github_url
        repo_path = clone_repo(github_url)
        requirements = generate_requirements(repo_path)
        readme = generate_readme(repo_path)
        try:
            documentation = generate_docs(repo_path)
        except Exception as doc_exc:
            documentation = f"# Documentation generation failed: {doc_exc}"
        try:
            gitignore = generate_gitignore(repo_path)
        except Exception as gi_exc:
            gitignore = f"# .gitignore generation failed: {gi_exc}"
        return {
            "message": "Analysis completed",
            "repo_path": repo_path,
            "requirements": requirements,
            "readme": readme,
            "documentation": documentation,
            "gitignore": gitignore
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))