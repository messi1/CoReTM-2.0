import cssVariables from "./variables";
import coretm from "./libs/CoReTM.json";
import CORSCommunicator from "./CORSCommunicator";
import LocalStorageModel from "./LocalStorageModel";

import {
    IDataFlow, IDataStore, IInteractor,
    IMultiProcess, IProcess, ITrustBoundary,
    Result
} from "../interfaces/IDrawioInterfaces";


export default class DrawioController {
    private drawio: CORSCommunicator;
    private storage: LocalStorageModel;
    private diagramElements: Result = {
        dataFlowsArray: new Array<IDataFlow>(),
        dataStoresArray: new Array<IDataStore>(),
        interactorsArray: new Array<IInteractor>(),
        multiProcessesArray: new Array<IMultiProcess>(),
        processesArray: new Array<IProcess>(),
        trustBoundariesArray: new Array<ITrustBoundary>()
    }

    constructor(drawio: any, storage: any) {
        this.drawio = drawio
        this.storage = storage
        this.drawio.receive(this.handleIncomingEvents.bind(this))
    }

    isJsonString = (str: any) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    handleIncomingEvents(message: any) {
        if (message.data.length <= 0) {
            return
        }
        if (!this.isJsonString(message.data)) {
            return
        }
        const msg = JSON.parse(message.data);

        switch (msg.event) {
            case 'autosave':
                console.log('Autosave event: ', msg);
                this.autoSaveDiagram(msg);
                break;
            case 'export':
                console.log('Export event: ', msg);
                this.storeDiagram(msg);
                break;
            case 'init':
                console.log('Init event: ', msg);
                this.loadDrawio();
                break;
            case 'configure':
                console.log('Configure event: ', msg);
                this.configureDrawio();
                break;
            default:
                console.error('Unknown event: ', msg.event);
        }
    }

    configureDrawio() {
        const configurationAction = {
            action: 'configure',
            config: {
                css: `
          .geMenubarContainer, .mxWindow {
            background-color: hsl(246, 56%, 90%) !important;
          }
          tr.mxPopupMenuItemHover {
            background-color: hsl(246, 56%, 90%) !important;
          }
          .geSidebarContainer .geTitle:hover {
            background: hsl(246, 56%, 95%) !important;
          }
          .geSidebarTooltip {
            box-shadow:0 2px 6px 2px rgba(218, 215, 244, 0.6) !important;
          }
          .geSidebar .geItem:hover {
            background-color: hsl(246, 56%, 95%) !important;
          }
          .geSidebarFooter > .geBtn {
            display: none !important;
          }
          .geTitle, .mxWindowTitle, .geFormatSection {
            color: ${cssVariables['--coretm-darkgrey']} !important;
          }
          .geFormatSection:nth-of-type(3), .geFormatSection:nth-of-type(4) {
          display: none;

          }
          .geMenubar {
          }
          .geDiagramContainer {
            overflow: hidden !important;
          }
          .geToolbarButton[title=Language] {
            display: none;
          }
        `,
                defaultFonts: [
                    "Humor Sans",
                    "Helvetica",
                    "Times New Roman"
                ],
                ui: 'dark',
                defaultLibraries: 'CoReTM',
                defaultCustomLibraries: ['CoReTM'],
                enabledLibraries: ['CoReTM'],
                libraries: [{
                    "title": {
                        "main": "CoReTM"
                    },
                    "entries": [{
                        "id": "CoReTM",
                        "title": {
                            "main": "CoReTM",
                            "de": "CoReTM"
                        },
                        "desc": {
                            "main": "CoReTM",
                            "de": "CoReTM"
                        },
                        "libs": [{
                            "title": {
                                "main": "CoReTM",
                                "de": "CoReTM"
                            },
                            "data": coretm
                        }]
                    }]
                }]
            }
        }
        this.drawio.send(configurationAction)
    }

    loadDrawio(): void {
        const draft: any | null = this.storage.read("DrawioMsg");

        if (draft) {
            const parsedDraft = JSON.parse(draft);
            let loadAction = {
                action: 'load',
                autosave: 1,
                xml: parsedDraft.xml
            };
            console.log("Load action: ", loadAction);
            const statusAction = {
                action: 'status',
                modified: true
            };
            this.drawio.send(loadAction);
            this.drawio.send(statusAction);
        } else {
            let loadAction = {
                action: 'load',
                autosave: 1,
                xml: ""
            };
            this.drawio.send(loadAction);
        }
    }


    storeDiagram(msg: any) {
        const svg = atob(msg.data.substring(msg.data.indexOf(',') + 1))
        this.storage.write({
            data: svg
        })
    }

    autoSaveDiagram(msg: any) {
        this.storage.write(JSON.stringify(msg), 'DrawioMsg');
    }

    close() {
        // TOOD
        console.log('To be implemented')
    }

    returnXMLDocument(): XMLDocument | null  {
        let xmlDataString : string | null = this.storage.read('DrawioMsg');
        let parsed = JSON.parse(xmlDataString!);
        let xml = parsed.xml;

        if (xmlDataString) {
            const parser = new DOMParser();
            try
            {
                let xmlDoc : XMLDocument = parser.parseFromString(xml, "text/xml");
                return xmlDoc;
            }
            catch (e) {
                console.log(e);
            }
        }
        alert("No data found");
        return null;
    }

    checkIfElementAlreadyExists(elementToAdd: any, array: Array<any>) {
        if (!array.some(e => e.id === elementToAdd.id)) {
            array.push(elementToAdd);
        }
    }

