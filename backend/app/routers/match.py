from fastapi import APIRouter
from app.models.assignment import MatchRequest, MatchResponse, Assignment
from app.services import firestore, matcher, gemini, notifications

router = APIRouter(prefix="/api/match", tags=["match"])

@router.post("/", response_model=MatchResponse)
async def create_match(request: MatchRequest):
    need = await firestore.get_need(request.need_id)
    volunteers = await firestore.get_available_volunteers()
    
    top_matches = await matcher.find_best_matches(need, volunteers, top_n=3)
    
    assignments = []
    for volunteer, score in top_matches:
        briefing = await gemini.generate_task_briefing(need, volunteer)
        distance = matcher.haversine_km(need.lat or 0, need.lng or 0, volunteer.lat, volunteer.lng)
        
        assignment = Assignment(
            need_id=need.id or request.need_id,
            volunteer_id=volunteer.id or "",
            match_score=score,
            task_briefing=briefing,
            estimated_distance_km=round(distance, 1)
        )
        
        assignment_id = await firestore.save_assignment(assignment)
        assignment.id = assignment_id
        assignments.append(assignment)
        
        if volunteer.device_token:
            notifications.send_task_notification(
                device_token=volunteer.device_token,
                task_briefing=briefing,
                need_type=need.need_type,
                need_id=need.id or request.need_id
            )
            
    return MatchResponse(assignments=assignments, need=need)
