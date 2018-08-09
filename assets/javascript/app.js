
$(document).ready(function () {
    //zomato search database
    var category
    var queryURL = "https://developers.zomato.com/api/v2.1/";
    var apiKey = "1bcf7dd2c40009d8924547e40480bb0c";
    var searchLat;
    var searchLon;
    var resultStart = 0;
    var resultShow = 10;
    var restaurant = [];
    var displayNum = 10;
    var searchURL;
    var cityID;
    var catID;
    var city;
    var citySearch = false;
    var pages;
    var geocoder;
    var map;
    var places;
    var markers = [];
    var infoWindow;

    $("#map").hide();


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
    }

    // when page is ready, initialize the map!
    google.maps.event.addDomListener(window, 'load', initialize);


    //get search categories function
    $.ajax({
        url: queryURL + "categories",
        method: "GET",
        headers: { "user-key": apiKey },
    }).then(function (response) {
        category = response;
        category.categories.splice(3, 1);
        category.categories.splice(5, 1);
        category.categories.splice(8, 3);
        for (i = 0; i < category.categories.length; i++) {
            $("#inputCategory").append("<option class='inputCategory' value='" + category.categories[i].categories.id + "'> " + category.categories[i].categories.name + "</option>")
        }
    })

    //run submit when enter is pressed
    $(".input-location").keyup(function (event) {
        if (event.keyCode === 13) {
            $(".submit").click();
        }
    })

    //submit click function
    $(".submit").on("click", function () {
        resultStart = 0;
        var searchInput = $(".input-location").val().trim();
        if (searchInput) {
            catID = $("#inputCategory option:selected").attr("value");
            if (isNaN(searchInput)) {
                city = searchInput;
                citySearch = true;
                cityIdQuery();
            } else {
                if ((searchInput.toString().length === 5) && (parseInt(searchInput) < 99951) && (parseInt(searchInput) > 500)) {
                    var zipURL = "https://api.zip-codes.com/ZipCodesAPI.svc/1.0/GetZipCodeDetails/" + searchInput + "?key=3932FDORZQE6FVW1VJ1Q";
                    $.ajax({
                        url: zipURL,
                        method: "GET",
                    }).then(function (results) {
                        console.log(results)
                        searchLat = results.item.Latitude;
                        searchLon = results.item.Longitude;
                        citySearch = false;
                        searchCity();
                    })
                } else {
                    $(".searchresults").html("<h1 style='text-align:center'>Not a valid zipcode!</h1>")
                }
            }
        }

        //search city function
        function searchCity() {
            if (citySearch) {
                searchURL = "https://developers.zomato.com/api/v2.1/search?start=" + resultStart + "&count=" + resultShow + "&entity_id=" + cityID + "&entity_type=city&category=" + catID + "&sort=rating&order=desc";
            } else {
                searchURL = "https://developers.zomato.com/api/v2.1/search?start=" + resultStart + "&count=" + resultShow + "&lat=" + searchLat + "&lon=" + searchLon + "&category=" + catID + "&sort=rating&order=desc";
            }
            restaurant = [];
            displayNum = 10;
            $.ajax({
                url: searchURL,
                method: "GET",
                headers: { "user-key": apiKey },
            }).then(function (response) {
                console.log(response);
                pages = Math.ceil(response.results_found / 10);
                if (pages > 10) { pages = 10 };
                if (response.results_shown < 11) {
                    displayNum = response.results_shown;
                }
                for (i = 0; i < displayNum; i++) {
                    var temp = {
                        name: response.restaurants[i].restaurant.name,
                        cuisine: response.restaurants[i].restaurant.cuisines,
                        location: response.restaurants[i].restaurant.location,
                        priceRange: response.restaurants[i].restaurant.price_range,
                        thumbnail: response.restaurants[i].restaurant.thumb,
                        link: response.restaurants[i].restaurant.url,
                        menu: response.restaurants[i].restaurant.menu_url,
                        photos: response.restaurants[i].restaurant.photos_url,
                        rating: response.restaurants[i].restaurant.user_rating,
                    }
                    restaurant.push(temp);
                }
                console.log(restaurant);
                displayResults();
            })
        }
        //end of search city function

        //display results function
        function displayResults() {
            $(".searchresults").empty();
            $("#map").show();
            $("#myBtn").css("visibility", "visible");

            //generate map function
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

            var ratingDisp = {
                avg: [],
                stars: [],
                half: [],
                empty: [],
            }

            var starDiv = [];

            //font awesome star icons
            var fullStar = "<i class='fas fa-star'></i>";
            var emptyStar = "<i class='far fa-star'></i>";
            var halfStar = "<i class='fas fa-star-half-alt'></i>";

            //create rating star divs
            for (i = 0; i < restaurant.length; i++) {
                var temp = Math.floor(restaurant[i].rating.aggregate_rating);
                var temp2 = restaurant[i].rating.aggregate_rating - temp;
                var half;
                var empty = 5 - temp;
                if (temp2 > 0.71) {
                    temp++;
                    half = false;
                    empty--;
                } else if (temp2 < 0.29) {
                    half = false;
                } else {
                    half = true;
                    empty--;
                }
                ratingDisp.avg.push(restaurant[i].rating.aggregate_rating);
                ratingDisp.stars.push(temp);
                ratingDisp.half.push(half);
                ratingDisp.empty.push(empty);
            }
            for (i = 0; i < restaurant.length; i++) {
                var temp = $("<div></div>");
                for (j = 0; j < ratingDisp.stars[i]; j++) {
                    temp.append(fullStar);
                }
                if (ratingDisp.half[i]) {
                    temp.append(halfStar);
                }
                for (j = 0; j < ratingDisp.empty[i]; j++) {
                    temp.append(emptyStar);
                }
                starDiv.push(temp);
            }


            //Adds Cards with thumbnails and displays the current page of 10 restaurants
            for (i = 0; i < restaurant.length; i++) {
                if (restaurant[i].thumbnail) {
                    var thumb = restaurant[i].thumbnail;
                } else {
                    thumb = "assets/images/placehold.jpg"
                }
                $(".searchresults").append("<div class='card' style='width: 12rem;'><img class='card-img-top' src='" + thumb + "' alt='Card image cap'><div class='card-body'><h5 class='card-title' style='height:50px;overflow:hidden;'>" + restaurant[i].name + "</h5>" + restaurant[i].rating.aggregate_rating + "&nbsp;&nbsp;" + starDiv[i][0].innerHTML + "<p class='card-text' style='margin-top:10px;font-size:12px;height:60px;'>" + restaurant[i].location.address + "</p><a target='_blank' href='" + restaurant[i].link + "' class='btn btn-primary' style='margin-left:15px;'>Zomato Page</a></div></div>");
            }
            $(".nextbutton").html("<button class='btn btn-outline-primary btn-lg shadow-sm previous' style='margin:auto;margin-top:30px;'>Previous Page</button><h4 style='margin:auto;margin-top:60px;'>Page " + parseInt(resultStart / 10 + 1) + " of " + pages + "</h4><button class='btn btn-outline-primary btn-lg shadow-sm next' style='margin:auto;margin-top:30px;'>Next Page</button>");
            $(".next").on("click", function () {
                console.log(pages)
                if (resultStart <= (pages - 2) * 10) {
                    resultStart += 10;
                    searchCity();
                }
            })
            $(".previous").on("click", function () {
                if (resultStart >= 10) {
                    resultStart -= 10;
                    searchCity();
                }
            })


            // put marker on map FROM GOOGLE MAPS API

            //clears markers on map
            function clearMap() {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(null);
                }
                markers = [];
            }

            //sets markers for currently displayed restaurants on map
            clearMap();
            infoWindow = new google.maps.InfoWindow();
            for (i = 0; i < restaurant.length; i++) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(restaurant[i].location.latitude, restaurant[i].location.longitude),
                    map: map,
                });
                markers.push(marker);
                google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                        infoWindow.setContent("<div style='color: black'><strong>" + restaurant[i].name + "</strong><hr><span>Rating: " + restaurant[i].rating.aggregate_rating + "</span>&nbsp;&nbsp;&nbsp;<span>" + starDiv[i][0].innerHTML + "</span>&nbsp;&nbsp;&nbsp;<span>" + restaurant[i].rating.votes + " Reviews</span><br><div style='margin-top:10px;'>" + restaurant[i].location.address + '</div><br>' + '</div>');
                        infoWindow.setOptions({ maxWidth: 500 });
                        infoWindow.open(map, marker);
                    }
                })(marker, i));
            };
        };

        //city ID query
        function cityIdQuery() {
            $.ajax({
                url: "https://developers.zomato.com/api/v2.1/cities?q=" + city,
                method: "GET",
                headers: { "user-key": apiKey },
            }).then(function (cityResult) {
                if (cityResult.location_suggestions.length > 1) {
                    $(".nextbutton").empty();
                    $(".searchresults").html("<div style='margin-top:30px;color:black'><h1>Multiple locations found, did you mean -</h1></div>");
                    for (i = 0; i < cityResult.location_suggestions.length; i++) {
                        $(".searchresults").append("<div style='width:60%;margin:auto;' class='btn btn-secondary btn-lg multiple' cityID='" + cityResult.location_suggestions[i].id + "'>" + cityResult.location_suggestions[i].name + ", " + cityResult.location_suggestions[i].country_name + "?</div>")
                    }
                    $(".multiple").on("click", function () {
                        cityID = $(this).attr("cityID");
                        searchCity();
                    })
                } else if (cityResult.location_suggestions.length === 1) {
                    cityID = cityResult.location_suggestions[0].id;
                    searchCity();
                }
            })
        }

        //end of city ID query
    })
})

function topFunction() {
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
    if (isSafari) {
        document.body.scrollTop = 0; // For Safari
    } else {
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera, etc.
    }
}