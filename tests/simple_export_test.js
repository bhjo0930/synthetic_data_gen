const { chromium } = require('playwright');

async function testExportFunctionality() {
    console.log('🔬 Testing Export Functionality - Simplified Version');
    console.log('=' .repeat(60));
    
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    
    const logs = { console: [], errors: [], downloads: [] };
    
    page.on('console', msg => {
        logs.console.push({ type: msg.type(), text: msg.text() });
        console.log(`📄 [${msg.type()}] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
        logs.errors.push({ message: error.message, stack: error.stack });
        console.log(`❌ ERROR: ${error.message}`);
    });
    
    page.on('download', download => {
        logs.downloads.push({ filename: download.suggestedFilename() });
        console.log(`📥 DOWNLOAD: ${download.suggestedFilename()}`);
    });
    
    try {
        await page.goto('http://127.0.0.1:5050/static/search.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        console.log('🔍 Checking buttons...');
        const exportBtn = await page.locator('#exportBtn');
        const csvBtn = await page.locator('#exportCsvBtn');
        
        const exportExists = await exportBtn.count() > 0;
        const csvExists = await csvBtn.count() > 0;
        
        console.log(`Export Excel Button: ${exportExists ? '✅' : '❌'}`);
        console.log(`Export CSV Button: ${csvExists ? '✅' : '❌'}`);
        
        console.log('🧪 Checking JavaScript environment...');
        const jsCheck = await page.evaluate(() => {
            return {
                xlsxLoaded: typeof XLSX !== 'undefined',
                generateTestDataExists: typeof generateTestData === 'function',
                exportToExcelExists: typeof exportToExcel === 'function',
                exportToCSVExists: typeof exportToCSV === 'function'
            };
        });
        
        console.log(`XLSX Library: ${jsCheck.xlsxLoaded ? '✅' : '❌'}`);
        console.log(`generateTestData: ${jsCheck.generateTestDataExists ? '✅' : '❌'}`);
        console.log(`exportToExcel: ${jsCheck.exportToExcelExists ? '✅' : '❌'}`);
        console.log(`exportToCSV: ${jsCheck.exportToCSVExists ? '✅' : '❌'}`);
        
        console.log('🎲 Generating test data...');
        if (jsCheck.generateTestDataExists) {
            await page.evaluate(() => generateTestData(5));
        } else {
            await page.evaluate(() => {
                window.currentData = [
                    { name: 'Test 1', age: 25, gender: '남성', location: '서울', occupation: '개발자', education: '대학교', income_bracket: '40-60%', marital_status: '미혼', interests: ['코딩'], values: ['성장'], lifestyle: ['활동적'] },
                    { name: 'Test 2', age: 30, gender: '여성', location: '부산', occupation: '디자이너', education: '대학교', income_bracket: '40-60%', marital_status: '기혼', interests: ['디자인'], values: ['창의성'], lifestyle: ['여유로운'] }
                ];
                window.filteredData = [...window.currentData];
            });
        }
        
        console.log('📤 Testing Export Excel...');
        if (exportExists) {
            await exportBtn.click();
            await page.waitForTimeout(3000);
        }
        
        console.log('📄 Testing Export CSV...');
        if (csvExists) {
            await csvBtn.click();
            await page.waitForTimeout(3000);
        }
        
        console.log('\n📊 RESULTS:');
        console.log(`Total errors: ${logs.errors.length}`);
        console.log(`Total downloads: ${logs.downloads.length}`);
        
        if (logs.errors.length > 0) {
            console.log('Errors found:');
            logs.errors.forEach(err => console.log(`  - ${err.message}`));
        }
        
        if (logs.downloads.length > 0) {
            console.log('Downloads triggered:');
            logs.downloads.forEach(dl => console.log(`  - ${dl.filename}`));
        }
        
        const status = exportExists && csvExists && jsCheck.xlsxLoaded && logs.errors.length === 0 ? 'WORKING' : 'ISSUES FOUND';
        console.log(`\n🎯 STATUS: ${status}`);
        
    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testExportFunctionality().catch(console.error);