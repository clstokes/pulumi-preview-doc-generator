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
const steps: any[] = previewData["steps"];

for (let step of steps) {
    const { resourceUrn, resourceType, resourceName } = utils.parseResource(step);
    if (
        resourceType.endsWith(":dynamic:Resource")
        || resourceType.startsWith("awsx")
        || step["newState"]["custom"] === false
    ) {
        continue
    }

    let markdownOutput = ``
    markdownOutput += `### \`${resourceType} - ${resourceName}\`` + "\n\n";

    markdownOutput += `URN: \`${resourceUrn}\`` + "\n\n";
    markdownOutput += `Type: \`${resourceType}\`` + "\n\n";
    markdownOutput += `Name: \`${resourceName}\`` + "\n\n";

    const stepInputs = step["newState"]["inputs"];

    if (stepInputs) {
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
    outputFile.write(markdownOutput, "utf-8");
}

console.log(`number of steps: ${steps.length} `);
outputFile.end();
