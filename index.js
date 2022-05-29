require('dotenv').config();

const { 
    leerInput, 
    inquirerMenu, 
    pausa, 
    listarLugares 
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
    const busquedas = new Busquedas();
    let opt;
    do {
        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                // Mostrar mensaje
                const termino = await leerInput('Lugar:');
                
                // Buscar los lugares
                const lugares = await busquedas.ciudades(termino);
                
                // Seleccionar el lugar
                const id = await listarLugares(lugares);
                if (id==='0') continue;
                
                const lugarSel = lugares.find(l => l.id==id);
                
                // Guardar en DB
                busquedas.agregarHistorial(lugarSel.nombre);

                // Obtener el clima
                const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);

                // Mostrar resultados
                console.clear();
                console.log('\nInformacion de la ciudad\n'.green);
                console.log('Ciudad:', lugarSel.nombre.green);
                console.log('Lat:', lugarSel.lat);
                console.log('Lng:', lugarSel.lng);
                console.log('Temperatura:', clima.temp);
                console.log('Minima:', clima.min);
                console.log('Maxima:', clima.max);
                console.log('Como esta el clima:', clima.desc.green);
            break;
            case 2:
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${i+1}.`.green;
                    console.log(`${idx} ${lugar}`);
                });
            break;
        }
        if (opt!==0) await pausa();
    } while (opt!==0)
}


main();