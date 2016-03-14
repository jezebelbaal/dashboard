//gets URL parameters
function getParameters(){

	var parameters = [];
	
	url = window.location.href;

	if(/week=([^&]+)/.exec(url)){
		parameters['week'] = /week=([^&]+)/.exec(url)[1];
	}else{
		parameters['week'] = "all";
	}	
	if(/week2=([^&]+)/.exec(url)){
		parameters['week2'] = /week2=([^&]+)/.exec(url)[1];
	}else{
		parameters['week2'] = "none";
	}
	
	if(/version=([^&]+)/.exec(url)){	
		parameters['version'] = /version=([^&]+)/.exec(url)[1];
	}else{
		parameters['version'] = "all";
	}
	if(/channel=([^&]+)/.exec(url)){
		parameters['channel'] = /channel=([^&]+)/.exec(url)[1];
	}else{
		parameters['channel'] = "all";
	}
	
	//version toggle will be true or false to later version comparision
	if(/version_toggle=([^&]+)/.exec(url)){
		parameters['version_toggle'] = /version_toggle=([^&]+)/.exec(url)[1];
	}else{
		parameters['version_toggle'] = "all";
	}

	//show only from a certain os
	if(/os=([^&]+)/.exec(url)){
		parameters['os'] = /os=([^&]+)/.exec(url)[1];
	}else{
		parameters['os'] = "all";
	}	

	//if are set, will show only from determined filters or categories
	if(/filter=([^&]+)/.exec(url)){
		parameters['filter'] = /filter=([^&]+)/.exec(url)[1];
	}else{
		parameters['filter'] = "";
	}
	if(/uicategory=([^&]+)/.exec(url)){
		parameters['uicategory'] = /uicategory=([^&]+)/.exec(url)[1];
	}else{
		parameters['uicategory'] = "all";
	}

	//sortby parameters on GUI build
	if(/sortby=([^&]+)/.exec(url)){
		parameters['sortby'] = /sortby=([^&]+)/.exec(url)[1];
	}else{
		parameters['sortby'] = "all";
	}

	return parameters;
}

//this method populates an array with a given week or two given weeks
function populateFeatures(parameters){

	var finalData = [];
	parameters['docname'] = parameters['week'] + "_" + parameters['version'] + "_" + parameters['channel'] + ".csv";

	if(parameters['week2']=="none"){

		finalData = getParsedCSV(parameters);

	}else{
		//gets first week
		finalData.push(getParsedCSV(parameters));
		//gets second week;
		parameters['docname'] = parameters['week2'] + "_" + parameters['version'] + "_" + parameters['channel'] + ".csv";
		finalData.push(getParsedCSV(parameters));
	}

	return finalData;	  

}

function getParsedCSV(parameters){

	
	var docname = parameters['docname'];
	var myData = [];

	var xmlhttp = null;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open( "GET", docname, false);
    xmlhttp.send( null );
   	return d3.csv.parse(xmlhttp.responseText);  

}

function filterData(parsedData, filters){

	var filteredData = [];
	var pushFlag = true;
	
	for (i = 0; i < parsedData.length; i++) { 
		
		//if all filters are set to all
		if(filters['os']=="all"&&filters['uicategory']=="all"&&filters['filter']=="all"){
			filteredData.push(parsedData[i]);
			continue;

		}else{

			pushFlag = true;
			
			if(parsedData[i].os != filters['os'] && filters['os']!= "all"){
				pushFlag = false;
			}

			if(parsedData[i].filters != filters['filters'] && filters['filters']!= "all"){
				pushFlag = false;
			}
			if(parsedData[i].uicategory != filters['uicategory'] && filters['uicategory']!= "all"){
				pushFlag = false;
			}

			if(pushFlag==false){
				continue;

			}else{
				filteredData.push(parsedData[i]);
			}
		}
	}

	return filteredData;
}

function sumAllOS(featuresList){

}

function organizeObjectsByAttribute(featuresList){


	var attrList = [];
	

	for(i= 0;i<featuresList.length;i++){

		//adds the attribute to the list if not listed.
		
		if(attrList[featuresList[i].uicategory] == undefined){

			attrList[featuresList[i].uicategory] = [];
			attrList[featuresList[i].uicategory][featuresList[i].filter] = [];

		}else{

			if(!attrList[featuresList[i].uicategory][featuresList[i].filter]){
				attrList[featuresList[i].uicategory][featuresList[i].filter] = [];
			}

			attrList[featuresList[i].uicategory][featuresList[i].filter].push(featuresList[i]);
		}
	}
	return attrList;	
}	

//this function closes the initial panel data from general Telemetry
function closeFront(){
	$("#initialheader").fadeOut(400);		
}

//this function builds the GUI
function makeGUI (features){

	var featureHTML = "";

	for(uicategory in features){

		featureHTML += '<h3>' + uicategory +  '<a data-toggle="collapse" href="#' + uicategory + 'set">+</a> </h3>';
		featureHTML+='<div id="' + uicategory + 'set" class="collapse">';

		for(filter in features[uicategory]){

				featureHTML +='<h4><a data-toggle="collapse" href="#' + 
				filter + uicategory + 'set">' + filter + '</a></h4>'
				
				featureHTML +='<div id="' + filter +  uicategory +'set" class="collapse">'
				for(i=0; i<features[uicategory][filter].length; i++){

					featureHTML += '<div id="' + features[uicategory][filter][i].feature + 
					features[uicategory][filter][i].uicategory + '"class="featureitem">'+
					'<h4>' + features[uicategory][filter][i].feature + ' <a href="#' + 
					features[uicategory][filter][i].feature + features[uicategory][filter][i].uicategory + 'desc " class="fancybox">'+
						'<small>learn more</small></a></h4>'+
					'<div id="visualization"></div>'+
					'<!--description of the feature!-->'+
					'<div style="display: none">'+
					'<div id="'+ features[uicategory][filter][i].feature + features[uicategory][filter][i].uicategory + 'desc">Test</div>'+
					'</div>'+
					'</div>';
				}

				featureHTML +='</div>';
			}

		featureHTML+='</div>';

		}
		document.getElementById("contentpanel").innerHTML += featureHTML;
	}

	
//this function initializes the dashboard.
function initDash(){

	
	//get parameters from URL ant puts in array
	var parameters = getParameters();

	//populates an array with all given values extracted from the csv
	var features = populateFeatures(parameters);

	//filters and build the GUI
	filteredFeatures = filterData(features, parameters);

	organizedFeatures = organizeObjectsByAttribute(filteredFeatures);

	//build the GUI for the dashboard
	makeGUI(organizedFeatures);



}

