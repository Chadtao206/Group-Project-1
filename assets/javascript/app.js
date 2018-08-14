
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
    var map;
    var markers = [];
    var infoWindow;
    var userObj;
    var userName;
    var userOnline = [];
    var favRest = [];
    var favRestName = [];
    var count = 0;
    var favDisp = false;

    $("#map").hide();

    // Configure Firebase
    var config = {
        apiKey: "AIzaSyBNrkLJnuk0Vbz0xyNdNkjPjc_uQsKebPQ",
        authDomain: "hyelp-1533266960440.firebaseapp.com",
        databaseURL: "https://hyelp-1533266960440.firebaseio.com",
        projectId: "hyelp-1533266960440",
        storageBucket: "",
        messagingSenderId: "1028833344633"
    };

    // Initialize Firebase
    firebase.initializeApp(config);
    var database = firebase.database();
    database.ref().update({
        count: count,
    })
    database.ref().on("value", function (snapshot) {
        if (snapshot.val()) {
            if (snapshot.val()[userName]) {
                favRest = snapshot.val()[userName].favRest;
                favRestName = snapshot.val()[userName].favRestName;
            }
        } else {
            console.log("no data saved!")
        }
    })

    //clear page
    function clearDisplay() {
        $("#myBtn").css("visibility", "hidden");
        $("#map").hide();
        $(".searchresults").empty();
        $(".nextbutton").empty();
    }

    //login signup buttons
    $(document).on("click", ".sign-in", function () {
        $(".jumbotron").removeClass("col-lg-12").addClass("col-lg-8");
        $(".sign-up-box").addClass("col-lg-3");
        $(".sign-up-box").css("width", "100%");
        $(".sign-up-box").css("height", "275px");
        $(".sign-up-box").html('<div class="container"><div><ul class="nav justify-content-end"><li class="nav-item"></li></ul></div><div class="row"><div class="col-lg-12"><form><div class="form-group"><input id="txtEmail" type="email" class="form-control" placeholder="Enter E-Mail"></div></form></div></div><div class="row"><div class="col-lg-12"><form><div class="form-group"><input id="txtPassword" type="password" class="form-control" placeholder="Password"></div></form></div></div><div class="row pwRow"></div><div class="row"><div class="col-lg-6"><button id="btnLogin" type="submit" class="btn btn-primary form-control">Login</button></div><div class="col-lg-6"><button id="btnCancel" type="submit" class="btn btn-primary form-control">Cancel</button></div></div></div><br><div class="col-lg-12"><button id="passReset" type="submit" class="btn btn-primary form-control">Forget Password?</button></div></div>')
    })

    $(document).on("click", ".sign-up", function () {
        $(".jumbotron").removeClass("col-lg-12").addClass("col-lg-8");
        $(".sign-up-box").addClass("col-lg-3");
        $(".sign-up-box").css("width", "100%");
        $(".sign-up-box").css("height", "275px");
        $(".sign-up-box").html('<div class="container"><div><ul class="nav justify-content-end"><li class="nav-item"></li></ul></div><div class="row"><div class="col-lg-12"><form><div class="form-group"><input id="txtUser" type="userName" class="form-control" placeholder="Enter User Name"></div></form></div></div><div class="row"><div class="col-lg-12"><form><div class="form-group"><input id="txtEmail" type="email" class="form-control" placeholder="Enter E-Mail"></div></form></div></div><div class="row"><div class="col-lg-12"><form><div class="form-group"><input id="txtPassword" type="password" class="form-control" placeholder="Password"></div></form></div></div><div class="row pwRow"></div><div class="row"><div class="col-lg-6"><button id="btnSignUp" type="submit" class="btn btn-primary form-control">Sign-Up</button></div><div class="col-lg-6"><button id="btnCancel" type="submit" class="btn btn-primary form-control">Cancel</button></div></div></div>')
    })

    //add login event
    $(document).on("click", "#btnLogin", function () {
        event.preventDefault();
        signState = "signIn";
        //get email and password
        $(".pwRow").empty();
        const email = $("#txtEmail").val().trim();
        const password = $("#txtPassword").val().trim();
        const auth = firebase.auth();
        //sign in
        auth.signInWithEmailAndPassword(email, password).catch(e => {
            console.log(e.message);
            $(".pwRow").html("<h7 style='color:black;padding:0 0 10px 20px;'>" + e.message + "</h7>");
        })
    })

    //forgot password
    $(document).on("click", "#passReset", function () {
        $("#txtPassword").parent().empty();
        $("#btnLogin").text("Submit").attr("id", "reset");
        $("#reset").on("click", function () {
            firebase.auth().sendPasswordResetEmail($("#txtEmail").val().trim()).then(function () {
                console.log("email sent succesfully");
                $(".pwRow").html("<h7 style='color:black;padding:0 0 10px 20px;'>Your email was successfully sent</h7>");
            }).catch(function (error) {
                console.log("email wasn't sent");
                $(".pwRow").html("<h7 style='color:black;padding:0 0 10px 20px;'>" + error + "</h7>");
            });
        })
    })



    //add signup event

    $(document).on("click", "#btnSignUp", function () {
        event.preventDefault();
        //get email and password
        $(".pwRow").empty();
        const email = $("#txtEmail").val().trim();
        const password = $("#txtPassword").val().trim();
        const auth = firebase.auth();

        //sign up
        auth.createUserWithEmailAndPassword(email, password).catch(e => {
            console.log(e.message);
            $(".pwRow").html("<h7 style='color:black;padding:0 0 10px 20px;'>" + e.message + "</h7>");
        }).then(function () {
            if (firebase.auth().currentUser != null) {
                firebase.auth().currentUser.updateProfile({
                    displayName: $("#txtUser").val().trim(),
                })
                favRest = [];
                favRestName = [];
                $(".pwRow").html("<h7 style='color:black;padding:0 0 10px 20px;'>Account Created!</h7>");
                setTimeout(clickCancel, 2000);
            }
        })
    })

    $(document).on("click", "#btnCancel", function () {
        clickCancel();
    })

    function clickCancel() {
        $(".sign-up-box").empty();
        $(".sign-up-box").removeClass("col-lg-3");
        $(".sign-up-box").css("width", "");
        $(".sign-up-box").css("height", "");
        $(".jumbotron").removeClass("col-lg-8").addClass("col-lg-12");
    }

    function signedIn() {
        clickCancel();
        $(".nav-two").html("<h3 class='welcome'>Welcome " + userObj.displayName + "! How can we Hyelp you today?");
        $(".nav-one").html("<a class='btn btn-lg btn-danger logOut' id='btnLogout'>Log Out</a>");
        $(".nav-one").append("<span class='btn btn-lg btn-danger favorites' style='margin-left:15px;'><i class='fab fa-gratipay'></i> My Favorites</span>"

        )
    }

    //add a realtime listener
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
            userObj = firebaseUser;
            setTimeout(signedIn, 1000);
            setTimeout(function () {
                userName = userObj.displayName;
                count += 1;
                if (!($.inArray(userName, userOnline) !== -1)) {
                    userOnline.push(userName);
                }
                console.log(userOnline);
                database.ref().update({
                    userOnline: userOnline,
                    count: count,
                })
            }, 1000)
        } else {
            console.log('not logged in');
        }
        clearDisplay();
    })

    //allow user to logout
    $(document).on("click", "#btnLogout", function () {
        firebase.auth().signOut();
        userOnline.splice(userOnline.indexOf(userName), 1)
        console.log("signing out!");
        favRest = [];
        favRestName = [];
        database.ref().update({
            userOnline: userOnline,
        })
        $(".nav-one").html('<a class="btn btn-lg btn-danger sign-in" style="margin-right:10px">Sign-In</a>');
        $(".nav-two").html('<a class="btn btn-lg btn-danger sign-up">Sign-Up</a>');
        clearDisplay();
    });


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

    //heart click icon change, store favorites
    $(document).on("click", ".fa-heart-click", function () {
        //remove fav
        if ($(this).hasClass("fas")) {
            $(this).addClass("far").removeClass("fas");
            $(this).attr("title","Click to Fav");
            var temp = (favRestName).indexOf(restaurant[$(this).attr("order")].name);
            favRestName.splice(temp, 1)
            favRest.splice(temp, 1);
            if (userName) {
                database.ref().update({
                    [userName]: { favRest: favRest, favRestName: favRestName, }
                })
            }
        //add fav
        } else {
            $(this).addClass("fas").removeClass("far");
            $(this).attr("title","Click to Unfav :(");
            favRest.push(restaurant[$(this).attr("order")]);
            favRestName.push(restaurant[$(this).attr("order")].name)
            if (userName) {
                database.ref().update({
                    [userName]: { favRest: favRest, favRestName: favRestName, }
                })
            }
        }
    })

    //unfav inside fav display
    $(document).on("click", ".fav-click", function () {
        $(this).addClass("far").removeClass("fas");
        var temp = (favRestName).indexOf(restaurant[$(this).attr("order")].name);
        $(this).parent().parent().remove();
        favRestName.splice(temp, 1)
        favRest.splice(temp, 1);
        if (userName) {
            database.ref().update({
                [userName]: { favRest: favRest, favRestName: favRestName, }
            })
        }
        if (favRest.length < 1 && favRestName.length < 1) {
            $(".searchresults").html("<br><h1 style='color:rgb(170, 9, 9);'>No favorites saved. Get started by searching a city or zip code!")
            $("#map").hide();
            $("#myBtn").css("visibility", "hidden");
        }
        console.log(favRest);
        console.log(favRestName);
    })

    //Display Favorite restaurants
    $(document).on("click", ".favorites", function () {
        $("#map").hide();
        favDisp = true;
        restaurant = [];
        for (i = 0; i < favRest.length; i++) {
            restaurant.push(favRest[i]);
        }
        if (favRest.length > 0) {
            displayResults();
            $(".fa-heart").removeClass("fa-heart-click").addClass("fav-click");
            $(".fa-heart").attr("title","Click to Unfav :(");
            $(".searchresults").css("height", "450px");
            $(".searchresults").css("overflow-y", "auto");
            $(".nextbutton").empty();
        } else {
            $(".searchresults").html("<br><h1 style='color:rgb(170, 9, 9);'>No favorites saved. Get started by searching a city or zip code!")
        }
    })

    //display results function
    function displayResults() {
        $(".searchresults").empty();
        $("#map").show();
        $("#myBtn").css("visibility", "visible");

        //rating display algorithm
        var ratingDisp = {
            avg: [],
            stars: [],
            half: [],
            empty: [],
        }

        var dollarDiv = [];
        var starDiv = [];

        //font awesome star and dollar icons, favorite icons.
        var dollar = "<i class='fab fa-bitcoin'></i>";
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

        //create price dollar divs
        for (i = 0; i < restaurant.length; i++) {
            var temp = $("<div></div>");
            for (j = 0; j < restaurant[i].priceRange; j++) {
                temp.append(dollar);
            }
            dollarDiv.push(temp);
        }

        //Adds Cards with thumbnails and displays the current page of 10 restaurants
        for (i = 0; i < restaurant.length; i++) {
            if (restaurant[i].thumbnail) {
                var thumb = restaurant[i].thumbnail;
            } else {
                thumb = "assets/images/placehold.jpg"
            }
            var temp = "far";
            if (favRestName.includes(restaurant[i].name)) {
                temp = "fas";
            }
            $(".searchresults").append("<div class='card' style='width: 12rem;'><img class='card-img-top' src='" + thumb + "' alt='Card image cap'><div style='max-height:20px'><i data-toggle='tooltip' data-placement='top' title='Click to Fav' class='" + temp + " fa-heart fa-heart-click' order='" + i + "'></i></div><div class='card-body'><h5 class='card-title' style='text-align:center;height:50px;overflow:hidden;'>" + restaurant[i].name + "</h5><span>Price - " + dollarDiv[i][0].innerHTML + "</span><br><div style='margin-top:10px;'>" + restaurant[i].rating.aggregate_rating + "&nbsp;&nbsp;" + starDiv[i][0].innerHTML + "</div><p class='card-text' style='margin-top:10px;font-size:12px;height:60px;'>" + restaurant[i].location.address + "</p><a target='_blank' href='" + restaurant[i].link + "' class='btn btn-primary' style='margin-left:15px;'>Zomato Page</a></div></div>");
        }
        $(".fa-heart").hover(function () {
            $(this).css("font-size", "40px");
        }, function () {
            $(this).css("font-size", "30px");
        })

        //create prev/next buttons
        if (favDisp === false) {
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
        }
        favDisp = false;


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
        var bounds = new google.maps.LatLngBounds();
        infoWindow = new google.maps.InfoWindow();
        for (i = 0; i < restaurant.length; i++) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(restaurant[i].location.latitude, restaurant[i].location.longitude),
                map: map,
            });
            markers.push(marker);
            bounds.extend(marker.position);
            google.maps.event.addListener(marker, 'mouseover', (function (marker, i) {
                return function () {
                    infoWindow.setContent("<div style='color: black'><strong>" + restaurant[i].name + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + dollarDiv[i][0].innerHTML + "</strong><hr><span>Rating: " + restaurant[i].rating.aggregate_rating + "</span>&nbsp;&nbsp;&nbsp;<span>" + starDiv[i][0].innerHTML + "</span>&nbsp;&nbsp;&nbsp;<span>" + restaurant[i].rating.votes + " Reviews</span><br><div style='margin-top:10px;'>" + restaurant[i].location.address + '</div><br>' + '</div>');
                    infoWindow.setOptions({ maxWidth: 500 });
                    infoWindow.open(map, marker);
                }
            })(marker, i));
            google.maps.event.addListener(marker, 'mouseout', function () {
                infoWindow.close();
            });
        };
        map.fitBounds(bounds);
        google.maps.event.addDomListener(window, 'load', initialize);
    };


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
            pages = Math.ceil(response.results_found / 10);
            if (pages > 10) { pages = 10 };
            if (response.results_shown < 11) {
                displayNum = response.results_shown;
            }
            for (i = 0; i < displayNum; i++) {
                var temp = {
                    name: response.restaurants[i].restaurant.name,
                    location: response.restaurants[i].restaurant.location,
                    priceRange: response.restaurants[i].restaurant.price_range,
                    thumbnail: response.restaurants[i].restaurant.thumb,
                    link: response.restaurants[i].restaurant.url,
                    rating: response.restaurants[i].restaurant.user_rating,
                }
                restaurant.push(temp);
            }
            displayResults();
        })
    }
    //end of search city function


    //run submit when enter is pressed
    $(".input-location").keyup(function (event) {
        if (event.keyCode === 13) {
            $(".submit").click();
        }
    })

    //submit click function
    $(".submit").on("click", function () {
        event.preventDefault();
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


        //city ID query
        function cityIdQuery() {
            $(".searchresults").css("height", "");
            $(".searchresults").css("overflow-y", "");
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

