/**
 * Performance Testing Module for Neo-Brutalism Design System
 * Tests for CSS performance, animation smoothness, and resource optimization
 */

class PerformanceTester {
    constructor() {
        this.metrics = {
            renderingTimes: [],
            layoutTimes: [],
            paintTimes: [],
            animationFrames: [],
            memoryUsage: []
        };
        
        this.thresholds = {
            renderTime: 16.67, // 60fps = 16.67ms per frame
            layoutTime: 5, // Layout should be under 5ms
            paintTime: 10, // Paint should be under 10ms
            animationFPS: 58, // Animation should maintain close to 60fps
            memoryGrowth: 50 // Memory growth should be under 50MB for test operations
        };
    }

    /**
     * Test CSS rendering performance
     */
    async testRenderingPerformance(testElements) {
        const results = {
            timestamp: performance.now(),
            tests: [],
            summary: {
                averageRenderTime: 0,
                maxRenderTime: 0,
                minRenderTime: Infinity,
                passedTests: 0,
                failedTests: 0
            }
        };

        for (let i = 0; i < testElements.length; i++) {
            const element = testElements[i];
            const testName = `Render Test ${i + 1}: ${element.className || element.tagName}`;
            
            const renderTime = await this.measureRenderTime(element);
            const passes = renderTime <= this.thresholds.renderTime;
            
            results.tests.push({
                name: testName,
                element: element,
                renderTime: renderTime,
                threshold: this.thresholds.renderTime,
                passes: passes
            });
            
            if (passes) results.summary.passedTests++;
            else results.summary.failedTests++;
            
            results.summary.maxRenderTime = Math.max(results.summary.maxRenderTime, renderTime);
            results.summary.minRenderTime = Math.min(results.summary.minRenderTime, renderTime);
        }
        
        results.summary.averageRenderTime = results.tests.reduce((sum, test) => sum + test.renderTime, 0) / results.tests.length;
        
        return results;
    }

    /**
     * Measure rendering time for an element
     */
    async measureRenderTime(element) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            
            // Force a style change that requires re-rendering
            const originalDisplay = element.style.display;
            element.style.display = 'none';
            
