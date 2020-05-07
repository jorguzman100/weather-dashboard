$("document").ready(function () {
  // Celscius = Kelvin - 273.15
  // Selectors: $('#cityInput')   $('#searchBtn')   $('.listSearchedCities')   $('.currentData')   $('.currentData .date')   $('.date')    $('.weather')    $('.icon')   $('.temp')    $('.humid')

  /* ************************* Global Variables ************************* */
  var city;
  const apiKey = "OPENWEATHER_API_KEY_REMOVED";
  let queryURL;
  /* let citiesSearchedArray = [];
  let citiesSearchedArrayData = []; */
  let citiesSearchedObject = {};
  let citiesSearchedObjectsArray = [];

  /* ************************* Function Declarations ************************* */
  /* --------------- Global --------------- */
  function init() {
    console.log("init()");
    loadSearchedCities();
  }

  function runAjax(url, thenFunction) {
    console.log("runAjax()");
    $.ajax({
      url: url,
      method: "GET",
    }).then(function (response) {
      thenFunction(response);
    });
  }

  /* --------------- Search Cities --------------- */
  function loadSearchedCities() {
    console.log("loadSearchedCities()");
    // Empty the searched cities list
    $(".listSearchedCities").empty();

    // Load searched cities from local storage
    if (localStorage.getItem("searchedCitiesObjects")) {
      /* citiesSearchedArray = localStorage.getItem("searchedCities");
      citiesSearchedArray = JSON.parse(citiesSearchedArray); */
      /* citiesSearchedArrayData = localStorage.getItem("searchedCitiesData");
      citiesSearchedArrayData = JSON.parse(citiesSearchedArrayData); */

      citiesSearchedObjectsArray = localStorage.getItem(
        "searchedCitiesObjects"
      );
      citiesSearchedObjectsArray = JSON.parse(citiesSearchedObjectsArray);

      // Display searched cities list
      if (citiesSearchedObjectsArray) {
        citiesSearchedObjectsArray.forEach(function (object) {
          var newSearchedCity = $("<a>");
          newSearchedCity.attr("href", "#");
          newSearchedCity.attr("searchedCity", object.city);
          newSearchedCity.attr(
            "class",
            "list-group-item list-group-item-action list-group-item-light listItemSearchedCity"
          );
          newSearchedCity.text(object.city);
          $(".listSearchedCities").append(newSearchedCity);
        });
        displayCityInCurrentWeather(
          citiesSearchedObjectsArray[0].city,
          citiesSearchedObjectsArray[0].data
          /* citiesSearchedArray[0],
          citiesSearchedArrayData[0] */
        );
      }
    } else {
      /* citiesSearchedArray = [];
      citiesSearchedArrayData = []; */
      citiesSearchedObjectsArray = [];
    }
  }

  function displayCityInSearchedCities(res) {
    console.log("displayCityInSearchedCities()");
    loadSearchedCities();
    // Empty the city search input
    $("#cityInput").val("");

    // Add city to the searched cities list array and data
    citiesSearchedObject = {
      city: city,
      data: res,
    };
    /* citiesSearchedArray.unshift(city);
    citiesSearchedArrayData.unshift(res); */
    citiesSearchedObjectsArray.unshift(citiesSearchedObject);

    // Save searched cities array and data to local storage
    /* var citiesSearchedArrayString = JSON.stringify(citiesSearchedArray);
    localStorage.setItem("searchedCities", citiesSearchedArrayString);
    var citiesSearchedArrayDataString = JSON.stringify(citiesSearchedArrayData);
    localStorage.setItem("searchedCitiesData", citiesSearchedArrayDataString); */
    var citiesSearchedObjectsArrayString = JSON.stringify(
      citiesSearchedObjectsArray
    );
    localStorage.setItem(
      "searchedCitiesObjects",
      citiesSearchedObjectsArrayString
    );

    console.log(
      "citiesSearchedObjectsArrayString: ",
      citiesSearchedObjectsArrayString
    );
    // Append new city element to the searched list
    var newSearchedCity = $("<a>");
    newSearchedCity.attr("href", "#");
    newSearchedCity.attr("searchedCity", city);
    newSearchedCity.attr(
      "class",
      "list-group-item list-group-item-action list-group-item-success listItemSearchedCity"
    );
    newSearchedCity.text(city);
    $(".listSearchedCities").prepend(newSearchedCity);
    $(".listSearchedCities").hide();
    $(".listSearchedCities").fadeIn(1000);
    displayCityInCurrentWeather(
      citiesSearchedObjectsArray[0].city,
      citiesSearchedObjectsArray[0].data
      /* citiesSearchedArray[0],
      citiesSearchedArrayData[0] */
    );
  }

  /* --------------- City Current --------------- */
  function displayCityInCurrentWeather(city, cityData) {
    console.log("displayCityInCurrentWeather()");
    console.log("City Data: ", cityData);
    date = new Date(cityData.dt * 1000);
    var utc_date = date.toUTCString();
    date = moment.utc(utc_date);
    date = date.format("MMMM Do YYYY");
    var icon = `http://openweathermap.org/img/wn/${cityData.weather[0].icon}@2x.png`;
    console.log("Icon: ", icon);

    temp = (cityData.main.temp - 273.15).toFixed(1);
    $(".currentData h5").text(`Current Weather - ${city}`);
    $(".currentData .date").text(date);
    $(".currentData .icon").attr("src", icon);
    $(".currentData .weather").text(
      "Weather: " + cityData.weather[0].description
    );
    $(".currentData .temp").text("Temp: " + temp + "ºC");
    $(".currentData .humid").text("Humidity: " + cityData.main.humidity + "%");
    $(".currentData .wind").text(
      "Wind speed: " + cityData.wind.speed + " mts/s"
    );
    $(".currentData .uv").text("UV Index: ");
  }

  /* --------------- City Forcast --------------- */

  /* ************************* Event Listeners ************************* */
  init();

  $("#searchBtn").on("click", function (event) {
    event.preventDefault();
    city = $("#cityInput").val();
    queryURL = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    runAjax(queryURL, displayCityInSearchedCities);
  });

  $(".listSearchedCities").on("click", function (event) {
    loadSearchedCities();
    citiesSearchedObjectsArray.forEach(function (object) {
      if (object.city === $(event.target).attr("searchedcity")) {
        displayCityInCurrentWeather(object.city, object.data);
      }
    });
  });
});
