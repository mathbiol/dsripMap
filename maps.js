//ACS_Survey_Map_

console.log('maps.js loaded')

// hard code target counties and their Latitude / Longitude
var lat_lng_json_data = '{"county": [';
lat_lng_json_data    += '{"name": "Nassau",  "zoom": 10, "lat": 40.6546,    "lng": -73.5594},';
lat_lng_json_data    += '{"name": "Suffolk", "zoom": 10, "lat": 40.933237,  "lng": -72.792452},';
lat_lng_json_data    += '{"name": "Bronx",   "zoom": 12, "lat": 40.855787,  "lng": -73.90557},';
lat_lng_json_data    += '{"name": "Kings",   "zoom": 12, "lat": 40.650002,  "lng": -73.949997},';
lat_lng_json_data    += '{"name": "New York","zoom": 12, "lat": 40.754932,  "lng": -73.984016},';
lat_lng_json_data    += '{"name": "Queens",  "zoom": 12, "lat": 40.742054,  "lng": -73.769417},';
lat_lng_json_data    += '{"name": "Richmond","zoom": 11, "lat": 40.562330,  "lng": -74.139860}';
lat_lng_json_data    += ']}';

var lat_lng = JSON.parse(lat_lng_json_data);


dsripMap=function(){
    // ini
      if(location.search.length>0){
        dsripMap.parms={}

        location.search.slice(1).split('&').map(function(pp){
            pp=pp.split('=')
            dsripMap.parms[pp[0]]=pp[1]
        })
        if(!dsripMap.parms.valParm){
            dsripMap.parms.valParm='fraction_population_hispanic'
        }
    }else{
        dsripMap.parms=dsripMap.parms||{}
        dsripMap.parms.valParm='fraction_population_hispanic'
    }

    if(!dsripMap.parms.valParm2){
        dsripMap.parms.valParm2='total_population';
    }

    if(!dsripMap.parms.county_name){
       dsripMap.parms.county_name='Suffolk';
    }

    if(typeof rows == 'undefined' || !rows){
        dsripMap.boxCom()
    }else{
        console.log(rows.length+'rows loaded from localForage')
        dsripMap.plot(rows)
    }

}



//dsripMap.availParms = ["total_population", "land_area_square_meters", "population_density_per_square_kilometer", "total_population_non_hispanic", "total_population_hispanic", "fraction_population_non_hispanic", "fraction_population_hispanic", "total_households", "spanish_language_households", "fraction_spanish_language_households", "english_language_households", "fraction_english_language_households", "median_age", "median_household_income_2013", "per_capita_income_2013", "total_households_receiving_snap", "total_households_with_one_disability", "fraction_receiving_snap", "fraction_with_one_disability", "total_households_owner_occupied", "total_households_renter_occupied", "fraction_households_owner_occupied", "fraction_households_renter_occupied", "total", "total_white", "total_african_american", "total_native_american", "total_asian_american", "total_two_or_more_races", "fraction_population_white", "fraction_population_african_american", "fraction_population_native_american", "fraction_population_asian_american", "fraction_population_two_or_more_races","x","y"].sort()    
dsripMap.stats={};// we'll keep them here
dsripMap.cPdf=function(x,u,s){
    u=u||0;
    s=s||1;
    return Math.round(255*(1/(s*Math.sqrt(2*Math.PI)))*(Math.exp((-Math.pow((x-u),2))/(2*Math.pow(s,2))))/(1/(s*Math.sqrt(2*Math.PI))))
}


dsripMap.getMapCenterByCounty=function(county_name) {

    // default map center in Suffolk county
    var current_center= {lat: 40.9332373, lng: -72.7924525}

    for (i = 0; i < lat_lng.county.length; i++) {
        if (lat_lng.county[i].name == county_name) {
            var current_lat = parseFloat(lat_lng.county[i].lat);
            var currrent_lng = parseFloat(lat_lng.county[i].lng);
            current_center= {lat: current_lat, lng: currrent_lng}
        }
    }

    return current_center;
}

dsripMap.getMapZoomByCounty=function(county_name) {

    // default map center as Suffolk county
    var zoom=10;

    for (i = 0; i < lat_lng.county.length; i++) {
        if (lat_lng.county[i].name == county_name) {
            zoom=lat_lng.county[i].zoom;
        }
    }
    return zoom;
}


