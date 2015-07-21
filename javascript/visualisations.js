//Global fields for our main visualisations
var fullWidth = 800,
	chartWidth = 650,
	chartHeight = 480,
	xBuffer = 40,
	yBuffer = 40,
	year = "ALL YEARS",
	selection = "Standings",
	team = "West Coast Fever";

var teamCols = {"West Coast Fever":"#009900", "Queensland Firebirds":"#993399", "New South Wales Swifts":"#FF3300", "Adelaide Thunderbirds":"#CC0066", "Melbourne Vixens":"#00CC66",
           "Waikato Bay of Plenty Magic":"#000000", "Northern Mystics":"#0000FF", "Central Pulse":"#FCA307", "Southern Steel":"#0099FF", "Canterbury Tactix":"#FF0000"};

//Svg element for all the visualisations.
var svgContainer;

//popup tooltip
var toolTip;

//make svg Container for our visualisations
function makeContainer(){
	svgContainer = d3.select("#content").append("svg")
		.attr("width", fullWidth)
		.attr("height", 650)	.attr("id", "svg");

	makeYearTabs();
	//Our first call to make the initial visualisation!
	reDrawVisualisations();
}

//function to clear out the svg
function clearSvg(){
	d3.select("#content").selectAll("g").remove();
}

//Takes us to the appropriate visualisation once a tab/pill etc. is clicked
function reDrawVisualisations(){
	clearSvg();
	switch (selection) {
		case "Standings": standings(); break;
		case "Teams": teams(); break;
		case "Country": country(); break;
		case "Rivalries": rivalries(); break;
		case "Stadiums": stadiums(); break;
	} 
}

