export interface IOverviewTableRow {
    type: string,
    dataflowId: number,
    dataflowName: string,
    interaction: string,
    description: string,
    threat: {
        S: boolean,
        T: boolean,
        R: boolean,
        I: boolean,
        D: boolean,
        E: boolean
    }
}

export interface IThreatTableRow {
    type: string,
    threatId: string,
    dataflowId: number,
    strideType: string,
    threat: string,
    mitigation: string,
    validation: string
}
