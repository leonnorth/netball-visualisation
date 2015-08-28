function rivalries(){
	chartHeight = 380;
	chartWidth = 600;
	var transDuration = 800;

		// Scales
	var yScale = d3.scale.linear().domain([0,9]).range([0,chartHeight]);
	var xScale = d3.scale.linear().domain([0,9]).range([chartWidth, 0]);

	//Cannot see finals for all years! Set it to the last year.
	if (year === "ALL YEARS"){
		year = "2013";
	}

	function clearPane(){
		// Clear everything except for the team logos in the content pane
		d3.select("#content").selectAll("g").filter(function(d){return !(this.id.contains("team_icon"))}).remove();
		// Clear everything from the g element except for the picture
		d3.select("#content").selectAll("g").selectAll(".rect").remove();
		d3.select("#content").selectAll("g").selectAll(".text").remove();
		// Return the selection of g elements holding the pictures
		return d3.select("#content").selectAll("g");
	}


	var leftover_icons = clearPane(); 

	var thisYearsWinners = [];
	for (var i = 0; i < finalStandings.get(parseInt(year)).length; i++){
		thisYearsWinners.push(finalStandings.get(parseInt(year))[i][0]);
	}

	leftover_icons.selectAll(".svgimage").transition().duration(transDuration)
		.attr("x", function(d, i){return (65) + xScale(thisYearsWinners.indexOf(d.team))})
		.attr("y", chartHeight+60 );



	// MAKE DATA: >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	var majorFinal = finalsSeason.get(parseInt(year)).majorSemi.home + " " +
	finalsSeason.get(parseInt(year)).majorSemi.score +  " " +
	finalsSeason.get(parseInt(year)).majorSemi.away;

	var majorFinalScoreWin = Math.max(
		finalsSeason.get(parseInt(year)).majorSemi.homeScore,
		finalsSeason.get(parseInt(year)).majorSemi.awayScore)

	var majorFinalScoreloser = Math.min(
		finalsSeason.get(parseInt(year)).majorSemi.homeScore,
		finalsSeason.get(parseInt(year)).majorSemi.awayScore)

	var minorFinal = finalsSeason.get(parseInt(year)).minorSemi.home + " " +
	finalsSeason.get(parseInt(year)).minorSemi.score +  " " +
	finalsSeason.get(parseInt(year)).minorSemi.away;

	var minorFinalScoreWin = Math.max(
		finalsSeason.get(parseInt(year)).minorSemi.homeScore,
		finalsSeason.get(parseInt(year)).minorSemi.awayScore)
	
	var prelimFinal = finalsSeason.get(parseInt(year)).preliminary.home + " " +
	finalsSeason.get(parseInt(year)).preliminary.score +  " " +
	finalsSeason.get(parseInt(year)).preliminary.away;

	var prelimFinalScoreWin = Math.max(
		finalsSeason.get(parseInt(year)).preliminary.homeScore,
		finalsSeason.get(parseInt(year)).preliminary.awayScore)
	
	var grandFinals = finalsSeason.get(parseInt(year)).grand.home + " " +
	finalsSeason.get(parseInt(year)).grand.score +  " " +
	finalsSeason.get(parseInt(year)).grand.away;

	var grandFinalScoreWin = Math.max(
		finalsSeason.get(parseInt(year)).grand.homeScore,
		finalsSeason.get(parseInt(year)).grand.awayScore)	
	
	var winner = winners.get(parseInt(year));
	
	var tempData = {"nodes":[
			{"name":majorFinal},
			{"name":prelimFinal},
			{"name":grandFinals},
			{"name":winner},
			{"name":minorFinal}
			],
		"links":[
			{"source":0,"target":1,"value":majorFinalScoreloser},
			{"source":1,"target":2,"value":prelimFinalScoreWin},
			{"source":2,"target":3,"value":grandFinalScoreWin},
			{"source":0,"target":2,"value":majorFinalScoreWin},
			{"source":4,"target":1,"value":minorFinalScoreWin}
		]};
	// MAKE DATA DONE <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

	var sankey = d3.sankey()
	    .nodeWidth(40)
	    .nodePadding(10)
	    .size([chartWidth, chartHeight]);

	var path = sankey.link();

	sankey
      .nodes(tempData.nodes)
      .links(tempData.links)
      .layout(32);

    var graph = svgContainer.append("g").attr("transform", function(d){return "translate(0,0)"});

  var link = graph.append("g").selectAll("link")
      .data(tempData.links)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      //.attr("transform", function(d){return "translate(40,40)"})
      .style("stroke-width", function(d){return 40})//return Math.max(1, d.dy - 10); })
	  .style("stroke", "red")
	  .style("fill", "none")
	  .style("stroke-opacity", 0.2)
      .sort(function(a, b) { return b.dy - a.dy; })
      

  link.append("title")
      .text(function(d) { return d.source.name + " -> " + d.target.name + "\n" + d.value; });

  var node = graph.append("g").selectAll("node")
      .data(tempData.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + (d.x) + "," + (d.y ) + ")"; })
    .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() { this.parentNode.appendChild(this); })
      .on("drag", dragmove))
    //.attr("transform", function(d){return "translate(40,40)"});

  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", "blue")
      .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) { return d.name + "\n" + d.value; });

  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < chartWidth / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

  function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + (d.x) + "," + (d.y = Math.max(0, Math.min((chartHeight) - (d.y), d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
  }

}