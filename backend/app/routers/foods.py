from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from typing import List, Optional
from app.models.schemas import FoodCreate, FoodUpdate, FoodResponse
from app.middleware.auth import get_current_user, require_admin, get_optional_user
from app.database import supabase
import uuid
import httpx

router = APIRouter(prefix="/foods", tags=["Alimentos"])

@router.get("/", response_model=List[FoodResponse])
async def get_foods(
    search: Optional[str] = None,
    user=Depends(get_optional_user)
):
    query = supabase.table("foods").select("*")
    
    if search:
        query = query.ilike("name", f"%{search}%")
    
    if user is None:
        result = query.eq("is_global", True).order("name").execute()
    elif user["role"] == "admin":
        result = query.order("name").execute()
    else:
        result = query.or_(
            f"is_global.eq.true,created_by.eq.{user['user_id']}"
        ).order("name").execute()
    
    return result.data

@router.post("/", response_model=FoodResponse, status_code=status.HTTP_201_CREATED)
async def create_food(food_data: FoodCreate, user=Depends(get_current_user)):
    new_food = {
        "name": food_data.name,
        "carbs_per_100g": food_data.carbs_per_100g,
        "image_url": food_data.image_url,
        "created_by": user["user_id"],
        "is_global": user["role"] == "admin"
    }
    
    result = supabase.table("foods").insert(new_food).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Error al crear el alimento")
    
    new_id = result.data[0]["id"]
    created = supabase.table("foods")\
        .select("*")\
        .eq("id", new_id)\
        .limit(1)\
        .execute()
    
    return created.data[0]

@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes")
    
    contents = await file.read()
    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="La imagen no puede superar 2MB")
    
    extension = file.filename.split(".")[-1]
    file_path = f"{user['user_id']}/{uuid.uuid4()}.{extension}"
    
    result = supabase.storage.from_("food-images").upload(
        path=file_path,
        file=contents,
        file_options={"content-type": file.content_type}
    )
    
    public_url = supabase.storage.from_("food-images").get_public_url(file_path)
    return {"image_url": public_url}

# @router.get("/search-external")
# async def search_open_food_facts(query: str, user=Depends(get_current_user)):
#     if not query or len(query.strip()) < 2:
#         raise HTTPException(status_code=400, detail="La búsqueda debe tener al menos 2 caracteres")

#     url = "https://world.openfoodfacts.org/cgi/search.pl"
#     params = {
#         "search_terms": query,
#         "search_simple": 1,
#         "action": "process",
#         "json": 1,
#         "page_size": 12,
#         "fields": "product_name,nutriments,image_small_url,brands,quantity"
#     }

#     try:
#         async with httpx.AsyncClient(timeout=10) as client:
#             response = await client.get(url, params=params)
#             response.raise_for_status() 
#             data = response.json()

#     except httpx.TimeoutException:
#         raise HTTPException(status_code=504, detail="Open Food Facts tardó demasiado en responder. Intentá de nuevo.")
#     except Exception as e:
#         raise HTTPException(status_code=502, detail="No se pudo conectar con Open Food Facts.")

#     results = []
#     for product in data.get("products", []):
#         name = product.get("product_name", "").strip()
#         nutriments = product.get("nutriments", {})
        
#         carbs = nutriments.get("carbohydrates_100g")

#         if not name or carbs is None:
#             continue

#         if not (0 <= carbs <= 100):
#             continue

#         results.append({
#             "name": name,
#             "carbs_per_100g": round(float(carbs), 2),
#             "image_url": product.get("image_small_url") or None,
#             "brand": product.get("brands", "").split(",")[0].strip() or None,
#             "quantity": product.get("quantity") or None,
#         })

#     return {"results": results, "query": query, "count": len(results)}

@router.get("/{food_id}", response_model=FoodResponse)
async def get_food(food_id: str, user=Depends(get_optional_user)):
    result = supabase.table("foods")\
        .select("*")\
        .eq("id", food_id)\
        .limit(1)\
        .execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Alimento no encontrado")
    
    food = result.data[0]
    
    if user is None:
        if not food["is_global"]:
            raise HTTPException(status_code=403, detail="Sin acceso")
    elif user["role"] != "admin":
        if not food["is_global"] and food["created_by"] != user["user_id"]:
            raise HTTPException(status_code=403, detail="Sin acceso")
    
    return food

@router.put("/{food_id}", response_model=FoodResponse)
async def update_food(
    food_id: str,
    food_data: FoodUpdate,
    user=Depends(get_current_user)
):
    existing = supabase.table("foods")\
        .select("created_by")\
        .eq("id", food_id)\
        .limit(1)\
        .execute()
    
    if not existing.data:
        raise HTTPException(status_code=404, detail="Alimento no encontrado")
    
    is_owner = existing.data["created_by"] == user["user_id"]
    if user["role"] != "admin" and not is_owner:
        raise HTTPException(status_code=403, detail="No tenés permiso para editar este alimento")
    
    update_data = food_data.model_dump(exclude_none=True)
    
    supabase.table("foods").update(update_data).eq("id", food_id).execute()
    
    updated = supabase.table("foods")\
        .select("*")\
        .eq("id", food_id)\
        .limit(1)\
        .execute()
    
    if not updated.data:
        raise HTTPException(status_code=500, detail="Error al obtener el alimento actualizado")
    
    return updated.data

@router.delete("/{food_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_food(food_id: str, user=Depends(get_current_user)):
    existing = supabase.table("foods")\
        .select("created_by")\
        .eq("id", food_id)\
        .limit(1)\
        .execute()
    
    if not existing.data:
        raise HTTPException(status_code=404, detail="Alimento no encontrado")
    
    is_owner = existing.data["created_by"] == user["user_id"]
    if user["role"] != "admin" and not is_owner:
        raise HTTPException(status_code=403, detail="No tenés permiso para eliminar este alimento")
    
    supabase.table("foods").delete().eq("id", food_id).execute()
