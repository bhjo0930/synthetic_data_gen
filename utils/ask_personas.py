import pandas as pd
import sys
import os
from dotenv import load_dotenv
import google.generativeai as genai
from tqdm import tqdm
import argparse
from collections import Counter
import re

# .env 파일에서 환경 변수 로드
load_dotenv()

# API 키 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_API_KEY_HERE":
    print("오류: .env 파일에 GEMINI_API_KEY를 설정해야 합니다.")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def read_survey(survey_file):
    """설문 파일을 읽어 질문과 선택지를 반환합니다."""
    try:
        with open(survey_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        question = lines[0].strip()
        options = [line.strip() for line in lines[1:] if line.strip()]
        return question, options
    except FileNotFoundError:
        print(f"오류: 설문 파일 '{survey_file}'을 찾을 수 없습니다.")
        sys.exit(1)
    except Exception as e:
        print(f"설문 파일 읽기 중 오류 발생: {e}")
        sys.exit(1)

def get_persona_prompt(persona_name, persona_data, question, options):
    """페르소나 기반 질문을 위한 프롬프트를 생성합니다."""
    options_string = "\n".join(options)
    prompt = f"""당신은 아래와 같은 특징을 가진 가상 인물 '{persona_name}'입니다. 이 페르소나에 몰입해서 다음 질문에 답해주세요.

--- 페르소나 정보 ---
{persona_data}
---------------------

질문: {question}

아래 선택지 중에서 가장 적절한 답변 하나를 골라 '번호. 내용' 형식으로만 답해주세요. 다른 설명은 필요 없습니다.

--- 선택지 ---
{options_string}
---------------------
"""
    return prompt

def run_survey(persona_file, survey_file):
    """CSV 파일의 각 행을 페르소나로 하여 질문하고 결과를 리스트로 반환합니다."""
    print(f"'{survey_file}'에서 설문 정보를 읽고 있습니다...")
    question, options = read_survey(survey_file)
    
    try:
        print(f"'{persona_file}'에서 페르소나 데이터를 읽고 있습니다...")
        df = pd.read_csv(persona_file)

        if '이름' not in df.columns:
            print("오류: 페르소나 파일에 '이름' 열이 없습니다.")
            return None

        all_results = []
        for index, row in tqdm(df.iterrows(), total=df.shape[0], desc="페르소나에게 질문 중"):
            persona_name = row['이름']
            persona_data_str = '\n'.join([f"{col}: {val}" for col, val in row.items()])
            prompt = get_persona_prompt(persona_name, persona_data_str, question, options)
            
            try:
                response = model.generate_content(prompt)
                answer = response.text.strip()
                all_results.append(answer)
            except Exception as e:
                print(f"  - {persona_name} 페르소나 처리 중 오류 발생: {e}")
                all_results.append("답변 생성 오류")
        return all_results, question, options

    except FileNotFoundError:
        print(f"오류: '{persona_file}' 파일을 찾을 수 없습니다.")
        return None
    except Exception as e:
        print(f"오류가 발생했습니다: {e}")
        return None

def analyze_results(results, options):
    """설문 결과를 분석합니다."""
    # 번호만 추출하기 위해 정규 표현식 사용 (예: "1. 내용" -> "1")
    cleaned_results = [re.match(r'^(\d+)', res).group(1) if re.match(r'^(\d+)', res) else '기타' for res in results]
    counts = Counter(cleaned_results)
    
    total = len(cleaned_results)
    analysis = []
    
    # 옵션 순서대로 결과 정렬
    for i, option in enumerate(options, 1):
        option_num_str = str(i)
        count = counts.get(option_num_str, 0)
        percentage = (count / total) * 100 if total > 0 else 0
        analysis.append({"option": option, "count": count, "percentage": percentage})
        
    # '기타' 답변 처리
    if '기타' in counts:
        count = counts['기타']
        percentage = (count / total) * 100 if total > 0 else 0
        analysis.append({"option": "기타/무효", "count": count, "percentage": percentage})
        
    return analysis

def generate_html_report(analysis, question, html_file):
    """분석 결과를 HTML 리포트로 생성합니다."""
    table_rows = ""
    bar_rows = ""
    for item in analysis:
        table_rows += f"<tr><td>{item['option']}</td><td>{item['count']}</td><td>{item['percentage']:.2f}%</td></tr>"
        bar_rows += f"""<div class=\"bar-row\">
                <div class=\"bar-label\">{item['option']}</div>
                <div class=\"bar-wrapper\">
                    <div class=\"bar\" style=\"width: {item['percentage']:.2f}%;\">{item['percentage']:.2f}%</div>
                </div>
            </div>"""

    html_content = f"""<!DOCTYPE html>
<html lang=\"ko\">
<head>
    <meta charset=\"UTF-8\">
    <title>설문조사 결과 분석</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen-Sans, Ubuntu, Cantarell, \"Helvetica Neue\", sans-serif; margin: 2em; background-color: #f9f9f9; color: #333; }}
        h1 {{ color: #2c3e50; text-align: center; }}
        h2 {{ color: #34495e; text-align: center; font-weight: normal; }}
        table {{ border-collapse: collapse; width: 80%; margin: 2em auto; box-shadow: 0 2px 15px rgba(0,0,0,0.1); background-color: white; }}
        th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
        th {{ background-color: #4CAF50; color: white; }}
        tr:nth-child(even) {{ background-color: #f2f2f2; }}
        .container {{ max-width: 900px; margin: auto; }}
        .bar-container {{ width: 80%; margin: 2em auto; padding: 2em; box-shadow: 0 2px 15px rgba(0,0,0,0.1); background-color: white; border-radius: 8px; }}
        .bar-row {{ display: flex; align-items: center; margin-bottom: 10px; }}
        .bar-label {{ width: 30%; padding-right: 10px; text-align: right; }}
        .bar-wrapper {{ flex-grow: 1; background-color: #e0e0e0; border-radius: 5px; }}
        .bar {{ height: 28px; line-height: 28px; background-color: #5cacee; text-align: right; padding-right: 8px; color: white; border-radius: 5px; white-space: nowrap; overflow: hidden; box-sizing: border-box; transition: width 0.5s ease-in-out; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 설문조사 결과 분석</h1>
        <h2>{question}</h2>
        
        <h3>📋 요약 테이블</h3>
        <table>
            <tr>
                <th>선택지</th>
                <th>응답 수</th>
                <th>비율 (%)</th>
            </tr>
            {table_rows}
        </table>

        <h3>📈 시각화</h3>
        <div class="bar-container">
            {bar_rows}
        </div>
    </div>
</body>
</html>"""

    try:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"성공적으로 '{html_file}'에 HTML 리포트를 저장했습니다.")
    except Exception as e:
        print(f"HTML 리포트 저장 중 오류 발생: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="가상 인물(페르소나)에게 설문 조사를 수행하고 결과를 분석하여 HTML 리포트를 생성합니다.",
        epilog="예시: python ask_personas.py Virtual_People_Data_20250820_1545_CONV.csv survey.txt result.html"
    )
    parser.add_argument("persona_file", help="가상 인물 정보가 포함된 CSV 파일 경로")
    parser.add_argument("survey_file", help="첫 줄에 질문, 그 다음 줄부터 선택지가 포함된 설문 파일 경로")
    parser.add_argument("output_html_file", help="분석 결과를 저장할 HTML 파일 경로")

    args = parser.parse_args()

    results, question, options = run_survey(args.persona_file, args.survey_file)
    if results:
        analysis_data = analyze_results(results, options)
        generate_html_report(analysis_data, question, args.output_html_file)