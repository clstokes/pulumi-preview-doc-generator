import * as fs from "fs";
import * as yargs from "yargs";
import * as utils from "./utils";

const argv = yargs
    .option('in', {
        description: 'json file to read as input',
        type: 'string',
        demandOption: true,
    })
    .option('out', {
        description: 'markdown file to write to (will be overwritten)',
        type: 'string',
        demandOption: true,
    })
    .help()
    .alias('help', 'h')
    .argv;

// Input file
const inputFile = fs.readFileSync(argv.in, "utf-8");
const previewData = JSON.parse(inputFile);

// Output file
const outputFile = fs.createWriteStream(argv.out);

// Create output
const outputCategories: { [key: string]: string[] } = {};
const steps: any[] = previewData["steps"];

for (let step of steps) {
    const { resourceUrn, resourcePackage, resourceType, resourceName } = utils.parseResource(step);
    if (
        resourceType.startsWith("pulumi")
        || resourceType.startsWith("awsx")
        || resourceType.endsWith(":dynamic:Resource")
        || step["newState"]["custom"] === false
    ) {
        continue
    }

    let markdownOutput = ``
    markdownOutput += `#### \`${resourceType} - ${resourceName}\`` + "\n\n";
    
    markdownOutput += `|     | Resource Details |` + "\n";
    markdownOutput += `| --- | --- |` + "\n";
    markdownOutput += `| URN | \`${resourceUrn}\` |` + "\n";
    markdownOutput += `| Type | \`${resourceType}\` |` + "\n";
    markdownOutput += `| Name | \`${resourceName}\` |` + "\n";

    markdownOutput += "\n\n";

    const stepInputs = step["newState"]["inputs"];

    if (stepInputs) {
        // markdownOutput += `##### Inputs` + "\n\n";

        markdownOutput += `| Input Name | Input Value |` + "\n";
        markdownOutput += `| ---------- | ----------- |` + "\n";

        for (let [inputKey, inputValue] of Object.entries(stepInputs)) {

            if (inputKey === "__defaults") {
                continue;
            }

            let inputValueString = '';
            if (typeof (inputValue) == 'object') {
                // delete inputValue["__defaults"]; // TODO: remove __defaults
                inputValueString = JSON.stringify(inputValue);
            }
            else if (inputValue === "04da6b54-80e4-46f7-96ec-b56ff0331ba9") {
                inputValueString = "<computed>";
            }
            else {
                inputValueString = <string>inputValue;
            }
            markdownOutput += `| ${inputKey} | \`${inputValueString}\` |` + "\n";
        }
    }
    markdownOutput += "\n";

    if (outputCategories[resourcePackage] === undefined) {
        outputCategories[resourcePackage] = [];
    }
    outputCategories[resourcePackage].push(markdownOutput);
}

let resourceToc = "";
resourceToc += `# Resources` + "\n\n";

let totalResourceMarkdown = ""

for (let [categoryKey, resources] of Object.entries(outputCategories)) {
    resourceToc += `- [${categoryKey}](#${categoryKey.replace(/:/g, "")})` + "\n";

    totalResourceMarkdown += `## ${categoryKey}` + "\n\n";
    for (let resourceMarkdown of resources) {
        totalResourceMarkdown += resourceMarkdown;
        totalResourceMarkdown += "---" + "\n\n";
    }
}

resourceToc += "\n\n";

outputFile.write(resourceToc, "utf-8");
outputFile.write(totalResourceMarkdown, "utf-8");

console.log(`number of steps: ${steps.length} `);
outputFile.end();
