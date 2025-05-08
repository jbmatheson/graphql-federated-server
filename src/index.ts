import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    id: ID!
    title: String
    author: String
  }

  input BookInput {
    title: String!
    author: String!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }

  type Mutation {
    createBook(input: BookInput!): Book
  }
`;

const books = [
    {
      id: '1',
      title: 'The Awakening',
      author: 'Kate Chopin',
    },
    {
      id: '2',
      title: 'City of Glass',
      author: 'Paul Auster',
    },
];


// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
      books: () => books,
    },
    Mutation: {
      createBook: (_: any, { input }: { input: { title: string; author: string } }) => {
        const newBook = {
          id: String(books.length + 1),
          ...input
        };
        books.push(newBook);
        return newBook;
      },
    }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// Create Express app
const app = express();

// Apply middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Your Next.js app URL
    credentials: true
}));

// Start the server
const port = 4000;

// Start Apollo Server and then start Express
async function startServer() {
    await server.start();
    
    // Apply Apollo middleware
    app.use('/graphql', expressMiddleware(server));
    
    app.listen(port, () => {
        console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    });
}

startServer().catch((err) => {
    console.error('Error starting server:', err);
});