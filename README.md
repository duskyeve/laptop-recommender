# GadgetLens — Specification-Based Laptop Recommendation Platform

GadgetLens is a full-stack, database-driven laptop recommendation platform. Its core purpose is to help users find laptops based purely on objective technical specifications, requirements, and personal priority weights — not biased reviews, marketing hype, or sponsored rankings.

---

## 1. Project Overview

- **Objective Specification Matching**: Evaluates laptops using verifiable hardware metrics (Processor score, GPU benchmark, RAM, NVMe SSD capacity, display panel type, resolution, refresh rate, verified battery life, and weight).
- **Two-Stage Recommendation Pipeline**:
  - **Stage 1 (Hard Filtering)**: Strictly filters out laptops that fail mandatory requirements (e.g., maximum budget ceiling, operating system, minimum RAM, required GPU category).
  - **Stage 2 (Priority-Based Ranking)**: Normalizes feature scores (0–100) and computes a weighted composite score based on the user's customized priority order:
    $$\text{Final Score} = \sum (\text{Feature Weight}_i \times \text{Normalized Score}_i)$$
- **Explainable Results**: Every recommendation includes a deterministic "Why this laptop?" explanation and factor breakdown, while lower-ranking models provide "Why wasn't this recommended?" citing specific hardware bottlenecks.
- **Guest & User Modes**:
  - **Guests**: Browse, filter, complete the 5-step questionnaire, generate recommendations, and compare specifications side-by-side.
  - **Authenticated Users**: Save favorite laptops to MySQL, store persistent preferences, and submit usability feedback.
- **Hardware Technical Chatbot & Glossary**: Answers technical questions about hardware components without ever altering recommendation rankings or injecting bias.

---

## 2. Technology Stack

- **Backend**: Python 3.13+, Flask 3.1, Flask-SQLAlchemy 3.1, Flask-Migrate 4.1, Flask-CORS 6.0, Werkzeug (PBKDF2 SHA-256 password hashing)
- **Database**: MySQL (PyMySQL driver) with automatic local SQLite fallback for testing / offline development
- **Frontend**: Semantic HTML5, Modular CSS3 (custom CSS variables for Light and Dark themes), Vanilla JavaScript (ES6+ modular architecture)
- **Testing**: Pytest 9.2

---

## 3. Project Architecture & Structure

```
laptop-recommender/
│
├── index.html                  # Landing page with CTA and overview
├── login.html                  # Sign in page
├── register.html               # Registration page with strength meter
├── preferences.html            # 5-step technical preference questionnaire
├── results.html                # Recommended laptops, filters, compare tray, modals
│
├── css/
│   ├── style.css               # Core design tokens, typography, dark/light themes
│   ├── auth.css                # Authentication forms and split-screen layouts
│   ├── preferences.css         # Step cards, sliders, priority drag-and-drop
│   └── results.css             # Recommendation cards, compare modal, chatbot panel
│
├── js/
│   ├── api.js                  # Centralized REST API client (reusable fetch wrapper)
│   ├── theme.js                # Global light/dark theme toggle & auth badge
│   ├── main.js                 # Landing page routing & guest session initialization
│   ├── login.js                # Backend authentication (POST /api/auth/login)
│   ├── register.js             # Backend registration (POST /api/auth/register)
│   ├── preferences.js          # Questionnaire state & POST /api/preferences
│   └── results.js              # Live recommendations, filtering, compare, saved, feedback
│
├── backend/
│   ├── app.py                  # Flask application entry point & static file server
│   ├── config.py               # Environment configuration & database connection detection
│   ├── extensions.py           # SQLAlchemy, CORS, Migrate instances
│   ├── requirements.txt        # Backend Python dependencies
│   ├── schema.sql              # MySQL DDL table schema
│   │
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── user.py             # Users (id, username, password_hash, created_at)
│   │   ├── processor.py        # Processors (id, name, manufacturer, performance_score)
│   │   ├── gpu.py              # GPUs (id, name, category, performance_score)
│   │   ├── laptop.py           # Laptops (id, brand, model, price, ram, storage, display...)
│   │   ├── preference.py       # UserPreferences (user_id, budget, priority_order, json)
│   │   ├── saved_laptop.py     # SavedLaptops (user_id, laptop_id, created_at)
│   │   ├── feedback.py         # WebsiteFeedback (usability ratings 1-5, comment)
│   │   ├── glossary.py         # TechGlossary (term, simple_description, detailed)
│   │   └── history.py          # RecommendationHistory (user_id, search_params)
│   │
│   ├── routes/                 # Modular Flask Blueprints
│   │   ├── auth.py             # /api/auth (register, login, logout, me)
│   │   ├── laptops.py          # /api/laptops, /api/laptops/{id}, /api/laptops/compare
│   │   ├── recommendations.py  # /api/recommendations (POST, GET)
│   │   ├── preferences.py      # /api/preferences (POST, GET)
│   │   ├── saved_laptops.py    # /api/saved-laptops (GET, POST, DELETE)
│   │   ├── feedback.py         # /api/feedback (POST)
│   │   ├── chatbot.py          # /api/chatbot (POST)
│   │   └── glossary.py         # /api/glossary, /api/glossary/{term}
│   │
│   ├── services/
│   │   ├── recommendation_engine.py  # Stage 1 hard filter & Stage 2 weighted ranker
│   │   └── chatbot_service.py        # Technical hardware Q&A engine
│   │
│   ├── seed/
│   │   └── seed_data.py        # Database seeder (idempotent seed dataset)
│   │
│   └── tests/                  # Pytest test suite (16 tests)
│       ├── test_auth.py
│       ├── test_recommendation.py
│       ├── test_laptops.py
│       ├── test_feedback_glossary_chatbot.py
│       └── test_end_to_end_integration.py
│
├── database/
│   ├── schema.sql              # Complete MySQL schema creation script
│   └── seed.sql                # SQL seed script with sample processors, GPUs, laptops
│
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules for Python, virtualenv, and caches
└── README.md                   # This documentation
```