dsripMap.plot=function(rows){
    console.log("insize dsripMap.plot functiion.");
    dsripMap.rows=rows;
    dsripMap.markers={}; // keep markers here
    dsripMapsCountyDropdown.innerHTML='<span style="color:blue">County:<select id="selectCounty" style="color:blue"></span>: ';
    dsripMapsMsg0.innerHTML='<span style="color:blue">Loaded '+dsripMap.rows.length+' records</span>';
    dsripMapsMsg.innerHTML ='<span style="color:blue">Displaying X:<select id="selectValParm" style="color:blue"></span>: ';
    dsripMapsDropdown2.innerHTML='<span style="color:blue">Displaying Y:<select id="selectValParm2" style="color:blue"></span>: ';

    dsripMap.setSelectOpt0();
    dsripMap.setSelectOpt();
    dsripMap.setSelectOpt2();

    dsripMap.unpack = function (key) {
        return dsripMap.rows.map(function(row) {
            return parseFloat(row[key])
        })
    }


    $('<div id="suffolkGmaps" style="height:70%"></div>').appendTo(dsripMapsAction);

    dsripMap.initMap=function() {
        // set default map center as Suffolk county map center
        var current_center = {lat: 40.9332373, lng: -72.7924525};
        var current_zoom =10;

        if(typeof dsripMap.parms.county_name !== 'undefined' &&  dsripMap.parms.county_name !=''){
            current_center = dsripMap.getMapCenterByCounty(dsripMap.parms.county_name);
            current_zoom   = dsripMap.getMapZoomByCounty(dsripMap.parms.county_name);
        }

        // Create a map object and specify the DOM element for display.
        dsripMap.map=new google.maps.Map(document.getElementById('suffolkGmaps'), {
             // set default center as in Suffolk county :
            //center: {lat: 40.9332373, lng: -72.7924525},
            center: current_center,
            scrollwheel: false,
            zoom: current_zoom
        });

        // Prepare statistics for all
        dsripMap.stats.all={};
        dsripMap.stats.all.parmSelected = dsripMap.unpack(dsripMap.parms.valParm);
        var parmSelected=dsripMap.stats.all.parmSelected.filter(function(x){return (!isNaN(parseFloat(x)))})
        dsripMap.stats.all.parmSelected_max=parmSelected.reduce(function(a,b){
            if(a>b){return a}else{return b}
        })
        dsripMap.stats.all.parmSelected_min=parmSelected.reduce(function(a,b){
            if(a<b){return a}else{return b}
        })

        var cmax = dsripMap.stats.all.parmSelected_max
        var cmin = dsripMap.stats.all.parmSelected_min
        var cval = dsripMap.stats.all.parmSelected

        dsripMap.rowPoly={}; // notice how this is being passed as an object, not as an array
        rows.forEach(function(row,i){
             // prepare the map
            
            dsripMap.rowPoly[i]={};
            var polys = JSON.parse(row.geom_geojson) ;// polygons for a row
            if(!polys.coordinates){
                console.log(i,'no coordinates')
            }else{
                polys.coordinates.forEach(function(cr,j){ // for each polygon coordinate set
                    //console.log(i,j)                
                    if(cr.length==1){
                        cr=cr[0];
                        //console.log('cr fix')
                    } // some bug here in row 5, ask Janos
                    var pp= cr.map(function(ci){ // coordinates as gmaps path obj https://developers.google.com/maps/documentation/javascript/shapes
                        return {lat:ci[1],lng:ci[0]}
                    })
                    //var r = Math.round(255*cval[i]/cmax)
                    //var c ='rgb('+r+','+(255-r)+',0)'
                    var c = dsripMap.color((cval[i]-cmin)/(cmax-cmin));
                    dsripMap.rowPoly[i][j]= new google.maps.Polygon({
                        paths: pp,
                        strokeColor: c,
                        strokeOpacity: 0.8,
                        strokeWeight: 1,
                        fillColor: c,
                        fillOpacity: 0.35,
                        i:i
                    })
                    dsripMap.rowPoly[i][j].addListener('click',dsripMap.polyClick)
                    dsripMap.rowPoly[i][j].addListener('mouseover',dsripMap.polyMouseover)
                    dsripMap.rowPoly[i][j].setMap(dsripMap.map)
                })
            }      
        })        
    }

    $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyBujrQMOlux6Rgmx9DTPhQGetcyTZZbXbs&callback=dsripMap.initMap');

    setTimeout(dsripMap.plotStats,1000);

    setTimeout(dsripMap.bivaribleGraph,2000);

}

