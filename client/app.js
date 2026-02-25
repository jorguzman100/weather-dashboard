$("document").ready(function () {
  var city;
  let queryURL;
  let windyApiKey = "";
  let citiesSearchedObjectsArray = [];
  let ajaxFlag = 0;

  const THEME_STORAGE_KEY = "aeropulse-theme";
  const SEARCH_HISTORY_KEY = "searchedCitiesObjects";
  const MAX_HISTORY_ITEMS = 10;

  function init() {
    initializeTheme();

    runAjax(
      "/api/config",
      function (response) {
        windyApiKey = response.windyApiKey || "";
        loadSearchedCities();
      },
      function () {
        loadSearchedCities();
        showStatusMessage(
          "Configuration loaded without map key. Weather search still works.",
          "info"
        );
      }
    );
  }

  function runAjax(url, thenFunction, failFunction) {
    $.ajax({
      url: url,
      method: "GET",
    })
      .then(function (response) {
        if (thenFunction) {
          thenFunction(response);
        } else {
          return response;
        }
      })
      .fail(function (response) {
        if (failFunction) {
          failFunction(response);
        } else {
          showRequestError(response);
        }
      });
  }

  function showStatusMessage(message, type) {
    const statusMessage = $("#statusMessage");
    statusMessage.removeClass("is-visible is-error is-success is-info");

    if (!message) {
      statusMessage.text("");
      return;
    }

    statusMessage
      .addClass("is-visible")
      .addClass(type ? "is-" + type : "")
      .text(message);
  }

  function showRequestError(response) {
    var errorMessage = "Unable to retrieve weather data.";

    if (response && response.responseJSON) {
      if (response.responseJSON.error) {
        errorMessage = response.responseJSON.error;
      } else if (response.responseJSON.message) {
        errorMessage = response.responseJSON.message;
      }
    }

    showStatusMessage(errorMessage, "error");
  }

  function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const systemPrefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "light" || savedTheme === "dark") {
      applyTheme(savedTheme);
    } else {
      applyTheme(systemPrefersDark ? "dark" : "light");
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      // Ignore storage write failures (private mode / restricted storage)
    }

    if (theme === "dark") {
      $(".themeToggleLabel").text("Light Mode");
    } else {
      $(".themeToggleLabel").text("Dark Mode");
    }
  }

  function loadSearchedCities() {
    const savedCities = localStorage.getItem(SEARCH_HISTORY_KEY);

    if (savedCities) {
      try {
        citiesSearchedObjectsArray = JSON.parse(savedCities);
      } catch (error) {
        citiesSearchedObjectsArray = [];
      }
    } else {
      citiesSearchedObjectsArray = [];
    }

    if (!Array.isArray(citiesSearchedObjectsArray)) {
      citiesSearchedObjectsArray = [];
    }

    renderSearchedCities();

    if (citiesSearchedObjectsArray.length > 0) {
      displayCityInCurrentWeather(
        citiesSearchedObjectsArray[0].city,
        citiesSearchedObjectsArray[0].data
      );
    }
  }

  function renderSearchedCities() {
    $(".listSearchedCities").empty();

    if (citiesSearchedObjectsArray.length === 0) {
      $(".listSearchedCities").append(
        '<p class="historyEmpty">No searches yet. Start with any city.</p>'
      );
      return;
    }

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

    $(".listSearchedCities").hide();
    $(".listSearchedCities").fadeIn(260);
  }

  function displayCityInSearchedCities(res) {
    $("#cityInput").val("");

    const normalizedCity = city.toLowerCase();

    citiesSearchedObjectsArray = citiesSearchedObjectsArray.filter(function (
      object
    ) {
      return object.city.toLowerCase() !== normalizedCity;
    });

    citiesSearchedObjectsArray.unshift({
      city: city,
      data: res,
    });

    citiesSearchedObjectsArray = citiesSearchedObjectsArray.slice(
      0,
      MAX_HISTORY_ITEMS
    );

    try {
      localStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(citiesSearchedObjectsArray)
      );
    } catch (error) {
      // Ignore storage write failures and continue rendering latest response.
    }

    renderSearchedCities();

    displayCityInCurrentWeather(
      citiesSearchedObjectsArray[0].city,
      citiesSearchedObjectsArray[0].data
    );
  }

  function displayCityInCurrentWeather(selectedCity, cityData) {
    var date = new Date(cityData.current.dt * 1000);
    var utcDate = date.toUTCString();
    date = moment.utc(utcDate);
    date = date.format("MMMM Do YYYY");
    var icon = `https://openweathermap.org/img/wn/${cityData.current.weather[0].icon}@2x.png`;
    var temp = (cityData.current.temp - 273.15).toFixed(1);
    var uv = cityData.current.uvi;

    $(".currentData .city").text(selectedCity);
    $(".currentData .date").text(date);
    $(".currentData .icon").attr("src", icon);
    $(".currentData .icon").show();
    $(".currentData .weather").text(
      "Weather: " + cityData.current.weather[0].description
    );
    $(".currentData .temp").text("Temp: " + temp + "ºC");
    $(".currentData .humid").text(
      "Humidity: " + cityData.current.humidity + "%"
    );
    $(".currentData .wind").text(
      "Wind speed: " + cityData.current.wind_speed + " mts/s"
    );

    if (uv >= 0 && uv <= 2) {
      $(".currentData .uv").text("UV Index: " + uv);
      $(".currentData .flag").text(" Low ");
      $(".currentData .flag").css("background", "#d4edda");
      $(".currentData .flag").css("color", "gray");
    } else if (uv >= 3 && uv <= 5) {
      $(".currentData .uv").text("UV Index: " + uv);
      $(".currentData .flag").text(" Moderate ");
      $(".currentData .flag").css("background", "#fff3cd");
      $(".currentData .flag").css("color", "gray");
    } else if (uv >= 6 && uv <= 7) {
      $(".currentData .uv").text("UV Index: " + uv);
      $(".currentData .flag").text(" High ");
      $(".currentData .flag").css("background", "#fff3cd");
      $(".currentData .flag").css("color", "gray");
    } else if (uv >= 8 && uv <= 10) {
      $(".currentData .uv").text("UV Index: " + uv);
      $(".currentData .flag").text(" Very High ");
      $(".currentData .flag").css("background", "#f8d7da");
      $(".currentData .flag").css("color", "gray");
    } else if (uv >= 11) {
      $(".currentData .uv").text("UV Index: " + uv);
      $(".currentData .flag").text(" Extreme ");
      $(".currentData .flag").css("background", "#721c24");
      $(".currentData .flag").css("color", "white");
    }

    $(".currentData").hide();
    $(".currentData").fadeIn(350);

    windyMap(selectedCity, cityData);
    displayForcastDay(cityData);
    showStatusMessage("Live weather updated for " + selectedCity + ".", "success");
  }

  function displayForcastDay(cityData) {
    cityData = cityData.daily;

    cityData.forEach(function (dayData, index) {
      if (index <= 4) {
        var date = new Date(dayData.dt * 1000);
        var utcDate = date.toUTCString();
        date = moment.utc(utcDate);
        date = date.format("MMMM Do YYYY");
        var icon = `https://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png`;
        var weather = dayData.weather[0].description;
        var temp = (dayData.temp.day - 273.15).toFixed(1) + "ºC";
        var humid = dayData.humidity + "%";
        var windSpeed = dayData.wind_speed + " mts/s";
        var uv = dayData.uvi;

        $(".forecast .date").eq(index).text(date);
        $(".forecast .icon").eq(index).attr("src", icon);
        $(".forecast .icon").eq(index).show();
        $(".forecast .weather").eq(index).text(weather);
        $(".forecast .temp")
          .eq(index)
          .text("T: " + temp);
        $(".forecast .humid")
          .eq(index)
          .text("H: " + humid);
        $(".forecast .wind")
          .eq(index)
          .text("WS: " + windSpeed);

        if (uv >= 0 && uv <= 2) {
          $(".forecast .uv").eq(index).text("UV: " + uv);
          $(".forecast .flag").eq(index).text(" Low ");
          $(".forecast .flag").eq(index).css("background", "#d4edda");
          $(".forecast .flag").eq(index).css("color", "gray");
        } else if (uv >= 3 && uv <= 5) {
          $(".forecast .uv")
            .eq(index)
            .text("UV: " + uv);
          $(".forecast .flag").eq(index).text(" Moderate ");
          $(".forecast .flag").eq(index).css("background", "#fff3cd");
          $(".forecast .flag").eq(index).css("color", "gray");
        } else if (uv >= 6 && uv <= 7) {
          $(".forecast .uv")
            .eq(index)
            .text("UV: " + uv);
          $(".forecast .flag").eq(index).text(" High ");
          $(".forecast .flag").eq(index).css("background", "#fff3cd");
          $(".forecast .flag").eq(index).css("color", "gray");
        } else if (uv >= 8 && uv <= 10) {
          $(".forecast .uv")
            .eq(index)
            .text("UV: " + uv);
          $(".forecast .flag").eq(index).text(" Very High ");
          $(".forecast .flag").eq(index).css("background", "#f8d7da");
          $(".forecast .flag").eq(index).css("color", "gray");
        } else if (uv >= 11) {
          $(".forecast .uv")
            .eq(index)
            .text("UV: " + uv);
          $(".forecast .flag").eq(index).text(" Extreme ");
          $(".forecast .flag").eq(index).css("background", "#721c24");
          $(".forecast .flag").eq(index).css("color", "white");
        }
      }
    });

    $(".forecast").hide();
    $(".forecast").fadeIn(350);
  }

  function getCurrentAndForcastData(res) {
    if (ajaxFlag === 0) {
      ajaxFlag = 1;

      // Second request gets the full current + forecast payload.
      queryURL = `/api/onecall?lat=${res.coord.lat}&lon=${res.coord.lon}`;
      runAjax(queryURL, getCurrentAndForcastData);
    } else {
      displayCityInSearchedCities(res);
    }
  }

  let options = {};
  function windyMap(selectedCity, cityData) {
    $("#windy").empty();
    $("#windy").removeClass("mapFallback");

    if (!windyApiKey) {
      $("#windy")
        .addClass("mapFallback")
        .text("Windy map unavailable: missing server configuration.");
      return;
    }

    options = {
      key: windyApiKey,
      verbose: true,
      city: selectedCity,
      lat: cityData.lat,
      lon: cityData.lon,
      zoom: 11,
    };
    windyInit(options, windyCallBack);
  }

  function windyCallBack(windyAPI) {
    const map = windyAPI.map;

    L.popup()
      .setLatLng([options.lat, options.lon])
      .setContent(options.city)
      .openOn(map);
  }

  init();

  $("#themeToggle").on("click", function () {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });

  $(".searchForm").on("submit", function (event) {
    event.preventDefault();
    city = $("#cityInput").val().trim();

    if (!city) {
      showStatusMessage("Enter a city name to search.", "error");
      return;
    }

    ajaxFlag = 0;
    showStatusMessage("Fetching latest weather...", "info");

    queryURL = `/api/weather?q=${encodeURIComponent(city)}`;
    runAjax(queryURL, getCurrentAndForcastData);
  });

  $(".listSearchedCities").on(
    "click",
    ".listItemSearchedCity",
    function (event) {
      event.preventDefault();
      const selectedCity = $(this).attr("searchedcity");

      citiesSearchedObjectsArray.forEach(function (object) {
        if (object.city === selectedCity) {
          displayCityInCurrentWeather(object.city, object.data);
        }
      });
    }
  );
});
