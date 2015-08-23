		//build the year tabs along the top
function makeYearTabs(){
	console.log("num years used: "+numYears);
	for(var i = startYear; i < startYear + numYears; i++){
		var yearTabssss = d3.select("#yearTabs")
			.append("li")
			.append("a")
			.attr("data-toggle", "pill")
			.attr("href", "#"+i).text(i);
	}

	// Tab listeners
	$(document).ready(function(){
	  $(".nav-tabs a").click(function(){
	      $(this).tab('show');
	  });
	  $('.nav-pills a').on('shown.bs.tab', function(event){
	    selection = $(event.target).text();     // active pill
	    reDrawVisualisations();
	  });
	  $('.nav-tabs a').on('shown.bs.tab', function(event){
	    year = $(event.target).text();          // active tab
	    console.log(year);
	    reDrawVisualisations();
	  });
	});
}

//listner for the team pictures along the top & Home button
function topButton(name){
	if (name !== 'home'){ // team picture is clicked
		team = name;
		//shows and changes the tab to teams
		$('#selectionTabs a[href="#teams"]').tab('show');
		reDrawVisualisations();
	}
	else{ // home button clicked
		//shows and changes the tab to ALL YEARS, Standings
		$('#selectionTabs a:first').tab('show');
		$('#yearTabs a:first').tab('show');
	}
}