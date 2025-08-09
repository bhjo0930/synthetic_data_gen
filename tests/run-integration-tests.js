#!/usr/bin/env node

/**
 * Integration Test Runner for Neo-Brutalism Generate Page
 * Runs both HTML integration tests and JavaScript functionality tests
 */

const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green
            error: '\x1b[31m',   // Red
            warning: '\x1b[33m', // Yellow
            reset: '\x1b[0m'     // Reset
        };
        
        console.log(`${colors[type]}${message}${colors.reset}`);
    }

    async runTest(testName, testFunction) {
        this.results.total++;
        try {
            const result = await testFunction();
            if (result === true || result === undefined) {
                this.results.passed++;
                this.results.details.push({ name: testName, status: 'PASS', message: 'Test completed successfully' });
                this.log(`✓ ${testName}`, 'success');
            } else {
                this.results.failed++;
                this.results.details.push({ name: testName, status: 'FAIL', message: result || 'Test returned false' });
                this.log(`✗ ${testName}: ${result}`, 'error');
            }
        } catch (error) {
            this.results.failed++;
            this.results.details.push({ name: testName, status: 'FAIL', message: error.message });
            this.log(`✗ ${testName}: ${error.message}`, 'error');
        }
    }

    checkFileExists(filePath, description) {
        return this.runTest(`File Exists: ${description}`, () => {
            if (!fs.existsSync(filePath)) {
                return `File not found: ${filePath}`;
            }
            return true;
        });
    }

    checkFileContent(filePath, searchString, description) {
        return this.runTest(`File Content: ${description}`, () => {
            if (!fs.existsSync(filePath)) {
                return `File not found: ${filePath}`;
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            if (!content.includes(searchString)) {
                return `Content not found in ${filePath}: ${searchString}`;
            }
            return true;
        });
    }

    checkCSSIntegration() {
        return this.runTest('CSS Integration Check', () => {
            const cssPath = path.join(__dirname, '../static/css/neo-brutalism.css');
            const integrationPath = path.join(__dirname, '../static/css/integration.css');
            
            if (!fs.existsSync(cssPath)) {
                return 'Main CSS file not found';
            }
            
            if (!fs.existsSync(integrationPath)) {
                return 'Integration CSS file not found';
            }
            
            const cssContent = fs.readFileSync(cssPath, 'utf8');
            if (!cssContent.includes('@import url(\'./integration.css\')')) {
                return 'Integration CSS not imported in main CSS file';
            }
            
            return true;
        });
    }

    checkHTMLStructure() {
        return this.runTest('HTML Structure Check', () => {
            const htmlPath = path.join(__dirname, '../static/generate.html');
            
            if (!fs.existsSync(htmlPath)) {
                return 'Generate HTML file not found';
            }
            
            const content = fs.readFileSync(htmlPath, 'utf8');
            
            const requiredClasses = [
                'neo-container',
                'neo-header',
                'neo-title',
                'neo-nav',
                'neo-card',
                'neo-button',
                'neo-result-box'
            ];
            
            for (const className of requiredClasses) {
                if (!content.includes(className)) {
                    return `Missing required class: ${className}`;
                }
            }
            
            const requiredElements = [
                'id="count"',
                'id="age_range_min"',
                'id="age_range_max"',
                'id="gender"',
                'id="location"',
                'id="generateBtn"',
                'id="deleteAllBtn"',
                'id="generateResult"',
                'id="deleteResult"'
            ];
            
            for (const element of requiredElements) {
                if (!content.includes(element)) {
                    return `Missing required element: ${element}`;
                }
            }
            
            return true;
        });
    }

    checkJavaScriptFunctionality() {
        return this.runTest('JavaScript Functionality Check', () => {
            const jsPath = path.join(__dirname, '../static/generate_script.js');
            
            if (!fs.existsSync(jsPath)) {
                return 'JavaScript file not found';
            }
            
            const content = fs.readFileSync(jsPath, 'utf8');
            
            const requiredFunctions = [
                'formatPersonasDisplay',
                'showLoading',
                'showError',
                'showSuccess',
                'validateForm'
            ];
            
            for (const func of requiredFunctions) {
                if (!content.includes(func)) {
                    return `Missing required function: ${func}`;
                }
            }
            
            // Check API endpoints are preserved
            if (!content.includes('http://127.0.0.1:5050/api/personas')) {
                return 'API base URL not found';
            }
            
            if (!content.includes('/generate') || !content.includes('/delete_all')) {
                return 'API endpoints not found';
            }
            
            return true;
        });
    }

    checkBackwardCompatibility() {
        return this.runTest('Backward Compatibility Check', () => {
            const htmlPath = path.join(__dirname, '../static/generate.html');
            const jsPath = path.join(__dirname, '../static/generate_script.js');
            
            if (!fs.existsSync(htmlPath) || !fs.existsSync(jsPath)) {
                return 'Required files not found';
            }
            
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            const jsContent = fs.readFileSync(jsPath, 'utf8');
            
            // Check that original IDs are preserved
            const originalIds = [
                'count', 'age_range_min', 'age_range_max', 
                'gender', 'location', 'generateBtn', 'deleteAllBtn'
            ];
            
            for (const id of originalIds) {
                if (!htmlContent.includes(`id="${id}"`)) {
                    return `Original ID not preserved: ${id}`;
                }
                if (!jsContent.includes(`getElementById('${id}')`)) {
                    return `JavaScript reference not preserved: ${id}`;
                }
            }
            
            return true;
        });
    }

    checkAccessibilityFeatures() {
        return this.runTest('Accessibility Features Check', () => {
            const htmlPath = path.join(__dirname, '../static/generate.html');
            
            if (!fs.existsSync(htmlPath)) {
                return 'HTML file not found';
            }
            
            const content = fs.readFileSync(htmlPath, 'utf8');
            
            // Check for proper labels
            if (!content.includes('<label for=')) {
                return 'Form labels not found';
            }
            
            // Check for navigation active state
            if (!content.includes('class="active"') && !content.includes('aria-current="page"')) {
                return 'Navigation active state not found';
            }
            
            // Check for semantic HTML
            if (!content.includes('<main') || !content.includes('<header') || !content.includes('<nav')) {
                return 'Semantic HTML elements not found';
            }
            
            return true;
        });
    }

    checkResponsiveDesign() {
        return this.runTest('Responsive Design Check', () => {
            const cssPath = path.join(__dirname, '../static/css/integration.css');
            
            if (!fs.existsSync(cssPath)) {
                return 'Integration CSS file not found';
            }
            
            const content = fs.readFileSync(cssPath, 'utf8');
            
            // Check for media queries
            if (!content.includes('@media (max-width: 768px)')) {
                return 'Mobile media queries not found';
            }
            
            if (!content.includes('@media (max-width: 480px)')) {
                return 'Small mobile media queries not found';
            }
            
            // Check for responsive grid
            if (!content.includes('grid-template-columns: 1fr')) {
                return 'Responsive grid not found';
            }
            
            return true;
        });
    }

    async runAllTests() {
        this.log('🚀 Starting Neo-Brutalism Integration Tests', 'info');
        this.log('=' .repeat(50), 'info');

        // File existence tests
        await this.checkFileExists(
            path.join(__dirname, '../static/generate.html'),
            'Generate HTML file'
        );
        
        await this.checkFileExists(
            path.join(__dirname, '../static/generate_script.js'),
            'Generate JavaScript file'
        );
        
        await this.checkFileExists(
            path.join(__dirname, '../static/css/neo-brutalism.css'),
            'Neo-Brutalism CSS file'
        );
        
        await this.checkFileExists(
            path.join(__dirname, '../static/css/integration.css'),
            'Integration CSS file'
        );

        // Content and structure tests
        await this.checkCSSIntegration();
        await this.checkHTMLStructure();
        await this.checkJavaScriptFunctionality();
        await this.checkBackwardCompatibility();
        await this.checkAccessibilityFeatures();
        await this.checkResponsiveDesign();

        // Component-specific tests
        await this.checkFileContent(
            path.join(__dirname, '../static/css/components/buttons.css'),
            '.neo-button',
            'Button component styles'
        );
        
        await this.checkFileContent(
            path.join(__dirname, '../static/css/components/forms.css'),
            'input[type="text"]',
            'Form component styles'
        );
        
        await this.checkFileContent(
            path.join(__dirname, '../static/css/components/navigation.css'),
            'nav a',
            'Navigation component styles'
        );

        // Display results
        this.displayResults();
    }

    displayResults() {
        this.log('\n' + '=' .repeat(50), 'info');
        this.log('📊 Test Results Summary', 'info');
        this.log('=' .repeat(50), 'info');
        
        this.log(`Total Tests: ${this.results.total}`, 'info');
        this.log(`Passed: ${this.results.passed}`, 'success');
        this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
        
        if (this.results.failed > 0) {
            this.log('\n❌ Failed Tests:', 'error');
            this.results.details
                .filter(test => test.status === 'FAIL')
                .forEach(test => {
                    this.log(`  • ${test.name}: ${test.message}`, 'error');
                });
        }
        
        const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        this.log(`\n🎯 Success Rate: ${successRate}%`, successRate === '100.0' ? 'success' : 'warning');
        
        if (this.results.failed === 0) {
            this.log('\n🎉 All integration tests passed! Neo-Brutalism integration is successful.', 'success');
        } else {
            this.log('\n⚠️  Some tests failed. Please review and fix the issues above.', 'warning');
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const runner = new TestRunner();
    runner.runAllTests().catch(error => {
        console.error('Test runner error:', error);
        process.exit(1);
    });
}

module.exports = TestRunner;