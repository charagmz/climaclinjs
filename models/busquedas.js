const axios = require('axios');
const fs = require('fs');
    
class Busquedas {
    historial = [];
    dbPath = './db/data.json';

    constructor() {
        this.leerDB();
    }

    get historialCapitalizado() {
        return this.historial.map(lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => {
                return p[0].toUpperCase()+p.substring(1);
            });
            return palabras.join(' ');
        });
    }

    get paramsMapbox () {
        return {
            'limit': 5,
            'language': 'es',
            'access_token': process.env.MAPBOX_KEY
        }
    }

    get paramsWeather () {
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    async ciudades(lugar = '') {
        try {
            // Peticion http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            });
            const resp = await instance.get();
            //place => ({ })//retornar un objeto de forma implicita
            return resp.data.features.map(place => ({
                    id: place.id,
                    nombre: place.place_name,
                    lng: place.center[0],
                    lat: place.center[1]
                
            }));
        } catch (error) {
            return [];
        }
    }

    async climaLugar(lat, lon) {
        try {
            // Peticion http
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                //desestructurar el objeto y agregar las propiedades adicionales
                params: { ...this.paramsWeather, lat, lon}
            });
            const resp = await instance.get();
            const {weather, main} = resp.data;
            //console.log(resp);
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            };
        } catch (error) {
            //console.log(error);
            return [];
        }
    }

    agregarHistorial (lugar = '') {
        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        }
        //de esta forma solo se mantienen los ultimos 4 registros en el historial
        this.historial = this.historial.splice(0,3);

        this.historial.unshift(lugar.toLocaleLowerCase());
        this.guardarDB();
    }

    guardarDB () {
        const payload = {
            historial: this.historial
        }
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }
    

    leerDB () {
        if (!fs.existsSync(this.dbPath)) return;
        
        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8'});
        const data = JSON.parse(info);
        //console.log(data);
        this.historial = data.historial;
    }
}

module.exports = Busquedas;