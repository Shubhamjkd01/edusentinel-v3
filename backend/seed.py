"""
Seed the database with realistic Indian student/professor data.
Run: python seed.py
"""
from database import SessionLocal, create_tables, User, Class, Enrollment, AttendanceRecord, ScoreRecord, RiskRecord, Activity, ActivityEnrollment, LearningCourse
from auth import hash_password
from risk_predictor import predict_risk
from datetime import datetime, timedelta
import random

random.seed(42)

create_tables()
db = SessionLocal()

# ── Clear existing data ───────────────────────────────────────────────────────
for model in [LearningCourse, ActivityEnrollment, Activity, RiskRecord, ScoreRecord, AttendanceRecord, Enrollment, Class, User]:
    db.query(model).delete()
db.commit()
print("🗑️  Cleared existing data")

# ── Professors ────────────────────────────────────────────────────────────────
professors = [
    {"username": "prof_sharma",  "full_name": "Dr. Rajesh Sharma",   "password": "teach@123", "email": "r.sharma@edu.in"},
    {"username": "prof_verma",   "full_name": "Prof. Anita Verma",   "password": "teach@123", "email": "a.verma@edu.in"},
    {"username": "prof_mehta",   "full_name": "Dr. Suresh Mehta",    "password": "teach@123", "email": "s.mehta@edu.in"},
]
prof_objs = []
for p in professors:
    u = User(username=p["username"], full_name=p["full_name"], password_hash=hash_password(p["password"]),
             role="professor", email=p["email"])
    db.add(u)
    prof_objs.append(u)
db.commit()
print(f"✅ Created {len(prof_objs)} professors")

# ── Students ──────────────────────────────────────────────────────────────────
students_data = [
    # At-risk students (low attendance + scores)
    {"username": "aarav.sharma",    "full_name": "Aarav Sharma",    "password": "student@123", "att": 42, "asgn": 35, "exam": 28, "xp": 340},
    {"username": "rohan.gupta",     "full_name": "Rohan Gupta",     "password": "student@123", "att": 38, "asgn": 30, "exam": 25, "xp": 280},
    {"username": "arjun.mishra",    "full_name": "Arjun Mishra",    "password": "student@123", "att": 48, "asgn": 37, "exam": 32, "xp": 190},
    {"username": "vivek.joshi",     "full_name": "Vivek Joshi",     "password": "student@123", "att": 55, "asgn": 42, "exam": 38, "xp": 410},
    {"username": "karan.mehra",     "full_name": "Karan Mehra",     "password": "student@123", "att": 60, "asgn": 50, "exam": 44, "xp": 520},
    # Safe students (good attendance + scores)
    {"username": "priya.patel",     "full_name": "Priya Patel",     "password": "student@123", "att": 92, "asgn": 85, "exam": 78, "xp": 920},
    {"username": "ananya.singh",    "full_name": "Ananya Singh",    "password": "student@123", "att": 90, "asgn": 80, "exam": 75, "xp": 860},
    {"username": "kavya.reddy",     "full_name": "Kavya Reddy",     "password": "student@123", "att": 95, "asgn": 90, "exam": 88, "xp": 1100},
    {"username": "pooja.agarwal",   "full_name": "Pooja Agarwal",   "password": "student@123", "att": 85, "asgn": 70, "exam": 65, "xp": 610},
    {"username": "sneha.iyer",      "full_name": "Sneha Iyer",      "password": "student@123", "att": 91, "asgn": 83, "exam": 79, "xp": 870},
    {"username": "aditya.kumar",    "full_name": "Aditya Kumar",    "password": "student@123", "att": 88, "asgn": 74, "exam": 68, "xp": 680},
    {"username": "nisha.pandey",    "full_name": "Nisha Pandey",    "password": "student@123", "att": 82, "asgn": 72, "exam": 67, "xp": 640},
    {"username": "siddharth.rao",   "full_name": "Siddharth Rao",   "password": "student@123", "att": 87, "asgn": 76, "exam": 71, "xp": 790},
    {"username": "divya.nair",      "full_name": "Divya Nair",      "password": "student@123", "att": 78, "asgn": 68, "exam": 62, "xp": 750},
    {"username": "harsh.bhatt",     "full_name": "Harsh Bhatt",     "password": "student@123", "att": 94, "asgn": 88, "exam": 84, "xp": 960},
]
student_objs = []
for s in students_data:
    u = User(username=s["username"], full_name=s["full_name"],
             password_hash=hash_password(s["password"]), role="student")
    db.add(u)
    student_objs.append((u, s))
