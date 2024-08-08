


export default class ImportController {


    parseFile(fileContent: string): { success: boolean, data?: any } {
        try {
            const parsedData = JSON.parse(fileContent);
            if (!parsedData) {
                alert("Failed to parse the file. Please upload a valid model.");
                return { success: false };
            }

            if (parsedData.ProjectName) {
                console.log("ProjectName:", parsedData.ProjectName);
            }

            if (parsedData.Diagram) {
                const xmlDoc : XMLDocument = new DOMParser().parseFromString(parsedData.Diagram, 'text/xml')
                const parseError = xmlDoc.getElementsByTagName('parsererror');
                if (parseError.length > 0) {
                    alert("Failed to parse the Diagram XML. Please upload a valid model.");
                    return { success: false };
                }

                const diagram = parsedData.Diagram
                console.log("Diagram:", xmlDoc);
            }

            if (parsedData.OverviewTable) {
                console.log("OverviewTable:", parsedData.OverviewTable);
                const overviewTable = JSON.parse(parsedData.OverviewTable);
                console.log("OverviewTable:", overviewTable);
            }

            if (parsedData.ThreatTables) {
                console.log("ThreatTables:", parsedData.ThreatTables);
                const threatTables = JSON.parse(parsedData.ThreatTables);
                console.log("ThreatTables:", threatTables);
            }
            return { success: true, data: parsedData };

        } catch (error) {
            console.error("Error parsing file:", error);
            return { success: false };
        }
    }
}
