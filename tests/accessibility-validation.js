#!/usr/bin/env node

/**
 * Neo-Brutalism Accessibility Validation Script
 * Command-line tool for validating WCAG 2.1 AA compliance
 */

const fs = require('fs');
const path = require('path');

class AccessibilityValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
    }
    
    // Test CSS for accessibility features
    validateCSS() {
        console.log('🎨 Validating CSS Accessibility Features...\n');
        
        const cssFiles = [
            'static/css/core/accessibility.css',
            'static/css/core/variables.css',
            'static/css/core/reset.css',
            'static/css/components/buttons.css',
            'static/css/components/forms.css',
            'static/css/components/navigation.css'
        ];
        
        cssFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                this.validateCSSContent(content, filePath);
            } else {
                this.addTest(`CSS File: ${filePath}`, false, `File not found: ${filePath}`);
            }
        });
    }
    
    validateCSSContent(content, filePath) {
        const tests = [
            {
                name: 'High Contrast Mode Support',
                pattern: /@media\s*\(\s*prefers-contrast\s*:\s*high\s*\)/,
                required: true
            },
            {
                name: 'Reduced Motion Support',
                pattern: /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/,
                required: true
            },
            {
                name: 'Focus Visible Selectors',
                pattern: /:focus-visible/,
                required: true
            },
            {
                name: 'ARIA Attribute Selectors',
                pattern: /\[aria-[a-z-]+\]/,
                required: false
            },
            {
                name: 'Screen Reader Only Classes',
                pattern: /\.sr-only|\.a11y-hidden/,
                required: true
            },
            {
                name: 'Skip Link Styles',
                pattern: /\.skip-link/,
                required: false
            },
            {
                name: 'Color Contrast Variables',
                pattern: /--neo-(white|black|red|green|blue|yellow)/,
                required: true
            },
            {
                name: 'Focus Outline Styles',
                pattern: /outline\s*:\s*[^;]*;/,
                required: true
            }
        ];
        
        tests.forEach(test => {
            const found = test.pattern.test(content);
            const fileName = path.basename(filePath);
            
            if (test.required) {
                this.addTest(`${fileName}: ${test.name}`, found, 
                    found ? `✅ Found in ${fileName}` : `❌ Missing from ${fileName}`);
            } else {
                if (found) {
                    this.addTest(`${fileName}: ${test.name}`, true, `✅ Found in ${fileName}`);
                } else {
                    this.addWarning(`${fileName}: ${test.name}`, `⚠️  Optional feature not found in ${fileName}`);
                }
            }
        });
    }
    
    // Validate HTML structure
    validateHTML() {
        console.log('📝 Validating HTML Accessibility Structure...\n');
        
        const htmlFiles = [
            'static/generate.html',
            'static/search.html',
            'tests/accessibility-compliance.test.html'
        ];
        
        htmlFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                this.validateHTMLContent(content, filePath);
            } else {
                this.addTest(`HTML File: ${filePath}`, false, `File not found: ${filePath}`);
            }
        });
    }
    
    validateHTMLContent(content, filePath) {
        const tests = [
            {
                name: 'Language Declaration',
                pattern: /<html[^>]*lang\s*=/,
                required: true
            },
            {
                name: 'Skip Links',
                pattern: /class\s*=\s*["']skip-link["']/,
                required: false
            },
            {
                name: 'ARIA Labels',
                pattern: /aria-label\s*=/,
                required: false
            },
            {
                name: 'ARIA Described By',
                pattern: /aria-describedby\s*=/,
                required: false
            },
            {
                name: 'ARIA Required',
                pattern: /aria-required\s*=/,
                required: false
            },
            {
                name: 'ARIA Invalid',
                pattern: /aria-invalid\s*=/,
                required: false
            },
            {
                name: 'ARIA Current',
                pattern: /aria-current\s*=/,
                required: false
            },
            {
                name: 'Semantic HTML5 Elements',
                pattern: /<(main|nav|header|footer|section|article|aside)/,
                required: true
            },
            {
                name: 'Form Labels',
                pattern: /<label[^>]*for\s*=/,
                required: false
            },
            {
                name: 'Alt Text for Images',
                pattern: /<img[^>]*alt\s*=/,
                required: false
            }
        ];
        
        tests.forEach(test => {
            const found = test.pattern.test(content);
            const fileName = path.basename(filePath);
            
            if (test.required) {
                this.addTest(`${fileName}: ${test.name}`, found, 
                    found ? `✅ Found in ${fileName}` : `❌ Missing from ${fileName}`);
            } else {
                if (found) {
                    this.addTest(`${fileName}: ${test.name}`, true, `✅ Found in ${fileName}`);
                } else {
                    this.addWarning(`${fileName}: ${test.name}`, `⚠️  Optional feature not found in ${fileName}`);
                }
            }
        });
    }
    
    // Validate color contrast ratios
    validateColorContrast() {
        console.log('🎨 Validating Color Contrast Ratios...\n');
        
        const colorCombinations = [
            { name: 'Black on White', fg: '#000000', bg: '#FFFFFF', expected: 21 },
            { name: 'White on Black', fg: '#FFFFFF', bg: '#000000', expected: 21 },
            { name: 'Enhanced Red on White', fg: '#CC0000', bg: '#FFFFFF', expected: 5.25 },
            { name: 'Enhanced Green on White', fg: '#006600', bg: '#FFFFFF', expected: 5.25 },
            { name: 'Enhanced Blue on White', fg: '#0000CC', bg: '#FFFFFF', expected: 5.25 }
        ];
        
        colorCombinations.forEach(combo => {
            const ratio = this.calculateContrastRatio(combo.fg, combo.bg);
            const meetsAA = ratio >= 4.5;
            const meetsAAA = ratio >= 7.0;
            
            this.addTest(`Color Contrast: ${combo.name}`, meetsAA, 
                `${combo.name}: ${ratio.toFixed(2)}:1 (AA: ${meetsAA ? '✅' : '❌'}, AAA: ${meetsAAA ? '✅' : '❌'})`);
        });
    }
    
    calculateContrastRatio(color1, color2) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return 0;
        
        const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
        const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
        
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        
        return (brightest + 0.05) / (darkest + 0.05);
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
    
    // Validate file structure
    validateFileStructure() {
        console.log('📁 Validating Accessibility File Structure...\n');
        
        const requiredFiles = [
            'static/css/core/accessibility.css',
            'tests/accessibility-compliance.test.html',
            'tests/accessibility-compliance.test.js'
        ];
        
        const optionalFiles = [
            'tests/accessibility-validation.js'
        ];
        
        requiredFiles.forEach(filePath => {
            const exists = fs.existsSync(filePath);
            this.addTest(`File Structure: ${path.basename(filePath)}`, exists, 
                exists ? `✅ ${filePath} exists` : `❌ ${filePath} missing`);
        });
        
        optionalFiles.forEach(filePath => {
            const exists = fs.existsSync(filePath);
            if (exists) {
                this.addTest(`File Structure: ${path.basename(filePath)}`, true, `✅ ${filePath} exists`);
            } else {
                this.addWarning(`File Structure: ${path.basename(filePath)}`, `⚠️  Optional file ${filePath} not found`);
            }
        });
    }
    
    // Helper methods
    addTest(name, passed, message) {
        this.results.tests.push({ name, passed, message, type: 'test' });
        if (passed) {
            this.results.passed++;
        } else {
            this.results.failed++;
        }
        console.log(message);
    }
    
    addWarning(name, message) {
        this.results.tests.push({ name, passed: null, message, type: 'warning' });
        this.results.warnings++;
        console.log(message);
    }
    
    // Generate comprehensive report
    generateReport() {
        console.log('\n📊 ACCESSIBILITY VALIDATION REPORT');
        console.log('=====================================\n');
        
        const total = this.results.passed + this.results.failed;
        const percentage = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;
        
        console.log(`Overall Score: ${percentage}% (${this.results.passed}/${total} tests passed)`);
        console.log(`Warnings: ${this.results.warnings}`);
        console.log('');
        
        // Categorize results
        const categories = {
            'CSS Features': [],
            'HTML Structure': [],
            'Color Contrast': [],
            'File Structure': []
        };
        
        this.results.tests.forEach(test => {
            if (test.name.includes('CSS') || test.name.includes('.css')) {
                categories['CSS Features'].push(test);
            } else if (test.name.includes('HTML') || test.name.includes('.html')) {
                categories['HTML Structure'].push(test);
            } else if (test.name.includes('Color Contrast')) {
                categories['Color Contrast'].push(test);
            } else if (test.name.includes('File Structure')) {
                categories['File Structure'].push(test);
            }
        });
        
        // Print categorized results
        Object.entries(categories).forEach(([category, tests]) => {
            if (tests.length > 0) {
                console.log(`${category}:`);
                const passed = tests.filter(t => t.passed === true).length;
                const failed = tests.filter(t => t.passed === false).length;
                const warnings = tests.filter(t => t.passed === null).length;
                
                console.log(`  ✅ Passed: ${passed}`);
                if (failed > 0) console.log(`  ❌ Failed: ${failed}`);
                if (warnings > 0) console.log(`  ⚠️  Warnings: ${warnings}`);
                console.log('');
            }
        });
        
        // Recommendations
        console.log('🔧 RECOMMENDATIONS');
        console.log('==================\n');
        
        if (this.results.failed > 0) {
            console.log('Critical Issues to Address:');
            this.results.tests
                .filter(t => t.passed === false)
                .forEach(test => console.log(`  • ${test.name}: ${test.message}`));
            console.log('');
        }
        
        if (this.results.warnings > 0) {
            console.log('Optional Improvements:');
            this.results.tests
                .filter(t => t.passed === null)
                .forEach(test => console.log(`  • ${test.name}: ${test.message}`));
            console.log('');
        }
        
        // Next steps
        console.log('📋 NEXT STEPS');
        console.log('=============\n');
        console.log('1. Open tests/accessibility-compliance.test.html in a browser');
        console.log('2. Run manual tests for high contrast and reduced motion');
        console.log('3. Test keyboard navigation with Tab, Shift+Tab, Enter, Space');
        console.log('4. Validate with screen reader software (NVDA, JAWS, VoiceOver)');
        console.log('5. Run automated accessibility tools (axe, WAVE, Lighthouse)');
        console.log('');
        
        return this.results;
    }
    
    // Run all validations
    runAll() {
        console.log('🧪 Neo-Brutalism Accessibility Validation');
        console.log('==========================================\n');
        
        this.validateFileStructure();
        console.log('');
        
        this.validateCSS();
        console.log('');
        
        this.validateHTML();
        console.log('');
        
        this.validateColorContrast();
        console.log('');
        
        return this.generateReport();
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new AccessibilityValidator();
    const results = validator.runAll();
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
}

module.exports = AccessibilityValidator;