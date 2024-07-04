interface IElement {
    id: number
    name: string
    type: string
    x1y1: Array<number>
    x2y1: Array<number>
    x1y2: Array<number>
    x2y2: Array<number>
}

interface IDataFlow{
    id: number
    name: string
    type: string
    sourceId: number
    targetId: number
}

interface IProcess extends IElement {
    inTrustBoundary: Array<number>
}

interface IMultiProcess extends IElement {
    inTrustBoundary: Array<number>
}

interface IDataStore extends IElement {
    inTrustBoundary: Array<number>
}

interface IInteractor extends IElement {
    inTrustBoundary: Array<number>
}

interface ITrustBoundary extends IElement {
}

export interface Result {
    processesArray: Array<IProcess>;
    multiProcessesArray: Array<IMultiProcess>;
    dataStoresArray: Array<IDataStore>;
    dataFlowsArray: Array<IDataFlow>;
    interactorsArray: Array<IInteractor>;
    trustBoundariesArray: Array<ITrustBoundary>;
}
