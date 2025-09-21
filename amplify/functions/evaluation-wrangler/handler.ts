// Fetches view, files, labels, classifications and results; normalizes shape for Python step
import {  AppSyncResolverEvent } from 'aws-lambda';
import type { Schema } from '../../data/resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/evaluation-wrangler";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export interface NormalizedClassification extends Omit<Schema["ClassificationProxy1"]["type"], "results"> {
    labels: Array<Schema["LabelProxy1"]["type"]>;
    results: Array<Schema["ResultProxy1"]["type"]>;
}

/**
 * AppSync resolver for getAnalytics (step 1)
 * - Loads view context and related data, flattens for downstream processing
 */
export const handler = async (event: AppSyncResolverEvent<Schema["getAnalytics"]["args"], NormalizedClassification>) => {

    const { projectId, viewId } = event.arguments;

    const { data: view, errors: viewErrors } = await client.models.View.get({
        id: viewId,
    }, {
        selectionSet: ["id", "name", "description", "projectId", "project.*", "files.*", "classifications.*"]
    });

    if (viewErrors) {
        throw new Error(`Failed to retrieve view: ${JSON.stringify(viewErrors, null, 2)}`);
    }

    if (!view) {
        throw new Error(`View not found: ${viewId}`);
    }

    const projectLabels = new Array<Schema["LabelProxy1"]["type"]>();
    let projectLabelsToken: string | null | undefined = null;

    do {
        const { data: projectLabelsData, errors: projectLabelsErrors, nextToken: newNextToken } = await client.models.Label.listLabelsByProjectId({
            projectId: projectId
        }, {
            nextToken: projectLabelsToken,
            selectionSet: ["id", "name", "description", "projectId", "project.*", "createdAt", "updatedAt"]
        });

        if (projectLabelsErrors) {
            throw new Error("Failed to get view labels");
        }

        if (!projectLabelsData) {
            throw new Error("View labels not found");
        }

        projectLabels.push(...projectLabelsData);
        projectLabelsToken = newNextToken as string | null | undefined;
    } while (projectLabelsToken);

    const viewFiles = new Array<Schema["ViewFileProxy1"]["type"]>();
    let token: string | null | undefined = null;

    do {
        const { data, errors: viewFilesErrors, nextToken: newNextToken } = await client.models.ViewFile.list({
            viewId: viewId,
            nextToken: token,
            selectionSet: ["viewId", "fileId", "createdAt", "updatedAt", "label.*", "labelId", "view.*", "file.*"]
        });

        if (viewFilesErrors) {
            throw new Error("Failed to get view files");
        }

        if (!data) {
            throw new Error("View files not found");
        }

        viewFiles.push(...data);
        token = newNextToken as string | null | undefined;
    } while (token);

    const classifications = new Array<NormalizedClassification>();

    for (const { promptId, version, id } of view.classifications) {

        const { data: classification, errors: classificationErrors } = await client.models.Classification.get({
            id: id,
        }, {
            selectionSet: ["id", "name", "description", "promptId", "version", "prompt.*", "projectId", "project.*", "name", "viewId", "createdAt", "updatedAt", "model", "temperature", "topP", "maxLength"]
        });

        if (classificationErrors) {
            throw new Error("Failed to get classification");
        }

        if (!classification) {
            throw new Error("Classification not found");
        }

        const { data: labelRelations, errors: labelRelationsErrors } = await client.models.PromptVersionLabel.list({
            promptId: promptId,
            filter: {
                version: { eq: version }
            },

            selectionSet: ['promptId', 'version', 'labelId', 'label.*']
        });

        if (labelRelationsErrors) {
            throw new Error("Failed to get label relations");
        }

        const results = new Array<Schema["ResultProxy1"]["type"]>();
        let token: string | null | undefined = null;

        do {
            const { data, errors: resultsErrors, nextToken: newNextToken } = await client.models.Result.listResultsByClassificationId({
                classificationId: id,
            }, {
                nextToken: token,
                selectionSet: ["id", "classificationId", "confidence", "fileId", "labelId", "createdAt", "updatedAt", "file.*", "label.*"]
            });

            if (resultsErrors) {
                throw new Error("Failed to get results");
            }

            if (!data) {
                throw new Error("Results not found");
            }

            results.push(...data);
            token = newNextToken as string | null | undefined;
        } while (token);

        classifications.push({ ...classification, results, labels: labelRelations.map(labelRelation => labelRelation.label) })

    }

    return { ...view, labels: projectLabels, files: viewFiles, classifications }
};

