from fastapi import APIRouter, HTTPException, Depends, status
from app.middleware.auth import get_current_user
from app.database import supabase
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/users", tags=["Usuarios"])

@router.get("/stats")
async def get_stats(user=Depends(get_current_user)):
    user_id = user["user_id"]

    foods_result = supabase.table("foods")\
        .select("id", count="exact")\
        .eq("created_by", user_id)\
        .execute()

    favorites_result = supabase.table("favorites")\
        .select("food_id", count="exact")\
        .eq("user_id", user_id)\
        .execute()

    diary_result = supabase.table("diary_entries")\
        .select("id", count="exact")\
        .eq("user_id", user_id)\
        .execute()

    return {
        "foods":     foods_result.count or 0,
        "favorites": favorites_result.count or 0,
        "diary":     diary_result.count or 0,
    }

@router.get("/favorites")
async def get_favorites(user=Depends(get_current_user)):
    result = supabase.table("favorites")\
        .select("food_id, created_at, foods(*)")\
        .eq("user_id", user["user_id"])\
        .order("created_at", desc=True)\
        .execute()

    favorites = []
    for row in result.data:
        if row.get("foods"):
            food = row["foods"]
            food["favorited_at"] = row["created_at"]
            favorites.append(food)

    return favorites

@router.post("/favorites/{food_id}", status_code=status.HTTP_201_CREATED)
async def add_favorite(food_id: str, user=Depends(get_current_user)):
    food_result = supabase.table("foods")\
        .select("id")\
        .eq("id", food_id)\
        .limit(1)\
        .execute()

    if not food_result.data:
        raise HTTPException(status_code=404, detail="Alimento no encontrado")

    try:
        supabase.table("favorites").insert({
            "user_id": user["user_id"],
            "food_id": food_id
        }).execute()
        return {"message": "Agregado a favoritos"}

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Este alimento ya está en tus favoritos"
        )

@router.delete("/favorites/{food_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(food_id: str, user=Depends(get_current_user)):
    supabase.table("favorites")\
        .delete()\
        .eq("user_id", user["user_id"])\
        .eq("food_id", food_id)\
        .execute()

@router.get("/my-foods")
async def get_my_foods(user=Depends(get_current_user)):
    result = supabase.table("foods")\
        .select("*")\
        .eq("created_by", user["user_id"])\
        .order("created_at", desc=True)\
        .execute()

    return result.data

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    country: Optional[str] = None

@router.put("/profile")
async def update_profile(profile_data: ProfileUpdate, user=Depends(get_current_user)):
    update_data = profile_data.model_dump(exclude_none=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")

    supabase.table("profiles")\
        .update(update_data)\
        .eq("id", user["user_id"])\
        .execute()

    result = supabase.table("profiles")\
        .select("username, first_name, last_name, country, role")\
        .eq("id", user["user_id"])\
        .limit(1)\
        .execute()

    return result.data[0]

@router.get("/profile")
async def get_profile(user=Depends(get_current_user)):
    result = supabase.table("profiles")\
        .select("username, first_name, last_name, country, role, created_at")\
        .eq("id", user["user_id"])\
        .limit(1)\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    return result.data[0]