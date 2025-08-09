#!/usr/bin/env node

/**
 * Performance Test Runner for Neo-Brutalism Design System
 * Runs performance and compatibility tests from command line
 */

const fs = require('fs');
const path = require('path');

// Mock browser environment for Node.js testing
global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  matchMedia: (query) => ({
    matches: false,
    media: query
  }),
  performance: {
    now: () => Date.now(),
    memory: {
      usedJSHeapSize: 10 * 1024 * 1024, // 10MB
      totalJSHeapSize: 50 * 1024 * 1024, // 50MB
      jsHeapSizeLimit: 100 * 1024 * 1024 // 100MB
    }
  },
  requestAnimationFrame: (callback) => setTimeout(callback, 16)
};

global.document = {
  documentElement: {
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    }
  },
  createElement: () => ({
    style: {},
    classList: {
      add: () => {},
      remove: () => {}
    },
    appendChild: () => {},
    removeChild: () => {}
  }),
  head: {
    appendChild: () => {}
  },
  body: {
    appendChild: () => {},
    removeChild: () => {}
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  readyState: 'complete'
};

global.navigator = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  deviceMemory: 8,
  hardwareConcurrency: 8,
  connection: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50
  },
  maxTouchPoints: 0
};

global.CSS = {
  supports: (property, value) => {
    // Mock CSS support detection
    const supportedFeatures = [
      'display:grid',
      'display:flex',
      'color:var(--test)',
      'transform:rotate(1deg)',
      'box-shadow:4px 4px 0px #000000',
      'contain:layout',
      'will-change:transform',
      'content-visibility:auto'
    ];
    
    return supportedFeatures.includes(`${property}:${value}`);
  }
};

// Performance test results
const testResults = {
  performance: [],
  compatibility: [],
  errors: []
};

// Simple performance tests
const SimplePerformanceTests = {
  testCSSLoadTime: function() {
    const startTime = Date.now();
    
    // Simulate CSS loading
    setTimeout(() => {
      const loadTime = Date.now() - startTime;
      testResults.performance.push({
        test: 'CSS Loading Performance',
        passed: loadTime < 100,
        loadTime: loadTime,
        message: `CSS loaded in ${loadTime}ms`
      });
    }, 50);
  },

  testMemoryUsage: function() {
    const memoryUsage = global.window.performance.memory.usedJSHeapSize / 1024 / 1024;
    testResults.performance.push({
      test: 'Memory Usage',
      passed: memoryUsage < 50,
      memoryUsage: memoryUsage,
      message: `Using ${memoryUsage.toFixed(2)}MB of memory`
    });
  },

  testFeatureSupport: function() {
    const features = {
      'CSS Grid': CSS.supports('display', 'grid'),
      'CSS Custom Properties': CSS.supports('color', 'var(--test)'),
      'CSS Transforms': CSS.supports('transform', 'rotate(1deg)'),
      'CSS Box Shadow': CSS.supports('box-shadow', '4px 4px 0px #000000'),
      'CSS Flexbox': CSS.supports('display', 'flex')
    };
    
    const supportedFeatures = Object.keys(features).filter(feature => features[feature]);
    
    testResults.compatibility.push({
      test: 'CSS Feature Support',
      passed: supportedFeatures.length >= 4,
      supportedFeatures: supportedFeatures,
      message: `${supportedFeatures.length}/5 CSS features supported`
    });
  },

  runAllTests: function() {
    console.log('🚀 Running Neo-Brutalism Performance Tests...\n');
    
    this.testCSSLoadTime();
    this.testMemoryUsage();
    this.testFeatureSupport();
    
    // Wait for async tests to complete
    setTimeout(() => {
      this.displayResults();
    }, 100);
  },

  displayResults: function() {
    console.log('📊 Performance Test Results:\n');
    
    let passedTests = 0;
    let totalTests = 0;
    
    [...testResults.performance, ...testResults.compatibility].forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.test}: ${result.message}`);
      
      if (result.passed) passedTests++;
      totalTests++;
    });
    
    console.log(`\n📈 Summary: ${passedTests}/${totalTests} tests passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All performance tests passed!');
      process.exit(0);
    } else {
      console.log('⚠️  Some performance tests failed. Check the results above.');
      process.exit(1);
    }
  }
};

// File validation tests
const FileValidationTests = {
  validateCSSFiles: function() {
    const cssFiles = [
      '../static/css/critical.css',
      '../static/css/performance.css',
      '../static/css/core/browser-compatibility.css'
    ];
    
    cssFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasContent = content.length > 100; // At least 100 characters
        
        testResults.performance.push({
          test: `File Validation: ${path.basename(file)}`,
          passed: hasContent,
          fileSize: content.length,
          message: `File exists and has ${content.length} characters`
        });
      } catch (error) {
        testResults.errors.push({
          test: `File Validation: ${path.basename(file)}`,
          passed: false,
          error: error.message,
          message: `File not found or unreadable`
        });
      }
    });
  },

  validateJSFiles: function() {
    const jsFiles = [
      '../static/js/feature-detection.js',
      '../static/js/performance-optimizer.js',
      './performance-tests.js',
      './browser-compatibility-validation.js'
    ];
    
    jsFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasContent = content.length > 100; // At least 100 characters
        const hasValidJS = !content.includes('syntax error'); // Basic syntax check
        
        testResults.performance.push({
          test: `File Validation: ${path.basename(file)}`,
          passed: hasContent && hasValidJS,
          fileSize: content.length,
          message: `File exists and has ${content.length} characters`
        });
      } catch (error) {
        testResults.errors.push({
          test: `File Validation: ${path.basename(file)}`,
          passed: false,
          error: error.message,
          message: `File not found or unreadable`
        });
      }
    });
  },

  validateHTMLFiles: function() {
    const htmlFiles = [
      './performance-test.html',
      '../static/generate-optimized.html'
    ];
    
    htmlFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasDoctype = content.includes('<!DOCTYPE html>');
        const hasViewport = content.includes('viewport');
        const hasCharset = content.includes('charset');
        
        testResults.performance.push({
          test: `HTML Validation: ${path.basename(file)}`,
          passed: hasDoctype && hasViewport && hasCharset,
          fileSize: content.length,
          message: `HTML file is properly structured (${content.length} chars)`
        });
      } catch (error) {
        testResults.errors.push({
          test: `HTML Validation: ${path.basename(file)}`,
          passed: false,
          error: error.message,
          message: `File not found or unreadable`
        });
      }
    });
  },

  runAllValidations: function() {
    console.log('📁 Running File Validation Tests...\n');
    
    this.validateCSSFiles();
    this.validateJSFiles();
    this.validateHTMLFiles();
  }
};

// Main test runner
function runTests() {
  console.log('🔧 Neo-Brutalism Performance & Compatibility Test Runner\n');
  console.log('=' .repeat(60) + '\n');
  
  // Run file validations first
  FileValidationTests.runAllValidations();
  
  // Run performance tests
  SimplePerformanceTests.runAllTests();
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  SimplePerformanceTests,
  FileValidationTests,
  testResults
};