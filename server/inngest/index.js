const { Inngest } = require("inngest");
const User = require("../models/user.model");
const connectToDB = require("../configs/db");
const Workspace = require("../models/workspace.model");
const WorkspaceMember = require("../models/workspaceMember.model");

// Create Inngest client
const inngest = new Inngest({
  id: "project-management",
});

// Helper to extract Clerk user fields
const getUserPayload = (data) => {

  const clerkUserId = data.id;

  const email =
    data.email_addresses?.[0]?.email_address || "";

  const firstName = data.first_name || "";

  const lastName = data.last_name || "";

  const name =
    `${firstName} ${lastName}`.trim() ||
    data.username ||
    "User";

  const image = data.image_url || "";

  return {
    clerkUserId,
    email,
    name,
    image,
  };
};



// CREATE USER
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  {
    event: "clerk/user.created",
  },
  async ({ event }) => {

    try {

      await connectToDB();

      console.log("Creating user:", event.data.id);

      const {
        clerkUserId,
        name,
        email,
        image,
      } = getUserPayload(event.data);

      if (!clerkUserId || !email) {
        throw new Error(
          "Missing required Clerk user fields"
        );
      }

      const user = await User.findByIdAndUpdate(
        clerkUserId,
        {
          _id: clerkUserId,
          name,
          email,
          image,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log("User saved:", user);

      return {
        success: true,
        action: "created",
        userId: clerkUserId,
      };

    } catch (error) {

      console.error(
        "Error creating user:",
        error.message
      );

      throw error;
    }
  }
);



// UPDATE USER
const syncUserUpdate = inngest.createFunction(
  {
    id: "sync-user-update-from-clerk",
  },
  {
    event: "clerk/user.updated",
  },
  async ({ event }) => {

    try {

      await connectToDB();

      console.log("Updating user:", event.data.id);

      const {
        clerkUserId,
        name,
        email,
        image,
      } = getUserPayload(event.data);

      if (!clerkUserId || !email) {
        throw new Error(
          "Missing required Clerk user fields"
        );
      }

      const user = await User.findByIdAndUpdate(
        clerkUserId,
        {
          _id: clerkUserId,
          name,
          email,
          image,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log("User updated:", user);

      return {
        success: true,
        action: "updated",
        userId: clerkUserId,
      };

    } catch (error) {

      console.error(
        "Error updating user:",
        error.message
      );

      throw error;
    }
  }
);



// DELETE USER
const syncUserDeletion = inngest.createFunction(
  {
    id: "sync-user-delete-from-clerk",
  },
  {
    event: "clerk/user.deleted",
  },
  async ({ event }) => {

    try {

      await connectToDB();

      const clerkUserId = event.data.id;

      console.log("Deleting user:", clerkUserId);

      if (!clerkUserId) {
        throw new Error(
          "Missing Clerk user id"
        );
      }

      await User.findByIdAndDelete(
        clerkUserId
      );

      console.log(
        "User deleted:",
        clerkUserId
      );

      return {
        success: true,
        action: "deleted",
        userId: clerkUserId,
      };

    } catch (error) {

      console.error(
        "Error deleting user:",
        error.message
      );

      throw error;
    }
  }
);


// Inngest function to save workspace data to DB

const syncWorkSpaceCreation = inngest.createFunction(
  { id: "sync-workspace-from-clerk" },
  { event: "clerk/organization.created" },

  async ({ event }) => {

    await connectToDB();

    const { data } = event;

    console.log("Creating workspace:", data.id);

    // Create workspace
    await Workspace.findByIdAndUpdate(
      data.id,
      {
        _id: data.id,
        name: data.name,
        slug: data.slug,
        ownerId: data.created_by,
        image_url: data.image_url || ""
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // Add creator as ADMIN member
    await WorkspaceMember.findOneAndUpdate(
      {
        userId: data.created_by,
        workspaceId: data.id
      },
      {
        userId: data.created_by,
        workspaceId: data.id,
        role: "ADMIN"
      },
      {
        upsert: true,
        new: true
      }
    );

    console.log("Workspace created successfully");

    return { success: true };
  }
);


// Inngest function to update workspace data in database


const syncWorkspaceUpdation = inngest.createFunction(
  { id: "update-workspace-from-clerk" },
  { event: "clerk/organization.updated" },

  async ({ event }) => {

    await connectToDB();

    const { data } = event;

    console.log("Updating workspace:", data.id);

    await Workspace.findByIdAndUpdate(
      data.id,
      {
        name: data.name,
        slug: data.slug,
        image_url: data.image_url || ""
      },
      {
        new: true
      }
    );

    return { success: true };
  }
);


// Inngest function to delete workspace from database

const syncWorkSpaceDeletion = inngest.createFunction(
  { id: "delete-workspace-with-clerk" },
  { event: "clerk/organization.deleted" },

  async ({ event }) => {

    await connectToDB();

    const { data } = event;

    console.log("Deleting workspace:", data.id);

    await Workspace.findByIdAndDelete(data.id);

    // Also delete members
    await WorkspaceMember.deleteMany({
      workspaceId: data.id
    });

    return { success: true };
  }
);


// Inngest function to save workspace member data to a database

const syncWorkspaceMemberCreation = inngest.createFunction(
  { id: "sync-workspace-member-from-clerk" },
  { event: "clerk/organizationInvitation.accepted" },

  async ({ event }) => {

    await connectToDB();

    const { data } = event;

    console.log("Adding workspace member:", data.user_id);

    await WorkspaceMember.findOneAndUpdate(
      {
        userId: data.user_id,
        workspaceId: data.organization_id
      },
      {
        userId: data.user_id,
        workspaceId: data.organization_id,
        role: String(data.role_name).toUpperCase()
      },
      {
        upsert: true,
        new: true
      }
    );

    return { success: true };
  }
);


// Export functions
const functions = [
  syncUserCreation,
  syncUserUpdate,
  syncUserDeletion,
  syncWorkSpaceCreation,
  syncWorkspaceUpdation,
  syncWorkSpaceDeletion,
  syncWorkspaceMemberCreation
];

module.exports = {
  inngest,
  functions,
};
