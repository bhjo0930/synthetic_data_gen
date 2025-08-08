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

    // --- 페르소나 검색 --- //
    const searchBtn = document.getElementById('searchBtn');
    const searchAgeMinInput = document.getElementById('search_age_min');
    const searchAgeMaxInput = document.getElementById('search_age_max');
    const searchLocationInput = document.getElementById('search_location');
    const searchInterestsInput = document.getElementById('search_interests');
    const searchResultDiv = document.getElementById('searchResult');

    searchBtn.addEventListener('click', async () => {
        const age_min = searchAgeMinInput.value ? parseInt(searchAgeMinInput.value) : undefined;
        const age_max = searchAgeMaxInput.value ? parseInt(searchAgeMaxInput.value) : undefined;
        const location = searchLocationInput.value || undefined;
        const interests = searchInterestsInput.value || undefined;

        const queryParams = new URLSearchParams();
        if (age_min !== undefined) queryParams.append('age_min', age_min);
        if (age_max !== undefined) queryParams.append('age_max', age_max);
        if (location) queryParams.append('location', location);
        if (interests) queryParams.append('interests', interests);

        try {
            searchResultDiv.innerHTML = '검색 중...';
            const response = await fetch(`${API_BASE_URL}/search?${queryParams.toString()}`);
            const data = await response.json();
            if (response.ok) {
                if (data.length > 0) {
                    let html = '';
                    data.forEach(persona => {
                        html += `<div class="persona-item"><h4>${persona.name} (ID: ${persona.id})</h4>`;
                        html += `<p><strong>나이:</strong> ${persona.age}, <strong>성별:</strong> ${persona.gender}, <strong>지역:</strong> ${persona.location}</p>`;
                        html += `<p><strong>직업:</strong> ${persona.occupation}, <strong>교육:</strong> ${persona.education}, <strong>소득:</strong> ${persona.income_bracket}</p>`;
                        html += `<p><strong>관심사:</strong> ${persona.interests.join(', ')}</p>`;
                        html += `<p><strong>성격:</strong> ${JSON.stringify(persona.personality_traits)}</p>`;
                        html += `</div>`;
                    });
                    searchResultDiv.innerHTML = html;
                } else {
                    searchResultDiv.innerHTML = '<p>검색 결과가 없습니다.</p>';
                }
            } else {
                searchResultDiv.innerHTML = `<p style="color: red;">오류: ${data.message || response.statusText}</p>`;
            }
        } catch (error) {
            searchResultDiv.innerHTML = `<p style="color: red;">네트워크 오류: ${error.message}</p>`;
            console.error('Error searching personas:', error);
        }
    });

    // --- 모든 페르소나 삭제 --- //
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const deleteResultDiv = document.getElementById('deleteResult');

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
                // 삭제 후 검색 결과 초기화
                searchResultDiv.innerHTML = '';
                generateResultDiv.innerHTML = '';
            } else {
                deleteResultDiv.innerHTML = `<p style="color: red;">오류: ${data.message || response.statusText}</p>`;
            }
        } catch (error) {
            deleteResultDiv.innerHTML = `<p style="color: red;">네트워크 오류: ${error.message}</p>`;
            console.error('Error deleting personas:', error);
        }
    });
});
