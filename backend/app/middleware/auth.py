from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import supabase

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    token = credentials.credentials
    
    try:
        response = supabase.auth.get_user(token)
        
        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        user_id = response.user.id
        
        profile = supabase.table("profiles")\
            .select("role, username")\
            .eq("id", user_id)\
            .maybe_single()\
            .execute()
        
        role = profile.data["role"] if profile.data else "user"
        username = profile.data["username"] if profile.data else "Usuario"
        
        return {
            "user_id": user_id,
            "email": response.user.email,
            "role": role,
            "username": username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )


async def require_admin(user: dict = Depends(get_current_user)) -> dict:

    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso restringido a administradores"
        )
    return user

async def get_optional_user(request: Request) -> dict | None:
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ")[1]
    
    try:
        response = supabase.auth.get_user(token)
        
        if not response or not response.user:
            return None
        
        user_id = response.user.id
        
        profile = supabase.table("profiles")\
            .select("role, username")\
            .eq("id", user_id)\
            .limit(1)\
            .execute()
        
        role = profile.data[0]["role"] if profile.data else "user"
        username = profile.data[0]["username"] if profile.data else "Usuario"
        
        return {
            "user_id": user_id,
            "email": response.user.email,
            "role": role,
            "username": username
        }
    except Exception:
        return None