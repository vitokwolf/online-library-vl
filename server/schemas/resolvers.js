const { User, Book } = require('../models')
const { AuthenticationError } = require('apollo-server-express')
const { signToken } = require('../utils/auth')

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('savedBooks')

        return userData
      }

      throw new AuthenticationError('Not logged in')
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args)
      const token = signToken(user)

      return { token, user }
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email })

      if (!user) {
        throw new AuthenticationError('Incorrect credentials')
      }

      const correctPassword = await user.isCorrectPassword(password)

      if (!correctPassword) {
        throw new AuthenticationError('Incorrect credentials')
      }

      const token = signToken(user)
      return { token, user }
    },
    saveBook: async (
      parent,
      { authors, description, title, bookId, image, link },
      context,
    ) => {
      if (context.user) {
        const addBookArr = await User.findByIdAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: {
              savedBooks: { authors, description, title, bookId, image, link },
            },
          },
          { new: true },
        ).populate('savedBooks')

        return addBookArr
      }

      throw new AuthenticationError('You need to be logged in!')
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const deleteBookArr = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true },
        )

        return deleteBookArr
      }

      throw new AuthenticationError('You need to be logged in!')
    },
  },
}

module.exports = resolvers
