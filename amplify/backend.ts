// Amplify Gen 2 backend composition and CDK customizations
import { EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { uploadMediaBucket, mediaBucket } from './storage/resource';
import { onUpload } from './storage/on-upload/resource';
import { Architecture, Code, Runtime, LayerVersion, Function } from 'aws-cdk-lib/aws-lambda';

import { evaluationWrangler } from './functions/evaluation-wrangler/resource';
import { getAnalytics } from './functions/get-analytics/resource';

import * as path from 'path';
import { fileURLToPath } from 'url';

const layerDir = path.dirname(fileURLToPath(import.meta.url));

const backend = defineBackend({
  auth,
  data,
  uploadMediaBucket,
  mediaBucket,
  onUpload,

  evaluationWrangler,
  getAnalytics,
});

// Trigger on-upload function when new objects arrive in submissions path
backend.uploadMediaBucket.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED,
  new LambdaDestination(backend.onUpload.resources.lambda),
  {
    prefix: 'projects/submissions/',
  }
);

// Lambda layer that bundles sharp for Node 20 (linux x64)
const layer = new LayerVersion(backend.uploadMediaBucket.stack, "SharpLayer", {
  code: Code.fromAsset(layerDir, {
    bundling: {
      image: Runtime.NODEJS_20_X.bundlingImage,
      command: [
        "bash",
        "-c",
        [
          "cd /",
          "mkdir sharp && cd /sharp",
          "npm install --cpu=x64 --os=linux --libc=glibc sharp",
          "cd /",
          "mkdir -p nodejs/node20",
          "cp -r /sharp/node_modules nodejs/node20",
          "zip -r layer.zip nodejs",
          "cp layer.zip /asset-output",
        ].join(" && "),
      ],
      user: "root",
    },
  }),
  compatibleArchitectures: [Architecture.X86_64],
  compatibleRuntimes: [Runtime.NODEJS_20_X],
});

const onUploadFunction = backend.onUpload.resources.lambda as Function;
onUploadFunction.addLayers(layer);
