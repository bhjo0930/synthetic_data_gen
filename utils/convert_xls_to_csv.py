import pandas as pd
import sys
import os

def convert_excel_to_csv(input_file):
    """
    Reads an Excel file and saves it as a CSV with 'utf-8-sig' encoding.
    """
    if not input_file.endswith('.xlsx'):
        print("오류: 입력 파일은 .xlsx 형식이어야 합니다.")
        return

    try:
        print(f"'{input_file}' 파일을 읽고 있습니다...")
        df = pd.read_excel(input_file)

        output_file = os.path.splitext(input_file)[0] + '.csv'
        
        print(f"'{output_file}' 파일로 변환하여 저장합니다...")
        df.to_csv(output_file, index=False, encoding='utf-8-sig')
        
        print("성공적으로 변환되었습니다.")

    except FileNotFoundError:
        print(f"오류: '{input_file}' 파일을 찾을 수 없습니다.")
    except Exception as e:
        print(f"오류가 발생했습니다: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        convert_excel_to_csv(sys.argv[1])
    else:
        print("사용법: python convert_to_csv.py <입력_Excel_파일.xlsx>")
