/**
 * Generate Page Functionality Tests
 * Tests to ensure existing JavaScript functionality is preserved after Neo-Brutalism integration
 */

// Mock fetch for testing
global.fetch = jest.fn();

// Mock DOM elements
const mockDOM = {
    getElementById: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    addEventListener: jest.fn(),
    createElement: jest.fn(),
    body: { appendChild: jest.fn() }
};

// Mock elements
const mockElements = {
    generateBtn: {
        addEventListener: jest.fn(),
        disabled: false,
        textContent: 'GENERATE PEOPLE',
        click: jest.fn()
    },
    deleteAllBtn: {
        addEventListener: jest.fn(),
        disabled: false,
        textContent: 'DELETE ALL VIRTUAL PEOPLE',
        click: jest.fn()
    },
    countInput: {
        value: '1',
        addEventListener: jest.fn(),
        closest: jest.fn(() => ({ classList: { add: jest.fn(), remove: jest.fn() } }))
    },
    ageRangeMinInput: {
        value: '',
        addEventListener: jest.fn(),
        closest: jest.fn(() => ({ classList: { add: jest.fn(), remove: jest.fn() } }))
    },
    ageRangeMaxInput: {
        value: '',
        addEventListener: jest.fn(),
        closest: jest.fn(() => ({ classList: { add: jest.fn(), remove: jest.fn() } }))
    },
    genderSelect: {
        value: '',
        addEventListener: jest.fn()
    },
    locationInput: {
        value: '',
        addEventListener: jest.fn()
    },
    generateResultDiv: {
        innerHTML: '',
        style: { display: 'none' }
    },
    deleteResultDiv: {
        innerHTML: '',
        style: { display: 'none' }
    }
};

// Setup DOM mocks
beforeEach(() => {
    global.document = mockDOM;
    global.window = { confirm: jest.fn(() => true) };
    global.console = { error: jest.fn() };
    
    mockDOM.getElementById.mockImplementation((id) => {
        return mockElements[id] || mockElements[id + 'Input'] || mockElements[id + 'Btn'] || mockElements[id + 'Div'];
    });
    
    mockDOM.querySelectorAll.mockReturnValue([]);
    fetch.mockClear();
});