db.commit()
print(f"✅ Created {len(student_objs)} students")

# ── Classes ───────────────────────────────────────────────────────────────────
classes_data = [
    {"name": "CS101 - Introduction to Programming",   "subject": "Computer Science",  "prof": 0},
    {"name": "MATH201 - Calculus II",                 "subject": "Mathematics",        "prof": 1},
    {"name": "PHY301 - Physics for Engineers",        "subject": "Physics",            "prof": 2},
    {"name": "ENG102 - Technical Writing",            "subject": "English",            "prof": 0},
]
class_objs = []
for c in classes_data:
    cls = Class(name=c["name"], subject=c["subject"], professor_id=prof_objs[c["prof"]].id)
    db.add(cls)
    class_objs.append(cls)
db.commit()
print(f"✅ Created {len(class_objs)} classes")

# ── Enroll all students in all classes ───────────────────────────────────────
for u_obj, _ in student_objs:
    for cls in class_objs:
        db.add(Enrollment(student_id=u_obj.id, class_id=cls.id))
db.commit()
print("✅ Enrolled all students in all classes")

# ── Attendance (30 days per class) ────────────────────────────────────────────
today = datetime.today()
for u_obj, sdata in student_objs:
    att_rate = sdata["att"] / 100.0
    for cls in class_objs:
        for day_offset in range(30):
            date_str = (today - timedelta(days=30 - day_offset)).strftime("%Y-%m-%d")
            present = random.random() < att_rate
            db.add(AttendanceRecord(student_id=u_obj.id, class_id=cls.id,
                                    date=date_str, present=present))
db.commit()
print("✅ Seeded 30 days of attendance")

# ── Scores (3 assignments + 2 exams per class) ────────────────────────────────
for u_obj, sdata in student_objs:
    noise = lambda base: round(min(100, max(0, base + random.uniform(-8, 8))), 1)
    for cls in class_objs:
        for i in range(1, 4):
            db.add(ScoreRecord(student_id=u_obj.id, class_id=cls.id,
                               title=f"Assignment {i}", score=noise(sdata["asgn"]),
                               score_type="assignment"))
        for i, label in enumerate(["Midterm", "Final"]):
            db.add(ScoreRecord(student_id=u_obj.id, class_id=cls.id,
                               title=label, score=noise(sdata["exam"]),
                               score_type="exam"))
db.commit()
print("✅ Seeded scores")

# ── Risk records ──────────────────────────────────────────────────────────────
from sqlalchemy import func
for u_obj, sdata in student_objs:
    for cls in class_objs:
        att_recs = db.query(AttendanceRecord).filter(
            AttendanceRecord.student_id == u_obj.id,
            AttendanceRecord.class_id == cls.id).all()
        att_pct = (sum(1 for r in att_recs if r.present) / len(att_recs) * 100) if att_recs else 0

        asgn_scores = [r.score for r in db.query(ScoreRecord).filter(
            ScoreRecord.student_id == u_obj.id, ScoreRecord.class_id == cls.id,
            ScoreRecord.score_type == "assignment").all()]
        exam_scores = [r.score for r in db.query(ScoreRecord).filter(
            ScoreRecord.student_id == u_obj.id, ScoreRecord.class_id == cls.id,
            ScoreRecord.score_type == "exam").all()]

        avg_asgn = sum(asgn_scores) / len(asgn_scores) if asgn_scores else 0
        avg_exam = sum(exam_scores) / len(exam_scores) if exam_scores else 0

        risk = predict_risk(att_pct, avg_asgn, avg_exam)
        db.add(RiskRecord(student_id=u_obj.id, class_id=cls.id,
                          academic_risk=risk["academic_risk"],
                          engagement_risk=risk["engagement_risk"],
                          overall_risk=risk["overall_risk"],
                          risk_level=risk["risk_level"]))
