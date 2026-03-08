[READMEedu.md](https://github.com/user-attachments/files/25827287/READMEedu.md)
# 🛡️ EduSentinel V3 — Academic Intelligence Platform

<div align="center">

![EduSentinel Banner](https://img.shields.io/badge/EduSentinel-V3-4F46E5?style=for-the-badge&logo=shield&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

**An AI-powered academic risk prediction system for Indian universities**  
*Helping professors identify at-risk students before it's too late.*

</div>

---

## 📸 Screenshots

| Professor Dashboard | Student Dashboard |
|---|---|
| 📊 Command Centre with real-time risk data | 🎓 Personal academic overview |
| 🏆 Activities & Leaderboard | 📚 Self-learning tracker |
| 📤 Data upload panel | 🎖️ Achievements & badges |

---

## ✨ Features

### 👨‍🏫 Professor Portal
| Feature | Description |
|---|---|
| 📊 **Command Centre** | Real-time view of all students with risk scores, attendance, and performance |
| ⚠️ **Risk Intelligence** | ML-powered risk classification (High / Moderate / Safe) |
| 📤 **Data Upload** | Upload CSV files to update student academic records |
| 🏆 **Activities Manager** | View extracurricular participation across all clubs |
| 🥇 **Leaderboard** | Academic and XP-based ranking of all students |

### 🎓 Student Portal
| Feature | Description |
|---|---|
| 📈 **My Dashboard** | Personal risk score, attendance, assignment & exam averages |
| 🏅 **My Activities** | View enrolled clubs and explore new extracurriculars |
| 📚 **Self Learning** | Track external courses, platforms, and skill development |
| 🎖️ **Achievements** | Badges, milestones, and personal goals |

---

## 🧠 How the ML Model Works

```
Student Data → Feature Extraction → Random Forest Classifier → Risk Score
     ↓                ↓                      ↓                     ↓
Attendance %    Attendance < 75%         100% Accuracy         0–100 Score
Assignments     Assignment avg                                  High / Mod / Safe
Exam scores     Exam avg
XP Points       Engagement score
```

**Features used for prediction:**
- `attendance_pct` — percentage of classes attended
- `avg_assignment_score` — average score across all assignments
- `avg_exam_score` — average score across all exams
- `xp_points` — extracurricular engagement score

**Risk Thresholds:**
- 🔴 **High Risk** — Score ≥ 70
- 🟡 **Moderate** — Score 40–69
- 🟢 **Safe** — Score < 40

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                   │
│  ┌──────────────┐          ┌──────────────────────────┐  │
│  │  Prof Portal │          │     Student Portal        │  │
│  │  Dashboard   │          │     Dashboard             │  │
│  │  Activities  │          │     Activities            │  │
│  │  Leaderboard │          │     Self Learning         │  │
│  │  Upload      │          │     Achievements          │  │
│  └──────────────┘          └──────────────────────────┘  │
│              ↕  axios + JWT Bearer Token  ↕               │
└─────────────────────────────────────────────────────────┘
                            │
                     HTTP REST API
                            │
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │
│  │   Auth   │  │   API    │  │    ML Risk Predictor   │  │
│  │  JWT +   │  │ Routes   │  │  Random Forest Model   │  │
│  │  bcrypt  │  │          │  │  scikit-learn          │  │
│  └──────────┘  └──────────┘  └───────────────────────┘  │
│                      ↕                                    │
│              SQLite Database                              │
│  ┌──────────────────────────────────────────────────┐    │
│  │  users │ students │ classes │ activities │ ...   │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
EDUSEN/
├── backend/
│   ├── main.py              # FastAPI app + all routes
│   ├── database.py          # SQLAlchemy models & DB setup
│   ├── auth.py              # JWT authentication
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── risk_predictor.py    # ML model (Random Forest)
│   ├── seed.py              # Database seeder (Indian student data)
│   ├── requirements.txt     # Python dependencies
│   └── edusentinel.db       # SQLite database (auto-generated)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js           # Main router
│       ├── api.js           # Axios instance + JWT interceptor
│       ├── index.js         # React entry + Chart.js registration
│       ├── styles/
│       │   └── global.css   # Full design system (V3 light theme)
│       ├── components/
│       │   ├── Layout.js    # Sidebar + navigation shell
│       │   └── utils.js     # Shared components & chart defaults
│       └── pages/
│           ├── LoginPage.js
│           ├── ProfessorDashboard.js
│           ├── StudentDashboard.js
│           ├── prof/
│           │   ├── ProfHome.js        # Command Centre
│           │   ├── ProfUpload.js      # CSV upload
│           │   ├── ProfActivities.js  # Club management
│           │   └── ProfLeaderboard.js # Rankings
│           └── stu/
│               ├── StuHome.js         # Student overview
│               ├── StuActivities.js   # Club enrollment
│               ├── StuLearning.js     # Course tracker
│               └── StuAchievements.js # Badges & goals
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Shubhamjkd01/edusentinel-v3.git
cd edusentinel-v3
```

### 2️⃣ Setup Backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install bcrypt==4.0.1
pip install -r requirements.txt

# Seed database with sample Indian student data
python seed.py

# Start backend server
uvicorn main:app --reload --port 8000
```
✅ Backend running at `http://127.0.0.1:8000`  
📖 API Docs at `http://127.0.0.1:8000/docs`

### 3️⃣ Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start React app
npm start
```
✅ Frontend running at `http://localhost:3000`

---

## 🔑 Demo Credentials

### 👨‍🏫 Professors
| Username | Password | 
|---|---|
| `prof_sharma` | `teach@123` |
| `prof_verma` | `teach@123` |
| `prof_mehta` | `teach@123` |

### 🎓 Students (At Risk)
| Username | Password |
|---|---|
| `aarav.sharma` | `student@123` |
| `rohan.gupta` | `student@123` |
| `arjun.mishra` | `student@123` |
| `vivek.joshi` | `student@123` |
| `karan.mehra` | `student@123` |

### 🎓 Students (Safe)
| Username | Password |
|---|---|
| `priya.patel` | `student@123` |
| `ananya.singh` | `student@123` |
| `kavya.reddy` | `student@123` |
| `aditya.kumar` | `student@123` |
| `sneha.iyer` | `student@123` |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **SQLAlchemy** | ORM & database management |
| **SQLite** | Lightweight database |
| **scikit-learn** | Random Forest ML model |
| **bcrypt** | Password hashing |
| **PyJWT** | JSON Web Token authentication |
| **pandas / numpy** | Data processing |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client with JWT interceptor |
| **Chart.js + react-chartjs-2** | Data visualizations |
| **Lucide React** | Icon library |
| **Plus Jakarta Sans** | Typography |

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Login with username & password → returns JWT |

### Professor Routes
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/get_student_data/{class_id}` | Get all students for a class |
| `GET` | `/leaderboard` | Get XP-based leaderboard |
| `GET` | `/activities` | Get all extracurricular activities |
| `POST` | `/upload_csv` | Upload student CSV data |

### Student Routes
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/student/dashboard` | Get personal academic data |
| `GET` | `/learning/courses` | Get enrolled self-learning courses |
| `POST` | `/activities/enroll` | Join an extracurricular activity |

---

## 🎨 Design System

EduSentinel V3 uses a clean **light theme** with:
- **Primary:** `#3a5bd9` (Blue)
- **Accent:** `#6c3fd8` (Indigo/Purple)
- **Success:** `#10b981` (Green)
- **Warning:** `#f59e0b` (Yellow)
- **Danger:** `#ef4444` (Red)
- **Font:** Plus Jakarta Sans + Instrument Mono (numbers)
- **Radius:** 12–16px cards, smooth shadows

---

## 👥 Sample Data

The database is seeded with **15 Indian students** and **3 professors** across **4 subjects**:
- CS101 — Computer Science
- MATH201 — Mathematics
- PHY301 — Physics
- ENG102 — English

**6 Extracurricular Clubs:**
- 💻 Coding Club
- 🎭 Debate Society
- 🤖 Robotics Team
- 🎪 Drama Club
- 🔢 Math Olympiad
- 📷 Photography Club

---

## 🗺️ Workflow

```
User visits localhost:3000
         ↓
    Login Page
         ↓
   POST /login → JWT token stored in localStorage
         ↓
  Role check (professor / student)
         ↓
  ┌──────────────┐     ┌───────────────┐
  │  Professor   │     │    Student    │
  │  Dashboard   │     │   Dashboard   │
  └──────────────┘     └───────────────┘
         ↓                     ↓
  View students           View own risk
  with ML risk            score & data
  predictions
         ↓
  Every API call includes
  JWT Bearer token via
  axios interceptor
         ↓
  401 → auto logout
  & redirect to login
```

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<div align="center">

Built with ❤️ for Indian universities  
**EduSentinel V3** — *Predict. Prevent. Protect.*

</div>
