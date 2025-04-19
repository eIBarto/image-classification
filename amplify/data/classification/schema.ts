import { type ClientSchema, a } from "@aws-amplify/backend";
import { createClassification } from "./create-classification/resource";
import { updateClassification } from "./update-classification/resource";
import { deleteClassification } from "./delete-classification/resource";
import { listClassifications } from "./list-classifications/resource";
import { classifyClassification } from "./classify-classification/resource";

export const schema = a.schema({
    LabelProxy2: a.customType({
        id: a.id().required(), // todo may update to composite key
        name: a.string().required(),
        description: a.string().required(),
        //projectId: a.id().required(),
        //promptId: a.id().required(),
        //version: a.string().required(),
        //promptVersion: a.ref("PromptVersionProxy1"), // Todo monitor

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
        // prompt: a.ref("PromptProxy1"), // Todo monitor

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        labels: a.ref("LabelProxy2").required().array(), // required()?
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

        versions: a.ref("PromptVersionProxy2").required().array(), // required()?
    }),
    ClassificationProxy: a.customType({
        id: a.id().required(), // todo may update to composite key
        projectId: a.id().required(),
        project: a.ref("ProjectProxy7"),

        viewId: a.id().required(), // unbedingt required weil hängt an view
        view: a.ref("ViewProxy2"),

        promptId: a.id().required(),
        //prompt: a.belongsTo("Prompt", "promptId"),
        version: a.string().required(),
        promptVersion: a.ref("PromptVersionProxy2"),

        // todo alternatively relate to prompt

        name: a.string().required(),
        description: a.string(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        results: a.ref("ResultProxy").required().array()//.required(), //.required?
    }),

    ResultProxy: a.customType({
        id: a.id().required(), // todo may update to composite key
        classificationId: a.id().required(),
        //classification: a.ref("ClassificationProxy"),
        confidence: a.float().required(),

        fileId: a.id().required(), // file oder viewFile
        //file: a.ref("FileProxy2"), 


        labelId: a.id().required(),
        label: a.ref("LabelProxy2"),//.required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    /*ViewFileProxy1: a.customType({
      //id: a.id().required(),
      viewId: a.id().required(),
      fileId: a.id().required(),
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
      view: a.ref("ViewProxy1").required(),
      file: a.ref("FileProxy3").required(),
  }),*/
    ViewProxy2: a.customType({
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy7"),//.required(),
        //files: a.ref("ViewFileProxy2").array()
        //files: a.ref("ViewFileProxy").required().array()//.required()
    }),

    /*ViewProxy1: a.customType({
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy6"),//.required(),
        files: a.ref("ViewFileProxy1").required().array()//.required()
    }),
    ViewFileProxy1: a.customType({
        viewId: a.id().required(),
        fileId: a.id().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        //view: a.ref("ViewProxy").required(), // todo this is only available on ViewFile queries, not on View queries
        //file: a.ref("FileProxy2").required(),
    }),*/
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
        })
        .returns(a.ref("ClassificationProxy").required()) //a.ref("View") works here
        .handler(a.handler.function(createClassification))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    listClassificationsProxy: a // todo list by projectId, viewId, promptId, version
        .query()
        .arguments({ projectId: a.id().required(), nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListClassificationsResponse").required())//a.ref("View")
        .handler(a.handler.function(listClassifications))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    updateClassificationProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), id: a.id().required(), name: a.string().required(), description: a.string() })
        .returns(a.ref("ClassificationProxy").required())
        .handler(a.handler.function(updateClassification))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    deleteClassificationProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), id: a.id().required() })
        .returns(a.ref("ClassificationProxy").required())
        .handler(a.handler.function(deleteClassification))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    classifyClassificationProxy: a // todo rename to classify?
        .mutation()
        .arguments({
            //projectId: a.id().required(),
            classificationId: a.id().required(),
            //files: a.id().required().array().required()

            //projectId: a.id().required(),
            //viewId: a.id().required(),
            //promptId: a.id().required(),
            //version: a.string().required(),
        })
        .handler(a.handler.function(classifyClassification).async())
        .authorization(allow => [allow.authenticated()]),
}).authorization((allow) => [allow.resource(listClassifications), allow.resource(createClassification), allow.resource(updateClassification), allow.resource(deleteClassification), allow.resource(classifyClassification)]);

export type Schema = ClientSchema<typeof schema>;