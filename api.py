
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS # CORS 임포트
from persona_generator import PersonaGenerator
from database import PersonaDatabase
import json
import os

app = Flask(__name__)
CORS(app) # CORS 활성화

generator = PersonaGenerator()
db = PersonaDatabase()

# 정적 파일 서빙 설정
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# Playground 페이지 서빙
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

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
        "interests": request.args.get('interests')
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
