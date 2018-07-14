const { getUserId, clearLog } = require('../../utils')
const { forwardTo } = require('prisma-binding')

const friendship = {
  deleteFriendship: forwardTo("db"),
  updateFriendship: forwardTo("db"),
  createFriendship: async (parent, args, ctx, info) => {
    // Destructure incoming args and also rename 
    // each id var to identify who the id belongs to.
    const { 
      data: { 
        friendsBecause: { set },  
        offerAllowance, 
        friend: { connect: {  id: sellerId } }  
      } 
    } = args

    const createFriendshipArgs = args.data
    
    
    const newFriendship = await ctx.db.mutation.createFriendship({
      data: {
        ...createFriendshipArgs
      }
    },
      `{
        __typename 
        id
        friendsBecause
        offerAllowance
        friend { id name }
      }`
    )
  
      
    clearLog('newFriendShip', newFriendship)

       
   
    
    //getUserId makes sure sender of requset has a valid token
    //in the HTTP Headers thereby protecting the route
    const userId = getUserId(ctx)
    
    response = await ctx.db.mutation.updateUser({
      data: {
        friends: { connect: {id: newFriendship.id } }
      },
      where: { 
        id: userId 
      }}, 
      `{ id name friends { id friend { name id } } }`
    )

    const user = await ctx.db.query.user(
      { where: { id: userId } }, 
      '{ __typename id name email about  }'
    )
    clearLog('FRIENDSHIP_RESOLVER user', user)

    return newFriendship
  },
}

module.exports = { friendship }

// mutation AddFriendToUser{
//   updateUser(
//     data:{
//     	friends:{connect: {id: "cjjkodsqdz6pf0b37boviwpiv"}}
//     },
//     where:{id:"cjjj0sapuq2vd0b37czhnbj80"}
//   ) {
//     name
//     friends{
//       id
//       friend{
//         name
//       }
//     }
//   }
// }


// mutation CreateFriendship {
//   createFriendship(data:{
//     friendsBecause: {set:["Very Reliable", "Good brand"]},
//     friend:{connect:{id:"cjjj1d2r7q4q30b37zxam1b9y"}},
//     offerAllowance: 5
//   }) {
//     id
//     friend{
//       name
//     }
//     offerAllowance
//   }
// }