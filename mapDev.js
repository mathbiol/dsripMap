console.log('mapDev.js loaded')

var map

initMap=function(){
    var map = new google.maps.Map(document.getElementById('mapDiv'), {
          zoom: 5,
          center: {lat: 24.886, lng: -70.268},
          mapTypeId: 'terrain'
        });

        // Define the LatLng coordinates for the polygon's path.
        var triangleCoords = [
          {lat: 25.774, lng: -80.190},
          {lat: 18.466, lng: -66.118},
          {lat: 32.321, lng: -64.757},
          {lat: 25.774, lng: -80.190}
        ];

        // Construct the polygon.
        var bermudaTriangle = new google.maps.Polygon({
          paths: triangleCoords,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35
        });
        bermudaTriangle.setMap(map);

        var triangleCoords2 = [
          {lat: 26.774, lng: -80.190},
          {lat: 19.466, lng: -66.118},
          {lat: 33.321, lng: -64.757},
          {lat: 26.774, lng: -80.190}
        ];

        // Construct the polygon.
        var bermudaTriangle2 = new google.maps.Polygon({
          paths: triangleCoords2,
          strokeColor: 'blue',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: 'blue',
          fillOpacity: 0.35
        });
        bermudaTriangle2.setMap(map);
}