import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';

const typeDefs = `

enum Gender {
    MALE
    FEMALE
    OTHER
}

    type Friend {
        id: ID
        firstName: String
        lastName: String
        email: String
        age: Int
        gender: Gender
        role: String
    }
    """
    Queries available for Friends
    """
     type Query {
        """
        Returns all details for all Friends
        (Should probably require 'admin' rights if your are using authentication)
        """
        allFriends : [Friend]!
        """
        Only required if you ALSO wan't to try a version where the result is fetched from the existing endpoint
        """
        getAllFriendsProxy: [Friend]!
        findOne(input: String): Friend
        
    }
    input FriendInput {
        firstName: String!
        lastName: String!
        password: String!
        email: String!
        age: Int!
        gender: Gender!
    }
    input FriendEditInput {
        firstName: String
        lastName: String
        password: String
        email: String!
        age: Int!
        gender: Gender!
    }
    type Mutation {
        """
        Allows anyone (non authenticated users) to create a new friend
        """
        createFriend(input: FriendInput): Friend
        editFriend(input: FriendEditInput): Friend
        deleteFriend(input: String): Boolean
    }
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export { schema };