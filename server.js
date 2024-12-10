import "dotenv/config"
import express from "express"
import pool from "./db.js"
import nunjucks from "nunjucks"
import morgan from "morgan"
import bodyParser from "body-parser"

const app = express()
const port = 3000

app.use(morgan("dev"))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

nunjucks.configure("views", {
  autoescape: true,
  express: app,
})

app.get('/', async (req, res) => {
  const [birds] = await pool.promise().query('SELECT * FROM birds')

  res.json(birds)
})

app.get("/birds", async (req, res) => {
  // const [birds] = await pool.promise().query('SELECT * FROM birds')
  const [birds] = await pool
    .promise()
    .query(
      `SELECT birds.*, species.name AS species 
      FROM birds 
      JOIN species ON birds.species_id = species.id;`,
    )
    res.render("birds.njk", {
      title: "Fågelit",
      bird: birds,
    })
  console.log(birds)  
  console.log(birds.id)
})

app.get('/birds/new', async (req, res) => {
  const [species] = await pool.promise().query('SELECT * FROM species')

  res.render('birds_form.njk',{
   
    specie: species
  })
})

app.post('/birds', async (req, res) => {
  console.log(req.body)
  const { name, description, wingspan, species_id } = req.body

  const [result] = await pool.promise().query('INSERT INTO birds (name, description, wingspan, species_id) VALUES (?, ?, ?, ?)', [name, description, wingspan, species_id])

  res.redirect("/birds")
})

app.get("/birds/:id", async (req, res) => {
  const [bird] = await pool
    .promise()
    .query(
      `SELECT birds.*, species.name AS species 
      FROM birds 
      JOIN species ON birds.species_id = species.id WHERE birds.id = ?;`,
      [req.params.id],
    )
    res.render("bird.njk", {
      title: "Fågelit",
      bird: bird[0],
    })
    console.log(bird)
})

app.get("/species", async (req, res) => {
    // const [birds] = await pool.promise().query('SELECT * FROM birds')
    const [species] = await pool
    .promise()
    .query(
      `SELECT * FROM species`,
    )
    res.render("species.njk", {
      title: "Fågelit",
      specie: species
    })
})

app.get("/species/new", async (req, res) => {
  res.render("species_form.njk")
})

app.post('/species', async (req, res) => {
  const { name, latin, wingspan_min, wingspan_max } = req.body

  const [result] = await pool.promise().query('INSERT INTO species (name, latin, wingspan_min, wingspan_max) VALUES (?, ?, ?, ?)', [name, latin, wingspan_min, wingspan_max])

  res.redirect('/species')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})