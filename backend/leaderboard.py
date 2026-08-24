from sqlalchemy.orm import Session
from models import User

def get_leaderboard_data(db: Session) -> list:
    users = db.query(User).order_by(User.xp.desc()).all()
    leaderboard = []
    current_rank = 1
    for i, user in enumerate(users):
        if i > 0 and user.xp < users[i-1].xp:
            current_rank = i + 1
        leaderboard.append({
            "id": user.id,
            "name": user.name,
            "xp": user.xp,
            "rank": current_rank
        })
    return leaderboard

def get_user_rank(db: Session, user_id: int) -> int:
    users = db.query(User).order_by(User.xp.desc()).all()
    current_rank = 1
    for i, user in enumerate(users):
        if i > 0 and user.xp < users[i-1].xp:
            current_rank = i + 1
        if user.id == user_id:
            return current_rank
    return 0
