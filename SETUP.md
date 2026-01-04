# Quick Setup Guide

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **(Optional) Set up Gemini API key:**
   ```bash
   # Create .env file
   echo "GEMINI_API_KEY=your_key_here" > .env
   ```
   Note: MVP works without API key (uses mock mode for quiz generation)

4. **Run the server:**
   ```bash
   # Option 1: Using Python directly
   python main.py
   
   # Option 2: Using uvicorn (recommended for development)
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   Server will run on: `http://localhost:8000`

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   Frontend will run on: `http://localhost:5173`

## Testing

1. Open `http://localhost:5173` in your browser
2. Enter a prompt like: "Create a 10-question quiz from physics notes"
3. Click "Orchestrate"
4. View the result with intent detection and generated quiz

## Example Prompts

- "Create a 15-question quiz from chapter 5 physics notes and assign it"
- "Generate a learning plan from the syllabus"
- "Analyze quiz results from last week"
- "Create a 5-question test about quantum mechanics"

## Troubleshooting

### Import Errors
- Make sure you're running the backend server from the `backend/` directory
- Python should be able to find modules because backend/ is in the path when running from there

### Gemini API Issues
- If you don't have a Gemini API key, the system will use mock mode automatically
- Mock mode generates simple placeholder questions

### Port Already in Use
- Backend: Change port in `main.py` or uvicorn command
- Frontend: Change port in `vite.config.js`
