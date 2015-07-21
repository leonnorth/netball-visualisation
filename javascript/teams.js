function teams(){
  if(year == "ALL YEARS"){
    drawTeams(team, year, generateAllYears(team));
  }
  else{
    var currentYear = parseInt(year);
    drawTeams(team, currentYear, generateSingleYear(team, currentYear));
  }
}

function drawTeams(team, year, stats){

  var margin = {top: 50, right: 50, bottom: 10, left: 50},
    width = 780 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  var vertSpacing = 50,
      barCentre = 0.6 * width,
      barHeight = 40,
      barRange = 200,
      labelMargin = 0.2 * width;

  var x = d3.scale.linear()
      .range([0, width]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("top");

  var colors = {"left":"#009900", "right":"#FF3300"};

  var labels = [];
    labels.push({"label":"Goals Scored"});
    labels.push({"label":"Home Record"});
    labels.push({"label":"Away Record"});
    labels.push({"label":"Average Goals per Game"});

  svgContainer.append("g").append("text")
    .attr("class", "title")
    .attr("x", 2 / 3 * width)
    .attr("y", yBuffer+5)
    .style("text-anchor", "middle")
    .style({"font-size":"30px", "fill":"#7d7d7d"})
    .text(team + " Statistics for " + year);

  var tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(function(d) {
      if(d.label == "Average Goals For" || d.label == "Average Goals Against"){
	return d.label + ": " + d.value.toFixed(2);
      }
      return d.label + ": " + d.value;
  })

  svgContainer.call(tip);

  function getWidth(index){
    var dval = stats[index].value;
    var nval;
    if(index % 2 == 0) nval = stats[index + 1].value;
    else nval = stats[index - 1].value;
    var max = dval > nval ? dval : nval;
    var widthScale = d3.scale.linear()
      .domain([0, max])
      .range([0, barRange / 2]);
    return widthScale(dval);
  }

  var bars = svgContainer.append("g").selectAll(".bar")
      .data(stats)
    .enter().append("rect")
      .attr("x", function(d, i) {
        return barCentre;
      })
      .attr("y", function(d, i) {
        if(i % 2 == 0) return i * vertSpacing;
        return (i - 1) * vertSpacing;
      })
      .attr("fill", function(d, i) {
        if(i % 2 == 0) return colors.left;
        return colors.right;
      })
      .attr("width", function(d, i) {
        return 0;
      })
      .attr("height", barHeight)
      .attr("transform", "translate(0, 100)");

  bars.on("mouseover", tip.show)
      .on("mouseout", tip.hide);

  // Animate bars
  bars.transition()
      .attr("width", function(d, i) {
        return getWidth(i);
      })
      .attr("x", function(d, i) {
        if(i % 2 == 0) return barCentre - getWidth(i);
        return barCentre;
      })
      // .ease("elastic")
      .ease("linear")
      .duration(500)

  // Add Bar Labels
  svgContainer.append("g").selectAll("text")
    .data(labels).enter().append("text")
    .attr("class", "labels")
    .attr("x", labelMargin)
    .attr("y", function(d, i){ return i * vertSpacing * 2 - 0.6 * barHeight; })
    .attr("transform", "translate(0, " + (100 + vertSpacing) + ")")
    .style("text-anchor", "middle")
    .style({"font-size":"15px", "fill":"#7d7d7d"})
    .text(function(d){ return d.label; });
}

function generateSingleYear(team, year){
  var stats = [];
  var yearStats = teamStats.get(year).get(team);
  stats.push({"label":"Goals For", "value":yearStats.goalsFor});
  stats.push({"label":"Goals Against", "value":yearStats.goalsAgainst});
  stats.push({"label":"Home Wins", "value":yearStats.homeWins});
  stats.push({"label":"Home Losses", "value":yearStats.homeLosses});
  stats.push({"label":"Away Wins", "value":yearStats.awayWins});
  stats.push({"label":"Away Losses", "value":yearStats.awayLosses});
  var gamesPlayed = yearStats.gamesPlayed;
  stats.push({"label":"Average Goals For", "value":yearStats.goalsFor / gamesPlayed});
  stats.push({"label":"Average Goals Against", "value":yearStats.goalsAgainst / gamesPlayed});
  return stats;
}

function generateAllYears(team){
  var stats = generateSingleYear(team, startYear);
  var gamesPlayed = teamStats.get(startYear).get(team).gamesPlayed;
  for(var i = 1; i < numYears; i++){
    var yearStats = teamStats.get(startYear + i).get(team);
    gamesPlayed += yearStats.gamesPlayed;
    stats[0].value += yearStats.goalsFor;
    stats[1].value += yearStats.goalsAgainst;
    stats[2].value += yearStats.homeWins;
    stats[3].value += yearStats.homeLosses;
    stats[4].value += yearStats.awayWins;
    stats[5].value += yearStats.awayLosses;
  }
  stats[6].value = stats[0].value / gamesPlayed;
  stats[7].value = stats[1].value / gamesPlayed;
  return stats;
}
