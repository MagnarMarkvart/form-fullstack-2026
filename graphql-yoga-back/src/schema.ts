export const typeDefs = /* GraphQL */ `
  type Sector {
    id: ID!
    name: String!
    parentId: String
  }

  type UserData {
    id: ID!
    name: String!
    selectedSectorIds: [String!]!
    agreeToTerms: Boolean!
    createdAt: String!
  }

  type Query {
    sectors: [Sector!]!
    sessionUser(id: ID!): UserData
  }

  type Mutation {
    saveUserData(
      id: ID
      name: String!
      selectedSectorIds: [String!]!
      agreeToTerms: Boolean!
    ): UserData!
  }
`;
