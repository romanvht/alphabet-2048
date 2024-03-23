function HTMLActuator() {
  this.gridContainer = document.querySelector(".grid-container");
  this.tileContainer = document.querySelector(".tile-container");
  this.scoreContainer = document.querySelector(".score-container");
  this.bestContainer = document.querySelector(".best-container");
  this.nickContainer = document.querySelector(".nick-container");
  this.messageContainer = document.querySelector(".game-message");
  this.advertContainer = document.querySelector(".advert-container");

  this.sizeStyle = document.getElementById("size");

  this.score = 0;
}

HTMLActuator.prototype.setup = function (storage, metadata) {
  var self = this;

  document.getElementById("link" + metadata.size).classList.add("selected");
  self.sizeStyle.setAttribute("href", "css/" + metadata.size + ".css?");
  self.updateNick(metadata.nick);
  self.gridContainer.innerHTML = '';

  for (let row = 1; row <= metadata.size; row++) {
    var rowDiv = document.createElement('div');
    rowDiv.classList.add('grid-row');

    for (let cell = 1; cell <= metadata.size; cell++) {
      var cellDiv = document.createElement('div');
      cellDiv.classList.add('grid-cell');
      rowDiv.append(cellDiv);
    }

    self.gridContainer.append(rowDiv);
  }

  /**** Костыль для SDK ****/
  if (storage.getItem('mode') == 'yandex') {
    sdk.onload = function () {
      YaGames.init().then(ysdk => {
        ysdk.getPlayer().then(_player => {
          var player = _player.getName();

          if (player) {
            storage.setItem('nick', player);
            self.updateNick(player, true);

            console.log('Get yandex nickname: ' + player);
          }
        });

        ysdk.features.LoadingAPI?.ready();
      });
    }
  }
  /**** /Костыль для SDK ****/

  console.log('Game Ready');
};

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

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
        self.postLeaderboard("https://api-alphabet.romanvht.ru/post.php?name=" + metadata.nick + "&size=" + metadata.size + "&score=" + metadata.score + "&win=0", true);
        self.message(false);
      } else if (metadata.won) {
        self.postLeaderboard("https://api-alphabet.romanvht.ru/post.php?name=" + metadata.nick + "&size=" + metadata.size + "&score=" + metadata.score + "&win=1", true);
        self.message(true);
      }
    }
  });
};

HTMLActuator.prototype.postLeaderboard = function (url, sync) {
  var ajax = new XMLHttpRequest();
  ajax.open('GET', url, sync);
  ajax.onreadystatechange = function () {
    if (ajax.readyState == 4) {
      if (ajax.status == 200) {
        console.log('Успешное выполнение GET запроса: ' + url);
      } else {
        console.log('Ошибка отправки запроса GET: ' + url + '(' + ajax.status + ': ' + ajax.statusText + ')');
      }
    } else {
      console.log('Отправка запроса GET: ' + url);
    }
  }
  ajax.send(null);
}

HTMLActuator.prototype.continue = function () {
  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "restart");
  }

  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper = document.createElement("div");
  var inner = document.createElement("div");
  var position = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 56) classes.push("tile-super");

  this.applyClasses(wrapper, classes);
  var outputtext = new Array();
  outputtext[0] = "";
  outputtext[1] = "A";
  outputtext[2] = "Б";
  outputtext[3] = "В";
  outputtext[4] = "Г";
  outputtext[5] = "Д";
  outputtext[6] = "Е";
  outputtext[7] = "Ж";
  outputtext[8] = "З";
  outputtext[9] = "И";
  outputtext[10] = "К";
  outputtext[11] = "Л";
  outputtext[12] = "М";
  outputtext[13] = "Н";
  outputtext[14] = "О";
  outputtext[15] = "П";
  outputtext[16] = "Р";
  outputtext[17] = "С";
  outputtext[18] = "Т";
  outputtext[19] = "У";
  outputtext[20] = "Ф";
  outputtext[21] = "Х";
  outputtext[22] = "Ц";
  outputtext[23] = "Ч";
  outputtext[24] = "Ш";
  outputtext[25] = "Ы";
  outputtext[26] = "Э";
  outputtext[27] = "Ю";
  outputtext[28] = "Я";
  outputtext[29] = "∞";
  outputtext[30] = "∞²";

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
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateNick = function (nick, disable) {
  var hiddenInput = document.querySelector(".hiddenInput");
  hiddenInput.textContent = nick;

  var nickContainer = document.getElementById("nick");
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

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;
  if (this.score > 9999) {
    this.scoreContainer.textContent = Math.round(this.score / 100) / 10 + "т";
  } else {
    this.scoreContainer.textContent = this.score;
  }
  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  if (bestScore > 9999) {
    this.bestContainer.textContent = Math.round(bestScore / 100) / 10 + "т";
  } else {
    this.bestContainer.textContent = bestScore;
  }
};

HTMLActuator.prototype.message = function (won) {
  var type = won ? "game-won" : "game-over";
  var message = won ? "Победа!" : "Ваш счет: " + this.score;

  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "end", type, this.score);
  }

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
  this.advertContainer.innerHTML = 'При перезапуске будет показана реклама';
};

HTMLActuator.prototype.clearMessage = function () {
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

