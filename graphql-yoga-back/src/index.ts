import { createSchema, createYoga } from 'graphql-yoga';
import { createServer } from 'http';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  cors: { origin: ['http://localhost:4200'] },
  graphqlEndpoint: '/graphql',
});

const server = createServer(yoga);
server.listen(3001, () => console.log('GraphQL on :3001/graphql'));
