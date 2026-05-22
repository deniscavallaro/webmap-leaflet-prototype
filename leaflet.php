<!DOCTYPE html>
<html>
  <head>
    <title>Demo LeafLet</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css" integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ==" crossorigin=""/>
    <link rel="stylesheet" href="geocoder/Control.OSMGeocoder.css" type="text/css">
    <script src="https://unpkg.com/leaflet@1.5.1/dist/leaflet.js" integrity="sha512-GffPMF3RvMeYyc1LWMHtK8EbPv0iNZ8/oTtHPx9/cc2ILxQ+u905qIwdpULaqDkyBKgOaB57QTMg7ztg8Jm2Og==" crossorigin=""></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.5.0/proj4.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/proj4leaflet/1.0.2/proj4leaflet.js"></script>
    <script src="geocoder/Control.OSMGeocoder.js"></script>
    <link rel="shortcut icon" href="map.ico" type="image/x-icon"/>
  </head>
<style>
.w100 {width: 100%;}
.tacx {text-align: center;}
/*************************************
	Definizioni relative al div popup
**************************************/
div.popupDiv {
	position: absolute;
	left: 0;
	top: 0;
	display: none;
	z-index: 1;
	background-color: #F0F0F0;
	color: red;
	border: 1px solid silver;
}
div.popupDiv div#popupCaption {
	background-color: #2f5376;
	color: white;
	cursor: default;
	height: 2em;
}
div.popupDiv div#popupCaption div {
	padding: 4px 2px 3px 6px;
	float: left;
}
div.popupDiv div#popupCaption a {
	text-decoration: none;
	display: block;
	float: right;
	height: 2em;
	width: 2em;
	background: url(images/cancel.png) no-repeat center left;
	background-position: 5px;
	cursor: pointer;
}
div.popupDiv div#popupData {
	padding: 5px;
}
#mapid { height: 600px; }

.mystyle {
	fill: true;
	weight: 1;
	fillColor: '#FF0000'; // Colore Rosso
	color: '#0000FF'; // Bordo Blu
	fillOpacity: 0.7;
	opacity: 1;
}
</style>
  <body>
		<div id="mapid"></div>
<script>
	var mymap = L.map('mapid').setView([45.3501323, 11.8697856], 8);
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

// Bella chiara
/*var OSM_layer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}); */

// Toner
/*var OSM_layer = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});*/

// Watercolor
/*var OSM_layer = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}', {
	minZoom: 1,
	maxZoom: 16,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'jpg'
});*/

// Esri_WorldGrayCanvas
/*var OSM_layer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}); */

// CartoDB_PositronNoLabels
var OSM_layer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});
OSM_layer.addTo(mymap);

/*	var OSM_layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://brainsix.it">BrainSix</a>'
	});
	OSM_layer.addTo(mymap); */
	


