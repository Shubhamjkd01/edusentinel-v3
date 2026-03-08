from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from database import (
    get_db, create_tables, User, Class, Enrollment,
    AttendanceRecord, ScoreRecord, RiskRecord,
    Activity, ActivityEnrollment, LearningCourse,
)
from auth import (
    hash_password, verify_password, create_token,
    get_current_user, require_professor, require_student,
)
from schemas import (
    LoginRequest, TokenResponse, UserOut,
    ClassCreate, ClassOut,
    AttendanceUpload, ScoreUpload,
    RiskOut, StudentDashboard,
    ActivityCreate, ActivityOut, ActivityEnrollRequest,
    LearningCourseCreate, LearningCourseOut,
)
from risk_predictor import predict_risk

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(title="EduSentinel API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_tables()


# ── AUTH ──────────────────────────────────────────────────────────────────────

@app.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_token({"sub": user.username, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "full_name": user.full_name,
        "user_id": user.id,
    }


@app.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/health")
def health():
    return {"status": "ok", "service": "EduSentinel API v3"}


# ── CLASSES ───────────────────────────────────────────────────────────────────

@app.get("/classes", response_model=List[ClassOut])
def get_classes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "professor":
        return db.query(Class).filter(Class.professor_id == current_user.id).all()
    else:
        enrolled_ids = [e.class_id for e in db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id).all()]
        return db.query(Class).filter(Class.id.in_(enrolled_ids)).all()


@app.post("/classes", response_model=ClassOut)
def create_class(
    data: ClassCreate,
    professor: User = Depends(require_professor),
    db: Session = Depends(get_db),
):
    cls = Class(name=data.name, subject=data.subject, professor_id=professor.id)
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return cls


# ── STUDENTS ──────────────────────────────────────────────────────────────────

@app.get("/students", response_model=List[UserOut])
def get_students(
    _: User = Depends(require_professor),
    db: Session = Depends(get_db),
):
    return db.query(User).filter(User.role == "student").all()


@app.post("/enroll")
def enroll_student(
    student_id: int,
    class_id: int,
    _: User = Depends(require_professor),
    db: Session = Depends(get_db),
):
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.class_id == class_id,
    ).first()
    if existing:
        return {"message": "Already enrolled"}
    db.add(Enrollment(student_id=student_id, class_id=class_id))
    db.commit()
    return {"message": "Enrolled successfully"}


# ── ATTENDANCE ────────────────────────────────────────────────────────────────

@app.post("/upload_attendance")
def upload_attendance(
    data: AttendanceUpload,
    _: User = Depends(require_professor),
    db: Session = Depends(get_db),
):
    for item in data.records:
        existing = db.query(AttendanceRecord).filter(
            AttendanceRecord.student_id == item.student_id,
            AttendanceRecord.class_id == data.class_id,
            AttendanceRecord.date == data.date,
        ).first()
        if existing:
            existing.present = item.present
        else:
            db.add(AttendanceRecord(
                student_id=item.student_id,
                class_id=data.class_id,
                date=data.date,
                present=item.present,
            ))
    db.commit()
    # Recompute risk for all affected students
    for item in data.records:
        _recompute_risk(item.student_id, data.class_id, db)
    return {"message": f"Attendance saved for {len(data.records)} students"}


# ── SCORES ────────────────────────────────────────────────────────────────────

@app.post("/upload_scores")
def upload_scores(
    data: ScoreUpload,
    _: User = Depends(require_professor),
    db: Session = Depends(get_db),
):
    for item in data.records:
        db.add(ScoreRecord(
            student_id=item.student_id,
            class_id=data.class_id,
            title=data.title,
            score=item.score,
            score_type=data.score_type,
        ))
    db.commit()
    for item in data.records:
        _recompute_risk(item.student_id, data.class_id, db)
    return {"message": f"Scores saved for {len(data.records)} students"}


# ── RISK ENGINE ───────────────────────────────────────────────────────────────

def _get_student_stats(student_id: int, class_id: int, db: Session):
    att_records = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == student_id,
        AttendanceRecord.class_id == class_id,
    ).all()
    att_pct = (sum(1 for r in att_records if r.present) / len(att_records) * 100) if att_records else 0.0

    asgn_scores = [r.score for r in db.query(ScoreRecord).filter(
        ScoreRecord.student_id == student_id,
        ScoreRecord.class_id == class_id,
        ScoreRecord.score_type == "assignment",
    ).all()]
    avg_asgn = sum(asgn_scores) / len(asgn_scores) if asgn_scores else 0.0

    exam_scores = [r.score for r in db.query(ScoreRecord).filter(
        ScoreRecord.student_id == student_id,
        ScoreRecord.class_id == class_id,
        ScoreRecord.score_type == "exam",
    ).all()]
    avg_exam = sum(exam_scores) / len(exam_scores) if exam_scores else 0.0

    return att_pct, avg_asgn, avg_exam


