/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

// Mock CSS custom properties for testing
Object.defineProperty(window, 'getComputedStyle', {
  value: (element) => ({
    getPropertyValue: (property) => {
      const cssVars = {
        '--neo-white': '#FFFFFF',
        '--neo-black': '#000000',
        '--neo-red': '#FF0000',
        '--neo-green': '#00FF00',
        '--neo-yellow': '#FFFF00',
        '--neo-blue': '#0000FF',
        '--neo-font-primary': "'Arial Black', 'Helvetica Bold', 'Impact', sans-serif",
        '--neo-space-sm': '8px',
        '--neo-space-md': '16px',
        '--neo-space-lg': '24px',
        '--neo-space-xl': '32px',
        '--neo-border-thick': '4px solid #000000',
        '--neo-border-heavy': '6px solid #000000',
        '--neo-shadow-sm': '2px 2px 0px #000000',
        '--neo-shadow-md': '4px 4px 0px #000000'
      };
      return cssVars[property] || '';
    }
  })
});

// Mock CSS classes for testing
global.CSS = {
  supports: (property, value) => {
    // Mock CSS.supports for feature detection tests
    const supportedFeatures = {
      'display: grid': true,
      'box-shadow: 4px 4px 0px #000000': true,
      'transform: translate(0, 0)': true
    };
    return supportedFeatures[`${property}: ${value}`] || false;
  }
};

// Mock media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Global test utilities
global.testUtils = {
  // Create a button element with Neo-Brutalism classes
  createNeoButton: (options = {}) => {
    const button = document.createElement('button');
    button.className = `neo-button ${options.variant || ''}`.trim();
    button.textContent = options.text || 'Test Button';
    
    if (options.disabled) {
      button.disabled = true;
    }
    
    return button;
  },
  
  // Simulate CSS hover state
  simulateHover: (element) => {
    const hoverEvent = new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(hoverEvent);
    return hoverEvent;
  },
  
  // Simulate CSS active state
  simulateActive: (element) => {
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(mouseDownEvent);
    return mouseDownEvent;
  },
  
  // Simulate keyboard interaction
  simulateKeyboard: (element, key) => {
    const keyEvent = new KeyboardEvent('keydown', {
      key: key,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(keyEvent);
    
    // Simulate browser behavior for Enter and Space
    if (key === 'Enter' || key === ' ') {
      element.click();
    }
    
    return keyEvent;
  }
};

// Console setup for test output
console.log('Neo-Brutalism Button Component Test Suite Setup Complete');