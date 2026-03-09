from supabase import create_client, Client
from app.config import settings

# Creamos UNA sola instancia del cliente (patrón singleton)
# Esta instancia usa la service_role key, que tiene acceso total
# Por eso NUNCA debe salir del backend
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)