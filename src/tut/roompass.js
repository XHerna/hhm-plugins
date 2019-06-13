/**
 * Clears the password of the room when a player joins it,
 * sets the password if no player is left in room.
 */
const room = HBInit();

room.pluginSpec = {
    name: `tut/roompass`,
    author: `Herna`,
    version: `1.0.0`,
    dependencies: [
        `sav/core`,
    ],
};

let roles;
let password;

room.onPlayerJoin = (player) => {
    players = room.getPlayerList();
    if (players.length === 2) {
        roles.addPlayerRole(player.id, `admin`, true);
        room.setPassword(null);
    }
};

room.onPlayerLeave = () => {
    players = room.getPlayerList();
    if (players.length === 1) {
        room.setPassword(password);
    }
};

room.onRoomLink = () => {
    roles = room.getPlugin(`sav/roles`);
    if (room.password === null) {
//        password = roles.getConfig().roles.admin;
        room.setPassword(password);

    }
};
