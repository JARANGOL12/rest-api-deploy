const express = require('express') // require -> CommonJS
const crypto = require('node:crypto')
const movies = require('./schemas/movies.json')
const { validateHeaderName } = require('node:http')
const { validateMovie, validateParatialMovie } = require('./movies')
const { error } = require('node:console')
const { title } = require('node:process')




const app = express()

app.use(express.json())

app.disable('x-powered-by') // desabilitar el header x-powered-by: EXPRESS

// metodos normales : GET/HEAD/POST
// metodos complejos : PUT/PATCH/DELETE

// CORS PRE-FLIGHTT
// OPTIONS


const ACCEPTED_ORIGINS =[
      'http://localhost:8080',
      'http://localhost:1234',
      'http://localhost:80',
      'http://movies.com'
]

// Todos los recursos que sean MOVIES SE identifican con /movies
app.get('/movies', (req, res) => {
      const origin = req.header('origin')
      if(ACCEPTED_ORIGINS.includes(origin)  || !origin){
            res.header('Access-Control-Allow-Origin',origin)
      }

      
      const { genre } = req.query
      if (genre) {
            const filterdMovies = movies.filter(
                  movie => movie.genre.some(g => g.toLowerCase() === genre.toLocaleLowerCase())
            )
            return res.json(filterdMovies)
      }
      res.json(movies)

})

// obtener la informacion de la MOVIES por ID

app.get('/movies/:id', (req, res) => { // path-to-regexp
      const { id } = req.params
      const movie = movies.find(movie => movie.id === id)
      if (movie) return res.json(movie)

      res.status(404).json({ message: 'Movie not Found' })


})
app.post('/movies', (req, res) => {
      const result = validateMovie(req.body)
      if (result.error) {
            // 422 Unprocessable Entity
            return res.status(400).json({ error: JSON.parse(result.error.message) })
      }
      const newMovie = {
            id: crypto.randomUUID(), // uuid v4
            ...result.data

      }


      // Esto no seria REST, porque estamos gaurdando 
      // el estado de la aplicacion en memoria
      movies.push(newMovie)
      res.status(201).json(newMovie);
})
app.delete('/movies/:id',(req,res)=>{
      const origin = req.header('origin')
      if(ACCEPTED_ORIGINS.includes(origin)  || !origin){
            res.header('Access-Control-Allow-Origin',origin)
      }

      const {id} = req.params
      const movieIndex = movies.findIndex(movie=>movie.id ===id)

      if(movieIndex ===-1){
            return res.status(404).json({message: 'Movie not found'})
      }
      movies.splice(movieIndex,1)

      return res.json({message:'Movie deleted'})
})   


app.patch('/movies/:id', (req, res) => {

      const result = validateParatialMovie(req.body)

      if (!result.success) {
            return res.status(400).json({ erro: JSON.parse(result.error.message) })
      }
      const { id } = req.params;
      const movieIndex = movies.findIndex(movie => movie.id === id);
      if (!movieIndex === -1) {
            return res.status(404).json({ message: 'Movie not Found' })
      }
      const updateMovie = {
            ...movies[movieIndex],
            ...result.data

      }
      movies[movieIndex] = updateMovie

      return res.json(updateMovie)

})
app.options('/movies/:id',(req,res)=>{
      const origin = req.header('origin')
      if(ACCEPTED_ORIGINS.includes(origin)  || !origin){
            res.header('Access-Control-Allow-Origin',origin)
            res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE')
      }
      res.send(200)
})

const PORT = process.env.PORT ?? 80

app.listen(PORT, () => {
      console.log(`server listening on port http://localhost:${PORT}`)

})