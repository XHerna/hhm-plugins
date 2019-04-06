/**
 * Writes a game's statistics and timestamps into a text file.
 */
const room = HBInit();

room.pluginSpec = {
    name: `fm/gamereview`,
    author: `fm`,
    version: `1.0.0`,
    dependencies: [
        `sav/core`,
        `fm/stats`,
        `fm/3def`
    ],
    config: {
        endOnTimeLimit: false,
        url: 'url',
    }
};


const endOnTimeLimit = false;
let timestamps = []
let threeDef, stats;
let timestart;
let gameEnded = true;

function createReview() {
    if(!gameEnded) {
        gameEnded = true;
    } else {
        return;
    }
    data = {};
    data.rec = room.stopRecording();

    let violations = threeDef.get3defViolations();
    for (let violation of violations) {
        let timestamp = {
            'time': violation,
            'by': "Host",
            'label': "3def"
        }
        timestamps.push(timestamp);
    }

    data.ts = timestamps.sort(function(v1, v2) {
        return v1.time - v2.time;
    });

    data.goals = stats.getGoals();
    data.distr = stats.outputDistribution();
    data.poss = stats.outputPossessionPerTeam();
    data.possPl = stats.outputPossessionPerPlayer();
    data.passes = stats.outputPassesPerPlayer();

    let xhttp = new XMLHttpRequest();
    let url = room.getConfig().url;
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            console.log(xhttp.response);
        }
    };
    data = JSON.stringify(data);
    xhttp.send(data);
}

room.onCommand_ts = (id, argument, argumentString) => {
    if (!room.getScores()) return;
    let timestamp = {
        'time': (((new Date().getTime()) - timestart) / 1000),
        'by': room.getPlayer(id).name,
        'label': argumentString,
    };
    timestamps.push(timestamp);
};

room.onPlayerChat = (player, message) => {
    if (message === "q") {
        if (!room.getScores()) return;
        let timestamp = {
            'time': (((new Date().getTime()) - timestart) / 1000),
            'by': player.name,
            'label': "",
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

    threeDef = room.getPlugin(`fm/3def`);
    stats = room.getPlugin(`fm/stats`);
};