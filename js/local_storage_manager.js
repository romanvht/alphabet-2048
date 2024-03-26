function LocalStorageManager() {
  this.bestScoreKey = "bestScore";
  this.gameStateKey = "gameState";
  this.sizeKey = "size";
  this.nickKey = "nick";
  this.styleKey = "style";
  this.storage = window.localStorage;
}

LocalStorageManager.prototype.getSize = function () {
  return this.storage.getItem(this.sizeKey) || 4;
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
  let storageNick = this.storage.getItem(this.nickKey);

  if(storageNick){
    return storageNick;
  }else{
    let randID = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    let randNick = 'Игрок_' + randID;

    this.storage.setItem(this.nickKey, randNick);

    return randNick;
  }
};

LocalStorageManager.prototype.setStyle = function (str) {
  this.storage.setItem(this.styleKey, str);
};

LocalStorageManager.prototype.getStyle = function () {
  return this.storage.getItem(this.styleKey) || 'black';
};

LocalStorageManager.prototype.getGameState = function () {
  let stateJSON = this.storage.getItem(this.gameStateKey + this.getSize());
  return stateJSON ? JSON.parse(stateJSON) : null;
};

LocalStorageManager.prototype.setGameState = function (gameState) {
  this.storage.setItem(this.gameStateKey + this.getSize(), JSON.stringify(gameState));
};

LocalStorageManager.prototype.getLastGameState = function () {
  let stateJSON = this.storage.getItem("last" + this.gameStateKey + this.getSize());
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