/*	var wmsLayer = L.tileLayer.wms('https://idt2-geoserver.regione.veneto.it/geoserver/ows', {
		layers: 'rv:c0104031_regione', 
		format: "image/png",
		transparent: true,
		crs: L.CRS.EPSG3857
	}).addTo(mymap); */
	var wmsLayer_1 = L.tileLayer.wms('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
			layers: ['province', 'CP.CadastralZoning'],
			crs: crs_6706,
		format: 'image/png',
			maxZoom: 19,
			transparent: true,
		attribution: '© ' + '<a href="https://creativecommons.org/licenses/by-nc-nd/2.0/it/">Agenzia delle Entrate</a>',
	});

	var wmsLayer_2 = L.tileLayer.wms('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
			layers: ['CP.CadastralParcel'],
			crs: crs_6706,
		format: 'image/png',
			maxZoom: 19,
			transparent: true
	});

	var wmsLayer_3 = L.tileLayer.wms('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
			layers: 'fabbricati',
			crs: crs_6706,
		format: 'image/png',
			maxZoom: 19,
			transparent: true
	});

	var wmsLayer_4 = L.tileLayer.wms('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
			layers: 'strade',
			crs: crs_6706,
			format: 'image/png',
			maxZoom: 19,
			transparent: true
	});

	var wmsLayer_5 = L.tileLayer.wms('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
			layers: 'acque',
			crs: crs_6706,
			format: 'image/png',
			maxZoom: 19,
			transparent: true
	});

	var wmsLayer_6 = L.tileLayer.wms('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
			layers: 'vestizioni',
			crs: crs_6706,
		format: 'image/png',
			maxZoom: 19,
			transparent: true
	});

	var codiciIstat = ['28060', '28001', '28003'];
	var wmsLayer_7 = L.tileLayer.wms('https://idt2-geoserver.regione.veneto.it/geoserver/ows', {
			layers: 'rv:c0104011_comuni',
			crs: crs_6706,
			format: 'image/png',
			maxZoom: 19,
			transparent: true,
			styles: 'polygon',
			//sld: 'mystylejjjj.xml'
			//CQL_FILTER: "codistat IN ('28060', '28001')"
			CQL_FILTER: `codistat IN ('${codiciIstat.join("','")}')`
	});
	
	var wmsLayer_8 = L.tileLayer.wms('https://idt2-geoserver.regione.veneto.it/geoserver/ows', {
			layers: 'rv:c0104031_regione',
			crs: crs_6706,
			format: 'image/png',
			maxZoom: 19,
			transparent: true
			//styles: 'polygon',
			//sld: 'mystylejjjj.xml'
			//CQL_FILTER: "codistat IN ('28060', '28001')"
	});
	
	<!-- attivo il selettore di layers -->
	var overlays = {
		"province": wmsLayer_1,
		"particelle": wmsLayer_2,
		"fabbricati": wmsLayer_3,
		"strade": wmsLayer_4,
		"acque": wmsLayer_5,
		"vestizioni": wmsLayer_6,
		"limiti comunali": wmsLayer_7,
		"test": wmsLayer_8
	}
	L.control.layers('',overlays).addTo(mymap);
	
	<!-- attivo la ricerca -->
	var osmGeocoder = new L.Control.OSMGeocoder({placeholder: 'Cerca l\'indirizzo...', text: 'Cerca'});
	mymap.addControl(osmGeocoder);
	
/*	var marker = L.marker([51.5, -0.09]).addTo(mymap);
	var circle = L.circle([51.508, -0.11], {
		color: 'red',
		fillColor: '#f03',
		fillOpacity: 0.5,
		radius: 500
	}).addTo(mymap);
	var polygon = L.polygon([
		[51.509, -0.08],
		[51.503, -0.06],
		[51.51, -0.047]
	]).addTo(mymap);
	marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
	circle.bindPopup("I am a circle.");
	polygon.bindPopup("I am a polygon.");
	var popup = L.popup()
		.setLatLng([51.5, -0.09])
		.setContent("I am a standalone popup.")
		.openOn(mymap);
	mymap.on('click', onMapClick); */

//definizione dell'oggetto popup
var popup = L.popup({maxWidth: 500});
//gestione dell'evento click sulla mappa
mymap.on('click', function(evt) {
 var coord =evt.latlng;
 //invocata la funzione per generare l'URL della richiesta GetFeatureInfo 
 var gFIurl = getFeatureInfoUrl(mymap, wmsLayer_2, coord, crs_6706);
 if (gFIurl) {
	var xhttp;
        //istanza di una richiesta XHTTP
	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
	   popup
           .setLatLng(coord)
           .setContent(xhttp.responseText)
           .openOn(mymap);;
	}
  };
  //bypass CORS policy
  xhttp.open("GET", "https://cors-anywhere.herokuapp.com/" + gFIurl, true);
  xhttp.send();
 }
});

function getFeatureInfoUrl(map, layer, latlng, crs) {
    var point = map.latLngToContainerPoint(latlng, map.getZoom()),
	    size = map.getSize(),
        bounds = map.getBounds(),
        sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast(),
        sw = crs.projection._proj.forward([sw.lng, sw.lat]),
        ne = crs.projection._proj.forward([ne.lng, ne.lat]);
 
    var defaultParams = {
        request: 'GetFeatureInfo',
        service: 'WMS',
        srs: layer._crs.code,
        styles: '',
        version: layer._wmsVersion,
        format: layer.options.format,
        bbox: [sw.join(','), ne.join(',')].join(','),
        height: size.y,
        width: size.x,
        layers: layer.options.layers,
        query_layers: layer.options.layers,
        info_format: 'text/html'
    };
    params = L.Util.extend(defaultParams);
    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
 
    return layer._url + L.Util.getParamString(params, layer._url, true);
}

function onMapClick(e) {
	popup
		.setLatLng(e.latlng)
		.setContent("You clicked the map at " + e.latlng.toString())
		.openOn(mymap);
}
</script>
  </body>
</html>
