/**
 * Plugin that offers some simple commands for
 * everyday use.
 * !swap: only possible for admins. swaps teams.
 * !autoswap_on: enables autoswap after game ended.
 * !rr: only possible for admins. Restarts the game.
 */
const room = HBInit();

room.pluginSpec = {
  name: `tut/simple-commands`,
  author: `Herna`,
  version: `1.0.0`,
  dependencies: [
    `sav/core`,
    `sav/commands`,
  ],
};

let autoSwap = false;
let gameEndedPeacefully = false;

room.onCommand_swap = (player) => {
  if (player.admin) {
    swapTeams();
  }
};

room.onCommand_autoswap_on = (player) => {
  if (player.admin) {
    autoSwap = true;
  }
};

room.onCommand_autoswap_off = (player) => {
  if (player.admin) {
    autoSwap = false;
  }
};

function swapTeams() {
  if (room.getScores() === null) {
    players = room.getPlayerList();
    for (i = 0; i < players.length; i++) {
      if (players[i].team == 1) {
        room.setPlayerTeam(players[i].id, 2);
      } else if (players[i].team == 2) {
        room.setPlayerTeam(players[i].id, 1);
      }
    }

    room.sendChat('Teams Swapped!');
  }
}

room.onTeamVictory = () => {
  gameEndedPeacefully = true;
};

room.onGameStop = () => {
  if (gameEndedPeacefully && autoSwap) {
    swapTeams();
  }

  gameEndedPeacefully = false;
};

room.onCommand_rr = (player) => {
  if (player.admin) {
    restartGame();
  }
};

function restartGame() {
  room.stopGame();
  room.startGame();
}
