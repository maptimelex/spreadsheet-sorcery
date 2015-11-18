// Initialize TabletopJS
// This waits for the document to load
// then it calls the function containing everything connected to our spreadsheet
// In this case, this callback is called showInfo
document.addEventListener('DOMContentLoaded', function() {
    var gData
    // Spreadsheet ID
    var URL = "13Xd93PIiGvGh2JQ6uygnsUTTLAlJu7F7TE-doTy-5OY"
    Tabletop.init({ 
        key: URL, 
        callback: showInfo, 
        simpleSheet: true 
    })
})
// Function for creating map, loading in data and placing it in the info pane
function showInfo(gData) {
    
}