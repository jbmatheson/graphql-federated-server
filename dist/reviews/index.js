import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { parse } from 'graphql';
const typeDefs = `#graphql
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0",
          import: ["@key", "@external", "@shareable"])

  type Review {
    id: ID!
    rating: Int!
    comment: String
    bookId: ID!
  }

  extend type Book @key(fields: "id") {
    id: ID! @external
    reviews: [Review]
  }

  type Query {
    reviews(bookId: ID!, reviewId: ID): [Review]
  }

  type Mutation {
    addReview(bookId: ID!, rating: Int!, comment: String): Review
  }
`;
// Sample data
const reviews = [
    {
        id: '1',
        rating: 5,
        comment: 'Great book!',
        bookId: '1'
    },
    {
        id: '2',
        rating: 4,
        comment: 'Really enjoyed it',
        bookId: '1'
    }
];
const resolvers = {
    Book: {
        reviews: (book) => {
            return reviews.filter(review => review.bookId === book.id);
        }
    },
    Query: {
        reviews: (_, { bookId, reviewId }) => {
            let filteredReviews = reviews.filter(review => review.bookId === bookId);
            if (reviewId) {
                filteredReviews = filteredReviews.filter(review => review.id === reviewId);
            }
            return filteredReviews;
        }
    },
    Mutation: {
        addReview: (_, { bookId, rating, comment }) => {
            const newReview = {
                id: String(reviews.length + 1),
                rating,
                comment,
                bookId
            };
            reviews.push(newReview);
            return newReview;
        }
    }
};
const server = new ApolloServer({
    schema: buildSubgraphSchema({
        typeDefs: parse(typeDefs),
        resolvers,
    }),
});
const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
const port = 4002;
async function startServer() {
    await server.start();
    app.use('/graphql', expressMiddleware(server));
    app.listen(port, () => {
        console.log(`🚀 Reviews service ready at http://localhost:${port}/graphql`);
    });
}
startServer().catch((err) => {
    console.error('Error starting server:', err);
});
