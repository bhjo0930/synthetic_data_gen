const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testExportFunctionality() {
    const browser = await chromium.launch({ 
        headless: false, // Set to true for headless testing
        downloadsPath: './downloads' 
    });
    
    const context = await browser.newContext({
        acceptDownloads: true
    });
    
    const page = await context.newPage();
    
    // Listen for console messages
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
        console.log(`Console: [${msg.type()}] ${msg.text()}`);
    });
    
    // Listen for page errors
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push(error.message);
        console.log(`Page Error: ${error.message}`);
    });
    
    // Listen for downloads
    const downloads = [];
    page.on('download', download => {
        downloads.push({
            filename: download.suggestedFilename(),
            url: download.url()
        });
        console.log(`Download detected: ${download.suggestedFilename()}`);
    });
    
    try {
        console.log('🚀 Starting Export Functionality Test...\n');
        
        // Step 1: Navigate to the page
        console.log('1. Navigating to http://127.0.0.1:5050/static/search.html');
        await page.goto('http://127.0.0.1:5050/static/search.html', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Step 2: Wait for page to load completely
        console.log('2. Waiting for page to load completely...');
        await page.waitForSelector('#generateTestDataBtn', { timeout: 10000 });
        await page.waitForSelector('#exportBtn', { timeout: 10000 });
        await page.waitForSelector('#exportCsvBtn', { timeout: 10000 });
        
        // Step 3: Check if global functions are accessible
        console.log('3. Checking if global functions are accessible...');
        const globalFunctionsCheck = await page.evaluate(() => {
            return {
                exportToExcel: typeof window.exportToExcel === 'function',
                exportToCSV: typeof window.exportToCSV === 'function',
                generateTestData: typeof window.generateTestData === 'function',
                currentData: window.currentData ? window.currentData.length : 0
            };
        });
        
        console.log('Global functions check:', globalFunctionsCheck);
        
        // Step 4: Generate test data
        console.log('4. Generating test data...');
        await page.click('#generateTestDataBtn');
        
        // Wait for test data generation to complete
        await page.waitForTimeout(3000);
        
        // Verify test data was generated
        const dataCheck = await page.evaluate(() => {
            return {
                dataExists: window.currentData && window.currentData.length > 0,
                dataCount: window.currentData ? window.currentData.length : 0,
                sampleData: window.currentData ? window.currentData[0] : null
            };
        });
        
        console.log('Test data check:', dataCheck);
        
        if (!dataCheck.dataExists) {
            console.log('❌ Test data generation failed!');
            return;
        }
        
        console.log(`✅ Test data generated successfully: ${dataCheck.dataCount} personas`);
        
        // Step 5: Test Excel Export
        console.log('5. Testing Excel Export...');
        
        // Clear previous downloads
        downloads.length = 0;
        
        await page.click('#exportBtn');
        
        // Wait for download or timeout
        await page.waitForTimeout(5000);
        
        console.log(`Excel export - Downloads detected: ${downloads.length}`);
        if (downloads.length > 0) {
            console.log('✅ Excel download triggered successfully');
            downloads.forEach(download => {
                console.log(`   - File: ${download.filename}`);
            });
        } else {
            console.log('❌ Excel download was not triggered');
        }
        
        // Step 6: Test CSV Export
        console.log('6. Testing CSV Export...');
        
        // Clear previous downloads for CSV test
        downloads.length = 0;
        
        await page.click('#exportCsvBtn');
        
        // Wait for download or timeout
        await page.waitForTimeout(5000);
        
        console.log(`CSV export - Downloads detected: ${downloads.length}`);
        if (downloads.length > 0) {
            console.log('✅ CSV download triggered successfully');
            downloads.forEach(download => {
                console.log(`   - File: ${download.filename}`);
            });
        } else {
            console.log('❌ CSV download was not triggered');
        }
        
        // Step 7: Test manual function calls in console
        console.log('7. Testing manual function calls...');
        
        const manualTestResults = await page.evaluate(async () => {
            const results = {
                exportToExcel: { success: false, error: null },
                exportToCSV: { success: false, error: null }
            };
            
            try {
                // Test exportToExcel manually
                if (typeof window.exportToExcel === 'function') {
                    window.exportToExcel();
                    results.exportToExcel.success = true;
                } else {
                    results.exportToExcel.error = 'Function not found';
                }
            } catch (error) {
                results.exportToExcel.error = error.message;
            }
            
            // Wait a bit between calls
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
                // Test exportToCSV manually
                if (typeof window.exportToCSV === 'function') {
                    window.exportToCSV();
                    results.exportToCSV.success = true;
                } else {
                    results.exportToCSV.error = 'Function not found';
                }
            } catch (error) {
                results.exportToCSV.error = error.message;
            }
            
            return results;
        });
        
        console.log('Manual function test results:', manualTestResults);
        
        // Step 8: Final console and error analysis
        console.log('\n📊 Test Summary:');
        console.log('================');
        
        // Analyze console messages
        const errors = consoleMessages.filter(msg => msg.includes('[error]'));
        const warnings = consoleMessages.filter(msg => msg.includes('[warning]'));
        
        console.log(`Console Messages: ${consoleMessages.length}`);
        console.log(`Console Errors: ${errors.length}`);
        console.log(`Console Warnings: ${warnings.length}`);
        console.log(`Page Errors: ${pageErrors.length}`);
        
        if (errors.length > 0) {
            console.log('\n❌ Console Errors:');
            errors.forEach(error => console.log(`   ${error}`));
        }
        
        if (pageErrors.length > 0) {
            console.log('\n❌ Page Errors:');
            pageErrors.forEach(error => console.log(`   ${error}`));
        }
        
        // Overall assessment
        console.log('\n🎯 Overall Assessment:');
        console.log('=====================');
        
        const assessmentPoints = [
            { test: 'Page loaded successfully', passed: true },
            { test: 'Global functions accessible', passed: globalFunctionsCheck.exportToExcel && globalFunctionsCheck.exportToCSV && globalFunctionsCheck.generateTestData },
            { test: 'Test data generated', passed: dataCheck.dataExists && dataCheck.dataCount > 0 },
            { test: 'Excel export button works', passed: downloads.some(d => d.filename.includes('.xlsx') || d.filename.includes('.xls')) },
            { test: 'CSV export button works', passed: downloads.some(d => d.filename.includes('.csv')) },
            { test: 'No JavaScript errors', passed: pageErrors.length === 0 && errors.length === 0 },
            { test: 'Manual function calls work', passed: manualTestResults.exportToExcel.success && manualTestResults.exportToCSV.success }
        ];
        
        assessmentPoints.forEach(point => {
            console.log(`${point.passed ? '✅' : '❌'} ${point.test}`);
        });
        
        const passedTests = assessmentPoints.filter(p => p.passed).length;
        const totalTests = assessmentPoints.length;
        const successRate = (passedTests / totalTests * 100).toFixed(1);
        
        console.log(`\n📈 Success Rate: ${passedTests}/${totalTests} (${successRate}%)`);
        
        if (successRate >= 80) {
            console.log('🎉 Export functionality is working well!');
        } else if (successRate >= 60) {
            console.log('⚠️ Export functionality has some issues that need attention.');
        } else {
            console.log('🚨 Export functionality has significant problems.');
        }
        
    } catch (error) {
        console.error('Test execution error:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testExportFunctionality().catch(console.error);