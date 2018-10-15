/*
    resets the teams. takes one player of each team at a time, so that teams get mixed through.
*/
function resetTeams() {
  const [spects, red, blue] = getPlayerListByTeam();
  for (i = 0; i < Math.max(red.length, blue.length); i++){
    if (i < red.length) {
      room.setPlayerTeam(red[i].id, 0);
    }
    if (i < blue.length) {
      room.setPlayerTeam(blue[i].id, 0);
    }
  }
}
/*
function resetTeams() {
    players = room.getPlayerList();
    for (i = 0; i < players.length; i++){
        if(players[i].team != 0) {
            room.setPlayerTeam(players[i].id, 0);
        }
    }

    //  gut für WS, schlecht für random teams

}
*/