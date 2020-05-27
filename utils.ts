interface Resource {
    resourceUrn: string,
    resourcePackage: string,
    resourceType: string,
    resourceName: string,
}
export const parseResource = function (step: any): Resource {
    const urn = step["urn"];
    const splitValues = urn.split("::");
    const resourceType = step["newState"]["type"];
    return {
        resourceUrn: urn,
        resourcePackage: resourceType.split("/")[0],
        resourceType: resourceType,
        resourceName: splitValues[3],
    }
}
