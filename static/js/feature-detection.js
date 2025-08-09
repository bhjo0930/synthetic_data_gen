/**
 * Neo-Brutalism Feature Detection and Progressive Enhancement
 * Detects browser capabilities and applies appropriate fallbacks
 */

(function() {
  'use strict';

  // Feature detection object
  const FeatureDetection = {
    // Test for CSS Grid support
    supportsGrid: function() {
      return CSS.supports('display', 'grid');
    },

    // Test for CSS Custom Properties support
    supportsCustomProperties: function() {
      return CSS.supports('color', 'var(--test)');
    },

    // Test for CSS Transforms support
    supportsTransforms: function() {
      return CSS.supports('transform', 'rotate(1deg)');
    },

    // Test for CSS Box Shadow support
    supportsBoxShadow: function() {
      return CSS.supports('box-shadow', '4px 4px 0px #000000');
    },

    // Test for Flexbox support
    supportsFlexbox: function() {
      return CSS.supports('display', 'flex');
    },

    // Test for CSS Containment support
    supportsContainment: function() {
      return CSS.supports('contain', 'layout');
    },

    // Test for will-change support
    supportsWillChange: function() {
      return CSS.supports('will-change', 'transform');
    },

    // Test for content-visibility support
    supportsContentVisibility: function() {
      return CSS.supports('content-visibility', 'auto');
    },

    // Detect if user prefers reduced motion
    prefersReducedMotion: function() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // Detect if user prefers high contrast
    prefersHighContrast: function() {
      return window.matchMedia('(prefers-contrast: high)').matches;
    },

    // Detect if user prefers dark mode
    prefersDarkMode: function() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    },

    // Detect touch device
    isTouchDevice: function() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    // Detect mobile device
    isMobile: function() {
      return window.innerWidth <= 768;
    },

    // Detect slow connection
    isSlowConnection: function() {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
      }
      return false;
    }
  };

  // Progressive Enhancement Manager
  const ProgressiveEnhancement = {
    init: function() {
      this.detectFeatures();
      this.applyFallbacks();
      this.optimizePerformance();
      this.setupAccessibility();
    },

    detectFeatures: function() {
      const html = document.documentElement;
      
      // Add feature classes to HTML element
      if (!FeatureDetection.supportsGrid()) {
        html.classList.add('no-grid');
      }
      
      if (!FeatureDetection.supportsCustomProperties()) {
        html.classList.add('no-custom-properties');
      }
      
      if (!FeatureDetection.supportsTransforms()) {
        html.classList.add('no-transforms');
      }
      
      if (!FeatureDetection.supportsBoxShadow()) {
        html.classList.add('no-box-shadow');
      }
      
      if (!FeatureDetection.supportsFlexbox()) {
        html.classList.add('no-flexbox');
      }
      
      if (FeatureDetection.isTouchDevice()) {
        html.classList.add('touch-device');
      }
      
      if (FeatureDetection.isMobile()) {
        html.classList.add('mobile-device');
      }
      
      if (FeatureDetection.isSlowConnection()) {
        html.classList.add('slow-connection');
      }
    },

    applyFallbacks: function() {
      // Grid fallback
      if (!FeatureDetection.supportsGrid()) {
        this.applyGridFallback();
      }

      // Custom properties fallback
      if (!FeatureDetection.supportsCustomProperties()) {
        this.applyCustomPropertiesFallback();
      }

      // Transform fallback
      if (!FeatureDetection.supportsTransforms()) {
        this.applyTransformFallback();
      }

      // Box shadow fallback
      if (!FeatureDetection.supportsBoxShadow()) {
        this.applyBoxShadowFallback();
      }
    },

    applyGridFallback: function() {
      const gridElements = document.querySelectorAll('.neo-main, .neo-form-grid, .persona-grid');
      gridElements.forEach(element => {
        element.classList.add('fallback-layout');
      });
    },

    applyCustomPropertiesFallback: function() {
      // Apply inline styles for browsers without custom property support
      const style = document.createElement('style');
      style.textContent = `
        .neo-title {
          font-family: 'Arial Black', 'Helvetica Bold', 'Impact', sans-serif;
          background: #FFFFFF;
          color: #000000;
          border: 4px solid #000000;
          box-shadow: 8px 8px 0px #000000;
          padding: 24px;
        }
        .neo-button {
          background: #FF0000;
          color: #000000;
          border: 4px solid #000000;
          box-shadow: 4px 4px 0px #000000;
          font-family: 'Arial Black', 'Helvetica Bold', 'Impact', sans-serif;
          padding: 12px 24px;
        }
        .neo-card {
          background: #FFFFFF;
          border: 4px solid #000000;
          box-shadow: 4px 4px 0px #000000;
          padding: 24px;
        }
      `;
      document.head.appendChild(style);
    },

    applyTransformFallback: function() {
      const transformElements = document.querySelectorAll('.neo-title, .neo-card--generate, .neo-card--management, .persona-card');
      transformElements.forEach(element => {
        element.style.transform = 'none';
      });
    },

    applyBoxShadowFallback: function() {
      const shadowElements = document.querySelectorAll('.neo-title, .neo-button, .neo-card, .neo-input, .neo-nav a');
      shadowElements.forEach(element => {
        element.style.borderWidth = '6px';
        element.style.boxShadow = 'none';
      });
    },

    optimizePerformance: function() {
      // Optimize for slow connections
      if (FeatureDetection.isSlowConnection()) {
        this.optimizeForSlowConnection();
      }

      // Optimize for mobile
      if (FeatureDetection.isMobile()) {
        this.optimizeForMobile();
      }

      // Optimize for reduced motion
      if (FeatureDetection.prefersReducedMotion()) {
        this.optimizeForReducedMotion();
      }

      // Add performance optimizations
      this.addPerformanceOptimizations();
    },

    optimizeForSlowConnection: function() {
      // Remove decorative elements
      const decorativeElements = document.querySelectorAll('.neo-title::before, .neo-title::after, .neo-card::before, .persona-card::before');
      decorativeElements.forEach(element => {
        element.style.display = 'none';
      });

      // Simplify shadows
      const shadowElements = document.querySelectorAll('.neo-title, .neo-button, .neo-card');
      shadowElements.forEach(element => {
        element.style.boxShadow = '2px 2px 0px #000000';
      });
    },

    optimizeForMobile: function() {
      // Remove transforms on mobile for better performance
      const transformElements = document.querySelectorAll('.neo-title, .neo-card--generate, .neo-card--management, .persona-card');
      transformElements.forEach(element => {
        element.style.transform = 'none';
      });

      // Simplify shadows on mobile
      const shadowElements = document.querySelectorAll('.neo-title, .neo-button, .neo-card');
      shadowElements.forEach(element => {
        element.style.boxShadow = '2px 2px 0px #000000';
      });
    },

    optimizeForReducedMotion: function() {
      // Disable all animations and transitions
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
        .neo-loading {
          animation: none !important;
        }
      `;
      document.head.appendChild(style);
    },

    addPerformanceOptimizations: function() {
      // Add will-change properties for better performance
      if (FeatureDetection.supportsWillChange()) {
        const optimizedElements = document.querySelectorAll('.neo-title, .neo-button, .neo-card--generate, .neo-card--management, .persona-card');
        optimizedElements.forEach(element => {
          if (element.classList.contains('neo-title')) {
            element.style.willChange = 'transform';
          } else if (element.classList.contains('neo-button')) {
            element.style.willChange = 'transform, box-shadow, background-color, color';
          } else {
            element.style.willChange = 'transform';
          }
        });
      }

      // Add containment for better performance
      if (FeatureDetection.supportsContainment()) {
        const containedElements = document.querySelectorAll('.neo-main, .neo-form-grid, .persona-grid');
        containedElements.forEach(element => {
          element.style.contain = 'layout';
        });
      }

      // Add content-visibility for better performance
      if (FeatureDetection.supportsContentVisibility()) {
        const lazyElements = document.querySelectorAll('.persona-card, .neo-result-box');
        lazyElements.forEach(element => {
          element.style.contentVisibility = 'auto';
          element.style.containIntrinsicSize = '0 200px';
        });
      }
    },

    setupAccessibility: function() {
      // High contrast support
      if (FeatureDetection.prefersHighContrast()) {
        const style = document.createElement('style');
        style.textContent = `
          .neo-title, .neo-button, .neo-card, .neo-input, .neo-nav a {
            border-width: 6px !important;
          }
        `;
        document.head.appendChild(style);
      }

      // Touch device optimizations
      if (FeatureDetection.isTouchDevice()) {
        const touchElements = document.querySelectorAll('.neo-button, .neo-nav a');
        touchElements.forEach(element => {
          element.style.minHeight = '44px';
          element.style.minWidth = '44px';
        });
      }

      // Focus management
      this.setupFocusManagement();
    },

    setupFocusManagement: function() {
      // Add visible focus indicators
      const focusableElements = document.querySelectorAll('.neo-button, .neo-nav a, .neo-input, .neo-select');
      focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
          this.style.outline = '4px solid #0000FF';
          this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
          this.style.outline = '';
          this.style.outlineOffset = '';
        });
      });
    }
  };

  // Font Loading Optimization
  const FontOptimization = {
    init: function() {
      this.preloadFonts();
      this.setupFontDisplay();
    },

    preloadFonts: function() {
      // Create font preload links
      const fonts = [
        'Arial Black',
        'Helvetica Bold',
        'Impact'
      ];

      fonts.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = `data:font/woff2;base64,`; // Placeholder for actual font data
        document.head.appendChild(link);
      });
    },

    setupFontDisplay: function() {
      // Add font-display: swap for better performance
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'Neo-Brutalism-Primary';
          src: local('Arial Black'), local('ArialBlack'), local('Arial-Black');
          font-display: swap;
          font-weight: 900;
          font-style: normal;
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Initialize everything when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      ProgressiveEnhancement.init();
      FontOptimization.init();
    });
  } else {
    ProgressiveEnhancement.init();
    FontOptimization.init();
  }

  // Export for testing purposes
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      FeatureDetection,
      ProgressiveEnhancement,
      FontOptimization
    };
  }

  // Global object for manual access
  window.NeoBrutalismOptimization = {
    FeatureDetection,
    ProgressiveEnhancement,
    FontOptimization
  };

})();