
class MotoreMappa {
    
    static iniziomappa(){
        const map = L.map('map').setView([45.407733, 11.873339], 15); // coordinate di padova 
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
    }
    // timer che ricalcola la mappa se non funziona
    avvia() {
        setTimeout(iniziomappa, 5000);
    }
/*    var stradale = L.tileLayer(, {
            layers: 'strade',
            crs: crs_6706,
            format: 'image/png',
            maxZoom: 19,
            transparent: true
    }); */
 /*   var ortofoto = L.tileLayer('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
            layers: 'strade',
            crs: crs_6706,
            format: 'image/png',
            maxZoom: 19,
            transparent: true
    }); 
    var tecnico = L.tileLayer('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
            layers: 'strade',
            crs: crs_6706,
            format: 'image/png',
            maxZoom: 19,
            transparent: true
    }); */
    
 // aggiungo i layer ad un gruppo
 //  var layers = L.layerGroup([stradale, ortofoto, tecnico]);
    /*const infobtn = document.querySelector("#info")
    const layersbtn = document.getElementById("layers")
    infobtn.addEventListener('click', function() {
        infobtn.
    });
    function mostra(){
    }*/
}