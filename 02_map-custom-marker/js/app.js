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

    // create a template for the popup
    // Our spreadsheet data has been transformed into GeoJSON using Sheetsee
    // Sheetsee allows you to load markers, but they're default pushpins
    // Instead, we'll use Leaflet to transform our GeoJSON into a marker layer.
    // This way we can use our own custom marker icons
    // We'll also create a popup that will show extra information for the clicked location
    markerLayer = L.geoJson(geoJSON,{
        pointToLayer: function(feature,latlng) {
            var featureIcon = L.icon({
                // Beer by Fabián Sanabria from the Noun Project
                iconUrl:'img/beer.png',
                // Set icon size
                iconSize: [18,18],
                // Offset the popup we'll add so it doesn't cover the marker
                popupAnchor: [0, -9]
            })
            var marker = L.marker(latlng,{
                icon: featureIcon
            });
            // We'll access the attributes we want to use with the template feature.opts.<name_of_attribute>
            // This differs a little bit from most GeoJSON in that attributes are usually accessed through feature.properties.<name_of_attribute>
            var popupContent = "<div style='color: whitesmoke;'><h2>" + feature.opts.name + "</h2><p>" + feature.opts.city + " | " + feature.opts.type + "</p><img class='establishmentIcon' src='" + feature.opts.icon + "'></div>"
            marker.bindPopup(popupContent);
            return marker
        }
    }).addTo(map);

    // Set initial map extent to the bounds of the marker layer
    // This way we'll all of our markers when we open the map!
    map.fitBounds(markerLayer.getBounds())
}