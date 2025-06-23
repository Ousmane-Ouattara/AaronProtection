#!/usr/bin/env python3
"""
Lancement rapide du dashboard de sonde
Usage: python quick_dashboard.py
"""

import subprocess
import webbrowser
import time
import sys
import os

# Configuration
PORT = 8080
DASHBOARD_URL = f"http://localhost:{PORT}/dashboard.html"

def main():
    print("🔍 Lancement rapide du dashboard de sonde\n")
    
    # Vérifier si le fichier dashboard.html existe
    if not os.path.exists("dashboard.html"):
        print("❌ Fichier dashboard.html introuvable")
        print("💡 Assurez-vous que le fichier est dans le même dossier")
        return
    
    print(f"🚀 Démarrage du serveur sur le port {PORT}...")
    
    try:
        # Démarrer le serveur en arrière-plan
        server_process = subprocess.Popen([
            sys.executable, "-m", "http.server", str(PORT)
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Attendre que le serveur démarre
        print("⏳ Attente du démarrage du serveur...")
        time.sleep(3)
        
        # Ouvrir le navigateur directement sur le dashboard
        print("🌐 Ouverture du dashboard...")
        webbrowser.open(DASHBOARD_URL)
        
        print(f"""
✅ Dashboard de sonde lancé !

🔗 URL directe: {DASHBOARD_URL}
🔄 Actualisation automatique: 30s
⏹️  Pour arrêter: Ctrl+C

📊 Le dashboard lit automatiquement log_sonde.csv
        """)
        
        # Garder le script actif
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n🛑 Arrêt du serveur...")
            server_process.terminate()
            server_process.wait()
            print("✅ Serveur arrêté")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    main()