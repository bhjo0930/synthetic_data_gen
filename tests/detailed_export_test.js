const { chromium } = require('playwright');

async function detailedExportTest() {
    console.log('🔬 Starting Detailed Export Functionality Investigation');
    console.log('=' .repeat(70));
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000  // Slower for better observation
    });
    
    const context = await browser.newContext({
        acceptDownloads: true
    });
    
    const page = await context.newPage();
    
    // Capture detailed console logs and errors
    const logs = {
        console: [],
        errors: [],
        network: [],
        downloads: []
    };
    
    page.on('console', msg => {
        logs.console.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location(),
            timestamp: new Date().toISOString()
        });
        console.log(`📄 [${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
        logs.errors.push({
            message: error.message,
            stack: error.stack,
            name: error.name,
            timestamp: new Date().toISOString()
        });
        console.log(`💥 JS ERROR: ${error.message}`);
    });
    
    page.on('request', request => {
        logs.network.push({
            url: request.url(),
            method: request.method(),
            resourceType: request.resourceType(),
            timestamp: new Date().toISOString()
        });
    });
    
    page.on('download', download => {
        logs.downloads.push({
            filename: download.suggestedFilename(),
            url: download.url(),
            timestamp: new Date().toISOString()
        });
        console.log(`📥 DOWNLOAD: ${download.suggestedFilename()}`);
    });
    
    try {
        console.log('🌐 Loading search.html page...');
        await page.goto('http://127.0.0.1:5050/static/search.html', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for page to fully load...');
        await page.waitForTimeout(3000);
        
        // Check for missing resources
        console.log('\n🔍 Analyzing page resources...');
        const failedRequests = logs.network.filter(req => 
            req.url.includes('404') || req.url.includes('error'));
        
        if (failedRequests.length > 0) {
            console.log('❌ Failed resource requests found:');
            failedRequests.forEach(req => {
                console.log(`   - ${req.method} ${req.url}`);
            });
        }
        
        // Detailed button analysis
        console.log('\n🔘 Detailed button analysis...');
        
        const exportExcelBtn = await page.locator('#exportBtn');
        const exportCsvBtn = await page.locator('#exportCsvBtn');
        
        const exportBtnDetails = {
            exists: await exportExcelBtn.count() > 0,
            visible: false,
            enabled: false,
            text: '',
            classList: '',
            style: ''
        };
        
        const csvBtnDetails = {
            exists: await exportCsvBtn.count() > 0,
            visible: false,
            enabled: false,
            text: '',
            classList: '',
            style: ''
        };
        
        if (exportBtnDetails.exists) {
            exportBtnDetails.visible = await exportExcelBtn.isVisible();
            exportBtnDetails.enabled = await exportExcelBtn.isEnabled();
            exportBtnDetails.text = await exportExcelBtn.textContent();
            exportBtnDetails.classList = await exportExcelBtn.getAttribute('class') || '';
            exportBtnDetails.style = await exportExcelBtn.getAttribute('style') || '';
        }
        
        if (csvBtnDetails.exists) {
            csvBtnDetails.visible = await exportCsvBtn.isVisible();
            csvBtnDetails.enabled = await exportCsvBtn.isEnabled();
            csvBtnDetails.text = await exportCsvBtn.textContent();
            csvBtnDetails.classList = await exportCsvBtn.getAttribute('class') || '';
            csvBtnDetails.style = await exportCsvBtn.getAttribute('style') || '';
        }
        
        console.log('Export Excel Button Details:');
        console.log(`  - Exists: ${exportBtnDetails.exists}`);
        console.log(`  - Visible: ${exportBtnDetails.visible}`);
        console.log(`  - Enabled: ${exportBtnDetails.enabled}`);
        console.log(`  - Text: "${exportBtnDetails.text}"`);
        console.log(`  - Classes: "${exportBtnDetails.classList}"`);
        
        console.log('Export CSV Button Details:');
        console.log(`  - Exists: ${csvBtnDetails.exists}`);
        console.log(`  - Visible: ${csvBtnDetails.visible}`);
        console.log(`  - Enabled: ${csvBtnDetails.enabled}`);
        console.log(`  - Text: "${csvBtnDetails.text}"`);
        console.log(`  - Classes: "${csvBtnDetails.classList}"`);
        
        // Check JavaScript environment
        console.log('\n🧪 Checking JavaScript environment...');
        
        const jsEnvironment = await page.evaluate(() => {
            return {
                jQueryLoaded: typeof jQuery !== 'undefined',
                xlsxLoaded: typeof XLSX !== 'undefined',
                generateTestDataExists: typeof generateTestData === 'function',
                currentDataExists: typeof currentData !== 'undefined',
                filteredDataExists: typeof filteredData !== 'undefined',
                exportToExcelExists: typeof exportToExcel === 'function',
                exportToCSVExists: typeof exportToCSV === 'function',
                domContentLoaded: document.readyState === 'complete',
                exportBtnElement: !!document.getElementById('exportBtn'),
                csvBtnElement: !!document.getElementById('exportCsvBtn')
            };
        });\n        \n        console.log('JavaScript Environment:');\n        Object.entries(jsEnvironment).forEach(([key, value]) => {\n            const status = value ? '✅' : '❌';\n            console.log(`  ${status} ${key}: ${value}`);\n        });\n        \n        // Generate test data first\n        console.log('\\n🎲 Generating test data...');\n        \n        if (jsEnvironment.generateTestDataExists) {\n            await page.evaluate(() => {\n                try {\n                    generateTestData(10); // Generate 10 test records\n                    console.log('Test data generated successfully');\n                } catch (error) {\n                    console.error('Error generating test data:', error);\n                }\n            });\n            await page.waitForTimeout(2000);\n        } else {\n            console.log('❌ generateTestData function not available, using manual data setup');\n            \n            // Manually inject test data\n            await page.evaluate(() => {\n                window.currentData = [\n                    {\n                        name: 'Test Person 1',\n                        age: 25,\n                        gender: '남성',\n                        location: '서울',\n                        occupation: '개발자',\n                        education: '대학교',\n                        income_bracket: '40-60%',\n                        marital_status: '미혼',\n                        interests: ['독서', '코딩'],\n                        values: ['성장', '혁신'],\n                        lifestyle: ['활동적']\n                    },\n                    {\n                        name: 'Test Person 2',\n                        age: 30,\n                        gender: '여성',\n                        location: '부산',\n                        occupation: '디자이너',\n                        education: '대학교',\n                        income_bracket: '40-60%',\n                        marital_status: '기혼',\n                        interests: ['디자인', '여행'],\n                        values: ['창의성', '자유'],\n                        lifestyle: ['여유로운']\n                    }\n                ];\n                window.filteredData = [...window.currentData];\n                console.log('Manual test data injected:', window.currentData.length, 'records');\n            });\n        }\n        \n        // Check data after generation\n        const dataStatus = await page.evaluate(() => {\n            return {\n                currentDataLength: window.currentData ? window.currentData.length : 0,\n                filteredDataLength: window.filteredData ? window.filteredData.length : 0,\n                resultCountElement: document.getElementById('resultCount')?.textContent || 'N/A'\n            };\n        });\n        \n        console.log(`\\n📊 Data Status After Generation:`);\n        console.log(`  - currentData length: ${dataStatus.currentDataLength}`);\n        console.log(`  - filteredData length: ${dataStatus.filteredDataLength}`);\n        console.log(`  - Result count display: ${dataStatus.resultCountElement}`);\n        \n        // Test Export Excel functionality\n        console.log('\\n📤 Testing Export Excel functionality...');\n        \n        if (exportBtnDetails.exists && exportBtnDetails.visible && exportBtnDetails.enabled) {\n            console.log('  Clicking Export Excel button...');\n            \n            const initialDownloadCount = logs.downloads.length;\n            const initialErrorCount = logs.errors.length;\n            \n            // Check for XLSX library before clicking\n            const xlsxCheck = await page.evaluate(() => {\n                return {\n                    xlsxExists: typeof XLSX !== 'undefined',\n                    xlsxUtils: typeof XLSX?.utils !== 'undefined',\n                    xlsxWriteFile: typeof XLSX?.writeFile === 'function'\n                };\n            });\n            \n            console.log('  XLSX Library Check:', xlsxCheck);\n            \n            await exportExcelBtn.click();\n            await page.waitForTimeout(5000); // Wait longer for potential download\n            \n            const newDownloads = logs.downloads.length - initialDownloadCount;\n            const newErrors = logs.errors.length - initialErrorCount;\n            \n            console.log(`  📈 Results:`);\n            console.log(`    - New downloads: ${newDownloads}`);\n            console.log(`    - New errors: ${newErrors}`);\n            \n            if (newDownloads > 0) {\n                console.log(`    ✅ Download triggered: ${logs.downloads[logs.downloads.length - 1].filename}`);\n            } else {\n                console.log(`    ⚠️  No download triggered`);\n            }\n            \n            if (newErrors > 0) {\n                console.log(`    ❌ New errors occurred:`);\n                logs.errors.slice(-newErrors).forEach(error => {\n                    console.log(`      - ${error.message}`);\n                });\n            }\n        } else {\n            console.log('  ❌ Cannot test Excel export - button not available or not clickable');\n        }\n        \n        // Test Export CSV functionality\n        console.log('\\n📄 Testing Export CSV functionality...');\n        \n        if (csvBtnDetails.exists && csvBtnDetails.visible && csvBtnDetails.enabled) {\n            console.log('  Clicking Export CSV button...');\n            \n            const initialDownloadCount = logs.downloads.length;\n            const initialErrorCount = logs.errors.length;\n            \n            await exportCsvBtn.click();\n            await page.waitForTimeout(5000); // Wait longer for potential download\n            \n            const newDownloads = logs.downloads.length - initialDownloadCount;\n            const newErrors = logs.errors.length - initialErrorCount;\n            \n            console.log(`  📈 Results:`);\n            console.log(`    - New downloads: ${newDownloads}`);\n            console.log(`    - New errors: ${newErrors}`);\n            \n            if (newDownloads > 0) {\n                console.log(`    ✅ Download triggered: ${logs.downloads[logs.downloads.length - 1].filename}`);\n            } else {\n                console.log(`    ⚠️  No download triggered`);\n            }\n            \n            if (newErrors > 0) {\n                console.log(`    ❌ New errors occurred:`);\n                logs.errors.slice(-newErrors).forEach(error => {\n                    console.log(`      - ${error.message}`);\n                });\n            }\n        } else {\n            console.log('  ❌ Cannot test CSV export - button not available or not clickable');\n        }\n        \n        // Final analysis\n        console.log('\\n' + '=' .repeat(70));\n        console.log('🔍 DETAILED ANALYSIS SUMMARY');\n        console.log('=' .repeat(70));\n        \n        console.log('\\n🔘 BUTTON AVAILABILITY:');\n        console.log(`Export Excel Button: ${exportBtnDetails.exists ? '✅ Found' : '❌ Missing'} | Visible: ${exportBtnDetails.visible ? '✅' : '❌'} | Enabled: ${exportBtnDetails.enabled ? '✅' : '❌'}`);\n        console.log(`Export CSV Button: ${csvBtnDetails.exists ? '✅ Found' : '❌ Missing'} | Visible: ${csvBtnDetails.visible ? '✅' : '❌'} | Enabled: ${csvBtnDetails.enabled ? '✅' : '❌'}`);\n        \n        console.log('\\n🛠️ JAVASCRIPT ENVIRONMENT:');\n        console.log(`XLSX Library: ${jsEnvironment.xlsxLoaded ? '✅ Loaded' : '❌ Missing'}`);\n        console.log(`Export Functions: Excel(${jsEnvironment.exportToExcelExists ? '✅' : '❌'}) | CSV(${jsEnvironment.exportToCSVExists ? '✅' : '❌'})`);\n        console.log(`Test Data Function: ${jsEnvironment.generateTestDataExists ? '✅ Available' : '❌ Missing'}`);\n        console.log(`Data Variables: current(${jsEnvironment.currentDataExists ? '✅' : '❌'}) | filtered(${jsEnvironment.filteredDataExists ? '✅' : '❌'})`);\n        \n        console.log('\\n📊 DATA STATUS:');\n        console.log(`Current Data Records: ${dataStatus.currentDataLength}`);\n        console.log(`Filtered Data Records: ${dataStatus.filteredDataLength}`);\n        \n        console.log('\\n📥 DOWNLOAD ACTIVITY:');\n        console.log(`Total Downloads Triggered: ${logs.downloads.length}`);\n        if (logs.downloads.length > 0) {\n            logs.downloads.forEach((download, index) => {\n                console.log(`  ${index + 1}. ${download.filename} (${download.timestamp})`);\n            });\n        } else {\n            console.log('  No downloads were triggered during testing');\n        }\n        \n        console.log('\\n❌ ERRORS DETECTED:');\n        if (logs.errors.length === 0) {\n            console.log('  No JavaScript errors detected ✅');\n        } else {\n            logs.errors.forEach((error, index) => {\n                console.log(`  ${index + 1}. ${error.name}: ${error.message}`);\n                if (error.stack) {\n                    const stackLine = error.stack.split('\\n')[1];\n                    if (stackLine) {\n                        console.log(`     Location: ${stackLine.trim()}`);\n                    }\n                }\n            });\n        }\n        \n        console.log('\\n🌐 NETWORK ISSUES:');\n        const errorRequests = logs.network.filter(req => req.url.includes('404') || req.resourceType === 'other' && req.url.includes('error'));\n        if (errorRequests.length === 0) {\n            console.log('  No network errors detected ✅');\n        } else {\n            errorRequests.forEach((req, index) => {\n                console.log(`  ${index + 1}. ${req.method} ${req.url} (${req.resourceType})`);\n            });\n        }\n        \n        console.log('\\n🎯 ROOT CAUSE ANALYSIS:');\n        \n        // Analyze specific issues\n        const issues = [];\n        \n        if (!jsEnvironment.xlsxLoaded) {\n            issues.push('❌ XLSX library not loaded - Excel export will fail');\n        }\n        \n        if (!jsEnvironment.generateTestDataExists) {\n            issues.push('❌ generateTestData function missing - Test data generation failing');\n        }\n        \n        if (logs.errors.some(e => e.message.includes('addEventListener'))) {\n            issues.push('❌ Event listener errors - Some buttons may not have proper event handlers');\n        }\n        \n        if (logs.downloads.length === 0 && (exportBtnDetails.exists && csvBtnDetails.exists)) {\n            issues.push('❌ No downloads triggered despite buttons being present - Export functions may be broken');\n        }\n        \n        if (logs.network.some(req => req.url.includes('404'))) {\n            issues.push('❌ 404 errors detected - Missing resource files affecting functionality');\n        }\n        \n        if (issues.length === 0) {\n            console.log('  ✅ No critical issues identified');\n        } else {\n            issues.forEach(issue => {\n                console.log(`  ${issue}`);\n            });\n        }\n        \n        console.log('\\n💡 RECOMMENDATIONS:');\n        \n        if (!jsEnvironment.xlsxLoaded) {\n            console.log('  1. Ensure XLSX library is properly loaded from CDN');\n            console.log('     Current CDN: https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');\n        }\n        \n        if (logs.errors.some(e => e.message.includes('addEventListener'))) {\n            console.log('  2. Fix JavaScript errors preventing proper event listener attachment');\n        }\n        \n        if (!jsEnvironment.generateTestDataExists) {\n            console.log('  3. Ensure generateTestData function is properly defined and accessible');\n        }\n        \n        if (dataStatus.currentDataLength === 0) {\n            console.log('  4. Load sample data before testing export functionality');\n        }\n        \n        const overallStatus = \n            exportBtnDetails.exists && csvBtnDetails.exists && \n            jsEnvironment.xlsxLoaded && \n            jsEnvironment.exportToExcelExists && jsEnvironment.exportToCSVExists &&\n            logs.errors.length === 0 ? 'FUNCTIONAL' : 'NEEDS ATTENTION';\n            \n        console.log(`\\n🏆 OVERALL ASSESSMENT: ${overallStatus}`);\n        \n    } catch (error) {\n        console.error('❌ Test execution failed:', error.message);\n        console.error('Stack trace:', error.stack);\n    } finally {\n        await browser.close();\n        console.log('\\n🔚 Detailed analysis completed');\n    }\n}\n\n// Run the detailed test\ndetailedExportTest().catch(console.error);