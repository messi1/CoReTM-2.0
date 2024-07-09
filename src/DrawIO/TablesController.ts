import LocalStorageModel from "./LocalStorageModel";
import {IOverviewTableRow, IThreatTableRow} from "../interfaces/TableInterfaces";


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
        let threatRows: IThreatTableRow[][] = [];

        this.overviewTable.forEach((element) => {
            let elementThreatRows: IThreatTableRow[] = [];
            for (const [key, value] of Object.entries(element.threat)) {
                if (value) {
                    const threatRow: IThreatTableRow = {
                        type: "ThreatRow",
                        threatId: `${element.dataflowId}-${key}`,
                        dataflowId: element.dataflowId,
                        strideType: key,
                        threat: "",
                        mitigation: "",
                        validation: ""
                    };
                    elementThreatRows.push(threatRow);
                }
            }
            this.threatTables.push(elementThreatRows);
        });
        this.saveTable(this.overviewTable, "OverviewTable");
        return this.threatTables;
    }


    private saveTable(table: IOverviewTableRow[] | IThreatTableRow[][] , type: "OverviewTable" | "ThreatTables") {
        this.storage.write(JSON.stringify(table), type);
    }

    public setThreatTables(threatTables: IThreatTableRow[][]): void {
        this.threatTables = threatTables;
        this.storage.write(JSON.stringify(threatTables), "ThreatTables");
        console.log(this.storage.read("ThreatRow"));
    }

    public getThreatTables(): IThreatTableRow[][] {
       return this.threatTables;
    }

}
