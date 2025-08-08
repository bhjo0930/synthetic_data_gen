import pytest
from playwright.sync_api import Page, expect
import json
import time
import socket

BASE_URL = "http://127.0.0.1:5050"

def wait_for_port(port, host='127.0.0.1', timeout=30.0):
    """Wait until a port is open on the host."""
    start_time = time.time()
    while True:
        try:
            with socket.create_connection((host, port), timeout=1) as sock:
                break
        except (ConnectionRefusedError, socket.timeout):
            time.sleep(0.5)
            if time.time() - start_time >= timeout:
                raise TimeoutError(f"Port {port} on {host} did not open within {timeout} seconds")

def test_persona_playground(page: Page):
    # Flask 서버가 시작될 때까지 기다립니다.
    wait_for_port(5050)

    page.goto(BASE_URL)

    # 1. 페이지 로드 확인
    expect(page.locator("h1")).to_have_text("페르소나 생성 Playground")

    # 2. 모든 페르소나 삭제 (초기화)
    page.on("dialog", lambda dialog: dialog.accept()) # 람다 함수로 수정
    page.locator("#deleteAllBtn").click()
    expect(page.locator("#deleteResult")).to_contain_text("All personas deleted from database.")

    # 3. 페르소나 생성 테스트
    page.locator("#count").fill("1")
    page.locator("#age_range_min").fill("25")
    page.locator("#age_range_max").fill("35")
    page.locator("#gender").select_option("남성")
    page.locator("#location").fill("서울")
    page.locator("#generateBtn").click()
    
    # 생성 결과 JSON 파싱 및 내용 확인
    # <pre> 태그의 inner_text()를 직접 가져와서 JSON 파싱
    generate_result_pre_text = page.locator("#generateResult pre").inner_text()
    generated_data = json.loads(generate_result_pre_text)
    
    expect(page.locator("#generateResult h3")).to_contain_text("1 personas generated and saved.")
    persona = generated_data[0] # personas 배열의 첫 번째 요소
    assert 25 <= persona["demographics"]["age"] <= 35 # 파이썬 assert로 변경
    assert persona["demographics"]["gender"] == "남성" # 파이썬 assert로 변경
    assert persona["demographics"]["location"] == "서울" # 파이썬 assert로 변경

    # 4. 페르소나 검색 테스트
    page.locator("#search_age_min").fill("25")
    page.locator("#search_age_max").fill("35")
    page.locator("#search_location").fill("서울")
    page.locator("#searchBtn").click()
    
    expect(page.locator("#searchResult")).to_contain_text("성별: 남성")
    expect(page.locator("#searchResult")).to_contain_text("지역: 서울")

    # 5. 검색 결과 없음 테스트
    page.locator("#search_location").fill("부산") # 서울에서 부산으로 변경
    page.locator("#searchBtn").click()
    expect(page.locator("#searchResult")).to_contain_text("검색 결과가 없습니다.")

    print("Playground 페이지 테스트 완료!")