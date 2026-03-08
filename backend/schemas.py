from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: str
    user_id: int


class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    email: Optional[str]

    class Config:
        from_attributes = True


# ── Classes ───────────────────────────────────────────────────────────────────

class ClassCreate(BaseModel):
    name: str
    subject: str


class ClassOut(BaseModel):
    id: int
    name: str
    subject: str
    professor_id: int

    class Config:
        from_attributes = True


# ── Attendance ────────────────────────────────────────────────────────────────

class AttendanceItem(BaseModel):
    student_id: int
    present: bool


class AttendanceUpload(BaseModel):
    class_id: int
    date: str
    records: List[AttendanceItem]


# ── Scores ────────────────────────────────────────────────────────────────────

class ScoreItem(BaseModel):
    student_id: int
    score: float


class ScoreUpload(BaseModel):
    class_id: int
    title: str
    score_type: str  # 'assignment' or 'exam'
    records: List[ScoreItem]


# ── Risk ──────────────────────────────────────────────────────────────────────

class RiskOut(BaseModel):
    student_id: int
    student_name: str
    username: str
    attendance_pct: float
    avg_assignment_score: float
    avg_exam_score: float
    academic_risk: float
    engagement_risk: float
    overall_risk: float
    risk_level: str
    xp_points: int

    class Config:
        from_attributes = True


class StudentDashboard(BaseModel):
    student: UserOut
    classes: list
    overall_attendance: float
    overall_assignment_avg: float
    overall_exam_avg: float
    academic_risk: float
    engagement_risk: float
    overall_risk: float
    risk_level: str
    xp_points: int
    activities: list
    learning_courses: list


# ── Activities ────────────────────────────────────────────────────────────────

class ActivityCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = ""
    max_participants: int = 20
    hours_per_week: float = 2.0
    icon: str = "🏆"


class ActivityOut(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str]
    max_participants: int
    hours_per_week: float
    icon: str
    participant_count: int = 0

    class Config:
        from_attributes = True


class ActivityEnrollRequest(BaseModel):
    activity_id: int
    student_id: Optional[int] = None  # professor can enroll specific student


# ── Learning Courses ──────────────────────────────────────────────────────────

class LearningCourseCreate(BaseModel):
    title: str
    platform: str
    category: str
    progress_pct: float = 0.0
    rating: float = 0.0


class LearningCourseOut(BaseModel):
    id: int
    title: str
    platform: str
    category: str
    progress_pct: float
    rating: float
    completed: bool

    class Config:
        from_attributes = True
