

let restart = false;
let subbedIns = []; //players who got subbed in while game was running get prefered

function sendWelcomeMessage(player) {
    room.sendChat("Welcome " + player.name + "! FeedMe Discord: https://discord.gg/32MyWPP. Type \"votekick playername\" if someone doesn't behave.", player.id);
}

function kickInactivePlayer(player) {
    room.kickPlayer(player.id, "afk, rejoin when back");
}

room.onPlayerChat = function (player, message) {
    /*if(message == "p") {
        room.pauseGame(true);
        //when to unstop game?
        //let player sub himself?
    }*/

    if (message === "clearBans") {
        if (player.admin === true) {
            room.clearBans();
        }
    }
};

/*
    like this the teams dont get updated before the teams are completely reset.
*/
room.onPlayerTeamChange = function () {
    if (!room.getScores()) {
        const [spects, red, blue] = getPlayerListByTeam();
        if ((red.length + blue.length) === 0) {
            updateTeams();
        }
    }
};

room.onPlayerJoin = function (player) {
    sendWelcomeMessage(player);
    if (!room.getScores() && (room.getPlayerList().length === 3)) {
        updateTeams();
        room.startGame();
    } else if (room.getScores() && ((room.getPlayerList().length === 5) || (room.getPlayerList().length === 7))) {
        room.stopGame();
    }
};

room.onGameStart = function () {
    subbedIns = [];
};

room.onGameStop = function () {
    if (!restart) {
        resetTeams();
    } else {
        room.startGame();
    }
};

room.onPlayerLeave = function (player) {
    if ((player.team === 1 || player.team === 2) && room.getScores()) {
        const [spects, red, blue] = getPlayerListByTeam();
        if (spects.length > 1) {
            room.setPlayerTeam(spects[1].id, player.team);
            // TODO make configurable
            if (room.getScores().time < 30) {
                restart = true;
                room.stopGame();
                restart = false;
            } else {
                subbedIns.push(spects[1]);
            }
        } else {
            room.stopGame();
        }
        if (room.getPlayerList().length === 1) {
            room.stopGame();
        }
    }
};
/*
    3vs3 ws?
*/
