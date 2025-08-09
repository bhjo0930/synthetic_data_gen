document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5050/api/personas';
    
    // OLAP 기능 변수
    let currentData = [];
    let filteredData = [];

    // Chart 인스턴스 저장용 변수
    let ageChart, genderChart, locationChart, occupationChart;
    let educationChart, incomeChart, maritalChart, ageEducationChart;
    let mediaChart, shoppingChart;

    // OLAP UI 초기화
    initializeOLAP();

    // Neo-Brutalism 색상 팔레트
    const NEO_COLORS = {
        primary: ['#FF0000', '#0000FF', '#FFFF00', '#00FF00', '#FF00FF'],
        background: '#FFFFFF',
        border: '#000000',
        text: '#000000'
    };

    // Neo-Brutalism Chart 기본 설정
    const NEO_CHART_OPTIONS = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: false },
            legend: { 
                display: true,
                position: 'bottom',
                labels: {
                    color: NEO_COLORS.text,
                    font: {
                        family: 'Arial Black, Impact, sans-serif',
                        weight: 900,
                        size: 12
                    },
                    boxWidth: 20,
                    boxHeight: 20,
                    borderWidth: 2,
                    borderColor: NEO_COLORS.border
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: true,
                    color: NEO_COLORS.border,
                    lineWidth: 2
                },
                ticks: {
                    color: NEO_COLORS.text,
                    font: {
                        family: 'Arial Black, Impact, sans-serif',
                        weight: 900,
                        size: 11
                    }
                },
                border: {
                    color: NEO_COLORS.border,
                    width: 3
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: NEO_COLORS.border,
                    lineWidth: 2
                },
                ticks: {
                    color: NEO_COLORS.text,
                    font: {
                        family: 'Arial Black, Impact, sans-serif',
                        weight: 900,
                        size: 11
                    }
                },
                border: {
                    color: NEO_COLORS.border,
                    width: 3
                }
            }
        },
        elements: {
            bar: {
                borderWidth: 3,
                borderColor: NEO_COLORS.border
            },
            arc: {
                borderWidth: 3,
                borderColor: NEO_COLORS.border
            }
        }
    };

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
                    label: 'AGE DISTRIBUTION',
                    data: Object.values(ageData),
                    backgroundColor: NEO_COLORS.primary[0], // 빨간색
                    borderColor: NEO_COLORS.border,
                    borderWidth: 3
                }]
            },
            options: {
                ...NEO_CHART_OPTIONS,
                plugins: {
                    ...NEO_CHART_OPTIONS.plugins,
                    legend: { display: false }
                }
            }
        });

        // 성별 차트
        const genderCtx = document.getElementById('genderChart').getContext('2d');
        genderChart = new Chart(genderCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(genderData),
                datasets: [{
                    label: 'GENDER DISTRIBUTION',
                    data: Object.values(genderData),
                    backgroundColor: [NEO_COLORS.primary[1], NEO_COLORS.primary[0]], // 파란색, 빨간색
                    borderColor: NEO_COLORS.border,
                    borderWidth: 3
                }]
            },
            options: {
                ...NEO_CHART_OPTIONS,
                scales: {} // 파이 차트에는 스케일이 필요 없음
            }
        });

        // 지역 차트
        const locationCtx = document.getElementById('locationChart').getContext('2d');
        locationChart = new Chart(locationCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(locationData).sort(),
                datasets: [{
                    label: 'LOCATION DISTRIBUTION',
                    data: Object.values(locationData),
                    backgroundColor: NEO_COLORS.primary[3], // 초록색
                    borderColor: NEO_COLORS.border,
                    borderWidth: 3
                }]
            },
            options: {
                ...NEO_CHART_OPTIONS,
                plugins: {
                    ...NEO_CHART_OPTIONS.plugins,
                    legend: { display: false }
                }
            }
        });

        // 직업 차트
        const occupationCtx = document.getElementById('occupationChart').getContext('2d');
        occupationChart = new Chart(occupationCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(occupationData).sort(),
                datasets: [{
                    label: 'OCCUPATION DISTRIBUTION',
                    data: Object.values(occupationData),
                    backgroundColor: NEO_COLORS.primary[2], // 노란색
                    borderColor: NEO_COLORS.border,
                    borderWidth: 3
                }]
            },
            options: {
                ...NEO_CHART_OPTIONS,
                plugins: {
                    ...NEO_CHART_OPTIONS.plugins,
                    legend: { display: false }
                }
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
                        // 서버에서 이미 파싱된 배열 필드들 처리 (null 체크 추가)
                        persona.values = persona.values || [];
                        persona.interests = persona.interests || [];
                        persona.lifestyle_attributes = persona.lifestyle_attributes || [];
                        persona.social_relations = persona.social_relations || []; 

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

    // === OLAP 기능 구현 === //
    
    function initializeOLAP() {
        // 슬라이서 토글 기능
        initializeSlicers();
        
        // 탭 기능
        initializeTabs();
        
        // 필터 컨트롤 기능
        initializeFilterControls();
        
        // 피벗 테이블 기능
        initializePivotTable();
        
        // 초기 데이터 로드
        loadAllData();
    }

    function initializeSlicers() {
        const slicerHeaders = document.querySelectorAll('.slicer-header');
        slicerHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.slicer-section');
                section.classList.toggle('collapsed');
            });
        });

        // 초기 상태에서 모든 섹션이 접혀있도록 설정 (HTML에서 이미 collapsed 클래스가 있음)
    }

    function initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // 탭 버튼 활성화
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // 탭 콘텐츠 표시
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    function initializeFilterControls() {
        const applyFiltersBtn = document.getElementById('applyFilters');
        const clearFiltersBtn = document.getElementById('clearFilters');

        applyFiltersBtn.addEventListener('click', () => {
            applyFilters();
        });

        clearFiltersBtn.addEventListener('click', () => {
            clearAllFilters();
        });
    }

    function initializePivotTable() {
        const generatePivotBtn = document.getElementById('generatePivot');
        generatePivotBtn.addEventListener('click', () => {
            generatePivotTable();
        });
    }

    function loadAllData() {
        fetch(`${API_BASE_URL}/search`)
            .then(response => response.json())
            .then(data => {
                currentData = data;
                filteredData = data;
                updateOLAPDashboard();
            })
            .catch(error => {
                console.error('Error loading data:', error);
            });
    }

    function applyFilters() {
        const filters = collectFilters();
        
        filteredData = currentData.filter(persona => {
            return matchesFilters(persona, filters);
        });
        
        updateOLAPDashboard();
    }

    function collectFilters() {
        const filters = {};
        
        // 나이 범위
        const ageMin = document.getElementById('search_age_min').value;
        const ageMax = document.getElementById('search_age_max').value;
        if (ageMin) filters.age_min = parseInt(ageMin);
        if (ageMax) filters.age_max = parseInt(ageMax);
        
        // 체크박스 필터들
        filters.gender = getCheckedValues('genderSlicer');
        filters.education = getCheckedValues('educationSlicer');
        filters.income_bracket = getCheckedValues('incomeSlicer');
        filters.marital_status = getCheckedValues('maritalSlicer');
        
        // 텍스트 필터들
        const textFilters = ['location', 'occupation', 'interests', 'value', 'lifestyle_attribute', 'personality_trait', 'media_consumption', 'shopping_habit', 'social_relations'];
        textFilters.forEach(field => {
            const input = document.getElementById(`search_${field}`);
            if (input && input.value.trim()) {
                filters[field] = input.value.trim();
            }
        });
        
        return filters;
    }

    function getCheckedValues(containerId) {
        const container = document.getElementById(containerId);
        const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    function matchesFilters(persona, filters) {
        // 나이 범위 체크
        if (filters.age_min && persona.age < filters.age_min) return false;
        if (filters.age_max && persona.age > filters.age_max) return false;
        
        // 체크박스 필터 체크
        if (filters.gender.length > 0 && !filters.gender.includes(persona.gender)) return false;
        if (filters.education.length > 0 && !filters.education.includes(persona.education)) return false;
        if (filters.income_bracket.length > 0 && !filters.income_bracket.includes(persona.income_bracket)) return false;
        if (filters.marital_status.length > 0 && !filters.marital_status.includes(persona.marital_status)) return false;
        
        // 텍스트 필터 체크
        if (filters.location && !persona.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (filters.occupation && !persona.occupation.toLowerCase().includes(filters.occupation.toLowerCase())) return false;
        
        // 배열 필드 체크
        if (filters.interests && !persona.interests.some(interest => 
            interest.toLowerCase().includes(filters.interests.toLowerCase()))) return false;
        if (filters.value && !persona.values.some(value => 
            value.toLowerCase().includes(filters.value.toLowerCase()))) return false;
        if (filters.lifestyle_attribute && !persona.lifestyle_attributes.some(attr => 
            attr.toLowerCase().includes(filters.lifestyle_attribute.toLowerCase()))) return false;
        if (filters.social_relations && !persona.social_relations.some(rel => 
            rel.toLowerCase().includes(filters.social_relations.toLowerCase()))) return false;
        
        // 일반 텍스트 필드 체크
        if (filters.media_consumption && !persona.media_consumption.toLowerCase().includes(filters.media_consumption.toLowerCase())) return false;
        if (filters.shopping_habit && !persona.shopping_habit.toLowerCase().includes(filters.shopping_habit.toLowerCase())) return false;
        
        return true;
    }

    function clearAllFilters() {
        // 숫자 입력 필드 초기화
        document.getElementById('search_age_min').value = '';
        document.getElementById('search_age_max').value = '';
        
        // 체크박스 초기화
        const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
        
        // 텍스트 입력 필드 초기화
        const textInputs = document.querySelectorAll('.text-input');
        textInputs.forEach(input => input.value = '');
        
        // 필터 적용
        filteredData = currentData;
        updateOLAPDashboard();
    }

    function updateOLAPDashboard() {
        updateKPIs();
        updateCharts();
        updateDataGrid();
    }

    function updateKPIs() {
        const data = filteredData;
        
        document.getElementById('totalPersonas').textContent = data.length;
        
        if (data.length > 0) {
            const avgAge = Math.round(data.reduce((sum, p) => sum + p.age, 0) / data.length);
            document.getElementById('avgAge').textContent = avgAge;
            
            // 최빈 지역
            const locationCounts = {};
            data.forEach(p => {
                locationCounts[p.location] = (locationCounts[p.location] || 0) + 1;
            });
            const topLocation = Object.keys(locationCounts).reduce((a, b) => 
                locationCounts[a] > locationCounts[b] ? a : b);
            document.getElementById('topLocation').textContent = topLocation;
            
            // 성별 비율
            const genderCounts = {};
            data.forEach(p => {
                genderCounts[p.gender] = (genderCounts[p.gender] || 0) + 1;
            });
            const maleCount = genderCounts['남성'] || 0;
            const femaleCount = genderCounts['여성'] || 0;
            document.getElementById('genderRatio').textContent = `${maleCount}:${femaleCount}`;
        } else {
            document.getElementById('avgAge').textContent = '0';
            document.getElementById('topLocation').textContent = '-';
            document.getElementById('genderRatio').textContent = '0:0';
        }
    }

    function updateCharts() {
        drawCharts(filteredData);
        drawAdditionalCharts(filteredData);
        drawWordClouds(filteredData);
    }

    function drawAdditionalCharts(personas) {
        // 교육 수준 차트
        const educationData = {};
        personas.forEach(persona => {
            educationData[persona.education] = (educationData[persona.education] || 0) + 1;
        });

        if (educationChart) educationChart.destroy();
        const educationCtx = document.getElementById('educationChart').getContext('2d');
        educationChart = new Chart(educationCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(educationData),
                datasets: [{
                    label: 'EDUCATION LEVEL',
                    data: Object.values(educationData),
                    backgroundColor: NEO_COLORS.primary[1], // 파란색
                    borderColor: NEO_COLORS.border,
                    borderWidth: 3
                }]
            },
            options: {
                ...NEO_CHART_OPTIONS,
                plugins: {
                    ...NEO_CHART_OPTIONS.plugins,
                    legend: { display: false }
                }
            }
        });

        // 소득 분위 차트
        const incomeData = {};
        personas.forEach(persona => {
            incomeData[persona.income_bracket] = (incomeData[persona.income_bracket] || 0) + 1;
        });

        if (incomeChart) incomeChart.destroy();
        const incomeCtx = document.getElementById('incomeChart').getContext('2d');
        incomeChart = new Chart(incomeCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(incomeData),
                datasets: [{
                    data: Object.values(incomeData),
                    backgroundColor: NEO_COLORS.primary,
                    borderColor: NEO_COLORS.border,
                    borderWidth: 3
                }]
            },
            options: {
                ...NEO_CHART_OPTIONS,
                scales: {} // 파이 차트에는 스케일이 필요 없음
            }
        });

        // 결혼 상태 차트
        const maritalData = {};
        personas.forEach(persona => {
            maritalData[persona.marital_status] = (maritalData[persona.marital_status] || 0) + 1;
        });

        if (maritalChart) maritalChart.destroy();
        const maritalCtx = document.getElementById('maritalChart').getContext('2d');
        maritalChart = new Chart(maritalCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(maritalData),
                datasets: [{
                    data: Object.values(maritalData),
                    backgroundColor: NEO_COLORS.primary.slice(0, 4),
                    borderColor: NEO_COLORS.border,
                    borderWidth: 3
                }]
            },
            options: {
                ...NEO_CHART_OPTIONS,
                scales: {} // 도넛 차트에는 스케일이 필요 없음
            }
        });

        // 미디어 소비 차트
        const mediaData = {};
        personas.forEach(persona => {
            const media = persona.media_consumption || '기타';
            mediaData[media] = (mediaData[media] || 0) + 1;
        });

        if (mediaChart) mediaChart.destroy();
        const mediaCtx = document.getElementById('mediaChart').getContext('2d');
        mediaChart = new Chart(mediaCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(mediaData),
                datasets: [{
                    label: 'MEDIA CONSUMPTION',
                    data: Object.values(mediaData),
                    backgroundColor: NEO_COLORS.primary[4], // 마젠타색
                    borderColor: NEO_COLORS.border,
                    borderWidth: 3
                }]
            },
            options: {
                ...NEO_CHART_OPTIONS,
                plugins: {
                    ...NEO_CHART_OPTIONS.plugins,
                    legend: { display: false }
                }
            }
        });

        // 쇼핑 습관 차트
        const shoppingData = {};
        personas.forEach(persona => {
            const shopping = persona.shopping_habit || '기타';
            shoppingData[shopping] = (shoppingData[shopping] || 0) + 1;
        });

        if (shoppingChart) shoppingChart.destroy();
        const shoppingCtx = document.getElementById('shoppingChart').getContext('2d');
        shoppingChart = new Chart(shoppingCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(shoppingData),
                datasets: [{
                    data: Object.values(shoppingData),
                    backgroundColor: NEO_COLORS.primary,
                    borderColor: NEO_COLORS.border,
                    borderWidth: 3
                }]
            },
            options: {
                ...NEO_CHART_OPTIONS,
                scales: {} // 파이 차트에는 스케일이 필요 없음
            }
        });
    }

    function drawWordClouds(personas) {
        // 간단한 워드클라우드 시뮬레이션
        drawSimpleWordCloud('interestsWordcloud', 
            personas.flatMap(p => p.interests || []), '관심사');
        drawSimpleWordCloud('valuesWordcloud', 
            personas.flatMap(p => p.values || []), '가치관');
        drawSimpleWordCloud('socialWordcloud', 
            personas.flatMap(p => p.social_relations || []), '사회적 관계');
        drawSimpleWordCloud('lifestyleWordcloud', 
            personas.flatMap(p => p.lifestyle_attributes || []), '라이프스타일');
    }

    function drawSimpleWordCloud(containerId, words, title) {
        const container = document.getElementById(containerId);
        const wordCounts = {};
        
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
        
        const sortedWords = Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        if (sortedWords.length === 0) {
            container.innerHTML = `<p>표시할 ${title} 데이터가 없습니다</p>`;
            return;
        }
        
        const maxCount = sortedWords[0][1];
        const wordElements = sortedWords.map(([word, count]) => {
            const size = Math.max(0.8, (count / maxCount) * 2);
            const opacity = 0.5 + (count / maxCount) * 0.5;
            return `<span style="font-size: ${size}em; opacity: ${opacity}; margin: 0.2em;">${word}</span>`;
        }).join(' ');
        
        container.innerHTML = `<div style="line-height: 1.5; text-align: center;">${wordElements}</div>`;
    }

    function generatePivotTable() {
        const rowField = document.getElementById('pivotRows').value;
        const colField = document.getElementById('pivotCols').value;
        
        const pivotData = createPivotData(filteredData, rowField, colField);
        renderPivotTable(pivotData, rowField, colField);
    }

    function createPivotData(data, rowField, colField) {
        const pivot = {};
        const rowValues = new Set();
        const colValues = new Set();
        
        data.forEach(persona => {
            let rowValue = getFieldValue(persona, rowField);
            let colValue = getFieldValue(persona, colField);
            
            rowValues.add(rowValue);
            colValues.add(colValue);
            
            if (!pivot[rowValue]) pivot[rowValue] = {};
            if (!pivot[rowValue][colValue]) pivot[rowValue][colValue] = 0;
            pivot[rowValue][colValue]++;
        });
        
        return {
            data: pivot,
            rows: Array.from(rowValues).sort(),
            cols: Array.from(colValues).sort()
        };
    }

    function getFieldValue(persona, field) {
        switch (field) {
            case 'age_group':
                return `${Math.floor(persona.age / 10) * 10}대`;
            case 'gender':
                return persona.gender;
            case 'location':
                return persona.location;
            case 'education':
                return persona.education;
            case 'occupation':
                return persona.occupation;
            case 'income_bracket':
                return persona.income_bracket;
            case 'marital_status':
                return persona.marital_status;
            default:
                return persona[field] || '기타';
        }
    }

    function renderPivotTable(pivotData, rowField, colField) {
        const container = document.getElementById('pivotTable');
        
        if (pivotData.rows.length === 0 || pivotData.cols.length === 0) {
            container.innerHTML = '<p>피벗 테이블을 생성할 데이터가 없습니다.</p>';
            return;
        }
        
        let html = '<table style="border-collapse: collapse; width: 100%; font-size: 0.9em;">';
        
        // 헤더
        html += '<thead><tr><th style="border: 1px solid #ddd; padding: 8px; background: #f8f9fa;">' + 
                getFieldLabel(rowField) + '</th>';
        pivotData.cols.forEach(col => {
            html += '<th style="border: 1px solid #ddd; padding: 8px; background: #f8f9fa;">' + col + '</th>';
        });
        html += '<th style="border: 1px solid #ddd; padding: 8px; background: #e9ecef; font-weight: bold;">합계</th></tr></thead>';
        
        // 데이터
        html += '<tbody>';
        pivotData.rows.forEach(row => {
            html += '<tr><td style="border: 1px solid #ddd; padding: 8px; background: #f8f9fa; font-weight: bold;">' + row + '</td>';
            let rowTotal = 0;
            pivotData.cols.forEach(col => {
                const value = (pivotData.data[row] && pivotData.data[row][col]) || 0;
                rowTotal += value;
                html += '<td style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + value + '</td>';
            });
            html += '<td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">' + rowTotal + '</td>';
            html += '</tr>';
        });
        
        // 합계 행
        html += '<tr><td style="border: 1px solid #ddd; padding: 8px; background: #e9ecef; font-weight: bold;">합계</td>';
        let grandTotal = 0;
        pivotData.cols.forEach(col => {
            let colTotal = 0;
            pivotData.rows.forEach(row => {
                if (pivotData.data[row] && pivotData.data[row][col]) {
                    colTotal += pivotData.data[row][col];
                }
            });
            grandTotal += colTotal;
            html += '<td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">' + colTotal + '</td>';
        });
        html += '<td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; background: #dee2e6;">' + grandTotal + '</td>';
        html += '</tr></tbody></table>';
        
        container.innerHTML = html;
    }

    function getFieldLabel(field) {
        const labels = {
            'age_group': '연령대',
            'gender': '성별',
            'location': '지역',
            'education': '교육',
            'occupation': '직업',
            'income_bracket': '소득',
            'marital_status': '결혼상태'
        };
        return labels[field] || field;
    }

    function updateDataGrid() {
        const container = document.getElementById('dataGrid');
        const data = filteredData;
        
        document.getElementById('resultCount').textContent = data.length;
        
        if (data.length === 0) {
            container.innerHTML = '<p>표시할 데이터가 없습니다.</p>';
            return;
        }
        
        let html = '<table style="border-collapse: collapse; width: 100%; font-size: 0.85em;">';
        
        // 헤더
        html += '<thead><tr>';
        const headers = ['이름', '나이', '성별', '지역', '직업', '교육', '소득', '결혼상태'];
        headers.forEach(header => {
            html += '<th style="border: 1px solid #ddd; padding: 6px; background: #f8f9fa; font-weight: bold; white-space: nowrap;">' + header + '</th>';
        });
        html += '</tr></thead>';
        
        // 데이터 (최대 100개만 표시)
        html += '<tbody>';
        const displayData = data.slice(0, 100);
        displayData.forEach((persona, index) => {
            const rowClass = index % 2 === 0 ? 'background: #f9f9f9;' : 'background: white;';
            html += `<tr style="${rowClass}">
                <td style="border: 1px solid #ddd; padding: 6px;">${persona.name}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${persona.age}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${persona.gender}</td>
                <td style="border: 1px solid #ddd; padding: 6px;">${persona.location}</td>
                <td style="border: 1px solid #ddd; padding: 6px;">${persona.occupation}</td>
                <td style="border: 1px solid #ddd; padding: 6px;">${persona.education}</td>
                <td style="border: 1px solid #ddd; padding: 6px;">${persona.income_bracket}</td>
                <td style="border: 1px solid #ddd; padding: 6px;">${persona.marital_status}</td>
            </tr>`;
        });
        html += '</tbody></table>';
        
        if (data.length > 100) {
            html += '<p style="text-align: center; margin-top: 1rem; color: #6c757d;">처음 100개 항목만 표시됩니다.</p>';
        }
        
        container.innerHTML = html;
    }

    // 기존 검색 버튼도 OLAP 업데이트하도록 수정
    const originalSearchBtn = document.getElementById('searchBtn');
    if (originalSearchBtn) {
        // 기존 버튼을 applyFilters 버튼으로 변경
        originalSearchBtn.addEventListener('click', () => {
            applyFilters();
        });
    } else {
        // applyFilters 버튼이 searchBtn 역할 대신하도록
        const applyBtn = document.getElementById('applyFilters');
        if (applyBtn) {
            applyBtn.id = 'searchBtn'; // ID 변경
        }
    }
});