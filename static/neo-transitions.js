/**
 * Neo-Brutalism Page Transition System
 * Handles hard-edge effects and jump-cut transitions
 */

class NeoTransitions {
  constructor() {
    this.isTransitioning = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }

  init() {
    // Create transition overlays
    this.createOverlays();
    
    // Listen for reduced motion changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
    });
    
    // Handle page visibility changes for flash effects
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.flashTransition('white');
      }
    });
  }

  createOverlays() {
    // Flash overlay
    this.flashOverlay = document.createElement('div');
    this.flashOverlay.className = 'neo-flash-overlay';
    document.body.appendChild(this.flashOverlay);
    
    // Wipe overlay
    this.wipeOverlay = document.createElement('div');
    this.wipeOverlay.className = 'neo-wipe-overlay';
    document.body.appendChild(this.wipeOverlay);
  }

  /**
   * Trigger a flash transition effect
   * @param {string} color - 'white' or 'black'
   */
  flashTransition(color = 'white') {
    if (this.reducedMotion) return;
    
    this.flashOverlay.className = `neo-flash-overlay flash-${color}`;
    
    // Reset after animation
    setTimeout(() => {
      this.flashOverlay.className = 'neo-flash-overlay';
    }, 100);
  }

  /**
   * Trigger a wipe transition effect
   * @param {string} direction - 'left', 'right', 'up', 'down'
   * @param {Function} callback - Function to call during transition
   */
  wipeTransition(direction = 'left', callback = null) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    if (this.reducedMotion) {
      if (callback) callback();
      this.isTransitioning = false;
      return;
    }
    
    this.wipeOverlay.className = `neo-wipe-overlay wipe-${direction}`;
    
    // Execute callback at midpoint of animation
    setTimeout(() => {
      if (callback) callback();
    }, 150); // Half of wipe duration
    
    // Reset after animation
    setTimeout(() => {
      this.wipeOverlay.className = 'neo-wipe-overlay';
      this.isTransitioning = false;
    }, 300);
  }

  /**
   * Apply jump cut transition to an element
   * @param {HTMLElement} element - Element to transition
   * @param {boolean} show - Whether to show or hide the element
   */
  jumpCut(element, show = true) {
    if (!element) return;
    
    if (this.reducedMotion) {
      element.style.opacity = show ? '1' : '0';
      return;
    }
    
    if (show) {
      element.className = element.className.replace(/neo-jump-cut\s*(active|exit)?/g, '').trim();
      element.classList.add('neo-jump-cut', 'active');
      
      setTimeout(() => {
        element.classList.remove('active');
      }, 50);
    } else {
      element.className = element.className.replace(/neo-jump-cut\s*(active|exit)?/g, '').trim();
      element.classList.add('neo-jump-cut', 'exit');
      
      setTimeout(() => {
        element.classList.remove('exit');
        element.style.opacity = '0';
      }, 50);
    }
  }

  /**
   * Transition page content with hard-edge effect
   * @param {HTMLElement} exitElement - Element to exit
   * @param {HTMLElement} enterElement - Element to enter
   * @param {string} direction - 'left' or 'right'
   */
  pageTransition(exitElement, enterElement, direction = 'left') {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    if (this.reducedMotion) {
      if (exitElement) exitElement.style.display = 'none';
      if (enterElement) enterElement.style.display = 'block';
      this.isTransitioning = false;
      return;
    }
    
    // Start exit animation
    if (exitElement) {
      exitElement.classList.add('neo-page-content', 'exiting');
    }
    
    // Start enter animation after brief delay
    setTimeout(() => {
      if (enterElement) {
        enterElement.style.display = 'block';
        enterElement.classList.add('neo-page-content', 'entering');
      }
    }, 50);
    
    // Clean up after animations complete
    setTimeout(() => {
      if (exitElement) {
        exitElement.style.display = 'none';
        exitElement.classList.remove('neo-page-content', 'exiting');
      }
      if (enterElement) {
        enterElement.classList.remove('neo-page-content', 'entering');
      }
      this.isTransitioning = false;
    }, 300);
  }

  /**
   * Flash component during state change
   * @param {HTMLElement} element - Element to flash
   */
  componentFlash(element) {
    if (!element || this.reducedMotion) return;
    
    element.classList.add('neo-component-transition', 'changing');
    
    setTimeout(() => {
      element.classList.remove('changing');
    }, 50);
  }

  /**
   * Handle navigation transitions
   * @param {string} targetUrl - URL to navigate to
   * @param {string} transitionType - Type of transition ('wipe', 'flash', 'jump')
   */
  navigateWithTransition(targetUrl, transitionType = 'wipe') {
    switch (transitionType) {
      case 'flash':
        this.flashTransition('black');
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 50);
        break;
        
      case 'wipe':
        this.wipeTransition('right', () => {
          window.location.href = targetUrl;
        });
        break;
        
      case 'jump':
        const body = document.body;
        this.jumpCut(body, false);
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 50);
        break;
        
      default:
        window.location.href = targetUrl;
    }
  }
}

// Initialize transitions when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.neoTransitions = new NeoTransitions();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NeoTransitions;
}