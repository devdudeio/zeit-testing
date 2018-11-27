const {ApolloServer, gql} = require('apollo-server');
const mongoose = require('mongoose');
const uri = 'mongodb://ds115244.mlab.com:15244/zeit-test';
const options = {useNewUrlParser: true, user: 'zeit-test', pass: 'zeit-test1'};
mongoose.connect(uri, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("open!")
});

//mongodb schemas


const WordSchema = new mongoose.Schema({
    name: String,
    votes: Number
});

WordSchema.methods.speak = function () {
    console.log("foo - " + this.name)
};
const Word = mongoose.model('Word', WordSchema);


const typeDefs = gql`
    type Word {
      id: ID!
      name: String
      votes: Int
    }
    
    type Query {
      words: [Word]
      word(id: ID!): Word
    }
    
    input WordInput{
      name: String!
    }
    
    type Mutation {
      create_word(word: WordInput): Word
      vote(id: ID!, is_upvote: Boolean!): Word
    }
  `;


const resolvers = {
    Query: {
        words: () => Word.find(),
        word: (_, params) => {
            const {id: _id} = params;
            return Word.findOne({_id});
        }
    },
    Mutation: {
        vote: (_, params) => Word.findOneAndUpdate({_id: params.id}, {$inc: {votes: 1}}),
        create_word: (_, params) => {
            const {word: {name}} = params;
            const temp = new Word({name});
            temp.save();
            return temp;
        }
    }
};


const server = new ApolloServer({
    typeDefs,
    resolvers,
    engine: process.env.ENGINE_API_KEY && {
        apiKey: process.env.ENGINE_API_KEY,
    },
});
server.listen().then(({url}) => {

    console.log(`🚀Server ready at ${url}`);
});