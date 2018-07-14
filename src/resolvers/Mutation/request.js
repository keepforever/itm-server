const { getUserId, clearLog } = require('../../utils')
const { forwardTo } = require('prisma-binding')

const request = {
  deleteRequest: forwardTo("db"),
  updateRequest: forwardTo("db"),
  createRequest: async (parent, args, ctx, info) => {
    // TODO: 
    //   getUserId makes sure sender of requset has a valid token
    //   in the HTTP Headers thereby protecting the route

    // Destructure incoming args and also rename 
    // each id var to identify who the id belongs to.
    const { 
      data: { 
        wants: { set },  
        title, 
        text, 
        author: { connect: { id: patronId } }, //rename author id to patronId
        recipient: { connect: {  id: sellerId } }  //rename recipient id to sellerId
    } 
    } = args

    // pull data from incoming args to pass to db.mutation.createRequest()
    const createRequestArgs = args.data

    // note, the db queries returning patron and seller info don't do anything useful
    // however, they do serve as good examples for future custom resolvers that need
    // to implement some business logic prior to the last return
    const patron = await ctx.db.query.user(
      { where: { id: patronId } },
      `
      {
        __typename id name about interests
        requests { title wants } 
      }`
    )
    clearLog('PATRON', patron)
        
    const seller = await ctx.db.query.seller(
      { where: { id: sellerId } }, 
      '{ __typename identity { name } id name about sells inbox { title wants } }'
    )
    clearLog('SELLER: ', seller)
    
    return ctx.db.mutation.createRequest({
      data: { ...createRequestArgs }},
      `{
        __typename id
        recipient { name id inbox { title } }
        author { name id inbox { title } requests { title }}
        wants
        title
        text
        isPublished
        createdAt
        updatedAt 
      }`
    )
    // return forwardTo("db")(parent, args, ctx, info);
  },
}

module.exports = { request }

// createRequest: (parent, args, ctx, info) => {
//   //getUserId makes sure sender of requset has a valid token
//   //in the HTTP Headers thereby protecting the route
//   getUserId(ctx)
//   return forwardTo("db")(parent, args, ctx, info);
// },