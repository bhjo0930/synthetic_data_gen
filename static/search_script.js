// OLAP 기능 변수 (전역 스코프)
window.currentData = [];
window.filteredData = [];

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5050/api/personas';

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

        // 지역 차트 (인구 분포순으로 정렬)
        const locationCtx = document.getElementById('locationChart').getContext('2d');
        
        // 지역 데이터를 값(인구수) 기준으로 내림차순 정렬
        const sortedLocationEntries = Object.entries(locationData).sort((a, b) => b[1] - a[1]);
        const sortedLocationLabels = sortedLocationEntries.map(entry => entry[0]);
        const sortedLocationValues = sortedLocationEntries.map(entry => entry[1]);
        
        locationChart = new Chart(locationCtx, {
            type: 'bar',
            data: {
                labels: sortedLocationLabels,
                datasets: [{
                    label: 'LOCATION DISTRIBUTION',
                    data: sortedLocationValues,
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

        // 직업 차트 (빈도순으로 정렬)
        const occupationCtx = document.getElementById('occupationChart').getContext('2d');
        
        // 직업 데이터를 값(빈도) 기준으로 내림차순 정렬
        const sortedOccupationEntries = Object.entries(occupationData).sort((a, b) => b[1] - a[1]);
        const sortedOccupationLabels = sortedOccupationEntries.map(entry => entry[0]);
        const sortedOccupationValues = sortedOccupationEntries.map(entry => entry[1]);
        
        occupationChart = new Chart(occupationCtx, {
            type: 'bar',
            data: {
                labels: sortedOccupationLabels,
                datasets: [{
                    label: 'OCCUPATION DISTRIBUTION',
                    data: sortedOccupationValues,
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

    if (searchBtn) {
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
    }

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
                const targetElement = document.getElementById(targetTab);
                if (targetElement) {
                    targetElement.classList.add('active');
                }
            });
        });
    }

    function initializeFilterControls() {
        const applyFiltersBtn = document.getElementById('applyFilters');
        const clearFiltersBtn = document.getElementById('clearFilters');

        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                applyFilters();
            });
        }

        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                clearAllFilters();
            });
        }
    }

    function initializePivotTable() {
        const generatePivotBtn = document.getElementById('generatePivot');
        if (generatePivotBtn) {
            generatePivotBtn.addEventListener('click', () => {
                generatePivotTable();
            });
        }
    }

    function loadAllData() {
        fetch(`${API_BASE_URL}/search`)
            .then(response => response.json())
            .then(data => {
                window.currentData = data;
                window.filteredData = data;
                updateOLAPDashboard();
            })
            .catch(error => {
                console.error('Error loading data:', error);
            });
    }

    function applyFilters() {
        const filters = collectFilters();
        
        window.filteredData = window.currentData.filter(persona => {
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
        window.filteredData = window.currentData;
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
        drawCharts(window.filteredData);
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
        
        let html = '<table style="border-collapse: collapse; width: 100%; font-size: 0.9em; border: 4px solid #000000;">';
        
        // 헤더
        html += '<thead><tr><th style="border: 4px solid #000000; padding: 10px; background: #FFFF00; color: #000000; font-weight: 900; font-family: Arial Black, Impact, sans-serif; text-transform: uppercase;">' + 
                getFieldLabel(rowField) + '</th>';
        pivotData.cols.forEach(col => {
            html += '<th style="border: 4px solid #000000; padding: 10px; background: #FFFF00; color: #000000; font-weight: 900; font-family: Arial Black, Impact, sans-serif; text-transform: uppercase;">' + col + '</th>';
        });
        html += '<th style="border: 4px solid #000000; padding: 10px; background: #FF0000; color: #FFFFFF; font-weight: 900; font-family: Arial Black, Impact, sans-serif; text-transform: uppercase;">합계</th></tr></thead>';
        
        // 데이터
        html += '<tbody>';
        pivotData.rows.forEach(row => {
            html += '<tr><td style="border: 2px solid #000000; padding: 10px; background: #0000FF; color: #FFFFFF; font-weight: 900; font-family: Arial Black, Impact, sans-serif;">' + row + '</td>';
            let rowTotal = 0;
            pivotData.cols.forEach(col => {
                const value = (pivotData.data[row] && pivotData.data[row][col]) || 0;
                rowTotal += value;
                html += '<td style="border: 2px solid #000000; padding: 10px; text-align: center; font-family: Arial, sans-serif; font-weight: bold;">' + value + '</td>';
            });
            html += '<td style="border: 2px solid #000000; padding: 10px; text-align: center; font-weight: 900; background: #00FF00; color: #000000; font-family: Arial Black, Impact, sans-serif;">' + rowTotal + '</td>';
            html += '</tr>';
        });
        
        // 합계 행
        html += '<tr><td style="border: 2px solid #000000; padding: 10px; background: #FF00FF; color: #FFFFFF; font-weight: 900; font-family: Arial Black, Impact, sans-serif;">합계</td>';
        let grandTotal = 0;
        pivotData.cols.forEach(col => {
            let colTotal = 0;
            pivotData.rows.forEach(row => {
                if (pivotData.data[row] && pivotData.data[row][col]) {
                    colTotal += pivotData.data[row][col];
                }
            });
            grandTotal += colTotal;
            html += '<td style="border: 2px solid #000000; padding: 10px; text-align: center; font-weight: 900; background: #00FF00; color: #000000; font-family: Arial Black, Impact, sans-serif;">' + colTotal + '</td>';
        });
        html += '<td style="border: 2px solid #000000; padding: 10px; text-align: center; font-weight: 900; background: #FF0000; color: #FFFFFF; font-family: Arial Black, Impact, sans-serif;">' + grandTotal + '</td>';
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
        
        let html = '<table style="border-collapse: collapse; width: 100%; font-size: 0.85em; border: 4px solid #000000;">';
        
        // 헤더
        html += '<thead><tr>';
        const headers = ['이름', '나이', '성별', '지역', '직업', '교육', '소득', '결혼상태'];
        headers.forEach(header => {
            html += '<th style="border: 4px solid #000000; padding: 8px; background: #FFFF00; color: #000000; font-weight: 900; font-family: Arial Black, Impact, sans-serif; text-transform: uppercase; white-space: nowrap;">' + header + '</th>';
        });
        html += '</tr></thead>';
        
        // 데이터 (최대 100개만 표시)
        html += '<tbody>';
        const displayData = data.slice(0, 100);
        displayData.forEach((persona, index) => {
            const rowClass = index % 2 === 0 ? 'background: #FFFFFF;' : 'background: #F0F0F0;';
            html += `<tr style="${rowClass}">
                <td style="border: 2px solid #000000; padding: 8px; font-family: Arial, sans-serif; font-weight: bold;">${persona.name}</td>
                <td style="border: 2px solid #000000; padding: 8px; text-align: center; font-family: Arial, sans-serif;">${persona.age}</td>
                <td style="border: 2px solid #000000; padding: 8px; text-align: center; font-family: Arial, sans-serif;">${persona.gender}</td>
                <td style="border: 2px solid #000000; padding: 8px; font-family: Arial, sans-serif;">${persona.location}</td>
                <td style="border: 2px solid #000000; padding: 8px; font-family: Arial, sans-serif;">${persona.occupation}</td>
                <td style="border: 2px solid #000000; padding: 8px; font-family: Arial, sans-serif;">${persona.education}</td>
                <td style="border: 2px solid #000000; padding: 8px; font-family: Arial, sans-serif;">${persona.income_bracket}</td>
                <td style="border: 2px solid #000000; padding: 8px; font-family: Arial, sans-serif;">${persona.marital_status}</td>
            </tr>`;
        });
        html += '</tbody></table>';
        
        if (data.length > 100) {
            html += '<p style="text-align: center; margin-top: 1rem; color: #6c757d;">처음 100개 항목만 표시됩니다.</p>';
        }
        
        container.innerHTML = html;
    }

    // --- Excel Export 기능 --- //
    window.exportToExcel = function() {
        try {
            // XLSX 라이브러리 확인
            if (typeof XLSX === 'undefined') {
                alert('Excel 라이브러리가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
                return;
            }

            const data = window.filteredData || [];
            
            if (data.length === 0) {
                alert('내보낼 데이터가 없습니다.');
                return;
            }

            console.log('Excel 내보내기 시작... 데이터 수:', data.length);

            // Excel 데이터 준비
            const excelData = data.map((persona, index) => {
                return {
                    '순번': index + 1,
                    '이름': safeStringify(persona.name),
                    '나이': persona.age || 0,
                    '성별': safeStringify(persona.gender),
                    '지역': safeStringify(persona.location),
                    '직업': safeStringify(persona.occupation),
                    '교육수준': safeStringify(persona.education),
                    '소득분위': safeStringify(persona.income_bracket),
                    '결혼상태': safeStringify(persona.marital_status),
                    '관심사': safeStringify(persona.interests),
                    '가치관': safeStringify(persona.values),
                    '라이프스타일': safeStringify(persona.lifestyle),
                    '성격특성': safeStringify(persona.personality),
                    '미디어소비': safeStringify(persona.media_consumption),
                    '쇼핑습관': safeStringify(persona.shopping_habits),
                    '사회적관계': safeStringify(persona.social_relations)
                };
            });

            // 워크북 생성
            const wb = XLSX.utils.book_new();
            
            // 워크시트 생성
            const ws = XLSX.utils.json_to_sheet(excelData);
            
            // 컬럼 너비 설정
            const colWidths = [
                { wch: 8 },  // 순번
                { wch: 12 }, // 이름
                { wch: 8 },  // 나이
                { wch: 8 },  // 성별
                { wch: 15 }, // 지역
                { wch: 15 }, // 직업
                { wch: 20 }, // 교육수준
                { wch: 12 }, // 소득분위
                { wch: 12 }, // 결혼상태
                { wch: 30 }, // 관심사
                { wch: 30 }, // 가치관
                { wch: 30 }, // 라이프스타일
                { wch: 30 }, // 성격특성
                { wch: 25 }, // 미디어소비
                { wch: 25 }, // 쇼핑습관
                { wch: 25 }  // 사회적관계
            ];
            ws['!cols'] = colWidths;

            // 워크시트를 워크북에 추가
            XLSX.utils.book_append_sheet(wb, ws, 'Virtual People Data');
            
            // 파일명 생성 (현재 날짜 포함)
            const now = new Date();
            const dateStr = now.getFullYear() + 
                          String(now.getMonth() + 1).padStart(2, '0') + 
                          String(now.getDate()).padStart(2, '0') + '_' +
                          String(now.getHours()).padStart(2, '0') + 
                          String(now.getMinutes()).padStart(2, '0');
            const filename = `Virtual_People_Data_${dateStr}.xlsx`;
            
            // Excel 파일 다운로드
            XLSX.writeFile(wb, filename);
            
            console.log('Excel 파일 생성 완료:', filename);
            
            // 성공 메시지 표시
            showExportSuccess(data.length, filename, 'Excel');
            
        } catch (error) {
            console.error('Excel 내보내기 오류:', error);
            alert('Excel 파일 생성 중 오류가 발생했습니다: ' + error.message);
        }
    }

    function showExportSuccess(count, filename) {
        // 임시 성공 메시지 표시
        const existingMsg = document.querySelector('.export-success-msg');
        if (existingMsg) {
            existingMsg.remove();
        }

        const successMsg = document.createElement('div');
        successMsg.className = 'export-success-msg';
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            border: 3px solid #000;
            box-shadow: 4px 4px 0px #000;
            font-family: 'Arial Black', sans-serif;
            font-weight: 900;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        successMsg.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-check-circle"></i>
                <div>
                    <div style="font-size: 14px;">Excel 다운로드 완료!</div>
                    <div style="font-size: 12px; opacity: 0.9;">${count}개 데이터 • ${filename}</div>
                </div>
            </div>
        `;

        document.body.appendChild(successMsg);

        // 3초 후 자동 제거
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.remove();
            }
        }, 3000);
    }

    // 안전한 문자열 변환 함수
    function safeStringify(value) {
        if (value === null || value === undefined) {
            return '미지정';
        }
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }

    // 안전한 CSV 이스케이프 함수
    function safeCsvEscape(value) {
        const str = safeStringify(value);
        return `"${str.replace(/"/g, '""')}"`;
    }

    // --- CSV Export 기능 --- //
    window.exportToCSV = function() {
        try {
            const data = window.filteredData || [];
            
            if (data.length === 0) {
                alert('내보낼 데이터가 없습니다.');
                return;
            }

            console.log('CSV 내보내기 시작... 데이터 수:', data.length);

            // CSV 헤더 정의
            const headers = [
                '순번', '이름', '나이', '성별', '지역', '직업', '교육수준', '소득분위', '결혼상태',
                '관심사', '가치관', '라이프스타일', '성격특성', '미디어소비', '쇼핑습관', '사회적관계'
            ];

            // CSV 데이터 생성
            const csvRows = [];
            
            // 헤더 추가
            csvRows.push(headers.join(','));
            
            // 데이터 행 추가
            data.forEach((persona, index) => {
                const row = [
                    index + 1,
                    safeCsvEscape(persona.name),
                    persona.age || 0,
                    safeCsvEscape(persona.gender),
                    safeCsvEscape(persona.location),
                    safeCsvEscape(persona.occupation),
                    safeCsvEscape(persona.education),
                    safeCsvEscape(persona.income_bracket),
                    safeCsvEscape(persona.marital_status),
                    safeCsvEscape(persona.interests),
                    safeCsvEscape(persona.values),
                    safeCsvEscape(persona.lifestyle),
                    safeCsvEscape(persona.personality),
                    safeCsvEscape(persona.media_consumption),
                    safeCsvEscape(persona.shopping_habits),
                    safeCsvEscape(persona.social_relations)
                ];
                csvRows.push(row.join(','));
            });

            // CSV 문자열 생성
            const csvContent = csvRows.join('\n');
            
            // BOM 추가 (한글 깨짐 방지)
            const BOM = '\uFEFF';
            const csvWithBOM = BOM + csvContent;

            // Blob 생성
            const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
            
            // 파일명 생성 (현재 날짜 포함)
            const now = new Date();
            const dateStr = now.getFullYear() + 
                          String(now.getMonth() + 1).padStart(2, '0') + 
                          String(now.getDate()).padStart(2, '0') + '_' +
                          String(now.getHours()).padStart(2, '0') + 
                          String(now.getMinutes()).padStart(2, '0');
            const filename = `Virtual_People_Data_${dateStr}.csv`;
            
            // 다운로드 링크 생성 및 클릭
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
            
            console.log('CSV 파일 생성 완료:', filename);
            
            // 성공 메시지 표시
            showExportSuccess(data.length, filename, 'CSV');
            
        } catch (error) {
            console.error('CSV 내보내기 오류:', error);
            alert('CSV 파일 생성 중 오류가 발생했습니다: ' + error.message);
        }
    }

    function showExportSuccess(count, filename, type = 'Excel') {
        // 임시 성공 메시지 표시 (기존 함수 업데이트)
        const existingMsg = document.querySelector('.export-success-msg');
        if (existingMsg) {
            existingMsg.remove();
        }

        const successMsg = document.createElement('div');
        successMsg.className = 'export-success-msg';
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            border: 3px solid #000;
            box-shadow: 4px 4px 0px #000;
            font-family: 'Arial Black', sans-serif;
            font-weight: 900;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        const icon = type === 'CSV' ? 'fas fa-file-csv' : 'fas fa-file-excel';
        successMsg.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="${icon}"></i>
                <div>
                    <div style="font-size: 14px;">${type} 다운로드 완료!</div>
                    <div style="font-size: 12px; opacity: 0.9;">${count}개 데이터 • ${filename}</div>
                </div>
            </div>
        `;

        document.body.appendChild(successMsg);

        // 3초 후 자동 제거
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.remove();
            }
        }, 3000);
    }

    // Export 버튼 이벤트 리스너 추가
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            console.log('Export Excel 버튼 클릭됨');
            exportToExcel();
        });
        console.log('Export Excel 이벤트 리스너 등록 완료');
    } else {
        console.warn('Export Excel 버튼을 찾을 수 없습니다');
    }

    // CSV Export 버튼 이벤트 리스너 추가
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
            console.log('Export CSV 버튼 클릭됨');
            exportToCSV();
        });
        console.log('Export CSV 이벤트 리스너 등록 완료');
    } else {
        console.warn('Export CSV 버튼을 찾을 수 없습니다');
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

    // CSS 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // 내보내기 기능 상태 확인
    function checkExportFunctionality() {
        const exportBtn = document.getElementById('exportBtn');
        const csvBtn = document.getElementById('exportCsvBtn');
        
        console.log('내보내기 기능 상태:');
        console.log('- Excel 버튼:', exportBtn ? '✅ 찾음' : '❌ 없음');
        console.log('- CSV 버튼:', csvBtn ? '✅ 찾음' : '❌ 없음');
        console.log('- XLSX 라이브러리:', typeof XLSX !== 'undefined' ? '✅ 로드됨' : '❌ 미로드');
        console.log('- 현재 데이터 수:', window.filteredData.length);
        
        return {
            excel: !!exportBtn,
            csv: !!csvBtn,
            xlsx: typeof XLSX !== 'undefined',
            dataCount: window.filteredData.length
        };
    }

    // 테스트용 샘플 데이터 생성 함수 (개발자 도구에서 사용 가능)
    window.generateTestData = function(count = 20) {
        console.log(`${count}개 테스트 데이터 생성 중...`);
        
        const testData = [];
        const regions = ['서울특별시', '경기도', '부산광역시', '대구광역시', '인천광역시'];
        const genders = ['남성', '여성'];
        const occupations = ['자영업', '회사원', '학생', '전문직', '교사'];
        const educations = ['고등학교', '대학(4년제 미만)', '대학교(4년제 이상)', '대학원(석사 과정)'];
        const maritalStatuses = ['미혼', '기혼', '이혼'];
        
        for (let i = 1; i <= count; i++) {
            const persona = {
                name: `테스트인물_${i.toString().padStart(3, '0')}`,
                age: Math.floor(Math.random() * 50) + 20,
                gender: genders[Math.floor(Math.random() * genders.length)],
                location: regions[Math.floor(Math.random() * regions.length)],
                occupation: occupations[Math.floor(Math.random() * occupations.length)],
                education: educations[Math.floor(Math.random() * educations.length)],
                income_bracket: `${Math.floor(Math.random() * 5) * 20 + 20}-${Math.floor(Math.random() * 5) * 20 + 40}%`,
                marital_status: maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)],
                interests: ['독서', '영화감상', '운동', '여행'].slice(0, Math.floor(Math.random() * 3) + 1),
                values: ['가족', '성공', '건강', '자유'].slice(0, Math.floor(Math.random() * 2) + 1),
                lifestyle: ['활동적', '여유로운', '계획적'].slice(0, Math.floor(Math.random() * 2) + 1),
                personality: ['외향적', '신중한', '창의적'].slice(0, Math.floor(Math.random() * 2) + 1),
                media_consumption: '소셜미디어 3시간/일',
                shopping_habits: '온라인 쇼핑 선호',
                social_relations: '친구 많음'
            };
            testData.push(persona);
        }
        
        // 데이터 설정
        window.currentData = testData;
        window.filteredData = [...testData];
        
        // UI 업데이트
        updateKPIs();
        drawCharts(window.filteredData);
        updateDataGrid();
        
        console.log(`✅ ${count}개 테스트 데이터 생성 완료`);
        console.log('이제 Export Excel 또는 Export CSV 버튼을 클릭해서 테스트할 수 있습니다.');
        
        return testData;
    };

    // 페이지 로드 완료 후 상태 확인
    setTimeout(() => {
        const status = checkExportFunctionality();
        
        if (status.excel && status.csv) {
            console.log('💡 테스트 방법:');
            console.log('1. 개발자 도구에서 generateTestData() 실행');
            console.log('2. Excel 또는 CSV 내보내기 버튼 클릭');
            console.log('3. 다운로드된 파일 확인');
        }
    }, 1000);

    console.log('search_script.js 초기화 완료 - Excel & CSV Export 기능 포함');
});