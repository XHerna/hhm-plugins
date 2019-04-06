/**
 * Plugin that tries to calculate violations of the
 * 3def-rule (as described in the FM-rules) and
 * warns the players about it.
 */
const room = HBInit();

room.pluginSpec = {
    name: `fm/3def`,
    author: `fm`,
    version: `1.0.0`,
    dependencies: [
        `sav/core`,
    ],
};

const def_defzone = 160; // default position of the 3-def line
const ball_radius = 10; // radius of the ball
const player_radius = 15; // radius of the players
const distance_ball_touch = ball_radius + player_radius + 0.1; // distance necessary for a player touching the ball
const distance_player_touch = 2 * player_radius + 0.1; // distance necessary for two players touching each other

let possession = { // saves for both teams if they are currently in possession
    1: false,
    2: false,
};
let violation = false; //saves if a violation happened in the last game tick
let violations = [];

let timestart;

let lastviolation;

/**
 * takes a list of players and
 * returns the list of players sorted by their position on the x-coordinate.
 */
function sortByPosition(players) {
    return players.sort(function(pl1, pl2) {
        return pl1.position.x - pl2.position.x;
    });
}

/**
 * returns the id of the third most forward player of a team.
 */
function thirdMostForwardPlayer(teamId) {
    const players = room.getPlayerList();
    const playersTeam = players.filter(p => p.team === teamId);
    teamSorted = sortByPosition(playersTeam);
    if (teamId === 1) {
        return teamSorted[1];
    } else return teamSorted[2];
}

/**
 * returns the id of the most forward player of a team.
 */
function mostForwardPlayer(teamId) {
    const players = room.getPlayerList();
    const playersTeam = players.filter(p => p.team === teamId);
    teamSorted = sortByPosition(playersTeam);
    if (teamId === 1) {
        return teamSorted[3];
    } else return teamSorted[0];
}

/**
 * takes a teamId(either red or blue)
 * returns opponent team.
 */
function opponentTeam(teamId) {
    if (teamId === 1) {
        return 2;
    } else {
        return 1;
    }
}

/**
 * calculates the variable 3def-line on the left side.
 */
function calculateLeftLine() {
    let new_defzone = 0 - def_defzone;
    const tmfp = thirdMostForwardPlayer(2);
    const thirdMostForwardPlayerLine = tmfp.position.x + player_radius;

    if (thirdMostForwardPlayerLine < new_defzone) {
        new_defzone = thirdMostForwardPlayerLine;
    }
    return new_defzone
}

/**
 * calculates the variable 3def-line on the left side.
 */
function calculateRightLine() {
    let new_defzone = def_defzone;
    const tmfp = thirdMostForwardPlayer(1);
    const thirdMostForwardPlayerLine = tmfp.position.x - player_radius;

    if (thirdMostForwardPlayerLine > new_defzone) {
        new_defzone = thirdMostForwardPlayerLine;
    }
    return new_defzone
}

/**
 * returns if a team touches the ball or not.
 */
function hasPossession(teamId) {
    const playersTeam = room.getPlayerList().filter(p => p.team === teamId);

    for (let i = 0; i < playersTeam.length; i++) {
        let player = playersTeam[i];
        let distanceToBall = calculateDistancePlayerBall(player);
        if (distanceToBall < distance_ball_touch) {
            return true;
        }
    }
    return false;
}

/**
 * updates possession for both teams. a team has possession if
 * it is currently touching the ball or touched the ball latest.
 */
function updatePossession() {
    redPossession = hasPossession(1);
    bluePossession = hasPossession(2);
    if (redPossession && !bluePossession) {
        possession[1] = true;
        possession[2] = false;
    } else if (bluePossession && !redPossession) {
        possession[2] = true;
        possession[1] = false;
    } else if (redPossession && bluePossession) {
        possession[1] = true;
        possession[2] = true;
    }
}

/**
 * returns the distance between two points.
 */
