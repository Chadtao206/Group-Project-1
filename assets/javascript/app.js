
<script type="text/javascript">

    $("#submit").on("click", function(){
        event.preventDefault();
    var apiKey = "1bcf7dd2c40009d8924547e40480bb0c";
    var term = $(this).val().trim();
    var searchURL = "https://developers.zomato.com/api/v2.1/search?q="+term;
    var restaurant = [];
        $.ajax({
        url: searchURL,
    method:"GET",
            headers:{"user-key": apiKey}
        }).then(function(response){
        console.log(response);
    for (i=0;i<20;i++){
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
    </script>

