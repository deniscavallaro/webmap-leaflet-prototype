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
        this.layers["punti"] = punti;
        punti.addTo(this.map);
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
