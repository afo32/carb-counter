from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, foods, admin, users, diary

app = FastAPI(title="CarbCounter API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(foods.router)
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(diary.router)

@app.get("/")
def root():
    return {"message": "CarbCounter API corriendo 🥗"}