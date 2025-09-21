import { type ClientSchema, a } from "@aws-amplify/backend";
import { createClassification } from "./create-classification/resource";
import { updateClassification } from "./update-classification/resource";
import { deleteClassification } from "./delete-classification/resource";
import { listClassifications } from "./list-classifications/resource";
import { classifyClassification } from "./classify-classification/resource";
import { deleteClassificationResult } from "./delete-classification-result/resource";

export const schema = a.schema({
    LabelProxy2: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string().required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    UserProxy8: a.customType({
        email: a.email(),
        accountId: a.id().required(),
        owner: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ProjectProxy7: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    PromptVersionProxy2: a.customType({
        version: a.string().required(),
        text: a.string().required(),
        promptId: a.id().required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        labels: a.ref("LabelProxy2").required().array(),
    }),
    PromptProxy2: a.customType({
        id: a.id().required(),
        summary: a.string(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy7"),
        activeVersion: a.string(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        versions: a.ref("PromptVersionProxy2").required().array(),
    }),
    ClassificationProxy: a.customType({
        id: a.id().required(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy7"),

        viewId: a.id().required(),
        view: a.ref("ViewProxy2"),

        promptId: a.id().required(),

        version: a.string().required(),
        promptVersion: a.ref("PromptVersionProxy2"),

        name: a.string().required(),
        description: a.string(),

        model: a.string(),
        temperature: a.float().required(),
        topP: a.float().required(),
        maxLength: a.integer().required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        results: a.ref("ResultProxy").required().array()
    }),

    ResultProxy: a.customType({
        id: a.id().required(),
        classificationId: a.id().required(),

        confidence: a.float().required(),

        fileId: a.id().required(),

        labelId: a.id().required(),
        label: a.ref("LabelProxy2"),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),

    ViewProxy2: a.customType({
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy7"),

    }),

    ListClassificationsResponse: a.customType({
        items: a.ref("ClassificationProxy").required().array().required(),
        nextToken: a.string(),
    }),

    createClassificationProxy: a
        .mutation()
        .arguments({
            projectId: a.id().required(),
            viewId: a.id().required(),
            promptId: a.id().required(),
            version: a.string().required(),
            name: a.string().required(),
            description: a.string(),
            model: a.string(),
            temperature: a.float().required(),
            topP: a.float().required(),
            maxLength: a.integer().required(),
        })
        .returns(a.ref("ClassificationProxy").required())
        .handler(a.handler.function(createClassification))
        .authorization(allow => [allow.authenticated()]),
    listClassificationsProxy: a
        .query()
        .arguments({ projectId: a.id().required(), nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListClassificationsResponse").required())
        .handler(a.handler.function(listClassifications))
        .authorization(allow => [allow.authenticated()]),
    updateClassificationProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), id: a.id().required(), name: a.string().required(), description: a.string() })
        .returns(a.ref("ClassificationProxy").required())
        .handler(a.handler.function(updateClassification))
        .authorization(allow => [allow.authenticated()]),
    deleteClassificationProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), id: a.id().required() })
        .returns(a.ref("ClassificationProxy").required())
        .handler(a.handler.function(deleteClassification))
        .authorization(allow => [allow.authenticated()]),
    classifyClassificationProxy: a
        .mutation()
        .arguments({

            classificationId: a.id().required(),

        })
        .handler(a.handler.function(classifyClassification).async())
        .authorization(allow => [allow.authenticated()]),
    deleteClassificationResultProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), id: a.id().required() })
        .returns(a.ref("ResultProxy").required())
        .handler(a.handler.function(deleteClassificationResult))
        .authorization(allow => [allow.authenticated()]),
}).authorization((allow) => [allow.resource(deleteClassificationResult), allow.resource(listClassifications), allow.resource(createClassification), allow.resource(updateClassification), allow.resource(deleteClassification), allow.resource(classifyClassification)]);

export type Schema = ClientSchema<typeof schema>;