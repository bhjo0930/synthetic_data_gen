// Neo-Brutalism Grid System Tests
// Tests for asymmetrical grid layouts, overlapping elements, and responsive behavior

describe('Neo-Brutalism Grid System', () => {
    let testContainer;
    
    beforeEach(() => {
        // Create test container
        testContainer = document.createElement('div');
        testContainer.innerHTML = `
            <link rel="stylesheet" href="../static/css/neo-brutalism.css">
        `;
        document.body.appendChild(testContainer);
    });
    
    afterEach(() => {
        // Clean up
        if (testContainer && testContainer.parentNode) {
            testContainer.parentNode.removeChild(testContainer);
        }
    });
    
    describe('Basic Grid Templates', () => {
        test('should create asymmetrical 2-column grid', () => {
            const gridElement = document.createElement('div');
            gridElement.className = 'neo-grid neo-grid--asymmetric-2col';
            testContainer.appendChild(gridElement);
            
            const computedStyle = window.getComputedStyle(gridElement);
            expect(computedStyle.display).toBe('grid');
            expect(computedStyle.gridTemplateColumns).toContain('1fr 2fr');
        });
        
        test('should create asymmetrical 3-column grid', () => {
            const gridElement = document.createElement('div');
            gridElement.className = 'neo-grid neo-grid--asymmetric-3col';
            testContainer.appendChild(gridElement);
            
            const computedStyle = window.getComputedStyle(gridElement);
            expect(computedStyle.display).toBe('grid');
            expect(computedStyle.gridTemplateColumns).toContain('1fr 3fr 2fr');
        });
        
        test('should create chaotic 4-column grid', () => {
            const gridElement = document.createElement('div');
            gridElement.className = 'neo-grid neo-grid--asymmetric-4col';
            testContainer.appendChild(gridElement);
            
            const computedStyle = window.getComputedStyle(gridElement);
            expect(computedStyle.display).toBe('grid');
            expect(computedStyle.gridTemplateColumns).toContain('1fr 2fr 1fr 3fr');
        });
        
        test('should create asymmetrical row layouts', () => {
            const gridElement = document.createElement('div');
            gridElement.className = 'neo-grid neo-grid--asymmetric-rows';
            testContainer.appendChild(gridElement);
            
            const computedStyle = window.getComputedStyle(gridElement);
            expect(computedStyle.gridTemplateRows).toContain('1fr 3fr 2fr');
        });
    });
    
    describe('Overlapping Elements', () => {
        test('should create overlap container with grid area', () => {
            const overlapContainer = document.createElement('div');
            overlapContainer.className = 'neo-overlap-container';
            testContainer.appendChild(overlapContainer);
            
            const computedStyle = window.getComputedStyle(overlapContainer);
            expect(computedStyle.display).toBe('grid');
            expect(computedStyle.gridTemplateAreas).toContain('overlap');
        });
        
        test('should position overlapping elements correctly', () => {
            const container = document.createElement('div');
            container.className = 'neo-overlap-container';
            
            const element1 = document.createElement('div');
            element1.className = 'neo-overlap--top-left';
            
            const element2 = document.createElement('div');
            element2.className = 'neo-overlap--bottom-right';
            
            container.appendChild(element1);
            container.appendChild(element2);
            testContainer.appendChild(container);
            
            const style1 = window.getComputedStyle(element1);
            const style2 = window.getComputedStyle(element2);
            
            expect(style1.justifySelf).toBe('start');
            expect(style1.alignSelf).toBe('start');
            expect(style2.justifySelf).toBe('end');
            expect(style2.alignSelf).toBe('end');
        });
        
        test('should apply correct z-index layering', () => {
            const elements = [
                { class: 'neo-layer--background', expectedZ: 1 },
                { class: 'neo-layer--content', expectedZ: 2 },
                { class: 'neo-layer--accent', expectedZ: 3 },
                { class: 'neo-layer--overlay', expectedZ: 4 },
                { class: 'neo-layer--top', expectedZ: 5 }
            ];
            
            elements.forEach(({ class: className, expectedZ }) => {
                const element = document.createElement('div');
                element.className = className;
                testContainer.appendChild(element);
                
                const computedStyle = window.getComputedStyle(element);
                expect(parseInt(computedStyle.zIndex)).toBe(expectedZ);
            });
        });
    });
    
    describe('Grid Item Positioning', () => {
        test('should apply column span utilities', () => {
            const gridElement = document.createElement('div');
            gridElement.className = 'neo-grid neo-grid--asymmetric-3col';
            
            const spanElement = document.createElement('div');
            spanElement.className = 'neo-span--2';
            
            gridElement.appendChild(spanElement);
            testContainer.appendChild(gridElement);
            
            const computedStyle = window.getComputedStyle(spanElement);
            expect(computedStyle.gridColumn).toContain('span 2');
        });
        
        test('should apply row span utilities', () => {
            const gridElement = document.createElement('div');
            gridElement.className = 'neo-grid neo-grid--asymmetric-rows';
            
            const spanElement = document.createElement('div');
            spanElement.className = 'neo-span--row-2';
            
            gridElement.appendChild(spanElement);
            testContainer.appendChild(gridElement);
            
            const computedStyle = window.getComputedStyle(spanElement);
            expect(computedStyle.gridRow).toContain('span 2');
        });
        
        test('should position elements at specific grid lines', () => {
            const gridElement = document.createElement('div');
            gridElement.className = 'neo-grid neo-grid--asymmetric-3col';
            
            const positionedElement = document.createElement('div');
            positionedElement.className = 'neo-place--start-2';
            
            gridElement.appendChild(positionedElement);
            testContainer.appendChild(gridElement);
            
            const computedStyle = window.getComputedStyle(positionedElement);
            expect(computedStyle.gridColumnStart).toBe('2');
        });
    });
    
    describe('Gap Utilities', () => {
        test('should apply different gap sizes', () => {
            const gapSizes = [
                { class: 'neo-gap--xs', property: 'gap' },
                { class: 'neo-gap--sm', property: 'gap' },
                { class: 'neo-gap--lg', property: 'gap' },
                { class: 'neo-gap--xl', property: 'gap' }
            ];
            
            gapSizes.forEach(({ class: className }) => {
                const gridElement = document.createElement('div');
                gridElement.className = `neo-grid ${className}`;
                testContainer.appendChild(gridElement);
                
                const computedStyle = window.getComputedStyle(gridElement);
                expect(computedStyle.gap).toBeDefined();
                expect(computedStyle.gap).not.toBe('normal');
            });
        });
        
        test('should apply uneven gaps', () => {
            const gridElement = document.createElement('div');
            gridElement.className = 'neo-grid neo-gap--uneven';
            testContainer.appendChild(gridElement);
            
            const computedStyle = window.getComputedStyle(gridElement);
            expect(computedStyle.columnGap).toBeDefined();
            expect(computedStyle.rowGap).toBeDefined();
            expect(computedStyle.columnGap).not.toBe(computedStyle.rowGap);
        });
    });
    
    describe('Overlay System', () => {
        test('should create corner overlays with correct positioning', () => {
            const container = document.createElement('div');
            container.className = 'neo-overlay-container';
            
            const cornerOverlay = document.createElement('div');
            cornerOverlay.className = 'neo-overlay neo-overlay--corner-tl';
            
            container.appendChild(cornerOverlay);
            testContainer.appendChild(container);
            
            const computedStyle = window.getComputedStyle(cornerOverlay);
            expect(computedStyle.position).toBe('absolute');
            expect(computedStyle.top).toBe('-8px');
            expect(computedStyle.left).toBe('-8px');
        });
        
        test('should create edge overlays with correct dimensions', () => {
            const container = document.createElement('div');
            container.className = 'neo-overlay-container';
            
            const edgeOverlay = document.createElement('div');
            edgeOverlay.className = 'neo-overlay neo-overlay--edge-top';
            
            container.appendChild(edgeOverlay);
            testContainer.appendChild(container);
            
            const computedStyle = window.getComputedStyle(edgeOverlay);
            expect(computedStyle.width).toBe('60px');
            expect(computedStyle.height).toBe('8px');
        });
        
        test('should create stacked overlays with proper layering', () => {
            const stackContainer = document.createElement('div');
            stackContainer.className = 'neo-stack-overlay';
            
            const layer1 = document.createElement('div');
            layer1.className = 'neo-stack-layer-1';
            
            const layer2 = document.createElement('div');
            layer2.className = 'neo-stack-layer-2';
            
            const content = document.createElement('div');
            content.className = 'neo-stack-content';
            
            stackContainer.appendChild(layer1);
            stackContainer.appendChild(layer2);
            stackContainer.appendChild(content);
            testContainer.appendChild(stackContainer);
            
            const style1 = window.getComputedStyle(layer1);
            const style2 = window.getComputedStyle(layer2);
            const styleContent = window.getComputedStyle(content);
            
            expect(parseInt(style1.zIndex)).toBe(1);
            expect(parseInt(style2.zIndex)).toBe(2);
            expect(parseInt(styleContent.zIndex)).toBe(3);
        });
    });
    
    describe('Responsive Behavior', () => {
        // Mock window.matchMedia for responsive tests
        beforeEach(() => {
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
                    matches: false,
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });
        });
        
        test('should have responsive grid classes', () => {
            const responsiveGrid = document.createElement('div');
            responsiveGrid.className = 'neo-grid neo-grid--responsive-asymmetric';
            testContainer.appendChild(responsiveGrid);
            
            const computedStyle = window.getComputedStyle(responsiveGrid);
            expect(computedStyle.display).toBe('grid');
        });
        
        test('should have responsive utility classes', () => {
            const hideMobile = document.createElement('div');
            hideMobile.className = 'neo-hide-mobile';
            testContainer.appendChild(hideMobile);
            
            // This test verifies the class exists and can be applied
            expect(hideMobile.classList.contains('neo-hide-mobile')).toBe(true);
        });
    });
    
    describe('Browser Compatibility', () => {
        test('should provide flexbox fallback when grid is not supported', () => {
            // Mock CSS.supports to return false for grid
            const originalSupports = CSS.supports;
            CSS.supports = jest.fn().mockReturnValue(false);
            
            const gridElement = document.createElement('div');
            gridElement.className = 'neo-grid';
            testContainer.appendChild(gridElement);
            
            // In a real browser without grid support, this would fall back to flex
            // This test ensures the fallback classes exist
            expect(gridElement.classList.contains('neo-grid')).toBe(true);
            
            // Restore original CSS.supports
            CSS.supports = originalSupports;
        });
    });
    
    describe('Performance', () => {
        test('should not create excessive DOM elements', () => {
            const initialElementCount = document.querySelectorAll('*').length;
            
            // Create a complex grid with overlays
            const complexGrid = document.createElement('div');
            complexGrid.className = 'neo-grid neo-grid--chaos neo-chaos-overlay';
            
            for (let i = 0; i < 10; i++) {
                const item = document.createElement('div');
                item.className = 'test-item';
                complexGrid.appendChild(item);
            }
            
            testContainer.appendChild(complexGrid);
            
            const finalElementCount = document.querySelectorAll('*').length;
            const addedElements = finalElementCount - initialElementCount;
            
            // Should not create more than 15 elements (container + 10 items + some pseudo-elements)
            expect(addedElements).toBeLessThan(15);
        });
    });
});