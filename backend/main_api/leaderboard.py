from sqlalchemy.orm import Session
from models import User


def _ranked_learners(db: Session) -> list:
    # Admins manage the platform and are not competitors, so they are neither listed nor counted
    # when ranking learners.
    return db.query(User).filter(User.role != "admin").order_by(User.xp.desc(), User.id).all()


def get_leaderboard_data(db: Session) -> list:
    users = _ranked_learners(db)
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
    """Rank among learners; 0 for a user who is not on the leaderboard (an admin)."""
    users = _ranked_learners(db)
    current_rank = 1
    for i, user in enumerate(users):
        if i > 0 and user.xp < users[i-1].xp:
            current_rank = i + 1
        if user.id == user_id:
            return current_rank
    return 0