def _recompute_risk(student_id: int, class_id: int, db: Session):
    att_pct, avg_asgn, avg_exam = _get_student_stats(student_id, class_id, db)
    result = predict_risk(att_pct, avg_asgn, avg_exam)

    existing = db.query(RiskRecord).filter(
        RiskRecord.student_id == student_id,
        RiskRecord.class_id == class_id,
    ).first()
    if existing:
        existing.academic_risk   = result["academic_risk"]
        existing.engagement_risk = result["engagement_risk"]
        existing.overall_risk    = result["overall_risk"]
        existing.risk_level      = result["risk_level"]
        existing.computed_at     = datetime.utcnow()
    else:
        db.add(RiskRecord(
            student_id=student_id,
            class_id=class_id,
            academic_risk=result["academic_risk"],
            engagement_risk=result["engagement_risk"],
            overall_risk=result["overall_risk"],
            risk_level=result["risk_level"],
        ))
    db.commit()


@app.get("/get_student_data/{class_id}")
def get_student_data(
    class_id: int,
    _: User = Depends(require_professor),
    db: Session = Depends(get_db),
):
    enrollments = db.query(Enrollment).filter(Enrollment.class_id == class_id).all()
    result = []
    for enr in enrollments:
        student = db.query(User).filter(User.id == enr.student_id).first()
        att_pct, avg_asgn, avg_exam = _get_student_stats(enr.student_id, class_id, db)
        risk_rec = db.query(RiskRecord).filter(
            RiskRecord.student_id == enr.student_id,
            RiskRecord.class_id == class_id,
        ).first()

        # XP from activities
        xp = db.query(func.sum(ActivityEnrollment.xp_earned)).filter(
            ActivityEnrollment.student_id == enr.student_id
        ).scalar() or 0

        result.append({
            "student_id": student.id,
            "student_name": student.full_name,
            "username": student.username,
            "attendance_pct": round(att_pct, 1),
            "avg_assignment_score": round(avg_asgn, 1),
            "avg_exam_score": round(avg_exam, 1),
            "academic_risk": risk_rec.academic_risk if risk_rec else 0,
            "engagement_risk": risk_rec.engagement_risk if risk_rec else 0,
            "overall_risk": risk_rec.overall_risk if risk_rec else 0,
            "risk_level": risk_rec.risk_level if risk_rec else "Unknown",
            "xp_points": xp,
        })
    return result


# ── STUDENT DASHBOARD ─────────────────────────────────────────────────────────

@app.get("/student/dashboard")
def student_dashboard(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    enrolled_classes = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id
    ).all()

    class_data = []
    total_att, total_asgn, total_exam = [], [], []

    for enr in enrolled_classes:
        cls = db.query(Class).filter(Class.id == enr.class_id).first()
        att_pct, avg_asgn, avg_exam = _get_student_stats(current_user.id, enr.class_id, db)
        total_att.append(att_pct)
        total_asgn.append(avg_asgn)
        total_exam.append(avg_exam)

        # Score breakdown
        assignments = [
            {"title": r.title, "score": r.score}
            for r in db.query(ScoreRecord).filter(
                ScoreRecord.student_id == current_user.id,
                ScoreRecord.class_id == enr.class_id,
                ScoreRecord.score_type == "assignment",
            ).all()
        ]
        exams = [
            {"title": r.title, "score": r.score}
            for r in db.query(ScoreRecord).filter(
                ScoreRecord.student_id == current_user.id,
                ScoreRecord.class_id == enr.class_id,
                ScoreRecord.score_type == "exam",
            ).all()
        ]

        risk_rec = db.query(RiskRecord).filter(
            RiskRecord.student_id == current_user.id,
            RiskRecord.class_id == enr.class_id,
        ).first()

        class_data.append({
            "class_id": cls.id,
            "class_name": cls.name,
            "subject": cls.subject,
            "attendance_pct": round(att_pct, 1),
            "avg_assignment": round(avg_asgn, 1),
            "avg_exam": round(avg_exam, 1),
            "risk_level": risk_rec.risk_level if risk_rec else "Unknown",
            "overall_risk": risk_rec.overall_risk if risk_rec else 0,
            "assignments": assignments,
            "exams": exams,
        })

    overall_att  = round(sum(total_att) / len(total_att), 1) if total_att else 0
    overall_asgn = round(sum(total_asgn) / len(total_asgn), 1) if total_asgn else 0
    overall_exam = round(sum(total_exam) / len(total_exam), 1) if total_exam else 0
    risk_result  = predict_risk(overall_att, overall_asgn, overall_exam)

    # Activities
    activities = []
    for ae in db.query(ActivityEnrollment).filter(ActivityEnrollment.student_id == current_user.id).all():
        act = db.query(Activity).filter(Activity.id == ae.activity_id).first()
        activities.append({
            "activity_id": act.id,
            "name": act.name,
            "category": act.category,
            "icon": act.icon,
            "hours_per_week": act.hours_per_week,
            "xp_earned": ae.xp_earned,
            "progress_pct": ae.progress_pct,
        })

    # XP total
    xp_total = sum(a["xp_earned"] for a in activities)

    # Learning courses
    courses = [
        {
            "id": c.id,
            "title": c.title,
            "platform": c.platform,
            "category": c.category,
            "progress_pct": c.progress_pct,
            "rating": c.rating,
            "completed": c.completed,
        }
        for c in db.query(LearningCourse).filter(LearningCourse.student_id == current_user.id).all()
    ]

    return {
        "student": {"id": current_user.id, "username": current_user.username, "full_name": current_user.full_name},
        "classes": class_data,
        "overall_attendance": overall_att,
        "overall_assignment_avg": overall_asgn,
        "overall_exam_avg": overall_exam,
        "academic_risk": risk_result["academic_risk"],
        "engagement_risk": risk_result["engagement_risk"],
        "overall_risk": risk_result["overall_risk"],
        "risk_level": risk_result["risk_level"],
        "xp_points": xp_total,
        "activities": activities,
        "learning_courses": courses,
    }


