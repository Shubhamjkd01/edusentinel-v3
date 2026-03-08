from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./edusentinel.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'professor' or 'student'
    email = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    enrollments = relationship("Enrollment", back_populates="student", foreign_keys="Enrollment.student_id")
    attendance_records = relationship("AttendanceRecord", back_populates="student")
    score_records = relationship("ScoreRecord", back_populates="student")
    risk_records = relationship("RiskRecord", back_populates="student")
    activity_enrollments = relationship("ActivityEnrollment", back_populates="student")
    learning_courses = relationship("LearningCourse", back_populates="student")


class Class(Base):
    __tablename__ = "classes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    professor_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    professor = relationship("User", foreign_keys=[professor_id])
    enrollments = relationship("Enrollment", back_populates="class_obj")


class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="enrollments", foreign_keys=[student_id])
    class_obj = relationship("Class", back_populates="enrollments")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    date = Column(String, nullable=False)
    present = Column(Boolean, default=True)

    student = relationship("User", back_populates="attendance_records")


class ScoreRecord(Base):
    __tablename__ = "score_records"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    title = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    score_type = Column(String, nullable=False)  # 'assignment' or 'exam'
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="score_records")


class RiskRecord(Base):
    __tablename__ = "risk_records"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    academic_risk = Column(Float, default=0.0)
    engagement_risk = Column(Float, default=0.0)
    overall_risk = Column(Float, default=0.0)
    risk_level = Column(String, default="Safe")
    computed_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="risk_records")


# ── NEW: Extracurricular Activities ──────────────────────────────────────────

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)   # Technology, Sports, Arts, etc.
    description = Column(Text, nullable=True)
    max_participants = Column(Integer, default=20)
    hours_per_week = Column(Float, default=2.0)
    icon = Column(String, default="🏆")
    created_at = Column(DateTime, default=datetime.utcnow)

    enrollments = relationship("ActivityEnrollment", back_populates="activity")


class ActivityEnrollment(Base):
    __tablename__ = "activity_enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    activity_id = Column(Integer, ForeignKey("activities.id"))
    xp_earned = Column(Integer, default=0)
    hours_logged = Column(Float, default=0.0)
    progress_pct = Column(Float, default=0.0)
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="activity_enrollments")
    activity = relationship("Activity", back_populates="enrollments")


# ── NEW: Self-Learning Courses ────────────────────────────────────────────────

class LearningCourse(Base):
    __tablename__ = "learning_courses"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    platform = Column(String, nullable=False)   # Coursera, edX, NPTEL, etc.
    category = Column(String, nullable=False)
    progress_pct = Column(Float, default=0.0)
    rating = Column(Float, default=0.0)
    completed = Column(Boolean, default=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="learning_courses")


def create_tables():
    Base.metadata.create_all(bind=engine)
