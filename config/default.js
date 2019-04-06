HHM = typeof HHM === `undefined` ? {} : HHM;
HHM.baseUrl = HHM.baseUrl || `https://haxplugins.tk/`;
HHM.config = HHM.config || {};

/**
 * Include your room config here (the object that will be passed to HBInit).
 *
 * If set to false, you will have to call PluginManager#start manually with a
 * room instance to start the plugin system.
 */
HHM.config.room = {
    roomName: "FeedMe 3vs3 everyone welcome",
    maxPlayers: 9,
    playerName : ">}(o__o){<",
    public : false, // change to true for production use
    geo: {"code": "eu", "lat": 52.5192, "lon": 13.4061}
};

HHM.config.postInit = HBInit => {
    let room = HBInit();

    room.setDefaultStadium("Big");
    room.setScoreLimit(1);
    room.setTimeLimit(3);
    room.setTeamsLock(true);
};

HHM.config.plugins = {
    'sav/commands': {
        commandPrefix: `!`,
    },
    'sav/roles': {
        roles: {
            user: ``,
            captain: ``,
        },
        defaultRole: `user`,
    },
    'sav/core': {},
    'sav/plugin-control': {},
    'fm/room-control': {},
    'fm/team-manager': {
        fillStrategy: `captains`,
        resetStrategy: `ws`,
    },
};

HHM.config.repositories = [
  {
    url: `${HHM.baseUrl}plugins/hhm-plugins/`,
  },
  {
    url: `${HHM.baseUrl}testing/plugins/fm-publicbot/`,
  },
];

HHM.config.dryRun = false;

HHM.config.trueHeadless = false;

HHM.config.sendChatMaxLength = 2686;

// Load HHM if it has not already been loaded
if (typeof HHM.manager === `undefined`) {
    let s = document.createElement(`script`);
    s.src = `${HHM.baseUrl}/hhm.js`;
    document.head.appendChild(s);
}
