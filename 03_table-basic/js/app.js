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

    //Options for our table
    tableOptions = {
        // What's the data (gData) we'll pass to our table?
        "data": gData, 
        // Where will we be placing the table in our website?
        "tableDiv": "#beerTable", 
        // What element will act as the filter for table?
        "filterDiv": "#tableFilter"
    }

    // put data into table using our table options
    Sheetsee.makeTable(tableOptions)
    // create filter using table options
    Sheetsee.initiateTableFilter(tableOptions)
}