//bridge_key=AIzaSyBujrQMOlux6Rgmx9DTPhQGetcyTZZbXbs
//jonas_key=AIzaSyCD8nqFzanGQj5u51jAC6GN5TLjWv95cFo

dsripMap.reMap=function(valParm){
    dsripMap.parms.valParm=valParm||dsripMap.parms.valParm;
    // Prepare statistics for all
    // Prepare statistics for all
    dsripMap.stats.all={};
    dsripMap.stats.all.parmSelected = dsripMap.unpack(dsripMap.parms.valParm);
    var parmSelected=dsripMap.stats.all.parmSelected.filter(function(x){return (!isNaN(parseFloat(x)))});
    dsripMap.stats.all.parmSelected_max=parmSelected.reduce(function(a,b){
        if(a>b){return a}else{return b}
    })
    dsripMap.stats.all.parmSelected_min=parmSelected.reduce(function(a,b){
        if(a<b){return a}else{return b}
    })
    var cmax = dsripMap.stats.all.parmSelected_max;
    var cmin = dsripMap.stats.all.parmSelected_min;
    var cval = dsripMap.stats.all.parmSelected;
    cval=cval.map(function(v){
        return (v||0)
    })
    var c=''; // color
    for(var i in dsripMap.rowPoly){
        for(var j in dsripMap.rowPoly[i]){
            c=dsripMap.color((cval[i]-cmin)/(cmax-cmin));
            dsripMap.rowPoly[i][j].setOptions({
                strokeColor: c,
                fillColor: c
            })
        }
    }
}

dsripMap.reMap_switch_county=function(county_name){
    console.log("insize dsripMap.reMap_switch_county functiion.");
    // default map center as Suffolk county
    var center = new google.maps.LatLng(40.9332373, -72.7924525);
    var zoom;

    for (i=0;i<lat_lng.county.length;i++){
        if (lat_lng.county[i].name == county_name){
            var current_lat =  parseFloat(lat_lng.county[i].lat);
            var currrent_lng =  parseFloat(lat_lng.county[i].lng);
            zoom = lat_lng.county[i].zoom;
            center = new google.maps.LatLng(current_lat,currrent_lng);
        }
    }

    // remove existing  polygon from google map
    for(var i in dsripMap.rowPoly){
        for(var j in dsripMap.rowPoly[i]){
            dsripMap.rowPoly[i][j].setMap(null);
        }
    }

    // remove existing  markers from google map
    for(var i in dsripMap.markers){
        dsripMap.markers[i].setMap(null);
        delete dsripMap.markers[i];
    }


    dsripMap.map.setCenter(center);
    dsripMap.map.setZoom(zoom);

    var tmp_name='rows_' + county_name;

    localforage.getItem(tmp_name, function(err, value) {
        dsripMap.rows = JSON.parse(value);
        dsripMapsMsg0.innerHTML='<span style="color:blue">Loaded '+dsripMap.rows.length+' records</span>';

        dsripMap.stats.all={};
        dsripMap.stats.all.parmSelected = dsripMap.unpack(dsripMap.parms.valParm);
        var parmSelected=dsripMap.stats.all.parmSelected.filter(function(x){return (!isNaN(parseFloat(x)))});

        dsripMap.stats.all.parmSelected_max=parmSelected.reduce(function(a,b){
            if(a>b){return a}else{return b}
        })

        dsripMap.stats.all.parmSelected_min=parmSelected.reduce(function(a,b){
            if(a<b){return a}else{return b}
        })

        var cmax = dsripMap.stats.all.parmSelected_max;
        var cmin = dsripMap.stats.all.parmSelected_min;
        var cval = dsripMap.stats.all.parmSelected;
        cval=cval.map(function(v){
            return (v||0)
        })

        dsripMap.rowPoly={}; // notice how this is being passed as an object, not as an array
        dsripMap.rows.forEach(function(row,i){
            // prepare the map

            dsripMap.rowPoly[i]={};
            var polys = JSON.parse(row.geom_geojson) ;// polygons for a row
            if(!polys.coordinates){
                console.log(i,'no coordinates')
            }else{
                polys.coordinates.forEach(function(cr,j){ // for each polygon coordinate set
                    //console.log(i,j)
                    if(cr.length==1){
                        cr=cr[0];
                        //console.log('cr fix')
                    } // some bug here in row 5, ask Janos
                    var pp= cr.map(function(ci){ // coordinates as gmaps path obj https://developers.google.com/maps/documentation/javascript/shapes
                        return {lat:ci[1],lng:ci[0]}
                    })
                    //var r = Math.round(255*cval[i]/cmax)
                    //var c ='rgb('+r+','+(255-r)+',0)'
                    var c = dsripMap.color((cval[i]-cmin)/(cmax-cmin));
                    dsripMap.rowPoly[i][j]= new google.maps.Polygon({
                        paths: pp,
                        strokeColor: c,
                        strokeOpacity: 0.8,
                        strokeWeight: 1,
                        fillColor: c,
                        fillOpacity: 0.35,
                        i:i
                    })
                    dsripMap.rowPoly[i][j].addListener('click',dsripMap.polyClick)
                    dsripMap.rowPoly[i][j].addListener('mouseover',dsripMap.polyMouseover)
                    dsripMap.rowPoly[i][j].setMap(dsripMap.map)
                })
            }
        })

        setTimeout(dsripMap.plotStats,1000);
        setTimeout(dsripMap.bivaribleGraph,1000);
    });//end of callback function
}

