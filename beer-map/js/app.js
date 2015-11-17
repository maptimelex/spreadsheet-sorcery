// Initialize TabletopJS
// This waits for the document to load
// then it calls the function containing everything connected to our spreadsheet
// In this case, this callback is called showInfo
document.addEventListener('DOMContentLoaded', function() {
    var gData
    var URL = "13Xd93PIiGvGh2JQ6uygnsUTTLAlJu7F7TE-doTy-5OY"
        Tabletop.init({ 
            key: URL, 
            callback: showInfo, 
            simpleSheet: true 
        })
})
// Function for creating map, loading in data and placing it in the info pane
function showInfo(gData) {
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

    // What attribute data do we want from our spreadsheet? Use the column name!
    var optionsJSON = ["rowNumber", "name", "icon", "city", "type"]
    // Let's turn our spreadsheet into GeoJSON so we can add it to a map!
    var geoJSON = Sheetsee.createGeoJSON(gData, optionsJSON)
    // This isn't necessary, but it will let you look at the GeoJSON generated by Sheetsee!
    console.log(geoJSON);

    // Setup map, specifying the id of the div where the map will be located
    var map = Sheetsee.loadMap("map")
    // Add a basemap. We can set that with plain Leaflet
    var stamenToner = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Our spreadsheet data has been transformed into GeoJSON using Sheetsee
    // Sheetsee allows you to load markers, but they're default pushpins
    // Instead, we'll use Leaflet to transform our GeoJSON into a marker layer.
    // This way we can use our own custom marker icons
    // We'll also create a popup that will show extra information for the clicked location
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

    // Use jQuery w/ Sheetsee so that when you click on a place in the table, the map zooms to the location and the infopane updates
    $('.beerRow').live("click", function(event) {
        // Clear the styling in the table for the previously selected row
        $('.beerRow').removeClass("selectedRow")
        // Select the row of the location clicked in the table
        var rowNumber = $(this).closest("tr").attr("id")
        // Add styling to the selected row
        $('#' + rowNumber).addClass("selectedRow")
        // Sets a variable that is only the data for the selected row
        var dataElement = Sheetsee.getMatches(gData, rowNumber, "rowNumber")
        // Fits the selected row attributes to the infopane template (selectedBeer)
        var selectedBeer = Sheetsee.ich.selectedBeer({
            rows: dataElement
        })
        console.log(selectedBeer)
        // Adds the filled template as HTML to infopane
        $('#selectedBeer').html(selectedBeer).css("display", "inline")
        // Gets the coordinates of the selected row
        var selectedCoords = [dataElement[0].lat, dataElement[0].long]
        // Set the map view to the selected row's coordinates (w/ fixed zoom level))
        map.setView(selectedCoords, 17)
    })

    // Add click listener to the markerLayer
    markerLayer.on('click', function(e) {
        // clear any selected rows
        $('.beerRow').removeClass("selectedRow")
        // get row number of selected marker
        var rowNumber = e.layer.feature.opts.rowNumber
        // find that row in the table and make consider it selected
        $('#' + rowNumber).addClass("selectedRow")
        // using row number, get the data for the selected spot
        var dataElement = Sheetsee.getMatches(gData, rowNumber.toString(), "rowNumber")
        // take those details and re-write the selected spot section
        var selectedBeer = Sheetsee.ich.selectedBeer({
            rows: dataElement
        })
        // center the map on the selected element
        selectedMarkerLocation = [dataElement[0].lat, dataElement[0].long]
        //map.panTo([dataElement[0].lat, dataElement[0].long])
        map.setView(selectedMarkerLocation, 17)
        // update the spot listing
        $('#selectedBeer').html(selectedBeer).css("display", "inline")
    })

    // resets the map to the extent of the feature layer when you click the reset map button
    $('.resetMap').click(function() {
        // Clear whatever row is selected of the .selectedRow style
        $('.beerRow').removeClass("selectedRow")
        // Clear the infopane of the info about the most recently selected beer place
        $('#selectedBeer').css("display", "none")
        // Center map and set zoom to include all the markers
        map.fitBounds(markerLayer.getBounds())
    })
}