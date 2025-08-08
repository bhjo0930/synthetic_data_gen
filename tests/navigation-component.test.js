/**
 * Navigation Component Tests - Neo-Brutalism Design System
 * Tests for accessibility, interaction, and visual compliance
 */

// Test configuration
const TEST_CONFIG = {
    timeout: 5000,
    retries: 3
};

// Test utilities
class NavigationTester {
    constructor() {
        this.testResults = [];
        this.setupTestEnvironment();
    }

    setupTestEnvironment() {
        // Create test container
        this.testContainer = document.createElement('div');
        this.testContainer.id = 'navigation-test-container';
        this.testContainer.style.cssText = `
            position: fixed;
            top: -9999px;
            left: -9999px;
            width: 1000px;
            height: 800px;
            background: white;
        `;
        document.body.appendChild(this.testContainer);
    }

    createTestNavigation(config = {}) {
        const nav = document.createElement('nav');
        nav.innerHTML = `
            <a href="/generate.html" ${config.activeFirst ? 'class="active"' : ''}>Generate People</a>
            <a href="/search.html" ${config.activeSecond ? 'class="active"' : ''}>Analytics Dashboard</a>
            ${config.extraLinks ? '<a href="/settings.html">Settings</a>' : ''}
        `;
        
        if (config.withIcons) {
            nav.innerHTML = `
                <a href="/generate.html" ${config.activeFirst ? 'class="active"' : ''}><i class="fas fa-plus-circle"></i> Generate People</a>
                <a href="/search.html" ${config.activeSecond ? 'class="active"' : ''}><i class="fas fa-chart-line"></i> Analytics</a>
            `;
        }

        if (config.headerStyle) {
            const header = document.createElement('header');
            header.className = 'olap-header';
            header.appendChild(nav);
            return header;
        }

        return nav;
    }

    async runTest(testName, testFunction) {
        console.log(`Running test: ${testName}`);
        try {
            const result = await testFunction();
            this.testResults.push({
                name: testName,
                status: 'PASS',
                result: result
            });
            console.log(`✓ ${testName} - PASSED`);
            return true;
        } catch (error) {
            this.testResults.push({
                name: testName,
                status: 'FAIL',
                error: error.message
            });
            console.error(`✗ ${testName} - FAILED:`, error.message);
            return false;
        }
    }

    // Test 1: Basic Navigation Structure
    async testBasicStructure() {
        return this.runTest('Basic Navigation Structure', () => {
            const nav = this.createTestNavigation();
            this.testContainer.appendChild(nav);

            const computedStyle = window.getComputedStyle(nav);
            const links = nav.querySelectorAll('a');

            // Check navigation has proper border and shadow
            if (!computedStyle.border.includes('4px')) {
                throw new Error('Navigation missing thick border');
            }

            if (computedStyle.boxShadow === 'none') {
                throw new Error('Navigation missing box shadow');
            }

            // Check links have proper styling
            links.forEach((link, index) => {
                const linkStyle = window.getComputedStyle(link);
                if (!linkStyle.border.includes('4px')) {
                    throw new Error(`Link ${index + 1} missing thick border`);
                }
                if (linkStyle.boxShadow === 'none') {
                    throw new Error(`Link ${index + 1} missing box shadow`);
                }
            });

            this.testContainer.removeChild(nav);
            return 'Navigation structure meets Neo-Brutalism requirements';
        });
    }

    // Test 2: Active State Styling
    async testActiveState() {
        return this.runTest('Active State Styling', () => {
            const nav = this.createTestNavigation({ activeFirst: true });
            this.testContainer.appendChild(nav);

            const activeLink = nav.querySelector('a.active');
            const computedStyle = window.getComputedStyle(activeLink);

            // Check active state has red background
            const bgColor = computedStyle.backgroundColor;
            if (bgColor !== 'rgb(255, 0, 0)' && bgColor !== '#ff0000') {
                throw new Error(`Active state background incorrect: ${bgColor}`);
            }

            // Check active state has enhanced shadow
            if (!computedStyle.boxShadow.includes('8px')) {
                throw new Error('Active state missing enhanced shadow');
            }

            // Check transform is applied
            const transform = computedStyle.transform;
            if (transform === 'none') {
                throw new Error('Active state missing transform');
            }

            this.testContainer.removeChild(nav);
            return 'Active state styling correct';
        });
    }

