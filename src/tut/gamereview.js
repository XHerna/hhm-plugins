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

  data.goals = stats.getGoals();
  data.distr = stats.outputDistribution();
  data.poss = stats.outputPossessionPerTeam();
  data.possPl = stats.outputPossessionPerPlayer();
  data.passes = stats.outputPassesPerPlayer();

  room.sendAnnouncement(data.goals);
  room.sendAnnouncement(data.distr);
  room.sendAnnouncement(data.poss);
  room.sendAnnouncement(data.possPl);
  room.sendAnnouncement(data.passes);
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

room.onRoomLink = () => {

  threeDef = room.getPlugin(`tut/3def`);
  stats = room.getPlugin(`tut/stats`);
};
