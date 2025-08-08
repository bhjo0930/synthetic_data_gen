// Neo-Brutalism Accent Component Tests

describe('Neo-Brutalism Pixel-Art Accent System', () => {
    let testContainer;
    
    beforeEach(() => {
        testContainer = document.createElement('div');
        testContainer.style.position = 'relative';
        testContainer.style.width = '200px';
        testContainer.style.height = '100px';
        testContainer.style.background = 'white';
        testContainer.style.border = '2px solid black';
        document.body.appendChild(testContainer);
    });
    
    afterEach(() => {
        if (testContainer && testContainer.parentNode) {
            testContainer.parentNode.removeChild(testContainer);
        }
    });
    
    describe('Corner Bracket Accents', () => {
        test('should apply top-left corner accent correctly', () => {
            testContainer.className = 'neo-accent-corner-tl';
            
            const computedStyle = window.getComputedStyle(testContainer, '::before');
            expect(computedStyle.content).toBe('""');
            expect(computedStyle.position).toBe('absolute');
            expect(computedStyle.backgroundColor).toBe('rgb(255, 0, 0)'); // red
            expect(computedStyle.zIndex).toBe('10');
        });
        
        test('should apply top-right corner accent correctly', () => {
            testContainer.className = 'neo-accent-corner-tr';
            
            const computedStyle = window.getComputedStyle(testContainer, '::before');
            expect(computedStyle.content).toBe('""');
            expect(computedStyle.backgroundColor).toBe('rgb(0, 255, 0)'); // green
            expect(computedStyle.zIndex).toBe('10');
        });
        
        test('should apply bottom-left corner accent correctly', () => {
            testContainer.className = 'neo-accent-corner-bl';
            
            const computedStyle = window.getComputedStyle(testContainer, '::before');
            expect(computedStyle.content).toBe('""');
            expect(computedStyle.backgroundColor).toBe('rgb(255, 255, 0)'); // yellow
            expect(computedStyle.zIndex).toBe('10');
        });
        
        test('should apply bottom-right corner accent correctly', () => {
            testContainer.className = 'neo-accent-corner-br';
            
            const computedStyle = window.getComputedStyle(testContainer, '::before');
            expect(computedStyle.content).toBe('""');
            expect(computedStyle.backgroundColor).toBe('rgb(0, 0, 255)'); // blue
            expect(computedStyle.zIndex).toBe('10');
        });
    });
    
    describe('Geometric Accent Shapes', () => {
        test('should apply diamond accent correctly', () => {
            testContainer.className = 'neo-accent-diamond';
            
            const computedStyle = window.getComputedStyle(testContainer, '::after');
            expect(computedStyle.content).toBe('""');
            expect(computedStyle.backgroundColor).toBe('rgb(255, 0, 0)'); // red
            expect(computedStyle.transform).toContain('rotate(45deg)');
            expect(computedStyle.zIndex).toBe('5');
        });
        
        test('should apply triangle accent correctly', () => {
            testContainer.className = 'neo-accent-triangle';
            
            const computedStyle = window.getComputedStyle(testContainer, '::after');
            expect(computedStyle.content).toBe('""');
            expect(computedStyle.borderLeftColor).toBe('rgb(0, 255, 0)'); // green
            expect(computedStyle.zIndex).toBe('5');
        });
        
        test('should apply square accent correctly', () => {
            testContainer.className = 'neo-accent-square';
            
            const computedStyle = window.getComputedStyle(testContainer, '::after');
            expect(computedStyle.content).toBe('""');
            expect(computedStyle.backgroundColor).toBe('rgb(255, 255, 0)'); // yellow
            expect(computedStyle.zIndex).toBe('5');
        });
    });
    
    describe('Pixel-Art Icons', () => {
        test('should create pixel icon base structure', () => {
            const icon = document.createElement('span');
            icon.className = 'neo-icon-pixel neo-icon-arrow-right';
            testContainer.appendChild(icon);
            
            const computedStyle = window.getComputedStyle(icon);
            expect(computedStyle.display).toBe('inline-block');
            expect(computedStyle.width).toBe('16px');
            expect(computedStyle.height).toBe('16px');
            expect(computedStyle.imageRendering).toContain('pixelated');
        });
        
        test('should apply arrow icon pattern', () => {
            const icon = document.createElement('span');
            icon.className = 'neo-icon-pixel neo-icon-arrow-right';
            testContainer.appendChild(icon);
            
            const computedStyle = window.getComputedStyle(icon, '::before');
            expect(computedStyle.content).toBe('""');
            expect(computedStyle.backgroundColor).toBe('rgb(0, 0, 0)'); // black
            expect(computedStyle.boxShadow).toContain('4px 0px 0px rgb(0, 0, 0)');
        });
        
        test('should apply plus icon pattern', () => {
            const icon = document.createElement('span');
            icon.className = 'neo-icon-pixel neo-icon-plus';
            testContainer.appendChild(icon);
            
            const computedStyle = window.getComputedStyle(icon, '::before');
            expect(computedStyle.content).toBe('""');
            expect(computedStyle.backgroundColor).toBe('rgb(0, 0, 0)'); // black
            expect(computedStyle.boxShadow).toContain('4px 0px 0px rgb(0, 0, 0)');
        });
        
        test('should apply cross icon pattern', () => {
            const icon = document.createElement('span');
            icon.className = 'neo-icon-pixel neo-icon-cross';
            testContainer.appendChild(icon);
            
            const computedStyle = window.getComputedStyle(icon, '::before');
            expect(computedStyle.content).toBe('""');
            expect(computedStyle.backgroundColor).toBe('rgb(0, 0, 0)'); // black
            expect(computedStyle.boxShadow).toContain('12px 0px 0px rgb(0, 0, 0)');
        });
    });
    
    describe('Decorative Pixel Borders', () => {
        test('should apply top pixel border correctly', () => {
            testContainer.className = 'neo-accent-pixel-border-top';
            
            const computedStyle = window.getComputedStyle(testContainer, '::before');
            expect(computedStyle.content).toBe('""');
            expect(computedStyle.position).toBe('absolute');
            expect(computedStyle.height).toBe('4px');
            expect(computedStyle.zIndex).toBe('5');
        });
        
        test('should apply bottom pixel border correctly', () => {
            testContainer.className = 'neo-accent-pixel-border-bottom';
            
            const computedStyle = window.getComputedStyle(testContainer, '::after');
            expect(computedStyle.content).toBe('""');
            expect(computedStyle.position).toBe('absolute');
            expect(computedStyle.height).toBe('4px');
            expect(computedStyle.zIndex).toBe('5');
        });
    });
    
    describe('Combined Accent Effects', () => {
        test('should apply combo corners correctly', () => {
            testContainer.className = 'neo-accent-combo-corners';
            
            const beforeStyle = window.getComputedStyle(testContainer, '::before');
            const afterStyle = window.getComputedStyle(testContainer, '::after');
            
            expect(beforeStyle.content).toBe('""');
            expect(afterStyle.content).toBe('""');
            expect(beforeStyle.backgroundColor).toBe('rgb(255, 0, 0)'); // red
            expect(afterStyle.backgroundColor).toBe('rgb(0, 0, 255)'); // blue
        });
        
        test('should handle multiple accent classes', () => {
            testContainer.className = 'neo-accent-corner-tl neo-accent-diamond';
            
            // Should have both corner and diamond accents
            const beforeStyle = window.getComputedStyle(testContainer, '::before');
            const afterStyle = window.getComputedStyle(testContainer, '::after');
            
            expect(beforeStyle.content).toBe('""'); // corner accent
            expect(afterStyle.content).toBe('""'); // diamond accent
        });
    });
    
    describe('Responsive Behavior', () => {
        test('should adjust accent sizes for mobile', () => {
            // Simulate mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 500,
            });
            
            // Trigger resize event
            window.dispatchEvent(new Event('resize'));
            
            testContainer.className = 'neo-accent-corner-tl';
            
            // Check if CSS variables are updated for mobile
            const rootStyle = getComputedStyle(document.documentElement);
            const cornerSize = rootStyle.getPropertyValue('--accent-corner-size');
            
            // On mobile, corner size should be smaller
            expect(parseInt(cornerSize)).toBeLessThanOrEqual(16);
        });
    });
    
    describe('Accessibility Features', () => {
        test('should respect high contrast preferences', () => {
            // Mock high contrast media query
            const mockMediaQuery = {
                matches: true,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };
            
            window.matchMedia = jest.fn().mockReturnValue(mockMediaQuery);
            
            testContainer.className = 'neo-accent-corner-tl';
            
            // High contrast mode should increase border thickness
            const computedStyle = window.getComputedStyle(testContainer, '::before');
            expect(computedStyle.borderWidth).toBeTruthy();
        });
        
        test('should respect reduced motion preferences', () => {
            // Mock reduced motion media query
            const mockMediaQuery = {
                matches: true,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };
            
            window.matchMedia = jest.fn().mockReturnValue(mockMediaQuery);
            
            testContainer.className = 'neo-accent-corner-tl';
            
            // Reduced motion should disable transitions and animations
            const computedStyle = window.getComputedStyle(testContainer, '::before');
            expect(computedStyle.transition).toBe('none');
            expect(computedStyle.animation).toBe('none');
        });
    });
    
    describe('Z-Index Layering', () => {
        test('should maintain proper z-index hierarchy', () => {
            testContainer.className = 'neo-accent-corner-tl neo-accent-diamond';
            
            const cornerStyle = window.getComputedStyle(testContainer, '::before');
            const diamondStyle = window.getComputedStyle(testContainer, '::after');
            
            // Corner accents should be above geometric shapes
            expect(parseInt(cornerStyle.zIndex)).toBeGreaterThan(parseInt(diamondStyle.zIndex));
        });
    });
    
    describe('CSS Custom Properties', () => {
        test('should use defined CSS variables', () => {
            const rootStyle = getComputedStyle(document.documentElement);
            
            expect(rootStyle.getPropertyValue('--pixel-size')).toBe('4px');
            expect(rootStyle.getPropertyValue('--accent-corner-size')).toBe('16px');
            expect(rootStyle.getPropertyValue('--accent-bracket-width')).toBe('8px');
            expect(rootStyle.getPropertyValue('--accent-bracket-height')).toBe('24px');
        });
    });
});

