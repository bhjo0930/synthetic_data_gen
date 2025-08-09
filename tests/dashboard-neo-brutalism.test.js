/**
 * Dashboard Neo-Brutalism Transformation Tests
 * Tests the visual and functional aspects of the analytics dashboard
 */

describe('Dashboard Neo-Brutalism Tests', () => {
    let testContainer;
    
    beforeEach(() => {
        // Create test container
        testContainer = document.createElement('div');
        testContainer.innerHTML = `
            <link rel="stylesheet" href="../static/css/neo-brutalism.css">
            <div class="olap-container">
                <header class="olap-header">
                    <h1><i class="fas fa-users"></i> Virtual Peoples - Analysis Dashboard</h1>
                    <nav>
                        <a href="#"><i class="fas fa-plus-circle"></i> Generate People</a>
                        <a href="#" class="active"><i class="fas fa-chart-line"></i> Analytics</a>
                    </nav>
                </header>
                
                <div class="olap-layout">
                    <aside class="slicer-panel">
                        <div class="panel-header">
                            <h3><i class="fas fa-sliders-h"></i> 다차원 필터</h3>
                            <div class="panel-controls">
                                <button class="neo-button neo-button--secondary">
                                    <i class="fas fa-times"></i>
                                </button>
                                <button class="neo-button">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="slicer-section">
                            <div class="slicer-header">
                                <i class="fas fa-user"></i>
                                <span>Demographics</span>
                                <i class="fas fa-chevron-down toggle-icon"></i>
                            </div>
                            <div class="slicer-content">
                                <div class="filter-item">
                                    <label>Age Range</label>
                                    <div class="range-inputs">
                                        <input type="number" class="range-input" placeholder="Min">
                                        <span>~</span>
                                        <input type="number" class="range-input" placeholder="Max">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                    
                    <main class="analysis-main">
                        <section class="kpi-section">
                            <div class="kpi-card">
                                <div class="kpi-value">1,234</div>
                                <div class="kpi-label">Total Virtual People</div>
                                <div class="kpi-icon"><i class="fas fa-users"></i></div>
                            </div>
                            <div class="kpi-card">
                                <div class="kpi-value">32</div>
                                <div class="kpi-label">Average Age</div>
                                <div class="kpi-icon"><i class="fas fa-birthday-cake"></i></div>
                            </div>
                        </section>
                        
                        <section class="chart-section">
                            <div class="chart-tabs">
                                <button class="tab-button active" data-tab="overview">Overview</button>
                                <button class="tab-button" data-tab="demographics">Demographics</button>
                            </div>
                            
                            <div class="chart-grid-4">
                                <div class="chart-card">
                                    <h4>Age Distribution</h4>
                                    <canvas></canvas>
                                </div>
                                <div class="chart-card">
                                    <h4>Gender Distribution</h4>
                                    <canvas></canvas>
                                </div>
                            </div>
                        </section>
                        
                        <section class="data-grid-section">
                            <div class="section-header">
                                <h3><i class="fas fa-list"></i> Detailed Data</h3>
                                <div class="grid-controls">
                                    <span class="result-count">Total <span>1,234</span> people</span>
                                    <button class="neo-button neo-button--secondary">
                                        <i class="fas fa-download"></i> Export Excel
                                    </button>
                                </div>
                            </div>
                            <div class="data-grid-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Age</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>001</td>
                                            <td>John Doe</td>
                                            <td>32</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        `;
        document.body.appendChild(testContainer);
    });
    
    afterEach(() => {
        if (testContainer && testContainer.parentNode) {
            testContainer.parentNode.removeChild(testContainer);
        }
    });
    
    describe('Header Component', () => {
        test('should have Neo-Brutalism header styling', () => {
            const header = testContainer.querySelector('.olap-header');
            expect(header).toBeTruthy();
            
            const styles = window.getComputedStyle(header);
            expect(styles.backgroundColor).toBe('rgb(0, 0, 0)');
            expect(styles.color).toBe('rgb(255, 255, 255)');
            expect(styles.position).toBe('relative');
        });
        
        test('should have navigation with proper styling', () => {
            const nav = testContainer.querySelector('.olap-header nav');
            const links = nav.querySelectorAll('a');
            
            expect(nav).toBeTruthy();
            expect(links.length).toBe(2);
            
            const activeLink = nav.querySelector('a.active');
            expect(activeLink).toBeTruthy();
        });
        
        test('should have title with icon', () => {
            const title = testContainer.querySelector('.olap-header h1');
            const icon = title.querySelector('i');
            
            expect(title).toBeTruthy();
            expect(icon).toBeTruthy();
            expect(icon.classList.contains('fas')).toBe(true);
        });
    });
    
    describe('Slicer Panel', () => {
        test('should have proper panel structure', () => {
            const panel = testContainer.querySelector('.slicer-panel');
            const header = panel.querySelector('.panel-header');
            const controls = panel.querySelector('.panel-controls');
            
            expect(panel).toBeTruthy();
            expect(header).toBeTruthy();
            expect(controls).toBeTruthy();
        });
        
        test('should have collapsible sections', () => {
            const section = testContainer.querySelector('.slicer-section');
            const sectionHeader = section.querySelector('.slicer-header');
            const content = section.querySelector('.slicer-content');
            
            expect(section).toBeTruthy();
            expect(sectionHeader).toBeTruthy();
            expect(content).toBeTruthy();
        });
        
        test('should have filter inputs with Neo-Brutalism styling', () => {
            const rangeInputs = testContainer.querySelectorAll('.range-input');
            expect(rangeInputs.length).toBe(2);
            
            rangeInputs.forEach(input => {
                const styles = window.getComputedStyle(input);
                expect(styles.border).toContain('4px');
            });
        });
        
        test('should toggle section visibility on header click', () => {
            const section = testContainer.querySelector('.slicer-section');
            const sectionHeader = section.querySelector('.slicer-header');
            const content = section.querySelector('.slicer-content');
            
            // Initially expanded
            expect(section.classList.contains('collapsed')).toBe(false);
            
            // Click to collapse
            sectionHeader.click();
            expect(section.classList.contains('collapsed')).toBe(true);
            
            // Click to expand
            sectionHeader.click();
            expect(section.classList.contains('collapsed')).toBe(false);
        });
    });
    
    describe('KPI Cards', () => {
        test('should have asymmetrical card layouts', () => {
            const cards = testContainer.querySelectorAll('.kpi-card');
            expect(cards.length).toBe(2);
            
            cards.forEach(card => {
                const styles = window.getComputedStyle(card);
                expect(styles.position).toBe('relative');
                expect(styles.border).toContain('4px');
                expect(styles.boxShadow).not.toBe('none');
            });
        });
        
        test('should have proper KPI structure', () => {
            const firstCard = testContainer.querySelector('.kpi-card');
            const value = firstCard.querySelector('.kpi-value');
            const label = firstCard.querySelector('.kpi-label');
            const icon = firstCard.querySelector('.kpi-icon');
            
            expect(value).toBeTruthy();
            expect(label).toBeTruthy();
            expect(icon).toBeTruthy();
            expect(value.textContent).toBe('1,234');
        });
    });
    
    describe('Chart Section', () => {
        test('should have tab navigation', () => {
            const tabs = testContainer.querySelectorAll('.tab-button');
            expect(tabs.length).toBe(2);
            
            const activeTab = testContainer.querySelector('.tab-button.active');
            expect(activeTab).toBeTruthy();
            expect(activeTab.textContent).toBe('Overview');
        });
        
        test('should switch active tab on click', () => {
            const tabs = testContainer.querySelectorAll('.tab-button');
            const firstTab = tabs[0];
            const secondTab = tabs[1];
            
            expect(firstTab.classList.contains('active')).toBe(true);
            expect(secondTab.classList.contains('active')).toBe(false);
            
            secondTab.click();
            
            expect(firstTab.classList.contains('active')).toBe(false);
            expect(secondTab.classList.contains('active')).toBe(true);
        });
        
        test('should have chart cards with proper styling', () => {
            const chartCards = testContainer.querySelectorAll('.chart-card');
            expect(chartCards.length).toBe(2);
            
            chartCards.forEach(card => {
                const styles = window.getComputedStyle(card);
                expect(styles.border).toContain('4px');
                expect(styles.position).toBe('relative');
                
                const title = card.querySelector('h4');
                expect(title).toBeTruthy();
                
                const canvas = card.querySelector('canvas');
                expect(canvas).toBeTruthy();
            });
        });
    });
    
    describe('Data Grid', () => {
        test('should have section header with controls', () => {
            const section = testContainer.querySelector('.data-grid-section');
            const header = section.querySelector('.section-header');
            const controls = section.querySelector('.grid-controls');
            
            expect(section).toBeTruthy();
            expect(header).toBeTruthy();
            expect(controls).toBeTruthy();
        });
        
        test('should have data table with Neo-Brutalism styling', () => {
            const container = testContainer.querySelector('.data-grid-container');
            const table = container.querySelector('table');
            const headers = table.querySelectorAll('th');
            const rows = table.querySelectorAll('tbody tr');
            
            expect(container).toBeTruthy();
            expect(table).toBeTruthy();
            expect(headers.length).toBe(3);
            expect(rows.length).toBe(1);
            
            const containerStyles = window.getComputedStyle(container);
            expect(containerStyles.border).toContain('4px');
        });
        
        test('should have result count display', () => {
            const resultCount = testContainer.querySelector('.result-count');
            expect(resultCount).toBeTruthy();
            expect(resultCount.textContent).toContain('1,234');
        });
    });
    
    describe('Responsive Design', () => {
        test('should handle mobile viewport', () => {
            // Simulate mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 480,
            });
            
            // Trigger resize event
            window.dispatchEvent(new Event('resize'));
            
            const layout = testContainer.querySelector('.olap-layout');
            expect(layout).toBeTruthy();
        });
        
        test('should handle tablet viewport', () => {
            // Simulate tablet viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 768,
            });
            
            // Trigger resize event
            window.dispatchEvent(new Event('resize'));
            
            const kpiSection = testContainer.querySelector('.kpi-section');
            expect(kpiSection).toBeTruthy();
        });
    });
    
    describe('Accessibility', () => {
        test('should have proper ARIA labels', () => {
            const buttons = testContainer.querySelectorAll('button');
            buttons.forEach(button => {
                // Check for either title attribute or aria-label
                const hasAccessibleName = button.hasAttribute('title') || 
                                        button.hasAttribute('aria-label') ||
                                        button.textContent.trim().length > 0;
                expect(hasAccessibleName).toBe(true);
            });
        });
        
        test('should have semantic HTML structure', () => {
            const header = testContainer.querySelector('header');
            const main = testContainer.querySelector('main');
            const sections = testContainer.querySelectorAll('section');
            
            expect(header).toBeTruthy();
            expect(main).toBeTruthy();
            expect(sections.length).toBeGreaterThan(0);
        });
        
        test('should have keyboard navigation support', () => {
            const focusableElements = testContainer.querySelectorAll(
                'button, input, select, textarea, a[href]'
            );
            
            expect(focusableElements.length).toBeGreaterThan(0);
            
            focusableElements.forEach(element => {
                expect(element.tabIndex).not.toBe(-1);
            });
        });
    });
    
    describe('Neo-Brutalism Design Principles', () => {
        test('should use bold typography', () => {
            const titles = testContainer.querySelectorAll('h1, h3, h4');
            titles.forEach(title => {
                const styles = window.getComputedStyle(title);
                expect(styles.fontWeight).toBe('900');
                expect(styles.textTransform).toBe('uppercase');
            });
        });
        
        test('should use thick borders', () => {
            const borderedElements = testContainer.querySelectorAll(
                '.olap-header, .slicer-panel, .kpi-card, .chart-card, .data-grid-container'
            );
            
            borderedElements.forEach(element => {
                const styles = window.getComputedStyle(element);
                const borderWidth = parseInt(styles.borderWidth);
                expect(borderWidth).toBeGreaterThanOrEqual(4);
            });
        });
        
        test('should use solid shadows', () => {
            const shadowElements = testContainer.querySelectorAll(
                '.kpi-card, .chart-card, .data-grid-container'
            );
            
            shadowElements.forEach(element => {
                const styles = window.getComputedStyle(element);
                expect(styles.boxShadow).not.toBe('none');
                // Neo-brutalism uses solid shadows, not blurred ones
                expect(styles.boxShadow).not.toContain('blur');
            });
        });
        
        test('should use high contrast colors', () => {
            const header = testContainer.querySelector('.olap-header');
            const headerStyles = window.getComputedStyle(header);
            
            // Black background with white text for high contrast
            expect(headerStyles.backgroundColor).toBe('rgb(0, 0, 0)');
            expect(headerStyles.color).toBe('rgb(255, 255, 255)');
        });
    });
});

