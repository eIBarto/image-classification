import { type ClientSchema, a } from "@aws-amplify/backend";
//import { createResult } from "./create-result/resource";
//import { updateResult } from "./update-result/resource";
//import { deleteResult } from "./delete-result/resource";
import { listClassificationCandidates } from "./list-classification-candidates/resource";
import { classifyCandidate } from "./classify-candidate/resource";
import { classifyCandidates } from "./classify-candidates/resource";
/*
export enum BaseClassificationStatus {
    Pending = "Pending",
    Completed = "Completed",
    Failed = "Failed",
  }
  
  export interface BaseClassificationItem<Status extends BaseClassificationStatus> {
    status: Status
  }
  
  export interface ClassificationItemPending extends BaseClassificationItem<BaseClassificationStatus.Pending> {
    status: BaseClassificationStatus.Pending
    // todo add pending properties
  }
  
  export interface ClassificationItemCompleted extends BaseClassificationItem<BaseClassificationStatus.Completed> {
    status: BaseClassificationStatus.Completed
    result: string // classification result
    // todo add completed properties
  }
  
  export interface ClassificationItemFailed extends BaseClassificationItem<BaseClassificationStatus.Failed> { 
    status: BaseClassificationStatus.Failed
    error: string // classification error
    // todo add failed properties
  }
  
  export type ClassificationItem = ClassificationItemPending | ClassificationItemCompleted | ClassificationItemFailed
  
  */  

export const schema = a.schema({

    //CandidateStatus: a.enum(["PENDING", "COMPLETED", "FAILED"]),

    ImageFormatProxy2: a.enum([
        'webp',
    ]),
    ImageOptionsProxy2: a.customType({
        width: a.integer().required(),
        height: a.integer().required(),
        format: a.ref("ImageFormatProxy2").required(),
    }),

    LabelProxy3: a.customType({
        id: a.id().required(), // todo may update to composite key
        name: a.string().required(),
        description: a.string().required(),
        promptId: a.id().required(),
        //version: a.string().required(),
        //promptVersion: a.ref("PromptVersionProxy1"), // Todo monitor

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
        // prompt: a.ref("PromptProxy1"), // Todo monitor

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        labels: a.ref("LabelProxy3").required().array(), // required()?
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

        versions: a.ref("PromptVersionProxy3").required().array(), // required()?
    }),
    ClassificationProxy1: a.customType({
        id: a.id().required(), // todo may update to composite key
        projectId: a.id().required(),
        project: a.ref("ProjectProxy8"),
    
        viewId: a.id().required(), // unbedingt required weil hängt an view
        view: a.ref("ViewProxy3"),
    
        promptId: a.id().required(),
        //prompt: a.belongsTo("Prompt", "promptId"),
        version: a.string().required(),
        promptVersion: a.ref("PromptVersionProxy3"),
    
        // todo alternatively relate to prompt
    
        name: a.string().required(),
        description: a.string(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    
        results: a.ref("ResultProxy1").required().array().required(), //.required?
      }),

      //ClassificationCandidateStatusProxy1: a.enum(["PENDING", "COMPLETED", "FAILED"]),

      ResultProxy1: a.customType({
        id: a.id().required(), // todo may update to composite key
        classificationId: a.id().required(),
        //classification: a.ref("ClassificationProxy"),
        confidence: a.float().required(),
    
        fileId: a.id().required(), // file oder viewFile
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

      ClassificationCandidateProxy1: a.customType({ // todo may just return ViewFile / file
        classificationId: a.id().required(),
        fileId: a.id().required(),
        file: a.ref("FileProxy4").required(),
        status: a.ref("ClassificationStatusProxy").required(),
        resultId: a.id(),
        result: a.ref("ResultProxy1"),
        //stat
        //labelId: a.id(),//.required(),
        //label: a.ref("LabelProxy3"),
        //createdAt: a.datetime().required(),
        //updatedAt: a.datetime().required(),
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
    FileProxy4: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        path: a.string().required(),
        //size: a.integer(),
        //eTag: a.string().required(),
        //versionId: a.string(),
        //projectId: a.id().required(),
        //projects: a.ref("ProjectProxy1"),
        //authorId: a.string(),
        author: a.ref("UserProxy9"),

        owner: a.string(),  // todo might remove this field

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
        project: a.ref("ProjectProxy8"),//.required(),
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
    ListClassificationCandidatesResponse: a.customType({
        items: a.ref("ClassificationCandidateProxy1").required().array().required(),
        nextToken: a.string(),
    }),

    classifyCandidateProxy: a // todo rename to classify?
        .mutation()
        .arguments({
            //projectId: a.id().required(),
            classificationId: a.id().required(),
            fileId: a.id().required(),

            //projectId: a.id().required(),
            //viewId: a.id().required(),
            //promptId: a.id().required(),
            //version: a.string().required(),
        })
        .returns(a.ref("ResultProxy1").required()) //a.ref("View") works here
        .handler(a.handler.function(classifyCandidate))
        .authorization(allow => [allow.authenticated()]),/*, allow.group("admin")]),*/
        // listCandidates, classifyCandidates, listResults, classifyCandidate, (updateResult), deleteResult
        classifyCandidatesProxy: a // todo rename to classify?
        .mutation()
        .arguments({
            //projectId: a.id().required(),
            classificationId: a.id().required(),
            files: a.id().required().array().required()

            //projectId: a.id().required(),
            //viewId: a.id().required(),
            //promptId: a.id().required(),
            //version: a.string().required(),
        })
        .handler(a.handler.function(classifyCandidates).async())
        .authorization(allow => [allow.authenticated()]),
        listClassificationCandidatesProxy: a // todo list by projectId, viewId, promptId, version
        .query()
        .arguments({ classificationId: a.id().required(), nextToken: a.string(), limit: a.integer(), imageOptions: a.ref("ImageOptionsProxy2").required() })
        .returns(a.ref("ListClassificationCandidatesResponse").required())//a.ref("View")
        .handler(a.handler.function(listClassificationCandidates))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    /*classifyCandidatesProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), classificationId: a.id().required(), fileIds: a.id().required().array() })
        .returns(a.ref("ResultProxy1").required())
        .handler(a.handler.function(classifyCandidates))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")]),
    listResultsProxy: a
        .query()
        .arguments({ projectId: a.id().required(), classificationId: a.id().required(), nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListResultsResponse").required())
        .handler(a.handler.function(listResults))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")]),*/
    /*classifyCandidateProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), classificationId: a.id().required(), fileId: a.id().required() })
        .returns(a.ref("ResultProxy1").required())
        .handler(a.handler.function(classifyCandidate))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")]),*/
    // listCandidates, classifyCandidates, listResults, classifyCandidate, (updateResult), deleteResult

}).authorization((allow) => [allow.resource(listClassificationCandidates), allow.resource(classifyCandidate), allow.resource(classifyCandidates)]/*, allow.resource(createResult), allow.resource(updateResult), allow.resource(deleteResult)*/);

export type Schema = ClientSchema<typeof schema>;