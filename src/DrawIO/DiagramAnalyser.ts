import {
    IDataFlow,
    IDiagram,
    ITrustBoundary,
    IElement, ICrossingElements
} from "../interfaces/IDrawioInterfaces";

export default class DiagramAnalyser {
    private diagramElements: IDiagram;
    private elementsCrossingTrustBoundaries: ICrossingElements[];

    constructor() {
        this.diagramElements = {
            dataFlowsArray: Array<IDataFlow>(),
            elementsArray: Array<IElement>(),
            trustBoundariesArray: Array<ITrustBoundary>()
        };
        this.elementsCrossingTrustBoundaries = Array<ICrossingElements>();
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

        if (type === "Dataflow") {
            if (!this.checkIfSourceAndTargetExist(elementToAdd)) {
                console.error("Source or target is missing for dataflow: " + elementToAdd.name);
                return;
            }
            this.diagramElements.dataFlowsArray.push(elementToAdd);
        } else if (type === "TrustBoundary") {
            this.diagramElements.trustBoundariesArray.push(elementToAdd);
        } else {
            this.diagramElements.elementsArray.push(elementToAdd);
        }
    }

    private calculateIfElementInTrustBoundary(element: any, trustBoundary: any): boolean {
        return element.x1y1.x1 >= trustBoundary.x1y1.x1 && element.x1y1.y1 >= trustBoundary.x1y1.y1 && element.x2y1.x2 <= trustBoundary.x2y1.x2 && element.x2y1.y1 >= trustBoundary.x2y1.y1
            && element.x2y2.x2 <= trustBoundary.x2y2.x2 && element.x2y2.y2 <= trustBoundary.x2y2.y2 && element.x1y2.x1 >= trustBoundary.x1y2.x1 && element.x1y2.y2 <= trustBoundary.x1y2.y2;

    }

    private addInTrustBoundaryAttributeToDfdElement(element: any) : void {
        this.diagramElements.trustBoundariesArray.forEach(trustBoundary => {
            if (this.calculateIfElementInTrustBoundary(element, trustBoundary)) {
                element.inTrustBoundary.push(trustBoundary.id);
            }
        })

    }

    private findDataflowsCrossingTrustBoundary() {
        this.diagramElements.dataFlowsArray.forEach(dataflow => {
            const sourceElement = this.diagramElements.elementsArray.find(element => element.id === dataflow.sourceId);
            const targetElement = this.diagramElements.elementsArray.find(element => element.id === dataflow.targetId);

            if (!sourceElement || !targetElement) {
                return;
            }

            const sourceTrustBoundaries = sourceElement.inTrustBoundary;
            const targetTrustBoundaries = targetElement.inTrustBoundary;
            const insideSameTrustBoundary = sourceTrustBoundaries.every((value) => targetTrustBoundaries.includes(value)) && targetTrustBoundaries.every((value) => sourceTrustBoundaries.includes(value))

            if (!insideSameTrustBoundary) {
                this.elementsCrossingTrustBoundaries.push({
                    dataflow: dataflow,
                    elements: {
                        sourceElement: sourceElement,
                        targetElement: targetElement
                    }
                })
            }
        });
    }

    parseDifferentDfdElementsFromXml(xmlDoc: XMLDocument): ICrossingElements[]  {
        const mxCells = xmlDoc.getElementsByTagName("mxCell");

        this.diagramElements = {
            dataFlowsArray: new Array<IDataFlow>(),
            elementsArray: new Array<IElement>(),
            trustBoundariesArray: new Array<ITrustBoundary>()
        };

        this.elementsCrossingTrustBoundaries = new Array<ICrossingElements>();

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

        this.diagramElements.elementsArray.forEach(element => {
            this.addInTrustBoundaryAttributeToDfdElement(element);
        })

        this.findDataflowsCrossingTrustBoundary();

        console.log("Elements that are connected by a dataflow crossing a trust boundary: ")
        console.log(this.elementsCrossingTrustBoundaries)

        return this.elementsCrossingTrustBoundaries;
    }
}

