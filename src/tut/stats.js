/**
 * Plugin that calculates stats of the match.
 */
const room = HBInit();

room.pluginSpec = {
  name: `tut/stats`,
  author: `Herna`,
  version: `1.0.0`,
  dependencies: [
    `sav/core`,
  ],
};

const BALL_RADIUS = 10; // radius of the ball
const PLAYER_RADIUS = 15; // radius of the players
const DISTANCE_BALL_TOUCH = BALL_RADIUS
  + PLAYER_RADIUS + 0.1; // distance necessary for a player touching the ball

let distributionBall = {
  0: 0,
  1: 0,
  2: 0,
};

let possession = {};
let possessionPerTeam = {
  1: 0,
  2: 0,
};
let passes = {};
let pass = null;
let possBuffer = 0;
let gameRunning = false;
let goalScored = false;
let lastTouch = {
  scorer: null,
  assister: null,
};
let goals = [];

room.onGameStart = () => {
  pass = null;
  lastTouch = {
    scorer: null,
    assister: null,
  };
  goals = [];
  passes = {};
  goalScored = false;
  gameRunning = false;
  possBuffer = 0;
  possession = {};
  possessionPerTeam = {
    1: 0,
    2: 0,
  };
  for (let area in distributionBall) {
    distributionBall[area] = 0;
  }
};

room.onPlayerBallKick = (player) => {
  if (!goalScored) {
    pass = player;
    checkPass(player);
    addPossession(player.id);
    updateLastTouch(player);
    possBuffer = 0;
  }
};

room.onGameTick = () => {
  if (!gameRunning) {
    if ((room.getBallPosition().x !== 0 || room.getBallPosition().y !== 0) && !goalScored) {
      gameRunning = true;
    } else {
      return;
    }
  }

  updateDistribution();
  updatePossession();
};

function updateDistribution() {
  updateBallDistribution();
}

function updateBallDistribution() {
  ball = room.getBallPosition();
  if ((ball.x === 0) && (ball.y === 0)) return;

  distributionBall[getArea(ball.x)] += 1;
}

function getArea(positionX) {
  if (positionX > 90) {
    return 2;
  } else if (positionX < -90) {
    return 1;
  } else return 0;
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

function hasPossession(player) {
  let distanceToBall = calculateDistancePlayerBall(player);
  if (distanceToBall < DISTANCE_BALL_TOUCH) {
    return true;
  }

  return false;
}

function updateLastTouch(player) {
  if (lastTouch.scorer !== null) {
    if (player.id !== lastTouch.scorer.id) {
      lastTouch.assister = lastTouch.scorer;
      lastTouch.scorer = player;
    }
  } else {
    lastTouch.scorer = player;
  }
}
/**
 * updates possession for both teams. a team has possession if
 * it is currently touching the ball or touched the ball latest.
 */
function updatePossession() {
  possBuffer += 1;
  let possPlayers = [];
  for (let player of room.getPlayerList().filter(p => p.team !== 0)) {
    if (hasPossession(player)) {
      possPlayers.push(player.id);
      checkPass(player);
      updateLastTouch(player);
    }
  }

  if (possPlayers.length > 0) {
    for (let i = 0; i < possPlayers.length; i++) {
      addPossession(possPlayers[i]);
    }
  }
}

function addPossession(playerId) {
  possessionPerTeam[room.getPlayer(playerId).team] += possBuffer;
  if (possession[playerId] === undefined) {
    possession[playerId] = possBuffer;
  } else {
    possession[playerId] += possBuffer;
  }
}

function checkPass(player) {
  if (pass !== null && pass.id !== player.id) {
    if (passes[pass.id] === undefined) {
      passes[pass.id] = {
        overall: 1,
        succ: 0,
      };
    } else {
      passes[pass.id].overall += 1;
    }

    if (player.team === pass.team) {
      passes[pass.id].succ += 1;
    }

    pass = null;
  }
}

room.onTeamGoal = (teamId) => {
  gameRunning = false;
  goalScored = true;
  pass = null;
  room.sendChat(addGoal(teamId));
};

function addGoal(teamId) {
  scores = room.getScores();
  output = '' + scores.red + '-' + scores.blue + ' - ';
  if (lastTouch.scorer.team !== teamId) {
    output = output + 'Owngoal by: ' + lastTouch.scorer.name;
  } else {
    output = output + 'Goal by: ' + lastTouch.scorer.name;
  }

  if (lastTouch.assister !== null) {
    if (lastTouch.assister.team === teamId) {
      output = output + ', Assist by: ' + lastTouch.assister.name;
    }
  }

  goals.push(output);
  return output;
}

room.onPositionsReset = () => {
  goalScored = false;
  lastTouch = {
    scorer: null,
    assister: null,
  };
};

room.getGoals = () =>  goals;

room.onCommand_stats_help = () => {
  room.sendChat('distr: Distribution of ball on pitch, divided into three areas.' +
   'poss: Possession by teams. poss players: Possession by players.');
};

room.onCommand_stats_distr = () => {
  room.sendChat(room.outputDistribution());
};

room.onCommand_stats_poss = () => {
  room.sendChat(room.outputPossessionPerTeam());
};

room.onCommand_stats_poss_players = () => {
  room.sendChat(room.outputPossessionPerPlayer());
};

room.onCommand_stats_passes_players = () => {
  room.sendChat(room.outputPassesPerPlayer());
};

room.outputDistribution = () => {
  let distrPerc = calculatePercentage(distributionBall);
  return ('Distribution: ' + distrPerc[1] + ' % | ' + distrPerc[0] + '% | ' + distrPerc[2] + '%');
};

room.outputPossessionPerPlayer = () => {
  let possPerc = calculatePercentage(possession);
  output = 'Possession:';
  let players = Object.keys(possPerc);
  players.sort(function (pl1, pl2) {
    return possPerc[pl1] - possPerc[pl2];
  });

  for (let player of players) {
    output = output + ' ' + room.getPlayer(player).name + ': ' + possPerc[player] + '%,';
  }

  output = output.slice(0, -1);
  return output;
};

room.outputPassesPerPlayer = () => {
  output = 'Successful Passes:';
  for (let player in passes) {
    percentage = ((100 / passes[player].overall) * passes[player].succ).toFixed(2);
    output = output + ' ' + room.getPlayer(player).name + ': ' + passes[player].succ +
     '/' + passes[player].overall + '=' + percentage + '%,';
  }

  output = output.slice(0, -1);
  return output;
};

room.outputPossessionPerTeam = () => {
  let possPerc = calculatePercentage(possessionPerTeam);
  return ('Possession: ' + possPerc[1] + '% | ' + possPerc[2] + '%');
};

/**
 * takes a map of names and counters and returns map of names and percentage.
 */
function calculatePercentage(object) {
  let objectPerc = {};
  let sum = 0;
  for (let key in object) {
    sum = sum + object[key];
  }

  for (let key in object) {
    let perc = 100 / sum * object[key];
    objectPerc[key] = perc.toFixed(2);
  }

  return objectPerc;
}
