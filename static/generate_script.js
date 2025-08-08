document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5050/api/personas';

    // --- 페르소나 생성 --- //
    const generateBtn = document.getElementById('generateBtn');
    const countInput = document.getElementById('count');
    const ageRangeMinInput = document.getElementById('age_range_min');
    const ageRangeMaxInput = document.getElementById('age_range_max');
    const genderSelect = document.getElementById('gender');
    const locationInput = document.getElementById('location');
    const generateResultDiv = document.getElementById('generateResult');

    generateBtn.addEventListener('click', async () => {
        const count = parseInt(countInput.value);
        const age_range_min = ageRangeMinInput.value ? parseInt(ageRangeMinInput.value) : undefined;
        const age_range_max = ageRangeMaxInput.value ? parseInt(ageRangeMaxInput.value) : undefined;
        const gender = genderSelect.value || undefined;
        const location = locationInput.value || undefined;

        const demographics = {};
        if (age_range_min !== undefined && age_range_max !== undefined) {
            demographics.age_range = [age_range_min, age_range_max];
        }
        if (gender) {
            demographics.gender = gender;
        }
        if (location) {
            demographics.location = location;
        }

        try {
            generateResultDiv.innerHTML = '생성 중...';
            const response = await fetch(`${API_BASE_URL}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ count, demographics }),
            });
            const data = await response.json();
            if (response.ok) {
                generateResultDiv.innerHTML = `<h3>${data.message}</h3><pre>${JSON.stringify(data.personas, null, 2)}</pre>`;
            } else {
                generateResultDiv.innerHTML = `<p style="color: red;">오류: ${data.message || response.statusText}</p>`;
            }
        } catch (error) {
            generateResultDiv.innerHTML = `<p style="color: red;">네트워크 오류: ${error.message}</p>`;
            console.error('Error generating personas:', error);
        }
    });

    // --- 모든 페르소나 삭제 (생성 페이지에서도 사용) --- //
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const deleteResultDiv = document.getElementById('deleteResult');

    if (deleteAllBtn) { // deleteAllBtn이 현재 페이지에 있을 경우에만 이벤트 리스너 추가
        deleteAllBtn.addEventListener('click', async () => {
            if (!confirm('정말로 모든 페르소나 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                return;
            }

            try {
                deleteResultDiv.innerHTML = '삭제 중...';
                const response = await fetch(`${API_BASE_URL}/delete_all`, {
                    method: 'POST',
                });
                const data = await response.json();
                if (response.ok) {
                    deleteResultDiv.innerHTML = `<p style="color: green;">${data.message}</p>`;
                    // 삭제 후 생성 결과 초기화
                    generateResultDiv.innerHTML = '';
                } else {
                    deleteResultDiv.innerHTML = `<p style="color: red;">오류: ${data.message || response.statusText}</p>`;
                }
            } catch (error) {
                deleteResultDiv.innerHTML = `<p style="color: red;">네트워크 오류: ${error.message}</p>`;
                console.error('Error deleting personas:', error);
            }
        });
    }
});
