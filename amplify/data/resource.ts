import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";
import { onUpload } from "../storage/on-upload/resource";
import { onDelete } from "../storage/on-delete/resource";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),
  UserProfile: a
    .model({
      email: a.string(),
      //accountId: a.string(),
      profileOwner: a.string(),
    })
    .authorization((allow) => [
      allow.ownerDefinedIn("profileOwner"),
    ]),
  Project: a.model({
    name: a.string().required(),
    description: a.string(),

    files: a.hasMany("File", "projectId"),
  }).authorization((allow) => [allow.authenticated()]),
  File: a.model({ // todo add missing properties such as mimeType as required 
    key: a.string().required(),
    size: a.integer(),
    eTag: a.string().required(),
    versionId: a.string(),
    projectId: a.id().required(),
    project: a.belongsTo("Project", "projectId"),
  })
    .secondaryIndexes((index) => [
      index("key")
        .queryField("listByKey"),
    ])
    .authorization((allow) => [allow.authenticated()]),
}).authorization((allow) => [allow.resource(postConfirmation), allow.resource(onUpload), allow.resource(onDelete)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool"
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
