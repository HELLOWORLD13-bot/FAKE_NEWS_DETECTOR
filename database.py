import os
import sqlite3
from datetime import datetime
 
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "news.db")
 
 
def _connect():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con
 
 
def init_db():
    """Create the news_checks table if it does not exist."""
    with _connect() as con:
        con.execute(
            """CREATE TABLE IF NOT EXISTS news_checks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                news_text TEXT NOT NULL,
                prediction TEXT NOT NULL,
                confidence_score REAL NOT NULL,
                created_at TEXT NOT NULL
            )"""
        )
 
 
def add_check(news_text, prediction, confidence):
    with _connect() as con:
        cur = con.execute(
            "INSERT INTO news_checks (news_text, prediction, confidence_score, created_at) VALUES (?,?,?,?)",
            (news_text, prediction, confidence, datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        )
        return cur.lastrowid
 
 
def get_history(label=None, limit=50):
    sql = "SELECT * FROM news_checks"
    args = []
    if label in ("Real", "Fake"):
        sql += " WHERE prediction = ?"
        args.append(label)
    sql += " ORDER BY id DESC LIMIT ?"
    args.append(limit)
    with _connect() as con:
        return [dict(r) for r in con.execute(sql, args).fetchall()]
 
 
def delete_check(check_id):
    with _connect() as con:
        con.execute("DELETE FROM news_checks WHERE id = ?", (check_id,))
 
 
def clear_all():
    with _connect() as con:
        con.execute("DELETE FROM news_checks")
 
 
def get_stats():
    with _connect() as con:
        rows = con.execute("SELECT prediction, COUNT(*) AS n FROM news_checks GROUP BY prediction").fetchall()
    counts = {r["prediction"]: r["n"] for r in rows}
    real, fake = counts.get("Real", 0), counts.get("Fake", 0)
    return {"real": real, "fake": fake, "total": real + fake}