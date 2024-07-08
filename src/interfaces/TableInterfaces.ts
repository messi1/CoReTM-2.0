export interface IOverviewTable {
    dataflowId: number,
    dataflowName: string,
    interaction: string,
    description: string,
    S: boolean,
    T: boolean,
    R: boolean,
    I: boolean,
    D: boolean,
    E: boolean
}

export interface IThreatTable {
    threatId: number,
    dataflowId: number,
    strideType: string,
    threat: string,
    mitigation: string,
    validation: string
}
