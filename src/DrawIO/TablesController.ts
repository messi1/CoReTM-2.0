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

                let existingTable = this.threatTables.find(table =>
                    table.some(row => row.trustBoundaryId === trustBoundary.id)
                );

                if (existingTable) {
                    existingTable.push(...trustBoundaryThreatRows);
                } else {
                    this.threatTables.push(trustBoundaryThreatRows);
                }
            });
        });
        return this.threatTables
    }

    public updateThreatTable(importedThreatTable: IThreatTableRow[][]) {
        this.generateThreatTables()
        importedThreatTable.forEach((table, tableIndex) => {
            table.forEach((row) => {
                const existingTable = this.threatTables[tableIndex];

                if (existingTable) {
                    const existingRow = existingTable.find(existingRow => existingRow.threatId === row.threatId);

                    if (existingRow) {
                        Object.assign(existingRow, row);
                    } else {
                        existingTable.push(row);
                    }
                } else {
                    this.threatTables[tableIndex] = [row];
                }
            });
        });
    }

    public generateThreatTables(): IThreatTableRow[][] {
        this.threatTables = this.parseOverviewTable(this.overviewTable)
        return this.threatTables;
    }

    public getThreatTables(): IThreatTableRow[][] {
        return this.threatTables;
    }

    public getOverviewTable(): IOverviewTableRow[] {
        return this.overviewTable;
    }

    public setOverviewTable(overviewTable: IOverviewTableRow[]) {
        this.overviewTable = overviewTable;
    }
}
