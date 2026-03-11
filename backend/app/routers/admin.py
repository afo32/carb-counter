from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.middleware.auth import require_admin
from app.database import supabase
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta, timezone
from pydantic import EmailStr

router = APIRouter(prefix="/admin", tags=["Administración"])

class UserAdminResponse(BaseModel):
    id: str
    username: str
    role: str
    created_at: str

class UserAdminUpdate(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

@router.get("/users", response_model=List[UserAdminResponse])
async def get_all_users(admin=Depends(require_admin)):
    result = supabase.table("profiles")\
        .select("id, username, role, created_at")\
        .order("created_at")\
        .execute()
    
    return result.data

@router.put("/users/{user_id}", response_model=UserAdminResponse)
async def update_user(
    user_id: str,
    user_data: UserAdminUpdate,
    admin=Depends(require_admin)
):
    existing_result = supabase.table("profiles")\
        .select("id")\
        .eq("id", user_id)\
        .limit(1)\
        .execute()

    if not existing_result.data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user_data.role and user_data.role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="El rol debe ser 'user' o 'admin'")

    update_data = user_data.model_dump(exclude_none=True)

    supabase.table("profiles")\
        .update(update_data)\
        .eq("id", user_id)\
        .execute()

    updated_result = supabase.table("profiles")\
        .select("id, username, role, created_at")\
        .eq("id", user_id)\
        .limit(1)\
        .execute()

    return updated_result.data[0]

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, admin=Depends(require_admin)):
    if user_id == admin["user_id"]:
        raise HTTPException(
            status_code=400,
            detail="No podés eliminar tu propio usuario"
        )

    existing_result = supabase.table("profiles")\
        .select("id")\
        .eq("id", user_id)\
        .limit(1)\
        .execute()

    if not existing_result.data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    supabase.auth.admin.delete_user(user_id)
    
@router.get("/stats/recent-users")
async def recent_users(admin=Depends(require_admin)):
    three_days_ago = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
    
    result = supabase.table("profiles")\
        .select("username, role, country, created_at")\
        .gte("created_at", three_days_ago)\
        .order("created_at", desc=True)\
        .execute()
    
    return result.data

@router.get("/stats/recent-foods")
async def recent_foods(admin=Depends(require_admin)):
    three_days_ago = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
    
    result = supabase.table("foods")\
        .select("name, carbs_per_100g, created_at")\
        .gte("created_at", three_days_ago)\
        .order("created_at", desc=True)\
        .execute()
    
    return result.data

class AdminCreateUser(BaseModel):
    email: EmailStr
    password: str
    username: str
    first_name: str
    last_name: str
    country: str
    role: str = "user" 

@router.post("/users", status_code=201)
async def create_user(user_data: AdminCreateUser, admin=Depends(require_admin)):
    try:
        response = supabase.auth.admin.create_user({
            "email": user_data.email,
            "password": user_data.password,
            "email_confirm": True,  
            "user_metadata": {
                "username": user_data.username,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "country": user_data.country
            }
        })

        if not response.user:
            raise HTTPException(status_code=400, detail="No se pudo crear el usuario")

        if user_data.role == "admin":
            supabase.table("profiles")\
                .update({"role": "admin"})\
                .eq("id", response.user.id)\
                .execute()

        return {
            "message": f"Usuario '{user_data.username}' creado exitosamente",
            "user_id": response.user.id
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error al crear el usuario: {str(e)}"
        )
        
@router.get("/stats/users-by-country")
async def users_by_country(admin=Depends(require_admin)):
    result = supabase.table("profiles")\
        .select("country")\
        .execute()

    if not result.data:
        return []

    counts = {}
    for row in result.data:
        country = row.get("country") or "Sin especificar"
        counts[country] = counts.get(country, 0) + 1

    return sorted(
        [{"country": k, "count": v} for k, v in counts.items()],
        key=lambda x: x["count"],
        reverse=True
    )