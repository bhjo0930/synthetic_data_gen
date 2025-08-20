const { chromium } = require('playwright');

async function debugScriptLoading() {
    const browser = await chromium.launch({ 
        headless: false
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Listen for all network requests
    page.on('request', request => {
        console.log(`→ Request: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
        const status = response.status();
        const url = response.url();
        console.log(`← Response: ${status} ${url}`);
        if (status >= 400) {
            console.log(`❌ Failed to load: ${url}`);
        }
    });
    
    // Listen for console messages
    page.on('console', msg => {
        console.log(`Console [${msg.type()}]: ${msg.text()}`);
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
        console.log(`Page Error: ${error.message}`);
    });
    
    try {
        console.log('🔍 Debugging script loading...\n');
        
        await page.goto('http://127.0.0.1:5050/static/search.html', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Wait for page to load
        await page.waitForTimeout(5000);
        
        // Check what scripts are loaded
        const scripts = await page.evaluate(() => {
            const scriptTags = Array.from(document.querySelectorAll('script'));
            return scriptTags.map(script => ({
                src: script.src,
                hasContent: script.innerHTML.length > 0,
                type: script.type || 'text/javascript'
            }));
        });
        
        console.log('\n📜 Loaded scripts:');
        scripts.forEach((script, index) => {
            console.log(`${index + 1}. ${script.src || 'Inline script'} (${script.hasContent ? 'Has content' : 'Empty'}) - Type: ${script.type}`);
        });
        
        // Check if functions exist
        const functionCheck = await page.evaluate(() => {
            return {
                exportToExcel: typeof window.exportToExcel,
                exportToCSV: typeof window.exportToCSV,
                generateTestData: typeof window.generateTestData,
                XLSX: typeof XLSX,
                currentData: typeof window.currentData,
                filteredData: typeof window.filteredData
            };
        });
        
        console.log('\n🔧 Function availability:');
        Object.entries(functionCheck).forEach(([key, type]) => {
            console.log(`${type === 'function' || type === 'object' ? '✅' : '❌'} ${key}: ${type}`);
        });
        
        // Try to execute the functions manually and see what errors occur
        console.log('\n🧪 Testing function execution...');
        
        const executionTest = await page.evaluate(() => {
            const results = {};
            
            try {
                // Test if we can call generateTestData
                if (typeof window.generateTestData === 'function') {
                    results.generateTestData = 'Available';
                } else {
                    results.generateTestData = 'Not available';
                }
            } catch (error) {
                results.generateTestData = `Error: ${error.message}`;
            }
            
            try {
                // Test if we can call exportToExcel
                if (typeof window.exportToExcel === 'function') {
                    results.exportToExcel = 'Available';
                } else {
                    results.exportToExcel = 'Not available';
                }
            } catch (error) {
                results.exportToExcel = `Error: ${error.message}`;
            }
            
            try {
                // Test if we can call exportToCSV
                if (typeof window.exportToCSV === 'function') {
                    results.exportToCSV = 'Available';
                } else {
                    results.exportToCSV = 'Not available';
                }
            } catch (error) {
                results.exportToCSV = `Error: ${error.message}`;
            }
            
            return results;
        });
        
        console.log('Function execution test results:');
        Object.entries(executionTest).forEach(([key, result]) => {
            console.log(`${result === 'Available' ? '✅' : '❌'} ${key}: ${result}`);
        });
        
        // Check for any timing issues - wait a bit more and check again
        console.log('\n⏰ Waiting 5 more seconds and checking again...');
        await page.waitForTimeout(5000);
        
        const laterCheck = await page.evaluate(() => {
            return {
                exportToExcel: typeof window.exportToExcel,
                exportToCSV: typeof window.exportToCSV,
                generateTestData: typeof window.generateTestData
            };
        });
        
        console.log('Functions after waiting:');
        Object.entries(laterCheck).forEach(([key, type]) => {
            console.log(`${type === 'function' ? '✅' : '❌'} ${key}: ${type}`);
        });
        
    } catch (error) {
        console.error('Debug execution error:', error);
    } finally {
        await browser.close();
    }
}

debugScriptLoading().catch(console.error);