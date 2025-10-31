from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "service": "minimal-test"}), 200

@app.route('/')
def hello():
    return jsonify({"message": "Hello from minimal Flask app"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5050)