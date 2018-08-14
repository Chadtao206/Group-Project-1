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
    var signState = "";
    var userObj;
    var userDisplayName;
    var favRests;
    var counter = 0;
    console.log(counter)

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

  //login signup buttons
  $(document).on("click", ".sign-in", function(){
      $(".jumbotron").removeClass("col-lg-12").addClass("col-lg-8");
      $(".sign-up-box").addClass("col-lg-3");
      $(".sign-up-box").css("width","100%");
      $(".sign-up-box").css("height","275px");
      $(".sign-up-box").html('<div class="container"><div><ul class="nav justify-content-end"><li class="nav-item"></li></ul></div><div class="row"><div class="col-lg-12"><form><div class="form-group"><input id="txtEmail" type="email" class="form-control" placeholder="Enter E-Mail"></div></form></div></div><div class="row"><div class="col-lg-12"><form><div class="form-group"><input id="txtPassword" type="password" class="form-control" placeholder="Password"></div></form></div></div><div class="row pwRow"></div><div class="row"><div class="col-lg-6"><button id="btnLogin" type="submit" class="btn btn-primary form-control">Login</button></div><div class="col-lg-6"><button id="btnCancel" type="submit" class="btn btn-primary form-control">Cancel</button></div></div></div><br><div class="col-lg-12"><button id="passReset" type="submit" class="btn btn-primary form-control">Forget Password?</button></div></div>')
  });

  $(document).on("click", ".sign-up", function(){
      $(".jumbotron").removeClass("col-lg-12").addClass("col-lg-8");
      $(".sign-up-box").addClass("col-lg-3");
      $(".sign-up-box").css("width","100%");
      $(".sign-up-box").css("height","275px");
      $(".sign-up-box").html('<div class="container"><div><ul class="nav justify-content-end"><li class="nav-item"></li></ul></div><div class="row"><div class="col-lg-12"><form><div class="form-group"><input id="txtUser" type="userName" class="form-control" placeholder="Enter User Name"></div></form></div></div><div class="row"><div class="col-lg-12"><form><div class="form-group"><input id="txtEmail" type="email" class="form-control" placeholder="Enter E-Mail"></div></form></div></div><div class="row"><div class="col-lg-12"><form><div class="form-group"><input id="txtPassword" type="password" class="form-control" placeholder="Password"></div></form></div></div><div class="row pwRow"></div><div class="row"><div class="col-lg-6"><button id="btnSignUp" type="submit" class="btn btn-primary form-control">Sign-Up</button></div><div class="col-lg-6"><button id="btnCancel" type="submit" class="btn btn-primary form-control">Cancel</button></div></div></div>')
  });

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
      });
  });

  //forgot password
  $(document).on("click", "#passReset", function () {
      $("#txtPassword").parent().empty();
      $("#btnLogin").text("Submit").attr("id", "reset");
  $("#reset").on("click", function() {
      firebase.auth().sendPasswordResetEmail($("#txtEmail").val().trim()).then(function() {
          console.log("email sent succesfully");
          $(".pwRow").html("<h7 style='color:black;padding:0 0 10px 20px;'>Your email was successfully sent</h7>");
        }).catch(function(error) {
          console.log("email wasn't sent");
          $(".pwRow").html("<h7 style='color:black;padding:0 0 10px 20px;'>" + error + "</h7>");
        });
      });    
  });

  //add signup event
  $(document).keyup(function (event) {
      event.preventDefault();
      if (event.keyCode === 13) {
          event.preventDefault();
          if (signState === "signIn") {
              if (($("#txtEmail").val().trim()) && ($("#txtPassword").val().trim())) {
                  $("#btnLogin").click();
              }
          } else if (signState === "signUp") {
              if (($("#txtEmail").val().trim()) && ($("#txtPassword").val().trim()) && ($("#txtUser").val().trim()))
                  $("#btnSignUp").click();
          }
      }
  })

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
      $(".nav-one").html("<h3 class='welcome'>Welcome "+userObj.displayName+"! How can we Hyelp you today?");
      $(".nav-two").html("<a class='btn btn-lg btn-danger logOut' id='btnLogout'>Log Out</a>");
  }

  //add a realtime listener
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        userObj = firebaseUser;
        console.log(userObj);
        setTimeout(signedIn, 500);
        userDisplayName = userObj.displayName;
        console.log(userDisplayName);
        

        var favorites = database.ref(userDisplayName);
        favorites.on('value', gotData, errData);
        // favorites.on('child_added', gotData, errData);

        function gotData(data) {
            //will return null if no data is saved
            console.log(data.val()+ " <--expect null if no data is stored yet");
            if(data.val() !== null){
            favRests = data.val();
            var keys = Object.keys(favRests);
            console.log(keys);
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                var restInfo = favRests[k].name;
                console.log(k, restInfo);
            };
            console.log(favRests);
            console.log(keys);
            };
        };

        function errData(err) {
            console.log(error);
            console.log(err);
        };

    } else {
        console.log('not logged in');
    };
});

  //allow user to logout
  $(document).on("click", "#btnLogout", function () {
      firebase.auth().signOut();
      console.log("signing out!");
      $(".nav-one").html('<a class="btn btn-lg btn-danger sign-in" style="margin-right:10px">Sign-In</a>');
      $(".nav-two").html('<a class="btn btn-lg btn-danger sign-up">Sign-Up</a>');
  });

  // add favorites by clicking heart icon
  $(document).on("click", "#btnFavorite", function () {

    var keys = Object.keys(favRests);
    //rating display algorithm
    var ratingDisp = {
        avg: [],
        stars: [],
        half: [],
        empty: [],
    };

    var dollarDiv = [];
    var starDiv = [];

    //font awesome star and dollar icons, favorite icons.
    var dollar = "<i class='fab fa-bitcoin'></i>";
    var fullStar = "<i class='fas fa-star'></i>";
    var emptyStar = "<i class='far fa-star'></i>";
    var halfStar = "<i class='fas fa-star-half-alt'></i>";
    var solidHeart = "<i class='fas fa-heart'></i>";
    var emptyHeart = "<i class='far fa-heart'></i>";

    //create rating star divs
    for (i = 0; i < keys.length; i++) {
        var key = keys[i];
        var temp = Math.floor(favRests[key].rating.aggregate_rating);
        var temp2 = favRests[key].rating.aggregate_rating - temp;
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
        };
        ratingDisp.avg.push(favRests[key].rating.aggregate_rating);
        ratingDisp.stars.push(temp);
        ratingDisp.half.push(half);
        ratingDisp.empty.push(empty);
    };
    for (i = 0; i < keys.length; i++) {
        var temp = $("<div></div>");
        for (j = 0; j < ratingDisp.stars[i]; j++) {
            temp.append(fullStar);
        };
        if (ratingDisp.half[i]) {
            temp.append(halfStar);
        };
        for (j = 0; j < ratingDisp.empty[i]; j++) {
            temp.append(emptyStar);
        };
        starDiv.push(temp);
    };

    //create price dollar divs
    for (i = 0; i < keys.length; i++) {
        var key = keys[i];
        var temp = $("<div></div>");
        for (j = 0; j < favRests[key].priceRange; j++) {
            temp.append(dollar);
        };
        dollarDiv.push(temp);
    };

    $(".searchresults").empty();
    console.log(favRests);
    var keys = Object.keys(favRests);
    for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        if (favRests[key].thumbnail) {
            var thumb = favRests[key].thumbnail;
        } else {
            thumb = "assets/images/placehold.jpg"
        };

        $(".searchresults").append(`<div class='card' id='${i}' style = 'width: 12rem;'>
                                    <img class='card-img-top' src='${thumb}' alt='Card image cap'>
                                        <div style ='max-height:20px'>
                                            <i class='fas fa-heart' id='${i}'></i>
                                        </div>
                                    <div class='card-body'>
                                        <h5 class ='card-title' style='text-align:center;height:50px;overflow:hidden;'>${favRests[key].name}</h5>
                                            <span>Price - ${dollarDiv[i][0].innerHTML}</span>
                                            <br>
                                            <div style='margin-top:10px;><${favRests[key].rating.aggregate_rating}&nbsp;&nbsp;${starDiv[i][0].innerHTML}</div>
                                            <p class='card-text' style='margin-top:10px;font-size:12px;height:60px;'>${favRests[key].location.address}</p>
                                            <a target='_blank' href='${favRests[key].link}' class='btn btn-primary' style='margin-left:15px;'>Zomato Page</a>
                                    </div>
                                </div>`)

    };
    $("#map").show();
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
                headers: { 
                    "user-key": apiKey 
                },
            }).then(function (response) {
                console.log(response);
                pages = Math.ceil(response.results_found / 10);
                if (pages > 10) { 
                    pages = 10 
                };
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

            //rating display algorithm
            var ratingDisp = {
                avg: [],
                stars: [],
                half: [],
                empty: [],
            }

            var dollarDiv = [];
            var starDiv = [];

            //font awesome star, heart, and dollar icons
            var dollar = "<i class='fab fa-bitcoin'></i>";
            var fullStar = "<i class='fas fa-star'></i>";
            var emptyStar = "<i class='far fa-star'></i>";
            var halfStar = "<i class='fas fa-star-half-alt'></i>";
            var solidHeart = "<i class='fas fa-heart'></i>";
            var emptyHeart = "<i class='far fa-heart'></i>";

            //heart click icon change
            $(document).on("click", ".fa-heart", function () {
                if ($(this).hasClass("fas")) {
                    $(this).addClass("far").removeClass("fas");


                } else {
                    $(this).addClass("fas").removeClass("far");
                    console.log(userObj);
                    if (userObj !== "null") {
                        //grab the id of the heart, which will be the "i".
                        var restid = $(this).attr("id");
                        console.log(restid);
                        //set variable of restaurant we want to store
                        var favRest = restaurant[restid];
                        console.log(favRest);
                        console.log(userDisplayName);
                        var ref = database.ref(userDisplayName);
                        ref.push(favRest);
                    }
                }
            })

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
                $(".searchresults").append("<div class='card' style='width: 12rem;'><img class='card-img-top' src='" + thumb + "' alt='Card image cap'><div class='card-body'><h5 class='card-title' style='text-align:center;height:50px;overflow:hidden;'>" + restaurant[i].name + "</h5><span>Price - " + dollarDiv[i][0].innerHTML +"</span><br><div style='margin-top:10px;'>"+ restaurant[i].rating.aggregate_rating + "&nbsp;&nbsp;" + starDiv[i][0].innerHTML + "</div><p class='card-text' style='margin-top:10px;font-size:12px;height:60px;'>" + restaurant[i].location.address + "</p><a target='_blank' href='" + restaurant[i].link + "' class='btn btn-primary' style='margin-left:15px;'>Zomato Page</a></div></div>");
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
            $(".fa-heart").hover(function () {
                $(this).css("font-size", "40px");
            }, function () {
                $(this).css("font-size", "30px");
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
                        infoWindow.setContent("<div style='color: black'><strong>" + restaurant[i].name +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+ dollarDiv[i][0].innerHTML+ "</strong><hr><span>Rating: " + restaurant[i].rating.aggregate_rating + "</span>&nbsp;&nbsp;&nbsp;<span>" + starDiv[i][0].innerHTML + "</span>&nbsp;&nbsp;&nbsp;<span>" + restaurant[i].rating.votes + " Reviews</span><br><div style='margin-top:10px;'>" + restaurant[i].location.address + '</div><br>' + '</div>');
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