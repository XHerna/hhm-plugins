/* Writes a game's statistics and timestamps into a text file. */
const room = HBInit();

room.pluginSpec = {
  name: `tut/gamereview`,
  author: `Herna`,
  version: `1.0.0`,
  dependencies: [
    `sav/core`,
    `tut/stats`,
    `tut/3def`,
  ],
  config: {
    endOnTimeLimit: false,
    url: 'url',
  },
};

const endOnTimeLimit = false;
let timestamps = [];
let threeDef;
let stats;
let timestart;
let gameEnded = true;

function createReview() {
  if (!gameEnded) {
    gameEnded = true;
  } else {
    return;
  };

  data = {};
  data.rec = room.stopRecording();

  let violations = threeDef.get3defViolations();
  for (let violation of violations) {
    let timestamp = {
      time: violation,
      by: 'Host',
      label: '3def',
    };
    timestamps.push(timestamp);
  }

  data.ts = timestamps.sort(function (v1, v2) {
    return v1.time - v2.time;
  });

  data.goals = stats.getGoals();
  data.distr = stats.outputDistribution();
  data.poss = stats.outputPossessionPerTeam();
  data.possPl = stats.outputPossessionPerPlayer();
  data.passes = stats.outputPassesPerPlayer();

  let xhttp = new XMLHttpRequest();
  let url = room.getConfig().url;
  xhttp.open('POST', url, true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      console.log(xhttp.response);
    }
  };

  data = JSON.stringify(data);
  xhttp.send(data);
}

room.onCommand_ts = (player, argument, argumentString) => {
  if (!room.getScores()) return;
  let timestamp = {
    time: (((new Date().getTime()) - timestart) / 1000),
    by: player.name,
    label: argumentString,
  };
  timestamps.push(timestamp);
};

room.onPlayerChat = (player, message) => {
  if (message === 'q') {
    if (!room.getScores()) return;
    let timestamp = {
      time: (((new Date().getTime()) - timestart) / 1000),
      by: player.name,
      label: '',
    };
    timestamps.push(timestamp);
    return false;
  }
};

room.onGameStart = () => {
  gameEnded = false;
  timestamps = [];
  room.startRecording();
  timestart = new Date().getTime();
};

room.onGameStop = () => {
  createReview();
};

function outputGoals() {
  goals = stats.getGoals();
  for (goal of goals) {
    room.sendChat(goal);
  }
}

room.onGameTick = () => {
  if (room.getScores().time >= room.getScores().timeLimit) {
    createReview();
  }
};

room.onRoomLink = () => {

  threeDef = room.getPlugin(`tut/3def`);
  stats = room.getPlugin(`tut/stats`);
};
