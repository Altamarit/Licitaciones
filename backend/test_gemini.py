# test_gemini.py
from google import genai
import time

API_KEY = "AIzaSyDdkTM87DzIfvLpUtva843_-fl4ORvDY0A"

client = genai.Client(api_key=API_KEY)

print("⏳ Esperando 10 segundos (rate limit por minuto)...")
time.sleep(10)

print("🧪 Probando con gemini-2.5-flash-lite (el más generoso en cuota)...")
try:
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents="Hola"
    )
    print("✅ ÉXITO:", response.text)
except Exception as e:
    print(f"❌ ERROR: {type(e).__name__}: {e}")
    print("\n💡 Posibles causas:")
    print("   - Rate limit por minuto (espera 1 minuto)")
    print("   - Cuenta nueva sin habilitar billing")
    print("   - Región no soportada")