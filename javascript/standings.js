function standings(){
	if (year === "ALL YEARS"){
		standingsAllYears();
	}
	else{
		standingsByYear();
	}
}

function standingsAllYears(){

	// Clear everything except for the team icons
	function clearPane(){
		// Clear everything except for the team logos in the content pane
		d3.select("#content").selectAll("g").filter(function(d){return !this.id.contains("team_icon")}).remove();
		// Clear everything from the g element except for the picture
		d3.select("#content").selectAll("g").selectAll(".rect").remove();
		d3.select("#content").selectAll("g").selectAll(".text").remove();
		// Return the selection of g elements holding the pictures
		return d3.select("#content").selectAll("g").on("mouseover", null).on("mouseout", null);
	}
	var leftover_icons = clearPane(); //leftover_ions is now any g elements containing the team logos in the content pane.

	// Draw headding
	function drawHeadding(){
		var headding = svgContainer.append("g").append("text")
			.attr("class", "title")
			.attr("x", 85)
			.attr("y", 45)
			.style({"font-size":"30px", "fill":"#7d7d7d"})
			.text("Final Standings For All Years")
			.attr("opacity", 0)
			.transition()
			.attr("opacity", 1.0);
	}
	drawHeadding();

	yBuffer = yBuffer + 30;

	//scale functions
	var xScale = d3.scale.linear().domain([startYear,numYears+startYear-1]).range([0,chartWidth]),
		yScale = d3.scale.linear().domain([0,9]).range([0,chartHeight]),
		xDotScale = d3.scale.linear().domain([0,numYears-1]).range([0,chartWidth]);

	//First, get the data into the right form.
	//In this case, an array of the form:
	//data = [{team:"teamName", positions:[{year:2008, position:1, team:"teamName"},...{year:2013, position:4}},{...},...]
	function standingsAllYearsData(){
		var tempData = []
		for(var i = 0; i < TEAMS.length; i++){
			var datum = {"team":TEAMS[i]};
			var positions = [];
			for (var j = startYear; j < startYear+numYears; j++){
				for (var k = 0; k < finalStandings.get(j).length; k++){
					if (finalStandings.get(j)[k][0] === TEAMS[i]){
						positions.push({"year":j,"position":k,"team":TEAMS[i]});
					}
				}
			}
			datum.positions = positions
			tempData.push(datum);
		}
		return tempData;
	}

	var tempData = standingsAllYearsData();

	var lineFunction = d3.svg.line()
		.x(function(d) { return xScale(d.year)+85;})
		.y(function(d) { return yScale(d.position)+70;})
		.interpolate("linear");

	var lineVisualisation;
	var count = 0;

	function drawLeftoverIcons(){
		leftover_icons.selectAll(".svgimage").transition()
			.attr("x", 21)
			.attr("y", function(d, i){return (40) + yScale(d.positions[0].position)+1})
			.each("end", function(d){ 
				count++;
				drawImgRects();
				if (count === 9){
					count = 0;
					drawLineChart();
				}
			});

		function drawImgRects(){
			var imgRects = leftover_icons.insert("rect", "image")
				.attr("class", "rect")
				.attr("width", 60)
				.attr("height", 50)
				.attr("x", 20)
				.attr("y", function(d, i){return (45) + yScale(d.positions[0].position)}) //TODO: Remove magic number 5
				.attr("fill",function(d){return teamCols[d.team]})
				.attr("opacity", 0.0) // Draws the rectangle invisibly, so it can transition in.
				.transition() // Transition the rectangles in.
				.attr("opacity", 1.0);
		}
	}

	function drawFreshIcons(){
		var pics = svgContainer.selectAll("pic")
			.data(tempData).enter()
			.append("g")
			.attr("class", "pic")
			.attr("id", function(d){return "team_icon_"+d.team;})


		pics.append("rect")
			.attr("class", "rect")
			.attr("width", 60)
			.attr("height", 50)
			.attr("x", 20)
			.attr("y", function(d, i){return 45 + yScale(d.positions[0].position);})
			.attr("fill",function(d){return teamCols[d.team];})
			.attr("opacity", 0)
			.transition()
			.attr("opacity", 1.0);

		pics.append("svg:image")
			.attr("class", "svgimage")
			.attr('width', 58)
		  	.attr('height', 58)
		  	.attr("x", 21)
			.attr("y", function(d, i){return 40 + yScale(d.positions[0].position)+1;})
			.attr("id", function(d){return "team_icon_"+d.team;})
		  	.attr("xlink:href", function(d){return "resources/team_logos/"+d.team+".png";})
		  	.attr("opacity", 0)
			.transition()
			.attr("opacity", 1.0);

		drawLineChart();
	}

	// Pictures of the teams. If they exist, move them to the right place, 
	// otherwise, make them.
	// Callbacks to draw the graph are in the draw icons methods
	if (leftover_icons[0].length > 1){
		drawLeftoverIcons();
	}
	else{
		drawFreshIcons();
	}

	function drawChartBackground(){
		//background of chart
		svgContainer.append("g").insert("rect", "line")
			.attr("class", "grid-background")
			.attr("height", chartHeight)
			.attr("width", chartWidth)
			.attr("x", 85)
			.attr("y", 70)
			.attr("fill","#EbEbEb")	
			.attr("opacity", 0)
			.transition()
			.attr("opacity", 1.0);
	}
	function drawLineChart(){
		drawChartBackground();

		svgContainer.selectAll("line").remove();

		//Drawing the line chart
		lineVisualisation = svgContainer.selectAll("line")
			.data(tempData)
			.enter()
			.append("g")
			.attr("class", "lineVisualisation")

		var lineChart = lineVisualisation.append("path")
			.attr("class", "line")
			.attr("d", function(d){return lineFunction(d.positions);})
			.attr("stroke", function(d){return teamCols[d.team];})
			.attr("stroke-width", 3)
			.attr("fill", "none")
			.attr("stroke-dasharray", function(){
				var eachPath = d3.select(this);
	    		var totalLength = eachPath.node().getTotalLength();
				return totalLength + " " + totalLength;
			})
			.attr("stroke-dashoffset", function(){
				var eachPath = d3.select(this);
	    		var totalLength = eachPath.node().getTotalLength();
				return totalLength;
			})
			.transition()
			.duration(1800)
			.ease("linear")
			.attr("stroke-dashoffset", 0)
			.each("end", function(d){drawLineChartDots();});

			drawAxis();
	}

	// This calls to addHover() to add hover functionality to the chart after it has animated. 
	//If the chart has hover functionality before it has fully drawn then it breaks the initial animation.
	function drawLineChartDots(){
		//dots for line chart
		var circles = lineVisualisation.selectAll("circle")
			.data(function(d){return d.positions;})

		circles.enter().append("circle")
			.attr("class", "circle")
			.attr("r", 5)
			.attr("fill", function(d){return teamCols[d.team]})
			.attr("cx", function(d,i){return 85+xDotScale(i)})
			.attr("cy", function(d){return 70+yScale(d.position)})
			.attr("opacity", 0.0)

		circles.transition()
			//.delay(1800)
			.attr("opacity", 1)
			.each("end", function(d){			//After all animations have taken place, make things hoverable
				addHover();
			})
	}

	function addHover(){
		svgContainer.selectAll(".line, .circle")
			.on("mouseover", function(d){
				var mouseX = d3.mouse(this)[0],
				mouseY = d3.mouse(this)[1];

				toolTip.style("display", "block")

				toolTip.select("rect")
					.attr("x", mouseX)
					.attr("y", mouseY-60)
					.attr("fill", teamCols[d.team]);

				toolTip.select(".svgimage")
					.attr("x", mouseX+1)
					.attr("y", mouseY-60+1)
					.attr("xlink:href", "resources/team_logos/"+d.team+".png");

				// fade other lines
				svgContainer.selectAll(".lineVisualisation, .pic")
					.filter(function(x){ return x.team !== d.team;})
					.transition().attr("opacity", 0.2)

				// Make my line bigger
				svgContainer.selectAll("path.line")
					.filter(function(x){ return x.team === d.team;})
					.transition().attr("stroke-width", 8)

				// Make my circles bigger
				svgContainer.selectAll("circle")
					.filter(function(x){ return x.team === d.team;})
					.transition().attr("r", 8)

				// Make other lines smaller
				svgContainer.selectAll("path.line")
					.filter(function(x){ return x.team != d.team;})
					.transition().attr("stroke-width", 2)

				// Make other circles smaller
				svgContainer.selectAll("circle")
					.filter(function(x){ return x.team != d.team;})
					.transition().attr("r", 4)
			});

			//add mouse on functionality
		svgContainer.selectAll(".pic")
			.style("cursor","pointer")
			.on("mouseover", function(d){
				// fade other lines
				svgContainer.selectAll(".lineVisualisation, .pic")
					.filter(function(x){ return x.team !== d.team;})
					.transition().attr("opacity", 0.2)

				// Make my line bigger
				svgContainer.selectAll("path.line")
					.filter(function(x){ return x.team === d.team;})
					.transition().attr("stroke-width", 8)

				// Make my circles bigger
				svgContainer.selectAll("circle")
					.filter(function(x){ return x.team === d.team;})
					.transition().attr("r", 8)

				// Make other lines smaller
				svgContainer.selectAll("path.line")
					.filter(function(x){ return x.team != d.team;})
					.transition().attr("stroke-width", 2)

				// Make other circles bigger
				svgContainer.selectAll("circle")
					.filter(function(x){ return x.team != d.team;})
					.transition().attr("r", 4)
			});	

			//add mouse out functionality
		svgContainer.selectAll(".lineVisualisation, .pic").on("mouseout", function(){							
			toolTip.style("display", "none");							//remove the tooltip
			svgContainer.selectAll(".lineVisualisation, .pic")	//bring back the lines
				.transition().attr("opacity", 1);

			svgContainer.selectAll("path.line")
				.transition().attr("stroke-width", 3)

			svgContainer.selectAll("circle")
				.transition().attr("r", 5)
		});
	}

	function makeToolTip(){
		//toolTip element
		tTip = svgContainer.append("g")
			.attr("class", "hoverTip")
			.style("display", "none")
			.style("opacity", 0.8)

		tTip.append("rect")
			.attr('width', 60)
			.attr('height', 60)

		tTip.append("svg:image")
			.attr("class", "svgimage")
			.attr('width', 58)
		    .attr('height', 58)

		return tTip;
	}

	var toolTip = makeToolTip();

	function drawAxis(){
		//add x axis
		svgContainer.insert("g", ".lineVisualisation")         
	    .attr("class", "y axis")
	    .attr("transform", "translate("+(85 + chartWidth)+","+70+")")
	    .call(d3.svg.axis()
	    	.scale(d3.scale.linear().domain([1,10]).range([0,chartHeight]))
	      	.orient("right")
	      	.tickSize(-chartWidth, 0, 0)
	      	.tickPadding(14)
	    )
	    .attr("opacity", 0)
		.transition()
		.attr("opacity", 1.0);

	  //add x axis label
	  	svgContainer.append("g").append("text")
		  	.attr("transform", "translate("+(85 + (chartWidth/2))+","+(70*1.7 + chartHeight)+")")
		  	.style("text-anchor", "middle")
		  	.style({"font-size":"14px", "fill":"#7d7d7d"})
		  	.text("Years")
		  	.attr("opacity", 0)
			.transition()
			.attr("opacity", 1.0);

		//add y axis
		svgContainer.insert("g", ".lineVisualisation")         
			.attr("class", "x axis")
			.attr("transform", "translate("+85+","+(70+chartHeight)+")")
			.call(d3.svg.axis().scale(xScale)
				.orient("bottom")
				.ticks(numYears)
				.tickPadding(14)
				.tickFormat(function(d){return d + ""})
				.tickSize(-chartHeight, 0, 0)
			)
			.attr("opacity", 0)
			.transition()
			.attr("opacity", 1.0);

	  	//add y axis label
		svgContainer.append("g").append("text")
		  	.attr("transform", "rotate(-90)")
		  	.attr("y", chartWidth + 85*1.5)
		  	.attr("x", 0-70*2)
		  	.style("text-anchor", "middle")
		  	.style({"font-size":"14px", "fill":"#7d7d7d"})
		  	.text("Positions")
			.attr("opacity", 0)
			.transition()
			.attr("opacity", 1.0);
	}


  	xBuffer = 40;
	yBuffer = 40;
}

