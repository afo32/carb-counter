from fastapi import APIRouter, HTTPException, Depends, status
from app.middleware.auth import get_current_user
from app.database import supabase

router = APIRouter(prefix="/users", tags=["Usuarios"])

@router.get("/stats")
async def get_user_stats(user=Depends(get_current_user)):
    result = supabase.table("foods")\
        .select("id", count="exact")\
        .eq("created_by", user["user_id"])\
        .execute()

    return {"foods_created": result.count}

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