            requestAnimationFrame(() => {
                element.style.display = originalDisplay;
                
                requestAnimationFrame(() => {
                    const endTime = performance.now();
                    resolve(endTime - startTime);
                });
            });
        });
    }

    /**
     * Test animation performance and FPS
     */
    async testAnimationPerformance(animatedElement, duration = 1000) {
        const results = {
            timestamp: performance.now(),
            duration: duration,
            frames: [],
            averageFPS: 0,
            minFPS: Infinity,
            maxFPS: 0,
            droppedFrames: 0,
            passes: false
        };

        return new Promise((resolve) => {
            let frameCount = 0;
            let lastFrameTime = performance.now();
            const startTime = performance.now();
            let animationId;

            const measureFrame = () => {
                const currentTime = performance.now();
                const frameTime = currentTime - lastFrameTime;
                const fps = 1000 / frameTime;
                
                results.frames.push({
                    frameNumber: frameCount,
                    time: currentTime - startTime,
                    frameTime: frameTime,
                    fps: fps
                });
                
                results.minFPS = Math.min(results.minFPS, fps);
                results.maxFPS = Math.max(results.maxFPS, fps);
                
                if (fps < 30) results.droppedFrames++;
                
                lastFrameTime = currentTime;
                frameCount++;
                
                if (currentTime - startTime < duration) {
                    animationId = requestAnimationFrame(measureFrame);
                } else {
                    // Calculate results
                    results.averageFPS = results.frames.reduce((sum, frame) => sum + frame.fps, 0) / results.frames.length;
                    results.passes = results.averageFPS >= this.thresholds.animationFPS && results.droppedFrames < 5;
                    
                    resolve(results);
                }
            };

            // Start animation
            this.startTestAnimation(animatedElement);
            animationId = requestAnimationFrame(measureFrame);
            
            // Stop animation after duration
            setTimeout(() => {
                if (animationId) cancelAnimationFrame(animationId);
                this.stopTestAnimation(animatedElement);
            }, duration + 100);
        });
    }

    /**
     * Start test animation on element
     */
    startTestAnimation(element) {
        element.style.transition = 'transform 0.1s ease-out, background-color 0.1s ease-out';
        
        let toggle = false;
        element.testAnimationInterval = setInterval(() => {
            if (toggle) {
                element.style.transform = 'translate(2px, 2px) rotate(1deg)';
                element.style.backgroundColor = '#FF0000';
            } else {
                element.style.transform = 'translate(0px, 0px) rotate(0deg)';
                element.style.backgroundColor = '#FFFFFF';
            }
            toggle = !toggle;
        }, 100);
    }

    /**
     * Stop test animation on element
     */
    stopTestAnimation(element) {
        if (element.testAnimationInterval) {
            clearInterval(element.testAnimationInterval);
            delete element.testAnimationInterval;
        }
        
        // Reset styles
        element.style.transition = '';
        element.style.transform = '';
        element.style.backgroundColor = '';
    }

    /**
     * Test layout performance with DOM changes
     */
    async testLayoutPerformance(container, elementCount = 100) {
        const results = {
            timestamp: performance.now(),
            elementCount: elementCount,
            tests: []
        };

        // Test 1: Element creation performance
        const creationResult = await this.testElementCreation(container, elementCount);
        results.tests.push(creationResult);

        // Test 2: Style modification performance
        const modificationResult = await this.testStyleModification(container);
        results.tests.push(modificationResult);

        // Test 3: Layout thrashing test
        const thrashingResult = await this.testLayoutThrashing(container);
        results.tests.push(thrashingResult);

        // Clean up
        container.innerHTML = '';

        return results;
    }

    /**
     * Test element creation performance
     */
    async testElementCreation(container, count) {
        const startTime = performance.now();
        
        for (let i = 0; i < count; i++) {
            const element = document.createElement('div');
            element.className = 'neo-card';
            element.innerHTML = `
                <div class="neo-card__header">
                    <h3 class="neo-card__title">Test Card ${i}</h3>
                </div>
                <p>Performance test content for card ${i}</p>
            `;
            container.appendChild(element);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const timePerElement = totalTime / count;
        
        return {
            name: 'Element Creation',
            totalTime: totalTime,
            timePerElement: timePerElement,
            elementCount: count,
            passes: timePerElement < 1 // Should create elements in under 1ms each
        };
    }

    /**
     * Test style modification performance
     */
    async testStyleModification(container) {
        const elements = container.querySelectorAll('.neo-card');
        const startTime = performance.now();
        
        elements.forEach((element, index) => {
            // Modify styles that trigger layout/paint
            element.style.backgroundColor = index % 2 === 0 ? '#FF0000' : '#00FF00';
            element.style.transform = `rotate(${index % 4}deg)`;
            element.style.boxShadow = `${4 + index % 3}px ${4 + index % 3}px 0px #000000`;
        });
        
        // Force layout calculation
        container.offsetHeight;
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const timePerElement = elements.length > 0 ? totalTime / elements.length : 0;
        
        return {
            name: 'Style Modification',
            totalTime: totalTime,
            timePerElement: timePerElement,
            elementCount: elements.length,
            passes: timePerElement < 0.5 // Should modify styles in under 0.5ms each
        };
    }

    /**
     * Test layout thrashing (expensive operations)
     */
    async testLayoutThrashing(container) {
        const elements = container.querySelectorAll('.neo-card');
        const startTime = performance.now();
        
        // Intentionally cause layout thrashing
        for (let i = 0; i < 10; i++) {
            elements.forEach(element => {
                // Read layout property (forces layout)
                const height = element.offsetHeight;
                // Modify style (invalidates layout)
                element.style.height = (height + 1) + 'px';
            });
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        return {
            name: 'Layout Thrashing',
            totalTime: totalTime,
            passes: totalTime < 100 // Should complete thrashing test in under 100ms
        };
    }

    /**
     * Test memory usage and leaks
     */
    async testMemoryUsage() {
        const results = {
            timestamp: performance.now(),
            initialMemory: 0,
            peakMemory: 0,
            finalMemory: 0,
            memoryGrowth: 0,
            gcEffectiveness: 0,
            passes: false,
            supported: !!performance.memory
        };

        if (!performance.memory) {
            results.error = 'Memory API not supported in this browser';
            return results;
        }

        // Initial memory measurement
        results.initialMemory = performance.memory.usedJSHeapSize;

        // Create elements that should be garbage collected
        const testContainer = document.createElement('div');
        testContainer.style.display = 'none';
        document.body.appendChild(testContainer);

        // Create and remove elements to test memory management
        for (let i = 0; i < 1000; i++) {
            const element = document.createElement('div');
            element.className = 'neo-card test-memory';
            element.innerHTML = `<p>Memory test element ${i}</p>`.repeat(10);
            testContainer.appendChild(element);
        }

        // Measure peak memory
        results.peakMemory = performance.memory.usedJSHeapSize;

        // Clean up
        testContainer.remove();

        // Force garbage collection if possible
        if (window.gc) {
            window.gc();
        }

        // Wait a bit for garbage collection
        await new Promise(resolve => setTimeout(resolve, 100));

        // Final memory measurement
        results.finalMemory = performance.memory.usedJSHeapSize;
        
        // Calculate metrics
        results.memoryGrowth = (results.finalMemory - results.initialMemory) / 1024 / 1024; // MB
        results.gcEffectiveness = ((results.peakMemory - results.finalMemory) / (results.peakMemory - results.initialMemory)) * 100;
        results.passes = results.memoryGrowth < this.thresholds.memoryGrowth;

        return results;
    }

    /**
     * Test CSS file loading performance
     */
    async testCSSLoadingPerformance() {
        const results = {
            timestamp: performance.now(),
            stylesheets: [],
            totalSize: 0,
            loadTime: 0,
            passes: false
        };

        const styleSheets = Array.from(document.styleSheets);
        
        for (let sheet of styleSheets) {
            try {
                if (sheet.href && sheet.href.includes('neo-brutalism')) {
                    const startTime = performance.now();
                    const response = await fetch(sheet.href);
                    const css = await response.text();
                    const endTime = performance.now();
                    
                    const loadTime = endTime - startTime;
                    const size = new Blob([css]).size;
                    
                    results.stylesheets.push({
                        href: sheet.href,
                        size: size,
                        loadTime: loadTime,
                        sizeKB: (size / 1024).toFixed(1)
                    });
                    
                    results.totalSize += size;
                    results.loadTime += loadTime;
                }
            } catch (error) {
                console.error('Error testing CSS performance:', error);
            }
        }

        results.totalSizeKB = (results.totalSize / 1024).toFixed(1);
        results.passes = results.totalSize < 51200 && results.loadTime < 100; // Under 50KB and 100ms

        return results;
    }

    /**
     * Test paint performance
     */
    async testPaintPerformance(element) {
        const results = {
            timestamp: performance.now(),
            measurements: [],
            averagePaintTime: 0,
            passes: false
        };

        // Use Performance Observer to measure paint timing
        if (window.PerformanceObserver) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'paint') {
                        results.measurements.push({
                            name: entry.name,
                            startTime: entry.startTime,
                            duration: entry.duration
                        });
                    }
                });
            });

            observer.observe({ entryTypes: ['paint'] });

            // Trigger paint operations
            for (let i = 0; i < 10; i++) {
                const startTime = performance.now();
                
                // Change styles that trigger paint
                element.style.backgroundColor = i % 2 === 0 ? '#FF0000' : '#00FF00';
                element.style.color = i % 2 === 0 ? '#FFFFFF' : '#000000';
                
                // Force paint
                element.offsetHeight;
                
                const endTime = performance.now();
                results.measurements.push({
                    name: `Paint test ${i}`,
                    startTime: startTime,
                    duration: endTime - startTime
                });
            }

            observer.disconnect();
        } else {
            // Fallback for browsers without Performance Observer
            for (let i = 0; i < 10; i++) {
                const startTime = performance.now();
                
                element.style.backgroundColor = i % 2 === 0 ? '#FF0000' : '#00FF00';
                element.offsetHeight; // Force layout/paint
                
                const endTime = performance.now();
                results.measurements.push({
                    name: `Paint test ${i}`,
                    duration: endTime - startTime
                });
            }
        }

        // Calculate average paint time
        if (results.measurements.length > 0) {
            results.averagePaintTime = results.measurements.reduce((sum, m) => sum + m.duration, 0) / results.measurements.length;
            results.passes = results.averagePaintTime < this.thresholds.paintTime;
        }

        // Reset element styles
        element.style.backgroundColor = '';
        element.style.color = '';

        return results;
    }

    /**
     * Test scroll performance
     */
    async testScrollPerformance(scrollContainer) {
        const results = {
            timestamp: performance.now(),
            scrollEvents: [],
            averageScrollTime: 0,
            jankFrames: 0,
            passes: false
        };

        return new Promise((resolve) => {
            let scrollCount = 0;
            const maxScrolls = 20;
            let lastScrollTime = performance.now();

            const handleScroll = () => {
                const currentTime = performance.now();
                const scrollTime = currentTime - lastScrollTime;
                
                results.scrollEvents.push({
                    scrollTop: scrollContainer.scrollTop,
                    time: currentTime,
                    deltaTime: scrollTime
                });
                
                if (scrollTime > 16.67) { // Frame took longer than 60fps
                    results.jankFrames++;
                }
                
                lastScrollTime = currentTime;
                scrollCount++;
                
                if (scrollCount >= maxScrolls) {
                    scrollContainer.removeEventListener('scroll', handleScroll);
                    
                    // Calculate results
                    results.averageScrollTime = results.scrollEvents.reduce((sum, event) => sum + event.deltaTime, 0) / results.scrollEvents.length;
                    results.passes = results.jankFrames < 3 && results.averageScrollTime < 16.67;
                    
                    resolve(results);
                }
            };

            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

            // Simulate scrolling
            let scrollPosition = 0;
            const scrollInterval = setInterval(() => {
                scrollPosition += 10;
                scrollContainer.scrollTop = scrollPosition;
                
                if (scrollCount >= maxScrolls) {
                    clearInterval(scrollInterval);
                }
            }, 50);
        });
    }

    /**
     * Run comprehensive performance test suite
     */
    async runFullPerformanceAudit(container = document.body) {
        const results = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                overallGrade: 'F'
            },
            rendering: null,
            animation: null,
            layout: null,
            memory: null,
            cssLoading: null,
            paint: null
        };

        try {
            // Test rendering performance
            const testElements = container.querySelectorAll('.neo-button, .neo-card, .neo-input');
            if (testElements.length > 0) {
                results.rendering = await this.testRenderingPerformance(Array.from(testElements));
                results.summary.totalTests += results.rendering.tests.length;
                results.summary.passedTests += results.rendering.summary.passedTests;
                results.summary.failedTests += results.rendering.summary.failedTests;
            }

            // Test animation performance
            const animatedElement = container.querySelector('.neo-button') || document.createElement('div');
            if (animatedElement) {
                results.animation = await this.testAnimationPerformance(animatedElement, 500);
                results.summary.totalTests++;
                if (results.animation.passes) results.summary.passedTests++;
                else results.summary.failedTests++;
            }

            // Test layout performance
            const testContainer = document.createElement('div');
            testContainer.style.display = 'none';
            container.appendChild(testContainer);
            
            results.layout = await this.testLayoutPerformance(testContainer, 50);
            results.summary.totalTests += results.layout.tests.length;
            results.layout.tests.forEach(test => {
                if (test.passes) results.summary.passedTests++;
                else results.summary.failedTests++;
            });
            
            testContainer.remove();

            // Test memory usage
            results.memory = await this.testMemoryUsage();
            if (results.memory.supported) {
                results.summary.totalTests++;
                if (results.memory.passes) results.summary.passedTests++;
                else results.summary.failedTests++;
            }

            // Test CSS loading performance
            results.cssLoading = await this.testCSSLoadingPerformance();
            results.summary.totalTests++;
            if (results.cssLoading.passes) results.summary.passedTests++;
            else results.summary.failedTests++;

            // Test paint performance
            const paintTestElement = container.querySelector('.neo-card') || document.createElement('div');
            results.paint = await this.testPaintPerformance(paintTestElement);
            results.summary.totalTests++;
            if (results.paint.passes) results.summary.passedTests++;
            else results.summary.failedTests++;

        } catch (error) {
            console.error('Performance test error:', error);
        }

        // Calculate overall grade
        const passRate = results.summary.totalTests > 0 ? 
            (results.summary.passedTests / results.summary.totalTests * 100) : 0;
            
        if (passRate >= 95) results.summary.overallGrade = 'A+';
        else if (passRate >= 90) results.summary.overallGrade = 'A';
        else if (passRate >= 85) results.summary.overallGrade = 'B+';
        else if (passRate >= 80) results.summary.overallGrade = 'B';
        else if (passRate >= 75) results.summary.overallGrade = 'C+';
        else if (passRate >= 70) results.summary.overallGrade = 'C';
        else if (passRate >= 60) results.summary.overallGrade = 'D';
        
        results.summary.passRate = passRate.toFixed(1);

        return results;
    }

    /**
     * Generate performance recommendations
     */
    generateRecommendations(auditResults) {
        const recommendations = [];

        // Rendering performance recommendations
        if (auditResults.rendering && auditResults.rendering.summary.failedTests > 0) {
            recommendations.push({
                category: 'Rendering Performance',
                issue: `${auditResults.rendering.summary.failedTests} elements render slowly`,
                solution: 'Optimize CSS complexity, use CSS containment, and minimize layout thrashing'
            });
        }

        // Animation performance recommendations
        if (auditResults.animation && !auditResults.animation.passes) {
            recommendations.push({
                category: 'Animation Performance',
                issue: `Animation FPS: ${auditResults.animation.averageFPS.toFixed(1)} (target: 60fps)`,
                solution: 'Use GPU-accelerated properties (transform, opacity), avoid animating layout properties'
            });
        }

        // Memory usage recommendations
        if (auditResults.memory && !auditResults.memory.passes) {
            recommendations.push({
                category: 'Memory Usage',
                issue: `Memory growth: ${auditResults.memory.memoryGrowth.toFixed(1)}MB`,
                solution: 'Optimize DOM element creation/destruction, check for memory leaks'
            });
        }

        // CSS loading recommendations
        if (auditResults.cssLoading && !auditResults.cssLoading.passes) {
            recommendations.push({
                category: 'CSS Loading',
                issue: `CSS size: ${auditResults.cssLoading.totalSizeKB}KB, load time: ${auditResults.cssLoading.loadTime.toFixed(1)}ms`,
                solution: 'Minify CSS, use critical CSS inlining, consider CSS splitting'
            });
        }

        return recommendations;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceTester;
} else {
    window.PerformanceTester = PerformanceTester;
}