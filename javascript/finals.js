function finals(){
	chartHeight = 380;
	chartWidth = 650;
	var transDuration = 800;

	// Scales
	var yScale = d3.scale.linear().domain([0,9]).range([0,chartHeight]);
	var xScale = d3.scale.linear().domain([0,9]).range([chartWidth, 0]);

	//Cannot see finals for all years! Set it to the last year.
	if (year === "ALL YEARS"){
		$('#yearTabs a:last').tab('show');
		return;
	}

		var useTransitions = d3.select(".title")[0][0].textContent.contains("Finals");

	function clearPane(){
		// Clear everything except for the team logos in the content pane
		d3.select("#content").selectAll("g").filter(function(d){return !(this.id.contains("team_icon"))}).remove();
		// Clear everything from the g element except for the picture
		d3.select("#content").selectAll("g").selectAll(".rect").remove();
		d3.select("#content").selectAll("g").selectAll(".text").remove();

		return d3.select("#content").selectAll("g");
	}

	function updatePane(){
		d3.select("#content").selectAll("g").selectAll(".rect").filter(function(d){return this.id !== "gRect"}).remove();
		d3.select("#content").selectAll("g").selectAll(".text").remove();
		return d3.select("#content").selectAll("g").filter(function(d){return (this.id.contains("team_icon"))});
	}

	var leftover_icons = useTransitions ? updatePane() :  clearPane();
	leftover_icons.on("mouseover", function(d){}).on("mouseout", null);

	function drawEverything(){
		sankeyData = tempData;
		if (useTransitions){
			boxesPositions();  
			updateHeadding();
			updateGraph(sankeyData);
		}
		else{
			boxesPositions();   
			drawGraph(sankeyData);
			drawHeadding();
		}
	}

	// MAKE DATA: >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

	//major
	var majorFinal = "Major Final: " + finalsSeason.get(parseInt(year)).majorSemi.home + " " +
		finalsSeason.get(parseInt(year)).majorSemi.score +  " " +
		finalsSeason.get(parseInt(year)).majorSemi.away;

	var majorFinalScoreWin = Math.max(
		finalsSeason.get(parseInt(year)).majorSemi.homeScore,
		finalsSeason.get(parseInt(year)).majorSemi.awayScore)

	var majorFinalScoreloser = Math.min(
		finalsSeason.get(parseInt(year)).majorSemi.homeScore,
		finalsSeason.get(parseInt(year)).majorSemi.awayScore)

	var majWin = getWinner(finalsSeason.get(parseInt(year)).majorSemi);
	var majLos = getLoser(finalsSeason.get(parseInt(year)).majorSemi);
	var maj0col = teamCols[majWin];
	var maj100col = teamCols[majLos];

	//minor
	var minorFinal = "Minor Final: " + finalsSeason.get(parseInt(year)).minorSemi.home + " " +
		finalsSeason.get(parseInt(year)).minorSemi.score +  " " +
		finalsSeason.get(parseInt(year)).minorSemi.away;

	var minorFinalScoreWin = Math.max(
		finalsSeason.get(parseInt(year)).minorSemi.homeScore,
		finalsSeason.get(parseInt(year)).minorSemi.awayScore)

	var minWin = getWinner(finalsSeason.get(parseInt(year)).minorSemi);
	var minLos = getLoser(finalsSeason.get(parseInt(year)).minorSemi);
	var min0col = teamCols[minWin];
	var min100col = teamCols[minLos];

	//prelim
	var prelimFinal = "Prelininary: " + finalsSeason.get(parseInt(year)).preliminary.home + " " +
		finalsSeason.get(parseInt(year)).preliminary.score +  " " +
		finalsSeason.get(parseInt(year)).preliminary.away;

	var prelimFinalScoreWin = Math.max(
		finalsSeason.get(parseInt(year)).preliminary.homeScore,
		finalsSeason.get(parseInt(year)).preliminary.awayScore)

	var preWin = getWinner(finalsSeason.get(parseInt(year)).preliminary);
	var preLos = getLoser(finalsSeason.get(parseInt(year)).preliminary);
	var pre0col = teamCols[preWin];
	var pre100col = teamCols[preLos];
	// console.log("pre: "+preWin+" "+preLos+" cols: "+pre0col+" "+pre100col)
	
	//grand
	var grandFinals = "Grand Final: " + finalsSeason.get(parseInt(year)).grand.home + " " +
		finalsSeason.get(parseInt(year)).grand.score +  " " +
		finalsSeason.get(parseInt(year)).grand.away;

	var grandFinalScoreWin = Math.max(
		finalsSeason.get(parseInt(year)).grand.homeScore,
		finalsSeason.get(parseInt(year)).grand.awayScore)	

	var graWin = getWinner(finalsSeason.get(parseInt(year)).grand);
	var graLos = getLoser(finalsSeason.get(parseInt(year)).grand);
	var gra0col = teamCols[graWin];
	var gra100col = teamCols[graLos];
	
	//winner
	var winnerName = year + " Winner: " + winners.get(parseInt(year));
	var winner = winners.get(parseInt(year));
	var wincol = teamCols[winner];
	
	var tempData = {"nodes":[
		{"name":majorFinal, "top":maj0col, "bot":maj100col, "win":majWin, "los":majLos, "id":0},
		{"name":prelimFinal, "top":pre0col, "bot":pre100col, "win":preWin, "los":preLos, "id":1},
		{"name":grandFinals, "top":gra0col, "bot":gra100col, "win":graWin, "los":graLos, "id":2},
		{"name":winnerName, "top":wincol, "bot":wincol, "win":winner, "los":winner, "id":3},
		{"name":minorFinal, "top":min0col, "bot":min100col, "win":minWin, "los":minLos, "id":4}
		],
		"links":[
		{"source":4, "target":1, "value":2, "col":min0col, "id":0},
		{"source":0, "target":1, "value":1, "col":maj100col, "id":1},
		{"source":0, "target":2, "value":1, "col":maj0col, "id":2},
		{"source":1, "target":2, "value":1, "col":pre0col, "id":3},
		{"source":2, "target":3, "value":1, "col":gra0col, "id":4}
	]};


	var tip = d3.tip()
	    .attr("class", "d3-tip")
	    .offset([-10, 0])
	    .html(function(d) {
	    	return sankeyData.nodes[d.id].name;
	})
	svgContainer.call(tip);

	//return the winner of a game
	function getWinner(game){
		return game.homeScore > game.awayScore ? game.home : game.away;
	}
	//return the winner of a game
	function getLoser(game){
		return game.homeScore < game.awayScore ? game.home : game.away;
	}

	// MAKE DATA DONE <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

	// MAKE GRAPH VARIABLES >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	var sankey = d3.sankey()
		.nodeWidth(70)
		.nodePadding(10)
		.size([chartWidth, chartHeight]);

	var path = sankey.link();

	sankey
		.nodes(tempData.nodes)
		.links(tempData.links)
		.layout(32);

	function drawGraph(data){	
		var graph = svgContainer.append("g").attr("transform", function(d){return "translate(20,165)"});
		// MAKE GRAPH VARIABLES DONE <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

		var link = graph.append("g").selectAll("link")
			.data(data.links)
			.enter().append("path")
			.attr("class", "link")
			.attr("d", path)
	    .style("stroke-width", function(d){return 40})
			.style("stroke", function(d){return d.col})
			.style("fill", "none")
			.style("stroke-opacity", 0.5)
			.sort(function(a, b) { return b.dy - a.dy; })

		var node = graph.append("g").selectAll("node")
			.data(data.nodes)
			.enter().append("g")
			.attr("class", "node")
			.attr("transform", function(d) { return "translate(" + (d.x) + "," + (d.y ) + ")"; })
			.on("mouseover", tip.show)
      		.on("mouseout", tip.hide)
			.call(d3.behavior.drag()
				.origin(function(d) { return d; })
				.on("dragstart", function() { this.parentNode.appendChild(this); })
				.on("drag", dragmove))

		//Make gradients
	  var gradcnt = 0;
		var gradient = node.append("defs")
	  	.append("linearGradient")
	    .attr("id", function(d){return "gradient"+(gradcnt++)})
	    .attr("x1", "0%")
	    .attr("y1", "0%")
	    .attr("x2", "0%")
	    .attr("y2", "100%")
	    .attr("spreadMethod", "pad");

		gradient.append("stop")
		  .attr("id", "top")
	    .attr("offset", "0%")
	    .attr("stop-color",  function(d){ return d.top})
	    .attr("stop-opacity", 1);

		gradient.append("svg:stop")
			.attr("id", "bottom")
	    .attr("offset", "100%")
	    .attr("stop-color", function(d){ return d.bot})
	    .attr("stop-opacity", 1);

		gradcnt = 0;
	  node.append("rect")
	  	.style("cursor",  "move")
	    .attr("height", function(d) { return d.dy; })
	    .attr("width", sankey.nodeWidth())
	    .style("fill", function(d){return "url(#gradient"+(gradcnt++)+")"})
	    .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })

	    //draw team logos
	    //winner
	    node.append("image")
	    	.attr("id", "topPic")
		    .style("cursor",  "move")
				.attr("class", "svgimage")
				.attr('width', 58)
			  .attr('height', 58)
			  .attr("x", 6)
				.attr("y", 17)
			  .attr("xlink:href", function(d){return "resources/team_logos/"+d.win+".png";})

	    node.append("rect")
	 	   	.style("cursor",  "move")
	 	   	.attr("id", "gRect")
			.attr("class", "rect")
			.attr('width', 58)
			.attr('height', 44)
			.attr("x", 6)
			.attr("y", 24)
			.style("stroke", "black")
			.style("fill", "none")

			//loser
	    node.append("image")
	    	.attr("id", "bottomPic")
	    	.style("cursor",  "move")
				.attr("class", "svgimage")
				.attr('width', 58)
			  .attr('height', 58)
			  .attr("x", 6)
				.attr("y", function(d) { return d.dy-76; })
			  .attr("xlink:href", function(d){return "resources/team_logos/"+d.los+".png";})

	    node.append("rect")
		    .style("cursor",  "move")
	 	   	.attr("id", "gRect")		    
				.attr("class", "rect")
				.attr('width', 58)
			  .attr('height', 44)
			  .attr("x", 6)
				.attr("y", function(d) { return d.dy-69; })
			  .style("stroke", "black")
			  .style("fill", "none")

	  	graph.attr("opacity", 0)
			.transition().duration(transDuration)
			.attr("opacity", 1.0);

	  function dragmove(d) {
	  	d3.select(this).attr("transform", "translate(" + (d.x = d3.event.x) + "," + (d.y = d3.event.y) + ")");
	  	sankey.relayout();
	  	link.attr("d", path);
	  }
	  sankeyGraph = graph;
	}

	function updateGraph(data){
		//update curves
		svgContainer.selectAll(".link").transition().duration(transDuration)
			.style("stroke", function(d, i){return data.links[d.id].col});

		//update gradients
	  var node = svgContainer.selectAll(".node");
		var gradient = node.select("defs")

		gradient.select("#top")
	    .transition().duration(transDuration)
	    .attr("stop-color",  function(d){ return data.nodes[d.id].top})

		gradient.select("#bottom")
	    .transition().duration(transDuration)
	    .attr("stop-color", function(d){ return data.nodes[d.id].bot})

	  //update pics
	  node.select("#topPic")
	  	.transition().duration(transDuration)
	  	.attr("xlink:href", function(d){return "resources/team_logos/"+data.nodes[d.id].win+".png";})

		node.select("#bottomPic")
	  	.transition().duration(transDuration)
	  	.attr("xlink:href", function(d){return "resources/team_logos/"+data.nodes[d.id].los+".png";})

		
	}

	// draw logos in ranking order
	var thisYearsWinners = [];
	for (var i = 0; i < finalStandings.get(parseInt(year)).length; i++){
		thisYearsWinners.push(finalStandings.get(parseInt(year))[i][0]);
	}
	var logoTransCnt = leftover_icons[0].length -1;
	// leftover_icons.on("mouseover", function(d){}).on("mouseout", null);
	leftover_icons.selectAll(".svgimage").transition().duration(transDuration)
		.style("cursor",  "default")
		.attr("x", function(d, i){return (25) + xScale(thisYearsWinners.indexOf(d.team))})
		.attr("y", 95 )
		.each("end", function(d){if (!logoTransCnt--){ drawEverything();}});

	function boxesPositions(){
		leftover_icons.insert("rect", ".svgimage")
			.style("cursor",  "default")
	    // .style("cursor",  "move")
			.attr("class", "rect")
			.attr('width', 60)
		  .attr('height', 60)
		  .attr("x", function(d, i){return (24) + xScale(thisYearsWinners.indexOf(d.team))})
			.attr("y", 95 )
		  .style("fill", function(d){return teamCols[d.team]})
		  .attr("opacity", 0)
			.transition()
			.attr("opacity", 1.0);

		leftover_icons.selectAll("text").data(thisYearsWinners).enter().append("text")
			.attr("class", "text")
		  .attr("x", function(d, i){return (24) + xScale(i)})
			.attr("y", 95 )
			.style({"font-size":"15px", "fill":"black"})
			.text(function(d,i){return ordinal_suffix(i+1)})
			.attr("opacity", 0)
			.transition()
			.attr("opacity", 1.0);
	}
	
	function ordinal_suffix(i) {
	    if (i == 1 ) {
       		return i + "st";
	    }
	    if (i == 2 ) {
        	return i + "nd";
	    }
	    if (i == 3) {
        	return i + "rd";
	    }
	    return i + "th";
	}

	function updateHeadding(){
		svgContainer.select(".title").text(year + " Finals Tournament");
	}

  	function drawHeadding(){
		  	//Headding
		svgContainer.append("g").append("text")
			.attr("class", "title")
			.attr("x", 24)
			.attr("y", 50+5)
			.style({"font-size":"30px", "fill":"#7d7d7d"})
			.text(year + " Finals Tournament")
			.attr("opacity", 0)
			.transition().duration(transDuration)
			.attr("opacity", 1.0);
	}
}
var sankeyGraph;
var sankeyData;
