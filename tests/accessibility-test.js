/**
 * Accessibility Testing Module for Neo-Brutalism Design System
 * Specialized tests for WCAG compliance and accessibility features
 */

class AccessibilityTester {
    constructor() {
        this.wcagRequirements = {
            'AA': {
                contrastRatio: 4.5,
                largeTextContrast: 3,
                touchTargetSize: 44 // pixels
            },
            'AAA': {
                contrastRatio: 7,
                largeTextContrast: 4.5,
                touchTargetSize: 44
            }
        };
    }

    /**
     * Test color contrast ratios for WCAG compliance
     */
    testColorContrast(foreground, background, level = 'AA', isLargeText = false) {
        const ratio = this.calculateContrastRatio(foreground, background);
        const required = isLargeText ? 
            this.wcagRequirements[level].largeTextContrast : 
            this.wcagRequirements[level].contrastRatio;
        
        return {
            ratio: ratio,
            required: required,
            passes: ratio >= required,
            level: level,
            isLargeText: isLargeText
        };
    }

    /**
     * Calculate WCAG contrast ratio between two colors
     */
    calculateContrastRatio(color1, color2) {
        const getLuminance = (color) => {
            const rgb = this.hexToRgb(color);
            const [r, g, b] = rgb.map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };

        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        
        return (brightest + 0.05) / (darkest + 0.05);
    }

    /**
     * Convert hex color to RGB values
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    /**
     * Test focus indicators for keyboard navigation
     */
    testFocusIndicators(element) {
        const originalStyles = {
            outline: element.style.outline,
            boxShadow: element.style.boxShadow,
            border: element.style.border
        };

        // Focus the element
        element.focus();
        
        // Get computed styles when focused
        const computedStyles = window.getComputedStyle(element, ':focus');
        const hasVisibleFocus = (
            computedStyles.outline !== 'none' &&
            computedStyles.outline !== '' &&
            computedStyles.outline !== '0'
        ) || (
            computedStyles.boxShadow !== 'none' &&
            computedStyles.boxShadow !== ''
        ) || (
            element.style.outline !== 'none' &&
            element.style.outline !== ''
        );

        // Check focus indicator size and contrast
        const focusIndicatorSize = this.extractOutlineWidth(computedStyles.outline);
        const meetsMinimumSize = focusIndicatorSize >= 2; // WCAG 2.2 requirement

        return {
            hasVisibleFocus,
            meetsMinimumSize,
            focusIndicatorSize,
            passes: hasVisibleFocus && meetsMinimumSize
        };
    }

