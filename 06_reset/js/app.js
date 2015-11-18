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
        
        var dataElement = Sheetsee.getMatches(gData, rowNumber, "rowNumber")
        
        //MAP
        var selectedCoords = [dataElement[0].lat, dataElement[0].long]
        map.setView(selectedCoords, 17)

        // INFOPANE
        var selectedBeer = Sheetsee.ich.selectedBeer({
            rows: dataElement
        })
        $('#selectedBeer').html(selectedBeer).css("display", "inline")
    })

    // MAP MARKER CLICK
    markerLayer.on('click', function(e) {
        // TABLE
        $('.beerRow').removeClass("selectedRow")
        var rowNumber = e.layer.feature.opts.rowNumber
        $('#' + rowNumber).addClass("selectedRow")

        var dataElement = Sheetsee.getMatches(gData, rowNumber.toString(), "rowNumber")
        var selectedBeer = Sheetsee.ich.selectedBeer({
            rows: dataElement
        })
        
        // MAP
        selectedMarkerLocation = [dataElement[0].lat, dataElement[0].long]
        map.setView(selectedMarkerLocation, 17)
        
        // INFOPANE
        $('#selectedBeer').html(selectedBeer).css("display", "inline")
    })

    // resets the map to the extent of the feature layer when you click the reset map button
    $('.resetMap').click(function() {
        // TABLE
        // Clear whatever row is selected of the .selectedRow style
        $('.beerRow').removeClass("selectedRow")
        
        // INFOPANE
        // Clear the infopane of the info about the most recently selected beer place
        $('#selectedBeer').css("display", "none")

        // MAP
        // Center map and set zoom to include all the markers
        map.fitBounds(markerLayer.getBounds())
    })
}