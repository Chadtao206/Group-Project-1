$("#map").hide();

var geocoder;
var map;
var places;
var markers = [];
function initialize() {
    // create the geocoder
    geocoder = new google.maps.Geocoder();

    // set some default map details, initial center point, zoom and style
    var mapOptions = {
        center: new google.maps.LatLng(33.6846, -117.8265),
        zoom: 10,
        mapTyped: google.maps.MapTypeId.ROADMAP
    };

    // create the map and reference the div #map container
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    // fetch the existing places (ajax) 
    // and put them on the map
//    fetchPlaces();
}

// when page is ready, initialize the map!
google.maps.event.addDomListener(window, 'load', initialize);

// add location button event - same button used for Zomato API
function generateMap() {

    // get the location text field value
    var loc = restaurant[0].location.address;
    console.log("user entered location = " + loc);
    geocoder.geocode({ 'address': loc }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            // log out results from geocoding
            console.log("geocoding results");
            console.log(results);

            // reposition map to the first returned location
            map.setCenter(results[0].geometry.location);

            // preparing data for form posting
            var lat = results[0].geometry.location.lat();
            var lng = results[0].geometry.location.lng();
            var loc_name = results[0].formatted_address;
            console.log(lat);
            console.log(lng);
            console.log(loc_name);
        }
    });

    event.preventDefault();
    return false;
};
// fetch Places JSON from /data/places
// loop through and populate the map with markers
var fetchPlaces = function () {
    var infowindow = new google.maps.InfoWindow({
        content: ''
    });
    $.ajax({
        url: '/data/places',
        dataType: 'json',
        success: function (response) {
            console.log(response);
            if (response.status == 'OK') {
                places = response.places;
                // loop through places and add markers
                for (p in places) {
                    //create gmap latlng obj
                    tmpLatLng = new google.maps.LatLng(places[p].geo[0], places[p].geo[1]);
                    // make and place map maker.
                    var marker = new google.maps.Marker({
                        map: map,
                        position: tmpLatLng,
                        title: places[p].name + "<br>" + places[p].geo_name
                    });
                    bindInfoWindow(marker, map, infowindow, '<b>' + places[p].name + "</b><br>" + places[p].geo_name);
                    // not currently used but good to keep track of markers
                    markers.push(marker);
                }
            }
        }
    })
};
// binds a map marker and infoWindow together on click
var bindInfoWindow = function (marker, map, infowindow, html) {
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(html);
        infowindow.open(map, marker);
    });
}
