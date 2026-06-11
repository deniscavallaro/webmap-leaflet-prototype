
export class MotoreMappa {

    constructor(configurazione = {}) {
        this.map = null;
        this.layers = {};
        this.idContenitore = configurazione.idContenitore || "map";
        this.centro = configurazione.centro || [45.407733, 11.873339];
        this.zoom = configurazione.zoom || 12;
        this.layerAttivi = configurazione.layerAttivi || [];
        this.layerLabels = {};
        this.basemaps = {};
        this.basemapLabels = {};
        this.nomeBasemapPredefinita = configurazione.nomeBasemapPredefinita || "OpenStreetMap";

        this.strumenti = configurazione.strumenti || {
            scala: true,
            coordinateMouse: true,
            doubleClickCoordinate: true,
            ricerca: true,
            miniMappa: true
        }
        this.legende = {};
        this.controlloLegenda = null;
        this.bottoniLayer = {
            punti: "btnpunti",
            province: "btnprovince",
            edifici: "btnedifici",
            ctrr: "btnctrr",
            straderomane: "btnromano"
        }
        this.debug = configurazione.debug || false;
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

        this.creaBaseMaps();
        this.creaLayerTematici();

        this.accendiBasemapPredefinita();
        this.accendiLayerIniziali();
        
        this.creaLayerControl();
        this.aggiungiStrumenti();
        this.sincronizzazioneControlliLayer();

        this.debugLayer();

    }

    //---------------------------------------------------
    //                      BOTTONI
    //---------------------------------------------------

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
        this.collegaBottoniLayer();
        const btntutti = document.getElementById("btntutti");
		
        if(btntutti){
             btntutti.addEventListener("click", () => {
                const tuttiVisibili = this.sonoTuttiLayerVisibili();
                this.toggleTutti(!tuttiVisibili);
                this.aggiornaTestiBottoni();
            })
        }

