
export class MotoreMappa {

    constructor(configurazione = {}) {
        this.map = null;
        this.layers = {};
        this.idContenitore = configurazione.idContenitore || "map";
        this.centro = configurazione.centro || [45.407733, 11.873339];
        this.zoom = configurazione.zoom || 12;
        this.layerAttivi = configurazione.layerAttivi || [];
        this.basemaps = {};
        this.nomeBasemapPredefinita = configurazione.nomeBasemapPredefinita || "OpenStreetMap";
    };

    /**
	 * Inizializza e gestisce una mappa Leaflet 
     */
    
    iniziomappa(){
        // creazione mappa
        this.map = L.map(this.idContenitore).setView(this.centro, this.zoom);
        /*L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);*/

        // per non creare problemi 
        this.map.doubleClickZoom.disable();

        this.aggiungiStrumenti();
    }

    //---------------------------------------------------
    //              BASEMAP,LAYER, BOTTONI
    //---------------------------------------------------


    /**
	 * Crea i layer predefiniti e li attiva tutti  
	 *           -> province, punti
     */
    creaLayerTematici(){
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

        var punti = L.layerGroup([m1,m2,m3])

        //registro layer
        this.layers["punti"] = punti;
        this.layers["province"] = province;
        
        // visualizzo layers in console
        console.log(this.layers)
    }

    /**
	 * Attiva in automatico i layer
     */
    accendiLayerIniziali() {
        for (const nomeLayer of this.layerAttivi) {
            this.toggleLayer(nomeLayer, true);
        }
    }

