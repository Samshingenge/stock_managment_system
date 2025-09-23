#!/bin/bash
echo 'Waiting for database...'
while ! python -c "import psycopg2; psycopg2.connect(host='postgres', database='stock_management', user='stockuser', password='stockpass123')" 2>/dev/null; do
    sleep 1
done
echo 'Database ready!'
cd /app
python -m pip install --upgrade pip
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload