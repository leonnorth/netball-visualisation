// Points for each game result
var WIN = 2;
var DRAW = 1;
var LOSS = 0;

// Teams - Index 0 to 4 = Australia, 5-9 = NZ
var TEAMS = ["West Coast Fever", "Queensland Firebirds", "New South Wales Swifts", "Adelaide Thunderbirds", "Melbourne Vixens",
            "Waikato Bay of Plenty Magic", "Northern Mystics", "Central Pulse", "Southern Steel", "Canterbury Tactix"];
// Maps each year to an array of sets of key:value pairs representing each game
var rawData;
// Maps each year to the winner of that year
var winners = new Map();
// Maps each year to an array of team standings at the end of the regular season
var regStandings = new Map();
// Maps each year to an array of team standings at the end of the finals season
var finalStandings = new Map();
// Maps each year to the games in the finals season: "majorSemi", "minorSemi", "preliminary", "grand"
var finalsSeason = new Map();
// Maps each year to a Map of teams to stats: "points", "pointsAtRound", "goalsFor", "goalsAgainst", "homeWins", "homeLosses", "awayWins", "awayLosses"
var teamStats = new Map();

// Parameters for file scanning
var startYear;
var numYears;

// Converts the given raw fixture data into more useful statistical data
function processData(d, s, n){
  rawData = d;
  startYear = s;
  numYears = n;
  // startYear = 2012;
  // numYears= 1;

  initialiseTeamStats();

  // Calculate stats for each year
    for(var i = 0; i < rawData.size; i++){
      var year = startYear + i;
      var data = rawData.get(year);
      computeGamesPlayed(year, data);
      computeWinners(year, data);
      computePoints(year, data);
      computeGoals(year, data);
      computeHomeAway(year, data);
      computeRegStandings(year);
      breakStandingsTies(year, regStandings.get(year), teamStats.get(year));
      computeFinalStandings(year, regStandings.get(year), data);
      computeFinals(year, data);
    }

    // document.getElementById("fixtures").innerHTML = "Number of Years: " + rawData.size + "<br/>" + output(rawData);

}

// Temporary function for testing data structures
function output(d){
  var heading = "**********";
  var string = '';
  for(var i = 0; i < rawData.size; i++){
    var currentYear = d.get(startYear + i);
    string += heading + (startYear + i) + " SEASON FIXTURES" + heading + "<br/>";
    for(var j = 0; j < currentYear.length; j++){
      var record = currentYear[j];
      string += record.round + ". " + record.home + " vs " + record.away + " at " + record.venue + " - " + "HOME: " + record.homeScore + " AWAY: " + record.awayScore + " DATE: " + record.properDate + " DRAW: " + record.draw + "<br/>";
    }
  }
  string += heading + "GAMES PLAYED" + heading + "<br/>";
  for(var i = 0; i < teamStats.size; i++){
    string += (startYear + i) + ":<br/>";
    for(var j = 0; j < TEAMS.length; j++){
      var team = TEAMS[j];
      var teamStat = teamStats.get(startYear + i).get(team);
      var gp = teamStat.gamesPlayed;
      string += team + ": " + gp + "<br/>";
    }
  }
  string += heading + "FINALS FIXTURES" + heading + "<br/>";
  for(var i = 0; i < finalsSeason.size; i++){
    var finals = finalsSeason.get(startYear + i);
    string += (startYear + i) + ":<br/>";
    var record = finals.minorSemi;
    string += "MinorSemi. " + record.home + " vs " + record.away + " at " + record.venue + " - " + "HOME: " + record.homeScore + " AWAY: " + record.awayScore + " DATE: " + record.properDate + " DRAW: " + record.draw + "<br/>";
    record = finals.majorSemi;
    string += "MajorSemi. " + record.home + " vs " + record.away + " at " + record.venue + " - " + "HOME: " + record.homeScore + " AWAY: " + record.awayScore + " DATE: " + record.properDate + " DRAW: " + record.draw + "<br/>";
    record = finals.preliminary;
    string += "Preliminary. " + record.home + " vs " + record.away + " at " + record.venue + " - " + "HOME: " + record.homeScore + " AWAY: " + record.awayScore + " DATE: " + record.properDate + " DRAW: " + record.draw + "<br/>";
    record = finals.grand;
    string += "GrandFinal. " + record.home + " vs " + record.away + " at " + record.venue + " - " + "HOME: " + record.homeScore + " AWAY: " + record.awayScore + " DATE: " + record.properDate + " DRAW: " + record.draw + "<br/>";
  }
  string += heading + "WINNERS" + heading + "<br/>";
  for(var i = 0; i < winners.size; i++){
    string += (startYear + i) + ": " + winners.get(startYear + i) + "<br/>";
  }
  string += heading + "REGULAR SEASON POINTS" + heading + "<br/>";
  for(var i = 0; i < regStandings.size; i++){
    string += (startYear + i) + ":<br/>";
    var record = regStandings.get(startYear + i);
    for(var j = 0; j < record.length; j++){
      var team = record[j];
      string += team[0] + ", " + team[1] + "<br/>";
    }
  }
  string += heading + "POINTS BY ROUND" + heading + "<br/>";
  for(var i = 0; i < teamStats.size; i++){
    string += (startYear + i) + ":<br/>";
    for(var j = 0; j < TEAMS.length; j++){
      var team = TEAMS[j];
      var teamStat = teamStats.get(startYear + i).get(team);
      var pointsAR = teamStat.pointsAtRound;
      string += team + ": " + pointsAR + "<br/>";
    }
  }
  string += heading + "FINAL SEASON STANDINGS" + heading + "<br/>";
  for(var i = 0; i < finalStandings.size; i++){
    string += (startYear + i) + ":<br/>";
    var record = finalStandings.get(startYear + i);
    for(var j = 0; j < record.length; j++){
      var team = record[j];
      string += team[0] + ", " + team[1] + "<br/>";
    }
  }
  string += heading + "GOALS FROM TEAMSTATS" + heading + "<br/>";
  for(var i = 0; i < teamStats.size; i++){
    string += (startYear + i) + ":<br/>";
    for(var j = 0; j < TEAMS.length; j++){
      var team = TEAMS[j];
      var teamStat = teamStats.get(startYear + i).get(team);
      var gf = teamStat.goalsFor;
      var ga = teamStat.goalsAgainst;
      string += team + " for: " + gf + ", against: " + ga + "<br/>";
    }
  }
  string += heading + "HOME/AWAY RECORDS FROM TEAMSTATS" + heading + "<br/>";
  for(var i = 0; i < teamStats.size; i++){
    string += (startYear + i) + ":<br/>";
    for(var j = 0; j < TEAMS.length; j++){
      var team = TEAMS[j];
      var teamStat = teamStats.get(startYear + i).get(team);
      string += team + " HOME: " + teamStat.homeWins + "W-" + teamStat.homeLosses + "L<br/>";
      string += team + " AWAY: " + teamStat.awayWins + "W-" + teamStat.awayLosses + "L<br/>";
     }
  }
  return string;
}

