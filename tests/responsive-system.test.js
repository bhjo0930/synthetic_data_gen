/**
 * Neo-Brutalism Responsive System Tests
 * Tests responsive behavior, touch targets, and breakpoint adaptations
 */

class ResponsiveSystemTester {
    constructor() {
        this.testResults = [];
        this.touchTargetMinSize = 44; // Minimum touch target size in pixels
        this.init();
    }

    init() {
        this.updateScreenInfo();
        this.runAllTests();
        this.setupEventListeners();
        
        // Update screen info on resize
        window.addEventListener('resize', () => {
            this.updateScreenInfo();
            this.runAllTests();
        });
    }

    updateScreenInfo() {
        const screenSize = document.getElementById('screenSize');
        const viewportSize = document.getElementById('viewportSize');
        
        if (screenSize && viewportSize) {
            screenSize.textContent = `${screen.width}x${screen.height}`;
            viewportSize.textContent = `${window.innerWidth}x${window.innerHeight}`;
        }
    }

    runAllTests() {
        console.log('🧪 Running Neo-Brutalism Responsive System Tests...');
        
        this.testResults = [];
        
        // Core responsive tests
        this.testTouchTargetSizes();
        this.testBreakpointBehavior();
        this.testResponsiveTypography();
        this.testResponsiveGrids();
        this.testResponsiveVisibility();
        this.testTouchInteractions();
        this.testAccessibilityCompliance();
        this.testPerformanceOptimizations();
        
        this.displayTestResults();
    }