    parseDifferentDfdElementsFromXml(xmlDoc : XMLDocument) : Result {
        const diagram : Element = xmlDoc.getElementsByTagName('diagram')[0]
        const mxCells : HTMLCollectionOf<Element> = xmlDoc!.getElementsByTagName("mxCell");

        // TODO - Remove this
        // const mxCellsArray: Element[] = Array.from(mxCells);
        // mxCellsArray.forEach((cell : Element, index : number) => {
        //     console.log(`Cell ${index}:`, cell);
        // });


        Array.from(mxCells).forEach(cell => {
            const geometryElement : Element = cell.getElementsByTagName("mxGeometry")[0];
            let elementToAdd : any;

            switch (cell.getAttribute("type")) {

                case "Process":
                    elementToAdd = {
                        id: parseInt(cell.getAttribute("id")!),
                        name: cell.getAttribute("value")!,
                        x1: parseInt(geometryElement.getAttribute("x")!),
                        x2: parseInt(geometryElement.getAttribute("width")!) + parseInt(geometryElement.getAttribute("x")!),
                        y1: parseInt(geometryElement.getAttribute("y")!),
                        y2: parseInt(geometryElement.getAttribute("height")!) + parseInt(geometryElement.getAttribute("y")!),
                        type: cell.getAttribute("type")!,
                        inTrustBoundary: []
                    }
                    this.checkIfElementAlreadyExists(elementToAdd, this.diagramElements.processesArray);
                    break;

                case "Multiprocess":
                    elementToAdd = {
                        id: parseInt(cell.getAttribute("id")!),
                        name: cell.getAttribute("value")!,
                        x1: parseInt(geometryElement.getAttribute("x")!),
                        x2: parseInt(geometryElement.getAttribute("width")!) + parseInt(geometryElement.getAttribute("x")!),
                        y1: parseInt(geometryElement.getAttribute("y")!),
                        y2: parseInt(geometryElement.getAttribute("height")!) + parseInt(geometryElement.getAttribute("y")!),
                        type: cell.getAttribute("type")!,
                        inTrustBoundary: []
                    }
                    this.checkIfElementAlreadyExists(elementToAdd, this.diagramElements.multiProcessesArray);
                    break;

                case "Datastore":
                    elementToAdd = {
                        id: parseInt(cell.getAttribute("id")!),
                        name: cell.getAttribute("value")!,
                        x1: parseInt(geometryElement.getAttribute("x")!),
                        x2: parseInt(geometryElement.getAttribute("width")!) + parseInt(geometryElement.getAttribute("x")!),
                        y1: parseInt(geometryElement.getAttribute("y")!),
                        y2: parseInt(geometryElement.getAttribute("height")!) + parseInt(geometryElement.getAttribute("y")!),
                        type: cell.getAttribute("type")!,
                        inTrustBoundary: []
                    }
                    this.checkIfElementAlreadyExists(elementToAdd, this.diagramElements.dataStoresArray);
                    break;

                case "Dataflow":
                    elementToAdd = {
                        id: parseInt(cell.getAttribute("id")!),
                        name: cell.getAttribute("value")!,
                        sourceId: parseInt(cell.getAttribute("source")!),
                        targetId: parseInt(cell.getAttribute("target")!)
                    }
                    if (!elementToAdd.sourceId || !elementToAdd.targetId) {
                        alert(`The data flow "${elementToAdd.name}" is missing source or target. Please fix it and try again.`)
                        break;
                    }
                    this.checkIfElementAlreadyExists(elementToAdd, this.diagramElements.dataFlowsArray);
                    break;

                case "Interactor":
                    elementToAdd = {
                        id: parseInt(cell.getAttribute("id")!),
                        name: cell.getAttribute("value")!,
                        x1: parseInt(geometryElement.getAttribute("x")!),
                        x2: parseInt(geometryElement.getAttribute("width")!) + parseInt(geometryElement.getAttribute("x")!),
                        y1: parseInt(geometryElement.getAttribute("y")!),
                        y2: parseInt(geometryElement.getAttribute("height")!) + parseInt(geometryElement.getAttribute("y")!),
                        type: cell.getAttribute("type")!,
                        inTrustBoundary: []
                    }
                    this.checkIfElementAlreadyExists(elementToAdd, this.diagramElements.interactorsArray);
                    break;

                case "TrustBoundary":
                    elementToAdd = {
                        id: parseInt(cell.getAttribute("id")!),
                        name: cell.getAttribute("value")!,
                        x1: parseInt(geometryElement.getAttribute("x")!),
                        x2: parseInt(geometryElement.getAttribute("width")!) + parseInt(geometryElement.getAttribute("x")!),
                        y1: parseInt(geometryElement.getAttribute("y")!),
                        y2: parseInt(geometryElement.getAttribute("height")!) + parseInt(geometryElement.getAttribute("y")!),
                        type: cell.getAttribute("type")!
                    }
                    this.checkIfElementAlreadyExists(elementToAdd, this.diagramElements.trustBoundariesArray);
                    break;

                default:
                    if (cell.getAttribute("edge") === "1") {
                        alert("You have used a built-in edge element, instead of the dataflow element. " +
                            "For further processing, it is important that only the predefined dataflow element is used. " +
                            "Please fix it and try again.");
                        break;
                    }
                    console.error("Cell type is not recognized");
                    break;
            }
        });
        console.log("Processes: ", this.diagramElements.processesArray);
        console.log("MultiProcesses: ", this.diagramElements.multiProcessesArray);
        console.log("DataStores: ", this.diagramElements.dataStoresArray);
        console.log("DataFlows: ", this.diagramElements.dataFlowsArray);
        console.log("Interactors: ", this.diagramElements.interactorsArray);
        console.log("TrustBoundaries: ", this.diagramElements.trustBoundariesArray);

        return this.diagramElements;
    }

}

