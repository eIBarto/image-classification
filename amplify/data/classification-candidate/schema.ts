import { type ClientSchema, a } from "@aws-amplify/backend";

import { listClassificationCandidates } from "./list-classification-candidates/resource";
import { classifyCandidate } from "./classify-candidate/resource";
import { classifyCandidates } from "./classify-candidates/resource";

export const schema = a.schema({

    ImageFormatProxy2: a.enum([
        'webp',
    ]),
    ImageOptionsProxy2: a.customType({
        width: a.integer().required(),
        height: a.integer().required(),
        format: a.ref("ImageFormatProxy2").required(),
    }),

    LabelProxy3: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string().required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    UserProxy9: a.customType({
        email: a.email(),
        accountId: a.id().required(),
        owner: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ProjectProxy8: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    PromptVersionProxy3: a.customType({
        version: a.string().required(),
        text: a.string().required(),
        promptId: a.id().required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        labels: a.ref("LabelProxy3").required().array(),
    }),
    PromptProxy3: a.customType({
        id: a.id().required(),
        summary: a.string(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy8"),
        activeVersion: a.string(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        versions: a.ref("PromptVersionProxy3").required().array(),
    }),
    ClassificationProxy1: a.customType({
        id: a.id().required(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy8"),

        viewId: a.id().required(),
        view: a.ref("ViewProxy3"),

        promptId: a.id().required(),

        version: a.string().required(),
        promptVersion: a.ref("PromptVersionProxy3"),

        name: a.string().required(),
        description: a.string(),

        model: a.string(),
        temperature: a.float().required(),
        topP: a.float().required(),
        maxLength: a.integer().required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        results: a.ref("ResultProxy1").required().array().required(),
      }),

      ResultProxy1: a.customType({
        id: a.id().required(),
        classificationId: a.id().required(),

        confidence: a.float().required(),

        fileId: a.id().required(),
        file: a.ref("FileProxy4"),

        labelId: a.id().required(),
        label: a.ref("LabelProxy3").required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
      }),

      ClassificationStatusProxy: a.enum([
        'READY',
        'PENDING',
        'COMPLETED',
        'FAILED',
      ]),

      ClassificationCandidateProxy1: a.customType({
        classificationId: a.id().required(),
        fileId: a.id().required(),
        file: a.ref("FileProxy4").required(),
        status: a.ref("ClassificationStatusProxy").required(),
        resultId: a.id(),
        result: a.ref("ResultProxy1"),

      }),

    FileProxy4: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        path: a.string().required(),

        author: a.ref("UserProxy9"),

        owner: a.string(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        resource: a.url(),
    }),
     ViewProxy3: a.customType({
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy8"),

    }),

    ListClassificationCandidatesResponse: a.customType({
        items: a.ref("ClassificationCandidateProxy1").required().array().required(),
        nextToken: a.string(),
    }),

    classifyCandidateProxy: a
        .mutation()
        .arguments({

            classificationId: a.id().required(),
            fileId: a.id().required(),

        })
        .returns(a.ref("ResultProxy1").required())
        .handler(a.handler.function(classifyCandidate))
        .authorization(allow => [allow.authenticated()]),

        listClassificationCandidatesProxy: a
        .query()
        .arguments({ classificationId: a.id().required(), nextToken: a.string(), limit: a.integer(), imageOptions: a.ref("ImageOptionsProxy2").required() })
        .returns(a.ref("ListClassificationCandidatesResponse").required())
        .handler(a.handler.function(listClassificationCandidates))
        .authorization(allow => [allow.authenticated()]),

}).authorization((allow) => [allow.resource(listClassificationCandidates), allow.resource(classifyCandidate), allow.resource(classifyCandidates)]);

export type Schema = ClientSchema<typeof schema>;