        this.aggiornaTestiBottoni();
    }

    /**
	 * Aggiorna i testi dei bottoni
     */
    aggiornaTestiBottoni(){
        for(const nomeLayer in this.bottoniLayer){
            const idBottone = this.bottoniLayer[nomeLayer];
            const bottone = document.getElementById(idBottone);
            if(!bottone) continue;

            const visibile = this.isLayerVisibile(nomeLayer)
            const etichetta = this.layerLabels[nomeLayer] || nomeLayer;
            bottone.textContent = (visibile ? "Spegni " + etichetta : "Accendi " + etichetta);
        }

        const btntutti = document.getElementById("btntutti")
        if(btntutti){
            const tuttoVisibile = this.sonoTuttiLayerVisibili();
            btntutti.textContent = (tuttoVisibile ? "Spegni tutti i layers" : "Accendi tutti i layers");
        }
    };

    /**
	 * Collega i bottoni ai layer
     */
    collegaBottoniLayer(){
        for(const nomeLayer in this.bottoniLayer){
            const idBottone = this.bottoniLayer[nomeLayer];
            const bottone = document.getElementById(idBottone);
            if(!bottone){
                console.warn("bottone non trovato: ", idBottone);
                continue;
            }
            bottone.addEventListener("click", () => {
                const visibile  = this.isLayerVisibile(nomeLayer);
                this.toggleLayer(nomeLayer, !visibile);
                this.aggiornaTestiBottoni();
            })
        }
    }
    

    //---------------------------------------------------
    //                      LAYER
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

        // CREO 3 NUOVI LAYER
        var edifici = L.tileLayer.wms("https://idt2-geoserver.regione.veneto.it/geoserver/wms", {
            layers: 'rv:edifici_veneto_feb2022',
			//crs: L.CRS.EPSG6876, 
			format: 'image/png',
			maxZoom: 19,
			transparent: true
        });

        var ctrr = L.tileLayer.wms("https://idt2-geoserver.regione.veneto.it/geoserver/wms", {
            layers: 'rv:ctrr',
			//crs: L.CRS.EPSG3003, 
			format: 'image/png',
			maxZoom: 19,
			transparent: true
        });

        var stradeRomane = L.tileLayer.wms("https://idt2-geoserver.regione.veneto.it/geoserver/wms", {
            layers: 'rv:c11030141212_10straderoman',
			//crs: L.CRS.EPSG3003,
			format: 'image/png',
			maxZoom: 19,
			transparent: true
        });

        //registro layer
        //this.layers["punti"] = punti;
        //this.layers["province"] = province;
        this.aggiungiLayer("punti", punti, "Punti");
        this.aggiungiLayer("province", province, "Province d'italia");

        this.aggiungiLayer("edifici", edifici, "Edifici accatastati Veneto - feb2022")
        this.legende["edifici"] = "http://idt2-geoserver.regione.veneto.it:80/geoserver/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=rv%3Aedifici_veneto_feb2022"
        this.aggiungiLayer("ctrr", ctrr, "ctrr")
        this.legende["ctrr"] = "http://idt2-geoserver.regione.veneto.it:80/geoserver/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=rv%3Actrr" 
        this.aggiungiLayer("straderomane", stradeRomane, "Strade romane")
        this.legende["straderomane"] ="http://idt2-geoserver.regione.veneto.it:80/geoserver/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=rv%3Ac11030141212_10straderoman"

        console.log(this.legende)
    }

    /**
	 * aggiunge i layer all' array globale layers
	 * 
	 * @param string nome         -> nome del layer
     * @param var layer           -> nome della variabile legata al layer
	 * @param string etichetta    -> nome del layer visualizzato dall'utente  
     */
    aggiungiLayer(nome, layer, etichetta){
        this.layers[nome] = layer;
        this.layerLabels[nome] = etichetta;
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
	 * Mostra lo stato di UN layer, è visibile o no
	 * 
	 * @param string nomeLayer -> nome del layer
     */
    isLayerVisibile(nomeLayer){
        const layer = this.layers[nomeLayer];
        if(!layer){
            console.warn("layer non trovato: ", nomeLayer);
            return false;
        }
        return this.map.hasLayer(layer);
    }

    /**
	 * Mostra lo stato di TUTTI i layer, sono visibili o no
     */
    sonoTuttiLayerVisibili(){
        for(const nomeLayer in this.layers){
            if(!this.isLayerVisibile(nomeLayer)) return false;
        }
        return true;
    }

    /**
	 * 1111111111111111111111111111111111111111111111111111111111111111111
     */
    getLayersPerLeaflet(){
        const layersLeaflet = {};
        for(const nome in this.layers){
            const etichetta = this.layerLabels[nome];
            layersLeaflet[etichetta] = this.layers[nome];
        }
        return layersLeaflet;
    }

    //---------------------------------------------------
    //                      BASEMAP
    //---------------------------------------------------

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
            attribution: 
                "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
            
        });

        var ortofoto = L.tileLayer("https://api.maptiler.com/maps/satellite-v4/{z}/{x}/{y}.jpg?key=tq4NkZ5dHYumXCN3aAZX", {
            type: "tile",
            label: "Satellite",
            maxZoom: 19,
            attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
        });

        var oceani = L.tileLayer("https://api.maptiler.com/maps/ocean-v4/{z}/{x}/{y}.jpg?key=tq4NkZ5dHYumXCN3aAZX", {
            type: "tile",
            label: 'Ocean',
            maxZoom: 19,
            attribution: 
                "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
        });

        var rilievi = L.tileLayer("https://api.maptiler.com/maps/outdoor-v4/{z}/{x}/{y}.jpg?key=tq4NkZ5dHYumXCN3aAZX", {
            type: "tile",
            label: 'Outdoor',
            maxZoom: 19,
            attribution: 
                "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
        });
        //aggiungo le basemaps
        this.aggiungiBaseMap("OpenStreetMap", osm, "<span style='color: black'> OpenStreetMap (default) </span>", true);
        this.aggiungiBaseMap("Stradale", stradale, "<span style='color: grey'> Stradale </span>");
        this.aggiungiBaseMap("Ortofoto", ortofoto, "<span style='color: green'> Ortofoto </span>");
        this.aggiungiBaseMap("Oceani", oceani, "<span style='color: blue'> Oceani </span>");
        this.aggiungiBaseMap("Rilievi", rilievi, "<span style='color: brown'> Rilievi </span>");
        //<span style='color:'>

        //aggiungo la basemap predefinita alla mappa
        this.accendiBasemapPredefinita();
    }

    /**
	 * Accende la basemap predefinita
     */
    accendiBasemapPredefinita(){
        const basemapDefault = this.basemaps[this.nomeBasemapPredefinita];
        if(basemapDefault){
            basemapDefault.addTo(this.map);
            return;
        }
        console.warn("basemap predefinita non trovata: ", this.nomeBasemapPredefinita);
        if(this.basemaps["OpenStreetMap"]) this.basemaps["OpenStreetMap"].addTo(this.map);
    }

    /**
	 * Aggiunge le basemap alL' array basemaps
	 * 
	 * @param string nome         -> nome visualizzato della basemap
     * @param var layer           -> nome della variabile legata alla basemap
     * @param string etichetta    -> nome della basemap visualizzato dall'utente
	 * @param boolean predefinita -> se true la basemap viene inportata come predefinita, altrimenti niente  
     */
    aggiungiBaseMap(nome, layer, etichetta, predefinita = false){
        this.basemaps[nome]= layer;
        this.basemapLabels[nome] = etichetta;
        if(predefinita) this.nomeBasemapPredefinita = nome;
    }

    /**
	 * Crea il pannello di controlllo Leaflet per le basemap e i layer 
     */
    creaLayerControl(){
        var layerControl = L.control.layers(this.getBaseMapsPerLeaflet(), this.getLayersPerLeaflet()).addTo(this.map);
    }

    /**
	 * Sincronizzazione layer control e bottoni
     */
    sincronizzazioneControlliLayer(){
        this.map.on("overlayadd", () => {
            this.aggiornaTestiBottoni();
            this.aggiornaLegenda();
        })
        this.map.on("overlayremove", () => {
            this.aggiornaTestiBottoni();
            this.aggiornaLegenda();
        })
        this.map.on("baselayerchange", (evento) => {
            console.log("Basemap attiva: ", evento.name);
        })
    }
 
    /**
	 * 
     */
    getBaseMapsPerLeaflet(){
        const baseMapsLeaflet = {};
        for(const nome in this.basemaps){
            const etichetta = this.basemapLabels[nome];
            baseMapsLeaflet[etichetta] = this.basemaps[nome];
        }
        return baseMapsLeaflet;
    }

    /**
	 * tiene aggiornata la legenda
     */
    aggiornaLegenda(){
        const div = document.querySelector(".pannello-legenda");
        if(!div) return ;
        let html = "<strong>Legenda</strong><br>";
        let almenoUna = false;
        for(const nomeLayer in this.layers){
            const etichetta = this.layerLabels[nomeLayer] || nomeLayer
            if(this.isLayerVisibile(nomeLayer) && this.legende[nomeLayer]){
                html += `
                        <div class="voce-legenda"> 
                            <div>${etichetta}</div>
                            <img src="${this.legende[nomeLayer]}" alt="Legenda ${nomeLayer}">
                        </div>
                        `;
                almenoUna = true;
            }
        }
        if(!almenoUna) html += '<em>Nessun Layer WMS attivo</em>';
        div.innerHTML=html;
    }

    //---------------------------------------------------
    //                AGGIUNTA STRUMENTI
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
	 * Aggiunge la legenda alla mappa
     */
    aggiungiLegenda(){
        this.controlloLegenda = L.control({
            position: "bottomright"
        });
        this.controlloLegenda.onAdd = () => {
            const div = L.DomUtil.create("div", "pannello-legenda");
            div.innerHTML = "<strong>Legenda</strong><br> <em>Nessun Layer WMS attivo</em>";
            return div;
        };
        console.log(this.map);
        this.controlloLegenda.addTo(this.map);
        this.aggiornaLegenda();
    }



    debugLayer(){
        if(!this.debug){
            console.log("Layers: ", this.layers);
            console.log("Layers labels: ", this.layerLabels);
            console.log("Basemaps: ", this.basemaps);
            console.log("Basemap labels: ", this.basemapLabels);
            console.log("legende: ", this.legende);
        }
    }
    
    /**
	 * Aggiunge in un colpo solo tutti gli strumenti al metodo di inizializzazione della mappa
     */
    aggiungiStrumenti(){
        if(this.strumenti.scala) this.aggiungiScala();
        if(this.strumenti.coordinateMouse) this.aggiungiPannelloCoordinate();
        if(this.strumenti.doubleClickCoordinate) this.aggiungiDoubleClickCoordinate();
        if(this.strumenti.ricerca) this.aggiungiRicerca();
        if(this.strumenti.miniMappa) this.aggiungiMinimappa();
        this.aggiungiLegenda();
    };

/*
1. edifici_veneto_feb2022
    <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="http://idt2-geoserver.regione.veneto.it:80/geoserver/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=rv%3Aedifici_veneto_feb2022"/>

2. ctrr
    <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="http://idt2-geoserver.regione.veneto.it:80/geoserver/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=rv%3Actrr"/>

3.c1103015175_straderomane
    <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="http://idt2-geoserver.regione.veneto.it:80/geoserver/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=rv%3Ac1103015175_straderomane"/>

*/
}
