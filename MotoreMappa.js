
export class MotoreMappa {

    constructor() {
        this.map = null;
        this.layers = {};
    }
    
    iniziomappa(){
        this.map = L.map('map').setView([45.407733, 11.873339], 15); // coordinate di padova 
        /*L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);*/

        var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        });

        osm.addTo(this.map);

        console.log("aggiungendo markers")
        
        //var markers  = L.layerGroup([
        var m1 = L.marker([45.26, 12.19]).bindPopup('questo è il marker 1'), // venezia
            m2 = L.marker([45.407733, 11.873339]).bindPopup('questo è il marker 2'), // padova
            m3 = L.marker([45.50, 12.30]).bindPopup('questo è il marker 3')
        //]); 
       
        var grid_resolution = new Array(22);
            for (let i = 0; i < 22; ++i) {
                grid_resolution[i] = ( (18.99-5.93) /1024 ) / Math.pow(2, i);
            }

       var crs_6706 = new L.Proj.CRS('EPSG:6706', '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs', {
            origin: [0, 0],
            bounds: L.bounds([5.93, 34.76], [18.99, 47.1]),
            resolutions: grid_resolution
        });
 

        // province veneto
        var l1 = L.tileLayer.wms('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
            layers: ['province', 'CP.CadastralZoning'],
            crs: crs_6706,
            format: 'image/png',
            maxZoom: 19,
            transparent: true,
            attribution: '© ' + '<a href="https://creativecommons.org/licenses/by-nc-nd/2.0/it/">Agenzia delle Entrate</a>',
        });

        var punti = L.layerGroup([m1,m2, m3, l1])

          //registro layer
        this.layers["punti"] = punti;
        punti.addTo(this.map)
    }
    // timer che ricalcola la mappa se non funziona
    avvia() {
        setTimeout(iniziomappa(), 500);
    }

    // metodo togglelayer
    toggleLayer(nomelayer, stato){
        //se la mappa non contiene il layer
        if(!this.map.hasLayer(nomelayer)) console.log("Layer inesistente -> " + nomelayer)
            // se lo stato è true
        if (stato) this.map.addLayer(nomelayer);
            // altriemnti
		else this.map.removeLayer(nomelayer);
    }

    avviaToggleLayer(){
        setTimeout(this.toggleLayer(), 3000)
    }



    /*
    bottoni(){
        // bottoni
        const btn = document.getElementById("btnLayers")
        //const spegni = document.getElementById("accendilayers")

        btn.addEventListener('click', function(){
            
        })
    } */

    


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
    
}

