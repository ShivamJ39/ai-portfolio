from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Portfolio AI Assistant API",
    description="FastAPI backend providing AI-powered responses about Shivam's experience and projects.",
    version="1.0.0"
)

# Enable CORS for your portfolio frontend (e.g., Netlify, Vercel, or local development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace "*" with your domain e.g., ["https://yourportfolio.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Google GenAI Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY environment variable is missing!")

client = genai.Client(api_key=GEMINI_API_KEY)

# Portfolio Context Definition
PORTFOLIO_CONTEXT = """
You are Shivam's Personal AI Portfolio Assistant.
Answer questions accurately, concisely, and professionally using ONLY the background information provided below:

--- SHIVAM'S PROFILE ---
- Role: Full-Stack Developer & AI Systems Engineer
- Tech Stack: Python, FastAPI, JavaScript (Vanilla, React), Node.js, FAISS, Gemini API, Docker, Git
- Key Projects:
  1. AI PDF Assistant (RAG System):
     - Built a full-stack RAG system capable of processing 150+ page PDFs in seconds.
     - Tech: FastAPI, FAISS vector store, Google Gemini embeddings (`text-embedding-004`), Vanilla JS.
     - Features: Exponential backoff for 429 rate limits, dynamic port binding, model fallback strategies.
     - Live Deployment: Hosted backend on Render, frontend on Netlify Drop.
  2. Portfolio AI Chatbot:
     - FastAPI-powered conversational agent assisting recruiters directly on the portfolio website.
- Education & Experience:
  - Experienced in RESTful API design, rate-limiting strategies, and serverless/microservice deployments.
- Contact Details:
  - GitHub: https://github.com/ShivamJ39
  - Email: shivam@example.com

--- SYSTEM INSTRUCTIONS ---
- Keep responses concise (under 3-4 sentences unless requested otherwise).
- Be polite, enthusiastic, and professional.
- If a user asks something outside Shivam's experience/background, respond: "I don't have that specific information, but feel free to reach out to Shivam directly via email at shivam@example.com!"
"""

# Request & Response Schemas
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, example="What projects has Shivam built using FastAPI?")

class ChatResponse(BaseModel):
    answer: str

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Portfolio AI Assistant API is live"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_portfolio_ai(payload: ChatRequest):
    """
    Receives user question from portfolio UI, queries Gemini 3.6 Flash with context, 
    and returns an expert response.
    """
    user_query = payload.message.strip()
    
    if not user_query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Message field cannot be empty."
        )

    system_prompt = f"""
    {PORTFOLIO_CONTEXT}

    --- USER QUESTION ---
    {user_query}
    ---------------------
    """

    # Retry with model fallback in case of temporary model congestion
    models_to_try = ["gemini-3.6-flash", "gemini-2.5-flash"]
    
    for model in models_to_try:
        try:
            response = client.models.generate_content(
                model=model,
                contents=[system_prompt]
            )
            return ChatResponse(answer=response.text)
        except Exception as e:
            if "503" in str(e) or "UNAVAILABLE" in str(e):
                continue
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI Service Error: {str(e)}"
            )

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="AI service is currently busy. Please try again in a few seconds."
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)