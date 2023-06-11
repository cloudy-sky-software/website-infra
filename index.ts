import * as pulumi from "@pulumi/pulumi";
import * as render from "@cloudyskysoftware/pulumi-render";

import { services } from "@cloudyskysoftware/pulumi-render/types/input";

const config = new pulumi.Config();
const ownerEmail = config.require("ownerEmail");

const ownerId = pulumi
    .output(render.owners.listOwners())
    .apply(
        (result) =>
            result.items.filter((i) => i.owner?.email === ownerEmail)[0].owner
                ?.id || ""
    );

const staticSiteDetails: services.StaticSiteServiceDetailsArgs = {
    buildCommand: "make render-build",
    publishPath: "public",
    pullRequestPreviewsEnabled: "yes",
};

const staticSite = new render.services.StaticSite(
    "website",
    {
        name: "Cloudy Sky Software website",
        ownerId,
        repo: "https://github.com/cloudy-sky-software/website",
        autoDeploy: "yes",
        branch: "main",
        serviceDetails: staticSiteDetails,
    },
    { protect: true }
);

const envVars = new render.services.EnvVar("envVars", {
    serviceId: staticSite.id,
    envVars: [
        {
            key: "HUGO_VERSION",
            value: "0.113.0",
        },
    ],
});

// TODO: Importing child resources is blocked by https://github.com/cloudy-sky-software/pulumi-render/issues/101.
// const domain = new render.services.CustomDomain(
//     "wwwCustomDomain",
//     {
//         name: "www.cloudysky.software",
//         serviceId: staticSite.id,
//     },
//     { import: "cdm-c9jnkjrru51r6g7orbgg" }
// );
