import { Result } from "../interfaces/IDrawioInterfaces";

export default class DiagramAnalyser {
    private readonly diagramElements: Result;

    constructor() {
        this.diagramElements = {
            dataFlowsArray: [],
            dataStoresArray: [],
            interactorsArray: [],
            multiProcessesArray: [],
            processesArray: [],
            trustBoundariesArray: []
        };
    }

    private createElementToAdd(cell: Element, geometryElement: Element, type: string) {
        const baseElement = {
            id: parseInt(cell.getAttribute("id")!),
            type: type,
            name: cell.getAttribute("value")!

        }
        const baseDfdElement = {
            ...baseElement,
            x1y1: [parseInt(geometryElement.getAttribute("x")!), parseInt(geometryElement.getAttribute("y")!)],
            x2y1: [parseInt(geometryElement.getAttribute("width")!) + parseInt(geometryElement.getAttribute("x")!), parseInt(geometryElement.getAttribute("y")!)],
            x1y2: [parseInt(geometryElement.getAttribute("x")!), parseInt(geometryElement.getAttribute("height")!) + parseInt(geometryElement.getAttribute("y")!)],
            x2y2: [parseInt(geometryElement.getAttribute("width")!) + parseInt(geometryElement.getAttribute("x")!), parseInt(geometryElement.getAttribute("height")!) + parseInt(geometryElement.getAttribute("y")!)],
            inTrustBoundary: []
        }

        switch (type) {
            case "Dataflow":
                return {
                    ...baseElement,
                    sourceId: parseInt(cell.getAttribute("source")!),
                    targetId: parseInt(cell.getAttribute("target")!)
                }
            default:
                return baseDfdElement
        }
    }
    private checkIfValuesAreEqual(elementAlreadyExists: any, elementToAdd: any, array: any[]): void {
        if (elementAlreadyExists.name !== elementToAdd.name) {
            array.find((element: any) => element.id === elementToAdd.id).name = elementToAdd.name;
            console.error(`Name of element with id ${elementToAdd.id} is not the same`);
        }
        if (elementToAdd.type !== "Dataflow") {
            if (elementAlreadyExists.x1 !== elementToAdd.x1) {
                array.find((element: any) => element.id === elementToAdd.id).x1 = elementToAdd.x1;
                console.error(`X1 of element with id ${elementToAdd.id} is not the same`);
            }
            if (elementAlreadyExists.x2 !== elementToAdd.x2) {
                array.find((element: any) => element.id === elementToAdd.id).x2 = elementToAdd.x2;
                console.error(`X2 of element with id ${elementToAdd.id} is not the same`);
            }
            if (elementAlreadyExists.y1 !== elementToAdd.y1) {
                array.find((element: any) => element.id === elementToAdd.id).y1 = elementToAdd.y1;
                console.error(`Y1 of element with id ${elementToAdd.id} is not the same`);
            }
            if (elementAlreadyExists.y2 !== elementToAdd.y2) {
                array.find((element: any) => element.id === elementToAdd.id).y2 = elementToAdd.y2;
                console.error(`Y2 of element with id ${elementToAdd.id} is not the same`);
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

    // TODO write function to delete elements that are not in the diagram anymore

    // TODO use this function to determine if the source and target exist (only for dataflows)
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

    // private calculateIfElementIsInTrustBoundary(element: any) : void {
    //     this.diagramElements.trustBoundariesArray.forEach(trustBoundary => {
    //        if (element.x1 >= trustBoundary.x1 && element.x2 <= trustBoundary.x2 && element.y1 >= trustBoundary.y1 && element.y2 <= trustBoundary.y2) {
    //            element.inTrustBoundary.push(trustBoundary.id);
    //        }
    //     });
    //
    // }


    parseDifferentDfdElementsFromXml(xmlDoc: XMLDocument): Result {
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

        // this.diagramElements.dataStoresArray.forEach(element => {
        //     this.calculateIfElementIsInTrustBoundary(element);
        // })
        // this.diagramElements.processesArray.forEach(element => {
        //     this.calculateIfElementIsInTrustBoundary(element);
        // })
        // this.diagramElements.multiProcessesArray.forEach(element => {
        //     this.calculateIfElementIsInTrustBoundary(element);
        // })
        // this.diagramElements.interactorsArray.forEach(element => {
        //     this.calculateIfElementIsInTrustBoundary(element);
        // })




        return this.diagramElements;
    }
}

