import { ApolloGateway } from '@apollo/gateway';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';

// Initialize an ApolloGateway instance
const gateway = new ApolloGateway({
  serviceList: [
    { name: 'books', url: 'http://localhost:4000/graphql' },
    { name: 'reviews', url: 'http://localhost:4002/graphql' }
  ],
});

// Create Express app
const app = express();

// Apply middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Start the server
const port = 4001;

// Start Apollo Server and then start Express
async function startServer() {
  const { schema } = await gateway.load();
  
  const server = new ApolloServer({
    schema,
  });

  await server.start();
  
  // Apply Apollo middleware
  app.use('/graphql', expressMiddleware(server));
  
  app.listen(port, () => {
    console.log(`🚀 Gateway ready at http://localhost:${port}/graphql`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
}); 