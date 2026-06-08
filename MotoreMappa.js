
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

        this.strumenti = configurazione.strumenti || {
            scala: true,
            coordinateMouse: true,
            doubleClickCoordinate: true,
            ricerca: true,
            miniMappa: true
        }
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

        // CREO 3 NUOVI LAYER
        var edifici = L.tileLayer("https://idt2-geoserver.regione.veneto.it/geoserver/wms", {
            layers: ['edifici_veneto'],
			crs: L.CRS.EPSG6876, 
			format: 'image/png',
			maxZoom: 19,
			transparent: true
        });

        var ctrr = L.tileLayer("hhttps://idt2-geoserver.regione.veneto.it/geoserver/wms", {
            layers: ['ctrr'],
			//crs: 84, // 84
			format: 'image/png',
			maxZoom: 19,
			transparent: true
        });

        var stradeRomane = L.tileLayer("https://idt2-geoserver.regione.veneto.it/geoserver/wms", {
            layers: ['strade_romane'],
			//crs: 84, // 84
			format: 'image/png',
			maxZoom: 19,
			transparent: true
        });

        this.layers["edifici del veneto"] = edifici;
        this.layers["ctrr"] = ctrr;
        this.layers["strade romane"] = stradeRomane;

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
		
        
        btnpunti.addEventListener("click", () => {
            const visibile = this.isLayerVisibile("punti");
            this.toggleLayer("punti", puntiVisibili);
            this.aggiornaTestiBottoni();
        });
        btnprovince.addEventListener("click", () => {
            const visibile = this.isLayerVisibile("province");
            this.toggleLayer("province", !provinceVisibili);
            this.aggiornaTestiBottoni();
        });
        btntutti.addEventListener("click", () => {
            const tuttiVisibili = this.areLayerVisibili();
            this.toggleTutti(!tuttiVisibili);
            this.aggiornaTestiBottoni();
        });

        this.aggiornaTestiBottoni();
    }
 
    /**
	 * Aggiorna i testi dei bottoni
     */
    aggiornaTestiBottoni(){
        const btnpunti = document.getElementById("btnpunti");
        const btnprovince = document.getElementById("btnprovince");
        const btntutti = document.getElementById("btntutti");

        let puntiVisibili = this.isLayerVisibile("punti");
		let provinceVisibili = this.isLayerVisibile("province");
		let tuttoVisibile = this.areLayerVisibili();

        btnpunti.textContent = (puntiVisibili ? "Spegni punti" : "Accendi punti");
        btnprovince.textContent = (provinceVisibili ? "Spegni province" : "Accendi province");
        btntutti.textContent = (tuttoVisibile ? "Spegni tutti i layers" : "Accendi tutti i layers");
    };
    /**
	 * Mostra lo stato di UN layer, è visibile o no
	 * 
	 * @param string nomeLayer -> nome del layer
     */
    isLayerVisibile(nomeLayer){
        const layer = this.layers[nomeLayer];
        if(!layer) return false;
        return this.map.hasLayer(layer);
    }

    /**
	 * Mostra lo stato di TUTTI i layer, sono visibili o no
     */
    areLayerVisibili(){
        for(const nomeLayer in this.layers){
            if(!this.isLayerVisibile(nomeLayer)) return false;
            return true;
        }
    }

     /**
	 * Sincronizzazione layer control e bottoni
     */
    sincronizzazioneControlliLayer(){
        this.map.on("overlayadd", () => {
            this.aggiornaTestiBottoni();
        })
        this.map.on("overlayremove", () => {
            this.aggiornaTestiBottoni();
        })
    }


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
            const lat = evento.latlng.lat.toFixed(6);
            const lng = evento.latlng.lng.toFixed(6); 
            const div = document.querySelector(".pannello-coordinate");
            div.innerHTML = "Lat: " + lat + " | Lng: "+ lng;
        });
    }

    /**
	 * Al dopppio click da le coordinate
     */
    aggiungiDoubleClickCoordinate(){
        this.map.on("dblclick", (evento) => {
            const lat = evento.latlng.lat.toFixed(6);
            const lng = evento.latlng.lng.toFixed(6);
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
        this.sincronizzazioneControlliLayer();
        if(this.strumenti.scala) this.aggiungiScala();
        if(this.strumenti.coordinateMouse) this.aggiungiPannelloCoordinate();
        if(this.strumenti.doubleClickCoordinate) this.aggiungiDoubleClickCoordinate();
        if(this.strumenti.ricerca) this.aggiungiRicerca();
        if(this.strumenti.miniMappa) this.aggiungiMinimappa();
    };

/*
1. edifici_veneto_feb2022
    <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="http://idt2-geoserver.regione.veneto.it:80/geoserver/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=rv%3Aedifici_veneto_feb2022"/>

2. ctrr
    <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="http://idt2-geoserver.regione.veneto.it:80/geoserver/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=rv%3Actrr"/>

3.c1103015175_straderomane
    <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="http://idt2-geoserver.regione.veneto.it:80/geoserver/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=rv%3Ac1103015175_straderomane"/>

*/




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