db.commit()
print("✅ Computed risk records")

# ── Extracurricular Activities ────────────────────────────────────────────────
activities_data = [
    {"name": "Coding Club",       "category": "Technology",    "icon": "💻", "max_participants": 20, "hours_per_week": 8,  "description": "Weekly hackathons and project building"},
    {"name": "Debate Society",    "category": "Communication", "icon": "🎙️", "max_participants": 25, "hours_per_week": 6,  "description": "Public speaking and argumentation"},
    {"name": "Robotics Team",     "category": "Engineering",   "icon": "🤖", "max_participants": 15, "hours_per_week": 12, "description": "Build and program robots"},
    {"name": "Drama Club",        "category": "Arts",          "icon": "🎭", "max_participants": 30, "hours_per_week": 10, "description": "Semester plays and performances"},
    {"name": "Math Olympiad",     "category": "Academic",      "icon": "🔢", "max_participants": 15, "hours_per_week": 5,  "description": "Competitive mathematics training"},
    {"name": "Photography Club",  "category": "Arts",          "icon": "📷", "max_participants": 20, "hours_per_week": 4,  "description": "Digital and film photography"},
]
act_objs = []
for a in activities_data:
    act = Activity(**a)
    db.add(act)
    act_objs.append(act)
db.commit()
print(f"✅ Created {len(act_objs)} activities")

# Enroll students in activities (each student in 2-3 activities)
for idx, (u_obj, sdata) in enumerate(student_objs):
    chosen = random.sample(act_objs, k=random.randint(2, 3))
    for act in chosen:
        xp = sdata["xp"] // len(chosen) + random.randint(-30, 30)
        hours = round(act.hours_per_week * random.uniform(0.5, 1.2), 1)
        progress = min(100, round(random.uniform(30, 95), 1))
        db.add(ActivityEnrollment(student_id=u_obj.id, activity_id=act.id,
                                  xp_earned=max(0, xp), hours_logged=hours, progress_pct=progress))
db.commit()
print("✅ Enrolled students in activities")

# ── Self-Learning Courses ─────────────────────────────────────────────────────
courses_pool = [
    ("Python for Data Science",      "Coursera",     "Technology"),
    ("Machine Learning Basics",      "edX",          "Technology"),
    ("Web Development Bootcamp",     "Udemy",        "Technology"),
    ("Digital Marketing",            "Google",       "Business"),
    ("Public Speaking Masterclass",  "Coursera",     "Communication"),
    ("Discrete Mathematics",         "NPTEL",        "Mathematics"),
    ("Data Structures & Algorithms", "NPTEL",        "Computer Science"),
    ("English Communication",        "British Council","Communication"),
    ("Financial Literacy",           "NSE Academy",  "Finance"),
    ("Photography Basics",           "Skillshare",   "Arts"),
]
for u_obj, _ in student_objs:
    chosen = random.sample(courses_pool, k=random.randint(2, 5))
    for title, platform, category in chosen:
        progress = round(random.uniform(10, 95), 1)
        db.add(LearningCourse(student_id=u_obj.id, title=title, platform=platform,
                              category=category, progress_pct=progress,
                              rating=round(random.uniform(4.2, 5.0), 1),
                              completed=progress >= 90))
db.commit()
print("✅ Seeded learning courses")

print("\n🎉 Database seeded successfully!")
print("\n📋 LOGIN CREDENTIALS")
print("=" * 45)
print("PROFESSORS:")
for p in professors:
    print(f"  {p['username']:<20}  {p['password']}")
print("\nSTUDENTS (sample):")
for s in students_data[:6]:
    print(f"  {s['username']:<22}  {s['password']}")
print("  ... and 9 more students with password: student@123")
