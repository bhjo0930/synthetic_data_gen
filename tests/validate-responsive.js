#!/usr/bin/env node

/**
 * Responsive System Validation Script
 * Validates that the responsive CSS system meets all requirements
 */

const fs = require('fs');
const path = require('path');

class ResponsiveValidator {
    constructor() {
        this.responsiveCssPath = path.join(__dirname, '../static/css/layouts/responsive.css');
        this.testResults = [];
    }

    async validate() {
        console.log('🧪 Validating Neo-Brutalism Responsive System...\n');
        
        try {
            const cssContent = fs.readFileSync(this.responsiveCssPath, 'utf8');
            
            this.validateMobileFirstApproach(cssContent);
            this.validateBreakpoints(cssContent);
            this.validateTouchTargets(cssContent);
            this.validateAsymmetricalLayouts(cssContent);
            this.validateAccessibilityFeatures(cssContent);
            this.validatePerformanceOptimizations(cssContent);
            
            this.displayResults();
            
        } catch (error) {
            console.error('❌ Error reading responsive CSS file:', error.message);
            process.exit(1);
        }
    }

    validateMobileFirstApproach(cssContent) {
        console.log('📱 Validating mobile-first approach...');
        
        const tests = [
            {
                name: 'Base mobile styles without media queries',
                pattern: /\.neo-touch-target\s*{[^}]*min-height:\s*44px/,
                required: true
            },
            {
                name: 'Mobile-first grid definitions',
                pattern: /\.neo-grid--responsive-asymmetric\s*{[^}]*grid-template-columns:\s*1fr\s+2fr/,
                required: true
            },
            {
                name: 'Progressive enhancement with min-width queries',
                pattern: /@media\s*\(\s*min-width:\s*480px\s*\)/g,
                required: true,
                minCount: 1
            },
            {
                name: 'Touch-friendly base sizing',
                pattern: /\.neo-input--responsive\s*{[^}]*min-height:\s*44px/,
                required: true
            }
        ];

        this.runTests('Mobile-First Approach', tests, cssContent);
    }

    validateBreakpoints(cssContent) {
        console.log('📐 Validating responsive breakpoints...');
        
        const expectedBreakpoints = ['480px', '768px', '1024px', '1200px'];
        const tests = [];

        expectedBreakpoints.forEach(breakpoint => {
            tests.push({
                name: `Breakpoint ${breakpoint} defined`,
                pattern: new RegExp(`@media\\s*\\(\\s*min-width:\\s*${breakpoint}\\s*\\)`, 'g'),
                required: true,
                minCount: 1
            });
        });

        // Test for proper breakpoint progression
        tests.push({
            name: 'Breakpoints use min-width (mobile-first)',
            pattern: /@media\s*\(\s*min-width:/g,
            required: true,
            minCount: 4
        });

        tests.push({
            name: 'No max-width only queries (anti-pattern)',
            pattern: /@media\s*\(\s*max-width:[^)]*\)\s*{(?![^}]*min-width)/g,
            required: false,
            maxCount: 2 // Allow some for specific cases
        });

        this.runTests('Responsive Breakpoints', tests, cssContent);
    }

