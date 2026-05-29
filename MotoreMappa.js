
export class MotoreMappa {

    constructor(configurazione = {}) {
        this.map = null;
        this.layers = {};
        this.idContenitore = configurazione.idContenitore || "map";
        this.centro = configurazione.centro || [45.407733, 11.873339];
        this.zoom = configurazione.zoom || 12;
        this.layerAttivi = configurazione.layerAttivi || [];

        
    }

    /**
	 * Inizializza e gestisce una mappa Leaflet ei suoi layers
     */
    
    iniziomappa(){

        // creazione mappa
        this.map = L.map(this.idContenitore).setView(this.centro, this.zoom);
        /*L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);*/

        var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        });

        osm.addTo(this.map);
/*
aggiungere un'icona
        var icona = L.icon({
            iconUrl: './img/icon2.jpg',
            iconSize:     [38, 95], 
            iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });
*/
        const m1 = L.marker([45.26, 12.19]).bindPopup('questo è il marker 1'), // venezia  
              m2 = L.marker([45.407733, 11.873339]).bindPopup('questo è il marker 2'), // padova
              m3 = L.marker([45.50, 12.30]).bindPopup('questo è il marker 3')
       
        var Bbox_width= 18.99-5.93;
        var startResolution = Bbox_width/1024;
        var grid_resolution = new Array(22);
        for (var i = 0; i < 22; ++i) {
            grid_resolution[i] = startResolution / Math.pow(2, i);
        }

       var crs_6706 = new L.Proj.CRS('EPSG:6706', '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs', {
            origin: [0, 0],
            bounds: L.bounds([5.93, 34.76], [18.99, 47.1]),
            resolutions: grid_resolution
        });

        // province veneto
        var province = L.tileLayer.wms('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
			layers: ['province', 'CP.CadastralZoning'],
			crs: crs_6706,
			format: 'image/png',
			maxZoom: 19,
			transparent: true,
			attribution: '© ' + '<a href="https://creativecommons.org/licenses/by-nc-nd/2.0/it/">Agenzia delle Entrate</a>',
		});

        var punti = L.layerGroup([m1,m2, m3])
        //var province = L.layerGroup([l1])

          //registro layer
        this.layers["punti"] = punti;
        this.layers["province"] = province;
        //punti.addTo(this.map)
        //l1.addTo(this.map)

        // visualizzo layers in console
        console.log(this.layers)

        // attivazione automatica layers
        for(const nomeLayer of this.layerAttivi){
            const ll = this.layers[nomeLayer]
            if(ll) ll.addTo(this.map)
        }

        /*  control layers -> overlay maps e basemaps
            basemap -> stradale, ortofoto, tecnico
            overlay -> povince, punti 
        */
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
    
    var layerControl = L.control.layers(baseMaps,this.layers).addTo(this.map);
    }

    /**
	 * Attiva o disattiva uno o più layer 
	 * 
	 * @param string nomeLayer	nome del layer
	 * @param boolean visibile se true il layer è attivo, altrimenti non lo è
     */
    toggleLayer(nomeLayer, visibile){
        //se la mappa non contiene il layer
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

    /**
	 * Attiva o disattiva tutti i layers contemporaneamente
	 * 
	 * @param boolean visibile se true il layer è attivo, altrimenti non lo è
     */

    toggleTutti(visibile){
		if (visibile) {
            for(const nomeLayer of this.layerAttivi){
                const layer = this.layers[nomeLayer]
                if(layer) this.map.addLayer(layer);
            }
		} else {
			for(const nomeLayer of this.layerAttivi){
                const layer = this.layers[nomeLayer]
                if(layer) this.map.removeLayer(layer);
            }
		}

    }

    /**
	 * Gestisce i bottoni che attivano o disattivano i layers 
	 * 
     */
    buttons() {
 // se il bottone è stato cliccato lo attiva altrimenti no
        const btnpunti = document.getElementById("btnpunti");
        const btnprovince = document.getElementById("btnprovince");
        const btntutti = document.getElementById("btntutti");

        let puntiVisibili = true;
        let provinceVisibili = true;
        let tuttoVisibile = true;
        
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

        btntutti.addEventListener("click", () => {
            tuttoVisibile = !tuttoVisibile;
            this.toggleTutti(tuttoVisibile);
            btntutti.textContent = (tuttoVisibile ? "Spegni tutti i layer" : "Accendi tutti i layer");
        });

        

    }
    
}

  
