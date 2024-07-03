interface IElement {
    id: number
    name: string
    x1: number
    x2: number
    y1: number
    y2: number
    type: string
}

export interface IDataFlow{
    id: number
    name: string
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

export interface Result {
    processesArray: Array<IProcess>;
    multiProcessesArray: Array<IMultiProcess>;
    dataStoresArray: Array<IDataStore>;
    dataFlowsArray: Array<IDataFlow>;
    interactorsArray: Array<IInteractor>;
    trustBoundariesArray: Array<ITrustBoundary>;
}
