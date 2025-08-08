// Neo-Brutalism Form Components Test Suite
// Run with: node tests/form-component.test.js

const fs = require('fs');
const path = require('path');

class FormComponentTester {
    constructor() {
        this.testResults = [];
        this.cssPath = path.join(__dirname, '../static/css/components/forms.css');
    }

    log(testName, result, details = '') {
        const status = result ? 'PASS' : 'FAIL';
        const message = `${testName}: ${status}${details ? ' - ' + details : ''}`;
        this.testResults.push(message);
        console.log(message);
    }

    async runTests() {
        console.log('🧪 Running Neo-Brutalism Form Components Tests...\n');

        await this.testCSSFileExists();
        await this.testCSSContent();
        await this.testResponsiveDesign();
        await this.testAccessibilityFeatures();
        await this.testValidationStates();
        await this.testAnimations();

        this.printSummary();
    }

    async testCSSFileExists() {
        try {
            const exists = fs.existsSync(this.cssPath);
            this.log('CSS file exists', exists);
            
            if (exists) {
                const stats = fs.statSync(this.cssPath);
                this.log('CSS file size check', stats.size > 1000, `${stats.size} bytes`);
            }
        } catch (error) {
            this.log('CSS file access', false, error.message);
        }
    }

    async testCSSContent() {
        try {
            const cssContent = fs.readFileSync(this.cssPath, 'utf8');
            
            // Test for required selectors
            const requiredSelectors = [
                '.input-group',
                'input[type="text"]',
                'input[type="number"]',
                'select',
                'textarea',
                '.checkbox-item',
                '.error-message',
                '.range-inputs'
            ];

            requiredSelectors.forEach(selector => {
                const exists = cssContent.includes(selector);
                this.log(`CSS selector "${selector}"`, exists);
            });

            // Test for focus states
            const focusSelectors = [
                ':focus',
                'focus-within',
                '@keyframes neo-focus-flash',
                '@keyframes neo-label-jump'
            ];

            focusSelectors.forEach(selector => {
                const exists = cssContent.includes(selector);
                this.log(`Focus animation "${selector}"`, exists);
            });

            // Test for validation states
            const validationFeatures = [
                '.input-group.error',
                '.input-group.success',
                '@keyframes neo-error-shake',
                '@keyframes neo-error-flash'
            ];

            validationFeatures.forEach(feature => {
                const exists = cssContent.includes(feature);
                this.log(`Validation feature "${feature}"`, exists);
            });

        } catch (error) {
            this.log('CSS content analysis', false, error.message);
        }
    }

    async testResponsiveDesign() {
        try {
            const cssContent = fs.readFileSync(this.cssPath, 'utf8');
            
            // Test for responsive breakpoints
            const responsiveFeatures = [
                '@media (max-width: 768px)',
                'flex-direction: column',
                'overflow-y: auto'
            ];

            responsiveFeatures.forEach(feature => {
                const exists = cssContent.includes(feature);
                this.log(`Responsive feature "${feature}"`, exists);
            });

        } catch (error) {
            this.log('Responsive design test', false, error.message);
        }
    }

    async testAccessibilityFeatures() {
        try {
            const cssContent = fs.readFileSync(this.cssPath, 'utf8');
            
            // Test for accessibility features
            const a11yFeatures = [
                '@media (prefers-reduced-motion: reduce)',
                '@media (prefers-contrast: high)',
                'outline: none',
                'cursor: pointer',
                'cursor: not-allowed'
            ];

            a11yFeatures.forEach(feature => {
                const exists = cssContent.includes(feature);
                this.log(`Accessibility feature "${feature}"`, exists);
            });

            // Test for proper contrast
            const contrastFeatures = [
                'var(--neo-black)',
                'var(--neo-white)',
                'color: var(--neo-red)',
                'border-color: var(--neo-red)'
            ];

            contrastFeatures.forEach(feature => {
                const exists = cssContent.includes(feature);
                this.log(`Contrast feature "${feature}"`, exists);
            });

        } catch (error) {
            this.log('Accessibility features test', false, error.message);
        }
    }

    async testValidationStates() {
        try {
            const cssContent = fs.readFileSync(this.cssPath, 'utf8');
            
            // Test validation state implementations
            const validationTests = [
                { name: 'Error state background', pattern: 'background: #ffeeee' },
                { name: 'Success state background', pattern: 'background: #eeffee' },
                { name: 'Error border color', pattern: 'border-color: var(--neo-red)' },
                { name: 'Success border color', pattern: 'border-color: var(--neo-green)' },
                { name: 'Error message styling', pattern: '.error-message' },
                { name: 'Shake animation', pattern: '@keyframes neo-error-shake' }
            ];

            validationTests.forEach(test => {
                const exists = cssContent.includes(test.pattern);
                this.log(`Validation: ${test.name}`, exists);
            });

        } catch (error) {
            this.log('Validation states test', false, error.message);
        }
    }

    async testAnimations() {
        try {
            const cssContent = fs.readFileSync(this.cssPath, 'utf8');
            
            // Test animation implementations
            const animationTests = [
                { name: 'Focus flash animation', pattern: 'neo-focus-flash 0.1s steps(2, end)' },
                { name: 'Label jump animation', pattern: 'neo-label-jump 0.2s var(--neo-timing-clunky)' },
                { name: 'Error shake animation', pattern: 'neo-error-shake 0.3s var(--neo-timing-clunky)' },
                { name: 'Checkbox check animation', pattern: 'neo-checkbox-check 0.1s steps(1, end)' },
                { name: 'Transform on focus', pattern: 'transform: translate(-2px, -2px)' },
                { name: 'Box shadow change', pattern: 'box-shadow: var(--neo-shadow-md)' }
            ];

            animationTests.forEach(test => {
                const exists = cssContent.includes(test.pattern);
                this.log(`Animation: ${test.name}`, exists);
            });

        } catch (error) {
            this.log('Animations test', false, error.message);
        }
    }

    printSummary() {
        console.log('\n📊 Test Summary:');
        console.log('================');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(result => result.includes('PASS')).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(result => result.includes('FAIL'))
                .forEach(result => console.log(`  - ${result}`));
        }
        
        console.log('\n✅ Test completed!');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new FormComponentTester();
    tester.runTests().catch(console.error);
}

module.exports = FormComponentTester;