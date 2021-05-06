import * as mongo from "mongodb"
import FriendFacade from '../src/facades/friendFacade';

import chai from "chai";
const expect = chai.expect;

//use these two lines for more streamlined tests of promise operations
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import bcryptjs from "bcryptjs"
import { InMemoryDbConnector } from "../src/config/dbConnector"
import { ApiError } from "../src/errors/apiErrors";
import { Gender } from "../src/interfaces/IFriend";

let friendCollection: mongo.Collection;
let facade: FriendFacade;

describe("## Verify the Friends Facade ##", () => {

    before(async function () {
        const connection = await InMemoryDbConnector.connect();
        const db = connection.db()
        friendCollection = db.collection("friends");
        facade = new FriendFacade(db)
    })

    beforeEach(async () => {
        const hashedPW = await bcryptjs.hash("secret", 4)
        await friendCollection.deleteMany({})
        await friendCollection.insertMany(
            [{ firstName: "lars", lastName: "andersen", email: "lars@andersen.dk", password: hashedPW },
            { firstName: "jens", lastName: "ole", email: "jens@ole.dk", password: hashedPW }
            ])
    })

    describe("Verify the addFriend method", () => {
        xit("It should Add the user Jan", async () => {
            const newFriend = { firstName: "Jan", lastName: "Olsen", email: "jan@b.dk", password: "secret", gender: Gender.MALE, age: 22 }
            const status = await facade.addFriend(newFriend);
            expect(status).to.be.not.null
            const jan = await friendCollection.findOne({ email: "jan@b.dk" })
            expect(jan.firstName).to.be.equal("Jan")
        })

        xit("It should not add a user with a role (validation fails)", async () => {
            const newFriend = { firstName: "Jan", lastName: "Olsen", email: "jan@b.dk", password: "secret", role: "admin", gender: Gender.MALE, age: 22 }
            try {
                const status = await facade.addFriend(newFriend);
            } catch (error) {
                expect(error instanceof ApiError).to.be.true
            }


        })
    })

    describe("Verify the editFriend method", () => {
        xit("It should change lastName to XXXX", async () => {
          const newFName = { firstName: "nyLars", lastName: "andersen", email: "lars@andersen.dk", password: "secret", gender: Gender.MALE, age: 22 }
          const email = newFName.email
          await facade.editFriend(email, newFName)
          const friend = await friendCollection.findOne({email: "lars@andersen.dk"})
          expect(friend.firstName).equals("nyLars")

        })
    })

    describe("Verify the deleteFriend method", () => {
        it("It should remove the user Peter", async () => {
            const email = "jens@ole.dk"
            const status = await facade.deleteFriend(email)
            expect(status).to.be.true
        })
        it("It should return false, for a user that does not exist", async () => {
            const fakeEmail = "fake@mail.dk"
            const status = await facade.deleteFriend(fakeEmail)
            expect(status).to.be.false
        })
    })

    describe("Verify the getAllFriends method", () => {
        it("It should get two friends", async () => {
            const status = await facade.getAllFriends()
            expect(status.length).equals(2)
        })
    })

    describe("Verify the getFriend method", () => {

        it("It should find jens ole", async () => {
            const email = "jens@ole.dk"
            const status = await facade.getFrind(email)
            expect(status.firstName).equals("jens")
        })
        it("It should not find xxx.@.b.dk", async () => {
            const email = "fake@email.dk"
            const status = await facade.getFrind(email)
            expect(status).to.be.null
        })
    })

    describe("Verify the getVerifiedUser method", () => {
        it("It should correctly validate lars andersens credential,s", async () => {
            const veriefiedLars = await facade.getVerifiedUser("lars@andersen.dk", "secret")
            expect(veriefiedLars).to.be.not.null;
        })

        it("It should NOT validate lars andersens credential,s", async () => {
            const veriefiedLars = await facade.getVerifiedUser("lars@andersen.dk", "wrongPass")
            expect(veriefiedLars).to.be.null;
        })

        it("It should NOT validate a non-existing users credentials", async () => {
            const veriefiedLars = await facade.getVerifiedUser("fake@email.dkd", "wrongPasss")
            expect(veriefiedLars).to.be.null;
        })
    })

})