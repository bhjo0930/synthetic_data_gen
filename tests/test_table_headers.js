const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testTableHeaders() {
    console.log('🎭 Starting Playwright test for table header visibility...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 // Slow down for better observation
    });
    
    try {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        const page = await context.newPage();

        console.log('📍 Navigating to search.html...');
        await page.goto('http://127.0.0.1:5050/static/search.html');
        
        // Wait for page to load
        await page.waitForTimeout(2000);

        console.log('🎲 Generating test data...');
        
        // Click the GENERATE TEST DATA button
        const generateButton = page.locator('button:has-text("GENERATE TEST DATA")');
        await generateButton.waitFor({ state: 'visible', timeout: 10000 });
        await generateButton.click();
        
        // Wait for data to load
        console.log('⏳ Waiting for data grid to populate...');
        await page.waitForTimeout(3000);

        // Test 1: Check data grid table
        console.log('📊 Testing data grid table headers...');
        
        const dataGridContainer = page.locator('#dataGrid');
        await dataGridContainer.waitFor({ state: 'visible', timeout: 10000 });
        
        // Take screenshot of data grid
        const dataGridScreenshot = await dataGridContainer.screenshot({
            path: '/Users/a019051/workspace/synthetic_data_gen/tests/screenshots/data-grid-table.png'
        });
        
        // Check header styling
        const dataGridHeaders = page.locator('#dataGrid table thead th');
        const headerCount = await dataGridHeaders.count();
        console.log(`Found ${headerCount} headers in data grid`);
        
        // Analyze header styles
        for (let i = 0; i < headerCount; i++) {
            const header = dataGridHeaders.nth(i);
            const styles = await header.evaluate(el => {
                const computed = window.getComputedStyle(el);
                return {
                    backgroundColor: computed.backgroundColor,
                    color: computed.color,
                    fontWeight: computed.fontWeight,
                    textTransform: computed.textTransform,
                    border: computed.border,
                    padding: computed.padding
                };
            });
            
            const headerText = await header.textContent();
            console.log(`Header "${headerText}":`, styles);
        }

        // Test 2: Generate pivot table if possible
        console.log('🔄 Testing pivot table generation...');
        
        // Look for pivot table generation controls
        const pivotControls = page.locator('.pivot-controls, #pivot-controls, [class*="pivot"]');
        const pivotControlsVisible = await pivotControls.count() > 0;
        
        if (pivotControlsVisible) {
            console.log('📊 Found pivot controls, attempting to generate pivot table...');
            
            // Try to find and interact with pivot controls
            const rowSelect = page.locator('select[name*="row"], select[id*="row"], select:has(option:text-is("Select Row"))').first();
            const colSelect = page.locator('select[name*="col"], select[id*="col"], select:has(option:text-is("Select Column"))').first();
            const valueSelect = page.locator('select[name*="value"], select[id*="value"], select:has(option:text-is("Select Value"))').first();
            
            if (await rowSelect.count() > 0) {
                await rowSelect.selectOption({ index: 1 }); // Select first option after default
            }
            if (await colSelect.count() > 0) {
                await colSelect.selectOption({ index: 1 });
            }
            if (await valueSelect.count() > 0) {
                await valueSelect.selectOption({ index: 1 });
            }
            
            // Look for generate pivot button
            const generatePivotButton = page.locator('button:has-text("GENERATE"), button:has-text("Generate Pivot"), button:has-text("CREATE PIVOT"), button[onclick*="pivot"]').first();
            if (await generatePivotButton.count() > 0) {
                await generatePivotButton.click();
                await page.waitForTimeout(3000);
                
                // Check pivot table container
                const pivotContainer = page.locator('#pivotTable');
                if (await pivotContainer.count() > 0) {
                    console.log('📊 Pivot table generated, taking screenshot...');
                    await pivotContainer.screenshot({
                        path: '/Users/a019051/workspace/synthetic_data_gen/tests/screenshots/pivot-table.png'
                    });
                    
                    // Analyze pivot table headers
                    const pivotHeaders = pivotContainer.locator('table thead th');
                    const pivotHeaderCount = await pivotHeaders.count();
                    console.log(`Found ${pivotHeaderCount} headers in pivot table`);
                    
                    for (let i = 0; i < pivotHeaderCount; i++) {
                        const header = pivotHeaders.nth(i);
                        const styles = await header.evaluate(el => {
                            const computed = window.getComputedStyle(el);
                            return {
                                backgroundColor: computed.backgroundColor,
                                color: computed.color,
                                fontWeight: computed.fontWeight,
                                textTransform: computed.textTransform
                            };
                        });
                        
                        const headerText = await header.textContent();
                        console.log(`Pivot Header "${headerText}":`, styles);
                    }
                }
            }
        } else {
            console.log('❌ No pivot controls found, skipping pivot table test');
        }

        // Test 3: Overall page styling assessment
        console.log('🎨 Assessing overall Neo-Brutalism styling...');
        
        // Take full page screenshot
        await page.screenshot({
            path: '/Users/a019051/workspace/synthetic_data_gen/tests/screenshots/full-page.png',
            fullPage: true
        });
        
        // Check overall page styles
        const pageStyles = await page.evaluate(() => {
            const body = document.body;
            const computed = window.getComputedStyle(body);
            return {
                backgroundColor: computed.backgroundColor,
                fontFamily: computed.fontFamily,
                color: computed.color
            };
        });
        console.log('Page styles:', pageStyles);
        
        // Test 4: Verify specific Neo-Brutalism elements
        console.log('🔍 Checking Neo-Brutalism design elements...');
        
        // Check for yellow backgrounds (Neo-Brutalism characteristic)
        const yellowElements = await page.locator('*').evaluateAll(elements => {
            return elements.filter(el => {
                const styles = window.getComputedStyle(el);
                return styles.backgroundColor.includes('rgb(255, 255, 0)') || 
                       styles.backgroundColor.includes('yellow') ||
                       styles.backgroundColor.includes('#ffff00') ||
                       styles.backgroundColor.includes('#FFFF00');
            }).length;
        });
        console.log(`Found ${yellowElements} elements with yellow backgrounds`);
        
        // Check for bold, uppercase text
        const boldUppercaseElements = await page.locator('*').evaluateAll(elements => {
            return elements.filter(el => {
                const styles = window.getComputedStyle(el);
                return (styles.fontWeight === 'bold' || parseInt(styles.fontWeight) >= 700) &&
                       styles.textTransform === 'uppercase';
            }).length;
        });
        console.log(`Found ${boldUppercaseElements} elements with bold, uppercase styling`);
        
        // Test 5: Contrast and readability assessment
        console.log('📖 Assessing readability and contrast...');
        
        const contrastResults = await page.evaluate(() => {
            const headers = document.querySelectorAll('th');
            const results = [];
            
            headers.forEach((header, index) => {
                const styles = window.getComputedStyle(header);
                const bg = styles.backgroundColor;
                const color = styles.color;
                const text = header.textContent.trim();
                
                results.push({
                    index,
                    text,
                    backgroundColor: bg,
                    color: color,
                    isVisible: header.offsetHeight > 0 && header.offsetWidth > 0
                });
            });
            
            return results;
        });
        
        console.log('Header contrast analysis:');
        contrastResults.forEach(result => {
            console.log(`  ${result.text}: BG=${result.backgroundColor}, Color=${result.color}, Visible=${result.isVisible}`);
        });

        console.log('✅ Test completed successfully!');
        
        return {
            dataGridHeaders: headerCount,
            contrastResults,
            yellowElements,
            boldUppercaseElements,
            pageStyles
        };

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Create screenshots directory if it doesn't exist
const screenshotsDir = '/Users/a019051/workspace/synthetic_data_gen/tests/screenshots';
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Run the test
if (require.main === module) {
    testTableHeaders()
        .then(results => {
            console.log('\n📊 TEST RESULTS SUMMARY:');
            console.log(`- Data grid headers found: ${results.dataGridHeaders}`);
            console.log(`- Yellow elements: ${results.yellowElements}`);
            console.log(`- Bold uppercase elements: ${results.boldUppercaseElements}`);
            console.log('\n📸 Screenshots saved to tests/screenshots/');
            console.log('- data-grid-table.png');
            console.log('- pivot-table.png (if generated)');
            console.log('- full-page.png');
        })
        .catch(error => {
            console.error('Test execution failed:', error.message);
            process.exit(1);
        });
}

module.exports = { testTableHeaders };