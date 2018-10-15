let votekickTimes = {}; //saves time for each votekick-proposal until it runs out
let votekickCount = {}; //saves a list of players who voted for the kick
const votekickTimeout = 30000; //time until votekick-proposal runs out in ms

const room = HBInit();

/*
    empties list of players who voted for kick for certain player.
*/
function votekickRemove(player) {
  votekickCount[player.id] = []
}

/*
    kicks player if more than 50% of the players voted for it.
*/
function votekickCheck(player) {
  if (votekickCount[player.id].length*2 >= room.getPlayerList().length) {
    room.kickPlayer(player.id, "votekick", false);
  } else {
    room.sendChat("Votekick count for " + player.name + " is: " + votekickCount[player.id].length)
  }
}

room.onPlayerChat = function(player, message) {
  /*if(message == "p") {
      room.pauseGame(true);
      //when to unstop game?
      //let player sub himself?
  }*/

  if(message === "clearBans") {
    if(player.admin === true){
      room.clearBans();
    }
  }
  if(message.startsWith("votekick")) {
    playerFound = false;
    players = room.getPlayerList();
    for (i = 1; i < players.length; i++) {
      if (message === ("votekick " + players[i].name)) {
        playerFound = true;
        if(votekickCount[players[i].id].indexOf(players[i]) === -1) {
          votekickCount[players[i].id].push(player)
        }
        votekickTimes[players[i].id] = setTimeout(votekickRemove, votekickTimeout, players[i]);
        votekickCheck(players[i]);
      }
    }
    if(playerFound === false) {
      players = room.getPlayerList();
      playersString = "";
      for (i = 1; i < players.length; i++) {
        playersString = playersString + players[i].name + " ";
      }
      room.sendChat("Who should be kicked?" + playersString);
    }
  }

};

room.onPlayerJoin = function (player) {
    votekickCount[player.id] = [];
};

room.onPlayerLeave = function (player) {
    /*
        delete players votes also.
    */
    delete votekickCount[player.id];
    delete votekickTimes[player.id];
};