function computeGamesPlayed(year, data){
  // Iterate through teams
  for(var i = 0; i < TEAMS.length; i++){
    var team = TEAMS[i];
    var teamStat = teamStats.get(year).get(team);
    // Iterate through games for this year and count goals for and against current team
    for(var j = 0; j < data.length; j++){
      var record = data[j];
      if(record.home == team || record.away == team){
        teamStat.gamesPlayed ++;
      }
    }
  }
}

// Calculates Winner for every year
function computeWinners(year, data){
  var grandFinal = data[data.length - 1];
  var winner = gameWinner(grandFinal);
  winners.set(year, winner);
}

// Computes the winner of a given game
function gameWinner(game){
  var winner;
  if(game.homeScore == game.awayScore){
    return null; // DRAW
  }
  else if(game.homeScore > game.awayScore){
    winner = game.home; // HOME WINS
  }
  else{
    winner = game.away; // AWAY WINS
  }
  return winner;
}

// Computes the loser of a given game
function gameLoser(game, winner){
  if(game.home == winner){
    return game.away;
  }
  else{
    return game.home;
  }
}

// Calculates Points for every team in a year
function computePoints(year, data){
  var currentRound = 1;
  for(var i = 0; i < data.length; i++){
    var record = data[i];
    var round = record.round;
    // Update each team's points total for each round
    if(round != currentRound){
      updatePointsAtRoundArrays(year);
      currentRound = round;
    }
    // Rounds 15 and up are finals rounds so shouldn't count points
    if(round >= 15){
      break;
    }
    // Select winner (remains null if a draw)
    var winner = gameWinner(record);
    // Add to Points Map for this year
    // Game was a draw
    if(!winner){
      addPoints(year, record.home, DRAW);
      addPoints(year, record.away, DRAW);
    }
    // Game had a winner
    else{
    var loser;
    if(winner == record.home){
      loser = record.away;
    }
    else{
      loser = record.home;
    }
      addPoints(year, winner, WIN);
      addPoints(year, loser, LOSS);
    }
  }
}

// Updates the pointsAtRound array for each team
function updatePointsAtRoundArrays(year){
  for(var i = 0; i < TEAMS.length; i++){
    var team = TEAMS[i];
    var teamStat = teamStats.get(year).get(team);
    if(!teamStat.pointsAtRound){
      teamStat["pointsAtRound"] = [];
    }
    teamStat.pointsAtRound.push(teamStat.points);
  }
}

// Updates a given points Map for a given team with the number of points to add to their existing score
// Adds the team to the Map if they don't already exist in it
function addPoints(year, team, pointsToAdd){
  var teamStat = teamStats.get(year).get(team);
  var score = teamStat.points;
  if(!score){
    teamStat["points"] = pointsToAdd;
  }
  else{
    teamStat.points = teamStat.points + pointsToAdd;
  }
}

// Sorts pointCount to generate regular season standings for each year
function computeRegStandings(year){
  var standings = [];
  var record = teamStats.get(year);
  for(var i = 0; i < TEAMS.length; i++){
    var team = TEAMS[i];
    standings.push([team, record.get(team).points]);
  }
  var keysSorted = standings.sort(function(a,b){return b[1]-a[1]});
  regStandings.set(year, keysSorted);
}

