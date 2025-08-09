/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

// Mock CSS custom properties and computed styles for testing
Object.defineProperty(window, 'getComputedStyle', {
  value: (element) => {
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
    
    // Mock computed styles based on element classes
    const mockStyles = {
      display: 'block',
      position: 'static',
      zIndex: 'auto',
      gap: 'normal',
      columnGap: 'normal',
      rowGap: 'normal',
      gridTemplateColumns: 'none',
      gridTemplateRows: 'none',
      gridTemplateAreas: 'none',
      gridColumn: 'auto',
      gridRow: 'auto',
      gridColumnStart: 'auto',
      gridColumnEnd: 'auto',
      justifySelf: 'auto',
      alignSelf: 'auto',
      width: 'auto',
      height: 'auto',
      top: 'auto',
      left: 'auto',
      right: 'auto',
      bottom: 'auto'
    };
    
    // Apply styles based on element classes
    if (element.classList) {
      // Grid display
      if (element.classList.contains('neo-grid') || element.classList.contains('neo-overlap-container')) {
        mockStyles.display = 'grid';
      }
      
      // Grid template columns
      if (element.classList.contains('neo-grid--asymmetric-2col')) {
        mockStyles.gridTemplateColumns = '1fr 2fr';
      }
      if (element.classList.contains('neo-grid--asymmetric-3col')) {
        mockStyles.gridTemplateColumns = '1fr 3fr 2fr';
      }
      if (element.classList.contains('neo-grid--asymmetric-4col')) {
        mockStyles.gridTemplateColumns = '1fr 2fr 1fr 3fr';
      }
      if (element.classList.contains('neo-grid--responsive-asymmetric')) {
        mockStyles.gridTemplateColumns = '1fr 2fr';
      }
      
      // Grid template rows
      if (element.classList.contains('neo-grid--asymmetric-rows')) {
        mockStyles.gridTemplateRows = '1fr 3fr 2fr';
      }
      
      // Grid template areas
      if (element.classList.contains('neo-overlap-container')) {
        mockStyles.gridTemplateAreas = '"overlap"';
      }
      
      // Grid positioning
      if (element.classList.contains('neo-overlap--top-left')) {
        mockStyles.justifySelf = 'start';
        mockStyles.alignSelf = 'start';
      }
      if (element.classList.contains('neo-overlap--bottom-right')) {
        mockStyles.justifySelf = 'end';
        mockStyles.alignSelf = 'end';
      }
      
      // Grid spans
      if (element.classList.contains('neo-span--2')) {
        mockStyles.gridColumn = 'span 2';
      }
      if (element.classList.contains('neo-span--row-2')) {
        mockStyles.gridRow = 'span 2';
      }
      
      // Grid positioning
      if (element.classList.contains('neo-place--start-2')) {
        mockStyles.gridColumnStart = '2';
      }
      
      // Z-index layers
      if (element.classList.contains('neo-layer--background')) {
        mockStyles.zIndex = '1';
      }
      if (element.classList.contains('neo-layer--content')) {
        mockStyles.zIndex = '2';
      }
      if (element.classList.contains('neo-layer--accent')) {
        mockStyles.zIndex = '3';
      }
      if (element.classList.contains('neo-layer--overlay')) {
        mockStyles.zIndex = '4';
      }
      if (element.classList.contains('neo-layer--top')) {
        mockStyles.zIndex = '5';
      }
      
      // Stack layers
      if (element.classList.contains('neo-stack-layer-1')) {
        mockStyles.position = 'absolute';
        mockStyles.zIndex = '1';
      }
      if (element.classList.contains('neo-stack-layer-2')) {
        mockStyles.position = 'absolute';
        mockStyles.zIndex = '2';
      }
      if (element.classList.contains('neo-stack-content')) {
        mockStyles.position = 'relative';
        mockStyles.zIndex = '3';
      }
      
      // Overlay positioning
      if (element.classList.contains('neo-overlay')) {
        mockStyles.position = 'absolute';
      }
      if (element.classList.contains('neo-overlay--corner-tl')) {
        mockStyles.top = '-8px';
        mockStyles.left = '-8px';
        mockStyles.width = '24px';
        mockStyles.height = '24px';
      }
      if (element.classList.contains('neo-overlay--edge-top')) {
        mockStyles.width = '60px';
        mockStyles.height = '8px';
      }
      
      // Gap utilities
      if (element.classList.contains('neo-gap--xs')) {
        mockStyles.gap = '4px';
      }
      if (element.classList.contains('neo-gap--sm')) {
        mockStyles.gap = '8px';
      }
      if (element.classList.contains('neo-gap--lg')) {
        mockStyles.gap = '24px';
      }
      if (element.classList.contains('neo-gap--xl')) {
        mockStyles.gap = '32px';
      }
      if (element.classList.contains('neo-gap--uneven')) {
        mockStyles.columnGap = '24px';
        mockStyles.rowGap = '8px';
      }
    }
    
    return {
      ...mockStyles,
      getPropertyValue: (property) => cssVars[property] || mockStyles[property] || ''
    };
  }
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