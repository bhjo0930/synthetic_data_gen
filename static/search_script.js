document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5050/api/personas';

    // Chart 인스턴스 저장용 변수
    let ageChart, genderChart, locationChart, occupationChart;

    // --- 차트 그리기 함수 --- //
    function drawCharts(personas) {
        // 데이터 집계
        const ageData = {};
        const genderData = {};
        const locationData = {};
        const occupationData = {};

        personas.forEach(persona => {
            const ageGroup = `${Math.floor(persona.age / 10) * 10}대`;
            ageData[ageGroup] = (ageData[ageGroup] || 0) + 1;
            genderData[persona.gender] = (genderData[persona.gender] || 0) + 1;
            locationData[persona.location] = (locationData[persona.location] || 0) + 1;
            occupationData[persona.occupation] = (occupationData[persona.occupation] || 0) + 1;
        });

        // 기존 차트 파괴
        if (ageChart) ageChart.destroy();
        if (genderChart) genderChart.destroy();
        if (locationChart) locationChart.destroy();
        if (occupationChart) occupationChart.destroy();

        // 연령 차트
        const ageCtx = document.getElementById('ageChart').getContext('2d');
        ageChart = new Chart(ageCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(ageData).sort(),
                datasets: [{
                    label: '연령 분포',
                    data: Object.values(ageData),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                }]
            },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: '연령 분포' } }
            }
        });

        // 성별 차트
        const genderCtx = document.getElementById('genderChart').getContext('2d');
        genderChart = new Chart(genderCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(genderData),
                datasets: [{
                    label: '성별 분포',
                    data: Object.values(genderData),
                    backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                }]
            },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: '성별 분포' } }
            }
        });

        // 지역 차트
        const locationCtx = document.getElementById('locationChart').getContext('2d');
        locationChart = new Chart(locationCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(locationData).sort(),
                datasets: [{
                    label: '지역 분포',
                    data: Object.values(locationData),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                }]
            },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: '지역 분포' } }
            }
        });

        // 직업 차트
        const occupationCtx = document.getElementById('occupationChart').getContext('2d');
        occupationChart = new Chart(occupationCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(occupationData).sort(),
                datasets: [{
                    label: '직업 분포',
                    data: Object.values(occupationData),
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                }]
            },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: '직업 분포' } }
            }
        });
    }

    // --- 페르소나 검색 --- //
    const searchBtn = document.getElementById('searchBtn');
    const searchAgeMinInput = document.getElementById('search_age_min');
    const searchAgeMaxInput = document.getElementById('search_age_max');
    const searchGenderSelect = document.getElementById('search_gender');
    const searchLocationInput = document.getElementById('search_location');
    const searchOccupationInput = document.getElementById('search_occupation');
    const searchEducationSelect = document.getElementById('search_education');
    const searchIncomeBracketSelect = document.getElementById('search_income_bracket');
    const searchMaritalStatusSelect = document.getElementById('search_marital_status');
    const searchInterestsInput = document.getElementById('search_interests');
    const searchPersonalityTraitInput = document.getElementById('search_personality_trait');
    const searchValueInput = document.getElementById('search_value');
    const searchLifestyleAttributeInput = document.getElementById('search_lifestyle_attribute');
    const searchMediaConsumptionInput = document.getElementById('search_media_consumption');
    const searchShoppingHabitInput = document.getElementById('search_shopping_habit');
    const searchSocialRelationsInput = document.getElementById('search_social_relations');

    const searchResultDiv = document.getElementById('searchResult');

    searchBtn.addEventListener('click', async () => {
        const age_min = searchAgeMinInput.value ? parseInt(searchAgeMinInput.value) : undefined;
        const age_max = searchAgeMaxInput.value ? parseInt(searchAgeMaxInput.value) : undefined;
        const gender = searchGenderSelect.value || undefined;
        const location = searchLocationInput.value || undefined;
        const occupation = searchOccupationInput.value || undefined;
        const education = searchEducationSelect.value || undefined;
        const income_bracket = searchIncomeBracketSelect.value || undefined;
        const marital_status = searchMaritalStatusSelect.value || undefined;
        const interests = searchInterestsInput.value || undefined;
        const personality_trait = searchPersonalityTraitInput.value || undefined;
        const value = searchValueInput.value || undefined;
        const lifestyle_attribute = searchLifestyleAttributeInput.value || undefined;
        const media_consumption = searchMediaConsumptionInput.value || undefined;
        const shopping_habit = searchShoppingHabitInput.value || undefined;
        const social_relations = searchSocialRelationsInput.value || undefined;

        const queryParams = new URLSearchParams();
        if (age_min !== undefined) queryParams.append('age_min', age_min);
        if (age_max !== undefined) queryParams.append('age_max', age_max);
        if (gender) queryParams.append('gender', gender);
        if (location) queryParams.append('location', location);
        if (occupation) queryParams.append('occupation', occupation);
        if (education) queryParams.append('education', education);
        if (income_bracket) queryParams.append('income_bracket', income_bracket);
        if (marital_status) queryParams.append('marital_status', marital_status);
        if (interests) queryParams.append('interests', interests);
        if (personality_trait) queryParams.append('personality_trait', personality_trait);
        if (value) queryParams.append('value', value);
        if (lifestyle_attribute) queryParams.append('lifestyle_attribute', lifestyle_attribute);
        if (media_consumption) queryParams.append('media_consumption', media_consumption);
        if (shopping_habit) queryParams.append('shopping_habit', shopping_habit);
        if (social_relations) queryParams.append('social_relations', social_relations);

        try {
            searchResultDiv.innerHTML = '검색 중...';
            const response = await fetch(`${API_BASE_URL}/search?${queryParams.toString()}`);
            const data = await response.json();
            if (response.ok) {
                if (data.length > 0) {
                    let html = '';
                    data.forEach(persona => {
                        // persona_values를 values로 매핑
                        persona.values = persona.persona_values; 

                        html += `<div class="persona-card">`;
                        html += `<h3>${persona.name}</h3>`;
                        html += `<p><strong>ID:</strong> ${persona.id}</p>`;
                        html += `<p><strong>나이:</strong> ${persona.age}</p>`;
                        html += `<p><strong>성별:</strong> ${persona.gender}</p>`;
                        html += `<p><strong>지역:</strong> ${persona.location}</p>`;
                        html += `<p><strong>직업:</strong> ${persona.occupation}</p>`;
                        html += `<p><strong>교육:</strong> ${persona.education}</p>`;
                        html += `<p><strong>소득:</strong> ${persona.income_bracket}</p>`;
                        html += `<p><strong>결혼상태:</strong> ${persona.marital_status}</p>`;
                        html += `<p><strong>관심사:</strong> ${persona.interests.join(', ')}</p>`;
                        html += `<p><strong>가치관:</strong> ${persona.values.join(', ')}</p>`;
                        html += `<p><strong>라이프스타일:</strong> ${persona.lifestyle_attributes.join(', ')}</p>`;
                        html += `<p><strong>성격:</strong> ${JSON.stringify(persona.personality_traits)}</p>`;
                        html += `<p><strong>미디어 소비:</strong> ${persona.media_consumption}</p>`;
                        html += `<p><strong>쇼핑 습관:</strong> ${persona.shopping_habit}</p>`;
                        html += `<p><strong>사회적 관계:</strong> ${persona.social_relations.join(', ')}</p>`;
                        html += `</div>`;
                    });
                    searchResultDiv.innerHTML = html;
                    drawCharts(data); // 차트 그리기
                } else {
                    searchResultDiv.innerHTML = '<p>검색 결과가 없습니다.</p>';
                    drawCharts([]); // 결과가 없으면 차트 초기화
                }
            } else {
                searchResultDiv.innerHTML = `<p style="color: red;">오류: ${data.message || response.statusText}</p>`;
                drawCharts([]);
            }
        } catch (error) {
            searchResultDiv.innerHTML = `<p style="color: red;">네트워크 오류: ${error.message}</p>`;
            console.error('Error searching personas:', error);
            drawCharts([]);
        }
    });

    // --- 모든 페르소나 삭제 --- //
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
                    // 삭제 후 검색 결과 초기화
                    searchResultDiv.innerHTML = '';
                    drawCharts([]); // 차트 초기화
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