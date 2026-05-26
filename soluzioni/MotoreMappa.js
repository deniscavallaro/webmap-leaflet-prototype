export class MotoreMappa {
    
    constructor() {
        this.map = null;
        this.layers = {};
    }
    
    iniziomappa() {
        this.map = L.map('map').setView([45.407733, 11.873339], 15);
        const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; OpenStreetMap'});
        osm.addTo(this.map);
        const punti = L.layerGroup([
            L.marker([45.407733, 11.873339]).bindPopup("Punto 1"),
            L.marker([45.408500, 11.875000]).bindPopup("Punto 2")
        ]);

		var Bbox_width= 18.99-5.93;
		var startResolution = Bbox_width/1024;
		var grid_resolution = new Array(22);
		for (var i = 0; i < 22; ++i) {
			grid_resolution[i] = startResolution / Math.pow(2, i);
		}       
		var crs_6706 = new L.Proj.CRS('EPSG:6706', '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs',
		   {
			 origin: [0, 0],
			 bounds: L.bounds([5.93, 34.76], [18.99, 47.1]),
			 resolutions: grid_resolution
		   });       
		const wmsLayer_1 = L.tileLayer.wms('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
			layers: ['province', 'CP.CadastralZoning'],
			crs: crs_6706,
			format: 'image/png',
			maxZoom: 19,
			transparent: true,
			attribution: '© ' + '<a href="https://creativecommons.org/licenses/by-nc-nd/2.0/it/">Agenzia delle Entrate</a>',
		});
	
        this.layers["punti"] = punti;
        this.layers["province"] = wmsLayer_1;
        punti.addTo(this.map);
        wmsLayer_1.addTo(this.map);
    }

    toggleLayer(nomeLayer, stato) {
        const layer = this.layers[nomeLayer];
        if (!layer) {
            console.error("Layer non trovato:", nomeLayer);
            return;
        }
        if (stato === true) {
            if (!this.map.hasLayer(layer)) {
                this.map.addLayer(layer);
            }
        } else {
            if (this.map.hasLayer(layer)) {
                this.map.removeLayer(layer);
            }
        }
    }
}
