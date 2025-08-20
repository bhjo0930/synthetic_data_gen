/**
 * Focused CSV Export Test - Testing the "replace is not a function" fix
 */

const { chromium } = require('playwright');

async function testCSVExportFix() {
    const browser = await chromium.launch({ 
        headless: false,
        devtools: true 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Track all console messages and errors
    const consoleMessages = [];
    const jsErrors = [];
    
    page.on('console', msg => {
        const message = {
            type: msg.type(),
            text: msg.text(),
            timestamp: new Date().toISOString()
        };
        consoleMessages.push(message);
        console.log(`[${message.type.toUpperCase()}] ${message.text}`);
    });
    
    page.on('pageerror', error => {
        const jsError = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        };
        jsErrors.push(jsError);
        console.error('🚨 JavaScript Error:', error.message);
    });
    
    try {
        console.log('🚀 Starting Focused CSV Export Test...');
        
        // Navigate to search page
        console.log('📍 Navigating to search page...');
        await page.goto('http://127.0.0.1:5050/static/search.html');
        await page.waitForLoadState('networkidle');
        
        // Wait for buttons to be available
        await page.waitForSelector('#generateTestDataBtn', { timeout: 10000 });
        await page.waitForSelector('#exportCsvBtn', { timeout: 5000 });
        await page.waitForSelector('#exportBtn', { timeout: 5000 });
        
        console.log('✅ Page loaded, buttons found');
        
        // Generate test data
        console.log('🔄 Generating test data...');
        await page.click('#generateTestDataBtn');
        
        // Wait for data generation to complete (check for 50+ rows)
        await page.waitForFunction(() => {
            const rows = document.querySelectorAll('tr');
            return rows.length > 50;
        }, { timeout: 30000 });
        
        const rowCount = await page.evaluate(() => document.querySelectorAll('tr').length);
        console.log(`✅ Data generated: ${rowCount} rows`);
        
        // Clear error tracking for export test
        jsErrors.length = 0;
        const preExportConsoleCount = consoleMessages.length;
        
        // Test CSV Export
        console.log('📊 Testing CSV Export...');
        
        // Set up download event listener
        const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
        
        // Click CSV export button
        await page.click('#exportCsvBtn');
        
        // Wait for download or timeout
        let csvDownloadSuccess = false;
        let csvDownloadError = null;
        
        try {
            const download = await downloadPromise;
            const downloadPath = await download.path();
            const fileName = download.suggestedFilename();
            
            console.log(`✅ CSV Download Success: ${fileName}`);
            
            // Check file content
            const fs = require('fs');
            if (fs.existsSync(downloadPath)) {
                const stats = fs.statSync(downloadPath);
                console.log(`📏 File size: ${stats.size} bytes`);
                
                if (stats.size > 0) {
                    const content = fs.readFileSync(downloadPath, 'utf8');
                    const lines = content.split('\\n');
                    console.log(`📄 CSV lines: ${lines.length}`);
                    console.log(`📝 First line: ${lines[0].substring(0, 100)}...`);
                    csvDownloadSuccess = true;
                } else {
                    csvDownloadError = 'File is empty';
                }
            } else {
                csvDownloadError = 'File not found';
            }
            
        } catch (downloadError) {
            csvDownloadError = downloadError.message;
            console.error('❌ CSV Download Failed:', downloadError.message);
        }
        
        // Wait for any async operations
        await page.waitForTimeout(2000);
        
        // Test Excel Export for comparison
        console.log('📈 Testing Excel Export for comparison...');
        
        let excelDownloadSuccess = false;
        let excelDownloadError = null;
        
        try {
            const excelDownloadPromise = page.waitForEvent('download', { timeout: 30000 });
            await page.click('#exportBtn');
            
            const excelDownload = await excelDownloadPromise;
            const excelFileName = excelDownload.suggestedFilename();
            console.log(`✅ Excel Download Success: ${excelFileName}`);
            excelDownloadSuccess = true;
            
        } catch (excelError) {
            excelDownloadError = excelError.message;
            console.error('❌ Excel Download Failed:', excelError.message);
        }
        
        // Analyze errors
        console.log('\\n🔍 ERROR ANALYSIS:');
        console.log('==================');
        
        const postExportMessages = consoleMessages.slice(preExportConsoleCount);
        const replaceErrors = jsErrors.filter(error => 
            error.message.includes('replace is not a function')
        );
        const csvErrors = jsErrors.filter(error =>
            error.message.toLowerCase().includes('csv') ||
            error.message.toLowerCase().includes('export')
        );
        
        console.log(`📊 Total console messages during export: ${postExportMessages.length}`);
        console.log(`⚠️  Total JavaScript errors during export: ${jsErrors.length}`);
        console.log(`🚨 \"replace is not a function\" errors: ${replaceErrors.length}`);
        console.log(`🚨 CSV-related errors: ${csvErrors.length}`);
        
        // Log all errors for analysis
        if (jsErrors.length > 0) {
            console.log('\\n🚨 ALL JAVASCRIPT ERRORS:');
            jsErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error.message}`);
                if (error.stack) {
                    console.log(`     Stack: ${error.stack.split('\\n')[0]}`);
                }
            });
        }
        
        // Check for success messages
        const successMessages = postExportMessages.filter(msg =>
            msg.text.toLowerCase().includes('success') ||
            msg.text.toLowerCase().includes('download') ||
            msg.text.toLowerCase().includes('export') ||
            msg.text.toLowerCase().includes('완료') // Korean for "completed"
        );
        
        if (successMessages.length > 0) {
            console.log('\\n🎉 SUCCESS MESSAGES:');
            successMessages.forEach((msg, index) => {
                console.log(`  ${index + 1}. [${msg.type}] ${msg.text}`);
            });
        }
        
        // Final test results
        console.log('\\n📋 TEST RESULTS SUMMARY:');
        console.log('========================');
        console.log(`CSV Download: ${csvDownloadSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
        if (csvDownloadError) console.log(`CSV Error: ${csvDownloadError}`);
        
        console.log(`Excel Download: ${excelDownloadSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
        if (excelDownloadError) console.log(`Excel Error: ${excelDownloadError}`);
        
        console.log(`Replace Function Errors: ${replaceErrors.length}`);
        console.log(`Total JavaScript Errors: ${jsErrors.length}`);
        
        // Determine if the fix was successful
        const fixSuccessful = (
            replaceErrors.length === 0 && 
            csvDownloadSuccess
        );
        
        if (fixSuccessful) {
            console.log('\\n🎉 SUCCESS: CSV Export fix is working correctly!');
            console.log('✅ No \"replace is not a function\" errors detected');
            console.log('✅ CSV download completed successfully');
        } else {
            console.log('\\n❌ FAILURE: Issues still exist');
            if (replaceErrors.length > 0) {
                console.log('🚨 \"replace is not a function\" errors still present');
            }
            if (!csvDownloadSuccess) {
                console.log('🚨 CSV download failed');
            }
        }
        
        return {
            success: fixSuccessful,
            csvDownload: csvDownloadSuccess,
            excelDownload: excelDownloadSuccess,
            replaceErrors: replaceErrors.length,
            totalErrors: jsErrors.length,
            consoleMessages: consoleMessages.length
        };
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        return {
            success: false,
            error: error.message,
            replaceErrors: jsErrors.filter(e => e.message.includes('replace is not a function')).length,
            totalErrors: jsErrors.length
        };
    } finally {
        await browser.close();
    }
}

// Run the test
testCSVExportFix().then(result => {
    console.log('\\n🏁 Final Test Result:', result);
    process.exit(result.success ? 0 : 1);
}).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
});