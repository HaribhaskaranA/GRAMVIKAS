"""
GRAMVIKAS AI - Multilingual RAG Assistant Router.
Provides AI grounded question-answering with strict citations and sample prompts.
"""

from fastapi import APIRouter, Depends
from typing import Optional, Dict, Any
from backend.models.schemas import AssistantChatRequest, AssistantChatResponse
from backend.services.ai_rag import ai_assistant
from backend.dependencies import get_optional_user

router = APIRouter(prefix="/api/assistant", tags=["AI Assistant"])

@router.post("/chat", response_model=AssistantChatResponse)
async def chat_with_assistant(
    req: AssistantChatRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    return await ai_assistant.answer_query(req, current_user=current_user)

@router.get("/sample-questions")
async def get_sample_questions():
    return {
        "en": [
            "Am I eligible for PM-KISAN 6000 annual subsidy as a small farmer?",
            "What are the documents needed for Kalaignar Kanavu Illam housing scheme?",
            "How do I apply for a 100-day MGNREGA work job card in my village?",
            "What is the current status of the drinking water pipeline in Melmaruvathur?",
            "Can a girl student who studied in government school get 1000 monthly college aid?"
        ],
        "ta": [
            "சிறு விவசாயியான எனக்கு பிரதம மந்திரி கிசான் ₹6000 உதவித்தொகை கிடைக்குமா?",
            "கலைஞர் கனவு இல்லம் கான்கிரீட் வீடு கட்ட என்னென்ன ஆவணங்கள் தேவை?",
            "எங்கள் ஊராட்சியில் 100 நாள் வேலை அட்டை (Job Card) பெற எப்படி விண்ணப்பிப்பது?",
            "மேல்மருவத்தூர் கிராம குடிநீர் திட்டப் பணிகளின் தற்போதைய நிலை என்ன?",
            "அரசுப் பள்ளியில் படித்த கல்லூரி மாணவிக்கு மாதம் ₹1,000 உதவித்தொகை கிடைக்குமா?"
        ],
        "hi": [
            "क्या मैं एक छोटे किसान के रूप में पीएम-किसान ₹6000 सहायता के लिए पात्र हूँ?",
            "कलैग्नार कनावु इल्लम योजना के तहत पक्का घर पाने के लिए कौन से दस्तावेज चाहिए?",
            "मनरेगा 100-दिवसीय जॉब कार्ड बनवाने के लिए क्या प्रक्रिया है?",
            "मेलमरुवथुर में पेयजल पाइपलाइन परियोजना की वर्तमान प्रगति क्या है?",
            "सरकारी स्कूल से 12वीं पास कॉलेज छात्राओं के लिए मासिक ₹1000 सहायता कैसे प्राप्त करें?"
        ]
    }
