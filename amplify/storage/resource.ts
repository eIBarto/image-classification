import { defineStorage } from '@aws-amplify/backend';
import { onUpload } from './on-upload/resource';
import { deleteProjectFile } from '../data/project-file/delete-project-file/resource';
import { listProjectFiles } from '../data/project-file/list-project-files/resource';
import { getProjectFile } from '../data/project-file/get-project-file/resource';
import { listViewFiles } from '../data/view-file/list-view-files/resource';
import { listClassificationCandidates } from '../data/classification-candidate/list-classification-candidates/resource';
import { classifyCandidate } from '../data/classification-candidate/classify-candidate/resource';
import { classifyCandidates } from '../data/classification-candidate/classify-candidates/resource';
export const uploadMediaBucket = defineStorage({
    name: 'upload-media-bucket',
    isDefault: true, // todo observer
    access: (allow) => ({
        'projects/submissions/{entity_id}/*': [
            allow.entity('identity').to(['read', 'write', 'delete']),
            allow.resource(onUpload).to(["read", "delete"]),
            //allow.resource(deleteProjectFile).to(["delete"]),
            allow.groups(['admin']).to(["read", "write", "delete"])
        ],
        //'projects/submissions/*': [
        //    //allow.entity('identity').to(['read', 'write', 'delete']),
        //    allow.resource(onUpload).to(["read", "delete"])
        //    ,allow.entity("identity")
        //],
        //'projects/shared/*': [
        //    allow.authenticated.to(['read']),
        //    allow.resource(onUpload).to(["write"])
        //],
    }),
});

export const mediaBucket = defineStorage({
    name: 'media-bucket',
    access: (allow) => ({
        'projects/shared/*': [
            allow.authenticated.to(['read']),
            allow.resource(onUpload).to(["write"]),
            allow.resource(deleteProjectFile).to(["delete", "read"]),
            allow.resource(listProjectFiles).to(["read"]),
            allow.resource(getProjectFile).to(["read"]),
            allow.resource(listViewFiles).to(["read"]),
            allow.resource(listClassificationCandidates).to(["read"]),
            allow.resource(classifyCandidate).to(["write", "read"]),
            allow.resource(classifyCandidates).to(["write", "read"]),
        ],
    }),
});