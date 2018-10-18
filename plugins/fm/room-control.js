/**
 * Fully automated room control script.
 */
const room = HBInit();

room.pluginSpec = {
    name: `fm/room-control`,
    author: `fm`,
    version: `1.0.0`,
    dependencies: [
        `saviola/core`,
        `fm/afk-monitor`,
        `fm/team-fill`,
    ],
};

const States = {
  LOADED: 0,
  LOBBY: 1,
  GAME: 2,
  PAUSED: 3,
};

let state = States.LOADED;

// Plugins for team filling and afk monitoring, will be set in onLoad
let teamFiller, afkMonitor;

// Keeps track of how many attempts have been made to fill the teams
let teamFillAttempts = 0;

/**
 * Functions called to check the room depending on the current state.
 *
 * If the function changes the room state, the next room state will also be checked immediately, so
 * make sure to avoid cycles.
 */
const checkRoomState = {};

checkRoomState[States.LOADED] = () => {
    room.stopGame();
    state = States.LOBBY;
};

checkRoomState[States.LOBBY] = () => {
    // Try to fill teams
    if (teamFiller.fillTeams()) {
        // if successful, start game and change state to GAME
        room.startGame();
        state = States.GAME;
    }

    teamFillAttempts++;
};

checkRoomState[States.GAME] = () => {
    teamFillAttempts = 0;

    // make sure kick-offs are executed
    // prevent over-long overtimes?
    // go to lobby state if game has ended?
};

checkRoomState[States.PAUSED] = () => {

    // paused means a player left or was kicked, so try to fill teams
    if (teamFiller.fillTeams()) {
        room.pauseGame(false);
        state = States.GAME;
    }


    teamFillAttempts++;

    // if there are not enough players, go back to lobby after 10 attempts
    if (teamFillAttempts > 10) {
        room.stopGame();
        state = States.LOBBY;
    }
};

room.onLoad = () => {
  teamFiller = room.getPlugin(`fm/team-fill`);
  afkMonitor = room.getPlugin(`fm/afk-monitor`);
};

room.onGamePause = () => {
    state = States.PAUSED;
};

/**
 * Function checks the room state every 5 seconds.
 */
room.onCron5Seconds = () => {
    const stateBefore = state;

    checkRoomState[state]();

    if (stateBefore !== state) {
        room.onCron5Seconds();
    }
};