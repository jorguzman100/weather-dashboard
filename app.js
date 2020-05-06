$("document").ready(function () {
  // Celscius = Kelvin - 273.15
  // Selectors: $('#cityInput')   $('#searchBtn')   $('.listSearchedCities')

  /* ************************* Global Variables ************************* */
  var city;
  const apiKey = "OPENWEATHER_API_KEY_REMOVED";
  let queryURL;
  let citiesSearchedArray = [];

  /* ************************* Function Declarations ************************* */
  /* --------------- Global --------------- */
  function init() {
    loadSearchedCities();
  }

  function runAjax(url, thenFunction) {
    $.ajax({
      url: url,
      method: "GET",
    }).then(function (response) {
      thenFunction(response);
    });
  }

  /* --------------- Search Cities --------------- */
  function loadSearchedCities() {
    // Empty the searched cities list
    $(".listSearchedCities").empty();

    // Load searched cities from local storage
    citiesSearchedArray = localStorage.getItem("searchedCities");
    citiesSearchedArray = JSON.parse(citiesSearchedArray);
    console.log("citiesSearchedArray: ", citiesSearchedArray);

    // Display searched cities list
    citiesSearchedArray.forEach(function (searchedCity) {
      var newSearchedCity = $("<a>");
      newSearchedCity.attr("href", "#");
      newSearchedCity.attr("searchedCity", searchedCity);
      newSearchedCity.attr(
        "class",
        "list-group-item list-group-item-action list-group-item-light listItemSearchedCity"
      );
      newSearchedCity.text(searchedCity);
      console.log(newSearchedCity);
      $(".listSearchedCities").prepend(newSearchedCity);
    });
  }

  function displayCity(res) {
    // Empty the city search input
    $("#cityInput").val("");

    // Add city to the searched cities list array
    citiesSearchedArray.push(city);

    // Save searched cities array to local storage
    var citiesSearchedArrayString = JSON.stringify(citiesSearchedArray);
    localStorage.setItem("searchedCities", citiesSearchedArrayString);

    // Append new city element to the searched list
    var newSearchedCity = $("<a>");
    newSearchedCity.attr("href", "#");
    newSearchedCity.attr(
      "class",
      "list-group-item list-group-item-action list-group-item-success listItemSearchedCity"
    );
    newSearchedCity.text(city);
    console.log(newSearchedCity);
    $(".listSearchedCities").prepend(newSearchedCity);
  }

  /* --------------- City Current --------------- */

  /* --------------- City Forcast --------------- */

  /* ************************* Event Listeners ************************* */
  init();

  $("#searchBtn").on("click", function (event) {
    event.preventDefault();
    city = $("#cityInput").val();
    queryURL = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    runAjax(queryURL, displayCity);
  });
});