    /**
     * Extract outline width from CSS outline property
     */
    extractOutlineWidth(outline) {
        if (!outline || outline === 'none') return 0;
        const match = outline.match(/(\d+)px/);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * Test keyboard navigation and tab order
     */
    testKeyboardNavigation(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const tabOrder = Array.from(focusableElements).map(el => {
            const tabIndex = el.getAttribute('tabindex');
            return {
                element: el,
                tabIndex: tabIndex ? parseInt(tabIndex) : 0,
                tagName: el.tagName.toLowerCase()
            };
        });

        // Sort by tab index to check logical order
        const sortedByTabIndex = [...tabOrder].sort((a, b) => {
            if (a.tabIndex === b.tabIndex) return 0;
            if (a.tabIndex === 0) return 1; // 0 comes last
            if (b.tabIndex === 0) return -1; // 0 comes last
            return a.tabIndex - b.tabIndex;
        });

        return {
            totalFocusableElements: focusableElements.length,
            tabOrder: tabOrder,
            logicalOrder: sortedByTabIndex,
            hasLogicalTabOrder: this.checkLogicalTabOrder(sortedByTabIndex)
        };
    }

    /**
     * Check if tab order is logical
     */
    checkLogicalTabOrder(sortedElements) {
        for (let i = 0; i < sortedElements.length - 1; i++) {
            const current = sortedElements[i];
            const next = sortedElements[i + 1];
            
            // Check if elements are in logical visual order
            const currentRect = current.element.getBoundingClientRect();
            const nextRect = next.element.getBoundingClientRect();
            
            // Simple heuristic: next element should be to the right or below
            if (currentRect.top > nextRect.bottom + 10) {
                return false; // Next element is significantly above current
            }
        }
        return true;
    }

    /**
     * Test ARIA attributes and semantic markup
     */
    testAriaCompliance(element) {
        const ariaAttributes = {};
        const attributes = element.attributes;
        
        // Collect all ARIA attributes
        for (let attr of attributes) {
            if (attr.name.startsWith('aria-')) {
                ariaAttributes[attr.name] = attr.value;
            }
        }

        // Check role attribute
        const role = element.getAttribute('role');
        
        // Check for required ARIA attributes based on role
        const requiredAria = this.getRequiredAriaAttributes(role || element.tagName.toLowerCase());
        const missingRequired = requiredAria.filter(attr => !ariaAttributes[attr]);

        // Check for accessible name
        const hasAccessibleName = this.hasAccessibleName(element);

        return {
            role: role,
            ariaAttributes: ariaAttributes,
            requiredAria: requiredAria,
            missingRequired: missingRequired,
            hasAccessibleName: hasAccessibleName,
            passes: missingRequired.length === 0 && hasAccessibleName
        };
    }

    /**
     * Get required ARIA attributes for a given role or element
     */
    getRequiredAriaAttributes(roleOrElement) {
        const requirements = {
            'button': [],
            'link': [],
            'textbox': [],
            'combobox': ['aria-expanded'],
            'tab': ['aria-selected'],
            'tabpanel': ['aria-labelledby'],
            'dialog': ['aria-labelledby'],
            'alert': [],
            'status': []
        };
        
        return requirements[roleOrElement] || [];
    }

    /**
     * Check if element has an accessible name
     */
    hasAccessibleName(element) {
        // Check various ways an element can have an accessible name
        const hasAriaLabel = element.hasAttribute('aria-label') && element.getAttribute('aria-label').trim();
        const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
        const hasTitle = element.hasAttribute('title') && element.getAttribute('title').trim();
        
        // Check for associated label
        const hasLabel = element.id && document.querySelector(`label[for="${element.id}"]`);
        
        // Check for text content (for buttons, links)
        const hasTextContent = element.textContent && element.textContent.trim();
        
        // Check for alt text (for images)
        const hasAlt = element.hasAttribute('alt') && element.getAttribute('alt').trim();

        return hasAriaLabel || hasAriaLabelledBy || hasTitle || hasLabel || hasTextContent || hasAlt;
    }

    /**
     * Test touch target sizes for mobile accessibility
     */
    testTouchTargets(elements, minSize = 44) {
        const results = [];
        
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const area = width * height;
            
            const meetsWidthRequirement = width >= minSize;
            const meetsHeightRequirement = height >= minSize;
            const meetsAreaRequirement = area >= (minSize * minSize * 0.8); // Allow 20% smaller if one dimension is adequate
            
            results.push({
                element: element,
                width: width,
                height: height,
                area: area,
                meetsRequirements: meetsWidthRequirement && meetsHeightRequirement,
                meetsAreaRequirement: meetsAreaRequirement,
                passes: meetsWidthRequirement && meetsHeightRequirement
            });
        });
        
