import requests
import time
from datetime import datetime

# === CONFIG ===
URL = "https://aaronprotection.onrender.com"
INTERVAL = 60  # en secondes
LOG_FILE = "log_sonde.csv"

# === Initialisation ===
with open(LOG_FILE, "a") as f:
    f.write("date_heure;latence_ms;status_code\n")

# === Boucle de ping ===
print(f"[SONDE] Surveillance de {URL} chaque {INTERVAL}s...\n")

while True:
    start_time = time.time()
    try:
        response = requests.get(URL, timeout=10)
        latency = round((time.time() - start_time) * 1000, 2)
        status = response.status_code
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Écriture dans le log
        with open(LOG_FILE, "a") as f:
            f.write(f"{now};{latency};{status}\n")

        print(f"[{now}] ➜ {status} en {latency}ms")

    except Exception as e:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(LOG_FILE, "a") as f:
            f.write(f"{now};ERROR;0\n")
        print(f"[{now}] ❌ Erreur : {e}")

    time.sleep(INTERVAL)
