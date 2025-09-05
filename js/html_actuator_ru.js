class HTMLActuator {
  constructor() {
    this.gridContainer = document.querySelector(".grid-container");
    this.tileContainer = document.querySelector(".tile-container");
    this.scoreContainer = document.querySelector(".score-container");
    this.bestContainer = document.querySelector(".best-container");
    this.nickContainer = document.querySelector(".nick-container");
    this.messageContainer = document.querySelector(".game-message");
    this.advertContainer = document.querySelector(".advert-container");
    this.topBlock = document.getElementById('top-container');
    this.gameBlock = document.querySelector('.game-table');
    this.hiddenInput = document.querySelector(".hiddenInput");
    this.style = document.getElementById("style");
    this.sizeStyle = document.getElementById("size");
    this.colorLinks = document.querySelectorAll('.color-links a');

    this.score = 0;
  }
  setup(storage, metadata) {
    let self = this;

    document.querySelectorAll('.link').forEach(n => n.classList.remove('selected'));
    document.getElementById("link" + metadata.size).classList.add("selected");

    self.sizeStyle.setAttribute("href", "css/" + metadata.size + ".css");
    self.updateNick(metadata.nick);
    self.gridContainer.innerHTML = '';

    for (let row = 1; row <= metadata.size; row++) {
      let rowDiv = document.createElement('div');
      rowDiv.classList.add('grid-row');

      for (let cell = 1; cell <= metadata.size; cell++) {
        let cellDiv = document.createElement('div');
        cellDiv.classList.add('grid-cell');
        rowDiv.append(cellDiv);
      }

      self.gridContainer.append(rowDiv);
    }
  }
  actuate(grid, metadata) {
    let self = this;

    window.requestAnimationFrame(function () {
      self.clearContainer(self.tileContainer);

      grid.cells.forEach(function (column) {
        column.forEach(function (cell) {
          if (cell) {
            self.addTile(cell);
          }
        });
      });

      self.updateScore(metadata.score);
      self.updateBestScore(metadata.bestScore);

      if (metadata.terminated) {
        if (metadata.over) {
          self.message(false);
        } else if (metadata.won) {
          self.message(true);
        }
      }
    });
  }
  continue() {
    if (typeof ga !== "undefined") {
      ga("send", "event", "game", "restart");
    }

    this.clearMessage();
  }
  clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
  addTile(tile) {
    let self = this;

    let wrapper = document.createElement("div");
    let inner = document.createElement("div");
    let position = tile.previousPosition || { x: tile.x, y: tile.y };
    let positionClass = this.positionClass(position);

    let classes = ["tile", "tile-" + tile.value, positionClass];

    if (tile.value > 56) classes.push("tile-super");

    this.applyClasses(wrapper, classes);
    let outputtext = ['∞', 'A', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Ы', 'Э', 'Ю', 'Я', '∞'];

    inner.classList.add("tile-inner");
    inner.textContent = outputtext[(tile.value / 2)] || '';

    if (tile.previousPosition) {
      window.requestAnimationFrame(function () {
        classes[2] = self.positionClass({ x: tile.x, y: tile.y });
        self.applyClasses(wrapper, classes);
      });
    } else if (tile.mergedFrom) {
      classes.push("tile-merged");
      this.applyClasses(wrapper, classes);

      tile.mergedFrom.forEach(function (merged) {
        self.addTile(merged);
      });
    } else {
      classes.push("tile-new");
      this.applyClasses(wrapper, classes);
    }

    wrapper.appendChild(inner);

    this.tileContainer.appendChild(wrapper);
  }
  applyClasses(element, classes) {
    element.setAttribute("class", classes.join(" "));
  }
  normalizePosition(position) {
    return { x: position.x + 1, y: position.y + 1 };
  }
  positionClass(position) {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
  }
  updateNick(nick, disable) {
    let hiddenInput = document.querySelector(".hiddenInput");
    hiddenInput.textContent = nick;

    let nickContainer = document.getElementById("nick");
    nickContainer.setAttribute("value", nick);

    if (hiddenInput.clientWidth < 50) {
      nickContainer.style.width = 50 + "px";
    } else if (hiddenInput.clientWidth > 200) {
      nickContainer.style.width = 200 + "px";
    } else {
      nickContainer.style.width = hiddenInput.clientWidth + "px";
    }

    if (disable) {
      nickContainer.setAttribute("disabled", true);
    }
  }
  updateScore(score) {
    this.clearContainer(this.scoreContainer);

    let difference = score - this.score;
    this.score = score;
    if (this.score > 9999) {
      this.scoreContainer.textContent = Math.round(this.score / 100) / 10 + "т";
    } else {
      this.scoreContainer.textContent = this.score;
    }
    if (difference > 0) {
      let addition = document.createElement("div");
      addition.classList.add("score-addition");
      addition.textContent = "+" + difference;

      this.scoreContainer.appendChild(addition);
    }
  }
  updateBestScore(bestScore) {
    if (bestScore > 9999) {
      this.bestContainer.textContent = Math.round(bestScore / 100) / 10 + "т";
    } else {
      this.bestContainer.textContent = bestScore;
    }
  }
  message(won) {
    let type = won ? "game-won" : "game-over";
    let message = won ? "Победа!" : "Ваш счет: " + this.score;

    if (typeof ga !== "undefined") {
      ga("send", "event", "game", "end", type, this.score);
    }

    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName("p")[0].textContent = message;
    this.advertContainer.innerHTML = '';
  }
  clearMessage() {
    this.messageContainer.classList.remove("game-won");
    this.messageContainer.classList.remove("game-over");
  }
  resizeNickInput(event) {
    const nickInput = event.currentTarget;
    this.hiddenInput.textContent = nickInput.value;

    if (this.hiddenInput.clientWidth < 50) {
      nickInput.style.width = "50px";
    } else if (this.hiddenInput.clientWidth > 200) {
      nickInput.style.width = "200px";
    } else {
      nickInput.style.width = this.hiddenInput.clientWidth + "px";
    }
  }
  setColor(str) {
    this.style.setAttribute("href", "css/" + str + ".css");
  }
}