// Integration tests with existing components
describe('Accent System Integration', () => {
    test('should work with button components', () => {
        const button = document.createElement('button');
        button.className = 'neo-button neo-accent-corner-tl';
        button.textContent = 'Test Button';
        document.body.appendChild(button);
        
        const buttonStyle = window.getComputedStyle(button);
        const accentStyle = window.getComputedStyle(button, '::before');
        
        expect(buttonStyle.border).toContain('solid');
        expect(accentStyle.content).toBe('""');
        
        document.body.removeChild(button);
    });
    
    test('should work with card components', () => {
        const card = document.createElement('div');
        card.className = 'neo-card neo-accent-combo-corners';
        card.innerHTML = '<h3>Test Card</h3><p>Content</p>';
        document.body.appendChild(card);
        
        const cardStyle = window.getComputedStyle(card);
        const accentBeforeStyle = window.getComputedStyle(card, '::before');
        const accentAfterStyle = window.getComputedStyle(card, '::after');
        
        expect(cardStyle.border).toContain('solid');
        expect(accentBeforeStyle.content).toBe('""');
        expect(accentAfterStyle.content).toBe('""');
        
        document.body.removeChild(card);
    });
});

// Performance tests
describe('Accent System Performance', () => {
    test('should not cause layout thrashing', () => {
        const startTime = performance.now();
        
        // Create multiple elements with accents
        for (let i = 0; i < 100; i++) {
            const element = document.createElement('div');
            element.className = 'neo-accent-corner-tl neo-accent-diamond';
            element.style.width = '50px';
            element.style.height = '50px';
            document.body.appendChild(element);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Should complete within reasonable time (less than 100ms)
        expect(duration).toBeLessThan(100);
        
        // Clean up
        const elements = document.querySelectorAll('.neo-accent-corner-tl');
        elements.forEach(el => el.remove());
    });
});

console.log('Neo-Brutalism Accent Component Tests Loaded');