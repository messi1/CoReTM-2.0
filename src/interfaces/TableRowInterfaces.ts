export interface IOverviewTableRow {
    type: string,
    dataflowEnumeration: number,
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
    dataflowEnumeration: number,
    strideType: string,
    threat: string,
    mitigation: string,
    validation: string
}
