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

    //fontawesome icon array
    var iconArray = ["<i class='fas fa-truck'></i>", "<i class='far fa-calendar-alt'></i>", "<i class='far fa-moon'></i>", "<i class='far fa-clock'></i>", "<i class='fas fa-box'></i>", "<i class='fas fa-coffee'></i>", "<i class='fas fa-book-open'></i>", "<ion-icon name='sunny'></ion-icon>", "<ion-icon name='pizza'></ion-icon>", "<i class='fas fa-utensils'></i>", "<ion-icon name='beer'></ion-icon>", "<i class='far fa-money-bill-alt'></i>", "<i class='fas fa-cocktail'></i>"];
    
    //get categories
    $.ajax({
        url: queryURL + "categories",
        method: "GET",
        headers: { "user-key": apiKey },
    }).then(function (response) {
        category = response;
        category.categories.splice(3, 1);
        category.categories.splice(5, 1);
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
                    var zipURL = "https://api.zip-codes.com/ZipCodesAPI.svc/1.0/GetZipCodeDetails/" + searchInput + "?key=7MJP0RQFAUSHKPB16Q3B";
                    $.ajax({
                        url: zipURL,
                        method: "GET",
                    }).then(function (results) {
                        searchLat = results.item.Latitude;
                        searchLon = results.item.Longitude;
                        citySearch = false;
                        searchCity();
                    })
                } else {
                    $(".searchresults").html("<h1 style='text-align:center'>Not a valid zipcode!</h1>")
                }

            }

            //search city function
            function searchCity() {
                if (citySearch){
                    searchURL = "https://developers.zomato.com/api/v2.1/search?start=" + resultStart + "&count=" + resultShow + "&entity_id=" + cityID + "&entity_type=city&category=" + catID + "&sort=rating&order=desc";
                }else{
                    searchURL = "https://developers.zomato.com/api/v2.1/search?start=" + resultStart + "&count=" + resultShow + "&lat=" + searchLat + "&lon=" + searchLon + "&category=" + catID + "&sort=rating&order=desc";
                console.log(searchURL);
                }
                restaurant = [];
                displayNum = 10;
                $.ajax({
                    url: searchURL,
                    method: "GET",
                    headers: { "user-key": apiKey },
                }).then(function (response) {
                    console.log(response);
                    pages = Math.ceil(response.results_found/10);
                    if (response.results_found < 11) {
                        displayNum = response.results_found;
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
                        }
                        restaurant.push(temp);
                    }
                    displayResults();
                })
            }
            //end of search city function

            //display results function
            function displayResults() {
                $(".searchresults").empty();
                $("#map").show();
                console.log(restaurant);
                for (i = 0; i < restaurant.length; i++) {
                    $(".searchresults").append("<div class='card' style='width: 12rem;'><img class='card-img-top' src='" + restaurant[i].thumbnail + "' alt='Card image cap'><div class='card-body'><h5 class='card-title' style='height:50px;overflow:hidden;'>" + restaurant[i].name + "</h5><p class='card-text' style='font-size:12px;height:60px;'>" + restaurant[i].location.address + "</p><a target='_blank' href='" + restaurant[i].link + "' class='btn btn-primary' style='margin-left:15px;'>Zomato Page</a></div></div>");
                }
                $(".nextbutton").html("<button class='btn btn-outline-primary btn-lg shadow-sm previous' style='margin:auto;margin-top:30px;'>Previous Page</button><h4 style='margin:auto;margin-top:60px;'>Page "+parseInt(resultStart/10+1)+" of "+pages+"</h4><button class='btn btn-outline-primary btn-lg shadow-sm next' style='margin:auto;margin-top:30px;'>Next Page</button>");
                $(".next").on("click", function(){
                    resultStart += 10;
                    console.log("resultstart="+resultStart);
                    searchCity();
                })
                $(".previous").on("click", function(){
                    if (resultStart>=10){
                      resultStart -= 10;
                    console.log("resultstart="+resultStart);
                    searchCity();  
                    }
                })
                // put marker on map FROM GOOGLE MAPS API
                var infowindow = new google.maps.InfoWindow();
                var marker, i;
        
                for (i = 0; i < restaurant.length; i++) {  
                    marker = new google.maps.Marker({
                    position: new google.maps.LatLng(restaurant[i].location.latitude, restaurant[i].location.longitude),
                    map: map
                });
            };
                bindInfoWindow(marker, map, infowindow, places[p].name + "<br>" + places[p].geo_name);
                markers.push(marker);
            }


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
                            console.log(cityID);
                            searchCity();
                        })
                    } else if (cityResult.location_suggestions.length === 1) {
                        cityID = cityResult.location_suggestions[0].id;
                        console.log(cityID)
                        searchCity();
                    }
                })
            }

            //end of city ID query
        }
    })
})      