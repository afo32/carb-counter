# 🥗 CarbCounter

Aplicación web para el seguimiento de carbohidratos en alimentos. Permite a los usuarios explorar una base de datos de alimentos, calcular carbohidratos por porción, registrar su consumo diario y gestionar sus favoritos. Incluye panel de administración completo y soporte multiidioma (ES/EN).

---

## 📸 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + CSS Modules |
| Backend | FastAPI (Python) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth (JWT) |
| Almacenamiento | Supabase Storage |
| i18n | react-i18next |
| Gráficos | Recharts |
| API externa | Open Food Facts |

---

## ✨ Funcionalidades

### Usuarios no registrados
- Explorar y buscar alimentos globales
- Ver el detalle nutricional de cada alimento
- Usar la calculadora de porciones
- Registrarse e iniciar sesión

### Usuarios registrados
- Todo lo anterior
- Agregar, editar y eliminar alimentos propios
- Importar alimentos desde Open Food Facts
- Marcar alimentos como favoritos
- Registrar consumo diario en el diario
- Ver el historial de consumo en un calendario
- Panel personal con estadísticas
- Editar perfil (nombre, apellido, país, username)

### Administradores
- Todo lo anterior sobre cualquier alimento
- Panel de administración con estadísticas
- Gestión completa de usuarios (crear, editar, eliminar)
- Gráfico de usuarios por país
- Vista de actividad reciente (últimos 3 días)

---

## 🗂️ Estructura del proyecto

```
carb-counter/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── middleware/
│   │   │   └── auth.py          # get_current_user, require_admin, get_optional_user
│   │   ├── models/
│   │   │   └── schemas.py       # Modelos Pydantic
│   │   └── routers/
│   │       ├── auth.py          # /auth/register, /auth/login, /auth/logout
│   │       ├── foods.py         # /foods/ CRUD + upload-image
│   │       ├── users.py         # /users/stats, favorites, my-foods, profile
│   │       ├── admin.py         # /admin/users + /admin/stats/*
│   │       └── diary.py         # /diary/ CRUD + dates + /{date}
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── i18n.js                      # Configuración react-i18next
    │   ├── locales/
    │   │   ├── es.json                  # Traducciones español
    │   │   └── en.json                  # Traducciones inglés
    │   ├── context/
    │   │   └── AuthContext.jsx          # Contexto global de autenticación
    │   ├── services/
    │   │   └── api.js                   # Servicios axios (auth, foods, users, admin, diary)
    │   ├── components/
    │   │   ├── Navbar.jsx / .module.css
    │   │   ├── FoodCard.jsx / .module.css
    │   │   ├── FoodModal.jsx
    │   │   ├── OpenFoodFactsSearch.jsx
    │   │   ├── PrivateRoute.jsx
    │   │   └── AdminRoute.jsx
    │   └── pages/
    │       ├── Foods.jsx / .module.css
    │       ├── FoodDetail.jsx / .module.css
    │       ├── EditFood.jsx / .module.css
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── Auth.module.css          # CSS compartido Login/Register
    │       ├── EditProfile.jsx / .module.css
    │       ├── UserDashboard.jsx / .module.css
    │       ├── Favorites.jsx
    │       ├── MyFoods.jsx
    │       ├── UserPages.module.css     # CSS compartido Favorites/MyFoods/Diary
    │       ├── DiaryCalendar.jsx / .module.css
    │       ├── DiaryDay.jsx / .module.css
    │       ├── AdminDashboard.jsx
    │       ├── AdminUsers.jsx
    │       └── AdminCreateUser.jsx
    ├── .env
    └── capacitor.config.ts              # Configuración app Android
```

---

## 🗃️ Base de datos (Supabase)

```sql
-- Perfil de usuario (extendido desde auth.users)
profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users,
  username    TEXT,
  role        TEXT DEFAULT 'user',   -- 'user' | 'admin'
  first_name  TEXT,
  last_name   TEXT,
  country     TEXT,
  created_at  TIMESTAMPTZ
)

-- Alimentos
foods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  carbs_per_100g  NUMERIC NOT NULL,
  image_url       TEXT,
  created_by      UUID REFERENCES profiles(id),
  is_global       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
)

-- Favoritos
favorites (
  user_id   UUID REFERENCES profiles(id),
  food_id   UUID REFERENCES foods(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, food_id)
)

-- Diario de consumo
diary_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id),
  food_id         UUID REFERENCES foods(id),
  consumed_grams  NUMERIC NOT NULL,
  consumed_date   DATE NOT NULL,
  consumed_at     TIMESTAMPTZ DEFAULT now(),
  carbs_consumed  NUMERIC NOT NULL    -- calculado al momento del registro
)
```

