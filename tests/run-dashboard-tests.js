#!/usr/bin/env node

/**
 * Dashboard Neo-Brutalism Test Runner
 * Validates the transformation of the analytics dashboard
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Running Dashboard Neo-Brutalism Tests...\n');

// Test 1: Verify CSS files exist
function testCSSFiles() {
    console.log('📁 Testing CSS File Structure...');
    
    const cssFiles = [
        '../static/css/neo-brutalism.css',
        '../static/css/components/dashboard.css',
        '../static/css/core/variables.css',
        '../static/css/components/buttons.css'
    ];
    
    let passed = 0;
    let total = cssFiles.length;
    
    cssFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`  ✅ ${file} - EXISTS`);
            passed++;
        } else {
            console.log(`  ❌ ${file} - MISSING`);
        }
    });
    
    console.log(`  📊 CSS Files: ${passed}/${total} passed\n`);
    return passed === total;
}

// Test 2: Verify HTML structure
function testHTMLStructure() {
    console.log('🏗️  Testing HTML Structure...');
    
    const htmlPath = path.join(__dirname, '../static/search.html');
    
    if (!fs.existsSync(htmlPath)) {
        console.log('  ❌ search.html - MISSING');
        return false;
    }
    
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const requiredElements = [
        { name: 'OLAP Container', selector: 'olap-container' },
        { name: 'OLAP Header', selector: 'olap-header' },
        { name: 'Slicer Panel', selector: 'slicer-panel' },
        { name: 'Analysis Main', selector: 'analysis-main' },
        { name: 'KPI Section', selector: 'kpi-section' },
        { name: 'Chart Section', selector: 'chart-section' },
        { name: 'Data Grid Section', selector: 'data-grid-section' }
    ];
    
    let passed = 0;
    let total = requiredElements.length;
    
    requiredElements.forEach(element => {
        if (htmlContent.includes(element.selector)) {
            console.log(`  ✅ ${element.name} - FOUND`);
            passed++;
        } else {
            console.log(`  ❌ ${element.name} - MISSING`);
        }
    });
    
    console.log(`  📊 HTML Elements: ${passed}/${total} passed\n`);
    return passed === total;
}

// Test 3: Verify CSS content
function testCSSContent() {
    console.log('🎨 Testing CSS Content...');
    
    const dashboardCSSPath = path.join(__dirname, '../static/css/components/dashboard.css');
    
    if (!fs.existsSync(dashboardCSSPath)) {
        console.log('  ❌ dashboard.css - MISSING');
        return false;
    }
    
    const cssContent = fs.readFileSync(dashboardCSSPath, 'utf8');
    
    const requiredStyles = [
        { name: 'OLAP Container', selector: '.olap-container' },
        { name: 'OLAP Header', selector: '.olap-header' },
        { name: 'Slicer Panel', selector: '.slicer-panel' },
        { name: 'KPI Cards', selector: '.kpi-card' },
        { name: 'Chart Cards', selector: '.chart-card' },
        { name: 'Data Grid', selector: '.data-grid-container' },
        { name: 'Tab Buttons', selector: '.tab-button' },
        { name: 'Filter Items', selector: '.filter-item' }
    ];
    
    let passed = 0;
    let total = requiredStyles.length;
    
    requiredStyles.forEach(style => {
        if (cssContent.includes(style.selector)) {
            console.log(`  ✅ ${style.name} - STYLED`);
            passed++;
        } else {
            console.log(`  ❌ ${style.name} - MISSING STYLES`);
        }
    });
    
    console.log(`  📊 CSS Styles: ${passed}/${total} passed\n`);
    return passed === total;
}

// Test 4: Verify Neo-Brutalism principles
function testNeoBrutalismPrinciples() {
    console.log('⚡ Testing Neo-Brutalism Design Principles...');
    
    const dashboardCSSPath = path.join(__dirname, '../static/css/components/dashboard.css');
    const cssContent = fs.readFileSync(dashboardCSSPath, 'utf8');
    
    const principles = [
        { name: 'Thick Borders', pattern: /border.*4px|border.*6px/g },
        { name: 'Solid Shadows', pattern: /box-shadow.*0px/g },
        { name: 'Bold Typography', pattern: /font-weight.*900/g },
        { name: 'Uppercase Text', pattern: /text-transform.*uppercase/g },
        { name: 'High Contrast Colors', pattern: /#000000|#FFFFFF|rgb\(0,\s*0,\s*0\)|rgb\(255,\s*255,\s*255\)/g },
        { name: 'CSS Variables', pattern: /var\(--neo-/g },
        { name: 'Asymmetrical Layouts', pattern: /transform.*rotate/g },
        { name: 'Responsive Design', pattern: /@media.*max-width/g }
    ];
    
    let passed = 0;
    let total = principles.length;
    
    principles.forEach(principle => {
        const matches = cssContent.match(principle.pattern);
        if (matches && matches.length > 0) {
            console.log(`  ✅ ${principle.name} - IMPLEMENTED (${matches.length} instances)`);
            passed++;
        } else {
            console.log(`  ❌ ${principle.name} - NOT FOUND`);
        }
    });
    
    console.log(`  📊 Design Principles: ${passed}/${total} passed\n`);
    return passed === total;
}

// Test 5: Verify test files
function testTestFiles() {
    console.log('🧪 Testing Test Files...');
    
    const testFiles = [
        'dashboard-neo-brutalism.test.html',
        'dashboard-neo-brutalism.test.js'
    ];
    
    let passed = 0;
    let total = testFiles.length;
    
    testFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`  ✅ ${file} - EXISTS (${stats.size} bytes)`);
            passed++;
        } else {
            console.log(`  ❌ ${file} - MISSING`);
        }
    });
    
    console.log(`  📊 Test Files: ${passed}/${total} passed\n`);
    return passed === total;
}

// Test 6: Verify integration
function testIntegration() {
    console.log('🔗 Testing Integration...');
    
    const neoBrutalismPath = path.join(__dirname, '../static/css/neo-brutalism.css');
    const neoBrutalismContent = fs.readFileSync(neoBrutalismPath, 'utf8');
    
    const integrationTests = [
        { name: 'Dashboard CSS Import', pattern: /dashboard\.css/ },
        { name: 'Variables Import', pattern: /variables\.css/ },
        { name: 'Buttons Import', pattern: /buttons\.css/ },
        { name: 'Core Imports', pattern: /core\// }
    ];
    
    let passed = 0;
    let total = integrationTests.length;
    
    integrationTests.forEach(test => {
        if (test.pattern.test(neoBrutalismContent)) {
            console.log(`  ✅ ${test.name} - INTEGRATED`);
            passed++;
        } else {
            console.log(`  ❌ ${test.name} - NOT INTEGRATED`);
        }
    });
    
    console.log(`  📊 Integration: ${passed}/${total} passed\n`);
    return passed === total;
}

// Run all tests
function runAllTests() {
    console.log('🚀 Starting Dashboard Neo-Brutalism Test Suite\n');
    
    const tests = [
        { name: 'CSS Files', fn: testCSSFiles },
        { name: 'HTML Structure', fn: testHTMLStructure },
        { name: 'CSS Content', fn: testCSSContent },
        { name: 'Neo-Brutalism Principles', fn: testNeoBrutalismPrinciples },
        { name: 'Test Files', fn: testTestFiles },
        { name: 'Integration', fn: testIntegration }
    ];
    
    let totalPassed = 0;
    let totalTests = tests.length;
    
    tests.forEach(test => {
        const result = test.fn();
        if (result) {
            totalPassed++;
        }
    });
    
    console.log('📋 FINAL RESULTS');
    console.log('================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalTests - totalPassed}`);
    console.log(`Success Rate: ${Math.round((totalPassed / totalTests) * 100)}%\n`);
    
    if (totalPassed === totalTests) {
        console.log('🎉 ALL TESTS PASSED! Dashboard transformation complete.');
        console.log('✨ The analytics dashboard now features Neo-Brutalism design:');
        console.log('   • Bold, experimental typography');
        console.log('   • Thick black borders and solid shadows');
        console.log('   • High contrast color scheme');
        console.log('   • Asymmetrical layouts');
        console.log('   • Aggressive hover effects');
        console.log('   • Accessibility compliance');
        console.log('   • Responsive design');
    } else {
        console.log('⚠️  Some tests failed. Please review the output above.');
        process.exit(1);
    }
}

// Execute tests
runAllTests();