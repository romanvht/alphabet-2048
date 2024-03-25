/**** Events ****/
document.getElementById('linkTop').onclick = function () {
  var storage = new LocalStorageManager;
  var topBlock = document.getElementById('top-container');
  var gameBlock = document.querySelector('.game-table');
  if (topBlock.style.display == "none") {
    topBlock.style.display = "block";
    gameBlock.style.visibility = "hidden";
    this.classList.add('selected');
    this.innerHTML = 'X';
    loadLeaderboard('https://api-alphabet.romanvht.ru/top.php?cell=' + storage.getSize(), 'top-container', true);
  } else {
    topBlock.style.display = "none";
    gameBlock.style.visibility = "visible";
    this.classList.remove('selected');
    this.innerHTML = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g id="Rating_Podium" data-name="Rating Podium"><path d="m0 58h64v6h-64z" fill="#000000" style="fill: rgb(255, 255, 255);"></path><path d="m47 20a1 1 0 0 0 -1 1v35h14v-35a1 1 0 0 0 -1-1z" fill="#000000" style="fill: rgb(255, 255, 255);"></path><path d="m47.912 11.094-.858 5.006a1 1 0 0 0 1.451 1.054l4.495-2.363 4.5 2.364a1 1 0 0 0 1.054-.076 1 1 0 0 0 .4-.978l-.858-5.007 3.638-3.545a1 1 0 0 0 -.555-1.706l-5.026-.731-2.253-4.554a1.04 1.04 0 0 0 -1.792 0l-2.253 4.554-5.026.731a1 1 0 0 0 -.555 1.706z" fill="#000000" style="fill: rgb(255, 255, 255);"></path><path d="m26 31a1 1 0 0 0 -1 1v24h14v-24a1 1 0 0 0 -1-1z" fill="#000000" style="fill: rgb(255, 255, 255);"></path><path d="m26.912 22.094-.858 5.006a1 1 0 0 0 1.451 1.054l4.495-2.363 4.495 2.364a1 1 0 0 0 1.054-.076 1 1 0 0 0 .4-.978l-.858-5.007 3.638-3.545a1 1 0 0 0 -.555-1.706l-5.026-.731-2.248-4.554a1.04 1.04 0 0 0 -1.792 0l-2.249 4.554-5.026.731a1 1 0 0 0 -.555 1.706z" fill="#000000" style="fill: rgb(255, 255, 255);"></path><path d="m5 41a1 1 0 0 0 -1 1v14h14v-14a1 1 0 0 0 -1-1z" fill="#000000" style="fill: rgb(255, 255, 255);"></path><path d="m5.912 32.094-.858 5.006a1 1 0 0 0 1.451 1.054l4.495-2.363 4.5 2.364a1 1 0 0 0 1.054-.076 1 1 0 0 0 .4-.978l-.858-5.007 3.638-3.545a1 1 0 0 0 -.555-1.706l-5.026-.731-2.253-4.554a1.04 1.04 0 0 0 -1.792 0l-2.253 4.554-5.026.731a1 1 0 0 0 -.555 1.706z" fill="#000000" style="fill: rgb(255, 255, 255);"></path></g></svg>';
  }
};

document.getElementById('nick').oninput = function () {
  var storage = new LocalStorageManager;
  var hiddenInput = document.querySelector(".hiddenInput");
  hiddenInput.textContent = this.value;

  if (hiddenInput.clientWidth < 50) {
    this.style.width = 50 + "px";
  } else if (hiddenInput.clientWidth > 200) {
    this.style.width = 200 + "px";
  } else {
    this.style.width = hiddenInput.clientWidth + "px";
  }

  storage.setNick(this.value);
}
/**** /Events ****/

function loadLeaderboard(url, IDel, sync) {
  var ajax = new XMLHttpRequest();
  ajax.open('GET', url, sync);
  ajax.onreadystatechange = function () {
    if (ajax.readyState == 4) {
      if (ajax.status == 200) {
        document.getElementById(IDel).innerHTML = ajax.responseText;
        console.log('Успешное выполнение GET запроса: ' + url + ': HTML to element #' + IDel);
      } else {
        document.getElementById(IDel).innerHTML = 'Не удалось загрузить информацию...';
        console.log('Ошибка отправки запроса GET: ' + url + ': HTML to element #' + IDel + '(' + ajax.status + ': ' + ajax.statusText + ')');
      }
    } else {
      document.getElementById(IDel).innerHTML = 'Загрузка...';
      console.log('Отправка запроса GET: ' + url + ': HTML to element #' + IDel);
    }
  }
  ajax.send(null);
}

function setColor(str) {
  var storage = new LocalStorageManager;
  storage.setStyle(str);
  document.getElementById("style").setAttribute("href", "css/" + str + ".css");
}
