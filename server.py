#!/usr/bin/env python3
import http.server
import socketserver
import os
import json
from urllib.parse import urlparse

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        parsed_path = urlparse(self.path)
        
        # Handle firebase-config.js specially to inject environment variables
        if parsed_path.path == '/firebase-config.js':
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            
            # Get environment variables
            api_key = os.environ.get('VITE_FIREBASE_API_KEY', '')
            app_id = os.environ.get('VITE_FIREBASE_APP_ID', '')
            project_id = os.environ.get('VITE_FIREBASE_PROJECT_ID', '')
            
            # Generate the Firebase config JavaScript
            firebase_config_js = f"""// Firebase configuration and initialization
import {{ initializeApp }} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {{ getAuth }} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {{ getFirestore }} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {{
    apiKey: "{api_key}",
    authDomain: "{project_id}.firebaseapp.com",
    projectId: "{project_id}",
    storageBucket: "{project_id}.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "{app_id}"
}};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export the app for other modules
export default app;
"""
            
            self.wfile.write(firebase_config_js.encode('utf-8'))
        else:
            # For all other files, use the default handler
            super().do_GET()

if __name__ == "__main__":
    PORT = 5000
    
    with socketserver.TCPServer(("0.0.0.0", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"Serving HTTP on 0.0.0.0 port {PORT} (http://0.0.0.0:{PORT}/) ...")
        httpd.serve_forever()