function standingsByYear(){

	// If we are just swapping years then updateYear = true, false otherwise.
	var updateYear = false;
	var leftover = svgContainer.selectAll(".streamgraph");
	updateYear =  (leftover[0].length > 0);

	var leftover_icons;

	if (updateYear){
	}
	else{
	}
	console.log("coke");

	// Clear everything except for the team icons
	function clearPane(){
		// Clear everything except for the team logos in the content pane
		d3.select("#content").selectAll("g").filter(function(d){return !(this.id.contains("team_icon"))}).remove();
		// Clear everything from the g element except for the picture
		d3.select("#content").selectAll("g").selectAll(".rect").remove();
		d3.select("#content").selectAll("g").selectAll(".text").remove();
		// Return the selection of g elements holding the pictures
		return d3.select("#content").selectAll("g");
	}

	var leftover_icons = clearPane(); //leftover_ions is now any g elements containing the team logos in the content pane.

	chartHeight = 480;
	chartWidth = 550;

	yBuffer = yBuffer + 10;

	function standingsByYearData(){
		//arrange the data
		tempData = [];
		for(var i = 0; i < TEAMS.length; i++){
			for(var j = 0; j < teamStats.get(parseInt(year)).get(TEAMS[i]).pointsAtRound.length; j++){
				datumNew = { "key":TEAMS[i], 
					"date":j, 
					"value":teamStats.get(parseInt(year)).get(TEAMS[i]).pointsAtRound[j]}
					tempData.push(datumNew);
			}
		}
		return tempData;		
	}
	tempData = standingsByYearData();

	//scales
	var x = d3.scale.linear()
    	.range([0, chartWidth])

	var y = d3.scale.linear()
    	.range([chartHeight-10, 0])

 	var mouseScale = d3.scale.linear()
    	.range([0,13])
		.domain([40,40+chartWidth]);

	var yScale = d3.scale.linear().domain([0,9]).range([0,chartHeight]);

	var stack = d3.layout.stack()
	    .offset("wiggle")
	    .values(function(d) { return d.values; })
	    .x(function(d) { return d.date; })
	    .y(function(d) { return d.value; });
	
	var nest = d3.nest()
    	.key(function(d) { return d.key; });

	var area = d3.svg.area()
	    .interpolate("step-after")
	    .x(function(d) {return xBuffer + x(d.date); })
	    .y0(50 + chartHeight/2)
	    .y1(50 + chartHeight/2);
	
	// console.log(tempData);
	var layers = stack(nest.entries(tempData));
	//console.log(layers);

	//set the domains for the data now that I have nested the entries
	x.domain([0,13]);//d3.extent(tempData, function(d) { return d.date; }));
 	y.domain([0, d3.max(tempData, function(d) { return d.y0 + d.y; })]);

 	if(leftover_icons[0]>1 | true){
		drawLeftoverTeamLogos();
  	}
  	else{
	  	drawFreshTeamLogos();
	}

 	function drawGraph(){
	 	//draw the chart
	  	var graph = svgContainer.selectAll("layer")
		  	.data(layers)
		  	.enter().append("g")
		  	.attr("class", "streamgraph")
			.append("path")
		  	.attr("class", "layer")
		  	.attr("d", function(d){return area(d.values);})
		  	.style("fill", function(d){return teamCols[d.key]})
		  	.on("mouseover", function(d){
				var mouseX = d3.mouse(this)[0],
				mouseY = d3.mouse(this)[1];

				toolTip.style("display", "block")

				toolTip.select("rect")
					.attr("x", mouseX+10)
					.attr("y", mouseY-50+10)
					.attr("fill", teamCols[d.key]);

				toolTip.select(".svgimage")
					.attr("x", mouseX+1+10)
					.attr("y", mouseY-55+1+10)
					.attr("xlink:href", "resources/team_logos/"+d.key+".png");

				var tempRound = Math.floor(mouseScale(mouseX))

				var tempT = toolTip.select(".text")
					.text(null)
				// console.log(d.values[tempRound].value)
				tempT.append("tspan")
					.attr("x", mouseX+65+10)
					.attr("y", mouseY-30+10).text("Round: "+ (tempRound+1));
				tempT.append("tspan")
					.attr("x", mouseX+65+10)
					.attr("y", mouseY-10+10).text("Score: "+ d.values[tempRound].value);
				// fade other lines
				//svgContainer.selectAll(".streamgraph, .pic")
				svgContainer.selectAll(".streamgraph")
					.filter(function(x){return x.key !== d.key;})
					.transition().attr("opacity", 0.2);
				svgContainer.selectAll(".pic")
					.filter(function(x){return x.team !== d.key;})
					.transition().attr("opacity", 0.2);
			})
		  	.on("mouseout", function(){							
				toolTip.style("display", "none");							//remove the tooltip
				svgContainer.selectAll(".streamgraph, .pic")	//bring back the lines
					.transition().attr("opacity", 1);
			});
		  	return graph
	}

	var graph = drawGraph();

	console.log(graph);

	function updateArea(){
	  	//Animate - update the area 1st, then animate.
	 	area = d3.svg.area()
		    .interpolate("step-after")
		    .x(function(d,i) { return 40 + x(d.date); })
		    .y0(function(d) { return 50 + y(d.y0); })
		    .y1(function(d) { return 50 + y(d.y0 + d.y); });
	}
    updateArea();

    // Transition graph using the new area
	graph.transition().duration(800)
		.attr("d",function(d){return area(d.values);});

	function drawAxis(){
		//add x axis label
		svgContainer.append("g").append("text")
		  	.attr("transform", "translate("+(40 + (chartWidth/2))+","+(50*1.7 + chartHeight)+")")
		  	.style("text-anchor", "middle")
		  	.style({"font-size":"14px", "fill":"#7d7d7d"})
		  	.text("Rounds")
		//add x axis
		svgContainer.insert("g", ".streamgraphfsd")         
		    .attr("class", "x axis")
		    .attr("transform", "translate("+40+","+(50+chartHeight)+")")
		    .call(d3.svg.axis().scale(x)
			    .orient("bottom")
			    .tickPadding(14)
			    .tickFormat(function(d){return d + 1})
			    .tickSize(-chartHeight, 0, 0)
		    );		
		//add y axis label
		svgContainer.append("g").append("text")
		  	.attr("transform", "rotate(-90)")
		  	.attr("y", 20)
		  	.attr("x", 0-(10 + chartWidth/2))
		  	.style("text-anchor", "middle")
		  	.style({"font-size":"14px", "fill":"#7d7d7d"})
		  	.text("Points");
  	}
  	drawAxis();

	//toolTip element
	toolTip = svgContainer.append("g")
		.attr("class", "hoverTip")
		.style("display", "none")
		.style("opacity", 0.8)

	toolTip.append("rect")
		.attr('width', 160)
		.attr('height', 50)

	toolTip.append("svg:image")
		.attr("class", "svgimage")
		.attr('width', 58)
	  	.attr('height', 58)
	
	toolTip.append("text")
		.attr("class", "text")
	  	.style("text-anchor", "start")
	  	.style({"font-size":"20px", "fill":"#FFF"})
	  	.text("Round: \n Score:");

	//draw team pics
	function drawLeftoverTeamLogos(){
		

	  	
	  	leftover_icons.selectAll(".svgimage").transition()
			.attr("x", 40*2 + chartWidth +1)
			.attr("y", function(d, i){return (50/2)+yScale(9-(TEAMS.indexOf(d.team)))+1})
			.each("end", function(d){
				leftover_icons.selectAll(".rect, .svgimage, .text")
				.on("mouseover", function(d){
					doLogoHover(d);
				})
				.on("mouseout", function(d){
					d3.selectAll(".rect, .svgimage, .text, .streamgraph")
						.transition()
						.attr("opacity", 1.0);
				});
				drawRectText();
			})

		function drawRectText(){
			leftover_icons.insert("rect", "image")
				.attr("class", "rect")
				.attr("width", 180)
				.attr("height", 50)
				.attr("x", chartWidth - 1 - 20)
				.attr("y", function(d, i){return 5+(50/2)+yScale(9-(i))})
				.attr("fill",function(d){return teamCols[d.team]})
				.attr("opacity", 0)
				.transition()
				.attr("opacity", 1.0);

			var imgTxt = leftover_icons.append("text")
				.attr("class", "text")
			  	.style("text-anchor", "start")
		  		.style({"font-size":"20px", "fill":"#FFF"})
				.text(null);
			imgTxt.append("tspan")
				.attr("x", chartWidth+45)
				.attr("y", function(d, i){return 25+(50/2)+yScale(9-i)+1}).text("Final");
			imgTxt.append("tspan")
				.attr("x", chartWidth+45)
				.attr("y", function(d, i){return 45+(50/2)+yScale(9-i)+1})
				.text(function(d,i){return "Score: " + layers[i].values.slice(-1)[0].value});// d.values[d.values.length -1].value});
		}


	}
	function doLogoHover(d){

		d3.selectAll(".streamgraph").filter(function(x){return x.key !== d.team;})
			.transition()
			.attr("opacity", 0.2);
	}

	function drawFreshTeamLogos(){
		var pics = svgContainer.selectAll("pic")
			.data(layers).enter()
			.append("g")
			.attr("class", "pic")
			.attr("id", function(d){return "team_icon_"+d.team;})
			.on("mouseover", function(d){
				svgContainer.selectAll(".streamgraph, .pic")
					.filter(function(x){ return x.key !== d.key;})
					.transition().attr("opacity", 0.2)
			})
			.on("mouseout", function(){							
				toolTip.style("display", "none");							//remove the tooltip
				svgContainer.selectAll(".streamgraph, .pic")	//bring back the lines
					.transition().attr("opacity", 1);
			});

		pics.append("rect")
			.attr("class", "rect")
			.attr("width", 180)
			.attr("height", 50)
			.attr("x", 40*2 + chartWidth)
			.attr("y", function(d, i){return (50/2)+yScale(9-(i))})
			.attr("fill",function(d){return teamCols[d.key]});

		pics.append("svg:image")
			.attr("class", "svgimage")
			.attr('width', 58)
		  .attr('height', 50)
		  .attr("x", 40*2 + chartWidth +1)
			.attr("y", function(d, i){return (50/2)+yScale(9-i)+1})
			.attr("id", function(d){return "team_icon_"+d.team;})
		  .attr("xlink:href", function(d){return "resources/team_logos/"+d.key+".png";});

		var picTxt = pics.append("text")
			.attr("class", "text")
		  	.style("text-anchor", "start")
	  		.style({"font-size":"20px", "fill":"#FFF"})
			.text(null);
		picTxt.append("tspan")
			.attr("x", 40*2 + chartWidth+65)
			.attr("y", function(d, i){return 20+(50/2)+yScale(9-i)+1}).text("Final");
		picTxt.append("tspan")
			.attr("x", 40*2 + chartWidth+65)
			.attr("y", function(d, i){return 40+(50/2)+yScale(9-i)+1})
			.text(function(d){return "Score: "+ d.values[d.values.length -1].value});
	}


	function drawHeadding(){
	  	//Headding
	svgContainer.append("g").append("text")
		.attr("class", "title")
		.attr("x", 40)
		.attr("y", 50+5)
		.style({"font-size":"30px", "fill":"#7d7d7d"})
		.text("Points By Round in "+year);
	}
	drawHeadding();

	xBuffer = 40;
	yBuffer = 40;
	chartHeight = 480;
	chartWidth = 650;
}

function findIndexByKeyValue(arraytosearch, key, valuetosearch) {
	console.log(arraytosearch[0].key);
	console.log(key);
	console.log(valuetosearch);
 	for (var i = 0; i < arraytosearch.length; i++) {
 		console.log("hi");
		if (arraytosearch[i].key === valuetosearch) {
			return i;
		}
	}
	return null;
}