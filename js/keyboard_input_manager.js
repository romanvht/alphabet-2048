class KeyboardInputManager {
  constructor() {
    this.events = {};

    if (window.navigator.msPointerEnabled) {
      //Internet Explorer 10 style
      this.eventTouchstart = "MSPointerDown";
      this.eventTouchmove = "MSPointerMove";
      this.eventTouchend = "MSPointerUp";
    } else {
      this.eventTouchstart = "touchstart";
      this.eventTouchmove = "touchmove";
      this.eventTouchend = "touchend";
    }

    this.listen();
  }
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  emit(event, data) {
    let callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(function (callback) {
        callback(data);
      });
    }
  }
  listen() {
    let self = this;

    let map = {
      38: 0, // Up
      39: 1, // Right
      40: 2, // Down
      37: 3, // Left
      75: 0, // Vim up
      76: 1, // Vim right
      74: 2, // Vim down
      72: 3, // Vim left
      87: 0, // W
      68: 1, // D
      83: 2, // S
      65: 3 // A
    };

    // Respond to direction keys
    document.addEventListener("keydown", function (event) {
      let modifiers = event.altKey || event.ctrlKey || event.metaKey ||
        event.shiftKey;
      let mapped = map[event.which];

      // Ignore the event if it's happening in a text field
      if (self.targetIsInput(event)) return;

      if (!modifiers) {
        if (mapped !== undefined) {
          event.preventDefault();
          self.emit("move", mapped);
        }
      }

      // R key restarts the game
      if (!modifiers && event.which === 82) {
        self.restart.call(self, event);
      }
    });

    // Respond to button presses
    this.bindButtonPress(".retry-button", this.restart);
    this.bindButtonPress(".restart-button", this.restart);
    this.bindButtonPress(".cancel-button", this.cancel);

    this.bindButtonPress("#link4", this.resize);
    this.bindButtonPress("#link5", this.resize);
    this.bindButtonPress("#link6", this.resize);
    this.bindButtonPress("#link7", this.resize);

    // Respond to swipe events
    let touchStartClientX, touchStartClientY;
    let gameContainer = document.getElementsByClassName("game-body")[0];

    gameContainer.addEventListener(this.eventTouchstart, function (event) {
      if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches > 1 ||
        self.targetIsInput(event)) {
        return; // Ignore if touching with more than 1 finger or touching input
      }

      if (window.navigator.msPointerEnabled) {
        touchStartClientX = event.pageX;
        touchStartClientY = event.pageY;
      } else {
        touchStartClientX = event.touches[0].clientX;
        touchStartClientY = event.touches[0].clientY;
      }

      event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchmove, function (event) {
      event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchend, function (event) {
      if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches > 0 ||
        self.targetIsInput(event)) {
        return; // Ignore if still touching with one or more fingers or input
      }

      let touchEndClientX, touchEndClientY;

      if (window.navigator.msPointerEnabled) {
        touchEndClientX = event.pageX;
        touchEndClientY = event.pageY;
      } else {
        touchEndClientX = event.changedTouches[0].clientX;
        touchEndClientY = event.changedTouches[0].clientY;
      }

      let dx = touchEndClientX - touchStartClientX;
      let absDx = Math.abs(dx);

      let dy = touchEndClientY - touchStartClientY;
      let absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 10) {
        // (right : left) : (down : up)
        self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
      }
    });

    // Событие для переключения таблицы лидеров
    document.getElementById('linkTop').addEventListener('click', function (event) {
      self.emit("toggleLeaderboard", event);
    });

    // Событие для изменения размера инпута ника
    document.getElementById('nick').addEventListener('input', function (event) {
      self.emit("updateNick", event);
    });

    // Событие для изменения цвета
    document.querySelectorAll('.color-links a').forEach(link => {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        const color = event.currentTarget.className;
        self.emit("setColor", color);
      });
    });
  }
  resize(event) {
    event.preventDefault();
    this.emit("resize", event.srcElement.dataset.size);
  }
  restart(event) {
    event.preventDefault();
    this.emit("restart");
  }
  cancel(event) {
    event.preventDefault();
    this.emit("cancel");
  }
  keepPlaying(event) {
    event.preventDefault();
    this.emit("keepPlaying");
  }
  bindButtonPress(selector, fn) {
    let button = document.querySelector(selector);
    button.addEventListener("click", fn.bind(this));
    button.addEventListener(this.eventTouchend, fn.bind(this));
  }
  targetIsInput(event) {
    return event.target.tagName.toLowerCase() === "input";
  }
}