# ── ACTIVITIES ────────────────────────────────────────────────────────────────

@app.get("/activities")
def get_activities(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    acts = db.query(Activity).all()
    result = []
    for a in acts:
        count = db.query(ActivityEnrollment).filter(ActivityEnrollment.activity_id == a.id).count()
        result.append({
            "id": a.id, "name": a.name, "category": a.category,
            "description": a.description, "max_participants": a.max_participants,
            "hours_per_week": a.hours_per_week, "icon": a.icon,
            "participant_count": count,
        })
    return result


@app.post("/activities")
def create_activity(
    data: ActivityCreate,
    _: User = Depends(require_professor),
    db: Session = Depends(get_db),
):
    act = Activity(**data.dict())
    db.add(act)
    db.commit()
    db.refresh(act)
    return act


@app.post("/activities/enroll")
def enroll_activity(
    req: ActivityEnrollRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student_id = req.student_id if (current_user.role == "professor" and req.student_id) else current_user.id
    existing = db.query(ActivityEnrollment).filter(
        ActivityEnrollment.student_id == student_id,
        ActivityEnrollment.activity_id == req.activity_id,
    ).first()
    if existing:
        return {"message": "Already enrolled"}
    db.add(ActivityEnrollment(student_id=student_id, activity_id=req.activity_id, xp_earned=0))
    db.commit()
    return {"message": "Enrolled in activity"}


# ── LEARNING COURSES ──────────────────────────────────────────────────────────

@app.get("/learning/courses")
def get_my_courses(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    return db.query(LearningCourse).filter(LearningCourse.student_id == current_user.id).all()


@app.post("/learning/courses")
def add_course(
    data: LearningCourseCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    course = LearningCourse(student_id=current_user.id, **data.dict())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@app.put("/learning/courses/{course_id}")
def update_course_progress(
    course_id: int,
    progress_pct: float,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    course = db.query(LearningCourse).filter(
        LearningCourse.id == course_id,
        LearningCourse.student_id == current_user.id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.progress_pct = progress_pct
    course.completed = progress_pct >= 100
    db.commit()
    return {"message": "Progress updated", "completed": course.completed}


# ── LEADERBOARD ───────────────────────────────────────────────────────────────

@app.get("/leaderboard")
def get_leaderboard(
    class_id: Optional[int] = None,
    _: User = Depends(require_professor),
    db: Session = Depends(get_db),
):
    students = db.query(User).filter(User.role == "student").all()
    result = []
    for s in students:
        xp = db.query(func.sum(ActivityEnrollment.xp_earned)).filter(
            ActivityEnrollment.student_id == s.id
        ).scalar() or 0
        # academic average across all classes
        asgn_avg_all = db.query(func.avg(ScoreRecord.score)).filter(
            ScoreRecord.student_id == s.id,
            ScoreRecord.score_type == "assignment",
        ).scalar() or 0
        exam_avg_all = db.query(func.avg(ScoreRecord.score)).filter(
            ScoreRecord.student_id == s.id,
            ScoreRecord.score_type == "exam",
        ).scalar() or 0
        result.append({
            "student_id": s.id,
            "student_name": s.full_name,
            "username": s.username,
            "xp_points": xp,
            "academic_avg": round((asgn_avg_all * 0.4 + exam_avg_all * 0.6), 1),
        })
    return sorted(result, key=lambda x: x["xp_points"], reverse=True)


# ── DIRECT RISK PREDICT ───────────────────────────────────────────────────────

@app.post("/predict_risk")
def direct_predict(
    attendance_pct: float,
    avg_assignment: float,
    avg_exam: float,
    _: User = Depends(get_current_user),
):
    return predict_risk(attendance_pct, avg_assignment, avg_exam)