dsripMap.reMap_switch_datafile=function(rows){
    console.log("insize dsripMap.reMap_switch_datafile functiion.");
    dsripMap.rows=rows;

    dsripMapsCountyDropdown.innerHTML='<span style="color:blue">County:<select id="selectCounty" style="color:blue"></span>: ';
    dsripMapsMsg0.innerHTML='<span style="color:blue">Loaded '+dsripMap.rows.length+' records</span>';
    dsripMapsMsg.innerHTML ='<span style="color:blue">Displaying X:<select id="selectValParm" style="color:blue"></span>: ';
    dsripMapsDropdown2.innerHTML='<span style="color:blue">Displaying Y:<select id="selectValParm2" style="color:blue"></span>: ';

    dsripMap.setSelectOpt0();
    dsripMap.setSelectOpt();
    dsripMap.setSelectOpt2();

    // default map center as Suffolk county
    var center = new google.maps.LatLng(40.9332373, -72.7924525);
    var zoom;

    for (i=0;i<lat_lng.county.length;i++){
        if (lat_lng.county[i].name == dsripMap.parms.county_name){
            var current_lat =  parseFloat(lat_lng.county[i].lat);
            var currrent_lng =  parseFloat(lat_lng.county[i].lng);
            zoom = lat_lng.county[i].zoom;
            center = new google.maps.LatLng(current_lat,currrent_lng);
        }
    }

    // remove existing  polygon from google map
    for(var i in dsripMap.rowPoly){
        for(var j in dsripMap.rowPoly[i]){
            dsripMap.rowPoly[i][j].setMap(null);
        }
    }

    // remove existing  markers from google map
    for(var i in dsripMap.markers){
        dsripMap.markers[i].setMap(null);
        delete dsripMap.markers[i];
    }

    dsripMap.map.setCenter(center);
    dsripMap.map.setZoom(zoom);

    //dsripMapsMsg0.innerHTML='<span style="color:blue">Loaded '+dsripMap.rows.length+' records</span>';

    dsripMap.stats.all={};
    dsripMap.stats.all.parmSelected = dsripMap.unpack(dsripMap.parms.valParm);
    var parmSelected=dsripMap.stats.all.parmSelected.filter(function(x){return (!isNaN(parseFloat(x)))});

    dsripMap.stats.all.parmSelected_max=parmSelected.reduce(function(a,b){
            if(a>b){return a}else{return b}
        })

    dsripMap.stats.all.parmSelected_min=parmSelected.reduce(function(a,b){
            if(a<b){return a}else{return b}
        })

    var cmax = dsripMap.stats.all.parmSelected_max;
    var cmin = dsripMap.stats.all.parmSelected_min;
    var cval = dsripMap.stats.all.parmSelected;
        cval=cval.map(function(v){
            return (v||0)
        })

    dsripMap.rowPoly={}; // notice how this is being passed as an object, not as an array
    dsripMap.rows.forEach(function(row,i){
            // prepare the map

    dsripMap.rowPoly[i]={};
    var polys = JSON.parse(row.geom_geojson) ;// polygons for a row
        if(!polys.coordinates){
                console.log(i,'no coordinates')
            }else{
                polys.coordinates.forEach(function(cr,j){ // for each polygon coordinate set
                    //console.log(i,j)
                    if(cr.length==1){
                        cr=cr[0];
                        //console.log('cr fix')
                    } // some bug here in row 5, ask Janos
                    var pp= cr.map(function(ci){ // coordinates as gmaps path obj https://developers.google.com/maps/documentation/javascript/shapes
                        return {lat:ci[1],lng:ci[0]}
                    })
                    //var r = Math.round(255*cval[i]/cmax)
                    //var c ='rgb('+r+','+(255-r)+',0)'
                    var c = dsripMap.color((cval[i]-cmin)/(cmax-cmin));
                    dsripMap.rowPoly[i][j]= new google.maps.Polygon({
                        paths: pp,
                        strokeColor: c,
                        strokeOpacity: 0.8,
                        strokeWeight: 1,
                        fillColor: c,
                        fillOpacity: 0.35,
                        i:i
                    })
                    dsripMap.rowPoly[i][j].addListener('click',dsripMap.polyClick)
                    dsripMap.rowPoly[i][j].addListener('mouseover',dsripMap.polyMouseover)
                    dsripMap.rowPoly[i][j].setMap(dsripMap.map)
                })
           }
     })

    setTimeout(dsripMap.plotStats,1000);
    setTimeout(dsripMap.bivaribleGraph,1000);

}


