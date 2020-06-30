import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import App from '../src/App';


const app = express();

const PORT = process.env.PORT || 8000;
app.get('/', (req, res) => {
    res.redirect('news/0');
    res.end();
});
app.get('/news/:page', (req, res)=>{
    const pageNumber = req.params.page;
   
        axios.get(`https://hn.algolia.com/api/v1/search?page=${pageNumber}&hitsPerPage=30&tags=story`)
        .then(resp => {
            const result = { data: resp.data.hits, totalPages: resp.data.nbPages };
          fs.readFile(path.resolve("./build/index.html"), "utf-8", (err, data) => {
            if(err){
                console.log(err);
                return res.status(500).send("app failed");
            }
            const data1 = data.replace(
                '<div id="root"></div>',
                `<div id="root">${ReactDOMServer.renderToString(<App {...result}/>)}</div>`
            ).replace(
                '<script id="initialData"></script>',
                `<script id="initialData">window.__INITIAL__DATA__ = ${JSON.stringify({ result })}</script>`
            )
            return res.status(200).send(
                data1
            )
        })
        }). catch(()=>{
            res.status(500).send("app failed");
        })

})
// app.get('news/:page', (req, res)=>{
//     const pageNumber = req.params.page
//     console.log(pageNumber);
//     res.send({page: pageNumber}).end();
// })
app.use(express.static(path.resolve(__dirname, '../build')));
app.listen(PORT, ()=>{
    console.log("App launched");
})