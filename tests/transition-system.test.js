/**
 * Neo-Brutalism Transition System Tests
 * Tests for hard-edge effects, timing, and accessibility compliance
 */

describe('Neo-Brutalism Transition System', () => {
  let neoTransitions;
  let mockElement;
  let flashOverlay;
  let wipeOverlay;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Create mock element
    mockElement = document.createElement('div');
    mockElement.id = 'test-element';
    mockElement.textContent = 'Test Content';
    document.body.appendChild(mockElement);
    
    // Mock reduced motion media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    // Initialize transitions
    const NeoTransitions = require('../static/neo-transitions.js');
    neoTransitions = new NeoTransitions();
    
    // Get overlay elements
    flashOverlay = document.querySelector('.neo-flash-overlay');
    wipeOverlay = document.querySelector('.neo-wipe-overlay');
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    test('should create flash and wipe overlays', () => {
      expect(flashOverlay).toBeTruthy();
      expect(wipeOverlay).toBeTruthy();
      expect(flashOverlay.className).toBe('neo-flash-overlay');
      expect(wipeOverlay.className).toBe('neo-wipe-overlay');
    });

    test('should detect reduced motion preference', () => {
      expect(neoTransitions.reducedMotion).toBe(false);
    });
  });

  describe('Flash Transitions', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    test('should trigger white flash transition', () => {
      neoTransitions.flashTransition('white');
      
      expect(flashOverlay.className).toBe('neo-flash-overlay flash-white');
      
      // Fast-forward timer
      jest.advanceTimersByTime(100);
      
      expect(flashOverlay.className).toBe('neo-flash-overlay');
    });

    test('should trigger black flash transition', () => {
      neoTransitions.flashTransition('black');
      
      expect(flashOverlay.className).toBe('neo-flash-overlay flash-black');
      
      jest.advanceTimersByTime(100);
      
      expect(flashOverlay.className).toBe('neo-flash-overlay');
    });

    test('should not animate with reduced motion', () => {
      neoTransitions.reducedMotion = true;
      neoTransitions.flashTransition('white');
      
      expect(flashOverlay.className).toBe('neo-flash-overlay');
    });
  });

  describe('Wipe Transitions', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    test('should trigger left wipe transition', (done) => {
      const callback = jest.fn();
      
      neoTransitions.wipeTransition('left', callback);
      
      expect(wipeOverlay.className).toBe('neo-wipe-overlay wipe-left');
      expect(neoTransitions.isTransitioning).toBe(true);
      
      // Callback should be called at midpoint
      jest.advanceTimersByTime(150);
      expect(callback).toHaveBeenCalled();
      
      // Animation should complete
      jest.advanceTimersByTime(150);
      expect(wipeOverlay.className).toBe('neo-wipe-overlay');
      expect(neoTransitions.isTransitioning).toBe(false);
      
      done();
    });

    test('should handle all wipe directions', () => {
      const directions = ['left', 'right', 'up', 'down'];
      
      directions.forEach(direction => {
        neoTransitions.wipeTransition(direction);
        expect(wipeOverlay.className).toBe(`neo-wipe-overlay wipe-${direction}`);
        
        jest.advanceTimersByTime(300);
        expect(wipeOverlay.className).toBe('neo-wipe-overlay');
      });
    });

    test('should not start new transition while one is active', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      neoTransitions.wipeTransition('left', callback1);
      neoTransitions.wipeTransition('right', callback2);
      
      expect(wipeOverlay.className).toBe('neo-wipe-overlay wipe-left');
      
      jest.advanceTimersByTime(300);
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    test('should execute callback immediately with reduced motion', () => {
      neoTransitions.reducedMotion = true;
      const callback = jest.fn();
      
      neoTransitions.wipeTransition('left', callback);
      
      expect(callback).toHaveBeenCalled();
      expect(neoTransitions.isTransitioning).toBe(false);
    });
  });

  describe('Jump Cut Transitions', () => {
    test('should show element with jump cut', () => {
      neoTransitions.jumpCut(mockElement, true);
      
      expect(mockElement.classList.contains('neo-jump-cut')).toBe(true);
      expect(mockElement.classList.contains('active')).toBe(true);
    });

    test('should hide element with jump cut', () => {
      neoTransitions.jumpCut(mockElement, false);
      
      expect(mockElement.classList.contains('neo-jump-cut')).toBe(true);
      expect(mockElement.classList.contains('exit')).toBe(true);
    });

    test('should handle reduced motion for jump cuts', () => {
      neoTransitions.reducedMotion = true;
      
      neoTransitions.jumpCut(mockElement, true);
      expect(mockElement.style.opacity).toBe('1');
      
      neoTransitions.jumpCut(mockElement, false);
      expect(mockElement.style.opacity).toBe('0');
    });

    test('should handle null element gracefully', () => {
      expect(() => {
        neoTransitions.jumpCut(null, true);
      }).not.toThrow();
    });
  });

  describe('Page Transitions', () => {
    let exitElement, enterElement;

    beforeEach(() => {
      jest.useFakeTimers();
      
      exitElement = document.createElement('div');
      exitElement.id = 'exit-element';
      exitElement.style.display = 'block';
      document.body.appendChild(exitElement);
      
      enterElement = document.createElement('div');
      enterElement.id = 'enter-element';
      enterElement.style.display = 'none';
      document.body.appendChild(enterElement);
    });

    test('should transition between page elements', () => {
      neoTransitions.pageTransition(exitElement, enterElement, 'left');
      
      expect(exitElement.classList.contains('neo-page-content')).toBe(true);
      expect(exitElement.classList.contains('exiting')).toBe(true);
      expect(neoTransitions.isTransitioning).toBe(true);
      
      // Enter element should appear after delay
      jest.advanceTimersByTime(50);
      expect(enterElement.style.display).toBe('block');
      expect(enterElement.classList.contains('entering')).toBe(true);
      
      // Cleanup after animation
      jest.advanceTimersByTime(250);
      expect(exitElement.style.display).toBe('none');
      expect(neoTransitions.isTransitioning).toBe(false);
    });

    test('should handle reduced motion for page transitions', () => {
      neoTransitions.reducedMotion = true;
      
      neoTransitions.pageTransition(exitElement, enterElement);
      
      expect(exitElement.style.display).toBe('none');
      expect(enterElement.style.display).toBe('block');
      expect(neoTransitions.isTransitioning).toBe(false);
    });
  });

  describe('Component Flash', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    test('should flash component during state change', () => {
      neoTransitions.componentFlash(mockElement);
      
      expect(mockElement.classList.contains('neo-component-transition')).toBe(true);
      expect(mockElement.classList.contains('changing')).toBe(true);
      
      jest.advanceTimersByTime(50);
      
      expect(mockElement.classList.contains('changing')).toBe(false);
    });

    test('should not flash with reduced motion', () => {
      neoTransitions.reducedMotion = true;
      
      neoTransitions.componentFlash(mockElement);
      
      expect(mockElement.classList.contains('changing')).toBe(false);
    });
  });

  describe('Navigation Transitions', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      
      // Mock window.location
      delete window.location;
      window.location = { href: '' };
    });

    test('should navigate with flash transition', () => {
      neoTransitions.navigateWithTransition('/test-page', 'flash');
      
      expect(flashOverlay.className).toBe('neo-flash-overlay flash-black');
      
      jest.advanceTimersByTime(50);
      
      expect(window.location.href).toBe('/test-page');
    });

    test('should navigate with wipe transition', () => {
      neoTransitions.navigateWithTransition('/test-page', 'wipe');
      
      expect(wipeOverlay.className).toBe('neo-wipe-overlay wipe-right');
      
      jest.advanceTimersByTime(150);
      
      expect(window.location.href).toBe('/test-page');
    });

    test('should navigate with jump transition', () => {
      neoTransitions.navigateWithTransition('/test-page', 'jump');
      
      expect(document.body.classList.contains('neo-jump-cut')).toBe(true);
      
      jest.advanceTimersByTime(50);
      
      expect(window.location.href).toBe('/test-page');
    });
  });

  describe('Accessibility Compliance', () => {
    test('should respect reduced motion preference', () => {
      // Mock reduced motion preference
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? true : false,
        addEventListener: jest.fn(),
      }));
      
      const NeoTransitions = require('../static/neo-transitions.js');
      const reducedMotionTransitions = new NeoTransitions();
      
      expect(reducedMotionTransitions.reducedMotion).toBe(true);
    });

    test('should provide instant transitions for reduced motion', () => {
      neoTransitions.reducedMotion = true;
      
      // Test all transition types with reduced motion
      neoTransitions.flashTransition('white');
      expect(flashOverlay.className).toBe('neo-flash-overlay');
      
      const callback = jest.fn();
      neoTransitions.wipeTransition('left', callback);
      expect(callback).toHaveBeenCalled();
      
      neoTransitions.jumpCut(mockElement, true);
      expect(mockElement.style.opacity).toBe('1');
    });

    test('should handle media query changes', () => {
      // Create a new instance to test media query handling
      const mockMediaQuery = {
        matches: false,
        addEventListener: jest.fn(),
      };
      
      window.matchMedia = jest.fn().mockReturnValue(mockMediaQuery);
      
      const NeoTransitions = require('../static/neo-transitions.js');
      const testTransitions = new NeoTransitions();
      
      // Verify addEventListener was called
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      
      // Get the change handler and simulate a change
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1];
      changeHandler({ matches: true });
      
      expect(testTransitions.reducedMotion).toBe(true);
    });
  });

  describe('Timing Compliance', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    test('should use correct timing for flash effects', () => {
      neoTransitions.flashTransition('white');
      
      // Should reset after exactly 100ms
      jest.advanceTimersByTime(99);
      expect(flashOverlay.className).toBe('neo-flash-overlay flash-white');
      
      jest.advanceTimersByTime(1);
      expect(flashOverlay.className).toBe('neo-flash-overlay');
    });

    test('should use correct timing for wipe effects', () => {
      const callback = jest.fn();
      neoTransitions.wipeTransition('left', callback);
      
      // Callback should execute at 150ms (midpoint)
      jest.advanceTimersByTime(149);
      expect(callback).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalled();
      
      // Should complete at 300ms
      jest.advanceTimersByTime(149);
      expect(neoTransitions.isTransitioning).toBe(true);
      
      jest.advanceTimersByTime(1);
      expect(neoTransitions.isTransitioning).toBe(false);
    });

    test('should use correct timing for jump cuts', () => {
      neoTransitions.jumpCut(mockElement, true);
      
      expect(mockElement.classList.contains('active')).toBe(true);
      
      // Should remove active class after 50ms
      jest.advanceTimersByTime(50);
      
      expect(mockElement.classList.contains('active')).toBe(false);
    });
  });
});