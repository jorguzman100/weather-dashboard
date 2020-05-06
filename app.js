$("document").ready(function () {
  // Celscius = Kelvin - 273.15
  // Selectors: $('#cityInput')   $('#searchBtn')   $('.listSearchedCities')

  /* ************************* Global Variables ************************* */
  var city;
  const apiKey = "OPENWEATHER_API_KEY_REMOVED";
  let queryURL;
  let citiesSearchedArray = [];
  let citiesSearchedArrayData = [];

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
    if (localStorage.getItem("searchedCities")) {
      citiesSearchedArray = localStorage.getItem("searchedCities");
      citiesSearchedArray = JSON.parse(citiesSearchedArray);
      citiesSearchedArrayData = localStorage.getItem("searchedCitiesData");
      citiesSearchedArrayData = JSON.parse(citiesSearchedArrayData);
      console.log("citiesSearchedArray: ", citiesSearchedArray);
      console.log("citiesSearchedArrayData: ", citiesSearchedArrayData);

      // Display searched cities list
      if (citiesSearchedArray) {
        citiesSearchedArray.forEach(function (searchedCity) {
          var newSearchedCity = $("<a>");
          newSearchedCity.attr("href", "#");
          newSearchedCity.attr("searchedCity", searchedCity);
          newSearchedCity.attr(
            "class",
            "list-group-item list-group-item-action list-group-item-light listItemSearchedCity"
          );
          newSearchedCity.text(searchedCity);
          $(".listSearchedCities").prepend(newSearchedCity);
        });
      }
    } else {
      citiesSearchedArray = [];
      citiesSearchedArrayData = [];
    }
  }

  function displayCityInSearchedCities(res) {
    // Empty the city search input
    $("#cityInput").val("");

    // Add city to the searched cities list array and data
    citiesSearchedArray.push(city);
    citiesSearchedArrayData.push(res);

    // Save searched cities array and data to local storage
    var citiesSearchedArrayString = JSON.stringify(citiesSearchedArray);
    localStorage.setItem("searchedCities", citiesSearchedArrayString);
    var citiesSearchedArrayDataString = JSON.stringify(citiesSearchedArrayData);
    localStorage.setItem("searchedCitiesData", citiesSearchedArrayDataString);

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
    $(".listSearchedCities").hide();
    $(".listSearchedCities").fadeIn(1000);
  }

  /* --------------- City Current --------------- */

  /* --------------- City Forcast --------------- */

  /* ************************* Event Listeners ************************* */
  init();

  $("#searchBtn").on("click", function (event) {
    event.preventDefault();
    city = $("#cityInput").val();
    queryURL = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    runAjax(queryURL, displayCityInSearchedCities);
  });
});
