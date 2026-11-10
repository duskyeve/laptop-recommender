# GadgetLens Backend

This directory houses the Python Flask REST API, SQLAlchemy models, recommendation engine, database seeds, and test suite for GadgetLens.

Please refer to the main [README.md](../README.md) in the project root for full documentation, database architecture, and frontend-backend integration details.

## Quick Start
```bash
python -m venv venv
.\venv\Scripts\activate   # Windows PowerShell
pip install -r requirements.txt
python seed/seed_data.py
python app.py
```

## Running Tests
```bash
pytest -v
```
