from flask import Flask, request, jsonify
from flask_cors import CORS
from scanner_engine import analyze_domain

app = Flask(__name__)
# Enable CORS so the React frontend running on port 5173 can talk to this API
CORS(app)

@app.route('/api/scan', methods=['POST'])
def scan_endpoint():
    data = request.json
    if not data or 'url' not in data:
        return jsonify({"error": "Missing URL parameter"}), 400
        
    target_url = data['url']
    
    # Clean the URL
    target_url = target_url.replace("https://", "").replace("http://", "").split("/")[0]
    
    try:
        # Run the deep OSINT and Cryptographic scan
        analysis = analyze_domain(target_url)
        return jsonify(analysis)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the API on port 5000
    print("Q-CAPS OSINT API running on http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
