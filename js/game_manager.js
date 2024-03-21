function GameManager(InputManager, Actuator, StorageManager) {
  this.inputManager = new InputManager;
  this.storageManager = new StorageManager();
  this.size = this.storageManager.getSize();
  this.actuator = new Actuator;

  this.startTiles = 2;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("cancel", this.cancel.bind(this));

  this.setup();
}

GameManager.prototype.restart = function () {
  this.storageManager.clearLastGameState();
  this.storageManager.clearGameState();
  this.actuator.continue();
  this.setup();

  /**** YaGames ADS ****/
  if (domain.indexOf("yandex") !== -1) {
    YaGames.init().then(ysdk => ysdk.adv.showFullscreenAdv());
  }
};

GameManager.prototype.cancel = function () {
  var lastCourse = this.storageManager.getLastGameState();
  var Course = this.storageManager.getGameState();
  this.storageManager.setGameState(lastCourse);
  this.storageManager.setLastGameState(Course);
  this.actuator.continue();
  this.setup();
};

GameManager.prototype.isGameTerminated = function () {
  if (this.over || (this.won)) {
    return true;
  } else {
    return false;
  }
};

GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();

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

  this.actuator.setup({
    nick: this.storageManager.getNick(),
    size: this.size
  });

  this.actuate();
};

GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    const randomEvenInt = (min, max) => Math.floor(Math.random() * ((max - min) / 2 + 1)) * 2 + min
    var maxBukv = this.getMaxTile();
    var value;

    if (Math.random() > 0.95 && maxBukv > 20) {
      value = randomEvenInt(2, maxBukv / 2);
    } else {
      value = (Math.random() > 0.9) ? 4 : 2;
    }

    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

GameManager.prototype.getMaxTile = function () {
  var grid = this.grid.cells;
  var maxTile = 2;

  grid.forEach(function (cell, index) {
    cell.forEach(function (tile, index) {
      if (tile) {
        if (tile.value > maxTile) maxTile = tile.value;
      }
    });
  });

  return maxTile;
};

GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }

  if (this.over) {
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

};

GameManager.prototype.serialize = function () {
  return {
    grid: this.grid.serialize(),
    score: this.score,
    over: this.over,
    won: this.won
  };
};

GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

GameManager.prototype.move = function (direction) {
  var self = this;

  if (this.isGameTerminated()) return;

  this.storageManager.setLastGameState(this.serialize());

  var cell, tile;

  var vector = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved = false;

  this.prepareTiles();

  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next = self.grid.cellContent(positions.next);

        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value + 2);
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
};

GameManager.prototype.getVector = function (direction) {
  var map = {
    0: { x: 0, y: -1 }, // Up
    1: { x: 1, y: 0 },  // Right
    2: { x: 0, y: 1 },  // Down
    3: { x: -1, y: 0 }   // Left
  };

  return map[direction];
};

GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  do {
    previous = cell;
    cell = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
    this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell = { x: x + vector.x, y: y + vector.y };

          var other = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true;
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
