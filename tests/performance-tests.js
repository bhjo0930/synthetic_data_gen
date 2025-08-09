/**
 * Neo-Brutalism Performance Tests
 * Tests for performance optimizations and browser compatibility
 */

// Performance Testing Suite
const PerformanceTests = {
  // Test CSS loading performance
  testCSSLoadingPerformance: function() {
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'css/neo-brutalism.css';
      
      link.onload = function() {
        const loadTime = performance.now() - startTime;
        resolve({
          test: 'CSS Loading Performance',
          passed: loadTime < 100, // Should load in under 100ms
          loadTime: loadTime,
          message: `CSS loaded in ${loadTime.toFixed(2)}ms`
        });
      };
      
      link.onerror = function() {
        resolve({
          test: 'CSS Loading Performance',
          passed: false,
          loadTime: null,
          message: 'CSS failed to load'
        });
      };
      
      document.head.appendChild(link);
    });
  },

  // Test critical CSS rendering
  testCriticalCSSRendering: function() {
    const startTime = performance.now();
    
    // Create a test element with critical styles
    const testElement = document.createElement('div');
    testElement.className = 'neo-title';
    testElement.textContent = 'Test Title';
    testElement.style.visibility = 'hidden';
    document.body.appendChild(testElement);
    
    // Force reflow
    const height = testElement.offsetHeight;
    const renderTime = performance.now() - startTime;
    
    document.body.removeChild(testElement);
    
    return {
      test: 'Critical CSS Rendering',
      passed: renderTime < 16, // Should render in under 16ms (60fps)
      renderTime: renderTime,
      message: `Critical CSS rendered in ${renderTime.toFixed(2)}ms`
    };
  },

  // Test font loading performance
  testFontLoadingPerformance: function() {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          const loadTime = performance.now() - startTime;
          resolve({
            test: 'Font Loading Performance',
            passed: loadTime < 1000, // Should load in under 1 second
            loadTime: loadTime,
            message: `Fonts loaded in ${loadTime.toFixed(2)}ms`
          });
        });
      } else {
        // Fallback for browsers without Font Loading API
        setTimeout(() => {
          const loadTime = performance.now() - startTime;
          resolve({
            test: 'Font Loading Performance',
            passed: true, // Assume success for older browsers
            loadTime: loadTime,
            message: `Font loading test completed in ${loadTime.toFixed(2)}ms (fallback)`
          });
        }, 100);
      }
    });
  },

  // Test animation performance
  testAnimationPerformance: function() {
    return new Promise((resolve) => {
      const testElement = document.createElement('div');
      testElement.className = 'neo-button';
      testElement.textContent = 'Test Button';
      testElement.style.position = 'absolute';
      testElement.style.top = '-1000px';
      document.body.appendChild(testElement);
      
      let frameCount = 0;
      const startTime = performance.now();
      
      function countFrames() {
        frameCount++;
        if (frameCount < 60) { // Test for 60 frames
          requestAnimationFrame(countFrames);
        } else {
          const duration = performance.now() - startTime;
          const fps = (frameCount / duration) * 1000;
          
          document.body.removeChild(testElement);
          
          resolve({
            test: 'Animation Performance',
            passed: fps >= 55, // Should maintain close to 60fps
            fps: fps,
            message: `Animation running at ${fps.toFixed(2)} FPS`
          });
        }
      }
      
      // Trigger hover state to test animation
      testElement.classList.add('hover');
      requestAnimationFrame(countFrames);
    });
  },

  // Test memory usage
  testMemoryUsage: function() {
    if (performance.memory) {
      const memoryInfo = performance.memory;
      const usedMemory = memoryInfo.usedJSHeapSize / 1024 / 1024; // Convert to MB
      
      return {
        test: 'Memory Usage',
        passed: usedMemory < 50, // Should use less than 50MB
        memoryUsage: usedMemory,
        message: `Using ${usedMemory.toFixed(2)}MB of memory`
      };
    } else {
      return {
        test: 'Memory Usage',
        passed: true,
        memoryUsage: null,
        message: 'Memory API not available'
      };
    }
  },

  // Test layout performance
  testLayoutPerformance: function() {
    const startTime = performance.now();
    
    // Create multiple elements to test layout performance
    const container = document.createElement('div');
    container.className = 'neo-main';
    container.style.position = 'absolute';
    container.style.top = '-2000px';
    
    for (let i = 0; i < 100; i++) {
      const card = document.createElement('div');
      card.className = 'neo-card';
      card.textContent = `Test Card ${i}`;
      container.appendChild(card);
    }
    
    document.body.appendChild(container);
    
    // Force layout
    const height = container.offsetHeight;
    const layoutTime = performance.now() - startTime;
    
    document.body.removeChild(container);
    
    return {
      test: 'Layout Performance',
      passed: layoutTime < 50, // Should layout in under 50ms
      layoutTime: layoutTime,
      message: `Layout completed in ${layoutTime.toFixed(2)}ms`
    };
  },

  // Test paint performance
  testPaintPerformance: function() {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      // Create element with complex styling
      const testElement = document.createElement('div');
      testElement.className = 'neo-card';
      testElement.innerHTML = `
        <h2 class="neo-card__title">Test Card</h2>
        <p>This is a test card with complex styling.</p>
        <button class="neo-button">Test Button</button>
      `;
      testElement.style.position = 'absolute';
      testElement.style.top = '-1000px';
      
      document.body.appendChild(testElement);
      
      // Use requestAnimationFrame to measure paint time
      requestAnimationFrame(() => {
        const paintTime = performance.now() - startTime;
        document.body.removeChild(testElement);
        
        resolve({
          test: 'Paint Performance',
          passed: paintTime < 16, // Should paint in under 16ms
          paintTime: paintTime,
          message: `Paint completed in ${paintTime.toFixed(2)}ms`
        });
      });
    });
  },

  // Test resource loading
  testResourceLoading: function() {
    const resources = performance.getEntriesByType('resource');
    const cssResources = resources.filter(resource => resource.name.includes('.css'));
    
    let totalLoadTime = 0;
    let maxLoadTime = 0;
    
    cssResources.forEach(resource => {
      const loadTime = resource.responseEnd - resource.requestStart;
      totalLoadTime += loadTime;
      maxLoadTime = Math.max(maxLoadTime, loadTime);
    });
    
    const avgLoadTime = cssResources.length > 0 ? totalLoadTime / cssResources.length : 0;
    
    return {
      test: 'Resource Loading',
      passed: maxLoadTime < 500 && avgLoadTime < 200, // Max 500ms, avg 200ms
      avgLoadTime: avgLoadTime,
      maxLoadTime: maxLoadTime,
      resourceCount: cssResources.length,
      message: `${cssResources.length} CSS resources, avg: ${avgLoadTime.toFixed(2)}ms, max: ${maxLoadTime.toFixed(2)}ms`
    };
  },

  // Run all performance tests
  runAllTests: async function() {
    console.log('🚀 Running Neo-Brutalism Performance Tests...\n');
    
    const results = [];
    
    // Synchronous tests
    results.push(this.testCriticalCSSRendering());
    results.push(this.testMemoryUsage());
    results.push(this.testLayoutPerformance());
    results.push(this.testResourceLoading());
    
    // Asynchronous tests
    try {
      results.push(await this.testCSSLoadingPerformance());
      results.push(await this.testFontLoadingPerformance());
      results.push(await this.testAnimationPerformance());
      results.push(await this.testPaintPerformance());
    } catch (error) {
      console.error('Error running async tests:', error);
    }
    
    // Display results
    this.displayResults(results);
    
    return results;
  },

  // Display test results
  displayResults: function(results) {
    console.log('📊 Performance Test Results:\n');
    
    let passedTests = 0;
    let totalTests = results.length;
    
    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.test}: ${result.message}`);
      
      if (result.passed) passedTests++;
    });
    
    console.log(`\n📈 Summary: ${passedTests}/${totalTests} tests passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All performance tests passed!');
    } else {
      console.log('⚠️  Some performance tests failed. Check the results above.');
    }
  }
};

