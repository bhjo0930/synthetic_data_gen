/**
 * Neo-Brutalism Accessibility Compliance Tests
 * Automated testing for WCAG 2.1 AA compliance
 */

// Test utilities
const AccessibilityTester = {
    // Color contrast calculation utilities
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    },
    
    getContrastRatio(color1, color2) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return 0;
        
        const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
        const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
        
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        
        return (brightest + 0.05) / (darkest + 0.05);
    },
    
    // Focus indicator testing
    testFocusIndicators() {
        const results = [];
        const focusableElements = document.querySelectorAll(
            'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach((element, index) => {
            element.focus();
            const computedStyle = window.getComputedStyle(element);
            const outline = computedStyle.outline;
            const outlineWidth = computedStyle.outlineWidth;
            const outlineOffset = computedStyle.outlineOffset;
            
            const hasValidFocus = (
                outline !== 'none' && 
                outline !== '0px' &&
                parseInt(outlineWidth) >= 2
            );
            
            results.push({
                element: element.tagName.toLowerCase() + (element.className ? '.' + element.className : ''),
                index: index,
                hasValidFocus: hasValidFocus,
                outline: outline,
                outlineWidth: outlineWidth,
                outlineOffset: outlineOffset
            });
        });
        
        return results;
    },
    
    // Color contrast testing
    testColorContrast() {
        const results = [];
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, input, textarea, a');
        
        textElements.forEach((element, index) => {
            const computedStyle = window.getComputedStyle(element);
            const color = computedStyle.color;
            const backgroundColor = computedStyle.backgroundColor;
            
            // Convert RGB to hex for contrast calculation
            const rgbToHex = (rgb) => {
                const match = rgb.match(/\d+/g);
                if (!match) return null;
                return '#' + match.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
            };
            
            const textColor = rgbToHex(color);
            const bgColor = rgbToHex(backgroundColor);
            
            if (textColor && bgColor && bgColor !== '#00000000') {
                const contrastRatio = this.getContrastRatio(textColor, bgColor);
                const meetsAA = contrastRatio >= 4.5;
                const meetsAAA = contrastRatio >= 7.0;
                
                results.push({
                    element: element.tagName.toLowerCase() + (element.className ? '.' + element.className : ''),
                    index: index,
                    textColor: textColor,
                    backgroundColor: bgColor,
                    contrastRatio: contrastRatio.toFixed(2),
                    meetsAA: meetsAA,
                    meetsAAA: meetsAAA
                });
            }
        });
        
        return results;
    },
    
    // Semantic markup testing
    testSemanticMarkup() {
        const results = {
            skipLinks: document.querySelectorAll('.skip-link').length,
            srOnlyElements: document.querySelectorAll('.sr-only').length,
            ariaLabels: document.querySelectorAll('[aria-label]').length,
            ariaDescribedBy: document.querySelectorAll('[aria-describedby]').length,
            ariaRequired: document.querySelectorAll('[aria-required="true"]').length,
            ariaInvalid: document.querySelectorAll('[aria-invalid="true"]').length,
            ariaCurrent: document.querySelectorAll('[aria-current]').length,
            headingStructure: this.testHeadingStructure(),
            landmarkRoles: this.testLandmarkRoles()
        };
        
        return results;
    },
    
    testHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const structure = [];
        
        headings.forEach(heading => {
            structure.push({
                level: parseInt(heading.tagName.charAt(1)),
                text: heading.textContent.trim().substring(0, 50)
            });
        });
        
        return structure;
    },
    
    testLandmarkRoles() {
        return {
            main: document.querySelectorAll('main, [role="main"]').length,
            navigation: document.querySelectorAll('nav, [role="navigation"]').length,
            banner: document.querySelectorAll('header, [role="banner"]').length,
            contentinfo: document.querySelectorAll('footer, [role="contentinfo"]').length,
            complementary: document.querySelectorAll('aside, [role="complementary"]').length
        };
    },
    
    // Touch target testing
    testTouchTargets() {
        const results = [];
        const interactiveElements = document.querySelectorAll(
            'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
        );
        
        interactiveElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const meetsMinimumSize = rect.width >= 44 && rect.height >= 44;
            
            results.push({
                element: element.tagName.toLowerCase() + (element.className ? '.' + element.className : ''),
                index: index,
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                meetsMinimumSize: meetsMinimumSize
            });
        });
        
        return results;
    },
    
    // Reduced motion testing
    testReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const animatedElements = document.querySelectorAll('*');
        const results = {
            prefersReducedMotion: prefersReducedMotion,
            elementsWithTransitions: 0,
            elementsWithAnimations: 0
        };
        
        animatedElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.transition !== 'all 0s ease 0s' && computedStyle.transition !== 'none') {
                results.elementsWithTransitions++;
            }
            if (computedStyle.animation !== 'none') {
                results.elementsWithAnimations++;
            }
        });
        
        return results;
    },
    
    // Run all tests
    runAllTests() {
        console.log('🧪 Running Neo-Brutalism Accessibility Tests...\n');
        
        // Focus indicator tests
        console.log('🎯 Testing Focus Indicators...');
        const focusResults = this.testFocusIndicators();
        const focusPassCount = focusResults.filter(r => r.hasValidFocus).length;
        console.log(`✅ Focus indicators: ${focusPassCount}/${focusResults.length} elements pass`);
        
        // Color contrast tests
        console.log('\n🎨 Testing Color Contrast...');
        const contrastResults = this.testColorContrast();
        const contrastAACount = contrastResults.filter(r => r.meetsAA).length;
        const contrastAAACount = contrastResults.filter(r => r.meetsAAA).length;
        console.log(`✅ Color contrast AA: ${contrastAACount}/${contrastResults.length} elements pass`);
        console.log(`✅ Color contrast AAA: ${contrastAAACount}/${contrastResults.length} elements pass`);
        
        // Semantic markup tests
        console.log('\n📝 Testing Semantic Markup...');
        const semanticResults = this.testSemanticMarkup();
        console.log(`✅ Skip links: ${semanticResults.skipLinks}`);
        console.log(`✅ Screen reader only elements: ${semanticResults.srOnlyElements}`);
        console.log(`✅ ARIA labels: ${semanticResults.ariaLabels}`);
        console.log(`✅ ARIA described by: ${semanticResults.ariaDescribedBy}`);
        console.log(`✅ Required fields: ${semanticResults.ariaRequired}`);
        console.log(`✅ Invalid fields: ${semanticResults.ariaInvalid}`);
        console.log(`✅ Current page indicators: ${semanticResults.ariaCurrent}`);
        
        // Touch target tests
        console.log('\n👆 Testing Touch Targets...');
        const touchResults = this.testTouchTargets();
        const touchPassCount = touchResults.filter(r => r.meetsMinimumSize).length;
        console.log(`✅ Touch targets: ${touchPassCount}/${touchResults.length} elements meet 44px minimum`);
        
        // Reduced motion tests
        console.log('\n🎬 Testing Reduced Motion...');
        const motionResults = this.testReducedMotion();
        console.log(`✅ Prefers reduced motion: ${motionResults.prefersReducedMotion}`);
        console.log(`✅ Elements with transitions: ${motionResults.elementsWithTransitions}`);
        console.log(`✅ Elements with animations: ${motionResults.elementsWithAnimations}`);
        
        // Generate summary report
        console.log('\n📊 ACCESSIBILITY COMPLIANCE SUMMARY');
        console.log('=====================================');
        
        const totalTests = focusResults.length + contrastResults.length + touchResults.length;
        const totalPassed = focusPassCount + contrastAACount + touchPassCount;
        const overallScore = Math.round((totalPassed / totalTests) * 100);
        
        console.log(`Overall Score: ${overallScore}% (${totalPassed}/${totalTests} tests passed)`);
        console.log(`Focus Indicators: ${Math.round((focusPassCount / focusResults.length) * 100)}%`);
        console.log(`Color Contrast (AA): ${Math.round((contrastAACount / contrastResults.length) * 100)}%`);
        console.log(`Color Contrast (AAA): ${Math.round((contrastAAACount / contrastResults.length) * 100)}%`);
        console.log(`Touch Targets: ${Math.round((touchPassCount / touchResults.length) * 100)}%`);
        
        // Update status indicators in the HTML
        this.updateStatusIndicators({
            focusScore: Math.round((focusPassCount / focusResults.length) * 100),
            contrastScore: Math.round((contrastAACount / contrastResults.length) * 100),
            touchScore: Math.round((touchPassCount / touchResults.length) * 100),
            overallScore: overallScore
        });
        
        return {
            focus: focusResults,
            contrast: contrastResults,
            semantic: semanticResults,
            touch: touchResults,
            motion: motionResults,
            summary: {
                totalTests,
                totalPassed,
                overallScore
            }
        };
    },
    
    updateStatusIndicators(scores) {
        // Update status indicators based on test results
        const statusElements = document.querySelectorAll('.status');
        statusElements.forEach(status => {
            if (status.textContent.includes('AUTO TEST')) {
                if (scores.overallScore >= 90) {
                    status.className = 'status pass';
                    status.textContent = 'PASS';
                } else if (scores.overallScore >= 70) {
                    status.className = 'status manual';
                    status.textContent = 'PARTIAL';
                } else {
                    status.className = 'status fail';
                    status.textContent = 'FAIL';
                }
            }
        });
    }
};

