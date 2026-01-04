export type AgentKey = 'intent' | 'content' | 'quiz' | 'forms' | 'classroom'
export type AgentStatus = 'pending' | 'running' | 'completed' | 'error'

export type IntentOutput = {
  intent_type: 'quiz_creation' | 'learning_plan' | 'analytics' | 'scheduling'
  source: 'google_classroom' | 'google_docs' | 'manual_text'
  target: 'google_forms' | 'google_classroom' | 'google_calendar'
  num_questions?: number | null
  confidence: number
}

export type ContentOutput = {
  key_topics: string[]
  summary: string
}

export type DeliveryOutput = {
  delivery_status: string
  platform: string
  mode: string
  message: string
  assignment_id?: string
  classroom_url?: string
}

export type QuizQuestion = {
  question: string
  options: string[]
  correct_answer: string
}

export type OrchestrateResponse = {
  success: boolean
  message: string
  data?: {
    form_url?: string
    form_id?: string
    questions?: QuizQuestion[]
    content?: ContentOutput
    delivery?: DeliveryOutput
    intent?: IntentOutput
    [key: string]: any
  }
  intent?: IntentOutput
  total_duration?: number
}

export type OrchestrateRequest = {
  prompt: string
  user_token?: string | null
}

// SSE event types
export type AgentStartEvent = {
  agent: AgentKey
  message: string
}

export type AgentCompleteEvent = {
  agent: AgentKey
  duration: number
  result: any
}

export type StreamCompleteEvent = OrchestrateResponse & {
  total_duration: number
}

export type StreamErrorEvent = {
  message: string
}

// History item for sidebar
export type HistoryItem = {
  id: string
  prompt: string
  timestamp: Date
  success: boolean
  formUrl?: string
  questionCount?: number
}