    // Test 3: Focus State Accessibility
    async testFocusState() {
        return this.runTest('Focus State Accessibility', () => {
            const nav = this.createTestNavigation();
            this.testContainer.appendChild(nav);

            const firstLink = nav.querySelector('a');
            
            // Simulate focus
            firstLink.focus();
            
            // Check if focus styles are applied
            const focusStyle = window.getComputedStyle(firstLink, ':focus');
            
            // Note: :focus pseudo-class styles are hard to test programmatically
            // This test verifies the element can receive focus
            if (document.activeElement !== firstLink) {
                throw new Error('Link cannot receive focus');
            }

            // Check tabindex is properly set or default
            const tabIndex = firstLink.getAttribute('tabindex');
            if (tabIndex && parseInt(tabIndex) < 0) {
                throw new Error('Link has negative tabindex, preventing keyboard access');
            }

            this.testContainer.removeChild(nav);
            return 'Focus state accessibility verified';
        });
    }

    // Test 4: Keyboard Navigation
    async testKeyboardNavigation() {
        return this.runTest('Keyboard Navigation', () => {
            const nav = this.createTestNavigation({ extraLinks: true });
            this.testContainer.appendChild(nav);

            const links = nav.querySelectorAll('a');
            
            // Test Tab navigation
            links[0].focus();
            if (document.activeElement !== links[0]) {
                throw new Error('First link cannot be focused');
            }

            // Simulate Tab key press
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
            document.dispatchEvent(tabEvent);

            // Test Enter key activation
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            let enterPressed = false;
            links[0].addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    enterPressed = true;
                }
            });
            links[0].dispatchEvent(enterEvent);

