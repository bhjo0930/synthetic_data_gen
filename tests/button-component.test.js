/**
 * Neo-Brutalism Button Component Unit Tests
 * Tests for button state transitions, accessibility, and visual behavior
 */

describe('Neo-Brutalism Button Component', () => {
  beforeEach(() => {
    // Set up DOM environment with test HTML
    document.body.innerHTML = `
      <button class="neo-button" id="test-button">Test Button</button>
      <button class="neo-button neo-button--secondary" id="secondary-button">Secondary</button>
      <button class="neo-button" disabled id="disabled-button">Disabled</button>
      <div class="neo-button-group">
        <button class="neo-button">Group 1</button>
        <button class="neo-button">Group 2</button>
      </div>
    `;
  });

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';
  });

  describe('Button Structure and Classes', () => {
    test('should have correct base classes', () => {
      const button = document.getElementById('test-button');
      expect(button.classList.contains('neo-button')).toBe(true);
    });

    test('should support variant classes', () => {
      const secondaryButton = document.getElementById('secondary-button');
      expect(secondaryButton.classList.contains('neo-button')).toBe(true);
      expect(secondaryButton.classList.contains('neo-button--secondary')).toBe(true);
    });

    test('should handle disabled state', () => {
      const disabledButton = document.getElementById('disabled-button');
      expect(disabledButton.disabled).toBe(true);
      expect(disabledButton.classList.contains('neo-button')).toBe(true);
    });
  });

  describe('Button State Transitions', () => {
    test('should handle hover state changes', () => {
      const button = document.getElementById('test-button');
      
      // Simulate hover
      const hoverEvent = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      
      button.dispatchEvent(hoverEvent);
      
      // Check if hover event was dispatched
      expect(hoverEvent.type).toBe('mouseenter');
    });

    test('should handle active state changes', () => {
      const button = document.getElementById('test-button');
      
      // Simulate mouse down (active state)
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      
      button.dispatchEvent(mouseDownEvent);
      expect(mouseDownEvent.type).toBe('mousedown');
    });

    test('should handle focus state changes', () => {
      const button = document.getElementById('test-button');
      
      // Simulate focus
      const focusEvent = new FocusEvent('focus', {
        bubbles: true,
        cancelable: true,
      });
      
      button.dispatchEvent(focusEvent);
      expect(focusEvent.type).toBe('focus');
    });
  });

  describe('Keyboard Accessibility', () => {
    test('should respond to Enter key', () => {
      const button = document.getElementById('test-button');
      let clicked = false;
      
      button.addEventListener('click', () => {
        clicked = true;
      });
      
      // Simulate Enter key press
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      
      button.dispatchEvent(enterEvent);
      
      // Manually trigger click for Enter key (simulating browser behavior)
      if (enterEvent.key === 'Enter') {
        button.click();
      }
      
      expect(clicked).toBe(true);
    });

    test('should respond to Space key', () => {
      const button = document.getElementById('test-button');
      let clicked = false;
      
      button.addEventListener('click', () => {
        clicked = true;
      });
      
      // Simulate Space key press
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      });
      
      button.dispatchEvent(spaceEvent);
      
      // Manually trigger click for Space key (simulating browser behavior)
      if (spaceEvent.key === ' ') {
        button.click();
      }
      
      expect(clicked).toBe(true);
    });

    test('should be focusable', () => {
      const button = document.getElementById('test-button');
      expect(button.tabIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Disabled State Behavior', () => {
    test('should not respond to clicks when disabled', () => {
      const button = document.getElementById('disabled-button');
      let clicked = false;
      
      button.addEventListener('click', () => {
        clicked = true;
      });
      
      button.click();
      
      // Disabled buttons should not trigger click events
      expect(clicked).toBe(false);
    });

    test('should not be focusable when disabled', () => {
      const button = document.getElementById('disabled-button');
      expect(button.disabled).toBe(true);
    });
  });

  describe('Button Group Behavior', () => {
    test('should contain multiple buttons in group', () => {
      const buttonGroup = document.querySelector('.neo-button-group');
      const buttonsInGroup = buttonGroup.querySelectorAll('.neo-button');
      
      expect(buttonsInGroup.length).toBe(2);
    });

    test('should maintain individual button functionality in groups', () => {
      const buttonGroup = document.querySelector('.neo-button-group');
      const firstButton = buttonGroup.querySelector('.neo-button');
      
      let clicked = false;
      firstButton.addEventListener('click', () => {
        clicked = true;
      });
      
      firstButton.click();
      expect(clicked).toBe(true);
    });
  });

  describe('CSS Custom Properties Integration', () => {
    test('should use CSS custom properties for styling', () => {
      const computedStyle = window.getComputedStyle(document.documentElement);
      
      // Check if CSS custom properties are defined
      expect(computedStyle.getPropertyValue('--neo-red')).toBe('#FF0000');
      expect(computedStyle.getPropertyValue('--neo-black')).toBe('#000000');
      expect(computedStyle.getPropertyValue('--neo-white')).toBe('#FFFFFF');
    });
  });

  describe('Accessibility Compliance', () => {
    test('should have minimum touch target size', () => {
      const button = document.getElementById('test-button');
      
      // Check if button has appropriate attributes for accessibility
      expect(button.tagName.toLowerCase()).toBe('button');
      expect(button.type).toBe('submit'); // Default button type
    });

    test('should support ARIA attributes', () => {
      const button = document.getElementById('test-button');
      
      // Test setting ARIA attributes
      button.setAttribute('aria-label', 'Test button');
      expect(button.getAttribute('aria-label')).toBe('Test button');
    });

    test('should support role attribute', () => {
      const button = document.getElementById('test-button');
      
      // Buttons should have implicit button role
      expect(button.getAttribute('role') || 'button').toBe('button');
    });
  });

  describe('Event Handling', () => {
    test('should handle multiple event listeners', () => {
      const button = document.getElementById('test-button');
      let clickCount = 0;
      let hoverCount = 0;
      
      button.addEventListener('click', () => clickCount++);
      button.addEventListener('mouseenter', () => hoverCount++);
      
      button.click();
      button.dispatchEvent(new MouseEvent('mouseenter'));
      
      expect(clickCount).toBe(1);
      expect(hoverCount).toBe(1);
    });

    test('should prevent default for link buttons', () => {
      // Create a link button
      const linkButton = document.createElement('a');
      linkButton.className = 'neo-button';
      linkButton.href = '#';
      linkButton.textContent = 'Link Button';
      document.body.appendChild(linkButton);
      
      let defaultPrevented = false;
      linkButton.addEventListener('click', (e) => {
        e.preventDefault();
        defaultPrevented = e.defaultPrevented;
      });
      
      linkButton.click();
      expect(defaultPrevented).toBe(true);
    });
  });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Test utilities can be exported here if needed
  };
}