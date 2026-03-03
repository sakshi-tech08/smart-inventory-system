from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import uvicorn
import random

app = FastAPI()

# CORS सेटिंग - फ्रंटएंड आणि बॅकएंड जोडण्यासाठी
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- डेटाबेस सेटअप ---
def init_db():
    conn = sqlite3.connect("inventory.db")
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS items 
                      (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, stock INTEGER)''')
    # सुरुवातीचा डेटा (जर टेबल रिकामा असेल तर)
    cursor.execute("SELECT COUNT(*) FROM items")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO items (name, stock) VALUES ('Parle-G', 50), ('Maggi', 10), ('Amul Butter', 5)")
    conn.commit()
    conn.close()

init_db()

# १. सर्व इन्व्हेंटरी मिळवण्यासाठी
@app.get("/inventory")
def get_inventory():
    conn = sqlite3.connect("inventory.db")
    cursor = conn.cursor()
    cursor.execute("SELECT name, stock FROM items")
    rows = cursor.fetchall()
    conn.close()
    return [{"item": r[0], "stock": r[1], "status": "Available" if r[1] > 15 else "Low Stock"} for r in rows]

# २. नवीन आयटम ॲड करण्यासाठी
@app.post("/add_item")
async def add_item(data: dict):
    conn = sqlite3.connect("inventory.db")
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO items (name, stock) VALUES (?, ?)", (data.get("name"), data.get("stock")))
        conn.commit()
    except:
        return {"message": "Item already exists"}
    finally:
        conn.close()
    return {"message": "Success"}

# ३. आयटम विकण्यासाठी (Stock -1 करणे)
@app.post("/sell_item/{name}")
async def sell_item(name: str):
    conn = sqlite3.connect("inventory.db")
    cursor = conn.cursor()
    cursor.execute("UPDATE items SET stock = MAX(0, stock - 1) WHERE name = ?", (name,))
    conn.commit()
    conn.close()
    return {"message": "Updated"}

# ४. आयटम डिलीट करण्यासाठी (Trash)
@app.delete("/delete_item/{name}")
async def delete_item(name: str):
    conn = sqlite3.connect("inventory.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM items WHERE name = ?", (name,))
    conn.commit()
    conn.close()
    return {"message": "Deleted"}

# ५. AI प्रेडिक्शन
@app.get("/predict")
def predict():
    return {"suggested_order": random.randint(20, 100)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)