
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
/*
        var icona = L.icon({
            iconUrl: './img/icon2.jpg',
            iconSize:     [38, 95], 
            iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });
*/
        //var markers  = L.layerGroup([
        const m1 = L.marker([45.26, 12.19]).bindPopup('questo è il marker 1'); 				// venezia // , {icon: icona}
        const m2 = L.marker([45.407733, 11.873339]).bindPopup('questo è il marker 2'); 		// padova
        const m3 = L.marker([45.50, 12.30]).bindPopup('questo è il marker 3');
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

        var punti = L.layerGroup([m1,m2, m3]);

          //registro layer
        this.layers["punti"] = punti;
        this.layers["province"] = l1;
        punti.addTo(this.map);

        // control layers -> overlay maps e basemaps
        //basemap -> stradale, ortofoto, tecnico
        //overlay -> povince, punti
        var stradale = L.tileLayer('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
            layers: 'strade',
            crs: crs_6706,
            format: 'image/png',
            maxZoom: 19,
            transparent: true
        }); 

        var ortofoto = L.tileLayer("https://idt2-geoserver.regione.veneto.it/geoserver/ows", { // ortofoto veneto
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
    });

    var baseMaps = {
        "<span style='color: grey'> Stradale </span>" : stradale,
        "<span style='color: green'> Ortofoto </span>" : ortofoto,
        "<span style='color: orange'> Tecnico </span>" : tecnico
    }

   /* var overlayMaps = {
        "punti" : punti,
        "province" : l1,
    }*/
    
    var layerControl = L.control.layers(baseMaps,this.layers).addTo(this.map);


    }

    // metodo togglelayer
	toggleLayer(nomeLayer, visibile){
 /*
        //se la mappa non contiene il layer
        if(!this.map.hasLayer(nomelayer)) console.log("Layer inesistente -> " + nomelayer)
            // se lo stato è true
        if (visibile) this.map.addLayer(nomelayer);
            // altriemnti
		else this.map.removeLayer(nomelayer);
*/
		const layer = this.layers[nomeLayer];
		if (!layer) {
			console.log("Layer inesistente -> " + nomeLayer);
			return;
		}
		if (visibile) {
			this.map.addLayer(layer);
		} else {
			this.map.removeLayer(layer);
		}
	}

    
    buttons() {
 // se il bottone è stato cliccato lo attiva altrimenti no
        const btnpunti = document.getElementById("btnpunti");
        const btnprovince = document.getElementById("btnprovince");
       
		let puntiVisibili = true;
		let provinceVisibili = true;
       
        btnpunti.addEventListener("click", () => {
            puntiVisibili = !puntiVisibili;
            this.toggleLayer("punti", puntiVisibili);
            btnpunti.textContent = (puntiVisibili ? "Spegni punti" : "Accendi punti");
        });

        btnprovince.addEventListener("click", () => {
            provinceVisibili = !provinceVisibili;
            this.toggleLayer("province", provinceVisibili);
            btnprovince.textContent = (provinceVisibili ? "Spegni province" : "Accendi province");
        });
    }
        
/*
    checkbox(){
        // bottoni
        const btn = document.getElementById("input")
        btn.type = "checkbox"
        btn.value = n 

//document.getElementById("divA").textContent = "This text is different!";
// The HTML for divA is now:
// <div id="divA">This text is different!</div>

        btn.addEventListener('click', function(v){
            this.toggleLayer(n, v.target.checked)
        })
    } 

*/
    


/*     */
    
}

  
