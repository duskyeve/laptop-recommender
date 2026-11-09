# GadgetLens Backend — Step 2: Database

This folder is the database foundation for the existing GadgetLens frontend.

## Stack
- MySQL
- Flask-SQLAlchemy
- PyMySQL
- python-dotenv

## Database design
The schema contains:
- users
- processors
- gpus
- laptops
- tech_glossary
- user_preferences
- saved_laptops
- recommendation_history
- website_feedback

There is intentionally **no admin/manager/role/OTP/email table or field**.

## Setup
1. Install MySQL and create/start the MySQL server.
2. Copy `.env.example` to `.env`.
3. Put your MySQL username/password in `.env`.
4. Create the database with `schema.sql`, or let the seed script create the tables.
5. From this `backend` directory run:

```bash
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
python seed/seed_data.py
python app.py
```

The seed data is prototype data based on the current frontend's six mock laptop records. It is clearly intended as development/seed data, not verified commercial product data.

## Important
This step creates the data layer only. Authentication routes, preference routes, recommendation routes, and frontend API integration are the next steps.
