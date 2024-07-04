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
            dataFlowsArray: new Array<IDataFlow>(),
            dataStoresArray: new Array<IDataStore>(),
            interactorsArray: new Array<IInteractor>(),
            multiProcessesArray: new Array<IMultiProcess>(),
            processesArray: new Array<IProcess>(),
            trustBoundariesArray: new Array<ITrustBoundary>()
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
    private checkIfValuesAreEqual(elementAlreadyExists: any, elementToAdd: any, array: any[]): void {
        if (elementAlreadyExists.name !== elementToAdd.name) {
            array.find((element: any) => element.id === elementToAdd.id).name = elementToAdd.name;
            console.error(`Name of element with id ${elementToAdd.id} is not the same`);
        }
        if (elementToAdd.type !== "Dataflow") {
            if (elementAlreadyExists.x1y1 !== elementToAdd.x1y1) {
                array.find((element: any) => element.id === elementToAdd.id).x1y1 = elementToAdd.x1y1;
                console.error(`X1Y1 of element with id ${elementToAdd.id} is not the same`);
            }
            if (elementAlreadyExists.x2y1 !== elementToAdd.x2y1) {
                array.find((element: any) => element.id === elementToAdd.id).x2y1 = elementToAdd.x2y1;
                console.error(`X2Y1 of element with id ${elementToAdd.id} is not the same`);
            }
            if (elementAlreadyExists.x1y2 !== elementToAdd.x1y2) {
                array.find((element: any) => element.id === elementToAdd.id).x1y2 = elementToAdd.x1y2;
                console.error(`X1Y2 of element with id ${elementToAdd.id} is not the same`);
            }
            if (elementAlreadyExists.x2y2 !== elementToAdd.x2y2) {
                array.find((element: any) => element.id === elementToAdd.id).x2y2 = elementToAdd.x2y2;
                console.error(`X2Y2 of element with id ${elementToAdd.id} is not the same`);
            }
            // TODO fix this
            // if (elementAlreadyExists.inTrustBoundary !== elementToAdd.inTrustBoundary) {
            //     array.find((element: any) => element.id === elementToAdd.id).inTrustBoundary = elementToAdd.inTrustBoundary;
            //     console.error(`Trust boundary of element with id ${elementToAdd.id} is not the same`);
            // }
        } else {
            if (elementAlreadyExists.sourceId !== elementToAdd.sourceId) {
                array.find((element: any) => element.id === elementToAdd.id).sourceId = elementToAdd.sourceId;
                console.error(`SourceId of element with id ${elementToAdd.id} is not the same`);
            }
            if (elementAlreadyExists.targetId !== elementToAdd.targetId) {
                array.find((element: any) => element.id === elementToAdd.id).targetId = elementToAdd.targetId;
                console.error(`TargetId of element with id ${elementToAdd.id} is not the same`);
            }
        }
    }

    private checkIfElementAlreadyExists(elementToAdd: any, array: any[]): void {

        const elementAlreadyExists = array.find((element: any) => element.id === elementToAdd.id);
        if (elementAlreadyExists) {
            this.checkIfValuesAreEqual(elementAlreadyExists, elementToAdd, array);
        } else {
            array.push(elementToAdd);
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
                this.checkIfElementAlreadyExists(elementToAdd, this.diagramElements.processesArray);
                break;
            case "Multiprocess":
                this.checkIfElementAlreadyExists(elementToAdd, this.diagramElements.multiProcessesArray);
                break;
            case "Datastore":
                this.checkIfElementAlreadyExists(elementToAdd, this.diagramElements.dataStoresArray);
                break;
            case "Dataflow":
                this.checkIfElementAlreadyExists(elementToAdd, this.diagramElements.dataFlowsArray);
                break;
            case "Interactor":
                this.checkIfElementAlreadyExists(elementToAdd, this.diagramElements.interactorsArray);
                break;
            case "TrustBoundary":
                this.checkIfElementAlreadyExists(elementToAdd, this.diagramElements.trustBoundariesArray);
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

