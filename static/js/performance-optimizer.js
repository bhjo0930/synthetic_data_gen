/**
 * Neo-Brutalism Performance Optimizer
 * Applies runtime performance optimizations based on device capabilities
 */

(function() {
  'use strict';

  const PerformanceOptimizer = {
    // Device capability detection
    deviceCapabilities: {
      // Detect device performance tier
      getPerformanceTier: function() {
        const memory = navigator.deviceMemory || 4; // Default to 4GB
        const cores = navigator.hardwareConcurrency || 4; // Default to 4 cores
        const connection = navigator.connection;
        
        let tier = 'medium';
        
        // High-end device
        if (memory >= 8 && cores >= 8) {
          tier = 'high';
        }
        // Low-end device
        else if (memory <= 2 || cores <= 2) {
          tier = 'low';
        }
        
        // Adjust for slow connection
        if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
          tier = 'low';
        }
        
        return tier;
      },

      // Detect if device is mobile
      isMobile: function() {
        return window.innerWidth <= 768 || 'ontouchstart' in window;
      },

      // Detect if user prefers reduced motion
      prefersReducedMotion: function() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      },

      // Detect if user prefers reduced data
      prefersReducedData: function() {
        return window.matchMedia('(prefers-reduced-data: reduce)').matches;
      },

      // Detect battery status
      getBatteryStatus: function() {
        return new Promise((resolve) => {
          if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
              resolve({
                charging: battery.charging,
                level: battery.level,
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime
              });
            });
          } else {
            resolve(null);
          }
        });
      }
    },

    // Performance optimization strategies
    optimizations: {
      // Apply optimizations based on device tier
      applyTierOptimizations: function(tier) {
        const html = document.documentElement;
        html.classList.add(`performance-tier-${tier}`);
        
        switch (tier) {
          case 'low':
            this.applyLowEndOptimizations();
            break;
          case 'medium':
            this.applyMediumEndOptimizations();
            break;
          case 'high':
            this.applyHighEndOptimizations();
            break;
        }
      },

      // Optimizations for low-end devices
      applyLowEndOptimizations: function() {
        console.log('🔧 Applying low-end device optimizations...');
        
        // Disable expensive visual effects
        this.disableExpensiveEffects();
        
        // Reduce animation complexity
        this.simplifyAnimations();
        
        // Optimize images
        this.optimizeImages();
        
        // Reduce DOM complexity
        this.reduceDOMComplexity();
        
        // Apply CSS optimizations
        this.applyCSSOptimizations('low');
      },

      // Optimizations for medium-end devices
      applyMediumEndOptimizations: function() {
        console.log('🔧 Applying medium-end device optimizations...');
        
        // Selective visual effects
        this.applySelectiveEffects();
        
        // Moderate animation complexity
        this.moderateAnimations();
        
        // Apply CSS optimizations
        this.applyCSSOptimizations('medium');
      },

      // Optimizations for high-end devices
      applyHighEndOptimizations: function() {
        console.log('🔧 Applying high-end device optimizations...');
        
        // Enable all visual effects
        this.enableAllEffects();
        
        // Use advanced performance features
        this.useAdvancedFeatures();
        
        // Apply CSS optimizations
        this.applyCSSOptimizations('high');
      },

      // Disable expensive visual effects
      disableExpensiveEffects: function() {
        const style = document.createElement('style');
        style.id = 'low-end-optimizations';
        style.textContent = `
          /* Disable transforms */
          .neo-title,
          .neo-card--generate,
          .neo-card--management,
          .persona-card {
            transform: none !important;
          }
          
          /* Simplify shadows */
          .neo-title,
          .neo-button,
          .neo-card {
            box-shadow: 2px 2px 0px #000000 !important;
          }
          
          /* Remove decorative elements */
          .neo-title::before,
          .neo-title::after,
          .neo-card::before,
          .persona-card::before {
            display: none !important;
          }
          
          /* Disable animations */
          * {
            animation: none !important;
            transition: none !important;
          }
        `;
        document.head.appendChild(style);
      },

      // Simplify animations for low-end devices
      simplifyAnimations: function() {
        const animatedElements = document.querySelectorAll('.neo-loading');
        animatedElements.forEach(element => {
          element.style.animation = 'none';
          element.style.color = '#FF0000'; // Static red color
        });
      },

      // Optimize images for low-end devices
      optimizeImages: function() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          // Add loading="lazy" if not present
          if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
          }
          
          // Reduce image quality on slow connections
          if (navigator.connection && navigator.connection.effectiveType === 'slow-2g') {
            img.style.imageRendering = 'pixelated';
          }
        });
      },

      // Reduce DOM complexity
      reduceDOMComplexity: function() {
        // Remove non-essential elements on low-end devices
        const nonEssential = document.querySelectorAll('.decorative, .accent, .optional');
        nonEssential.forEach(element => {
          element.style.display = 'none';
        });
      },

      // Apply selective effects for medium-end devices
      applySelectiveEffects: function() {
        const style = document.createElement('style');
        style.id = 'medium-end-optimizations';
        style.textContent = `
          /* Keep main title transform but remove card transforms */
          .neo-card--generate,
          .neo-card--management,
          .persona-card {
            transform: none !important;
          }
          
          /* Moderate shadows */
          .neo-title {
            box-shadow: 6px 6px 0px #000000 !important;
          }
          
          .neo-button,
          .neo-card {
            box-shadow: 3px 3px 0px #000000 !important;
          }
          
          /* Keep essential decorative elements */
          .neo-title::before,
          .neo-title::after {
            display: block !important;
          }
          
          .neo-card::before,
          .persona-card::before {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      },

      // Moderate animations for medium-end devices
      moderateAnimations: function() {
        const style = document.createElement('style');
        style.id = 'moderate-animations';
        style.textContent = `
          .neo-loading {
            animation-duration: 2s !important; /* Slower animation */
          }
          
          .neo-button:hover,
          .neo-nav a:hover {
            transition: transform 0.1s ease !important;
          }
        `;
        document.head.appendChild(style);
      },

      // Enable all effects for high-end devices
      enableAllEffects: function() {
        // Remove any optimization styles that might have been applied
        const optimizationStyles = document.querySelectorAll('#low-end-optimizations, #medium-end-optimizations');
        optimizationStyles.forEach(style => style.remove());
        
        // Add enhanced effects
        const style = document.createElement('style');
        style.id = 'high-end-enhancements';
        style.textContent = `
          /* Enhanced shadows */
          .neo-title {
            box-shadow: 12px 12px 0px #000000 !important;
          }
          
          /* Smooth micro-animations */
          .neo-button:hover {
            transition: all 0.05s ease !important;
          }
          
          /* Enhanced decorative elements */
          .neo-title::before,
          .neo-title::after,
          .neo-card::before,
          .persona-card::before {
            display: block !important;
          }
        `;
        document.head.appendChild(style);
      },

      // Use advanced performance features
      useAdvancedFeatures: function() {
        // Enable content-visibility for better performance
        if (CSS.supports('content-visibility', 'auto')) {
          const lazyElements = document.querySelectorAll('.persona-card, .neo-result-box');
          lazyElements.forEach(element => {
            element.style.contentVisibility = 'auto';
            element.style.containIntrinsicSize = '0 200px';
          });
        }
        
        // Enable CSS containment
        if (CSS.supports('contain', 'layout')) {
          const containers = document.querySelectorAll('.neo-main, .neo-form-grid, .persona-grid');
          containers.forEach(container => {
            container.style.contain = 'layout style paint';
          });
        }
        
        // Enable will-change for animations
        const animatedElements = document.querySelectorAll('.neo-title, .neo-button, .neo-card');
        animatedElements.forEach(element => {
          element.style.willChange = 'transform, box-shadow';
        });
      },

      // Apply CSS optimizations based on tier
      applyCSSOptimizations: function(tier) {
        const style = document.createElement('style');
        style.id = `css-optimizations-${tier}`;
        
        let cssContent = '';
        
        if (tier === 'low') {
          cssContent = `
            /* Force GPU acceleration off to save battery */
            * {
              transform: translateZ(0) !important;
              will-change: auto !important;
            }
            
            /* Reduce repaints */
            .neo-button:hover,
            .neo-nav a:hover {
              contain: none !important;
            }
          `;
        } else if (tier === 'medium') {
          cssContent = `
            /* Selective GPU acceleration */
            .neo-title,
            .neo-button {
              transform: translateZ(0);
              will-change: transform;
            }
            
            /* Moderate containment */
            .neo-main {
              contain: layout;
            }
          `;
        } else if (tier === 'high') {
          cssContent = `
            /* Full GPU acceleration */
            .neo-title,
            .neo-button,
            .neo-card {
              transform: translateZ(0);
              will-change: transform, box-shadow, background-color;
            }
            
            /* Full containment */
            .neo-main,
            .neo-form-grid,
            .persona-grid {
              contain: layout style paint;
            }
            
            /* Advanced optimizations */
            .persona-card {
              content-visibility: auto;
              contain-intrinsic-size: 0 200px;
            }
          `;
        }
        
        style.textContent = cssContent;
        document.head.appendChild(style);
      }
    },

    // Battery-aware optimizations
    batteryOptimizations: {
      // Apply optimizations based on battery status
      applyBatteryOptimizations: async function() {
        const battery = await PerformanceOptimizer.deviceCapabilities.getBatteryStatus();
        
        if (battery) {
          // Low battery optimizations
          if (!battery.charging && battery.level < 0.2) {
            console.log('🔋 Low battery detected, applying power-saving optimizations...');
            this.applyPowerSavingMode();
          }
          
          // Monitor battery changes
          if ('getBattery' in navigator) {
            navigator.getBattery().then(batteryManager => {
              batteryManager.addEventListener('levelchange', () => {
                if (!batteryManager.charging && batteryManager.level < 0.2) {
                  this.applyPowerSavingMode();
                } else if (batteryManager.level > 0.5) {
                  this.removePowerSavingMode();
                }
              });
            });
          }
        }
      },

      // Apply power-saving mode
      applyPowerSavingMode: function() {
        const style = document.createElement('style');
        style.id = 'power-saving-mode';
        style.textContent = `
          /* Disable all animations */
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
          
          /* Remove transforms */
          .neo-title,
          .neo-card--generate,
          .neo-card--management,
          .persona-card {
            transform: none !important;
          }
          
          /* Simplify shadows */
          .neo-title,
          .neo-button,
          .neo-card {
            box-shadow: 1px 1px 0px #000000 !important;
          }
          
          /* Remove decorative elements */
          .neo-title::before,
          .neo-title::after,
          .neo-card::before,
          .persona-card::before {
            display: none !important;
          }
          
          /* Reduce brightness */
          body {
            filter: brightness(0.8) !important;
          }
        `;
        document.head.appendChild(style);
        
        // Add visual indicator
        const indicator = document.createElement('div');
        indicator.id = 'power-saving-indicator';
        indicator.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: #FF0000;
          color: #FFFFFF;
          padding: 8px 12px;
          border: 2px solid #000000;
          font-family: var(--neo-font-primary, 'Arial Black', sans-serif);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          z-index: 10000;
        `;
        indicator.textContent = '🔋 Power Saving Mode';
        document.body.appendChild(indicator);
      },

      // Remove power-saving mode
      removePowerSavingMode: function() {
        const powerSavingStyle = document.getElementById('power-saving-mode');
        const powerSavingIndicator = document.getElementById('power-saving-indicator');
        
        if (powerSavingStyle) powerSavingStyle.remove();
        if (powerSavingIndicator) powerSavingIndicator.remove();
        
        console.log('🔋 Battery level restored, removing power-saving optimizations...');
      }
    },

    // Network-aware optimizations
    networkOptimizations: {
      // Apply optimizations based on connection quality
      applyNetworkOptimizations: function() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
          this.optimizeForConnection(connection.effectiveType);
          
          // Monitor connection changes
          connection.addEventListener('change', () => {
            this.optimizeForConnection(connection.effectiveType);
          });
        }
      },

      // Optimize based on connection type
      optimizeForConnection: function(effectiveType) {
        // Remove previous network optimizations
        const existingStyle = document.getElementById('network-optimizations');
        if (existingStyle) existingStyle.remove();
        
        const style = document.createElement('style');
        style.id = 'network-optimizations';
        
        let cssContent = '';
        
        switch (effectiveType) {
          case 'slow-2g':
          case '2g':
            console.log('📶 Slow connection detected, applying data-saving optimizations...');
            cssContent = `
              /* Remove all decorative elements */
              .neo-title::before,
              .neo-title::after,
              .neo-card::before,
              .persona-card::before {
                display: none !important;
              }
              
              /* Simplify shadows */
              .neo-title,
              .neo-button,
              .neo-card {
                box-shadow: 1px 1px 0px #000000 !important;
              }
              
              /* Disable transforms */
              .neo-title,
              .neo-card--generate,
              .neo-card--management,
              .persona-card {
                transform: none !important;
              }
            `;
            break;
            
          case '3g':
            console.log('📶 Moderate connection detected, applying moderate optimizations...');
            cssContent = `
              /* Keep essential decorative elements */
              .neo-title::before,
              .neo-title::after {
                display: block !important;
              }
              
              .neo-card::before,
              .persona-card::before {
                display: none !important;
              }
              
              /* Moderate shadows */
              .neo-title,
              .neo-button,
              .neo-card {
                box-shadow: 2px 2px 0px #000000 !important;
              }
            `;
            break;
            
          case '4g':
          default:
            console.log('📶 Good connection detected, enabling full features...');
            // No restrictions for good connections
            break;
        }
        
        style.textContent = cssContent;
        document.head.appendChild(style);
      }
    },

    // Initialize all optimizations
    init: function() {
      console.log('🚀 Initializing Neo-Brutalism Performance Optimizer...');
      
      // Detect device capabilities
      const performanceTier = this.deviceCapabilities.getPerformanceTier();
      console.log(`📱 Device performance tier: ${performanceTier}`);
      
      // Apply tier-based optimizations
      this.optimizations.applyTierOptimizations(performanceTier);
      
      // Apply battery optimizations
      this.batteryOptimizations.applyBatteryOptimizations();
      
      // Apply network optimizations
      this.networkOptimizations.applyNetworkOptimizations();
      
      // Monitor performance
      this.monitorPerformance();
      
      console.log('✅ Performance optimizations applied successfully!');
    },

    // Monitor performance and adjust optimizations
    monitorPerformance: function() {
      if (typeof PerformanceObserver !== 'undefined') {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            // Monitor long tasks
            if (entry.entryType === 'longtask' && entry.duration > 50) {
              console.warn(`⚠️ Long task detected: ${entry.duration}ms`);
              // Apply additional optimizations if needed
              this.applyEmergencyOptimizations();
            }
          });
        });
        
        observer.observe({ entryTypes: ['longtask'] });
      }
      
      // Monitor memory usage
      if (performance.memory) {
        setInterval(() => {
          const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
          if (memoryUsage > 100) { // More than 100MB
            console.warn(`⚠️ High memory usage: ${memoryUsage.toFixed(2)}MB`);
            this.applyMemoryOptimizations();
          }
        }, 30000); // Check every 30 seconds
      }
    },

    // Apply emergency optimizations for performance issues
    applyEmergencyOptimizations: function() {
      console.log('🚨 Applying emergency performance optimizations...');
      
      const style = document.createElement('style');
      style.id = 'emergency-optimizations';
      style.textContent = `
        /* Disable all non-essential features */
        * {
          animation: none !important;
          transition: none !important;
          transform: none !important;
          will-change: auto !important;
        }
        
        /* Minimal shadows */
        .neo-title,
        .neo-button,
        .neo-card {
          box-shadow: 1px 1px 0px #000000 !important;
        }
        
        /* Hide decorative elements */
        .neo-title::before,
        .neo-title::after,
        .neo-card::before,
        .persona-card::before {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    },

    // Apply memory optimizations
    applyMemoryOptimizations: function() {
      console.log('🧠 Applying memory optimizations...');
      
      // Remove unused elements
      const unusedElements = document.querySelectorAll('.hidden, [style*="display: none"]');
      unusedElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      
      // Clear unused styles
      const unusedStyles = document.querySelectorAll('style[id*="optimization"]:not(#emergency-optimizations)');
      unusedStyles.forEach(style => {
        if (style.sheet && style.sheet.cssRules.length === 0) {
          style.remove();
        }
      });
      
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      PerformanceOptimizer.init();
    });
  } else {
    PerformanceOptimizer.init();
  }

  // Export for testing
  window.PerformanceOptimizer = PerformanceOptimizer;

})();