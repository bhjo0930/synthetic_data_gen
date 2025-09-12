import pandas as pd
import sys
import os
from dotenv import load_dotenv
import google.generativeai as genai
from tqdm import tqdm
import argparse
import time

# .env 파일에서 환경 변수 로드
load_dotenv()

# API 키 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_API_KEY_HERE":
    print("오류: .env 파일에 GEMINI_API_KEY를 설정해야 합니다.")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)
# 사용자 요청에 따라 gemini-2.5-flash 모델을 사용합니다.
model = genai.GenerativeModel('gemini-2.5-flash')

def get_generation_prompt(persona_data):
    """MBTI와 라이프스타일 생성을 위한 프롬프트를 생성합니다."""
    return f"""당신은 아래 페르소나 정보를 바탕으로, 해당 인물의 MBTI와 라이프스타일을 추론하는 역할을 맡았습니다.

---
--- 페르소나 정보 ---
{persona_data}
---------------------

위 정보를 바탕으로 이 인물의 MBTI와 라이프스타일을 각각 한 단어로 예측해주세요.
형식은 'MBTI | 라이프스타일' 로만 답해주세요. (예: INFP | 집순이)
"""

def create_mbti_lifestyle(input_file, output_file):
    """CSV 파일의 각 행에 대해 MBTI와 라이프스타일을 생성하고 결과를 저장합니다."""
    try:
        # 출력 파일이 이미 존재하면 해당 파일을 읽고, 없으면 입력 파일을 읽습니다.
        if os.path.exists(output_file):
            print(f"'{output_file}' 파일이 존재하여 여기서부터 이어서 작업합니다.")
            df = pd.read_csv(output_file)
        else:
            print(f"'{input_file}'에서 데이터를 읽어 새 작업을 시작합니다.")
            df = pd.read_csv(input_file)

        # 라이프스타일과 성격특성(MBTI) 열이 없으면 추가합니다.
        if '라이프스타일' not in df.columns:
            df['라이프스타일'] = None
        if '성격특성' not in df.columns:
            df['성격특성'] = None
            
    except FileNotFoundError:
        print(f"오류: 입력 파일 '{input_file}'을 찾을 수 없습니다.")
        return
    except Exception as e:
        print(f"파일 읽기 중 오류 발생: {e}")
        return

    # 처리해야 할 행만 필터링합니다.
    to_process = df[df['성격특성'].isnull() | df['라이프스타일'].isnull()]
    
    if to_process.empty:
        print("모든 인물의 MBTI와 라이프스타일 정보가 이미 채워져 있습니다. 작업을 종료합니다.")
        return

    print(f"총 {len(df)}명 중 {len(to_process)}명의 MBTI와 라이프스타일을 생성합니다.")

    # tqdm을 사용하여 진행 상황 표시
    for index, row in tqdm(to_process.iterrows(), total=to_process.shape[0], desc="MBTI/라이프스타일 생성 중"):
        persona_data_str = '\n'.join([f"{col}: {val}" for col, val in row.items() if col not in ['라이프스타일', '성격특성']])
        prompt = get_generation_prompt(persona_data_str)
        
        try:
            response = model.generate_content(prompt)
            # 응답 형식: "MBTI | 라이프스타일"
            parts = response.text.strip().split('|')
            if len(parts) == 2:
                mbti = parts[0].strip()
                lifestyle = parts[1].strip()
                df.loc[index, '성격특성'] = mbti
                df.loc[index, '라이프스타일'] = lifestyle
            else:
                df.loc[index, '성격특성'] = "오류"
                df.loc[index, '라이프스타일'] = "오류"

        except Exception as e:
            print(f"\n{row['이름']}님 처리 중 오류 발생: {e}")
            df.loc[index, '성격특성'] = "API 오류"
            df.loc[index, '라이프스타일'] = "API 오류"
            # API 오류 발생 시 잠시 대기
            time.sleep(2)

        # 100명 처리할 때마다 중간 저장
        if (index + 1) % 100 == 0:
            print(f"\n{index + 1}번째 행까지 처리 후 중간 저장...")
            df.to_csv(output_file, index=False, encoding='utf-8-sig')

    print("모든 작업 완료. 최종 결과를 저장합니다...")
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    print(f"성공적으로 '{output_file}'에 저장되었습니다.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="가상 인물 데이터에 MBTI와 라이프스타일을 생성하여 추가합니다.",
        epilog="예시: python create_mbti_lifestyle.py Virtual_People_Data_20250820_1545.csv Virtual_People_Data_20250820_1545_CONV.csv"
    )
    parser.add_argument("input_file", help="원본 가상 인물 데이터 CSV 파일")
    parser.add_argument("output_file", help="MBTI, 라이프스타일이 추가된 결과를 저장할 CSV 파일")

    args = parser.parse_args()
    create_mbti_lifestyle(args.input_file, args.output_file)