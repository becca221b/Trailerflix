//carga variables de entorno
require('dotenv').config();

const express= require ("express");
const fs = require('fs').promises;
const path = require('path');

const app = express();

//ruta del archivo json desde la variable de entorno
const dataPath = path.resolve(__dirname,process.env.DATA_PATH);

//Lee y parsea el archivo json
let TRAILERFLIX = [];

async function cargarPelis() {
    try {
        const fileData = await fs.readFile(dataPath, 'utf-8');
        TRAILERFLIX = JSON.parse(fileData);
    } catch (err) {
        console.error('Error al leer el archivo json', err.message);
        TRAILERFLIX = [];
    }
};

//Middleware para rutas async
const asyncHandler = fn => (req,res,next) =>{
    Promise.resolve(fn(req, res, next)).catch(next);
}

//rutas
app.get('/',(req,res)=>{
    res.send('<h1>Bienvenidos</h1>')
})

app.get('/catalogo', asyncHandler(async (req,res)=>{
    res.json(TRAILERFLIX);
}));

app.get('/titulo/:title',asyncHandler(async (req,res)=>{
    const parametro = req.params.title.trim().toLowerCase();
    const resultado = TRAILERFLIX.filter(pelis => pelis.titulo.toLowerCase().includes(parametro));
    //console.log(resultado);
    res.json(resultado);
}))

app.get('/categoria/:cat', asyncHandler(async (req,res)=>{
    const parametro = req.params.cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if(parametro==='serie'|| parametro==='pelicula'){
        const resultado = TRAILERFLIX.filter(pelis => pelis.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")===parametro);  
        res.json(resultado);
    }else{
        res.status(404).send(`<h2>No existe la categoría: ${parametro}</h2>`)
    }
}))

app.get('/reparto/:act', asyncHandler(async(req,res)=>{
    const parametro= req.params.act.trim().toLowerCase();
    const reparto = TRAILERFLIX
        .filter(pelis=>pelis.reparto.trim().toLowerCase().includes(parametro))
        .map(pelis=>(
            {
                "titulo" : peli.titulo,
                "reparto" : peli.reparto
            }
        ))
    res.json(reparto);
   
}))

app.get('/trailer/:id', asyncHandler(async (req,res)=>{
    const parametro = parseInt(req.params.id);
    if(isNaN(parametro)){
        return res.status(400).json({error: 'El ID debe ser un número'})
    }
    
    const resultado = TRAILERFLIX.find(peli=>peli.id == parametro);
        
    if(!resultado){
        return res.status(404).json({
            "mensaje":'Contenido no encontrado'
        })
    }
    if(!resultado?.trailer){
        return res.json({
            "mensaje": 'Video no disponible'
        })
    }else{
        res.json({
            "id": resultado.id,
            "titulo": resultado.titulo,
            "trailer": resultado.trailer
        })
    }
    
}))

// Middleware de error 404 para cualquier otra ruta
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware 500 - para cualquier error que se dispare
app.use((err, req, res, next) => {
    console.error('Error no capturado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});


//servidor
(async ()=>{
    await cargarPelis();
    const PORT = process.env.PORT;
    app.listen(PORT,()=>{
        console.log(`Servidor ejecutándose en el puerto: ${PORT}`)
    })

})();