        return results;
    }

    /**
     * Test for reduced motion preferences
     */
    testReducedMotionSupport() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const hasReducedMotionCSS = this.checkReducedMotionCSS();
        
        return {
            userPrefersReducedMotion: prefersReducedMotion,
            hasReducedMotionCSS: hasReducedMotionCSS,
            passes: hasReducedMotionCSS // CSS should handle reduced motion preferences
        };
    }

    /**
     * Check if CSS includes reduced motion media query
     */
    checkReducedMotionCSS() {
        const stylesheets = Array.from(document.styleSheets);
        
        for (let stylesheet of stylesheets) {
            try {
                const rules = Array.from(stylesheet.cssRules || []);
                for (let rule of rules) {
                    if (rule.type === CSSRule.MEDIA_RULE && 
                        rule.conditionText && 
                        rule.conditionText.includes('prefers-reduced-motion')) {
                        return true;
                    }
                }
            } catch (e) {
                // Cross-origin stylesheets may not be accessible
                console.warn('Could not access stylesheet:', e);
            }
        }
        
        return false;
    }

    /**
     * Test heading hierarchy for screen readers
     */
    testHeadingHierarchy(container = document) {
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const headingLevels = Array.from(headings).map(heading => ({
            element: heading,
            level: parseInt(heading.tagName.substr(1)),
            text: heading.textContent.trim()
        }));

        // Check for logical hierarchy
        let hasLogicalHierarchy = true;
        let previousLevel = 0;
        
        for (let heading of headingLevels) {
            if (heading.level > previousLevel + 1) {
                hasLogicalHierarchy = false;
                break;
            }
            previousLevel = heading.level;
        }

        return {
            headings: headingLevels,
            hasLogicalHierarchy: hasLogicalHierarchy,
            passes: headingLevels.length > 0 && hasLogicalHierarchy
        };
    }

    /**
     * Test skip links for keyboard navigation
     */
    testSkipLinks() {
        const skipLinks = document.querySelectorAll('a[href^="#"]:first-child, a[href^="#"].skip-link');
        
        const results = [];
        skipLinks.forEach(link => {
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            results.push({
                element: link,
                targetId: targetId,
                hasValidTarget: !!targetElement,
                text: link.textContent.trim(),
                passes: !!targetElement && link.textContent.trim().length > 0
            });
        });

        return {
            skipLinks: results,
            hasSkipLinks: results.length > 0,
            allSkipLinksValid: results.every(r => r.passes)
        };
    }

    /**
     * Run comprehensive accessibility audit
     */
    async runFullAccessibilityAudit(container = document) {
        const results = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0
            },
            colorContrast: [],
            focusIndicators: [],
            keyboardNavigation: null,
            ariaCompliance: [],
            touchTargets: [],
            reducedMotion: null,
            headingHierarchy: null,
            skipLinks: null
        };

        // Test color contrast for Neo-Brutalism color combinations
        const colorTests = [
            { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
            { name: 'Black on White', fg: '#000000', bg: '#FFFFFF' },
            { name: 'Black on Red', fg: '#000000', bg: '#FF0000' },
            { name: 'Black on Blue', fg: '#000000', bg: '#0000FF' },
            { name: 'Black on Green', fg: '#000000', bg: '#00FF00' },
            { name: 'Black on Yellow', fg: '#000000', bg: '#FFFF00' }
        ];

        colorTests.forEach(test => {
            const result = this.testColorContrast(test.fg, test.bg, 'AA');
            result.name = test.name;
            results.colorContrast.push(result);
            results.summary.totalTests++;
            if (result.passes) results.summary.passedTests++;
            else results.summary.failedTests++;
        });

        // Test focus indicators
        const focusableElements = container.querySelectorAll('button, a, input, select, textarea');
        focusableElements.forEach(element => {
            const result = this.testFocusIndicators(element);
            result.elementType = element.tagName.toLowerCase();
            results.focusIndicators.push(result);
            results.summary.totalTests++;
            if (result.passes) results.summary.passedTests++;
            else results.summary.failedTests++;
        });

        // Test keyboard navigation
        results.keyboardNavigation = this.testKeyboardNavigation(container);
        results.summary.totalTests++;
        if (results.keyboardNavigation.hasLogicalTabOrder) results.summary.passedTests++;
        else results.summary.failedTests++;

        // Test ARIA compliance
        const interactiveElements = container.querySelectorAll('button, a, input, select, textarea, [role]');
        interactiveElements.forEach(element => {
            const result = this.testAriaCompliance(element);
            result.elementType = element.tagName.toLowerCase();
            results.ariaCompliance.push(result);
            results.summary.totalTests++;
            if (result.passes) results.summary.passedTests++;
            else results.summary.failedTests++;
        });

        // Test touch targets
        const touchTargetResults = this.testTouchTargets(Array.from(interactiveElements));
        results.touchTargets = touchTargetResults;
        touchTargetResults.forEach(result => {
            results.summary.totalTests++;
            if (result.passes) results.summary.passedTests++;
            else results.summary.failedTests++;
        });

        // Test reduced motion support
        results.reducedMotion = this.testReducedMotionSupport();
        results.summary.totalTests++;
        if (results.reducedMotion.passes) results.summary.passedTests++;
        else results.summary.failedTests++;

        // Test heading hierarchy
        results.headingHierarchy = this.testHeadingHierarchy(container);
        results.summary.totalTests++;
        if (results.headingHierarchy.passes) results.summary.passedTests++;
        else results.summary.failedTests++;

        // Test skip links
        results.skipLinks = this.testSkipLinks();
        results.summary.totalTests++;
        if (results.skipLinks.allSkipLinksValid) results.summary.passedTests++;
        else results.summary.failedTests++;

        // Calculate overall pass rate
        results.summary.passRate = results.summary.totalTests > 0 ? 
            (results.summary.passedTests / results.summary.totalTests * 100).toFixed(1) : 0;

        return results;
    }

    /**
     * Generate accessibility report
     */
    generateReport(auditResults) {
        const { summary } = auditResults;
        const passRate = parseFloat(summary.passRate);
        
        let grade = 'F';
        if (passRate >= 95) grade = 'A+';
        else if (passRate >= 90) grade = 'A';
        else if (passRate >= 85) grade = 'B+';
        else if (passRate >= 80) grade = 'B';
        else if (passRate >= 75) grade = 'C+';
        else if (passRate >= 70) grade = 'C';
        else if (passRate >= 60) grade = 'D';

        return {
            grade: grade,
            passRate: passRate,
            summary: summary,
            recommendations: this.generateRecommendations(auditResults),
            timestamp: auditResults.timestamp
        };
    }

    /**
     * Generate accessibility recommendations
     */
    generateRecommendations(auditResults) {
        const recommendations = [];

        // Color contrast recommendations
        const failedContrast = auditResults.colorContrast.filter(test => !test.passes);
        if (failedContrast.length > 0) {
            recommendations.push({
                category: 'Color Contrast',
                issue: `${failedContrast.length} color combinations fail WCAG contrast requirements`,
                solution: 'Increase contrast ratios to meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)'
            });
        }

        // Focus indicator recommendations
        const failedFocus = auditResults.focusIndicators.filter(test => !test.passes);
        if (failedFocus.length > 0) {
            recommendations.push({
                category: 'Focus Indicators',
                issue: `${failedFocus.length} elements lack proper focus indicators`,
                solution: 'Add visible focus outlines with minimum 2px width and sufficient contrast'
            });
        }

        // ARIA compliance recommendations
        const failedAria = auditResults.ariaCompliance.filter(test => !test.passes);
        if (failedAria.length > 0) {
            recommendations.push({
                category: 'ARIA Compliance',
                issue: `${failedAria.length} elements have missing or incorrect ARIA attributes`,
                solution: 'Add required ARIA attributes and ensure all interactive elements have accessible names'
            });
        }

        // Touch target recommendations
        const failedTouchTargets = auditResults.touchTargets.filter(test => !test.passes);
        if (failedTouchTargets.length > 0) {
            recommendations.push({
                category: 'Touch Targets',
                issue: `${failedTouchTargets.length} interactive elements are too small for touch`,
                solution: 'Increase touch target sizes to minimum 44x44 pixels'
            });
        }

        return recommendations;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityTester;
} else {
    window.AccessibilityTester = AccessibilityTester;
}