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
    roomName: "fm-haxball.co.uk | 4vs4 3def",
    maxPlayers: 12,
    playerName : ">}(o__o){<",
    public : false, // change to true for production use
    geo: {"code": "eu", "lat": 52.5192, "lon": 13.4061}
};

HHM.config.postInit = HBInit => {
    let room = HBInit();

    room.setDefaultStadium("Big");
    room.setScoreLimit(0);
    room.setTimeLimit(4);
    room.setTeamsLock(true);
};

HHM.config.plugins = {
    'sav/commands': {
        commandPrefix: `!`,
    },
    'sav/roles': {
        roles: {
            user: ``,
            admin: `hungryhax`,
            host: `frodo`,
        },
        defaultRole: `user`,
    },
    'sav/core': {},
    'sav/plugin-control': {},
    'fm/roompass': {
        password: `hungryhax`,
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
