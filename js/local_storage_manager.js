class LocalStorageManager {
  constructor() {
    this.bestScoreKey = "bestScore";
    this.gameStateKey = "gameState";
    this.sizeKey = "size";
    this.nickKey = "nick";
    this.styleKey = "style";
    this.storage = window.localStorage;
  }
  getSize() {
    return this.storage.getItem(this.sizeKey) || 4;
  }
  setSize(size) {
    return this.storage.setItem(this.sizeKey, size);
  }
  getBestScore() {
    return this.storage.getItem(this.bestScoreKey + this.getSize()) || 0;
  }
  setBestScore(score) {
    this.storage.setItem(this.bestScoreKey + this.getSize(), score);
  }
  setNick(str) {
    this.storage.setItem(this.nickKey, str);
  }
  getNick() {
    let storageNick = this.storage.getItem(this.nickKey);

    if (storageNick) {
      return storageNick;
    } else {
      let randID = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      let randNick = 'Игрок_' + randID;

      this.storage.setItem(this.nickKey, randNick);

      return randNick;
    }
  }
  setStyle(str) {
    this.storage.setItem(this.styleKey, str);
  }
  getStyle() {
    return this.storage.getItem(this.styleKey) || 'black';
  }
  getGameState() {
    let stateJSON = this.storage.getItem(this.gameStateKey + this.getSize());
    return stateJSON ? JSON.parse(stateJSON) : null;
  }
  setGameState(gameState) {
    this.storage.setItem(this.gameStateKey + this.getSize(), JSON.stringify(gameState));
  }
  getLastGameState() {
    let stateJSON = this.storage.getItem("last" + this.gameStateKey + this.getSize());
    return stateJSON ? JSON.parse(stateJSON) : null;
  }
  setLastGameState(gameState) {
    this.storage.setItem("last" + this.gameStateKey + this.getSize(), JSON.stringify(gameState));
  }
  clearGameState() {
    this.storage.removeItem(this.gameStateKey + this.getSize());
  }
  clearLastGameState() {
    this.storage.removeItem("last" + this.gameStateKey + this.getSize());
  }
}