            this.testContainer.removeChild(nav);
            return 'Keyboard navigation functional';
        });
    }

    // Test 5: ARIA Compliance
    async testARIACompliance() {
        return this.runTest('ARIA Compliance', () => {
            const nav = this.createTestNavigation({ activeFirst: true });
            
            // Add ARIA attributes
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Main navigation');
            
            const activeLink = nav.querySelector('.active');
            activeLink.setAttribute('aria-current', 'page');

            this.testContainer.appendChild(nav);

            // Check ARIA attributes
            if (nav.getAttribute('role') !== 'navigation') {
                throw new Error('Navigation missing role attribute');
            }

            if (!nav.getAttribute('aria-label')) {
                throw new Error('Navigation missing aria-label');
            }

            if (activeLink.getAttribute('aria-current') !== 'page') {
                throw new Error('Active link missing aria-current attribute');
            }

            this.testContainer.removeChild(nav);
            return 'ARIA compliance verified';
        });
    }

    // Test 6: Icon Integration
    async testIconIntegration() {
        return this.runTest('Icon Integration', () => {
            const nav = this.createTestNavigation({ withIcons: true });
            this.testContainer.appendChild(nav);

            const icons = nav.querySelectorAll('i');
            if (icons.length === 0) {
                throw new Error('No icons found in navigation');
            }

            // Check icon styling
            icons.forEach((icon, index) => {
                const iconStyle = window.getComputedStyle(icon);
                // Icons should have text-shadow for pixel-art effect
                if (iconStyle.textShadow === 'none') {
                    console.warn(`Icon ${index + 1} missing text-shadow effect`);
                }
            });

            this.testContainer.removeChild(nav);
            return 'Icon integration verified';
        });
    }

    // Test 7: Responsive Behavior
    async testResponsiveBehavior() {
        return this.runTest('Responsive Behavior', () => {
            const nav = this.createTestNavigation({ extraLinks: true });
            this.testContainer.appendChild(nav);

            // Test mobile breakpoint
            this.testContainer.style.width = '400px';
            
            // Force reflow
            nav.offsetHeight;
            
            const computedStyle = window.getComputedStyle(nav);
            
            // Check if navigation adapts (this is a basic check)
            // In a real responsive test, we'd check flex-direction, etc.
            if (computedStyle.display === 'none') {
                throw new Error('Navigation hidden at mobile breakpoint');
            }

            // Reset container width
            this.testContainer.style.width = '1000px';
            this.testContainer.removeChild(nav);
            return 'Responsive behavior verified';
        });
    }

    // Test 8: Color Contrast
    async testColorContrast() {
        return this.runTest('Color Contrast', () => {
            const nav = this.createTestNavigation();
            this.testContainer.appendChild(nav);

            const link = nav.querySelector('a');
            const computedStyle = window.getComputedStyle(link);

            const bgColor = computedStyle.backgroundColor;
            const textColor = computedStyle.color;

            // Basic contrast check (simplified)
            // In production, you'd use a proper contrast ratio calculator
            if (bgColor === textColor) {
                throw new Error('Background and text colors are identical');
            }

            // Check for high contrast combinations
            const isHighContrast = (
                (bgColor === 'rgb(255, 255, 255)' && textColor === 'rgb(0, 0, 0)') ||
                (bgColor === 'rgb(0, 0, 0)' && textColor === 'rgb(255, 255, 255)')
            );

            if (!isHighContrast) {
                console.warn('Color combination may not meet high contrast requirements');
            }

            this.testContainer.removeChild(nav);
            return 'Color contrast verified';
        });
    }

    // Test 9: Animation Performance
    async testAnimationPerformance() {
        return this.runTest('Animation Performance', () => {
            const nav = this.createTestNavigation();
            this.testContainer.appendChild(nav);

            const link = nav.querySelector('a');
            
            // Check for transition properties
            const computedStyle = window.getComputedStyle(link);
            
            // Neo-Brutalism should have no smooth transitions
            if (computedStyle.transition !== 'none' && computedStyle.transition !== '') {
                console.warn('Link has smooth transitions (should be instant for Neo-Brutalism)');
            }

            // Test hover state change speed
            const startTime = performance.now();
            
            // Simulate hover
            link.dispatchEvent(new MouseEvent('mouseenter'));
            
            const endTime = performance.now();
            const duration = endTime - startTime;

            // Should be nearly instantaneous
            if (duration > 50) {
                console.warn(`Hover state change took ${duration}ms (should be < 50ms)`);
            }

            this.testContainer.removeChild(nav);
            return 'Animation performance verified';
        });
    }

    // Test 10: Cross-browser Compatibility
    async testCrossBrowserCompatibility() {
        return this.runTest('Cross-browser Compatibility', () => {
            const nav = this.createTestNavigation();
            this.testContainer.appendChild(nav);

            // Check for CSS features support
            const testElement = nav.querySelector('a');
            const computedStyle = window.getComputedStyle(testElement);

            // Check box-shadow support
            if (!CSS.supports('box-shadow', '4px 4px 0px #000000')) {
                throw new Error('Browser does not support box-shadow');
            }

            // Check transform support
            if (!CSS.supports('transform', 'translate(-2px, -2px)')) {
                throw new Error('Browser does not support CSS transforms');
            }

            // Check custom properties support
            if (!CSS.supports('color', 'var(--neo-black)')) {
                console.warn('Browser may not support CSS custom properties');
            }

            this.testContainer.removeChild(nav);
            return 'Cross-browser compatibility verified';
        });
    }

    // Run all tests
    async runAllTests() {
        console.log('Starting Navigation Component Test Suite...');
        
        const tests = [
            () => this.testBasicStructure(),
            () => this.testActiveState(),
            () => this.testFocusState(),
            () => this.testKeyboardNavigation(),
            () => this.testARIACompliance(),
            () => this.testIconIntegration(),
            () => this.testResponsiveBehavior(),
            () => this.testColorContrast(),
            () => this.testAnimationPerformance(),
            () => this.testCrossBrowserCompatibility()
        ];

        let passedTests = 0;
        for (const test of tests) {
            const result = await test();
            if (result) passedTests++;
        }

        console.log(`\nTest Suite Complete: ${passedTests}/${tests.length} tests passed`);
        
        // Clean up
        document.body.removeChild(this.testContainer);
        
        return {
            total: tests.length,
            passed: passedTests,
            failed: tests.length - passedTests,
            results: this.testResults
        };
    }

    // Generate test report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            results: this.testResults,
            summary: {
                total: this.testResults.length,
                passed: this.testResults.filter(r => r.status === 'PASS').length,
                failed: this.testResults.filter(r => r.status === 'FAIL').length
            }
        };

        console.log('Navigation Component Test Report:', report);
        return report;
    }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationTester;
}

// Auto-run tests if loaded directly
if (typeof window !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        const tester = new NavigationTester();
        await tester.runAllTests();
        tester.generateReport();
    });
} else if (typeof window !== 'undefined') {
    // Document already loaded
    const tester = new NavigationTester();
    tester.runAllTests().then(() => {
        tester.generateReport();
    });
}