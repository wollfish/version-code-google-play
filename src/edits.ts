import * as core from '@actions/core';

import {google} from 'googleapis';
import {androidpublisher_v3} from "googleapis";

import AndroidPublisher = androidpublisher_v3.Androidpublisher;
import {Compute} from "google-auth-library/build/src/auth/computeclient";
import {JWT} from "google-auth-library/build/src/auth/jwtclient";
import {UserRefreshClient} from "google-auth-library/build/src/auth/refreshclient";

const androidPublisher: AndroidPublisher = google.androidpublisher('v3');

export interface EditOptions {
    auth: Compute | JWT | UserRefreshClient;
    applicationId: string;
}

export async function getLatestReleaseVersionCode(options: EditOptions): Promise<number | undefined> {
    // Create a new Edit
    core.info(`Getting the latest version of this application`)
    const appEdit = await androidPublisher.edits.insert({
        auth: options.auth,
        packageName: options.applicationId
    });

    const bundleResponse = await androidPublisher.edits.bundles.list({
        auth: options.auth,
        // Identifier of the edit.
        editId: appEdit.data.id!,
        // Package name of the app.
        packageName: options.applicationId,
    });
    const versionCode = Math.max(...bundleResponse.data.bundles!!.map((bundle) => bundle.versionCode!!));
    await androidPublisher.edits.delete({
        auth: options.auth,
        editId: appEdit.data.id!,
        packageName: options.applicationId
    });
    core.info(`Obtained version code ${versionCode}`)
    return Promise.resolve(versionCode);
}