> El trigger `on_auth_user_created` crea automáticamente un perfil en `profiles` al registrarse un usuario.

---

## ⚙️ Variables de entorno

### Backend — `backend/.env`

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_KEY=your-service-role-key
```

> ⚠️ Usar la clave `service_role`, no la `anon`. Nunca expongas esta clave en el frontend.

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:8000
```

---

## 🚀 Instalación y ejecución local

### Requisitos previos

- Python 3.11+
- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) con proyecto creado

### Backend

```bash
# Clonar el repositorio y entrar a la carpeta backend
cd carb-counter/backend

# Crear entorno virtual
python -m venv venv

# Activar el entorno virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear el archivo .env con tus credenciales de Supabase
# (ver sección Variables de entorno)

# Iniciar el servidor
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
```

El backend queda disponible en `http://localhost:8000`. La documentación interactiva de la API está en `http://localhost:8000/docs`.

### Frontend

```bash
cd carb-counter/frontend

# Instalar dependencias
npm install

# Crear el archivo .env
# (ver sección Variables de entorno)

# Iniciar el servidor de desarrollo
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

---

## 📱 App Android (Capacitor)

El proyecto incluye configuración de Capacitor para generar una app Android a partir del frontend web.

### Requisitos adicionales
- [Android Studio](https://developer.android.com/studio)

### Generar el APK

```bash
cd frontend

# Compilar el frontend
npm run build

# Sincronizar con el proyecto Android
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

Desde Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**

El APK de debug se genera en:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Para publicar en Google Play se necesita generar un **AAB firmado** con un keystore propio y una cuenta de [Google Play Console](https://play.google.com/console) (25€ pago único).

---

## 🔐 Sistema de roles

| Acción | Anónimo | Usuario | Admin |
|--------|---------|---------|-------|
| Ver alimentos globales | ✅ | ✅ | ✅ |
| Ver detalle de alimento | ✅ | ✅ | ✅ |
| Buscar en Open Food Facts | ❌ | ✅ | ✅ |
| Agregar alimentos propios | ❌ | ✅ | ✅ |
| Editar / eliminar sus alimentos | ❌ | ✅ | ✅ |
| Editar / eliminar cualquier alimento | ❌ | ❌ | ✅ |
| Favoritos y diario | ❌ | ✅ | ✅ |
| Panel de administración | ❌ | ❌ | ✅ |
| Gestión de usuarios | ❌ | ❌ | ✅ |

La protección opera en tres capas: componentes `PrivateRoute` / `AdminRoute` en el frontend, dependencias `get_current_user` / `require_admin` en el backend, y políticas RLS en Supabase.

---

## 🌍 Internacionalización

La app soporta español e inglés usando `react-i18next`. El idioma seleccionado se guarda en `localStorage` y persiste entre sesiones. El botón ES/EN se encuentra en el navbar.

Los archivos de traducción están en:
```
frontend/src/locales/
├── es.json
└── en.json
```

---

## 📦 Dependencias principales

### Backend
```
fastapi
uvicorn
supabase
pydantic[email]
pydantic-settings
python-dotenv
python-multipart
httpx
```

### Frontend
```
react
react-router-dom
axios
react-i18next
i18next
recharts
@capacitor/core
@capacitor/cli
@capacitor/android
```

---

## 🛠️ Decisiones técnicas relevantes

- **JWT con ES256** — Supabase firma los tokens con ES256 (no HS256). La verificación se hace con `supabase.auth.get_user(token)` en lugar de `jwt.decode()` para evitar problemas de algoritmo.
- **`carbs_consumed` guardado en el diario** — El valor de carbos se calcula y guarda al momento del registro. Si el alimento se edita después, el historial no se ve afectado.
- **Open Food Facts desde el frontend** — La búsqueda en OFF se hace directamente desde el navegador ya que su API soporta CORS. Solo el guardado del alimento pasa por el backend.
- **`result.data[0]` en vez de `.maybe_single()`** — La librería `postgrest-py` lanza excepción con código 204 cuando no encuentra filas usando `.maybe_single()`. Se usa `.limit(1).execute()` y se accede con `[0]` para evitar este bug.
- **Rutas fijas antes que dinámicas** — En FastAPI las rutas se evalúan en orden. Las rutas estáticas como `/foods/search-external` deben declararse antes de `/foods/{food_id}`.

---

## 📄 Licencia

Este proyecto es de uso personal/educativo. Si querés usarlo como base para tu propio proyecto, eres libre de hacerlo.

---

*Desarrollado con 🌿 y muchas tazas de café.*
