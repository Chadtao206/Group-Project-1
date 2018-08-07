$(".submit").on("click", function (e) {

    // get the location text field value
    var loc = $(".input-location").val();
    console.log("user entered location = " + loc);
    geocoder.geocode({ 'address': loc }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            // log out results from geocoding
            console.log("geocoding results");
            console.log(results);

            // reposition map to the first returned location
            map.setCenter(results[0].geometry.location);

            // preparing data for form posting
            var lat = results[0].geometry.location.lat;
            var lng = results[0].geometry.location.lng;
            var loc_name = results[0].formatted_address;
            // send first location from results to server as new location
            $.ajax({
                url: '/add_place',
                dataType: 'json',
                type: 'POST',
                data: {
                    name: name,
                    latlng: lat + "," + lng,
                    geo_name: loc_name
                },
                success: function (response) {
                    // success - for now just log it
                    console.log(response);
                },
                error: function (err) {
                    // do error checking
                    alert("something went wrong");
                    // Moved Markers to Zomato code, creating an error message with Google Maps API
                    console.error(err);
                }
            });
        } else {
            alert("Try again. Geocode was not successful for the following reason: " + status);
        }
    });

    event.preventDefault();
    return false;
});