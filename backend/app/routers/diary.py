from fastapi import APIRouter, HTTPException, Depends, status
from app.middleware.auth import get_current_user
from app.database import supabase
from pydantic import BaseModel
from datetime import date

router = APIRouter(prefix="/diary", tags=["Diario"])

class DiaryEntryCreate(BaseModel):
    food_id: str
    consumed_grams: float
    consumed_date: date = None

@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_diary_entry(entry_data: DiaryEntryCreate, user=Depends(get_current_user)):
    food_result = supabase.table("foods")\
        .select("carbs_per_100g, name")\
        .eq("id", entry_data.food_id)\
        .limit(1)\
        .execute()

    if not food_result.data:
        raise HTTPException(status_code=404, detail="Alimento no encontrado")

    food = food_result.data[0]

    carbs_consumed = round((food["carbs_per_100g"] * entry_data.consumed_grams) / 100, 2)

    consumed_date = str(entry_data.consumed_date) if entry_data.consumed_date else str(date.today())

    new_entry = {
        "user_id": user["user_id"],
        "food_id": entry_data.food_id,
        "consumed_grams": entry_data.consumed_grams,
        "consumed_date": consumed_date,
        "carbs_consumed": carbs_consumed
    }

    result = supabase.table("diary_entries").insert(new_entry).execute()

    return {
        "message": f"Registrado: {food['name']} ({entry_data.consumed_grams}g = {carbs_consumed}g carbs)",
        "entry": result.data[0] if result.data else new_entry
    }

@router.get("/dates")
async def get_diary_dates(user=Depends(get_current_user)):
    result = supabase.table("diary_entries")\
        .select("consumed_date")\
        .eq("user_id", user["user_id"])\
        .order("consumed_date", desc=True)\
        .execute()

    seen = set()
    unique_dates = []
    for row in result.data:
        d = row["consumed_date"]
        if d not in seen:
            seen.add(d)
            unique_dates.append(d)

    return unique_dates

@router.get("/{date_str}")
async def get_diary_by_date(date_str: str, user=Depends(get_current_user)):
    result = supabase.table("diary_entries")\
        .select("*, foods(id, name, image_url, carbs_per_100g)")\
        .eq("user_id", user["user_id"])\
        .eq("consumed_date", date_str)\
        .order("consumed_at")\
        .execute()

    entries = result.data

    total_carbs = round(sum(e["carbs_consumed"] for e in entries), 2)

    return {
        "date": date_str,
        "entries": entries,
        "total_carbs": total_carbs,
        "entry_count": len(entries)
    }

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diary_entry(entry_id: str, user=Depends(get_current_user)):
    existing_result = supabase.table("diary_entries")\
        .select("user_id")\
        .eq("id", entry_id)\
        .limit(1)\
        .execute()

    if not existing_result.data:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")

    existing = existing_result.data[0]

    if existing["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="No tenés permiso")

    supabase.table("diary_entries").delete().eq("id", entry_id).execute()