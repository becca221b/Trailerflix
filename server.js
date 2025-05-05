//carga variables de entorno
require('dotenv').config();

const express= require ("express");
const fs = require('fs');
const path = require('path');

const app = express();

//ruta del archivo json desde la variable de entorno
const dataPath = path.resolve(__dirname,process.env.DATA_PATH);

//Lee y parsea el archivo json
const TRAILERFLIX = (()=>{
    try {
        const fileData = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(fileData);
    } catch (err) {
        console.error('Error al leer el archivo json', err.message);
        return [];
    }
})();



//rutas
app.get('/',(req,res)=>{
    res.send('<h1>Bienvenidos</h1>')
})

app.get('/catalogo',(req,res)=>{
    res.json(TRAILERFLIX);
})

app.get('/titulo/:title',(req,res)=>{
    const parametro = req.params.title.trim().toLowerCase();
    const resultado = TRAILERFLIX.filter(pelis => pelis.titulo.toLowerCase().includes(parametro));
    //console.log(resultado);
    res.json(resultado);
})

app.get('/categoria/:cat',(req,res)=>{
    const parametro = req.params.cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if(parametro==='serie'|| parametro==='pelicula'){
        const resultado = TRAILERFLIX.filter(pelis => pelis.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")===parametro);  
        res.json(resultado);
    }else{
        return res.status(404).send(`<h2>No existe la categoría: ${parametro}</h2>`)
    }
        

    
    
})

//servidor
const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Servidor ejecutándose en el puerto: ${PORT}`)
})