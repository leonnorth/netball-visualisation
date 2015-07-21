// Maps each year to an array of sets of key:value pairs representing each game
var rawData = new Map();

// Parameters for file scanning
var startYear;
var numYears;

// Check config file on load
parseConfig();

// Check the config file for years to scan
// Automatically starts parser
function parseConfig(){
  // console.log("parseConfig reached")
  var q = queue();
  q.defer(function(callback) {
      d3.csv("config.cfg", function(d) {
        return {
          startYear: +d.FirstYear,
          endYear: +d.LastYear
        }
      }, function(error, rows) {
        startYear = rows[0].startYear;
        numYears = rows[0].endYear - startYear + 1;
        console.log("num years made: "+numYears);
        parseFiles();
        callback(null, rows);
      });
    });
}

// Parse all netball files
function parseFiles(){
  // Set up all the file names
  var filenames = [];
  for(var i = 0; i < numYears; i++){
    var year = startYear + i;
    filenames[i] = "ANZChampionshipResults/" + year + "-Table1.csv";
  }

  // Setup the queue
  var q = queue();
  // Process each file
  filenames.forEach(function(filename) {
    q.defer(function(callback) {
      d3.csv(filename, function(d) {
        return {
          round: +d.Round,
          date: d.Date,
          time: d.Time,
          home: d['Home Team'],
          score: d.Score,
          away: d['Away Team'],
          venue: d.Venue
        }
      }, function(error, rows) {
        var fileYear = startYear + filenames.indexOf(filename);
        removeByes(rows);
        objectifyData(rows, fileYear);
        rawData.set(fileYear, rows);
        callback(null, rows);
      });
    });
  });
  q.awaitAll(function(error, results) {
    // TODO: check for errors?
    processData(rawData, startYear, numYears);
    makeContainer();
  });
}

// Removes BYE lines from data set
function removeByes(d){
  for(var i = 0; i < d.length; i++){
    var record = d[i];
    if(!record.home){
      d.splice(i, 1);
    }
  }
}

// Turn string data into appropriate objects
function objectifyData(data, year){
  for(var i = 0; i < data.length; i++){
    var record = data[i];
    // Convert Scores
    var result = parseScore(record, year);
    record["homeScore"] = result[0];
    record["awayScore"] = result[1];
    record["draw"] = result[2];
    // Convert Dates
    var date = new Date(record.date);
    date.setFullYear(year);
    record["properDate"] = date;
  }
}

// Parses the score field which has several different formats - hacked to make it work, not pretty but will handle all format cases in provided data
function parseScore(game, year){
  var result = [];
  var draw = false;
  var scores = game.score.split(" ");
  // 2008 format
  if(scores.length <=2){
    // Edge Case
    if(scores[0] == "draw"){
      draw = true;
      scores.splice(0, 1);
    }
    scores = scores[0].split(/[\s\u2013-]+/);
  }
  // 2010 format
  else if(scores.length == 4){
    scores.splice(0, 1);
    scores.splice(1, 1);
  }
  // 2011 - 2013 formats
  else if(scores.length == 3){
    scores.splice(1, 1);
  }
  result[0] = parseInt(scores[0]);
  result[1] = parseInt(scores[1]);
  result[2] = draw;
  return result;
}
