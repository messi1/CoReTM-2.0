interface IElement {
    id: number
    name: string
    type: string
    x1y1: { x1: number, y1: number }
    x2y1: { x2: number, y1: number }
    x1y2: { x1: number, y2: number }
    x2y2: { x2: number, y2: number }
}

export interface IDataFlow{
    id: number
    name: string
    type: string
    sourceId: number
    targetId: number
}

export interface IProcess extends IElement {
    inTrustBoundary: Array<number>
}

export interface IMultiProcess extends IElement {
    inTrustBoundary: Array<number>
}

export interface IDataStore extends IElement {
    inTrustBoundary: Array<number>
}

export interface IInteractor extends IElement {
    inTrustBoundary: Array<number>
}

export interface ITrustBoundary extends IElement {
}

export interface IResult {
    dataFlowsArray: Array<IDataFlow>,
    dataStoresArray: Array<IDataStore>,
    interactorsArray: Array<IInteractor>,
    multiProcessesArray: Array<IMultiProcess>,
    processesArray: Array<IProcess>,
    trustBoundariesArray: Array<ITrustBoundary>
}
