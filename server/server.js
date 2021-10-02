const express = require('express')
const path = require('path')
const db = require('./config/connection')
const routes = require('./routes')
const { authMiddleware } = require('./utils/auth')

// import ApolloServer and its typeDefs and resolvers
const { ApolloServer } = require('apollo-server-express')
const { typeDefs, resolvers } = require('./schemas')

const app = express()
const PORT = process.env.PORT || 3001

// create Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
})

async function startServer() {
  await server.start()
  server.applyMiddleware({ app })
}

startServer()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')))
}

app.use(routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
})

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`))
})