// Browser Compatibility Tests
const CompatibilityTests = {
  // Test CSS feature support
  testCSSFeatureSupport: function() {
    const features = {
      'CSS Grid': CSS.supports('display', 'grid'),
      'CSS Custom Properties': CSS.supports('color', 'var(--test)'),
      'CSS Transforms': CSS.supports('transform', 'rotate(1deg)'),
      'CSS Box Shadow': CSS.supports('box-shadow', '4px 4px 0px #000000'),
      'CSS Flexbox': CSS.supports('display', 'flex'),
      'CSS Containment': CSS.supports('contain', 'layout'),
      'CSS will-change': CSS.supports('will-change', 'transform'),
      'CSS content-visibility': CSS.supports('content-visibility', 'auto')
    };
    
    const supportedFeatures = Object.keys(features).filter(feature => features[feature]);
    const unsupportedFeatures = Object.keys(features).filter(feature => !features[feature]);
    
    return {
      test: 'CSS Feature Support',
      passed: supportedFeatures.length >= 6, // At least 6 out of 8 features
      supportedFeatures: supportedFeatures,
      unsupportedFeatures: unsupportedFeatures,
      message: `${supportedFeatures.length}/8 CSS features supported`
    };
  },

  // Test JavaScript API support
  testJavaScriptAPISupport: function() {
    const apis = {
      'Performance API': typeof performance !== 'undefined',
      'RequestAnimationFrame': typeof requestAnimationFrame !== 'undefined',
      'Font Loading API': typeof document.fonts !== 'undefined',
      'Intersection Observer': typeof IntersectionObserver !== 'undefined',
      'Resize Observer': typeof ResizeObserver !== 'undefined',
      'Web Animations API': typeof Element.prototype.animate !== 'undefined',
      'CSS Object Model': typeof CSS !== 'undefined',
      'Media Queries API': typeof window.matchMedia !== 'undefined'
    };
    
    const supportedAPIs = Object.keys(apis).filter(api => apis[api]);
    const unsupportedAPIs = Object.keys(apis).filter(api => !apis[api]);
    
    return {
      test: 'JavaScript API Support',
      passed: supportedAPIs.length >= 6, // At least 6 out of 8 APIs
      supportedAPIs: supportedAPIs,
      unsupportedAPIs: unsupportedAPIs,
      message: `${supportedAPIs.length}/8 JavaScript APIs supported`
    };
  },

  // Test accessibility features
  testAccessibilitySupport: function() {
    const mediaQueries = {
      'Reduced Motion': window.matchMedia('(prefers-reduced-motion: reduce)'),
      'High Contrast': window.matchMedia('(prefers-contrast: high)'),
      'Dark Mode': window.matchMedia('(prefers-color-scheme: dark)'),
      'Reduced Data': window.matchMedia('(prefers-reduced-data: reduce)')
    };
    
    const supportedQueries = Object.keys(mediaQueries).filter(query => 
      mediaQueries[query] && typeof mediaQueries[query].matches === 'boolean'
    );
    
    return {
      test: 'Accessibility Support',
      passed: supportedQueries.length >= 3, // At least 3 out of 4 queries
      supportedQueries: supportedQueries,
      message: `${supportedQueries.length}/4 accessibility media queries supported`
    };
  },

  // Test browser-specific features
  testBrowserSpecificFeatures: function() {
    const userAgent = navigator.userAgent;
    const isChrome = userAgent.includes('Chrome');
    const isFirefox = userAgent.includes('Firefox');
    const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
    const isEdge = userAgent.includes('Edge');
    
    const browserFeatures = {
      browser: isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isEdge ? 'Edge' : 'Unknown',
      webkitAppearance: CSS.supports('-webkit-appearance', 'none'),
      mozAppearance: CSS.supports('-moz-appearance', 'none'),
      msFilter: CSS.supports('-ms-filter', 'none')
    };
    
    return {
      test: 'Browser-Specific Features',
      passed: true, // Always pass, just informational
      browserFeatures: browserFeatures,
      message: `Running on ${browserFeatures.browser}`
    };
  },

  // Run all compatibility tests
  runAllTests: function() {
    console.log('🔍 Running Neo-Brutalism Compatibility Tests...\n');
    
    const results = [
      this.testCSSFeatureSupport(),
      this.testJavaScriptAPISupport(),
      this.testAccessibilitySupport(),
      this.testBrowserSpecificFeatures()
    ];
    
    this.displayResults(results);
    
    return results;
  },

  // Display compatibility results
  displayResults: function(results) {
    console.log('🌐 Compatibility Test Results:\n');
    
    let passedTests = 0;
    let totalTests = results.length;
    
    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.test}: ${result.message}`);
      
      if (result.supportedFeatures) {
        console.log(`  Supported: ${result.supportedFeatures.join(', ')}`);
      }
      if (result.unsupportedFeatures && result.unsupportedFeatures.length > 0) {
        console.log(`  Unsupported: ${result.unsupportedFeatures.join(', ')}`);
      }
      
      if (result.passed) passedTests++;
    });
    
    console.log(`\n📊 Summary: ${passedTests}/${totalTests} compatibility tests passed`);
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PerformanceTests,
    CompatibilityTests
  };
}

// Global access
window.NeoBrutalismTests = {
  PerformanceTests,
  CompatibilityTests
};