---

## 4. Database Setup

### Option A: Using MySQL (Recommended for Production / Evaluation)
1. Ensure your local MySQL server is running (default port `3306`).
2. Create the database and import schema & seed data:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p gadgetlens < database/seed.sql
   ```
3. Copy `.env.example` to `.env`:
   ```env
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=gadgetlens
   SECRET_KEY=your_secret_key_here
   ```

### Option B: Automatic Local Fallback (Out-of-the-Box Development)
If a MySQL service is not actively running on port 3306, GadgetLens detects this and seamlessly initializes a local SQLite database (`backend/gadgetlens.db`) automatically populated with all processors, GPUs, laptops, and glossary definitions.

---

## 5. Backend Installation & Execution

1. Create and activate a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv

   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1

   # On Linux/macOS:
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Seed the database (optional, auto-seeds on initial launch):
   ```bash
   python seed/seed_data.py
   ```

4. Run the Flask application:
   ```bash
   python app.py
   ```
   The backend server will start at `http://127.0.0.1:5000`.

---

## 6. Accessing the Application

You can access the frontend in either of two ways:

1. **Directly via Flask (Unified Server)**:
   Navigate to:
   [http://127.0.0.1:5000](http://127.0.0.1:5000)
   Flask serves both the REST API and the frontend HTML/CSS/JS files directly.

2. **Using a Separate Static Server (CORS Enabled)**:
   Run any static server from the project root:
   ```bash
   # From the laptop-recommender root directory:
   python -m http.server 3000
   ```
   Navigate to `http://localhost:3000`. The frontend's `js/api.js` client communicates via CORS with credentials to `http://127.0.0.1:5000`.

---

## 7. API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service and database health status | No |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Sign in with username & password | No |
| `POST` | `/api/auth/logout` | End user session | Yes |
| `GET` | `/api/auth/me` | Current authenticated user info | No |
| `GET` | `/api/laptops` | Retrieve laptops with search & filters | No |
| `GET` | `/api/laptops/{id}` | Retrieve details for a single laptop | No |
| `POST` | `/api/laptops/compare` | Compare 2 to 4 laptops side by side | No |
| `POST` | `/api/recommendations` | Generate priority-ranked recommendations | No (Guests supported) |
| `GET` | `/api/recommendations` | Get recommendations using saved preferences | No |
| `POST` | `/api/preferences` | Save user questionnaire preferences | No (Guest saves locally; User saves to DB) |
| `GET` | `/api/preferences` | Retrieve user saved preferences | Yes |
| `GET` | `/api/saved-laptops` | Retrieve user's saved favorite laptops | Yes |
| `POST` | `/api/saved-laptops` | Save a laptop to favorites | Yes |
| `DELETE` | `/api/saved-laptops/{id}` | Remove a laptop from favorites | Yes |
| `POST` | `/api/feedback` | Submit website usability feedback | Yes |
| `POST` | `/api/chatbot` | Technical hardware spec Q&A | No |
| `GET` | `/api/glossary` | Get all hardware glossary definitions | No |
| `GET` | `/api/glossary/{term}` | Get definition for specific technical term | No |

---

## 8. Recommendation Algorithm

### Stage 1: Hard Filtering
Eliminates laptops based on mandatory criteria:
- **Budget Ceiling**: Disqualifies laptops where `price > budgetMax`.
- **Operating System**: If user specifies Windows or Linux, laptops with other OS are excluded.
- **Minimum RAM**: If user explicitly requires 16 GB or 32 GB+, laptops with lower memory are excluded.
- **GPU Category**: If user requires dedicated graphics for heavy gaming, integrated GPUs are excluded.

### Stage 2: Priority-Based Ranking
Computes a normalized score (0–100) across 7 objective factors:
1. **Performance**: $0.65 \times \text{Processor Score} + 0.35 \times \text{GPU Score}$
2. **Battery Life**: Minimized to 20, scaled up to 100 based on verified battery runtime.
3. **Price**: Inverse scaling within the user's budget range.
4. **Portability**: Linear inverse scale based on chassis weight ($1.0\text{ kg} = 100$, $2.5\text{ kg} = 35$).
5. **Storage**: Evaluated by SSD capacity and PCIe protocol.
6. **Display**: Points awarded for panel type (OLED vs. IPS), resolution (4K/QHD vs. FHD), and refresh rate (165Hz/144Hz/120Hz vs. 60Hz).
7. **Gaming**: $0.70 \times \text{GPU Score} + 0.30 \times \text{Processor Score}$.

**Rank Weight Formula**:
Using Rank-Order Centroid distribution for $N=7$ factors:
$$\text{Weight}_i = \frac{N - \text{Rank}_i + 1}{\sum_{k=1}^N k}$$
The weights strictly sum to $1.000$. The resulting `matchScore` is sorted in descending order.

---

## 9. Running Tests

Run the complete test suite:
```bash
cd backend
pytest -v
```
All 16 test cases cover:
- Database connectivity & migrations
- User registration, password complexity validation, login, and logout
- Guest vs. authenticated access control
- Questionnaire submission and preference persistence
- Stage 1 hard filtering and Stage 2 priority-based ranking
- Deterministic explanation generation
- Laptop comparison and details
- Saved laptops and feedback submission gating
- Hardware chatbot technical responses and recommendation rejection
- Technical glossary lookups
- End-to-end full application lifecycle