dsripMap.setSelectOpt0=function(){

    dsripMap.unique_county_name_list.forEach(function(p){
        var opt = document.createElement('option')
        opt.value=opt.textContent=p
        //opt.style.color='blue'
        if(p === dsripMap.parms.county_name){
            opt.selected=true
        }
        selectCounty.appendChild(opt)
    })

      selectCounty.onchange=function(){
          dsripMap.parms.county_name = this.children[this.selectedIndex].value;
          dsripMap.reMap_switch_county(dsripMap.parms.county_name);

    }
}


dsripMap.setSelectOpt=function(){
    if(!dsripMap.availParms){
        dsripMap.availParms=[];
        for(var parm in dsripMap.rows[0]){
            var num=true;

            if(parm.match("geoid")){
                num=false;
            } else {
                dsripMap.rows.forEach(function(r){
                    var v = r[parm];
                    if((v.length>0)&&(isNaN(parseFloat(v)))){
                        num=false;
                    }
                    //break
                })
            }

            if(num){
                dsripMap.availParms.push(parm);
            }
        }
    }

    dsripMap.availParms.forEach(function(p){
        var opt = document.createElement('option')
        opt.value=opt.textContent=p
        //opt.style.color='blue'
        if(p===dsripMap.parms.valParm){
            opt.selected=true
        } 
        selectValParm.appendChild(opt)
    })

    selectValParm.onchange=function(){
        dsripMap.reMap(this.children[this.selectedIndex].value);
        setTimeout(dsripMap.bivaribleGraph,1000);
    }
}


dsripMap.setSelectOpt2=function(){
    if(!dsripMap.availParms2){
        dsripMap.availParms2=[];
        for(var parm in dsripMap.rows[0]){
            var num=true;

            if(parm.match("geoid")){
                num=false;
            } else {
                dsripMap.rows.forEach(function(r){
                    var v = r[parm];
                    if((v.length>0)&&(isNaN(parseFloat(v)))){
                        num=false;
                    }
                    //break
                })
            }

            if(num){
                dsripMap.availParms2.push(parm);
            }
        }
    }

    dsripMap.availParms2.forEach(function(p){
        var opt = document.createElement('option')
        opt.value=opt.textContent=p
        //opt.style.color='blue'
        if(p===dsripMap.parms.valParm2){
            opt.selected=true
        }
        selectValParm2.appendChild(opt)
    })

    selectValParm2.onchange=function(){
        //dsripMap.reMap(this.children[this.selectedIndex].value);
        dsripMap.parms.valParm2 = this.children[this.selectedIndex].value;
        setTimeout(dsripMap.bivaribleGraph,1000);
    }
}


