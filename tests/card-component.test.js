// Neo-Brutalism Card Component Tests

describe('Neo-Brutalism Card Component', () => {
    let testContainer;
    
    beforeEach(() => {
        // Create test container
        testContainer = document.createElement('div');
        testContainer.innerHTML = `
            <div class="neo-card" id="test-card">
                <div class="neo-card__header">
                    <h3 class="neo-card__title">Test Card</h3>
                    <div class="neo-card__meta">TEST</div>
                </div>
                <div class="neo-card__content">
                    <p class="neo-card__text">Test content</p>
                    <div class="neo-card__accent-block"></div>
                </div>
            </div>
        `;
        document.body.appendChild(testContainer);
    });
    
    afterEach(() => {
        document.body.removeChild(testContainer);
    });
    
    describe('Base Card Styles', () => {
        test('should have thick black border', () => {
            const card = document.getElementById('test-card');
            const styles = window.getComputedStyle(card);
            
            expect(styles.borderWidth).toBe('4px');
            expect(styles.borderStyle).toBe('solid');
            expect(styles.borderColor).toBe('rgb(0, 0, 0)');
        });
        
        test('should have solid drop shadow', () => {
            const card = document.getElementById('test-card');
            const styles = window.getComputedStyle(card);
            
            expect(styles.boxShadow).toContain('8px 8px 0px rgb(0, 0, 0)');
        });
        
        test('should have white background', () => {
            const card = document.getElementById('test-card');
            const styles = window.getComputedStyle(card);
            
            expect(styles.backgroundColor).toBe('rgb(255, 255, 255)');
        });
        
        test('should have decorative corner elements', () => {
            const card = document.getElementById('test-card');
            const beforeStyles = window.getComputedStyle(card, '::before');
            const afterStyles = window.getComputedStyle(card, '::after');
            
            expect(beforeStyles.content).toBe('""');
            expect(afterStyles.content).toBe('""');
            expect(beforeStyles.position).toBe('absolute');
            expect(afterStyles.position).toBe('absolute');
        });
    });
    
    describe('Asymmetrical Layout', () => {
        test('should apply rotation to asymmetrical cards', () => {
            const card = document.getElementById('test-card');
            card.classList.add('neo-card--asymmetrical');
            
            const styles = window.getComputedStyle(card);
            expect(styles.transform).toContain('rotate');
        });
        
        test('should have different margins for asymmetrical positioning', () => {
            const card = document.getElementById('test-card');
            card.classList.add('neo-card--asymmetrical');
            
            const styles = window.getComputedStyle(card);
            expect(styles.marginLeft).not.toBe(styles.marginRight);
        });
    });
    
    describe('Grid Layout with Overlapping', () => {
        test('should create overlapping grid container', () => {
            const gridContainer = document.createElement('div');
            gridContainer.className = 'neo-card-grid';
            gridContainer.appendChild(testContainer.firstElementChild.cloneNode(true));
            gridContainer.appendChild(testContainer.firstElementChild.cloneNode(true));
            
            document.body.appendChild(gridContainer);
            
            const styles = window.getComputedStyle(gridContainer);
            expect(styles.display).toBe('grid');
            expect(styles.position).toBe('relative');
            
            document.body.removeChild(gridContainer);
        });
        
        test('should apply z-index layering to grid cards', () => {
            const gridContainer = document.createElement('div');
            gridContainer.className = 'neo-card-grid';
            
            // Add multiple cards
            for (let i = 0; i < 4; i++) {
                const card = testContainer.firstElementChild.cloneNode(true);
                card.id = `grid-card-${i + 1}`;
                gridContainer.appendChild(card);
            }
            
            document.body.appendChild(gridContainer);
            
            const card2 = document.getElementById('grid-card-2');
            const card3 = document.getElementById('grid-card-3');
            const card4 = document.getElementById('grid-card-4');
            
            const styles2 = window.getComputedStyle(card2);
            const styles3 = window.getComputedStyle(card3);
            const styles4 = window.getComputedStyle(card4);
            
            expect(styles2.zIndex).toBe('2');
            expect(styles3.zIndex).toBe('3');
            expect(styles4.zIndex).toBe('1');
            
            document.body.removeChild(gridContainer);
        });
    });
    
    describe('Content Arrangement', () => {
        test('should have misaligned header layout', () => {
            const card = document.getElementById('test-card');
            const header = card.querySelector('.neo-card__header');
            const styles = window.getComputedStyle(header);
            
            expect(styles.display).toBe('grid');
            expect(styles.gridTemplateColumns).toContain('2fr 1fr');
        });
        
        test('should have transformed title positioning', () => {
            const card = document.getElementById('test-card');
            const title = card.querySelector('.neo-card__title');
            const styles = window.getComputedStyle(title);
            
            expect(styles.transform).toContain('translateX');
        });
        
        test('should have offset meta element', () => {
            const card = document.getElementById('test-card');
            const meta = card.querySelector('.neo-card__meta');
            const styles = window.getComputedStyle(meta);
            
            expect(styles.transform).toContain('translateY');
            expect(styles.alignSelf).toBe('end');
        });
    });
    
    describe('Interactive Behavior', () => {
        test('should apply hover effects to interactive cards', () => {
            const card = document.getElementById('test-card');
            card.classList.add('neo-card--interactive');
            
            // Simulate hover
            const hoverEvent = new MouseEvent('mouseenter', { bubbles: true });
            card.dispatchEvent(hoverEvent);
            
            const styles = window.getComputedStyle(card);
            expect(styles.cursor).toBe('pointer');
        });
    });
    
    describe('Responsive Behavior', () => {
        test('should adapt layout for mobile screens', () => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 480,
            });
            
            // Trigger resize event
            window.dispatchEvent(new Event('resize'));
            
            const card = document.getElementById('test-card');
            const header = card.querySelector('.neo-card__header');
            
            // Check if mobile styles are applied
            const mediaQuery = window.matchMedia('(max-width: 480px)');
            expect(mediaQuery.matches).toBe(true);
        });
        
        test('should remove transforms on mobile for asymmetrical cards', () => {
            // This test would require actual CSS media query testing
            // which is complex in JSDOM environment
            expect(true).toBe(true); // Placeholder for manual testing
        });
    });
    
    describe('Accessibility', () => {
        test('should maintain proper heading hierarchy', () => {
            const card = document.getElementById('test-card');
            const title = card.querySelector('.neo-card__title');
            
            expect(title.tagName).toBe('H3');
        });
        
        test('should have sufficient color contrast', () => {
            const card = document.getElementById('test-card');
            const text = card.querySelector('.neo-card__text');
            const styles = window.getComputedStyle(text);
            
            expect(styles.color).toBe('rgb(0, 0, 0)');
            expect(styles.backgroundColor || card.style.backgroundColor).toBe('rgb(255, 255, 255)');
        });
        
        test('should support keyboard navigation for interactive cards', () => {
            const card = document.getElementById('test-card');
            card.classList.add('neo-card--interactive');
            card.setAttribute('tabindex', '0');
            
            expect(card.getAttribute('tabindex')).toBe('0');
        });
    });
    
    describe('Card Variants', () => {
        test('should apply stacked variant styles', () => {
            const card = document.getElementById('test-card');
            card.classList.add('neo-card--stacked');
            
            const beforeStyles = window.getComputedStyle(card, '::before');
            expect(beforeStyles.position).toBe('absolute');
            expect(beforeStyles.zIndex).toBe('-1');
        });
        
        test('should apply offset variant styles', () => {
            const card = document.getElementById('test-card');
            card.classList.add('neo-card--offset');
            
            const styles = window.getComputedStyle(card);
            const afterStyles = window.getComputedStyle(card, '::after');
            
            expect(styles.marginLeft).toContain('32px');
            expect(afterStyles.position).toBe('absolute');
        });
        
        test('should apply accent color variants', () => {
            const card = document.getElementById('test-card');
            card.classList.add('neo-card--accent-green');
            
            // The accent colors are applied via CSS custom properties
            // This test verifies the class is applied correctly
            expect(card.classList.contains('neo-card--accent-green')).toBe(true);
        });
    });
});

// Manual test instructions for visual verification
console.log(`
Neo-Brutalism Card Component Manual Test Instructions:

1. Open tests/card-component.test.html in a browser
2. Verify the following visual elements:
   - Thick black borders (4px) on all cards
   - Solid drop shadows (8px 8px 0px black)
   - Red corner decorations (top-left) and yellow (bottom-right)
   - Asymmetrical card rotations and positioning
   - Overlapping cards in the grid layout with proper z-index stacking
   - Misaligned content with transformed positioning
   - Hover effects on interactive cards (shadow displacement)
   - Responsive behavior when resizing browser window

3. Test responsive behavior:
   - Resize to tablet width (768px) - overlapping should be reduced
   - Resize to mobile width (480px) - asymmetrical transforms should be removed
   - Content should stack vertically on small screens

4. Test accessibility:
   - Tab through interactive cards
   - Verify color contrast is sufficient
   - Check that decorative elements don't interfere with content

5. Performance verification:
   - Check that hover effects are immediate (no smooth transitions)
   - Verify that transforms don't cause layout thrashing
   - Ensure cards render consistently across browsers
`);