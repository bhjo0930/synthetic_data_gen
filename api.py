
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from persona_generator import PersonaGenerator
from database_factory import get_database, DatabaseFactory
import json
import os
import logging

app = Flask(__name__)
CORS(app)

# 전역 변수로 지연 초기화
generator = None
db = None

def get_generator():
    global generator
    if generator is None:
        generator = PersonaGenerator()
    return generator

def get_db():
    global db
    if db is None:
        db = get_database()
    return db

# Health check endpoint (빠른 응답을 위해 초기화 전에 설정)
@app.route('/health')
def health_check():
    try:
        db_health = get_db().health_check()
        db_info = DatabaseFactory.get_database_info()
        
        return jsonify({
            "status": "healthy" if db_health else "degraded",
            "service": "synthetic-data-gen",
            "database": {
                "type": db_info['selected_type'],
                "healthy": db_health,
                "configuration": db_info['configuration']
            }
        }), 200 if db_health else 503
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "service": "synthetic-data-gen",
            "error": str(e)
        }), 500

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

    result = get_generator().generate_personas(count=count, 
                                               demographics_constraints=demographics,
                                               diversity_constraints=diversity_constraints)
    
    personas = result["personas"]
    generation_stats = result["generation_stats"]
    
    # 생성된 페르소나를 DB에 저장
    for persona in personas:
        get_db().insert_persona(persona)
    
    return jsonify({
        "message": f"{len(personas)} valid personas generated and saved.",
        "personas": personas,
        "generation_stats": generation_stats,
        "success_rate": f"{result['success_rate']:.1f}%"
    })

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

    # limit과 offset 매개변수 추가 (기본값: limit=1000, offset=0)
    limit = request.args.get('limit', type=int, default=1000)
    offset = request.args.get('offset', type=int, default=0)

    personas = get_db().search_personas(filters=filters, limit=limit, offset=offset)
    return jsonify(personas)

@app.route('/api/personas/<persona_id>', methods=['GET'])
def get_persona_api(persona_id):
    persona = get_db().get_persona(persona_id)
    if persona:
        return jsonify(persona)
    return jsonify({"message": "Persona not found"}), 404

@app.route('/api/personas/delete_all', methods=['POST'])
def delete_all_personas_api():
    get_db().delete_all_personas()
    return jsonify({"message": "All personas deleted from database."})

@app.route('/api/personas/stats', methods=['GET'])
def get_personas_stats_api():
    """데이터베이스 통계 정보를 반환합니다"""
    try:
        stats = get_db().get_statistics()
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/database/info', methods=['GET'])
def get_database_info_api():
    """현재 데이터베이스 설정 정보를 반환합니다"""
    try:
        info = DatabaseFactory.get_database_info()
        return jsonify(info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # DB 초기화 (테스트용)
    get_db().delete_all_personas()
    app.run(debug=True, host='0.0.0.0', port=5050)