// Uses regular season standings and updates to reflect final standings
function computeFinalStandings(year, points, data){
  var standings = [];
  var grand = data[data.length - 1];
  var preliminary = data[data.length - 2];
  var minorSemi = data[data.length - 3];
  // First place is winner of grand final
  var winner = gameWinner(grand);
  standings.push([winner, getPoints(winner, points)]);

  // Second place is loser of grand final
  var loser = gameLoser(grand, winner);
  standings.push([loser, getPoints(loser, points)]);
  // Third place is loser of preliminary final
  winner = gameWinner(preliminary);
  loser = gameLoser(preliminary, winner);
  standings.push([loser, getPoints(loser, points)]);
  // Fourth place is loser of minor semi final
  winner = gameWinner(minorSemi);
  loser = gameLoser(minorSemi, winner);
  standings.push([loser, getPoints(loser, points)]);
  // 5th to 10th place are same as regular standings
  for(var i = 4; i < points.length; i++){
    standings.push(points[i]);
  }
  finalStandings.set(year, standings);
}

// Retrieves the points scored by a given team
function getPoints(team, points){
  for(var i = 0; i < points.length; i++){
    if(points[i][0] == team){
      return points[i][1];
    }
  }
}

// Iterates through standings for a given year, reordering teams to break ties
function breakStandingsTies(year, standings, stats){
  for(var i = 0; i < standings.length; i++){
    if(i == standings.length - 1){
      break;
    }
    else{
      var current = standings[i];
      var next = standings[i+1];
      // There is a tie
      if(current[1] == next[1]){
        if(breakTie(year, standings, i)){
          i++;
        }
      }
    }
  }
}

// Breaks a tie between two teams in regular standings
// Returns true if teams were swapped
function breakTie(year, standings, index){
  // Goal Percentages
  var team1 = standings[index];
  var team2 = standings[index + 1];
  var t1Stats = teamStats.get(year).get(team1[0]);
  var t2Stats = teamStats.get(year).get(team2[0]);
  var t1Percentage = t1Stats.goalsFor / t1Stats.goalsAgainst;
  var t2Percentage = t2Stats.goalsFor / t2Stats.goalsAgainst;
  // Teams need to be swapped
  if(t1Percentage < t2Percentage){
    standings[index] = team2;
    standings[index + 1] = team1;
    return true;
  }
  return false;
}

// Calculates goals for and against every team
function computeGoals(year, data){
  // Iterate through teams
  for(var i = 0; i < TEAMS.length; i++){
    var team = TEAMS[i];
    var teamStat = teamStats.get(year).get(team);
    var scoreFor = 0;
    var scoreAgainst = 0;
    // Iterate through games for this year and count goals for and against current team
    for(var j = 0; j < data.length; j++){
      var record = data[j];
      if(record.home == team){
        scoreFor += record.homeScore;
        scoreAgainst += record.awayScore;
      }
      else if(record.away == team){
        scoreFor += record.awayScore;
        scoreAgainst += record.homeScore;
      }
    }
    // Add goal counts for each team
    teamStat["goalsFor"] = scoreFor;
    teamStat["goalsAgainst"] = scoreAgainst;
  }
}

// Calculates home/away records for every team
function computeHomeAway(year, data){
  for(var i = 0; i < TEAMS.length; i++){
    var team = TEAMS[i];
    var teamStat = teamStats.get(year).get(team);
    var homeWon = 0;
    var homeLost = 0;
    var awayWon = 0;
    var awayLost = 0;
    for(var j = 0; j < data.length; j++){
      var record = data[j];
      // Home Game
      if(record.home == team){
        if(team == gameWinner(record)){
          homeWon++;
        }
        else{
          homeLost++;
        }
      }
      // Away Game
      else if(record.away == team){
        if(team == gameWinner(record)){
          awayWon++;
        }
        else{
          awayLost++;
        }
      }
    }
    // Update team stats
    teamStat["homeWins"] = homeWon;
    teamStat["homeLosses"] = homeLost;
    teamStat["awayWins"] = awayWon;
    teamStat["awayLosses"] = awayLost;
  }
}

// Extracts the finals season games from the raw data
function computeFinals(year, data){
  var finals = [];
  finals["majorSemi"] = data[data.length - 4];
  finals["minorSemi"] = data[data.length - 3];
  finals["preliminary"] = data[data.length - 2];
  finals["grand"] = data[data.length - 1];
  finalsSeason.set(year, finals);
}

// Initialises the Team Stats map with keys ready for adding stats
function initialiseTeamStats(){
  for(var i = 0; i < numYears; i++){
    var year = startYear + i;
    var teamMap = new Map();
    for(var j = 0; j < TEAMS.length; j++){
      teamMap.set(TEAMS[j], {});
      var team = teamMap.get(TEAMS[j]);
      team.points = 0;
      team.gamesPlayed = 0;
    }
    teamStats.set(year, teamMap);
  }
}