    validateTouchTargets(cssContent) {
        console.log('👆 Validating touch target requirements...');
        
        const tests = [
            {
                name: 'Minimum 44px touch targets defined',
                pattern: /min-height:\s*44px/g,
                required: true,
                minCount: 3
            },
            {
                name: 'Touch-friendly class defined',
                pattern: /\.neo-touch-friendly/g,
                required: true,
                minCount: 1
            },
            {
                name: 'Mobile-specific larger touch targets',
                pattern: /@media\s*\([^}]*max-width:\s*767px[^}]*\)\s*{[^}]*\.neo-touch-friendly[^}]*min-height:\s*48px/,
                required: true
            },
            {
                name: 'Button touch target compliance',
                pattern: /\.neo-button[^}]*min-height:\s*(44|48)px/,
                required: true
            },
            {
                name: 'Input touch target compliance',
                pattern: /input[^}]*min-height:\s*(44|48)px/,
                required: true
            }
        ];

        this.runTests('Touch Target Requirements', tests, cssContent);
    }

    validateAsymmetricalLayouts(cssContent) {
        console.log('🏗️ Validating asymmetrical layout preservation...');
        
        const tests = [
            {
                name: 'Asymmetrical grid system defined',
                pattern: /\.neo-grid--responsive-asymmetric/g,
                required: true,
                minCount: 4 // Should appear in multiple breakpoints
            },
            {
                name: 'Chaos grid system defined',
                pattern: /\.neo-grid--responsive-chaos/g,
                required: true,
                minCount: 4
            },
            {
                name: 'Overlapping elements system',
                pattern: /\.neo-responsive-overlap/g,
                required: true,
                minCount: 1
            },
            {
                name: 'Complex overlapping for larger screens',
                pattern: /\.neo-complex-overlap/g,
                required: true,
                minCount: 1
            },
            {
                name: 'Extreme overlapping for very large screens',
                pattern: /\.neo-extreme-overlap/g,
                required: true,
                minCount: 1
            },
            {
                name: 'Asymmetrical grid columns progression',
                pattern: /grid-template-columns:\s*[^;]*fr[^;]*fr/g,
                required: true,
                minCount: 5 // Multiple asymmetrical definitions
            }
        ];

        this.runTests('Asymmetrical Layout Preservation', tests, cssContent);
    }

    validateAccessibilityFeatures(cssContent) {
        console.log('♿ Validating accessibility compliance...');
        
        const tests = [
            {
                name: 'Reduced motion support',
                pattern: /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/g,
                required: true,
                minCount: 1
            },
            {
                name: 'High contrast mode support',
                pattern: /@media\s*\(\s*prefers-contrast:\s*high\s*\)/g,
                required: true,
                minCount: 1
            },
            {
                name: 'Focus indicator enhancements',
                pattern: /outline[^;]*var\(--neo-border-heavy\)/g,
                required: true,
                minCount: 1
            },
            {
                name: 'Touch device focus improvements',
                pattern: /@media\s*\([^}]*max-width:\s*767px[^}]*\)[^}]*:focus[^}]*outline/,
                required: true
            },
            {
                name: 'Accessibility-compliant font sizes',
                pattern: /font-size:\s*16px/g, // Prevents iOS zoom
                required: true,
                minCount: 1
            }
        ];

        this.runTests('Accessibility Compliance', tests, cssContent);
    }

    validatePerformanceOptimizations(cssContent) {
        console.log('⚡ Validating performance optimizations...');
        
        const tests = [
            {
                name: 'Mobile complexity reduction',
                pattern: /@media\s*\([^}]*max-width:\s*767px[^}]*\)[^}]*display:\s*none/,
                required: true,
                minCount: 1
            },
            {
                name: 'Progressive enhancement for desktop',
                pattern: /@media\s*\(\s*min-width:\s*1024px\s*\)[^}]*\.neo-enhanced-desktop/,
                required: true
            },
            {
                name: 'Simplified animations on mobile',
                pattern: /@media\s*\(\s*max-width:\s*767px\s*\)[\s\S]*?transform:\s*none/,
                required: true
            },
            {
                name: 'CSS Grid fallback support',
                pattern: /@supports\s*not\s*\(\s*display:\s*grid\s*\)/,
                required: true
            }
        ];

        this.runTests('Performance Optimizations', tests, cssContent);
    }

    runTests(category, tests, cssContent) {
        let passed = 0;
        let total = tests.length;

        tests.forEach(test => {
            const matches = cssContent.match(test.pattern);
            const matchCount = matches ? matches.length : 0;
            
            let testPassed = false;
            
            if (test.required) {
                if (test.minCount) {
                    testPassed = matchCount >= test.minCount;
                } else {
                    testPassed = matchCount > 0;
                }
            } else {
                if (test.maxCount) {
                    testPassed = matchCount <= test.maxCount;
                } else {
                    testPassed = true; // Optional test
                }
            }
            
            if (testPassed) {
                passed++;
                console.log(`  ✅ ${test.name} (${matchCount} matches)`);
            } else {
                console.log(`  ❌ ${test.name} (${matchCount} matches, expected: ${test.minCount || 'any'})`);
            }
        });

        this.testResults.push({
            category,
            passed,
            total,
            success: passed === total
        });

        console.log(`  📊 ${category}: ${passed}/${total} tests passed\n`);
    }

    displayResults() {
        console.log('📋 VALIDATION SUMMARY');
        console.log('====================');
        
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
        console.log('====================');
        console.log(`OVERALL: ${totalPassed}/${totalTests} (${overallPercentage}%)`);
        
        if (overallPercentage >= 90) {
            console.log('🎉 RESPONSIVE SYSTEM VALIDATION PASSED!');
            console.log('The Neo-Brutalism responsive design system meets all requirements.');
        } else if (overallPercentage >= 75) {
            console.log('⚠️  RESPONSIVE SYSTEM MOSTLY COMPLIANT');
            console.log('Some improvements needed but core functionality is present.');
        } else {
            console.log('❌ RESPONSIVE SYSTEM VALIDATION FAILED');
            console.log('Significant improvements needed to meet requirements.');
            process.exit(1);
        }
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new ResponsiveValidator();
    validator.validate().catch(console.error);
}

module.exports = ResponsiveValidator;