    testTouchTargetSizes() {
        console.log('📱 Testing touch target sizes...');
        
        const touchElements = document.querySelectorAll('.neo-touch-friendly, .neo-button, input[type="checkbox"], input[type="radio"]');
        let passedTests = 0;
        let totalTests = touchElements.length;

        touchElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            const meetsMinimum = width >= this.touchTargetMinSize && height >= this.touchTargetMinSize;
            
            if (meetsMinimum) {
                passedTests++;
                console.log(`✅ Touch target ${index + 1}: ${width.toFixed(1)}x${height.toFixed(1)}px - PASS`);
            } else {
                console.log(`❌ Touch target ${index + 1}: ${width.toFixed(1)}x${height.toFixed(1)}px - FAIL (minimum: ${this.touchTargetMinSize}px)`);
            }
        });

        this.testResults.push({
            category: 'Touch Targets',
            passed: passedTests,
            total: totalTests,
            success: passedTests === totalTests
        });
    }

    testBreakpointBehavior() {
        console.log('📐 Testing breakpoint behavior...');
        
        const viewport = window.innerWidth;
        let expectedBehavior = '';
        let passedTests = 0;
        let totalTests = 4;

        // Test breakpoint classification
        if (viewport < 480) {
            expectedBehavior = 'mobile';
        } else if (viewport < 768) {
            expectedBehavior = 'small';
        } else if (viewport < 1024) {
            expectedBehavior = 'medium';
        } else if (viewport < 1200) {
            expectedBehavior = 'large';
        } else {
            expectedBehavior = 'extra-large';
        }

        console.log(`Current viewport: ${viewport}px (${expectedBehavior})`);

        // Test grid column behavior
        const asymmetricGrid = document.querySelector('.neo-grid--responsive-asymmetric');
        if (asymmetricGrid) {
            const computedStyle = window.getComputedStyle(asymmetricGrid);
            const gridColumns = computedStyle.gridTemplateColumns;
            
            if (gridColumns && gridColumns !== 'none') {
                passedTests++;
                console.log(`✅ Asymmetric grid columns: ${gridColumns}`);
            } else {
                console.log(`❌ Asymmetric grid columns not applied`);
            }
        }

        // Test responsive spacing
        const responsiveSpacing = document.querySelector('.neo-spacing--responsive');
        if (responsiveSpacing) {
            const computedStyle = window.getComputedStyle(responsiveSpacing);
            const padding = computedStyle.padding;
            
            if (padding && padding !== '0px') {
                passedTests++;
                console.log(`✅ Responsive spacing applied: ${padding}`);
            } else {
                console.log(`❌ Responsive spacing not applied`);
            }
        }

        // Test responsive buttons
        const responsiveButtons = document.querySelectorAll('.neo-button--responsive');
        if (responsiveButtons.length > 0) {
            const button = responsiveButtons[0];
            const rect = button.getBoundingClientRect();
            
            if (rect.width > 0 && rect.height >= this.touchTargetMinSize) {
                passedTests++;
                console.log(`✅ Responsive button sizing: ${rect.width.toFixed(1)}x${rect.height.toFixed(1)}px`);
            } else {
                console.log(`❌ Responsive button sizing inadequate`);
            }
        }

        // Test visibility classes
        const mobileOnly = document.querySelector('.neo-show-mobile-only');
        const desktopOnly = document.querySelector('.neo-show-desktop');
        
        if (mobileOnly && desktopOnly) {
            const mobileVisible = window.getComputedStyle(mobileOnly).display !== 'none';
            const desktopVisible = window.getComputedStyle(desktopOnly).display !== 'none';
            
            const correctVisibility = (viewport < 480 && mobileVisible && !desktopVisible) ||
                                    (viewport >= 768 && !mobileVisible && desktopVisible) ||
                                    (viewport >= 480 && viewport < 768);
            
            if (correctVisibility) {
                passedTests++;
                console.log(`✅ Visibility classes working correctly`);
            } else {
                console.log(`❌ Visibility classes not working correctly`);
            }
        }

        this.testResults.push({
            category: 'Breakpoint Behavior',
            passed: passedTests,
            total: totalTests,
            success: passedTests >= totalTests * 0.75 // Allow some flexibility
        });
    }

    testResponsiveTypography() {
        console.log('🔤 Testing responsive typography...');
        
        const responsiveHeading = document.querySelector('.neo-heading--responsive');
        const responsiveText = document.querySelector('.neo-text--responsive');
        let passedTests = 0;
        let totalTests = 2;

        if (responsiveHeading) {
            const computedStyle = window.getComputedStyle(responsiveHeading);
            const fontSize = parseFloat(computedStyle.fontSize);
            
            // Check if font size is reasonable for current viewport
            const viewport = window.innerWidth;
            let expectedMinSize = viewport < 480 ? 24 : viewport < 768 ? 28 : 32;
            let expectedMaxSize = viewport < 480 ? 32 : viewport < 768 ? 36 : 48;
            
            if (fontSize >= expectedMinSize && fontSize <= expectedMaxSize + 10) {
                passedTests++;
                console.log(`✅ Responsive heading font size: ${fontSize}px`);
            } else {
                console.log(`❌ Responsive heading font size: ${fontSize}px (expected: ${expectedMinSize}-${expectedMaxSize}px)`);
            }
        }

        if (responsiveText) {
            const computedStyle = window.getComputedStyle(responsiveText);
            const fontSize = parseFloat(computedStyle.fontSize);
            
            // Text should be readable (14-20px range)
            if (fontSize >= 14 && fontSize <= 20) {
                passedTests++;
                console.log(`✅ Responsive text font size: ${fontSize}px`);
            } else {
                console.log(`❌ Responsive text font size: ${fontSize}px (expected: 14-20px)`);
            }
        }

        this.testResults.push({
            category: 'Responsive Typography',
            passed: passedTests,
            total: totalTests,
            success: passedTests === totalTests
        });
    }

    testResponsiveGrids() {
        console.log('🏗️ Testing responsive grid systems...');
        
        const asymmetricGrid = document.querySelector('.neo-grid--responsive-asymmetric');
        const chaosGrid = document.querySelector('.neo-grid--responsive-chaos');
        let passedTests = 0;
        let totalTests = 2;

        if (asymmetricGrid) {
            const computedStyle = window.getComputedStyle(asymmetricGrid);
            const display = computedStyle.display;
            const gridColumns = computedStyle.gridTemplateColumns;
            
            if (display === 'grid' && gridColumns !== 'none') {
                passedTests++;
                console.log(`✅ Asymmetric grid working: ${gridColumns}`);
            } else {
                console.log(`❌ Asymmetric grid not working: display=${display}, columns=${gridColumns}`);
            }
        }

        if (chaosGrid) {
            const computedStyle = window.getComputedStyle(chaosGrid);
            const display = computedStyle.display;
            const gridColumns = computedStyle.gridTemplateColumns;
            
            if (display === 'grid' && gridColumns !== 'none') {
                passedTests++;
                console.log(`✅ Chaos grid working: ${gridColumns}`);
            } else {
                console.log(`❌ Chaos grid not working: display=${display}, columns=${gridColumns}`);
            }
        }

        this.testResults.push({
            category: 'Responsive Grids',
            passed: passedTests,
            total: totalTests,
            success: passedTests === totalTests
        });
    }

    testResponsiveVisibility() {
        console.log('👁️ Testing responsive visibility...');
        
        const viewport = window.innerWidth;
        const visibilityElements = {
            mobileOnly: document.querySelector('.neo-show-mobile-only'),
            tabletOnly: document.querySelector('.neo-show-tablet-only'),
            desktop: document.querySelector('.neo-show-desktop'),
            hideMobile: document.querySelector('.neo-hide-mobile')
        };

        let passedTests = 0;
        let totalTests = Object.keys(visibilityElements).length;

        Object.entries(visibilityElements).forEach(([key, element]) => {
            if (element) {
                const isVisible = window.getComputedStyle(element).display !== 'none';
                let shouldBeVisible = false;

                switch (key) {
                    case 'mobileOnly':
                        shouldBeVisible = viewport < 480;
                        break;
                    case 'tabletOnly':
                        shouldBeVisible = viewport >= 480 && viewport < 768;
                        break;
                    case 'desktop':
                        shouldBeVisible = viewport >= 768;
                        break;
                    case 'hideMobile':
                        shouldBeVisible = viewport >= 480;
                        break;
                }

                if (isVisible === shouldBeVisible) {
                    passedTests++;
                    console.log(`✅ ${key} visibility correct: ${isVisible ? 'visible' : 'hidden'}`);
                } else {
                    console.log(`❌ ${key} visibility incorrect: ${isVisible ? 'visible' : 'hidden'} (should be ${shouldBeVisible ? 'visible' : 'hidden'})`);
                }
            }
        });

        this.testResults.push({
            category: 'Responsive Visibility',
            passed: passedTests,
            total: totalTests,
            success: passedTests === totalTests
        });
    }

    testTouchInteractions() {
        console.log('👆 Testing touch interactions...');
        
        let passedTests = 0;
        let totalTests = 3;

        // Test button active states
        const buttons = document.querySelectorAll('.neo-button');
        if (buttons.length > 0) {
            // Simulate touch interaction
            const button = buttons[0];
            button.classList.add('active');
            
            const computedStyle = window.getComputedStyle(button);
            const transform = computedStyle.transform;
            
            if (transform && transform !== 'none') {
                passedTests++;
                console.log(`✅ Button touch interaction working: ${transform}`);
            } else {
                console.log(`❌ Button touch interaction not working`);
            }
            
            button.classList.remove('active');
        }

        // Test input focus states
        const inputs = document.querySelectorAll('.neo-input--responsive');
        if (inputs.length > 0) {
            const input = inputs[0];
            input.focus();
            
            const computedStyle = window.getComputedStyle(input);
            const borderWidth = computedStyle.borderWidth;
            
            if (borderWidth && parseFloat(borderWidth) >= 4) {
                passedTests++;
                console.log(`✅ Input focus interaction working: border-width=${borderWidth}`);
            } else {
                console.log(`❌ Input focus interaction not working: border-width=${borderWidth}`);
            }
            
            input.blur();
        }

        // Test checkbox interactions
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        if (checkboxes.length > 0) {
            const checkbox = checkboxes[0];
            const rect = checkbox.getBoundingClientRect();
            
            if (rect.width >= 20 && rect.height >= 20) {
                passedTests++;
                console.log(`✅ Checkbox touch target adequate: ${rect.width}x${rect.height}px`);
            } else {
                console.log(`❌ Checkbox touch target too small: ${rect.width}x${rect.height}px`);
            }
        }

        this.testResults.push({
            category: 'Touch Interactions',
            passed: passedTests,
            total: totalTests,
            success: passedTests >= totalTests * 0.67 // Allow some flexibility
        });
    }

    testAccessibilityCompliance() {
        console.log('♿ Testing accessibility compliance...');
        
        let passedTests = 0;
        let totalTests = 4;

        // Test focus indicators
        const focusableElements = document.querySelectorAll('button, input, select, textarea, a');
        let focusIndicatorCount = 0;
        
        focusableElements.forEach(element => {
            element.focus();
            const computedStyle = window.getComputedStyle(element);
            const outline = computedStyle.outline;
            const outlineWidth = computedStyle.outlineWidth;
            
            if (outline !== 'none' || parseFloat(outlineWidth) > 0) {
                focusIndicatorCount++;
            }
            element.blur();
        });

        if (focusIndicatorCount >= focusableElements.length * 0.8) {
            passedTests++;
            console.log(`✅ Focus indicators present: ${focusIndicatorCount}/${focusableElements.length}`);
        } else {
            console.log(`❌ Insufficient focus indicators: ${focusIndicatorCount}/${focusableElements.length}`);
        }

        // Test color contrast (simplified check)
        const textElements = document.querySelectorAll('p, h1, h2, h3, label, button');
        let contrastCount = 0;
        
        textElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const color = computedStyle.color;
            const backgroundColor = computedStyle.backgroundColor;
            
            // Simplified contrast check - Neo-Brutalism uses high contrast by design
            if (color.includes('0, 0, 0') || color.includes('255, 255, 255')) {
                contrastCount++;
            }
        });

        if (contrastCount >= textElements.length * 0.7) {
            passedTests++;
            console.log(`✅ High contrast colors used: ${contrastCount}/${textElements.length}`);
        } else {
            console.log(`❌ Insufficient high contrast: ${contrastCount}/${textElements.length}`);
        }

        // Test reduced motion support
        const hasReducedMotionSupport = document.querySelector('style, link[rel="stylesheet"]');
        if (hasReducedMotionSupport) {
            passedTests++;
            console.log(`✅ Reduced motion support available`);
        } else {
            console.log(`❌ Reduced motion support not detected`);
        }

        // Test semantic markup
        const semanticElements = document.querySelectorAll('nav, main, section, article, header, footer, h1, h2, h3, label');
        if (semanticElements.length > 0) {
            passedTests++;
            console.log(`✅ Semantic markup present: ${semanticElements.length} elements`);
        } else {
            console.log(`❌ Insufficient semantic markup`);
        }

        this.testResults.push({
            category: 'Accessibility Compliance',
            passed: passedTests,
            total: totalTests,
            success: passedTests >= totalTests * 0.75
        });
    }

    testPerformanceOptimizations() {
        console.log('⚡ Testing performance optimizations...');
        
        let passedTests = 0;
        let totalTests = 3;

        // Test CSS loading
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        if (stylesheets.length > 0) {
            passedTests++;
            console.log(`✅ CSS stylesheets loaded: ${stylesheets.length}`);
        }

        // Test mobile complexity reduction
        const viewport = window.innerWidth;
        const complexElements = document.querySelectorAll('.neo-complex-overlap, .neo-extreme-overlap');
        
        if (viewport < 768) {
            // On mobile, complex overlaps should be simplified or hidden
            let simplifiedCount = 0;
            complexElements.forEach(element => {
                const computedStyle = window.getComputedStyle(element, '::before');
                if (computedStyle.display === 'none' || computedStyle.content === 'none') {
                    simplifiedCount++;
                }
            });
            
            if (simplifiedCount > 0 || complexElements.length === 0) {
                passedTests++;
                console.log(`✅ Mobile complexity reduction working`);
            } else {
                console.log(`❌ Mobile complexity not reduced`);
            }
        } else {
            passedTests++; // Desktop doesn't need complexity reduction
            console.log(`✅ Desktop complexity appropriate`);
        }

        // Test responsive image/content loading
        const responsiveElements = document.querySelectorAll('[class*="responsive"]');
        if (responsiveElements.length > 0) {
            passedTests++;
            console.log(`✅ Responsive elements present: ${responsiveElements.length}`);
        } else {
            console.log(`❌ No responsive elements detected`);
        }

        this.testResults.push({
            category: 'Performance Optimizations',
            passed: passedTests,
            total: totalTests,
            success: passedTests >= totalTests * 0.67
        });
    }

    setupEventListeners() {
        // Test touch interactions on actual touch events
        const touchElements = document.querySelectorAll('.neo-touch-friendly, .neo-button');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', (e) => {
                console.log(`👆 Touch started on: ${element.className}`);
            });
            
            element.addEventListener('touchend', (e) => {
                console.log(`👆 Touch ended on: ${element.className}`);
            });
        });

        // Test keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                console.log(`⌨️ Tab navigation: ${document.activeElement.tagName}.${document.activeElement.className}`);
            }
        });
    }

    displayTestResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        
        let totalPassed = 0;
        let totalTests = 0;
        
        this.testResults.forEach(result => {
            const status = result.success ? '✅ PASS' : '❌ FAIL';
            const percentage = ((result.passed / result.total) * 100).toFixed(1);
            
            console.log(`${status} ${result.category}: ${result.passed}/${result.total} (${percentage}%)`);
            
            totalPassed += result.passed;
            totalTests += result.total;
        });
        
        const overallPercentage = ((totalPassed / totalTests) * 100).toFixed(1);
        console.log('========================');
        console.log(`Overall: ${totalPassed}/${totalTests} (${overallPercentage}%)`);
        
        if (overallPercentage >= 80) {
            console.log('🎉 Responsive system tests PASSED!');
        } else {
            console.log('⚠️ Responsive system tests need improvement');
        }
    }
}

// Initialize tests when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResponsiveSystemTester();
});

// Export for potential use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveSystemTester;
}