import LocalStorageModel from "./LocalStorageModel";
import {IOverviewTableRow, IThreatTableRow} from "../interfaces/TableRowInterfaces";


export default class TablesController {
    private storage: LocalStorageModel;
    private overviewTable: IOverviewTableRow[];
    private threatTables: IThreatTableRow[][];


    constructor(storage: LocalStorageModel) {
        this.storage = storage;
        this.overviewTable = [];
        this.threatTables = [];
    }

    public parseOverviewTable(table: IOverviewTableRow[]): IThreatTableRow[][] {
        this.overviewTable = table;
        this.overviewTable.forEach((element) => {
            element.crossingElement.crossingTrustBoundaries.forEach((trustBoundary) => {
                let trustBoundaryThreatRows: IThreatTableRow[] = [];
                for (const [key, value] of Object.entries(element.threat)) {
                    if (value) {
                        const threatRow: IThreatTableRow = {
                            type: "ThreatRow",
                            threatId: crypto.randomUUID(),
                            dataflowEnumeration: element.dataflowEnumeration,
                            strideType: key,
                            threat: "",
                            mitigation: "",
                            validation: "",
                            trustBoundaryId: trustBoundary.id,
                            trustBoundaryName: trustBoundary.name,
                            added: false
                        };
                        trustBoundaryThreatRows.push(threatRow);
                    }
                }

                // Check if this.threatTables already contains a subarray with the same trustBoundaryId
                let existingTable = this.threatTables.find(table =>
                    table.some(row => row.trustBoundaryId === trustBoundary.id)
                );

                if (existingTable) {
                    // If exists, navigate to the appropriate subarray
                    console.log("pushing to existing table", existingTable);
                    existingTable.push(...trustBoundaryThreatRows);
                    console.log(existingTable);
                } else {
                    // If not exists, push the new trustBoundaryThreatRows
                    this.threatTables.push(trustBoundaryThreatRows);
                }
            });
        });
        this.saveTable(this.overviewTable, "OverviewTable");
        console.log(this.threatTables);
        return this.threatTables;
    }


    private saveTable(table: IOverviewTableRow[] | IThreatTableRow[][] , type: "OverviewTable" | "ThreatTables") {
        this.storage.write(JSON.stringify(table), type);
    }

    public setThreatTables(threatTables: IThreatTableRow[][]): void {
        this.threatTables = threatTables;
        this.storage.write(JSON.stringify(threatTables), "ThreatTables");
    }

    public getThreatTables(): IThreatTableRow[][] {
       return this.threatTables;
    }

}
