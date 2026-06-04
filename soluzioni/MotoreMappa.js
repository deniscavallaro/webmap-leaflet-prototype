export class MotoreMappa {

	// Costruttore di classe
	// ---------------------
    constructor(configurazione = {}) {
        this.map = null;
        this.layers = {};
        this.baseMaps = {};
        this.idContenitore = configurazione.idContenitore || "map";
        this.centro = configurazione.centro || [45.407733, 11.873339];
        this.zoom = configurazione.zoom || 12;
        this.layerAttivi = configurazione.layerAttivi || [];
        this.nomeBasemapPredefinita = configurazione.nomeBasemapPredefinita || "OpenStreetMap";
    }

	// Inizializzazione della mappa
	// ----------------------------
    iniziomappa() {
        this.map = L.map(this.idContenitore).setView(this.centro, this.zoom);
        this.creaBaseMaps();
        this.creaLayerTematici();
        this.accendiLayerIniziali();
        this.creaLayerControl();
    }

	// Creazione delle basemaps
	// ------------------------
    creaBaseMaps() {
        const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            });

        const stradale = L.tileLayer("https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.jpg?key=tq4NkZ5dHYumXCN3aAZX", {
                type: "tile",
                label: 'strade',
                maxZoom: 19,
                options: {
                    attribution: 
                    "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
                }
            });

		const ortofoto = L.tileLayer("https://api.maptiler.com/maps/satellite-v4/{z}/{x}/{y}.jpg?key=tq4NkZ5dHYumXCN3aAZX", {
                type: "tile",
                label: "Satellite",
                maxZoom: 19,
                options: {
                    attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
                }
            });

		const oceani = L.tileLayer("https://api.maptiler.com/maps/ocean-v4/{z}/{x}/{y}.jpg?key=tq4NkZ5dHYumXCN3aAZX", {
                type: "tile",
                label: "Ocean",
                maxZoom: 19,
                options: {
                    attribution: 
                    "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
                }
            });

		const rilievi = L.tileLayer("https://api.maptiler.com/maps/outdoor-v4/{z}/{x}/{y}.jpg?key=tq4NkZ5dHYumXCN3aAZX", {
                type: "tile",
                label: "Outdoor",
                maxZoom: 19,
                options: {
                    attribution: 
                    "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
                }
            });

        this.aggiungiBaseMap(
            "OpenStreetMap",
            osm,
            true
        );

        this.aggiungiBaseMap(
            "Stradale",
            stradale
        );

        this.aggiungiBaseMap(
            "Ortofoto",
            ortofoto
        );

        this.aggiungiBaseMap(
            "Ocean",
            oceani
        );

        this.aggiungiBaseMap(
            "Outdoor",
            rilievi
        );

        const basemapDefault =
            this.baseMaps[
                this.nomeBasemapPredefinita
            ];

        if (basemapDefault) {
            basemapDefault.addTo(this.map);
        }
        else {
            osm.addTo(this.map);
        }
    }

	// Aggiunta di una basemap
	// -----------------------
    aggiungiBaseMap(
        nome,
        layer,
        predefinita = false
    ) {

        this.baseMaps[nome] = layer;

        if (predefinita) {
            this.nomeBasemapPredefinita = nome;
        }
    }

	// Creazione di layer tematici
	// ---------------------------
    creaLayerTematici() {
        const m1 = L.marker([45.26, 12.19]).bindPopup("questo è il marker 1");
        const m2 = L.marker([45.407733, 11.873339]).bindPopup("questo è il marker 2");
        const m3 = L.marker([45.50, 12.30]).bindPopup("questo è il marker 3");
        const punti = L.layerGroup([m1, m2, m3]);
        this.layers["punti"] = punti;
        
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
		this.layers["province"] = province;

    }

    // Accensione dei layer iniziali
    // -----------------------------
    accendiLayerIniziali() {
        for (const nomeLayer of this.layerAttivi) {
            this.toggleLayer(nomeLayer, true);
        }
    }

	// Creazione del layer control di leaflet
	// --------------------------------------
    creaLayerControl() {
        L.control.layers(
            this.baseMaps,
            this.layers
        ).addTo(this.map);
    }

	// Accensione / spegnimento del layer specificato
	// ----------------------------------------------
    toggleLayer(nomeLayer, visibile) {
        const layer = this.layers[nomeLayer];
        if (!layer) {
            console.log("Layer inesistente -> " + nomeLayer);
            return;
        }
        if (visibile) {
            this.map.addLayer(layer);
        }
        else {
            this.map.removeLayer(layer);
        }
    }

	// Accensione / spegnimento di tutti i layer
	// -----------------------------------------
    toggleTutti(visibile) {
        for (const nomeLayer in this.layers) {
            this.toggleLayer(nomeLayer, visibile);
        }
    }

	// Gestione dei bottoni
	// --------------------
    buttons() {
        const btnpunti = document.getElementById("btnpunti");
        const btnprovince = document.getElementById("btnprovince");
        const btntutti = document.getElementById("btntutti");
        let puntiVisibili = this.layerAttivi.includes("punti");
        let provinceVisibili = this.layerAttivi.includes("province");
        let tuttoVisibile = puntiVisibili;
        btnpunti.addEventListener("click", () => {
				puntiVisibili = !puntiVisibili;
				this.toggleLayer("punti", puntiVisibili);
				btnpunti.textContent = puntiVisibili ? "Spegni punti" : "Accendi punti";
			}
        );
        btnprovince.addEventListener("click", () => {
            provinceVisibili = !provinceVisibili;
            this.toggleLayer("province", provinceVisibili);
            btnprovince.textContent = (provinceVisibili ? "Spegni province" : "Accendi province");
        });
        btntutti.addEventListener("click", () => {
                tuttoVisibile = !tuttoVisibile;
                this.toggleTutti(tuttoVisibile);
                puntiVisibili = tuttoVisibile;
                btnpunti.textContent = puntiVisibili ? "Spegni punti" : "Accendi punti";
                btntutti.textContent = tuttoVisibile ? "Spegni tutti i layer" : "Accendi tutti i layer";
            }
        );
    }
}