// Test runner setup for browser environment
if (typeof window !== 'undefined') {
    // Add basic test framework functions for browser testing
    window.describe = function(name, fn) {
        console.group(name);
        fn();
        console.groupEnd();
    };
    
    window.test = function(name, fn) {
        try {
            fn();
            console.log(`✓ ${name}`);
        } catch (error) {
            console.error(`✗ ${name}:`, error.message);
        }
    };
    
    window.expect = function(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${actual} to be ${expected}`);
                }
            },
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected ${actual} to be truthy`);
                }
            },
            toContain: (expected) => {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected ${actual} to contain ${expected}`);
                }
            },
            toBeGreaterThan: (expected) => {
                if (actual <= expected) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
            },
            toBeGreaterThanOrEqual: (expected) => {
                if (actual < expected) {
                    throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
                }
            },
            not: {
                toBe: (expected) => {
                    if (actual === expected) {
                        throw new Error(`Expected ${actual} not to be ${expected}`);
                    }
                },
                toContain: (expected) => {
                    if (actual.includes(expected)) {
                        throw new Error(`Expected ${actual} not to contain ${expected}`);
                    }
                }
            }
        };
    };
    
    window.beforeEach = function(fn) {
        // Store setup function
        window._beforeEach = fn;
    };
    
    window.afterEach = function(fn) {
        // Store teardown function
        window._afterEach = fn;
    };
}