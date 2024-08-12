import {IOverviewTableRow, IThreatTableRow} from "../interfaces/TableRowInterfaces";
import {ICrossingElements} from "../interfaces/DrawioInterfaces";


export default class TablesController {
    private overviewTable: IOverviewTableRow[];
    private threatTables: IThreatTableRow[][];


    constructor() {
        this.overviewTable = [];
        this.threatTables = [];
    }

    public createOverviewTableFromImport(importedOverviewTable : IOverviewTableRow[]) {
        this.overviewTable = importedOverviewTable;
    }

    public createOverviewTableFromDrawio(crossingElements: ICrossingElements[]) {
        this.overviewTable = crossingElements.map((element: ICrossingElements) => ({
            type: "OverviewRow",
            dataflowEnumeration: element.dataflow.enumeration,
            interaction: `${element.elements.sourceElement.name} ➝ ${element.elements.targetElement.name}`,
            description: "",
            threat: {
                S: false,
                T: false,
                R: false,
                I: false,
                D: false,
                E: false
            },
            crossingElement: element
        }));
        return this.overviewTable;
    }

    private parseOverviewTable(overviewTable: IOverviewTableRow[]) : IThreatTableRow[][] {
        this.overviewTable = overviewTable;
        this.overviewTable.forEach((element, index) => {
            element.crossingElement.crossingTrustBoundaries.forEach((trustBoundary) => {
                let trustBoundaryThreatRows: IThreatTableRow[] = [];
                for (const [key, value] of Object.entries(element.threat)) {
                    if (value) {
                        const threatRow: IThreatTableRow = {
                            type: "ThreatRow",
                            threatId: index + "-" + key + "-" + element.dataflowEnumeration,
                            dataflowEnumeration: element.dataflowEnumeration,
                            strideType: key,
                            threat: "",
                            mitigation: "",
                            validation: "",
                            trustBoundaryId: trustBoundary.id,
                            trustBoundaryName: trustBoundary.name,
                            added: false,
                        };
                        trustBoundaryThreatRows.push(threatRow);
                    }
                }
                index++;

                // Check if this.threatTables already contains a subarray with the same trustBoundaryId
                let existingTable = this.threatTables.find(table =>
                    table.some(row => row.trustBoundaryId === trustBoundary.id)
                );

                if (existingTable) {
                    // If exists, navigate to the appropriate subarray
                    existingTable.push(...trustBoundaryThreatRows);
                } else {
                    // If not exists, push the new trustBoundaryThreatRows
                    this.threatTables.push(trustBoundaryThreatRows);
                }
            });
        });
        return this.threatTables
    }

    public getThreatTables(): IThreatTableRow[][] {
        this.threatTables = this.parseOverviewTable(this.overviewTable)
        return this.threatTables;
    }

    public getOverviewTable(): IOverviewTableRow[] {
        return this.overviewTable;
    }

    public setOverviewTable(overviewTable: IOverviewTableRow[]) {
        this.overviewTable = overviewTable;
    }
}
