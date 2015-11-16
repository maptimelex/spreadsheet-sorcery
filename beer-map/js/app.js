document.addEventListener('DOMContentLoaded', function() {
            var gData
            var URL = "13Xd93PIiGvGh2JQ6uygnsUTTLAlJu7F7TE-doTy-5OY"
                Tabletop.init({ key: URL, callback: showInfo, simpleSheet: true })
        })
        // Function for creating map, loading in data and placing it in the info pane
        function showInfo(gData) {
            tableOptions = {
                "data": gData,
                "tableDiv": "#beerTable",
                "filterDiv": "#tableFilter"
            }
            // make the table, and the search bar
            Sheetsee.makeTable(tableOptions)
            Sheetsee.initiateTableFilter(tableOptions)

            // create geoJSON with coordinates and other
            // useful bits from the original data
            var optionsJSON = ["rowNumber", "name", "icon", "city", "type"]
            // Here's our geojson
            var geoJSON = Sheetsee.createGeoJSON(gData, optionsJSON)
            console.log(geoJSON);

            // create map
            var map = Sheetsee.loadMap("map")
            // add basemap from Stamen
            // we can just call it directly using Leaflet
            var stamenToner = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
                attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

    
            markerLayer = L.geoJson(geoJSON,{
                pointToLayer: function(feature,latlng) {
                    // Beer by Fabián Sanabria from the Noun Project
                    var featureIcon = L.icon({
                        iconUrl:'img/beer.png',
                        iconSize: [18,18]
                    })
                    var marker = L.marker(latlng,{
                        icon: featureIcon
                    });
                    var popupContent = "<div style='color: whitesmoke;'><h2>" + feature.opts.name + "</h2><p>" + feature.opts.city + " | " + feature.opts.type + "</p><img class='establishmentIcon' src='" + feature.opts.icon + "'></div>"
                    marker.bindPopup(popupContent);
                    return marker
                }
            }).addTo(map);

            

            // markerLayer.setIcon(icon);
            map.fitBounds(markerLayer.getBounds())


            // when someone clicks on a row, highlight it and
            // re-center the map
            // TODO show popup, change marker color
            $('.beerRow').live("click", function(event) {
                $('.beerRow').removeClass("selectedRow")
                var rowNumber = $(this).closest("tr").attr("id")
                $('#' + rowNumber).addClass("selectedRow")
                var dataElement = Sheetsee.getMatches(gData, rowNumber, "rowNumber")
                var selectedBeer = Sheetsee.ich.selectedBeer({
                    rows: dataElement
                })
                $('#selectedBeer').html(selectedBeer).css("display", "inline")
                var selectedCoords = [dataElement[0].lat, dataElement[0].long]
                map.setView(selectedCoords, 14)
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
                map.panTo([dataElement[0].lat, dataElement[0].long])
                // update the spot listing
                $('#selectedBeer').html(selectedBeer).css("display", "inline")
            })

            // reset the map, zoom out, and recenter on 0,0
            $('.resetMap').click(function() {
                $('.beerRow').removeClass("selectedRow")
                $('#selectedBeer').css("display", "none")
                map.fitBounds(markerLayer.getBounds())
            })
        }