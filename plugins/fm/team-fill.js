/**
 * Plugin which fills the teams using specified strategies.
 */
const room = HBInit();

room.pluginSpec = {
    name: `fm/team-fill`,
    author: `fm`,
    version: `1.0.0`,
    dependencies: [
        `saviola/core`, // TODO check dependencies once done
    ],
};

room.fillTeams = () => {
    let playerList = room.getPlayerList();
    let playerNumber = playerList.length - 1;

    playerList.filter(p => p.id !== 0).forEach((p) => room.setPlayerTeam(p.id, 1));

    // Debugging: just test functionality
    return playerNumber > 1;
};

/**
 * Sets the teams for the next game and starts the game.
 */
function updateTeams() {
    playerList = room.getPlayerList();
    let playerNumber = playerList.length - 1;

    playerList = playerList.filter(function (el) {
        return (subbedIns.indexOf(el) < 0);
    });
    if (playerNumber >= 6) {
        playerNumber = 6;
        room.setDefaultStadium("Big"); //big if 3vs3 is possible
    } else {
        room.setDefaultStadium("Classic"); //classic if not
        if (playerNumber % 2) {
            playerNumber--; //creates even number of players to be distributed on both teams
        }
    }
    for (i = 0; i < subbedIns.length; i++) {
        if (i <= (playerNumber / 2)) {
            room.setPlayerTeam(subbedIns[i].id, 1); //prefers players who got subbed in the match before.
        } else {
            room.setPlayerTeam(subbedIns[i].id, 2);
        }
    }
    for (i = 1; i < playerNumber + 1 - subbedIns.length; i++) {
        if (i <= ((playerNumber / 2) - subbedIns.length)) {
            room.setPlayerTeam(playerList[i].id, 1); //puts first half of players in red team, second in blue team
        } else {
            room.setPlayerTeam(playerList[i].id, 2);
        }
    }
    if (playerNumber > 1) {
        room.startGame();
    }
}

/**
 * Resets the teams. takes one player of each team at a time, so that teams get mixed through.
 */
function resetTeams() {
    const [spects, red, blue] = getPlayerListByTeam();
    for (i = 0; i < Math.max(red.length, blue.length); i++) {
        if (i < red.length) {
            room.setPlayerTeam(red[i].id, 0);
        }
        if (i < blue.length) {
            room.setPlayerTeam(blue[i].id, 0);
        }
    }
}

/*
function resetTeams() {
    players = room.getPlayerList();
    for (i = 0; i < players.length; i++){
        if(players[i].team != 0) {
            room.setPlayerTeam(players[i].id, 0);
        }
    }

    //  gut für WS, schlecht für random teams

}
*/