dsripMap.polyClick=function(){
    //this.setMap(null)
    //this.setOptions({'fillColor':'blue'})
    var row = dsripMap.rows[this.i];
    statsClicked.innerHTML=this.i+') '+row.geo_name+' zip '+row.intersects_zip.slice(1,-1)+' ('+row.intersects_county_subdivision.slice(1,-1)+')';
    //this.i+') '+row.geo_name+''//<select id="parm_Y"></select><div id="statsClickedPlot"></div><select id="parm_X"></select>'
    
    // add marker
    if(!dsripMap.markers[this.i]){ // if there is no marker there add one
        dsripMap.markers[this.i]=new google.maps.Marker({
            position: {lat: parseFloat(row.y), lng: parseFloat(row.x)},
            map: dsripMap.map,
            title: this.i+') '+row.geo_name
        });
    }else{
        dsripMap.markers[this.i].setMap(null);
        delete dsripMap.markers[this.i]
    }
    // summary statistics
    //statsClicked.innerHTML=this.i+') '+row.geo_name+' zip '+row.intersects_zip.slice(1,-1)+' ('+row.intersects_county_subdivision.slice(1,-1)+')'
    var h="(click on colored regions for cumulative statistics)";
    var markerInd=Object.getOwnPropertyNames(dsripMap.markers);
    if(markerInd.length>0){
        h='<h4 style="color:blue">Average values for blocks # '+markerInd.join(', ')+'</h4>';
        var va = 0;
        for(var i = 0 ; i< markerInd.length ; i++){
            va+=parseFloat(dsripMap.rows[markerInd[i]][dsripMap.parms.valParm])
        }
        h+='<li>'+dsripMap.parms.valParm+'= '+va/markerInd.length+'</li>'
    }
    statsClicked.innerHTML=h;

    // plot it using Plotly
    
}

dsripMap.polyMouseover=function(){
    //this.setMap(null)
    //this.setOptions({'fillColor':'blue'})
    var row = dsripMap.rows[this.i]
    statsMouseover.innerHTML='<b style="color:blue">'+this.i+')</b> '+row.geo_name+' zip '+row.intersects_zip.slice(1,-1)+' ('+row.intersects_county_subdivision.slice(1,-1)+')<li>'+dsripMap.parms.valParm+'= '+row[dsripMap.parms.valParm]+'</li>'
}

dsripMap.plotStats=function(){
    //dsripMapsStats.innerHTML='<table><tr><td id="statsAll"></td><td id="statsClicked"></td><td id="statsMouseover"></td></tr></table>'
    //dsripMapsStats.innerHTML='<span id="statsMouseover"></span><br><span id="statsClicked"></span><img src="2dhistogram-contour-subplots.png">'
    dsripMapsStats.innerHTML='<span id="statsMouseover"></span><br><span id="statsClicked"></span>';
    
    // all stats
}

dsripMap.readFileUrl=function(url){
    dsripMapsCountyDropdown.innerHTML='';
    dsripMapsMsg0.innerHTML='';
    dsripMapsMsg.innerHTML='<span style="color:red">loading ...</span>';
    dsripMapsDropdown2.innerHTML='';

    Plotly.d3.csv(url, function(err, rows){

        dsripMap.unique_county_name_list =[];

        for (i=0;i<lat_lng.county.length;i++){
            dsripMap.unique_county_name_list.push(lat_lng.county[i].name);
        }

        var current_rows = rows.filter(function(r){return r.county_name == dsripMap.parms.county_name});

        if(typeof dsripMap.map !== 'undefined'){
            dsripMap.reMap_switch_datafile(current_rows);
        }else {
            dsripMap.plot(current_rows);
        }

        //save save each county data into localForage storage object
        for (ii=0; ii<dsripMap.unique_county_name_list.length; ii++){
            var tmp_rows = rows.filter(function(r){return r.county_name == dsripMap.unique_county_name_list[ii]});
            var tmp_name='rows_'+dsripMap.unique_county_name_list[ii];

            localforage.setItem(tmp_name, JSON.stringify(tmp_rows), function(err, value) {
                  //console.log("localForage storage data key:" + tmp_name);
                  //console.log("localForage storage data length:" + value.length);
            });
        }
    }) 
}

