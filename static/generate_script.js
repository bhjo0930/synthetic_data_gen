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

    // Helper function to format personas for Neo-Brutalism display
    function formatPersonasDisplay(personas) {
        if (!personas || personas.length === 0) {
            return '<p class="error">No personas generated</p>';
        }

        // 최대 10개로 제한
        const displayPersonas = personas.slice(0, 10);
        const totalGenerated = personas.length;

        let html = '<div class="persona-grid">';
        displayPersonas.forEach((persona, index) => {
            // Extract data from correct nested structure
            const demographics = persona.demographics || {};
            const psychological = persona.psychological_attributes || {};
            const behavioral = persona.behavioral_patterns || {};
            
            // Format personality traits as readable text
            const personalityText = psychological.personality_traits ? 
                Object.entries(psychological.personality_traits)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ') : 'N/A';
                    
            // Format values as readable text
            const valuesText = psychological.values ? 
                psychological.values.join(', ') : 'N/A';
                
            // Format interests as readable text
            const interestsText = behavioral.interests ? 
                behavioral.interests.join(', ') : 'N/A';
                
            // Format lifestyle attributes
            const lifestyleText = psychological.lifestyle_attributes ? 
                psychological.lifestyle_attributes.join(', ') : 'N/A';

            html += `<div class="persona-card"><h3>Person ${index + 1}</h3><div><strong>Name:</strong> ${persona.name || 'N/A'}</div><div><strong>Age:</strong> ${demographics.age || 'N/A'}</div><div><strong>Gender:</strong> ${demographics.gender || 'N/A'}</div><div><strong>Location:</strong> ${demographics.location || 'N/A'}</div><div><strong>Occupation:</strong> ${demographics.occupation || 'N/A'}</div><div><strong>Education:</strong> ${demographics.education || 'N/A'}</div><div><strong>Income:</strong> ${demographics.income_bracket || 'N/A'}</div><div><strong>Marital Status:</strong> ${demographics.marital_status || 'N/A'}</div><div><strong>Interests:</strong> ${interestsText}</div><div><strong>Values:</strong> ${valuesText}</div><div><strong>Personality:</strong> ${personalityText}</div><div><strong>Lifestyle:</strong> ${lifestyleText}</div><div><strong>Media Habits:</strong> ${behavioral.media_consumption || 'N/A'}</div><div><strong>Shopping Habits:</strong> ${behavioral.shopping_habit || 'N/A'}</div><div><strong>Social Relations:</strong> ${persona.social_relations ? persona.social_relations.join(', ') : 'N/A'}</div></div>`;
        });
        html += '</div>';
        
        // 생성된 총 개수가 10개를 초과하는 경우 안내 메시지 추가
        if (totalGenerated > 10) {
            html += `<div class="generation-info">
                <p class="info-message">
                    <strong>총 ${totalGenerated}명이 생성되었습니다.</strong><br>
                    화면에는 처음 10명만 표시됩니다. 
                    전체 데이터는 Analytics Dashboard에서 확인할 수 있습니다.
                </p>
            </div>`;
        } else {
            html += `<div class="generation-info">
                <p class="success-message">
                    <strong>총 ${totalGenerated}명이 생성되었습니다.</strong>
                </p>
            </div>`;
        }
        
        return html;
    }

    // Helper function to show loading state
    function showLoading(element, message = 'Loading') {
        element.innerHTML = `<div class="neo-loading">${message}...</div>`;
        element.style.display = 'block';
    }

    // Helper function to show error
    function showError(element, message) {
        element.innerHTML = `<p class="error">Error: ${message}</p>`;
        element.style.display = 'block';
    }

    // Helper function to show success
    function showSuccess(element, message, data = null) {
        let html = `<p class="success">${message}</p>`;
        if (data && data.personas) {
            html += formatPersonasDisplay(data.personas);
        }
        element.innerHTML = html;
        element.style.display = 'block';
    }

    generateBtn.addEventListener('click', async (e) => {
        // Validate form first
        if (!validateForm()) {
            showError(generateResultDiv, 'Please check your input values');
            return;
        }

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
            // Disable button and show loading
            generateBtn.disabled = true;
            generateBtn.textContent = 'GENERATING...';
            showLoading(generateResultDiv, 'Generating Virtual People');

            const response = await fetch(`${API_BASE_URL}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ count, demographics }),
            });
            const data = await response.json();
            
            if (response.ok) {
                showSuccess(generateResultDiv, data.message || 'Virtual people generated successfully!', data);
            } else {
                showError(generateResultDiv, data.message || response.statusText);
            }
        } catch (error) {
            showError(generateResultDiv, `Network error: ${error.message}`);
            console.error('Error generating personas:', error);
        } finally {
            // Re-enable button
            generateBtn.disabled = false;
            generateBtn.textContent = 'GENERATE PEOPLE';
        }
    });

    // --- 모든 페르소나 삭제 (생성 페이지에서도 사용) --- //
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const deleteResultDiv = document.getElementById('deleteResult');

    if (deleteAllBtn) { // deleteAllBtn이 현재 페이지에 있을 경우에만 이벤트 리스너 추가
        deleteAllBtn.addEventListener('click', async () => {
            if (!confirm('REALLY DELETE ALL PERSONA DATA? THIS ACTION CANNOT BE UNDONE!')) {
                return;
            }

            try {
                // Disable button and show loading
                deleteAllBtn.disabled = true;
                deleteAllBtn.textContent = 'DELETING...';
                showLoading(deleteResultDiv, 'Deleting All Data');

                const response = await fetch(`${API_BASE_URL}/delete_all`, {
                    method: 'POST',
                });
                const data = await response.json();
                
                if (response.ok) {
                    showSuccess(deleteResultDiv, data.message || 'All virtual people deleted successfully!');
                    // Clear generation results after successful deletion
                    generateResultDiv.innerHTML = '';
                    generateResultDiv.style.display = 'none';
                } else {
                    showError(deleteResultDiv, data.message || response.statusText);
                }
            } catch (error) {
                showError(deleteResultDiv, `Network error: ${error.message}`);
                console.error('Error deleting personas:', error);
            } finally {
                // Re-enable button
                deleteAllBtn.disabled = false;
                deleteAllBtn.textContent = 'DELETE ALL VIRTUAL PEOPLE';
            }
        });
    }

    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            if (e.target.closest('.neo-card--generate')) {
                generateBtn.click();
            }
        }
    });

    // Add form validation
    function validateForm() {
        const count = parseInt(countInput.value);
        const ageMin = ageRangeMinInput.value ? parseInt(ageRangeMinInput.value) : null;
        const ageMax = ageRangeMaxInput.value ? parseInt(ageRangeMaxInput.value) : null;

        // Reset validation states
        document.querySelectorAll('.input-group').forEach(group => {
            group.classList.remove('error');
        });

        let isValid = true;

        // Validate count
        if (isNaN(count) || count < 1 || count > 100) {
            countInput.closest('.input-group').classList.add('error');
            isValid = false;
        }

        // Validate age range
        if (ageMin !== null && ageMax !== null && ageMin > ageMax) {
            ageRangeMinInput.closest('.input-group').classList.add('error');
            ageRangeMaxInput.closest('.input-group').classList.add('error');
            isValid = false;
        }

        return isValid;
    }

    // Removed duplicate validation event listener - validation is now handled in the main click handler

    // Add real-time validation
    [countInput, ageRangeMinInput, ageRangeMaxInput].forEach(input => {
        input.addEventListener('blur', validateForm);
        input.addEventListener('input', () => {
            // Remove error state on input
            input.closest('.input-group').classList.remove('error');
        });
    });
});
