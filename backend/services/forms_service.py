"""Google Forms Service.

Important: This service must NOT block FastAPI startup.

Behavior:
- If a valid token exists (token.json), use it and create real Forms.
- If not authorized, return a mock form URL and include an auth URL so the user can authorize later.
- Uses env vars from backend/.env when present:
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - GOOGLE_REDIRECT_URI
"""

import os
from typing import List, Dict, Optional, Any


SCOPES = ["https://www.googleapis.com/auth/forms.body"]


class FormsService:
    def __init__(self):
        self.creds = None
        self._auth_url: Optional[str] = None
        self._is_ready = False
        self._try_load_token()

    def _try_load_token(self) -> None:
        """Load token.json if available. Never prompts."""
        try:
            from google.oauth2.credentials import Credentials
        except Exception:
            # Google libs might not be installed; we will operate in mock mode.
            self.creds = None
            self._is_ready = False
            return

        if os.path.exists("token.json"):
            try:
                self.creds = Credentials.from_authorized_user_file("token.json", SCOPES)
                self._is_ready = True
            except Exception:
                self.creds = None
                self._is_ready = False

    def get_authorization_url(self) -> Optional[str]:
        """Return an authorization URL (no prompting), if we can construct one."""
        if self._auth_url:
            return self._auth_url

        try:
            from google_auth_oauthlib.flow import Flow
        except Exception:
            return None

        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI") or "http://localhost:8000/auth/google/callback"

        # Prefer env-based client config (matches your .env)
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

        try:
            if client_id and client_secret:
                client_config: Dict[str, Any] = {
                    "web": {
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": [redirect_uri],
                    }
                }
                flow = Flow.from_client_config(client_config, scopes=SCOPES, redirect_uri=redirect_uri)
            elif os.path.exists("credentials.json"):
                flow = Flow.from_client_secrets_file("credentials.json", scopes=SCOPES, redirect_uri=redirect_uri)
            else:
                return None

            auth_url, _ = flow.authorization_url(
                access_type="offline",
                include_granted_scopes="true",
                prompt="consent",
            )
            self._auth_url = auth_url
            return auth_url
        except Exception:
            return None

    def create_quiz_form(self, title: str, questions) -> Dict:
        """Compatibility wrapper expected by main.py (questions may be Pydantic models)."""
        normalized_questions: List[Dict[str, Any]] = []
        print(f"[FormsService] create_quiz_form called with {len(questions)} questions")
        for i, q in enumerate(questions):
            if isinstance(q, dict):
                normalized_questions.append(q)
                print(f"[FormsService] Q{i+1} (dict): {q.get('question', 'N/A')[:40]}...")
            else:
                # Pydantic v2 model
                dump = getattr(q, "model_dump", None)
                q_dict = dump() if callable(dump) else q.__dict__
                normalized_questions.append(q_dict)
                print(f"[FormsService] Q{i+1} (model): {q_dict.get('question', 'N/A')[:40]}...")
        print(f"[FormsService] Normalized {len(normalized_questions)} questions")
        return self.create_quiz(title, normalized_questions)

    def create_quiz(self, title: str, questions: List[Dict[str, Any]]) -> Dict:
        """Create a Google Form if authorized; otherwise return a safe mock response."""

        # If not ready, do NOT block. Provide auth URL and return mock.
        if not self._is_ready or self.creds is None:
            auth_url = self.get_authorization_url()
            return {
                "form_id": "mock_form_id",
                "form_url": "https://docs.google.com/forms/d/mock_form_id/viewform",
                "auth_required": True,
                "auth_url": auth_url,
                "note": "Google Forms is not authorized yet. Use auth_url to authorize, then restart backend.",
            }

        # Authorized: attempt real create
        try:
            from googleapiclient.discovery import build
        except Exception:
            # Google API client not available -> fall back
            auth_url = self.get_authorization_url()
            return {
                "form_id": "mock_form_id",
                "form_url": "https://docs.google.com/forms/d/mock_form_id/viewform",
                "auth_required": True,
                "auth_url": auth_url,
                "note": "google-api-python-client not available. Install it to create real Forms.",
            }

        service = build("forms", "v1", credentials=self.creds)

        # Google Forms API requires info.title structure
        new_form = {
            "info": {
                "title": title,
                "documentTitle": title,
            }
        }
        form = service.forms().create(body=new_form).execute()
        form_id = form["formId"]
        
        print(f"[FormsService] Created form with ID: {form_id}")
        print(f"[FormsService] Adding {len(questions)} questions...")

        # Add questions using batchUpdate
        requests = []
        for idx, q in enumerate(questions):
            question_text = q.get("question", "Question")
            options = q.get("options", [])
            
            print(f"[FormsService] Question {idx + 1}: {question_text[:50]}... with {len(options)} options")
            
            if not options:
                print(f"[FormsService] WARNING: Question {idx + 1} has no options!")
                continue
                
            requests.append({
                "createItem": {
                    "item": {
                        "title": question_text,
                        "questionItem": {
                            "question": {
                                "required": True,
                                "choiceQuestion": {
                                    "type": "RADIO",
                                    "options": [{"value": str(opt)} for opt in options],
                                    "shuffle": False,
                                },
                            }
                        },
                    },
                    "location": {"index": idx},
                }
            })
        
        if requests:
            print(f"[FormsService] Sending batchUpdate with {len(requests)} requests...")
            try:
                result = service.forms().batchUpdate(
                    formId=form_id,
                    body={"requests": requests},
                ).execute()
                print(f"[FormsService] batchUpdate succeeded: {len(result.get('replies', []))} replies")
            except Exception as batch_error:
                print(f"[FormsService] batchUpdate FAILED: {batch_error}")
                # Still return the form URL even if questions failed
        else:
            print("[FormsService] WARNING: No valid questions to add!")

        return {
            "form_id": form_id,
            "form_url": f"https://docs.google.com/forms/d/{form_id}/viewform",
            "auth_required": False,
            "questions_added": len(requests),
        }