dsripMap.boxCom=function(){
    dsripMapsAction.innerHTML='<div id="box-select" data-link-type="direct" data-multiselect="YOUR_MULTISELECT" data-client-id="eec5ta84z8jw4flacxu3f4g5lo5jsdr6"></div>'
    $.getScript("https://app.box.com/js/static/select.js").then(function(){
        dsripMap.boxCom.buttonLoaded=true
        $(document).ready(function(){
            var boxSelect = new BoxSelect();
            // Register a success callback handler
            boxSelect.success(function(response) {
                //console.log(response);
                dsripMap.readFileUrl(response[0].url)
            });
            // Register a cancel callback handler
            boxSelect.cancel(function() {
                console.log("The user clicked cancel or closed the popup");
            });
        });
    })
}

dsripMap.color=function(val,cm){
    //if(!cm){
    //    // blue red
    //    //cm=[[0,0,143],[0,0,159],[0,0,175],[0,0,191],[0,0,207],[0,0,223],[0,0,239],[0,0,255],[0,16,255],[0,32,255],[0,48,255],[0,64,255],[0,80,255],[0,96,255],[0,112,255],[0,128,255],[0,143,255],[0,159,255],[0,175,255],[0,191,255],[0,207,255],[0,223,255],[0,239,255],[0,255,255],[16,255,239],[32,255,223],[48,255,207],[64,255,191],[80,255,175],[96,255,159],[112,255,143],[128,255,128],[143,255,112],[159,255,96],[175,255,80],[191,255,64],[207,255,48],[223,255,32],[239,255,16],[255,255,0],[255,239,0],[255,223,0],[255,207,0],[255,191,0],[255,175,0],[255,159,0],[255,143,0],[255,128,0],[255,112,0],[255,96,0],[255,80,0],[255,64,0],[255,48,0],[255,32,0],[255,16,0],[255,0,0],[239,0,0],[223,0,0],[207,0,0],[191,0,0],[175,0,0],[159,0,0],[143,0,0],[128,0,0]]
    //    // green red
    //    //cm = [[0,255,0],[0,254,0],[0,254,0],[0,254,0],[0,253,0],[0,253,0],[0,252,0],[0,252,0],[0,251,0],[0,250,0],[0,248,0],[0,247,0],[0,245,0],[0,243,0],[0,240,0],[0,236,0],[0,232,0],[0,227,0],[0,221,0],[0,214,0],[0,206,0],[0,196,0],[0,185,0],[0,171,0],[0,156,0],[0,139,0],[0,120,0],[0,99,0],[0,76,0],[0,51,0],[0,26,0],[0,0,0],[0,0,0],[26,0,0],[51,0,0],[76,0,0],[99,0,0],[120,0,0],[139,0,0],[156,0,0],[171,0,0],[185,0,0],[196,0,0],[206,0,0],[214,0,0],[221,0,0],[227,0,0],[232,0,0],[236,0,0],[240,0,0],[243,0,0],[245,0,0],[247,0,0],[248,0,0],[250,0,0],[251,0,0],[252,0,0],[252,0,0],[253,0,0],[253,0,0],[254,0,0],[254,0,0],[254,0,0],[255,0,0]]
    //}
    if(Array.isArray(val)){
        return val.map(function(v){
            return dsripMap.color(v)
        })
    }else{
        //var c = Math.round(val*255)
        //return 'rgb('+c+','+(255-c)+','+Math.abs(c-127)+')'
        val = val*255
        return 'rgb('+dsripMap.cPdf(val,255,35)+','+dsripMap.cPdf(val,0,35) +','+dsripMap.cPdf(val,100,35)+')'
    }
    //var cc = cm[Math.floor(val*63)]
    //console.log(val,cc)
    //return 'rgb('+cc[0]+','+cc[1]+','+cc[2]+')'
    
}

// ......

