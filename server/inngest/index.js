const {Inngest} = require('inngest')
const User = require('../models/user.model')

// create a client to send and receive events

const inngest = new Inngest({id:"project-management"})

// helper to extract common Clerk fields

const getUserPayload = (data) =>{
    const clerkUserId = data.id;
    const email = data.email_addresses?.[0]?.email_address || "";
    const firstName = data.first_name || "";
        const lastName = data.last_name || "";
        const name = `${firstName} ${lastName}`.trim() || data.username || "User";
        const image = data.image_url || "";

        return {clerkUserId , email , name , image};
};

// Inngest function to save user data to database

// CREATE
const syncUserCreation = inngest.createFunction(
    {id:"sync-user-from-clerk"},
    {event:'clerk/user.created'},
    async ({event}) =>{
        const {clerkUserId , name , email , image} =  getUserPayload(event.data);

        if(!clerkUserId || !email){
            throw new Error("Missing required Clerk user fields: id/email");
        }

        await User.findByIdAndUpdate(
            clerkUserId,
            {
                _id:clerkUserId,
                name,
                email,
                image,
            },
            {upsert:true, new:true, setDefaultsOnInsert:true}
        );

        return {success:true, userId:clerkUserId};
    }
);

// UPDATE

const syncUserUpdate = inngest.createFunction(
    {id:'sync-user-update-from-clerk'},
    {event:'clerk/user.updated'},

    async ({event}) =>{
        const {clerkUserId ,name , email , image} = getUserPayload(event.data);

        if(!clerkUserId || !email){
            throw new Error("Missing required Clerk user fields: id/email");
        }

        await User.findByIdAndUpdate(
      clerkUserId,
      { _id: clerkUserId, name, email, image },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return {success:true , action:"updated" , userId: clerkUserId};
    }
);

// DELETE
const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-delete-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const clerkUserId = event.data.id;

    if (!clerkUserId) {
      throw new Error("Missing Clerk user id on delete event");
    }

    await User.findByIdAndDelete(clerkUserId);

    return { success: true, action: "deleted", userId: clerkUserId };
  }
);


// export functions for Inngest serve()
// create an array where we'll export future inngest functions

const functions = [syncUserCreation , syncUserDeletion , syncUserUpdate] 

module.exports = {
    inngest , functions
}