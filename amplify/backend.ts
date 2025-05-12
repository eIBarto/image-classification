import { EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { uploadMediaBucket, mediaBucket } from './storage/resource';
import { onUpload } from './storage/on-upload/resource';
import { Architecture, Code, Runtime, LayerVersion, Function } from 'aws-cdk-lib/aws-lambda';
//import { customAuthorizer } from './data/custom-authorizer/resource';
import { evaluationWrangler } from './functions/evaluation-wrangler/resource';
import { getAnalytics } from './functions/get-analytics/resource';
//import { DistributionTest } from './custom/DistributionTest/resource';
//import { CfnIdentityPoolPrincipalTag } from 'aws-cdk-lib/aws-cognito';
//import { Policy, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  uploadMediaBucket,
  mediaBucket,
  onUpload,
  //  customAuthorizer,
  evaluationWrangler,
  getAnalytics,
});


const { userPool, userPoolClient } = backend.auth.resources;

//backend.customAuthorizer.addEnvironment('COGNITO_USER_POOL_ID', userPool.userPoolId);
//backend.customAuthorizer.addEnvironment('COGNITO_APP_CLIENT_ID', userPoolClient.userPoolClientId);

//backend.data.resources.graphqlApi.grantMutation(backend.customAuthorizer.resources.lambda);
//backend.data.resources.graphqlApi.grantQuery(backend.customAuthorizer.resources.lambda);

backend.uploadMediaBucket.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED,
  new LambdaDestination(backend.onUpload.resources.lambda),
  {
    prefix: 'projects/submissions/',
  }
);

const layer = new LayerVersion(backend.uploadMediaBucket.stack, 'SharpLayer', {
  layerVersionName: 'sharp-layer',
  compatibleRuntimes: [
    Runtime.NODEJS_20_X,
  ],
  code: Code.fromAsset('./amplify/layer'), // check custom instructions for sharp if required + dirname
  compatibleArchitectures: [
    Architecture.X86_64,
  ]
})

const onUploadFunction = backend.onUpload.resources.lambda as Function;
onUploadFunction.addLayers(layer);

/*
// todo for testing remove user from admin group
const { identityPoolId, userPool, authenticatedUserIamRole } = backend.auth.resources;

new CfnIdentityPoolPrincipalTag(backend.auth.stack, 'IdentityPoolPrincipalTag', {
  identityPoolId: identityPoolId,
  identityProviderName: userPool.userPoolProviderName,

  // the properties below are optional
  principalTags: {
    //app_id: "aud",
    //user_id: "sub",

    cognitoId: "sub"
  },
  useDefaults: false,
});

authenticatedUserIamRole.addToPrincipalPolicy( // todo this might not work
  new PolicyStatement({
    actions: ["sts:TagSession"],
    resources: ["*"]
  })
);

const s3Policy = new Policy(backend.uploadMediaBucket.stack, "S3AccessPolicy", {
  policyName: "S3AccessPolicy",
  statements: [
    new PolicyStatement({
      actions: ["s3:GetObject"],
      resources: [
        `${bucket.bucketArn}/projects/submissions/\${aws:PrincipalTag/cognitoId}/*`,
        `${bucket.bucketArn}/projects/shared/*`
      ],
      effect: Effect.ALLOW
    }),
    new PolicyStatement({
      actions: ["s3:ListBucket"],
      resources: [bucket.bucketArn],
      effect: Effect.ALLOW,
      conditions: {
        StringLike: {
          "s3:prefix": [
            "projects/submissions/${aws:PrincipalTag/cognitoId}/*",
            "projects/submissions/${aws:PrincipalTag/cognitoId}/",
            "projects/shared/*",
            "projects/shared/"
          ]
        }
      }
    }),
    new PolicyStatement({
      actions: ["s3:PutObject", "s3:DeleteObject"],
      resources: [`${bucket.bucketArn}/projects/submissions/\${aws:PrincipalTag/cognitoId}/*`],
      effect: Effect.ALLOW
    })
  ]
});

authenticatedUserIamRole.attachInlinePolicy(s3Policy);
*/


backend.addOutput({
  custom: {
    graphqlApiId: backend.data.resources.graphqlApi.apiId,
    userPoolId: userPool.userPoolId,
    userPoolClientId: userPoolClient.userPoolClientId,
    accountId: backend.stack.account,
  }
})

