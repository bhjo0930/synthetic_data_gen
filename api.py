
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from persona_generator import PersonaGenerator
from database import PersonaDatabase
import json
import os

app = Flask(__name__)
CORS(app)

generator = PersonaGenerator()
db = PersonaDatabase()

# 정적 파일 서빙 설정
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# Direct static file routes for HTML references
@app.route('/css/<path:filename>')
def css_files(filename):
    return send_from_directory('static/css', filename)

@app.route('/<filename>.js')
def js_files(filename):
    return send_from_directory('static', filename + '.js')

# Playground 페이지 서빙 (생성 페이지)
@app.route('/')
@app.route('/generate.html')
def generate_page():
    return send_from_directory('static', 'generate.html')

# 검색 페이지 서빙
@app.route('/search.html')
def search_page():
    return send_from_directory('static', 'search.html')

@app.route('/api/personas/generate', methods=['POST'])
def generate_personas_api():
    data = request.get_json()
    count = data.get('count', 1)
    demographics = data.get('demographics', {})
    diversity_constraints = data.get('diversity_constraints', {})

    personas = generator.generate_personas(count=count, 
                                           demographics_constraints=demographics,
                                           diversity_constraints=diversity_constraints)
    
    # 생성된 페르소나를 DB에 저장
    for persona in personas:
        db.insert_persona(persona)
        
    return jsonify({"message": f"{len(personas)} personas generated and saved.",
                    "personas": personas})

@app.route('/api/personas/search', methods=['GET'])
def search_personas_api():
    filters = {
        "age_min": request.args.get('age_min', type=int),
        "age_max": request.args.get('age_max', type=int),
        "location": request.args.get('location'),
        "gender": request.args.get('gender'),
        "occupation": request.args.get('occupation'),
        "education": request.args.get('education'),
        "income_bracket": request.args.get('income_bracket'),
        "marital_status": request.args.get('marital_status'),
        "interests": request.args.get('interests'),
        "personality_trait": request.args.get('personality_trait'),
        "value": request.args.get('value'),
        "lifestyle_attribute": request.args.get('lifestyle_attribute'),
        "media_consumption": request.args.get('media_consumption'),
        "shopping_habit": request.args.get('shopping_habit'),
        "social_relations": request.args.get('social_relations')
    }
    # None 값 필터링
    filters = {k: v for k, v in filters.items() if v is not None}

    personas = db.search_personas(filters=filters)
    return jsonify(personas)

@app.route('/api/personas/<persona_id>', methods=['GET'])
def get_persona_api(persona_id):
    persona = db.get_persona(persona_id)
    if persona:
        return jsonify(persona)
    return jsonify({"message": "Persona not found"}), 404

@app.route('/api/personas/delete_all', methods=['POST'])
def delete_all_personas_api():
    db.delete_all_personas()
    return jsonify({"message": "All personas deleted from database."})

if __name__ == '__main__':
    # DB 초기화 (테스트용)
    db.delete_all_personas()
    app.run(debug=True, port=5050)
