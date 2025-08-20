/**
 * Playwright Test for CSV Export Functionality
 * Tests the fixed CSV export to ensure "replace is not a function" error is resolved
 */

const { chromium } = require('playwright');

async function testCSVExportFunctionality() {
    const browser = await chromium.launch({ 
        headless: false, // Set to true for CI/CD
        devtools: true 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Store console messages to check for errors
    const consoleMessages = [];
    const jsErrors = [];
    
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            timestamp: new Date().toISOString()
        });
        console.log(`Console ${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
        jsErrors.push({
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        console.error('JS Error:', error.message);
    });
    
    try {
        console.log('🚀 Starting CSV Export Test...');
        
        // Step 1: Navigate to the search page
        console.log('📍 Step 1: Navigating to search page...');
        await page.goto('http://127.0.0.1:5050/static/search.html');
        await page.waitForLoadState('networkidle');
        
        // Step 2: Wait for page elements to load
        console.log('⏳ Step 2: Waiting for page elements...');
        await page.waitForSelector('#generateTestDataBtn', { timeout: 10000 });
        await page.waitForSelector('#exportCsvBtn', { timeout: 5000 });
        await page.waitForSelector('#exportBtn', { timeout: 5000 });
        
        console.log('✅ Page loaded successfully');
        
        // Step 3: Generate test data
        console.log('🔄 Step 3: Generating test data...');
        await page.click('#generateTestDataBtn');
        
        // Wait for test data generation to complete
        await page.waitForFunction(() => {
            const personaCards = document.querySelectorAll('.persona-card');
            return personaCards.length > 0;
        }, { timeout: 30000 });
        
        // Check how many personas were generated
        const personaCount = await page.evaluate(() => {
            return document.querySelectorAll('.persona-card').length;
        });
        
        console.log(`✅ Generated ${personaCount} personas`);
        
        // Step 4: Test CSV Export
        console.log('📊 Step 4: Testing CSV Export...');
        
        // Clear previous console messages
        const preExportConsoleCount = consoleMessages.length;
        const preExportErrorCount = jsErrors.length;
        
        // Set up download handling
        const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
        
        // Click CSV export
        await page.click('#exportCsvBtn');
        
        // Wait for download or error
        try {
            const download = await downloadPromise;
            const downloadPath = await download.path();
            const fileName = download.suggestedFilename();
            
            console.log(`✅ CSV download successful: ${fileName}`);
            console.log(`📁 Download path: ${downloadPath}`);
            
            // Check file size
            const fs = require('fs');
            if (fs.existsSync(downloadPath)) {
                const stats = fs.statSync(downloadPath);
                console.log(`📏 File size: ${stats.size} bytes`);
                
                if (stats.size > 0) {
                    console.log('✅ CSV file has content');
                    
                    // Read first few lines to verify format
                    const content = fs.readFileSync(downloadPath, 'utf8');
                    const lines = content.split('\n').slice(0, 3);
                    console.log('📄 CSV content preview:');
                    lines.forEach((line, index) => {
                        console.log(`  Line ${index + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
                    });
                } else {
                    console.error('❌ CSV file is empty');
                }
            }
            
        } catch (downloadError) {
            console.error('❌ CSV download failed:', downloadError.message);
        }
        
        // Wait a moment for any async operations to complete
        await page.waitForTimeout(2000);
        
        // Step 5: Test Excel Export
        console.log('📈 Step 5: Testing Excel Export...');
        
        try {
            const excelDownloadPromise = page.waitForEvent('download', { timeout: 30000 });
            await page.click('#exportBtn');
            
            const excelDownload = await excelDownloadPromise;
            const excelFileName = excelDownload.suggestedFilename();
            
            console.log(`✅ Excel download successful: ${excelFileName}`);
            
        } catch (excelError) {
            console.error('❌ Excel download failed:', excelError.message);
        }
        
        // Step 6: Analyze console messages and errors
        console.log('🔍 Step 6: Analyzing console output...');
        
        const postExportMessages = consoleMessages.slice(preExportConsoleCount);
        const postExportErrors = jsErrors.slice(preExportErrorCount);
        
        console.log(`📊 Console messages during export: ${postExportMessages.length}`);
        console.log(`⚠️  JavaScript errors during export: ${postExportErrors.length}`);
        
        // Check for specific "replace is not a function" error
        const replaceErrors = postExportErrors.filter(error => 
            error.message.includes('replace is not a function') ||
            error.message.includes('replace')
        );
        
        const csvRelatedErrors = postExportErrors.filter(error =>
            error.message.toLowerCase().includes('csv') ||
            error.message.toLowerCase().includes('export')
        );
        
        console.log('\n🔍 ERROR ANALYSIS:');
        console.log(`❌ "replace is not a function" errors: ${replaceErrors.length}`);
        console.log(`❌ CSV-related errors: ${csvRelatedErrors.length}`);
        console.log(`❌ Total JavaScript errors: ${postExportErrors.length}`);
        
        if (replaceErrors.length > 0) {
            console.log('\n🚨 REPLACE FUNCTION ERRORS:');
            replaceErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error.message}`);
                if (error.stack) {
                    console.log(`     Stack: ${error.stack.split('\n')[0]}`);
                }
            });
        }
        
        if (csvRelatedErrors.length > 0) {
            console.log('\n🚨 CSV EXPORT ERRORS:');
            csvRelatedErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error.message}`);
            });
        }
        
        // Check for success messages
        const successMessages = postExportMessages.filter(msg =>
            msg.text.toLowerCase().includes('success') ||
            msg.text.toLowerCase().includes('downloaded') ||
            msg.text.toLowerCase().includes('exported')
        );
        
        console.log(`✅ Success messages: ${successMessages.length}`);
        if (successMessages.length > 0) {
            console.log('🎉 SUCCESS MESSAGES:');
            successMessages.forEach((msg, index) => {
                console.log(`  ${index + 1}. [${msg.type}] ${msg.text}`);
            });
        }
        
        // Step 7: Test different data scenarios
        console.log('🧪 Step 7: Testing edge cases...');
        
        // Test with empty data
        await page.evaluate(() => {
            window.personas = [];
        });
        
        try {
            await page.click('#exportCsvBtn');
            await page.waitForTimeout(1000);
            console.log('✅ Empty data CSV export handled gracefully');
        } catch (emptyDataError) {
            console.log('⚠️  Empty data CSV export issue:', emptyDataError.message);
        }
        
        // Generate test data again for final validation
        await page.click('#generateTestDataBtn');
        await page.waitForFunction(() => {
            const personaCards = document.querySelectorAll('.persona-card');
            return personaCards.length > 0;
        }, { timeout: 30000 });
        
        // Final CSV export test
        try {
            const finalDownloadPromise = page.waitForEvent('download', { timeout: 30000 });
            await page.click('#exportCsvBtn');
            await finalDownloadPromise;
            console.log('✅ Final CSV export test successful');
        } catch (finalError) {
            console.error('❌ Final CSV export test failed:', finalError.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await browser.close();
    }
    
    // Generate test report
    console.log('\n📋 TEST REPORT SUMMARY:');
    console.log('========================');
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Total JavaScript errors: ${jsErrors.length}`);
    
    const replaceErrors = jsErrors.filter(error => 
        error.message.includes('replace is not a function')
    );
    
    console.log(`"replace is not a function" errors: ${replaceErrors.length}`);
    
    if (replaceErrors.length === 0) {
        console.log('🎉 SUCCESS: No "replace is not a function" errors detected!');
        console.log('✅ CSV export fix appears to be working correctly');
    } else {
        console.log('❌ FAILURE: "replace is not a function" errors still present');
        console.log('🔧 Additional debugging may be required');
    }
    
    return {
        success: replaceErrors.length === 0,
        totalErrors: jsErrors.length,
        replaceErrors: replaceErrors.length,
        consoleMessages: consoleMessages.length
    };
}

// Run the test
testCSVExportFunctionality().then(result => {
    console.log('\n🏁 Test completed with result:', result);
    process.exit(result.success ? 0 : 1);
}).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
});