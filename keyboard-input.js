class C3KeyboardInput {
  constructor() {
    this.keysPressed = new Set();
    this.simulatedPointers = new Map();
    this.buttonElements = new Map();
    this.gameStarted = false;
    this.setupListeners();
  }
  
  setupListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.onKeyDown(e), true);
    document.addEventListener('keyup', (e) => this.onKeyUp(e), true);
    
    // Wait for game to start, then find buttons
    window.addEventListener('load', () => this.initializeButtons());
    if (document.readyState === 'complete') {
      this.initializeButtons();
    }
  }
  
  initializeButtons() {
    this.findButtonElements();
    if (this.buttonElements.size < 4) {
      setTimeout(() => this.findButtonElements(), 200);
    }
  }
  
  findButtonElements() {
    const buttonMap = {
      'left': ['btn_Left', 'btn-left', 'left'],
      'right': ['btn_Right', 'btn-right', 'right', 'btn_forward', 'forward'],
      'jump': ['btn_Jump', 'btn-jump', 'jump'],
      'attack': ['btn_attack', 'btn-attack', 'attack']
    };
    
    for (const [action, ids] of Object.entries(buttonMap)) {
      if (this.buttonElements.has(action)) continue;
      
      for (const id of ids) {
        let elem = document.getElementById(id);
        if (!elem) {
          elem = document.querySelector(`[data-id="${id}"]`);
        }
        if (!elem) {
          elem = document.querySelector(`[data-action="${action}"]`);
        }
        
        if (elem) {
          this.buttonElements.set(action, elem);
          break;
        }
      }
      
      // Fallback: search all elements
      if (!this.buttonElements.has(action)) {
        const pattern = new RegExp(action, 'i');
        const allElements = document.querySelectorAll('*');
        for (const elem of allElements) {
          const id = elem.id || elem.getAttribute('data-id') || '';
          if (pattern.test(id)) {
            this.buttonElements.set(action, elem);
            break;
          }
        }
      }
    }
  }
  
  onKeyDown(e) {
    const key = e.key.toLowerCase();
    
    // Add to pressed keys
    this.keysPressed.add(key);
    this.keysPressed.add(e.code);
    
    this.updateInputState();
  }
  
  onKeyUp(e) {
    const key = e.key.toLowerCase();
    
    // Remove from pressed keys
    this.keysPressed.delete(key);
    this.keysPressed.delete(e.code);
    
    this.updateInputState();
  }
  
  updateInputState() {
    // Map keyboard to actions
    const actions = {
      'left': this.isKeyPressed(['arrowleft']),
      'right': this.isKeyPressed(['arrowright']),
      'jump': this.isKeyPressed([' ']),
      'attack': this.isKeyPressed(['enter'])
    };
    
    // Trigger button presses
    for (const [action, isPressed] of Object.entries(actions)) {
      const button = this.buttonElements.get(action);
      if (!button) continue;
      
      const pointerId = this.getPointerId(action);
      
      if (isPressed) {
        this.simulatePointerDown(button, pointerId);
      } else {
        this.simulatePointerUp(button, pointerId);
      }
    }
  }
  
  isKeyPressed(keys) {
    return keys.some(key => {
      const lower = key.toLowerCase();
      return this.keysPressed.has(lower) || 
             this.keysPressed.has(key) ||
             this.keysPressed.has('Space' + lower) ||
             (key === ' ' && this.keysPressed.has('space'));
    });
  }
  
  getPointerId(action) {
    if (!this.simulatedPointers.has(action)) {
      this.simulatedPointers.set(action, 100 + this.simulatedPointers.size);
    }
    return this.simulatedPointers.get(action);
  }
  
  simulatePointerDown(button, pointerId) {
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const events = [
      new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        pointerId: pointerId,
        pointerType: 'keyboard',
        isPrimary: pointerId === 1,
        button: 0,
        buttons: 1
      }),
      new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 0,
        buttons: 1
      })
    ];
    
    for (const event of events) {
      button.dispatchEvent(event);
    }
  }
  
  simulatePointerUp(button, pointerId) {
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const events = [
      new PointerEvent('pointerup', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        pointerId: pointerId,
        pointerType: 'keyboard',
        isPrimary: pointerId === 1,
        button: 0,
        buttons: 0
      }),
      new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 0,
        buttons: 0
      })
    ];
    
    for (const event of events) {
      button.dispatchEvent(event);
    }
  }
}

// Initialize keyboard input
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.c3KeyboardInput = new C3KeyboardInput();
  });
} else {
  window.c3KeyboardInput = new C3KeyboardInput();
}