function calculateDistance(p1, p2) {
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * returns the distance between the center of a player and the ball.
 */
function calculateDistancePlayerBall(player) {
    return calculateDistance(player.position, room.getBallPosition());
}

/**
 * returns the distance between the center of two players.
 */
function calculateDistancePlayers(pl1, pl2) {
    return calculateDistance(pl1.position, pl2.position);
}

/**
 * returns if two players touch each other.
 */
function touchesPlayer(pl1, pl2) {
    return (calculateDistancePlayers(pl1,pl2) < distance_player_touch)
}

/**
 * returns if a player touches any of the three most forward attacking players.
 */
function touchesAttackingPlayer(player) {
    const players = room.getPlayerList();
    let opponentPlayers = players.filter(p => p.team === opponentTeam(player.team));

    let attackingPlayers = sortByPosition(opponentPlayers);
    if (player.team === 1) {
        attackingPlayers.pop();
    } else {
        attackingPlayers.shift();
    }

    for (let i = 0; i < attackingPlayers.length; i++) {
        if (touchesPlayer(player, attackingPlayers[i])) {
            return true;
        }
    }
    return false;
}

/**
 * returns the area of the pitch the ball is in (either in the 3def-zone of
 * one of the teams, or 0 if its in none).
 */
function ballInDefZone() {
    ballX = room.getBallPosition().x;
    if (ballX - ball_radius > calculateRightLine()) {
        return 2;
    } else if (ballX + ball_radius < calculateLeftLine()) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * returns if a player is in the 3def-zone.
 */
function playerInDefZone(player) {
    playerX = player.position.x;
    if (player.team === 1) {
        if (playerX - player_radius < calculateLeftLine()) {
            return true;
        }
    } else {
        if (playerX + player_radius > calculateRightLine()) {
            return true;
        }
    }
    return false;
}

/**
 * warns Players about 3def-violations.
 */
function saveViolation() {
    violations.push((new Date().getTime() - timestart) / 1000);
}

/**
 * returns true if a 3def-violation is happening.
 */
function ThreeDefViolation() {
    let defendingTeam = ballInDefZone();

    if (defendingTeam === 0) return false;
    let mfp = mostForwardPlayer(defendingTeam);

    if ((playerInDefZone(mfp) && touchesAttackingPlayer(mfp)) || (playerInDefZone(mfp) && possession[opponentTeam(defendingTeam)])) {
        return true;
    } else {
        return false;
    }
}

room.get3defViolations = () => {
    return violations;
}

room.onGameTick = () => {

    const players = room.getPlayerList();
    const playersRed = players.filter(p => p.team === 1);
    const playersBlue = players.filter(p => p.team === 2);
    if((playersRed.length !== 4 ) || (playersBlue.length !== 4)) return;

    updatePossession();

    if(ThreeDefViolation()) {
        if(!violation) {
            violation = true;
            saveViolation();
        }
    } else {
        violation = false;
    }
};

room.onGameStop = () => {
    possession[1] = false;
    possession[2] = false;
    violation = false;
};

room.onPlayerChat = (player, ms) => {

    const players = room.getPlayerList();
    const playersRed = players.filter(p => p.team === 1);
    const playersBlue = players.filter(p => p.team === 2);
    if((playersRed.length !== 4 ) || (playersBlue.length !== 4)) return;

    if (ms === "3" || ms === "4" || ms === "3def" || ms === "4def") {
        if (lastviolation !== null) {
            currentTime = (new Date().getTime() - timestart) / 1000;
            if ((currentTime - 8) < lastviolation) {
                room.sendChat("I can confirm that there was a 3def-violation!");
            } else {
                room.sendChat("@" + player.name + ", you should read the 3-def-rules again: https://i.imgur.com/h8VZA6d.png");
            }
        } else {
            room.sendChat("@" + player.name + ", you should read the 3-def-rules again: https://i.imgur.com/h8VZA6d.png");
        }
    }
}

room.onGameStart = () => {
    lastviolation = null;
    violations = [];
    timestart = new Date().getTime();
};