dsripMap.bivaribleGraph= function(){

    var x = [];
    var y = [];

    var parmSelected1 = dsripMap.unpack(dsripMap.parms.valParm);
        parmSelected1 = parmSelected1.filter(function(x){return (!isNaN(parseFloat(x)))});

    var parmSelected2 = dsripMap.unpack(dsripMap.parms.valParm2);
        parmSelected2 = parmSelected2.filter(function(x){return (!isNaN(parseFloat(x)))});

    var Totle_x='X:  '+dsripMap.parms.valParm;
    var Totle_y='Y:  '+dsripMap.parms.valParm2;

    for (var i = 0; i < parmSelected1.length; i ++) {
        x[i] = parmSelected1[i];
        y[i] = parmSelected2[i];
    }

    var trace1 = {
        x: x,
        y: y,
        mode: 'markers',
        name: 'points',
        marker: {
            color: 'rgb(102,0,0)',
            size: 2,
            opacity: 0.4
        },
        type: 'scatter'
    };

    var trace2 = {
        x: x,
        y: y,
        name: 'density',
        ncontours: 20,
        colorscale: 'Hot',
        reversescale: true,
        showscale: false,
        type: 'histogram2dcontour'
    };

    var trace3 = {
        x: x,
        name: 'x density',
        marker: {color: 'rgb(102,0,0)'},
        yaxis: 'y2',
        type: 'histogram'
    };

    var trace4 = {
        y: y,
        name: 'y density',
        marker: {color: 'rgb(102,0,0)'},
        xaxis: 'x2',
        type: 'histogram'
    };

    var data = [trace1, trace2, trace3, trace4];

    var layout = {
        showlegend: false,
        autosize: false,
        width: 900,
        height: 650,
        margin: {l: 80, b: 80, t: 90},
        hovermode: 'closest',
        bargap: 0,
        xaxis: {
            title: Totle_x,
            domain: [0, 0.85],
            showgrid: false,
            zeroline: false
        },
        yaxis: {
            title: Totle_y,
            domain: [0, 0.85],
            showgrid: false,
            zeroline: false
        },
        xaxis2: {
            domain: [0.85, 1],
            showgrid: false,
            zeroline: false
        },
        yaxis2: {
            domain: [0.85, 1],
            showgrid: false,
            zeroline: false
        },
        title: 'DSRIP Bivariate Histogram 2D Contour Map'
    };

    Plotly.newPlot('dsripMapsGraph1', data,layout);

    dsripMap.contourMapClick();

}

//-------------------------------------
dsripMap.contourMapClick= function() {

    var graphDiv = document.getElementById('dsripMapsGraph1');
        graphDiv.on('plotly_click', function(data){
        // do something using the event data

            var point_x =parseFloat(data.points[0].x.toPrecision(9)) ;
            var point_y =parseFloat(data.points[0].y.toPrecision(9)) ;

            var range=0.1;
            var point_x_min = point_x - point_x*range;
            var point_x_max = point_x + point_x*range;

            var point_y_min = point_x - point_y*range;
            var point_y_max = point_x + point_y*range;


            console.log('point_x_y: ' +point_x+ ', '+point_y);

           dsripMap.rows.forEach(function(row,i) {
               var tmp_x =parseFloat(row[dsripMap.parms.valParm]);
               var tmp_y =parseFloat(row[dsripMap.parms.valParm2]);
               //console.log('tmp_x_y: ' +tmp_x + ', ' + tmp_y);

               if(dsripMap.markers[i]) {
                   dsripMap.markers[i].setMap(null);
                   delete dsripMap.markers[i];
               };

              // if(point_x == tmp_x || point_y == tmp_y){
               if((point_x_min <= tmp_x && point_x_max >= tmp_x) && (point_y_min <= tmp_y && point_y_max >= tmp_y) ){
                   console.log('tmp_x:' + tmp_x +'  tmp_y: ' +tmp_y);
                   if(!dsripMap.markers[i]) { // if there is no marker there add one
                       dsripMap.markers[i] = new google.maps.Marker({
                           position: {lat: parseFloat(row.y), lng: parseFloat(row.x)},
                           map: dsripMap.map,
                           title: i + ') ' + row.geo_name
                       });
                   }
               }
             })
    });
}
// ---------------------------------------

$(document).ready(function(){
    dsripMap()
})




