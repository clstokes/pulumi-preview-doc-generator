interface Resource {
    resourceUrn: string,
    resourceType: string,
    resourceName: string,
}
export const parseResource = function (step: any): Resource {
    const urn = step["urn"];
    const splitValues = urn.split("::");
    return {
        resourceUrn: urn,
        resourceType: step["newState"]["type"],
        resourceName: splitValues[3],
    }
}