// Keyboard navigation testing utilities
const KeyboardTester = {
    testTabOrder() {
        const focusableElements = document.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]):not([disabled])'
        );
        
        console.log('\n⌨️  Testing Tab Order...');
        console.log('Use Tab key to navigate through these elements:');
        
        focusableElements.forEach((element, index) => {
            console.log(`${index + 1}. ${element.tagName.toLowerCase()}${element.className ? '.' + element.className : ''} - "${element.textContent?.trim().substring(0, 30) || element.placeholder || 'No text'}"`);
        });
        
        return Array.from(focusableElements);
    },
    
    testKeyboardInteractions() {
        console.log('\n⌨️  Keyboard Interaction Tests:');
        console.log('1. Tab - Navigate forward');
        console.log('2. Shift+Tab - Navigate backward');
        console.log('3. Enter - Activate buttons and links');
        console.log('4. Space - Activate buttons and checkboxes');
        console.log('5. Arrow keys - Navigate within components');
        console.log('6. Escape - Close modals and dropdowns');
    }
};

// High contrast mode testing utilities
const HighContrastTester = {
    testHighContrastSupport() {
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        console.log('\n🔍 High Contrast Mode Testing:');
        console.log(`Current setting: ${prefersHighContrast ? 'High contrast enabled' : 'Normal contrast'}`);
        
        if (prefersHighContrast) {
            console.log('✅ High contrast mode detected - enhanced styles should be active');
            this.validateHighContrastStyles();
        } else {
            console.log('ℹ️  To test high contrast mode:');
            console.log('   - Windows: Settings > Ease of Access > High contrast');
            console.log('   - macOS: System Preferences > Accessibility > Display > Increase contrast');
            console.log('   - Linux: Accessibility settings > High contrast');
        }
        
        return prefersHighContrast;
    },
    
    validateHighContrastStyles() {
        const testElements = [
            { selector: '.neo-button', expectedBorderWidth: '6px' },
            { selector: 'input', expectedBorderWidth: '4px' },
            { selector: 'nav a', expectedBorderWidth: '4px' }
        ];
        
        testElements.forEach(test => {
            const elements = document.querySelectorAll(test.selector);
            elements.forEach(element => {
                const computedStyle = window.getComputedStyle(element);
                const borderWidth = computedStyle.borderWidth;
                const passes = borderWidth === test.expectedBorderWidth;
                
                console.log(`${passes ? '✅' : '❌'} ${test.selector}: border-width ${borderWidth} (expected ${test.expectedBorderWidth})`);
            });
        });
    }
};

// Initialize tests when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Neo-Brutalism Accessibility Test Suite Loaded');
    console.log('=====================================');
    console.log('Open browser console to see detailed test results');
    console.log('Use the following commands to run specific tests:');
    console.log('');
    console.log('AccessibilityTester.runAllTests() - Run all automated tests');
    console.log('KeyboardTester.testTabOrder() - Test keyboard navigation');
    console.log('HighContrastTester.testHighContrastSupport() - Test high contrast mode');
    console.log('');
    
    // Run automated tests after a short delay
    setTimeout(() => {
        AccessibilityTester.runAllTests();
    }, 1000);
    
    // Test keyboard navigation
    KeyboardTester.testTabOrder();
    KeyboardTester.testKeyboardInteractions();
    
    // Test high contrast support
    HighContrastTester.testHighContrastSupport();
});

// Export for manual testing
window.AccessibilityTester = AccessibilityTester;
window.KeyboardTester = KeyboardTester;
window.HighContrastTester = HighContrastTester;