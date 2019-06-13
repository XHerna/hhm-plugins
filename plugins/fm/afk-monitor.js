const afkTimeout = 20000; //time until afk-kick in ms
let afkCheck = {}; //saves afk time for each player in the game

/*
    starts afk-Timer for all players.
*/
function initializeAfkCheck() {
  players = room.getPlayerList();
  for (i = 1; i < players.length; i++) {
    if(players[i].team !== 0) {
      afkCheck[players[i].id] = setTimeout(kickInactivePlayer, afkTimeout, players[i]);
    }
  }
}

room.onGameStart = function() {
  initializeAfkCheck();
};

room.onGameStop = function () {
    let players = room.getPlayerList();
    for (i = 0; i < players.length; i++) {
        clearTimeout(afkCheck[players[i].id]);
    }
    afkCheck = {};
};


room.onPlayerActivity = function (player) {
    if (player.team !== 0) {
        clearTimeout(afkCheck[player.id]);
        afkCheck[player.id] = setTimeout(kickInactivePlayer, afkTimeout, player);
    }
};

room.onPlayerLeave = function (player) {
    delete afkCheck[player.id];
};
