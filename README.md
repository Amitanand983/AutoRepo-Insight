# AutoRepo Insight

A full-stack tool to analyze any public GitHub repo and generate documentation, requirements, and more.

## Features
- Professional README.md generation
- requirements.txt extraction
- Markdown/HTML code documentation
- .gitignore, license detection, API doc, code smell detection

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, shadcn/ui
- **Backend:** FastAPI, PyGithub, gitpython, pipreqs, pdoc, flake8, radon, pylint

## Getting Started

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Folder Structure
See code for the details. 