    /**
	 * Crea le basemap predefinite e attiva quella di default 
	 *           -> openstreetmap (attivata), stradale, ortofoto, oceani, rilievi
     */
    creaBaseMaps(){
        //basemap openstreet map, di base
        var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            });

        var stradale = L.tileLayer("https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.jpg?key=tq4NkZ5dHYumXCN3aAZX", {
            type: "tile",
            label: 'strade',
            maxZoom: 19,
            //crs: crs_6706,
            //maxZoom: 19,
            options: {
                attribution: 
                "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
            }
        });

        var ortofoto = L.tileLayer("https://api.maptiler.com/maps/satellite-v4/{z}/{x}/{y}.jpg?key=tq4NkZ5dHYumXCN3aAZX", {
            type: "tile",
            label: "Satellite",
            maxZoom: 19,
            options: {
                attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
            }
        });

        var oceani = L.tileLayer("https://api.maptiler.com/maps/ocean-v4/{z}/{x}/{y}.jpg?key=tq4NkZ5dHYumXCN3aAZX", {
            type: "tile",
            label: 'Ocean',
            maxZoom: 19,
            options: {
                attribution: 
                "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
            }
        });

        var rilievi = L.tileLayer("https://api.maptiler.com/maps/outdoor-v4/{z}/{x}/{y}.jpg?key=tq4NkZ5dHYumXCN3aAZX", {
            type: "tile",
            label: 'Outdoor',
            maxZoom: 19,
            options: {
                attribution: 
                "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
            }
        });
        //aggiungo le basemaps
        this.aggiungiBaseMap("<span style='color: black'> OpenStreetMap (default) </span>", osm, true);
        this.aggiungiBaseMap("<span style='color: grey'> Stradale </span>", stradale);
        this.aggiungiBaseMap("<span style='color: green'> Ortofoto </span>", ortofoto);
        this.aggiungiBaseMap("<span style='color: blue'> Oceani </span>", oceani);
        this.aggiungiBaseMap("<span style='color: brown'> Rilievi </span>", rilievi);

        //aggiungo la basemap predefinita alla mappa
        this.basemaps[this.nomeBasemapPredefinita].addTo(this.map); 
    }

    /**
	 * Crea il pannello di controlllo Leaflet per le basemap e i layer 
     */
    creaLayerControl(){
        var layerControl = L.control.layers(this.basemaps, this.layers).addTo(this.map);
    }

    /**
	 * Aggiunge le basemap alla mappa principale
	 * 
	 * @param string nome         -> nome visualizzato della basemap
     * @param var layer           -> nome della variabile legata alla basemap
	 * @param boolean predefinita -> se true la basemap viene inportata come predefinita, altrimenti niente  
     */
    aggiungiBaseMap(nome, layer, predefinita = false){
        this.basemaps[nome]= layer;
        if(predefinita) this.nomeBasemapPredefinita = nome;
    }

    /**
	 * Attiva o disattiva uno o più layer 
	 * 
	 * @param string nomeLayer -> nome del layer
	 * @param boolean visibile -> se true il layer è attivo, altrimenti non lo è
     */
    toggleLayer(nomeLayer, visibile){
       const layer = this.layers[nomeLayer];
       //se la mappa non contiene il layer
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
	 * @param boolean visibile -> se true il layer è attivo, altrimenti non lo è
     */

    toggleTutti(visibile){
		for (const nomeLayer in this.layers) {
			this.toggleLayer(nomeLayer, visibile);
		}
    }

    /**
	 * Gestisce i bottoni che attivano o disattivano i layers 
	 * 
     */
    buttons() {
        const btnpunti = document.getElementById("btnpunti");
        const btnprovince = document.getElementById("btnprovince");
        const btntutti = document.getElementById("btntutti");

		let puntiVisibili = this.layerAttivi.includes("punti");
		let provinceVisibili = this.layerAttivi.includes("province");
		let tuttoVisibile = puntiVisibili && provinceVisibili;
		
		this.aggiornaTestiBottoni(btnpunti, btnprovince, btntutti, puntiVisibili, provinceVisibili, tuttoVisibile);
        
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
            puntiVisibili = tuttoVisibile;
            provinceVisibili = tuttoVisibile;
            this.aggiornaTestiBottoni(btnpunti, btnprovince, btntutti, puntiVisibili, provinceVisibili, tuttoVisibile);
        });
    }
 
    /**
	 * Aggiorna i testi dei bottoni
	 * 
	 * @param button btnpunti    -> bottone che attiva/disattiva marker
     * @param button btnprovince -> bottone che attiva/disattiva layer province
     * @param button btntutti    -> bottone che attiva/disattiva tutt i layers
     * 
     * @param boolean puntiVisibili     -> true se il layer "punti" è attivo, false se non lo è
     * @param boolean provinceVisibili  -> true se il layer "province" è attivo, false se non lo è
     * @param boolean tuttoVisibile     -> true se tutti i layers sono attivi, false se non lo sono
     */
    aggiornaTestiBottoni( btnpunti, btnprovince, btntutti, puntiVisibili, provinceVisibili, tuttoVisibile){
        btnpunti.textContent = (puntiVisibili ? "Spegni punti" : "Accendi punti");
        btnprovince.textContent = (provinceVisibili ? "Spegni province" : "Accendi province");
        btntutti.textContent = (tuttoVisibile ? "Spegni tutti i layers" : "Accendi tutti i layers");
    };


    //---------------------------------------------------
    //                     STRUMENTI
    //---------------------------------------------------


    /**
	 * Scala della mappa
     */
    aggiungiScala(){
        L.control.scale({ 
            position: "bottomleft", 
            metric: true,
            imperial: false
        }).addTo(this.map);
    }

    /**
	 * Coordinate sempre visibili
     */
    aggiungiPannelloCoordinate(){
        this.pannelloCoordinate = L.control({ position: "bottomright"});

        this.pannelloCoordinate.onAdd = function(){
            const div = L.DomUtil.create("div", "pannello-coordinate");
            div.innerHTML = "Lat: - , Lng: - ";
            return div;
        };

        this.pannelloCoordinate.addTo(this.map);

        this.map.on("mousemove", (evento) => {
            const lat = parseFloat(evento.latlng.lan);             // not a number
            const lng = parseFloat(evento.latlng.lng);
            const div = document.querySelector(".pannello-coordinate");
            div.innerHTML = "Lat: " + lat + " | Lng: "+ lng;
        });
    }

    /**
	 * Al dopppio click da le coordinate
     */
    aggiungiDoubleClickCoordinate(){
        this.map.on("dbclick", (evento) => {
            const lat = parseFloat(evento.latlng.lan);             // not a number
            const lng = parseFloat(evento.latlng.lng);
            L.popup().setLatLng(evento.latlng)
                    .setContent("Lat: " + lat + " <br>Lng: "+ lng)
                    .openOn(this.map);
        });
    };

    /**
	 * Aggiunge la barra di ricerca
     */
    aggiungiRicerca(){
        L.Control.geocoder({
            defaultMarkGeocode: true,
            placeholder: "Cerca un luogo..."
        }).addTo(this.map);
    }

    /**
	 * Minimappa!
     */
    aggiungiMinimappa(){
        const miniLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            });
        new L.Control.MiniMap(miniLayer, {
            position: "bottomleft",
            toggleDisplay: true,
            minimized: false
        }).addTo(this.map);
    }
    
    /**
	 * Aggiunge in un colpo solo tutti gli strumenti al metodo di inizializzazione della mappa
     */
    aggiungiStrumenti(){
        this.creaBaseMaps();
        this.creaLayerTematici();
        this.accendiLayerIniziali();
        this.creaLayerControl();
        this.aggiungiScala();
        this.aggiungiPannelloCoordinate();
        this.aggiungiDoubleClickCoordinate();
        this.aggiungiRicerca();
        this.aggiungiMinimappa();
    };














    /**
	 * (dovrebbe) creare una nuova basemap con delle info standard
	 * 
	 * @param button layer    -> nome layer
     * @param button tilelayer -> link al layer
     * 
     * @param button type    -> tipo di layer
     * @param boolean label     -> nome sull'etichetta
     * @param boolean maxzoom  -> zoom massimo
     * @param boolean attribution     -> attributi
     */
    newBasemap(layer, tileLayer, type, label, maxZoom, attribution){
        if(!this.basemaps.includes(layer)){
            this.basemaps[layer] = L.tileLayer(tileLayer,{
                type: type,
                label: label,
                maxZoom: maxZoom,
                attribution: attribution
            });
        }else{console.log("Layer esistente");}
    }
        
}
