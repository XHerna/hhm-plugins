/**
 * Plugin which offers functions to fill and reset the teams using specified strategies.
 */
const room = HBInit();

room.pluginSpec = {
    name: `fm/team-manager`,
    author: `fm`,
    version: `1.0.0`,
    dependencies: [
        `sav/core`, // TODO check dependencies once done
        `sav/roles`,
    ],
    config: {
        fillStrategy: 'auto',
        resetStrategy: 'default',
    }
};

const fillStrategy = {
    'auto': fillTeamsAuto,
    'captains': fillTeamsCaptains,
};

const resetStrategy = {
    'default': resetBothTeams,
    'ws': resetLoserTeam,
};

let chooseTeamActive = {
    1: false,
    2: false,
};

let redWon = false;

let numPlayersFull = 3;

function fillTeamsAuto() {
    return(fillTeamAuto(1) && fillTeamAuto(2));
}

function fillTeamsCaptains() {
    let fillRed = fillTeamCaptains(1);
    let fillBlue = fillTeamCaptains(2);
    return (fillRed && fillBlue);
}

room.setNumPlayersFull = (numPlayersFullNew) => {
    numPlayersFull = numPlayersFullNew;
};

function fillTeamCaptains(id) {
    const players = room.getPlayerList();
    const playersTeam = players.filter(p => p.team === id);
    const playersSpec = players.filter(p => p.team === 0).filter(p => p.id !== 0);

    if (playersTeam.length === numPlayersFull) {
        return true;
    }

    if ((players.filter(p => p.team === id).length === 0) && (playersSpec.length > 0)) {
        let p = playersSpec.shift();
        room.setPlayerTeam(p.id, id);

        roles.addPlayerRole(p.id, `captain`);
        room.sendChat(p.name + " is now captain. Type '#' and choose a player with arrow keys and tab.");

        updateChooseTeamsActive();
    }

    return false;
}

function updateChooseTeamsActive() {
    updateChooseTeamActive(1);
    updateChooseTeamActive(2);
}

function updateChooseTeamActive(id) {
    const players = room.getPlayerList();
    const playersTeam = players.filter(p => p.team === id);
    const playersOpponents = players.filter(p => p.team !== 0).filter(p => p.team !== id);

    chooseTeamActive[id] = false;

    if ((playersTeam.length < numPlayersFull) && (playersTeam.length <= playersOpponents.length)) {
        chooseTeamActive[id] = true;
    }
}

room.onPlayerChat = (player, message) => {
    if (roles.hasPlayerRole(player.id,`captain`) && chooseTeamActive[player.team]) {

        if (message.startsWith("#")) {
            let id = parseInt(message.substring(1));

            const findPlayer = room.getPlayerList().filter(p => p.team === 0).filter(p => p.id === id);

            let p = findPlayer.shift();
            if (p !== undefined) {
                room.setPlayerTeam(p.id, player.team);
                fillTeamCaptains(player.team, 3);
            }
            updateChooseTeamsActive();
        }

    }
};

room.onPlayerLeave = (player) => {

    if (roles.hasPlayerRole(player.id, `captain`)) {
        const playersTeam = room.getPlayerList().filter(p => p.team === player.team);

        if (playersTeam.length > 0) {
            let newCaptain = playersTeam[0];

            roles.addPlayerRole(newCaptain.id, `captain`);
            room.sendChat(newCaptain.name + " is now captain. Type '#' and choose a player with arrow keys and tab.");

            updateChooseTeamsActive();
        }
    }
};

function fillTeamAuto(id) {
    const players = room.getPlayerList();
    const numPlayersCurrent = players.filter(p => p.team === id).length;
    const playersSpec = players.filter(p => p.team === 0).filter(p => p.id !== 0);

    let p;
    for (let i = numPlayersCurrent; i < numPlayersFull; i++) {
        p = playersSpec.shift();
        if (p === undefined) return false;
        room.setPlayerTeam(p.id, id);
    }

    return true;
}

function resetBothTeams() {
    resetTeam(1);
    resetTeam(2);
}

function resetLoserTeam() {
    if (redWon) {
        resetTeam(2);
    } else resetTeam(1);
}

function resetTeam(id) {
    const players = room.getPlayerList();
    const playersTeam = players.filter(p => p.team === id);
    let numberPlayers = playersTeam.length

    let p;
    for (let i = 0; i < numberPlayers; i++) {

        p = playersTeam.shift();
        room.setPlayerTeam(p.id, 0);

        if (roles.hasPlayerRole(p.id, `captain`)) {
            roles.removePlayerRole(p.id, `captain`);
        }
    }
}

room.onTeamVictory = (scores) => {
    if (scores.red > scores.blue) {
        redWon = true;
    } else redWon = false;
};

room.onRoomLink = () => {
    room.fillTeams = fillStrategy[room.getConfig().fillStrategy];
    room.resetTeams = resetStrategy[room.getConfig().resetStrategy];
    roles = room.getPlugin(`sav/roles`);
};
