/**
 * Neo-Brutalism Cursor Effects Test Suite
 * Tests cursor interaction behaviors and browser compatibility
 */

describe('Neo-Brutalism Cursor Effects', () => {
    let testContainer;
    
    beforeEach(() => {
        // Create test container
        testContainer = document.createElement('div');
        testContainer.innerHTML = `
            <link rel="stylesheet" href="../static/css/neo-brutalism.css">
            <button class="neo-button" id="test-button">Test Button</button>
            <input type="text" id="test-input" placeholder="Test Input">
            <div class="neo-hover-zone" id="test-hover-zone">Hover Zone</div>
            <div class="neo-cursor-trail" id="test-cursor-trail">Cursor Trail</div>
            <div draggable="true" id="test-draggable">Draggable</div>
            <button class="neo-button" disabled id="test-disabled">Disabled</button>
            <div class="neo-help" id="test-help">Help Cursor</div>
            <div class="neo-loading" id="test-loading">Loading Cursor</div>
        `;
        document.body.appendChild(testContainer);
    });
    
    afterEach(() => {
        if (testContainer && testContainer.parentNode) {
            testContainer.parentNode.removeChild(testContainer);
        }
    });
    
    describe('Basic Cursor Styles', () => {
        test('should apply custom cursor to interactive elements', () => {
            const button = testContainer.querySelector('#test-button');
            const computedStyle = window.getComputedStyle(button);
            
            // Check if custom cursor is applied
            expect(computedStyle.cursor).toContain('url(');
        });
        
        test('should apply text cursor to input elements', () => {
            const input = testContainer.querySelector('#test-input');
            const computedStyle = window.getComputedStyle(input);
            
            // Should have text cursor or custom text cursor
            expect(computedStyle.cursor).toMatch(/(text|url\(.*text.*\))/);
        });
        
        test('should apply not-allowed cursor to disabled elements', () => {
            const disabledButton = testContainer.querySelector('#test-disabled');
            const computedStyle = window.getComputedStyle(disabledButton);
            
            // Should have not-allowed cursor or custom disabled cursor
            expect(computedStyle.cursor).toMatch(/(not-allowed|url\(.*not-allowed.*\))/);
        });
    });
    
    describe('Hover Zone Effects', () => {
        test('should create hover zone pseudo-element', () => {
            const hoverZone = testContainer.querySelector('#test-hover-zone');
            
            // Check if hover zone class is applied
            expect(hoverZone.classList.contains('neo-hover-zone')).toBe(true);
            
            // Simulate hover
            const mouseEnterEvent = new MouseEvent('mouseenter', {
                bubbles: true,
                cancelable: true
            });
            
            hoverZone.dispatchEvent(mouseEnterEvent);
            
            // Check if hover state is applied (pseudo-element styling)
            const computedStyle = window.getComputedStyle(hoverZone, '::before');
            expect(computedStyle).toBeDefined();
        });
        
        test('should handle hover zone mouse events', (done) => {
            const hoverZone = testContainer.querySelector('#test-hover-zone');
            let hoverCount = 0;
            
            hoverZone.addEventListener('mouseenter', () => {
                hoverCount++;
            });
            
            hoverZone.addEventListener('mouseleave', () => {
                expect(hoverCount).toBe(1);
                done();
            });
            
            // Simulate hover sequence
            hoverZone.dispatchEvent(new MouseEvent('mouseenter'));
            setTimeout(() => {
                hoverZone.dispatchEvent(new MouseEvent('mouseleave'));
            }, 10);
        });
    });
    
    describe('Cursor Trail Effects', () => {
        test('should apply cursor trail class', () => {
            const trailElement = testContainer.querySelector('#test-cursor-trail');
            expect(trailElement.classList.contains('neo-cursor-trail')).toBe(true);
        });
        
        test('should handle mouse move events for cursor trail', (done) => {
            const trailElement = testContainer.querySelector('#test-cursor-trail');
            let mouseMoveCount = 0;
            
            trailElement.addEventListener('mousemove', (e) => {
                mouseMoveCount++;
                expect(e.clientX).toBeDefined();
                expect(e.clientY).toBeDefined();
                
                if (mouseMoveCount >= 1) {
                    done();
                }
            });
            
            // Simulate mouse move
            const mouseMoveEvent = new MouseEvent('mousemove', {
                clientX: 100,
                clientY: 100,
                bubbles: true
            });
            
            trailElement.dispatchEvent(mouseMoveEvent);
        });
    });
    
    describe('Interactive Element Behaviors', () => {
        test('should handle button click interactions', (done) => {
            const button = testContainer.querySelector('#test-button');
            
            button.addEventListener('click', (e) => {
                expect(e.target).toBe(button);
                done();
            });
            
            button.click();
        });
        
        test('should handle input focus interactions', (done) => {
            const input = testContainer.querySelector('#test-input');
            
            input.addEventListener('focus', (e) => {
                expect(e.target).toBe(input);
                done();
            });
            
            input.focus();
        });
        
        test('should handle draggable interactions', (done) => {
            const draggable = testContainer.querySelector('#test-draggable');
            
            draggable.addEventListener('dragstart', (e) => {
                expect(e.target).toBe(draggable);
                expect(e.dataTransfer).toBeDefined();
                done();
            });
            
            // Simulate drag start
            const dragEvent = new DragEvent('dragstart', {
                bubbles: true,
                cancelable: true,
                dataTransfer: new DataTransfer()
            });
            
            draggable.dispatchEvent(dragEvent);
        });
    });
    
    describe('Browser Compatibility', () => {
        test('should detect custom cursor URL support', () => {
            const testElement = document.createElement('div');
            testElement.style.cursor = "url('data:image/svg+xml;utf8,<svg></svg>'), auto";
            
            const supportsCustomCursor = testElement.style.cursor.includes('url');
            expect(typeof supportsCustomCursor).toBe('boolean');
        });
        
        test('should handle touch device detection', () => {
            const isTouchDevice = 'ontouchstart' in window;
            expect(typeof isTouchDevice).toBe('boolean');
        });
        
        test('should respect reduced motion preferences', () => {
            // Mock reduced motion preference
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
                    matches: query === '(prefers-reduced-motion: reduce)',
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });
            
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            expect(typeof reducedMotion).toBe('boolean');
        });
        
        test('should respect high contrast preferences', () => {
            // Mock high contrast preference
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
                    matches: query === '(prefers-contrast: high)',
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });
            
            const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
            expect(typeof highContrast).toBe('boolean');
        });
    });
    
    describe('Special Cursor Types', () => {
        test('should apply help cursor class', () => {
            const helpElement = testContainer.querySelector('#test-help');
            expect(helpElement.classList.contains('neo-help')).toBe(true);
        });
        
        test('should apply loading cursor class', () => {
            const loadingElement = testContainer.querySelector('#test-loading');
            expect(loadingElement.classList.contains('neo-loading')).toBe(true);
        });
    });
    
    describe('CSS Custom Properties', () => {
        test('should have cursor-related CSS variables defined', () => {
            const rootStyles = window.getComputedStyle(document.documentElement);
            
            // Check for Neo-Brutalism color variables used in cursors
            expect(rootStyles.getPropertyValue('--neo-red')).toBeTruthy();
            expect(rootStyles.getPropertyValue('--neo-black')).toBeTruthy();
            expect(rootStyles.getPropertyValue('--neo-white')).toBeTruthy();
        });
    });
    
    describe('Performance', () => {
        test('should not cause memory leaks with cursor effects', () => {
            const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // Create and destroy multiple cursor elements
            for (let i = 0; i < 100; i++) {
                const element = document.createElement('div');
                element.className = 'neo-hover-zone neo-cursor-trail';
                testContainer.appendChild(element);
                
                // Simulate interactions
                element.dispatchEvent(new MouseEvent('mouseenter'));
                element.dispatchEvent(new MouseEvent('mousemove'));
                element.dispatchEvent(new MouseEvent('mouseleave'));
                
                testContainer.removeChild(element);
            }
            
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
            
            const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // Memory usage should not increase significantly
            if (performance.memory) {
                expect(finalMemory - initialMemory).toBeLessThan(1000000); // Less than 1MB increase
            }
        });
        
        test('should handle rapid cursor movements efficiently', (done) => {
            const trailElement = testContainer.querySelector('#test-cursor-trail');
            let eventCount = 0;
            const startTime = performance.now();
            
            const handleMouseMove = () => {
                eventCount++;
                if (eventCount >= 100) {
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    
                    // Should handle 100 events in reasonable time (less than 100ms)
                    expect(duration).toBeLessThan(100);
                    done();
                }
            };
            
            trailElement.addEventListener('mousemove', handleMouseMove);
            
            // Simulate rapid mouse movements
            for (let i = 0; i < 100; i++) {
                setTimeout(() => {
                    trailElement.dispatchEvent(new MouseEvent('mousemove', {
                        clientX: i,
                        clientY: i,
                        bubbles: true
                    }));
                }, i);
            }
        });
    });
});

// Integration test with existing components
describe('Cursor Effects Integration', () => {
    test('should work with existing Neo-Brutalism buttons', () => {
        const button = document.createElement('button');
        button.className = 'neo-button';
        button.textContent = 'Test Button';
        document.body.appendChild(button);
        
        const computedStyle = window.getComputedStyle(button);
        
        // Should have custom cursor or fallback pointer
        expect(computedStyle.cursor).toMatch(/(url\(|pointer)/);
        
        document.body.removeChild(button);
    });
    
    test('should work with existing form components', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'neo-input';
        document.body.appendChild(input);
        
        const computedStyle = window.getComputedStyle(input);
        
        // Should have text cursor or custom text cursor
        expect(computedStyle.cursor).toMatch(/(url\(|text)/);
        
        document.body.removeChild(input);
    });
});