
import type { AppSyncAuthorizerHandler } from 'aws-lambda';
import type { Schema } from "../resource"
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/custom-authorizer";
import { generateClient } from "aws-amplify/data";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

type ResolverContext = {
  userid: string;
  access: "VIEW" | "MANAGE" | "ADMIN";
  //info: string;
  //more_info: string;
};


const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_APP_CLIENT_ID;

if (!userPoolId) {
  throw new Error("COGNITO_USER_POOL_ID is not set");
}

if (!clientId) {
  throw new Error("COGNITO_APP_CLIENT_ID is not set");
}

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: userPoolId,
  tokenUse: "access",
  clientId: clientId,
  //customJwtCheck: ({ payload }) => {
  //  assertStringEquals("e-mail", payload["email"], process.env.USER_EMAIL);
  //},
});

//export type RequestContextBaseVariables = { [key: string]: unknown };
//
//export type RequestContextProjectInputVariables = {
//  input: { // may be unset
//    projectId: string | null | undefined; // also may be unset
//  } | null | undefined;
//}
//
//
//export type RequestContextProjectVariables = {
//  filter: { // may be unset
//    and: [ // may be unset
//      { projectId:
//         { eq: projectId } // may be unset
//      },
//    ]
//  }
//}
//export type RequestContextProjectVariables = RequestContextBaseVariables | RequestContextProjectInputVariables;


export const handler: AppSyncAuthorizerHandler<ResolverContext> = async (
  event
) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  const {
    authorizationToken,
    requestContext: { apiId, accountId, variables: { input: { projectId } } }
  } = event;

  console.log("variables", JSON.stringify(event.requestContext.variables, null, 2));

  const token = authorizationToken.startsWith('Lambda ') ? authorizationToken.substring(7) : authorizationToken;

  try {
    const { "cognito:groups": groups, sub } = await jwtVerifier.verify(token); // todo sourround by try catch
    console.log("Access allowed. JWT payload:", groups, sub);

    if (groups?.includes("admin")) {
      return {
        isAuthorized: true,
        resolverContext: {
          userid: sub,
          access: "ADMIN",
        },
      };
    }

    if (!projectId) {
      throw new Error("Project ID is not set");
    }

    const { data: projectMembership, errors } = await client.models.ProjectMembership.get({
      accountId: sub,
      projectId: projectId,
    }); // todo may return project

    if (errors) {
      throw new Error("Failed to get project membership");
    }

    if (!projectMembership) {
      throw new Error("Unauthorized");
    }

    const access = projectMembership.access;

    if (access !== "VIEW" && access !== "MANAGE") {
      throw new Error("Unauthorized");
    }

    const response = {
      isAuthorized: true,
      resolverContext: {
        userid: sub,
        access: access,
      },
      deniedFields: [
        `arn:aws:appsync:${process.env.AWS_REGION}:${accountId}:apis/${apiId}/types/Event/fields/comments`,
        //`Mutation.createEvent`
      ],
      ttlOverride: 0
    };
    console.log(`RESPONSE: ${JSON.stringify(response, null, 2)}`);
    return response;
  } catch (err) {
    console.error("Access forbidden:", err);
    return {
      isAuthorized: false,
    };
  }
};