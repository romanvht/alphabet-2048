function LocalStorageManager() {
  this.bestScoreKey = "bestScore";
  this.gameStateKey = "gameState";
  this.sizeKey = "size";
  this.nickKey = "nick";
  this.styleKey = "style";
  this.storage = window.localStorage;
}

LocalStorageManager.prototype.getSize = function () {
  var s = window.location.search.match(new RegExp('size=([^&=]+)'));
  var searchSize = s ? s[1] : false;
  var size = this.storage.getItem(this.sizeKey);

  if (searchSize) {
    size = searchSize;
    this.storage.setItem(this.sizeKey, size);
  } else if (!size) {
    size = 4;
  }

  return Number(this.storage.getItem(this.sizeKey) || size);
};

LocalStorageManager.prototype.setSize = function (size) {
  return this.storage.setItem(this.sizeKey, size);
};

LocalStorageManager.prototype.getBestScore = function () {
  return this.storage.getItem(this.bestScoreKey + this.getSize()) || 0;
};

LocalStorageManager.prototype.setBestScore = function (score,) {
  this.storage.setItem(this.bestScoreKey + this.getSize(), score);
};

LocalStorageManager.prototype.setNick = function (str) {
  this.storage.setItem(this.nickKey, str);
};

LocalStorageManager.prototype.getNick = function () {
  var randID = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  var randNick = 'Игрок_' + randID;

  return this.storage.getItem(this.nickKey) || randNick;
};

LocalStorageManager.prototype.setStyle = function (str) {
  this.storage.setItem(this.styleKey, str);
};

LocalStorageManager.prototype.getStyle = function () {
  return this.storage.getItem(this.styleKey) || 'black';
};

LocalStorageManager.prototype.getGameState = function () {
  var stateJSON = this.storage.getItem(this.gameStateKey + this.getSize());
  return stateJSON ? JSON.parse(stateJSON) : null;
};

LocalStorageManager.prototype.setGameState = function (gameState) {
  this.storage.setItem(this.gameStateKey + this.getSize(), JSON.stringify(gameState));
};

LocalStorageManager.prototype.getLastGameState = function () {
  var stateJSON = this.storage.getItem("last" + this.gameStateKey + this.getSize());
  return stateJSON ? JSON.parse(stateJSON) : null;
};

LocalStorageManager.prototype.setLastGameState = function (gameState) {
  this.storage.setItem("last" + this.gameStateKey + this.getSize(), JSON.stringify(gameState));
};

LocalStorageManager.prototype.clearGameState = function () {
  this.storage.removeItem(this.gameStateKey + this.getSize());
};

LocalStorageManager.prototype.clearLastGameState = function () {
  this.storage.removeItem("last" + this.gameStateKey + this.getSize());
};
