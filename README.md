# EduSphere AI

**AI-powered orchestration system for Google Workspace education tools**

EduSphere AI acts as an **intent translation + workflow automation layer** between teachers and Google Workspace APIs. It translates natural language prompts into coordinated actions across Google Classroom, Forms, Docs, Sheets, and Calendar.

---

## 🎯 What Problem Does It Solve?

Even though Google Workspace tools exist, teachers still have to manually:
- Read notes
- Create quizzes
- Open Forms
- Assign to Classroom
- Track results
- Adjust schedules

**EduSphere AI allows: ONE prompt → MANY coordinated actions**

---

## 🏗️ Architecture

```
Layer 1 — User
Layer 2 — Frontend (React)
Layer 3 — Orchestrator (FastAPI)  ← System Brain
Layer 4 — Agents (AI logic)
Layer 5 — Google Workspace APIs
```

**Key Rule:** Agents NEVER call Google APIs directly. Only the Orchestrator (FastAPI) can call Google APIs.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- (Optional) Google Gemini API key

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# (Optional) Create .env file with your Gemini API key
# cp .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here
# Note: MVP works without API key (uses mock mode)

# Run FastAPI server (from backend/ directory)
python main.py
# Or: uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs on `http://localhost:8000`

**Important:** Run the server from the `backend/` directory to ensure imports work correctly.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 📁 Project Structure

```
backend/
├── main.py                 # Orchestrator (FastAPI)
├── agents/
│   ├── intent_agent.py     # Decides WHAT to do
│   ├── quiz_agent.py       # Generates quiz questions
│   ├── learning_agent.py
│   ├── analytics_agent.py
│   └── workflow_agent.py
├── services/
│   ├── gemini_service.py   # Text generation only
│   ├── classroom_service.py
│   ├── forms_service.py
│   ├── docs_service.py
│   ├── sheets_service.py
│   └── calendar_service.py
├── schemas/
│   └── models.py
├── utils/
│   └── auth.py
└── requirements.txt

frontend/
├── src/
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

---

## 🔄 Execution Flow Example

**Prompt:** "Create a 15-question quiz from chapter 5 physics notes and assign it"

1. Frontend sends text → `POST /orchestrate`
2. FastAPI calls **Intent Agent**
3. Intent Agent returns structured intent:
   ```json
   {
     "intent_type": "quiz_creation",
     "source": "google_classroom",
     "target": "google_forms",
     "num_questions": 15
   }
   ```
4. FastAPI fetches notes from Classroom (service)
5. FastAPI calls **Quiz Agent** with notes
6. Quiz Agent returns MCQ JSON (via Gemini)
7. FastAPI creates Google Form quiz (service)
8. FastAPI assigns Form to Classroom (service)
9. Result sent back to frontend

---

## 🤖 Agents

### 1. Intent Agent
Converts raw language → structured intent using keyword/pattern matching (MVP). Future: Gemini integration.

### 2. Quiz Agent
Generates structured quiz questions from educational content using Gemini.

### 3. Learning Agent
Creates personalized learning paths from syllabus.

### 4. Analytics Agent
Analyzes quiz results and provides insights.

### 5. Workflow Agent
Optimizes schedules balancing deadlines and wellbeing.

---

## 🔌 API Endpoints

### `POST /orchestrate`

Main orchestration endpoint.

**Request:**
```json
{
  "prompt": "Create a 15-question quiz from chapter 5 physics notes",
  "user_token": "optional_oauth_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quiz created successfully with 15 questions",
  "data": {
    "form_url": "https://docs.google.com/forms/d/...",
    "form_id": "mock_form_123",
    "num_questions": 15,
    "assignment": {...}
  },
  "intent": {
    "intent_type": "quiz_creation",
    "source": "google_classroom",
    "target": "google_forms",
    "num_questions": 15,
    "confidence": 0.9
  }
}
```

---

## 🎭 MVP vs Production

### MVP (Current Implementation)
- ✅ Intent Agent: Keyword/pattern matching
- ✅ Quiz Agent: Gemini-powered (with mock fallback)
- ✅ Google Services: **MOCKED** (clearly labeled)
- ✅ Frontend: Basic React UI

### Production (Future)
- 🔄 Intent Agent: Gemini-powered intent parsing
- 🔄 Google Services: Real API integrations
- 🔄 OAuth2: Full authentication flow
- 🔄 Error handling: Comprehensive error recovery
- 🔄 Testing: Unit + integration tests

---

## 🧪 Testing

### Test Intent Detection
```bash
curl -X POST http://localhost:8000/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a 10 question quiz from my physics notes"}'
```

### Example Prompts
- "Create a 15-question quiz from chapter 5 physics notes and assign it"
- "Generate a learning plan from the syllabus"
- "Analyze quiz results from last week"
- "Optimize my schedule for next week"

---

## 📝 Environment Variables

Create `.env` file in `backend/` (optional for MVP):

```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_TEST_TOKEN=optional_oauth_token_for_testing
```

---

## 🎓 Key Design Principles

1. **Separation of Concerns**: Agents think, Orchestrator acts
2. **Clear Mock Boundaries**: All mocked services are clearly labeled
3. **Deterministic First**: Prefer pattern matching over LLMs where possible
4. **Explainable**: Code is well-commented and structured
5. **MVP-First**: Working system > perfect system

---

## 🚧 Current Status

- ✅ Core orchestration system
- ✅ Intent Agent (keyword-based MVP)
- ✅ Quiz Agent (Gemini-powered)
- ✅ Mock Google Workspace services
- ✅ Basic React frontend
- 🔄 Real Google API integrations (future)
- 🔄 OAuth2 authentication (future)
- 🔄 Additional agents (Learning, Analytics, Workflow - basic structure)

---

## 📄 License

MIT

---

## 🙋 FAQ

**Q: Why not just use Google Workspace directly?**  
A: Google Workspace gives tools. EduSphere adds an AI orchestration layer that connects them using intent, which Google does not currently provide for education workflows.

**Q: Do agents talk to each other?**  
A: No. All flows go through the FastAPI orchestrator. Agents are stateless functions.

**Q: Can I use this without Google APIs?**  
A: Yes, the MVP works with mocked services. Real integrations require Google API credentials.
