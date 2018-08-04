$(document).ready(function () {
    //zomato search database
    var category
    var queryURL = "https://developers.zomato.com/api/v2.1/";
    var apiKey = "1bcf7dd2c40009d8924547e40480bb0c";

    //fontawesome icon array
    var iconArray = ["<i class='fas fa-truck'></i>", "<i class='far fa-calendar-alt'></i>", "<i class='far fa-moon'></i>", "<i class='far fa-clock'></i>", "<i class='fas fa-box'></i>", "<i class='fas fa-coffee'></i>", "<i class='fas fa-book-open'></i>", "<ion-icon name='sunny'></ion-icon>", "<ion-icon name='pizza'></ion-icon>", "<i class='fas fa-utensils'></i>", "<ion-icon name='beer'></ion-icon>", "<i class='far fa-money-bill-alt'></i>", "<i class='fas fa-cocktail'></i>"];
    //get categories
    $.ajax({
        url: queryURL + "categories",
        method: "GET",
        headers: { "user-key": apiKey },
    }).then(function (response) {
        category = response;
        for (i = 0; i < category.categories.length; i++) {
            $("#inputCategory").append("<option class='inputCategory' value='" + category.categories[i].categories.id + "'> " + category.categories[i].categories.name + "</option>")
        }
    })

    //get 
    $(".submit").on("click", function () {
        if ($("#inputCategory option:selected").attr("value") && $(".input-location").val().trim()) {
            var catID = $("#inputCategory option:selected").attr("value");
            var city = $(".input-location").val().trim();
            var cityID;
            $.ajax({
                url: "https://developers.zomato.com/api/v2.1/cities?q=" + city,
                method: "GET",
                headers: { "user-key": apiKey },
            }).then(function (cityResult) {
                cityID = cityResult.location_suggestions[0].id;
                console.log(cityID);
                var searchURL = "https://developers.zomato.com/api/v2.1/search?entity_id=" + cityID + "&entity_type=city&category=" + catID;
                var restaurant = [];
                var displayNum = 20;
                $.ajax({
                    url: searchURL,
                    method: "GET",
                    headers: { "user-key": apiKey },
                }).then(function (response) {
                    console.log(response);
                    if (response.length < 21) {
                        displayNum = response.length;
                    }
                    for (i = 0; i < displayNum; i++) {
                        var temp = {
                            name: response.restaurants[i].restaurant.name,
                            cuisine: response.restaurants[i].restaurant.cuisines,
                            location: response.restaurants[i].restaurant.location,
                            priceRange: response.restaurants[i].restaurant.price_range,
                        }
                        restaurant.push(temp);  
                    }
                    console.log(restaurant);
                    
                })
            })
        }
    })
})      