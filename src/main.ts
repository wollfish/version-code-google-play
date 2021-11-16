import * as core from '@actions/core';
import * as fs from "fs";
import { getLatestReleaseVersionCode } from "./edits";
const {google} = require('googleapis');

const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/androidpublisher']
});

async function run() {
    try {
        const serviceAccountJson = core.getInput('serviceAccountJson', { required: false });
        const serviceAccountJsonRaw = core.getInput('serviceAccountJsonPlainText', { required: false});
        const packageName = core.getInput('packageName', { required: true });

        // Validate that we have a service account json in some format
        if (!serviceAccountJson && !serviceAccountJsonRaw) {
            console.log("No service account json key provided!");
            core.setFailed("You must provide one of 'serviceAccountJson' or 'serviceAccountJsonPlainText' to use this action");
            return;
        }

        // If the user has provided the raw plain text via secrets, or w/e, then write to file and
        // set appropriate env variable for the auth
        if (serviceAccountJsonRaw) {
            const serviceAccountFile = "./serviceAccountJson.json";
            fs.writeFileSync(serviceAccountFile, serviceAccountJsonRaw, {
                encoding: 'utf8'
            });

            // Insure that the api can find our service account credentials
            core.exportVariable("GOOGLE_APPLICATION_CREDENTIALS", serviceAccountFile);
        }

        if (serviceAccountJson) {
            // Insure that the api can find our service account credentials
            core.exportVariable("GOOGLE_APPLICATION_CREDENTIALS", serviceAccountJson);
        }


        const authClient = await auth.getClient();

        const result = await getLatestReleaseVersionCode({
            auth: authClient,
            applicationId: packageName,
        });
        core.setOutput("versionCode", result)
    } catch (error: any) {
        core.setFailed(error.message)
    }
}

run();
