import profile
from urllib import response

from fastapi import APIRouter, HTTPException, status
from app.models.schemas import UserRegister, UserLogin, TokenResponse
from app.database import supabase

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    try:
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "username": user_data.username,
                    "first_name": user_data.first_name,
                    "last_name": user_data.last_name,
                    "country": user_data.country
                }
            }
        })

        if not response.user:
            raise HTTPException(status_code=400, detail="No se pudo crear el usuario")

        if not response.session:
            raise HTTPException(
                status_code=200,
                detail="Cuenta creada. Por favor revisá tu email para confirmar tu cuenta."
            )

        return TokenResponse(
            access_token=response.session.access_token,
            user_id=response.user.id,
            username=user_data.username,
            role="user",
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            country=user_data.country
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })

        if not response.user:
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")

        username = "Usuario"
        role = "user"
        first_name = None
        last_name = None
        country = None

        try:
            profile = supabase.table("profiles")\
                .select("username, role, first_name, last_name, country")\
                .eq("id", response.user.id)\
                .limit(1)\
                .execute()

            if profile.data:
                username = profile.data["username"]
                role = profile.data["role"]
                first_name = profile.data["first_name"]
                last_name = profile.data["last_name"]
                country = profile.data["country"]
        except Exception:
            pass

        return TokenResponse(
            access_token=response.session.access_token,
            user_id=response.user.id,
            username=username,
            role=role,
            first_name=first_name,
            last_name=last_name,
            country=country
        )

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

@router.post("/logout")
async def logout():
    supabase.auth.sign_out()
    return {"message": "Sesión cerrada exitosamente"}