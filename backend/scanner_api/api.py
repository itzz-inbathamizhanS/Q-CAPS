from flask import Flask, request, jsonify
from flask_cors import CORS
from scanner_engine import analyze_domain
import re

app = Flask(__name__)
# Enable CORS so the React frontend running on port 5173 can talk to this API
CORS(app)

# Basic hostname validation pattern
HOSTNAME_REGEX = re.compile(
    r'^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*\.[A-Za-z]{2,}$'
)

@app.route('/api/scan', methods=['POST'])
def scan_endpoint():
    data = request.json
    if not data or 'url' not in data:
        return jsonify({"error": "Missing URL parameter"}), 400
        
    target_url = data['url']
    
    # Clean the URL
    target_url = target_url.replace("https://", "").replace("http://", "").split("/")[0]
    
    # Validate hostname to prevent SSRF / injection
    if not HOSTNAME_REGEX.match(target_url):
        return jsonify({"error": "Invalid hostname format"}), 400
    
    try:
        # Run the deep OSINT and Cryptographic scan
        analysis = analyze_domain(target_url)
        return jsonify(analysis)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Q-CAPS OSINT API running on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)

