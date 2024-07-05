import {
    IDataFlow,
    IDataStore,
    IInteractor,
    IMultiProcess,
    IProcess, IResult,
    ITrustBoundary
} from "../interfaces/IDrawioInterfaces";


/*
* TODO
*    -refactor checkIfValuesAreEqual
*    -deleteElementsNotInDiagram
*    -checkIfSourceAndTargetExist
 */

export default class DiagramAnalyser {
    private diagramElements: IResult;

    constructor() {
        this.diagramElements = {
            dataFlowsArray: Array<IDataFlow>(),
            dataStoresArray: Array<IDataStore>(),
            interactorsArray: Array<IInteractor>(),
            multiProcessesArray: Array<IMultiProcess>(),
            processesArray: Array<IProcess>(),
            trustBoundariesArray: Array<ITrustBoundary>()
        };
    }

    private createElementToAdd(cell: Element, geometryElement: Element, type: string) {
        const baseElement = {
            id: parseInt(cell.getAttribute("id")!),
            type: type,
            name: cell.getAttribute("value")!

        }
        const trustBoundaryElement = {
            ...baseElement,
            x1y1: {x1: parseInt(geometryElement.getAttribute("x")!), y1: parseInt(geometryElement.getAttribute("y")!)},
            x2y1: {x2: parseInt(geometryElement.getAttribute("width")!) + parseInt(geometryElement.getAttribute("x")!), y1: parseInt(geometryElement.getAttribute("y")!)},
            x1y2: {x1: parseInt(geometryElement.getAttribute("x")!), y2: parseInt(geometryElement.getAttribute("height")!) + parseInt(geometryElement.getAttribute("y")!)},
            x2y2: {x2: parseInt(geometryElement.getAttribute("width")!) + parseInt(geometryElement.getAttribute("x")!), y2: parseInt(geometryElement.getAttribute("height")!) + parseInt(geometryElement.getAttribute("y")!)}
        }
        const baseDfdElement = {
            ...trustBoundaryElement,
            inTrustBoundary: []
        }

        switch (type) {
            case "Dataflow":
                return {
                    ...baseElement,
                    sourceId: parseInt(cell.getAttribute("source")!),
                    targetId: parseInt(cell.getAttribute("target")!)
                }
            case "TrustBoundary":
                return {
                    ...trustBoundaryElement
                }
            default:
                return {
                    ...baseDfdElement
                }
        }
    }

    private checkIfSourceAndTargetExist(elementToAdd : any): boolean {
        console.log("Checking if source and target exist for: " + elementToAdd.id)
        if (isNaN(elementToAdd.sourceId)) {
            console.error("SourceId is null");
            return false;
        }
        if (isNaN(elementToAdd.targetId)) {
            console.error("TargetId is null");
            return false;
        }
        return true;
    }

    private navigateElementToCorrectArray(elementToAdd: any, type: string) {
        switch (type) {
            case "Process":
                this.diagramElements.processesArray.push(elementToAdd);
                break;
            case "Multiprocess":
                this.diagramElements.multiProcessesArray.push(elementToAdd);
                break;
            case "Datastore":
                this.diagramElements.dataStoresArray.push(elementToAdd);
                break;
            case "Dataflow":
                if (!this.checkIfSourceAndTargetExist(elementToAdd)) {
                    console.error("Source or target is missing for dataflow: " + elementToAdd.name);
                    return;
                }
                this.diagramElements.dataFlowsArray.push(elementToAdd);
                break;
            case "Interactor":
                this.diagramElements.interactorsArray.push(elementToAdd);
                break;
            case "TrustBoundary":
                this.diagramElements.trustBoundariesArray.push(elementToAdd);
                break;
            default:
                console.error("Cell type is not recognized");
                break;
        }
    }

    private calculateIfElementInTrustBoundary(element: any, trustBoundary: any): boolean {
        if (element.x1y1.x1 >= trustBoundary.x1y1.x1 && element.x1y1.y1 >= trustBoundary.x1y1.y1 && element.x2y1.x2 <= trustBoundary.x2y1.x2 && element.x2y1.y1 >= trustBoundary.x2y1.y1
            && element.x2y2.x2 <= trustBoundary.x2y2.x2 && element.x2y2.y2 <= trustBoundary.x2y2.y2 && element.x1y2.x1 >= trustBoundary.x1y2.x1 && element.x1y2.y2 <= trustBoundary.x1y2.y2) {
            console.log("Element is in trust boundary")
            return true;
        }
        return false;
    }

    private addInTrustBoundaryAttributeToDfdElement(element: any) : void {
        this.diagramElements.trustBoundariesArray.forEach(trustBoundary => {
            if (this.calculateIfElementInTrustBoundary(element, trustBoundary)) {
                element.inTrustBoundary.push(trustBoundary.id);
            }
        })

    }

    parseDifferentDfdElementsFromXml(xmlDoc: XMLDocument): IResult  {
        const mxCells = xmlDoc.getElementsByTagName("mxCell");

        this.diagramElements = {
            dataFlowsArray: new Array<IDataFlow>(),
            dataStoresArray: new Array<IDataStore>(),
            interactorsArray: new Array<IInteractor>(),
            multiProcessesArray: new Array<IMultiProcess>(),
            processesArray: new Array<IProcess>(),
            trustBoundariesArray: new Array<ITrustBoundary>()
        };


        Array.from(mxCells).forEach(cell  => {
            const type : string | null = cell.getAttribute("type");
            if (!type) {
                console.error("Cell type is not recognized or missing");
                return;
            }

            const geometryElement = cell.getElementsByTagName("mxGeometry")[0];
            if (!geometryElement) {
                console.error(`Geometry missing for cell ${cell.getAttribute("id")}`);
                return;
            }

            const elementToAdd = this.createElementToAdd(cell, geometryElement, type);
            if (elementToAdd) {
                this.navigateElementToCorrectArray(elementToAdd, type);
            }
        });

        this.diagramElements.dataStoresArray.forEach(element => {
            this.addInTrustBoundaryAttributeToDfdElement(element);
        })
        this.diagramElements.processesArray.forEach(element => {
            this.addInTrustBoundaryAttributeToDfdElement(element);
        })
        this.diagramElements.multiProcessesArray.forEach(element => {
            this.addInTrustBoundaryAttributeToDfdElement(element);
        })
        this.diagramElements.interactorsArray.forEach(element => {
            this.addInTrustBoundaryAttributeToDfdElement(element);
        })

        return this.diagramElements;
    }
}

