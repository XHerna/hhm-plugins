/**
 * Plugin that calculates stats of the match.
 */
const room = HBInit();
const SHAME = [
    "No one likes you!"
];

const GLORY = [
    "Let's rock and roll!"
];

room.pluginSpec = {
    name: `tut/reactions`,
    author: `Herna`,
    version: `1.0.0`,
    dependencies: [
        `sav/core`,
    ],
};


room.getShameString = function () {
    return SHAME[Math.floor(Math.random() * SHAME.length - 1) + 1];
};

room.getGloryString = function () {
    return GLORY[Math.floor(Math.random() * GLORY.length - 1) + 1];
};
