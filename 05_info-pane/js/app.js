document.addEventListener('DOMContentLoaded', function() {
    var gData
    var URL = "13Xd93PIiGvGh2JQ6uygnsUTTLAlJu7F7TE-doTy-5OY"
    Tabletop.init({ 
        key: URL, 
        callback: showInfo, 
        simpleSheet: true 
    })
})

function showInfo(gData) {
    var map = Sheetsee.loadMap("map");
    var stamenToner = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var optionsJSON = ["rowNumber", "name", "icon", "city", "type"]
    var geoJSON = Sheetsee.createGeoJSON(gData, optionsJSON)
    console.log(geoJSON);

    markerLayer = L.geoJson(geoJSON,{
        pointToLayer: function(feature,latlng) {
            var featureIcon = L.icon({
                // Beer by Fabián Sanabria from the Noun Project
                iconUrl:'img/beer.png',
                iconSize: [18,18],
                popupAnchor: [0, -9]
            })
            var marker = L.marker(latlng,{
                icon: featureIcon
            });
            var popupContent = "<div style='color: whitesmoke;'><h2>" + feature.opts.name + "</h2><p>" + feature.opts.city + " | " + feature.opts.type + "</p><img class='establishmentIcon' src='" + feature.opts.icon + "'></div>"
            marker.bindPopup(popupContent);
            return marker
        }
    }).addTo(map);

    map.fitBounds(markerLayer.getBounds())

    tableOptions = {
        "data": gData, 
        "tableDiv": "#beerTable", 
        "filterDiv": "#tableFilter"
    }

    Sheetsee.makeTable(tableOptions)
    Sheetsee.initiateTableFilter(tableOptions)
     
    // TABLE CLICK
    $('.beerRow').live("click", function(event) {
        //TABLE
        $('.beerRow').removeClass("selectedRow")
        var rowNumber = $(this).closest("tr").attr("id")
        $('#' + rowNumber).addClass("selectedRow")
        
        // Sets a variable that is only the data for the selected row
        // This used to update the map positions and the infopane
        var dataElement = Sheetsee.getMatches(gData, rowNumber, "rowNumber")
        
        //MAP
        var selectedCoords = [dataElement[0].lat, dataElement[0].long]
        map.setView(selectedCoords, 17)

        // INFOPANE
        // Fits the selected row attributes to the infopane template (selectedBeer)
        var selectedBeer = Sheetsee.ich.selectedBeer({
            rows: dataElement
        })
        // Adds the filled template as HTML to infopane
        $('#selectedBeer').html(selectedBeer).css("display", "inline")
    })

    // MAP MARKER CLICK
    // Add click listener to the markerLayer
    markerLayer.on('click', function(e) {
        // TABLE
        $('.beerRow').removeClass("selectedRow")
        var rowNumber = e.layer.feature.opts.rowNumber
        $('#' + rowNumber).addClass("selectedRow")

        // Sets a variable that is only the data for the selected row
        // This used to update the map positions and the infopane
        var dataElement = Sheetsee.getMatches(gData, rowNumber.toString(), "rowNumber")
        // take those details and re-write the selected spot section
        var selectedBeer = Sheetsee.ich.selectedBeer({
            rows: dataElement
        })
        
        // MAP
        selectedMarkerLocation = [dataElement[0].lat, dataElement[0].long]
        map.setView(selectedMarkerLocation, 17)
        
        // INFOPANE
        // update the spot listing
        $('#selectedBeer').html(selectedBeer).css("display", "inline")
    })

}