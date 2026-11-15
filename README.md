# Local Quiz App (React + FastAPI)

This is a lightweight local application. The frontend is built with React (via Vite) and the backend is built with FastAPI to handle file operations.

## 1. Start the Backend
1. Open a terminal and navigate to the `backend` folder.
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI server:
   ```bash
   python -m uvicorn main:app --reload
   ```
   *The backend will now listen on http://127.0.0.1:8000.*
   *You can add or update your questions anytime by editing `questions.json`.*

## 2. Start the Frontend
1. Open a *new* terminal window and navigate to the `frontend` folder.
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The terminal will provide a local URL (e.g., http://localhost:5173). Open that in your browser to take the quiz.*

## Logs
When a quiz is submitted, the score is silently appended to `backend/quiz_logs.txt`.
