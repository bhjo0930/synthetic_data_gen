/**
 * Neo-Brutalism Browser Compatibility Validation
 * Comprehensive testing for cross-browser compatibility
 */

const BrowserCompatibilityValidator = {
  // Browser detection
  detectBrowser: function() {
    const userAgent = navigator.userAgent;
    const browsers = {
      chrome: /Chrome\/(\d+)/.test(userAgent),
      firefox: /Firefox\/(\d+)/.test(userAgent),
      safari: /Safari\/(\d+)/.test(userAgent) && !/Chrome/.test(userAgent),
      edge: /Edge\/(\d+)/.test(userAgent) || /Edg\/(\d+)/.test(userAgent),
      ie: /MSIE (\d+)/.test(userAgent) || /Trident\//.test(userAgent)
    };
    
    const versions = {
      chrome: userAgent.match(/Chrome\/(\d+)/)?.[1],
      firefox: userAgent.match(/Firefox\/(\d+)/)?.[1],
      safari: userAgent.match(/Version\/(\d+)/)?.[1],
      edge: userAgent.match(/(?:Edge|Edg)\/(\d+)/)?.[1],
      ie: userAgent.match(/(?:MSIE |rv:)(\d+)/)?.[1]
    };
    
    return { browsers, versions };
  },

  // CSS Feature Support Matrix
  testCSSFeatures: function() {
    const features = {
      // Layout Features
      'CSS Grid': {
        test: () => CSS.supports('display', 'grid'),
        fallback: 'Flexbox layout',
        critical: true
      },
      'CSS Flexbox': {
        test: () => CSS.supports('display', 'flex'),
        fallback: 'Float-based layout',
        critical: true
      },
      'CSS Subgrid': {
        test: () => CSS.supports('grid-template-rows', 'subgrid'),
        fallback: 'Regular grid',
        critical: false
      },
      
      // Visual Features
      'CSS Custom Properties': {
        test: () => CSS.supports('color', 'var(--test)'),
        fallback: 'Static color values',
        critical: true
      },
      'CSS Transforms': {
        test: () => CSS.supports('transform', 'rotate(1deg)'),
        fallback: 'No rotation effects',
        critical: false
      },
      'CSS Box Shadow': {
        test: () => CSS.supports('box-shadow', '4px 4px 0px #000000'),
        fallback: 'Thicker borders',
        critical: false
      },
      'CSS Filters': {
        test: () => CSS.supports('filter', 'blur(1px)'),
        fallback: 'No filter effects',
        critical: false
      },
      
      // Performance Features
      'CSS Containment': {
        test: () => CSS.supports('contain', 'layout'),
        fallback: 'No containment optimization',
        critical: false
      },
      'CSS will-change': {
        test: () => CSS.supports('will-change', 'transform'),
        fallback: 'No animation optimization hints',
        critical: false
      },
      'CSS content-visibility': {
        test: () => CSS.supports('content-visibility', 'auto'),
        fallback: 'No lazy rendering',
        critical: false
      },
      
      // Accessibility Features
      'CSS prefers-reduced-motion': {
        test: () => window.matchMedia('(prefers-reduced-motion)').media !== 'not all',
        fallback: 'No motion preference detection',
        critical: true
      },
      'CSS prefers-contrast': {
        test: () => window.matchMedia('(prefers-contrast)').media !== 'not all',
        fallback: 'No contrast preference detection',
        critical: false
      },
      'CSS prefers-color-scheme': {
        test: () => window.matchMedia('(prefers-color-scheme)').media !== 'not all',
        fallback: 'No dark mode detection',
        critical: false
      }
    };
    
    const results = {};
    Object.keys(features).forEach(feature => {
      const featureTest = features[feature];
      results[feature] = {
        supported: featureTest.test(),
        fallback: featureTest.fallback,
        critical: featureTest.critical
      };
    });
    
    return results;
  },

  // JavaScript API Support
  testJavaScriptAPIs: function() {
    const apis = {
      // Performance APIs
      'Performance API': {
        test: () => typeof performance !== 'undefined' && typeof performance.now === 'function',
        fallback: 'Date.now() for timing',
        critical: false
      },
      'Performance Observer': {
        test: () => typeof PerformanceObserver !== 'undefined',
        fallback: 'Manual performance monitoring',
        critical: false
      },
      'Performance Memory': {
        test: () => typeof performance.memory !== 'undefined',
        fallback: 'No memory monitoring',
        critical: false
      },
      
      // Animation APIs
      'RequestAnimationFrame': {
        test: () => typeof requestAnimationFrame !== 'undefined',
        fallback: 'setTimeout for animations',
        critical: true
      },
      'Web Animations API': {
        test: () => typeof Element.prototype.animate !== 'undefined',
        fallback: 'CSS animations only',
        critical: false
      },
      
      // Observer APIs
      'Intersection Observer': {
        test: () => typeof IntersectionObserver !== 'undefined',
        fallback: 'Scroll event listeners',
        critical: false
      },
      'Resize Observer': {
        test: () => typeof ResizeObserver !== 'undefined',
        fallback: 'Window resize events',
        critical: false
      },
      'Mutation Observer': {
        test: () => typeof MutationObserver !== 'undefined',
        fallback: 'Manual DOM monitoring',
        critical: false
      },
      
      // Font APIs
      'Font Loading API': {
        test: () => typeof document.fonts !== 'undefined',
        fallback: 'Font load events',
        critical: false
      },
      
      // CSS Object Model
      'CSS Object Model': {
        test: () => typeof CSS !== 'undefined' && typeof CSS.supports === 'function',
        fallback: 'Feature detection via try/catch',
        critical: true
      },
      
      // Network APIs
      'Network Information API': {
        test: () => typeof navigator.connection !== 'undefined',
        fallback: 'No connection quality detection',
        critical: false
      }
    };
    
    const results = {};
    Object.keys(apis).forEach(api => {
      const apiTest = apis[api];
      results[api] = {
        supported: apiTest.test(),
        fallback: apiTest.fallback,
        critical: apiTest.critical
      };
    });
    
    return results;
  },

  // Test specific browser quirks and fixes
  testBrowserQuirks: function() {
    const { browsers } = this.detectBrowser();
    const quirks = [];
    
    // Internet Explorer quirks
    if (browsers.ie) {
      quirks.push({
        browser: 'Internet Explorer',
        issue: 'No CSS Grid support',
        fix: 'Use flexbox fallback layout',
        severity: 'high'
      });
      
      quirks.push({
        browser: 'Internet Explorer',
        issue: 'No CSS Custom Properties',
        fix: 'Use static color values',
        severity: 'high'
      });
      
      quirks.push({
        browser: 'Internet Explorer',
        issue: 'Limited CSS3 support',
        fix: 'Simplified styling',
        severity: 'medium'
      });
    }
    
    // Safari quirks
    if (browsers.safari) {
      quirks.push({
        browser: 'Safari',
        issue: 'Different font rendering',
        fix: 'Use -webkit-font-smoothing',
        severity: 'low'
      });
      
      quirks.push({
        browser: 'Safari',
        issue: 'Form element styling limitations',
        fix: 'Use -webkit-appearance: none',
        severity: 'medium'
      });
    }
    
    // Firefox quirks
    if (browsers.firefox) {
      quirks.push({
        browser: 'Firefox',
        issue: 'Different box model calculations',
        fix: 'Use box-sizing: border-box',
        severity: 'low'
      });
      
      quirks.push({
        browser: 'Firefox',
        issue: 'Form element styling',
        fix: 'Use -moz-appearance: none',
        severity: 'medium'
      });
    }
    
    // Chrome quirks
    if (browsers.chrome) {
      quirks.push({
        browser: 'Chrome',
        issue: 'Aggressive font smoothing',
        fix: 'Use -webkit-font-smoothing: antialiased',
        severity: 'low'
      });
    }
    
    return quirks;
  },

  // Test responsive design compatibility
  testResponsiveCompatibility: function() {
    const tests = {
      'Viewport Meta Tag': {
        test: () => {
          const viewport = document.querySelector('meta[name="viewport"]');
          return viewport && viewport.content.includes('width=device-width');
        },
        fix: 'Add proper viewport meta tag'
      },
      
      'Media Query Support': {
        test: () => window.matchMedia('(min-width: 768px)').media !== 'not all',
        fix: 'Use JavaScript for responsive behavior'
      },
      
      'Touch Event Support': {
        test: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        fix: 'Provide mouse-only interaction fallback'
      },
      
      'High DPI Support': {
        test: () => window.devicePixelRatio > 1,
        fix: 'Provide standard resolution assets'
      }
    };
    
    const results = {};
    Object.keys(tests).forEach(test => {
      const testCase = tests[test];
      results[test] = {
        supported: testCase.test(),
        fix: testCase.fix
      };
    });
    
    return results;
  },

  // Test accessibility compatibility
  testAccessibilityCompatibility: function() {
    const tests = {
      'Screen Reader Support': {
        test: () => {
          // Check for common screen reader indicators
          return navigator.userAgent.includes('NVDA') || 
                 navigator.userAgent.includes('JAWS') || 
                 window.speechSynthesis !== undefined;
        },
        fix: 'Ensure proper semantic markup'
      },
      
      'Keyboard Navigation': {
        test: () => {
          // Test if focus is visible
          const testElement = document.createElement('button');
          testElement.style.position = 'absolute';
          testElement.style.left = '-9999px';
          document.body.appendChild(testElement);
          testElement.focus();
          const hasFocus = document.activeElement === testElement;
          document.body.removeChild(testElement);
          return hasFocus;
        },
        fix: 'Implement proper focus management'
      },
      
      'High Contrast Mode': {
        test: () => window.matchMedia('(prefers-contrast: high)').matches,
        fix: 'Provide high contrast styles'
      },
      
      'Reduced Motion': {
        test: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        fix: 'Disable animations when requested'
      }
    };
    
    const results = {};
    Object.keys(tests).forEach(test => {
      const testCase = tests[test];
      results[test] = {
        supported: testCase.test(),
        fix: testCase.fix
      };
    });
    
    return results;
  },

  // Generate compatibility report
  generateCompatibilityReport: function() {
    const browserInfo = this.detectBrowser();
    const cssFeatures = this.testCSSFeatures();
    const jsAPIs = this.testJavaScriptAPIs();
    const quirks = this.testBrowserQuirks();
    const responsive = this.testResponsiveCompatibility();
    const accessibility = this.testAccessibilityCompatibility();
    
    // Calculate compatibility score
    const allFeatures = { ...cssFeatures, ...jsAPIs };
    const supportedFeatures = Object.keys(allFeatures).filter(feature => allFeatures[feature].supported);
    const criticalFeatures = Object.keys(allFeatures).filter(feature => allFeatures[feature].critical);
    const supportedCritical = criticalFeatures.filter(feature => allFeatures[feature].supported);
    
    const compatibilityScore = (supportedFeatures.length / Object.keys(allFeatures).length) * 100;
    const criticalScore = (supportedCritical.length / criticalFeatures.length) * 100;
    
    return {
      browserInfo,
      compatibilityScore: Math.round(compatibilityScore),
      criticalScore: Math.round(criticalScore),
      cssFeatures,
      jsAPIs,
      quirks,
      responsive,
      accessibility,
      recommendations: this.generateRecommendations(cssFeatures, jsAPIs, quirks)
    };
  },

  // Generate recommendations based on test results
  generateRecommendations: function(cssFeatures, jsAPIs, quirks) {
    const recommendations = [];
    
    // Check for critical missing features
    Object.keys(cssFeatures).forEach(feature => {
      const featureData = cssFeatures[feature];
      if (featureData.critical && !featureData.supported) {
        recommendations.push({
          type: 'critical',
          feature: feature,
          message: `${feature} is not supported. Use fallback: ${featureData.fallback}`
        });
      }
    });
    
    Object.keys(jsAPIs).forEach(api => {
      const apiData = jsAPIs[api];
      if (apiData.critical && !apiData.supported) {
        recommendations.push({
          type: 'critical',
          feature: api,
          message: `${api} is not supported. Use fallback: ${apiData.fallback}`
        });
      }
    });
    
    // Add quirk-specific recommendations
    quirks.forEach(quirk => {
      if (quirk.severity === 'high') {
        recommendations.push({
          type: 'warning',
          feature: quirk.browser,
          message: `${quirk.issue}. Fix: ${quirk.fix}`
        });
      }
    });
    
    return recommendations;
  },

  // Run all compatibility tests
  runAllTests: function() {
    console.log('🔍 Running Comprehensive Browser Compatibility Tests...\n');
    
    const report = this.generateCompatibilityReport();
    
    console.log('🌐 Browser Information:');
    console.log(`User Agent: ${navigator.userAgent}`);
    console.log(`Detected Browsers:`, report.browserInfo.browsers);
    console.log(`Browser Versions:`, report.browserInfo.versions);
    console.log('');
    
    console.log('📊 Compatibility Scores:');
    console.log(`Overall Compatibility: ${report.compatibilityScore}%`);
    console.log(`Critical Features: ${report.criticalScore}%`);
    console.log('');
    
    console.log('🎨 CSS Feature Support:');
    Object.keys(report.cssFeatures).forEach(feature => {
      const status = report.cssFeatures[feature].supported ? '✅' : '❌';
      const critical = report.cssFeatures[feature].critical ? ' (Critical)' : '';
      console.log(`${status} ${feature}${critical}`);
    });
    console.log('');
    
    console.log('⚡ JavaScript API Support:');
    Object.keys(report.jsAPIs).forEach(api => {
      const status = report.jsAPIs[api].supported ? '✅' : '❌';
      const critical = report.jsAPIs[api].critical ? ' (Critical)' : '';
      console.log(`${status} ${api}${critical}`);
    });
    console.log('');
    
    if (report.quirks.length > 0) {
      console.log('⚠️  Browser-Specific Quirks:');
      report.quirks.forEach(quirk => {
        console.log(`${quirk.browser}: ${quirk.issue} (${quirk.severity})`);
        console.log(`  Fix: ${quirk.fix}`);
      });
      console.log('');
    }
    
    console.log('📱 Responsive Design:');
    Object.keys(report.responsive).forEach(test => {
      const status = report.responsive[test].supported ? '✅' : '❌';
      console.log(`${status} ${test}`);
    });
    console.log('');
    
    console.log('♿ Accessibility:');
    Object.keys(report.accessibility).forEach(test => {
      const status = report.accessibility[test].supported ? '✅' : '❌';
      console.log(`${status} ${test}`);
    });
    console.log('');
    
    if (report.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      report.recommendations.forEach(rec => {
        const icon = rec.type === 'critical' ? '🚨' : '⚠️';
        console.log(`${icon} ${rec.message}`);
      });
      console.log('');
    }
    
    const overallStatus = report.criticalScore >= 90 ? 'EXCELLENT' : 
                         report.criticalScore >= 75 ? 'GOOD' : 
                         report.criticalScore >= 50 ? 'FAIR' : 'POOR';
    
    console.log(`🎯 Overall Compatibility: ${overallStatus}`);
    
    return report;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrowserCompatibilityValidator;
}

// Global access
window.BrowserCompatibilityValidator = BrowserCompatibilityValidator;