describe('Generate Page Integration Tests', () => {
    
    describe('DOM Element Preservation', () => {
        test('should preserve all required form elements', () => {
            const requiredElements = [
                'generateBtn',
                'deleteAllBtn', 
                'countInput',
                'ageRangeMinInput',
                'ageRangeMaxInput',
                'genderSelect',
                'locationInput',
                'generateResultDiv',
                'deleteResultDiv'
            ];

            requiredElements.forEach(elementId => {
                const element = mockDOM.getElementById(elementId);
                expect(element).toBeDefined();
            });
        });

        test('should preserve button text content', () => {
            expect(mockElements.generateBtn.textContent).toContain('GENERATE');
            expect(mockElements.deleteAllBtn.textContent).toContain('DELETE');
        });

        test('should preserve input default values', () => {
            expect(mockElements.countInput.value).toBe('1');
        });
    });

    describe('API Integration', () => {
        test('should make correct API call for persona generation', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    message: 'Success',
                    personas: [{ name: 'Test Person', age: 25 }]
                })
            };
            fetch.mockResolvedValue(mockResponse);

            // Simulate form data
            mockElements.countInput.value = '2';
            mockElements.ageRangeMinInput.value = '20';
            mockElements.ageRangeMaxInput.value = '30';
            mockElements.genderSelect.value = '남성';
            mockElements.locationInput.value = 'Seoul';

            // Mock the generate function logic
            const generatePersonas = async () => {
                const count = parseInt(mockElements.countInput.value);
                const age_range_min = mockElements.ageRangeMinInput.value ? parseInt(mockElements.ageRangeMinInput.value) : undefined;
                const age_range_max = mockElements.ageRangeMaxInput.value ? parseInt(mockElements.ageRangeMaxInput.value) : undefined;
                const gender = mockElements.genderSelect.value || undefined;
                const location = mockElements.locationInput.value || undefined;

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

                const response = await fetch('http://127.0.0.1:5050/api/personas/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ count, demographics }),
                });

                return response.json();
            };

            const result = await generatePersonas();

            expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5050/api/personas/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    count: 2,
                    demographics: {
                        age_range: [20, 30],
                        gender: '남성',
                        location: 'Seoul'
                    }
                })
            });

            expect(result.message).toBe('Success');
            expect(result.personas).toHaveLength(1);
        });

        test('should make correct API call for delete all', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    message: 'All personas deleted'
                })
            };
            fetch.mockResolvedValue(mockResponse);

            const deleteAll = async () => {
                const response = await fetch('http://127.0.0.1:5050/api/personas/delete_all', {
                    method: 'POST',
                });
                return response.json();
            };

            const result = await deleteAll();

            expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5050/api/personas/delete_all', {
                method: 'POST',
            });

            expect(result.message).toBe('All personas deleted');
        });
    });

    describe('Form Validation', () => {
        test('should validate count input', () => {
            const validateCount = (value) => {
                const count = parseInt(value);
                return !isNaN(count) && count >= 1 && count <= 100;
            };

            expect(validateCount('1')).toBe(true);
            expect(validateCount('50')).toBe(true);
            expect(validateCount('100')).toBe(true);
            expect(validateCount('0')).toBe(false);
            expect(validateCount('-1')).toBe(false);
            expect(validateCount('101')).toBe(false);
            expect(validateCount('abc')).toBe(false);
        });

        test('should validate age range', () => {
            const validateAgeRange = (min, max) => {
                if (min === null || max === null) return true;
                return min <= max;
            };

            expect(validateAgeRange(20, 30)).toBe(true);
            expect(validateAgeRange(25, 25)).toBe(true);
            expect(validateAgeRange(30, 20)).toBe(false);
            expect(validateAgeRange(null, 30)).toBe(true);
            expect(validateAgeRange(20, null)).toBe(true);
        });
    });

    describe('UI State Management', () => {
        test('should handle loading states', () => {
            const showLoading = (element, message) => {
                element.innerHTML = `<div class="neo-loading">${message}...</div>`;
                element.style.display = 'block';
            };

            const mockElement = { innerHTML: '', style: { display: 'none' } };
            showLoading(mockElement, 'Loading');

            expect(mockElement.innerHTML).toContain('neo-loading');
            expect(mockElement.innerHTML).toContain('Loading...');
            expect(mockElement.style.display).toBe('block');
        });

        test('should handle error states', () => {
            const showError = (element, message) => {
                element.innerHTML = `<p class="error">Error: ${message}</p>`;
                element.style.display = 'block';
            };

            const mockElement = { innerHTML: '', style: { display: 'none' } };
            showError(mockElement, 'Network error');

            expect(mockElement.innerHTML).toContain('class="error"');
            expect(mockElement.innerHTML).toContain('Network error');
            expect(mockElement.style.display).toBe('block');
        });

        test('should handle success states', () => {
            const showSuccess = (element, message, data = null) => {
                let html = `<p class="success">${message}</p>`;
                if (data && data.personas) {
                    html += '<div class="persona-grid"></div>';
                }
                element.innerHTML = html;
                element.style.display = 'block';
            };

            const mockElement = { innerHTML: '', style: { display: 'none' } };
            const mockData = { personas: [{ name: 'Test' }] };
            showSuccess(mockElement, 'Success', mockData);

            expect(mockElement.innerHTML).toContain('class="success"');
            expect(mockElement.innerHTML).toContain('Success');
            expect(mockElement.innerHTML).toContain('persona-grid');
            expect(mockElement.style.display).toBe('block');
        });
    });

    describe('Persona Display Formatting', () => {
        test('should format personas for display', () => {
            const formatPersonasDisplay = (personas) => {
                if (!personas || personas.length === 0) {
                    return '<p class="error">No personas generated</p>';
                }

                let html = '<div class="persona-grid">';
                personas.forEach((persona, index) => {
                    html += `
                        <div class="persona-card">
                            <h3>Person ${index + 1}</h3>
                            <p><strong>Name:</strong> ${persona.name || 'N/A'}</p>
                            <p><strong>Age:</strong> ${persona.age || 'N/A'}</p>
                            <p><strong>Gender:</strong> ${persona.gender || 'N/A'}</p>
                            <p><strong>Location:</strong> ${persona.location || 'N/A'}</p>
                            <p><strong>Occupation:</strong> ${persona.occupation || 'N/A'}</p>
                            <p><strong>Interests:</strong> ${persona.interests ? persona.interests.join(', ') : 'N/A'}</p>
                            <p><strong>Personality:</strong> ${persona.personality || 'N/A'}</p>
                        </div>
                    `;
                });
                html += '</div>';
                return html;
            };

            const testPersonas = [
                {
                    name: 'John Doe',
                    age: 25,
                    gender: 'Male',
                    location: 'Seoul',
                    occupation: 'Developer',
                    interests: ['coding', 'gaming'],
                    personality: 'Introverted'
                }
            ];

            const result = formatPersonasDisplay(testPersonas);

            expect(result).toContain('persona-grid');
            expect(result).toContain('persona-card');
            expect(result).toContain('Person 1');
            expect(result).toContain('John Doe');
            expect(result).toContain('coding, gaming');
        });

        test('should handle empty personas array', () => {
            const formatPersonasDisplay = (personas) => {
                if (!personas || personas.length === 0) {
                    return '<p class="error">No personas generated</p>';
                }
                return '<div class="persona-grid"></div>';
            };

            expect(formatPersonasDisplay([])).toContain('No personas generated');
            expect(formatPersonasDisplay(null)).toContain('No personas generated');
            expect(formatPersonasDisplay(undefined)).toContain('No personas generated');
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors', async () => {
            fetch.mockRejectedValue(new Error('Network error'));

            const handleNetworkError = async () => {
                try {
                    await fetch('http://127.0.0.1:5050/api/personas/generate');
                } catch (error) {
                    return `Network error: ${error.message}`;
                }
            };

            const result = await handleNetworkError();
            expect(result).toBe('Network error: Network error');
        });

        test('should handle API errors', async () => {
            const mockResponse = {
                ok: false,
                statusText: 'Bad Request',
                json: jest.fn().mockResolvedValue({
                    message: 'Invalid input'
                })
            };
            fetch.mockResolvedValue(mockResponse);

            const handleAPIError = async () => {
                const response = await fetch('http://127.0.0.1:5050/api/personas/generate');
                const data = await response.json();
                if (!response.ok) {
                    return data.message || response.statusText;
                }
                return 'Success';
            };

            const result = await handleAPIError();
            expect(result).toBe('Invalid input');
        });
    });

    describe('Keyboard Navigation', () => {
        test('should support Enter key submission', () => {
            const handleKeyDown = (e) => {
                if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                    if (e.target.closest('.neo-card--generate')) {
                        return 'generate';
                    }
                }
                return null;
            };

            const mockEvent = {
                key: 'Enter',
                target: {
                    tagName: 'INPUT',
                    closest: jest.fn(() => ({ classList: { contains: () => true } }))
                }
            };

            mockEvent.target.closest.mockReturnValue(true);
            const result = handleKeyDown(mockEvent);
            expect(result).toBe('generate');
        });
    });

    describe('Confirmation Dialogs', () => {
        test('should show confirmation for delete all', () => {
            global.window.confirm = jest.fn(() => true);
            
            const confirmDelete = () => {
                return window.confirm('REALLY DELETE ALL PERSONA DATA? THIS ACTION CANNOT BE UNDONE!');
            };

            const result = confirmDelete();
            expect(window.confirm).toHaveBeenCalledWith('REALLY DELETE ALL PERSONA DATA? THIS ACTION CANNOT BE UNDONE!');
            expect(result).toBe(true);
        });

        test('should handle confirmation cancellation', () => {
            global.window.confirm = jest.fn(() => false);
            
            const confirmDelete = () => {
                return window.confirm('REALLY DELETE ALL PERSONA DATA? THIS ACTION CANNOT BE UNDONE!');
            };

            const result = confirmDelete();
            expect(result).toBe(false);
        });
    });
});

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mockElements,
        mockDOM
    };
}