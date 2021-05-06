import FriendFacade from '../facades/friendFacade';
import PositionFacade from '../facades/positionFacade';
import { IFriend } from '../interfaces/IFriend';
import { ApiError } from '../errors/apiErrors';
import { Request } from "express";
import fetch from "node-fetch"
import IPosition from '../interfaces/IPosition';

interface IpositionInput {
  email: string,
  longitude: number,
  latitude: number
}


interface IFindInput {
  email: string,
  password: string,
  longitude: number,
  latitude: number,
  distance: number
}
let positionFacade: PositionFacade;

let friendFacade: FriendFacade;

/*
We don't have access to app or the Router so we need to set up the facade in another way
In www.ts IMPORT and CALL the method below, like so: 
      setupFacade(db);
Just before the line where you start the server
*/
export function setupFacade(db: any) {
  if (!friendFacade) {
    friendFacade = new FriendFacade(db)
  }
  if (!positionFacade) {
    positionFacade = new PositionFacade(db)
  }
}



// resolver map
export const resolvers = {
  Query: {

    allFriends: (root: any, _: any, context: any) => {

      // if (!context.credentials || !context.credentials.role || context.credentials.role !== "admin") {
      //   throw new ApiError("Not Authorized", 401)
      // }

      return friendFacade.getAllFriendsV2()

    },

    findOne: (_: object, { input }: { input: string }) => {



      return friendFacade.getFriendFromEmail(input)

    },

    getAllFriendsProxy: async (root: object, _: any, context: Request) => {

      let options: any = { method: "GET" }

      //This part only required if authentication is required
      const auth = context.get("authorization");
      if (auth) {
        options.headers = { 'authorization': auth }
      }
      return fetch(`http://localhost:${process.env.PORT}/api/friends/all`, options).then(r => {
        if (r.status >= 400) { throw new Error(r.statusText) }
        return r.json()
      })
    }
  },
  Mutation: {
    createFriend: async (_: object, { input }: { input: IFriend }) => {
      return friendFacade.addFriendV2(input)
    },
    editFriend: async (_: object, { input }: { input: IFriend }) => {
      return friendFacade.editFriendV2(input.email, input)
    },
    deleteFriend: async (_: object, { input }: { input: string }) => {
      return friendFacade.deleteFriend(input)
    },
    addOrUpdatePosition: async (_: object, { input }: { input: IpositionInput }) => {

      const result = positionFacade.addOrUpdatePosition(input.email, input.longitude, input.latitude);
      if ((await result).name) {
        return true
      }

      return false


    },


    //lav find nearby players

    findNearbyFriends: async (_: object, { input }: { input: IFindInput }) => {

      const result = positionFacade.findNearbyFriends(input.email, input.password, input.longitude, input.latitude, input.distance);


      return result


    },
  }
};