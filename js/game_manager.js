class GameManager {
  constructor(InputManager, Actuator, StorageManager, Size) {
    this.inputManager = new InputManager;
    this.storageManager = new StorageManager();
    this.actuator = new Actuator;
    this.startTiles = 2;

    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("restart", this.restart.bind(this));
    this.inputManager.on("cancel", this.cancel.bind(this));
    this.inputManager.on("resize", this.resize.bind(this));
    this.inputManager.on("updateNick", this.updateNick.bind(this));
    this.inputManager.on("setColor", this.setColor.bind(this));

    if (Size) {
      this.size = Size;
      this.storageManager.setSize(Size);
    } else {
      this.size = this.storageManager.getSize();
      this.storageManager.setSize(this.storageManager.getSize());
    }

    this.actuator.setup(this.storageManager.storage, {
      nick: this.storageManager.getNick(),
      size: this.size
    });

    this.setup();
  }
  setup() {
    let previousState = this.storageManager.getGameState();

    if (previousState) {
      this.grid = new Grid(this.size, previousState.grid.cells);
      this.score = previousState.score;
      this.over = previousState.over;
      this.won = previousState.won;
    } else {
      this.grid = new Grid(this.size);
      this.score = 0;
      this.over = false;
      this.won = false;

      this.addStartTiles();
    }

    this.actuate();
  }
  resize(newSize) {
    this.size = newSize;

    this.storageManager.setSize(newSize);

    this.actuator.setup(this.storageManager.storage, {
      nick: this.storageManager.getNick(),
      size: this.size
    });

    this.actuator.continue();
    this.setup();
  }
  restart() {
    this.storageManager.clearLastGameState();
    this.storageManager.clearGameState();
    this.actuator.continue();
    this.setup();
  }
  cancel() {
    let lastCourse = this.storageManager.getLastGameState();
    let Course = this.storageManager.getGameState();
    this.storageManager.setGameState(lastCourse);
    this.storageManager.setLastGameState(Course);
    this.actuator.continue();
    this.setup();
  }
  isGameTerminated() {
    if (this.over || (this.won)) {
      return true;
    } else {
      return false;
    }
  }
  addStartTiles() {
    for (let i = 0; i < this.startTiles; i++) {
      this.addRandomTile();
    }
  }
  addRandomTile() {
    if (this.grid.cellsAvailable()) {
      const randomEvenInt = (min, max) => Math.floor(Math.random() * ((max - min) / 2 + 1)) * 2 + min;
      let maxBukv = this.getMaxTile();
      let value;

      if (Math.random() > 0.95 && maxBukv > 20) {
        value = randomEvenInt(2, maxBukv / 2);
      } else {
        value = (Math.random() > 0.9) ? 4 : 2;
      }

      let tile = new Tile(this.grid.randomAvailableCell(), value);

      this.grid.insertTile(tile);
    }
  }
  getMaxTile() {
    let grid = this.grid.cells;
    let maxTile = 2;

    grid.forEach(function (cell, index) {
      cell.forEach(function (tile, index) {
        if (tile) {
          if (tile.value > maxTile) maxTile = tile.value;
        }
      });
    });

    return maxTile;
  }
  actuate() {
    if (this.storageManager.getBestScore() < this.score) {
      this.storageManager.setBestScore(this.score);
    }

    if (this.over) {
      const win = this.won ? 1 : 0;
      this.storageManager.clearGameState();
    } else {
      this.storageManager.setGameState(this.serialize());
    }

    this.actuator.actuate(this.grid, {
      nick: this.storageManager.getNick(),
      score: this.score,
      size: this.size,
      over: this.over,
      won: this.won,
      bestScore: this.storageManager.getBestScore(),
      terminated: this.isGameTerminated()
    });

  }
  serialize() {
    return {
      grid: this.grid.serialize(),
      score: this.score,
      over: this.over,
      won: this.won
    };
  }
  prepareTiles() {
    this.grid.eachCell(function (x, y, tile) {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  }
  moveTile(tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  }
  move(direction) {
    let self = this;

    if (this.isGameTerminated()) return;

    this.storageManager.setLastGameState(this.serialize());

    let cell, tile;

    let vector = this.getVector(direction);
    let traversals = this.buildTraversals(vector);
    let moved = false;

    this.prepareTiles();

    traversals.x.forEach(function (x) {
      traversals.y.forEach(function (y) {
        cell = { x: x, y: y };
        tile = self.grid.cellContent(cell);

        if (tile) {
          let positions = self.findFarthestPosition(cell, vector);
          let next = self.grid.cellContent(positions.next);

          if (next && next.value === tile.value && !next.mergedFrom) {
            let merged = new Tile(positions.next, tile.value + 2);
            merged.mergedFrom = [tile, next];

            self.grid.insertTile(merged);
            self.grid.removeTile(tile);

            tile.updatePosition(positions.next);

            self.score += merged.value;

            if (merged.value === 56) self.won = true;
          } else {
            self.moveTile(tile, positions.farthest);
          }

          if (!self.positionsEqual(cell, tile)) {
            moved = true;
          }
        }
      });
    });

    if (moved) {
      this.addRandomTile();
      if (this.size > 5) this.addRandomTile();

      if (!this.movesAvailable()) {
        this.over = true;
      }

      this.actuate();
    }
  }
  getVector(direction) {
    let map = {
      0: { x: 0, y: -1 }, // Up
      1: { x: 1, y: 0 }, // Right
      2: { x: 0, y: 1 }, // Down
      3: { x: -1, y: 0 } // Left
    };

    return map[direction];
  }
  buildTraversals(vector) {
    let traversals = { x: [], y: [] };

    for (let pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }

    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
  }
  findFarthestPosition(cell, vector) {
    let previous;

    do {
      previous = cell;
      cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) &&
      this.grid.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell
    };
  }
  movesAvailable() {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  }
  tileMatchesAvailable() {
    let self = this;

    let tile;

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        tile = this.grid.cellContent({ x: x, y: y });

        if (tile) {
          for (let direction = 0; direction < 4; direction++) {
            let vector = self.getVector(direction);
            let cell = { x: x + vector.x, y: y + vector.y };

            let other = self.grid.cellContent(cell);

            if (other && other.value === tile.value) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }
  positionsEqual(first, second) {
    return first.x === second.x && first.y === second.y;
  }
  updateNick (event) {
    const nickInput = event.currentTarget;
    this.storageManager.setNick(nickInput.value);
    this.actuator.resizeNickInput(event);
  }
  setColor (str) {
    this.storageManager.setStyle(str);
    this.actuator.setColor(str);
  }
}




















