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
            // Beer by Fabián Sanabria from the Noun Project
            var featureIcon = L.icon({
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
    // Use jQuery w/ Sheetsee so that when you click on a place in the table, the map zooms to the location
    $('.beerRow').live("click", function(event) {
        // TABLE
        // Clear the styling in the table for the previously selected row
        $('.beerRow').removeClass("selectedRow")
        // Select the row of the location clicked in the table
        var rowNumber = $(this).closest("tr").attr("id")
        // Add styling to the selected row
        $('#' + rowNumber).addClass("selectedRow")
        
        // Sets a variable that is only the data for the selected row
        var dataElement = Sheetsee.getMatches(gData, rowNumber, "rowNumber")       
        
        // MAP
        // Gets the coordinates of the selected row
        var selectedCoords = [dataElement[0].lat, dataElement[0].long]
        // Set the map view to the selected row's coordinates (w/ fixed zoom level))
        map.setView(selectedCoords, 17)
    })

    // MAP MARKER CLICK
    // Add click listener to the markerLayer
    markerLayer.on('click', function(e) {
        //TABLE
        // clear any selected rows
        $('.beerRow').removeClass("selectedRow")
        // get row number of selected marker
        var rowNumber = e.layer.feature.opts.rowNumber
        // find that row in the table and make consider it selected
        $('#' + rowNumber).addClass("selectedRow")
        
        // using row number, get the data for the selected spot
        var dataElement = Sheetsee.getMatches(gData, rowNumber.toString(), "rowNumber")

        //MAP
        // center the map on the selected element
        selectedMarkerLocation = [dataElement[0].lat, dataElement[0].long]
        //map.panTo([dataElement[0].lat, dataElement[0].long])
        map.setView(selectedMarkerLocation, 17)
        // update the spot listing
        $('#selectedBeer').html(selectedBeer).css("display", "inline")
    })

}