import cssVariables from "./variables";
import coretm from "./libs/CoReTM.json";
import CORSCommunicator from "./CORSCommunicator";
import LocalStorageModel from "./LocalStorageModel";

import {IDFDElement} from "../interfaces/IDFDElement";

export default class DrawioController {
    private drawio: CORSCommunicator;
    private storage: LocalStorageModel;

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

    returnArrayOfDfdElements(xmlDoc : XMLDocument) : Array<IDFDElement> {

        const diagram : Element = xmlDoc.getElementsByTagName('diagram')[0]
        const mxCells : HTMLCollectionOf<Element> = xmlDoc!.getElementsByTagName("mxCell");

        // TODO - Remove this
        const mxCellsArray: Element[] = Array.from(mxCells);
        mxCellsArray.forEach((cell : Element, index : number) => {
            console.log(`Cell ${index}:`, cell);
        });

        const dfdElementsArray : IDFDElement[] = Array.from(mxCells).map(cell => {
            const geometryElement : Element = cell.getElementsByTagName("mxGeometry")[0];
            let sourcePoint = null;
            let targetPoint = null;
            let points: Array<{ x: string; y: string }> = [];

            if (geometryElement) {
                if (cell.getAttribute("edge") === "1") {
                    const sourcePointElement : Element | undefined = Array.from(geometryElement.getElementsByTagName("mxPoint")).find(pt => pt.getAttribute("as") === "sourcePoint");
                    const targetPointElement : Element | undefined = Array.from(geometryElement.getElementsByTagName("mxPoint")).find(pt => pt.getAttribute("as") === "targetPoint");

                    if (sourcePointElement) {
                        sourcePoint = {
                            x: sourcePointElement.getAttribute("x")!,
                            y: sourcePointElement.getAttribute("y")!
                        };
                    }

                    if (targetPointElement) {
                        targetPoint = {
                            x: targetPointElement.getAttribute("x")!,
                            y: targetPointElement.getAttribute("y")!
                        };
                    }

                    const pointsArray : Element = geometryElement.getElementsByTagName("Array")[0];
                    if (pointsArray) {
                        points = Array.from(pointsArray.getElementsByTagName("mxPoint")).map(pt => ({
                            x: pt.getAttribute("x") || "0",
                            y: pt.getAttribute("y") || "0"
                        }));
                    }
                }
                // Only for vertex elements
                if (cell.getAttribute("vertex") === "1") {
                    // If x or y is missing (happens when an element is placed exactly at the corner of the canvas) then add it
                    if (geometryElement.getAttribute("x") && !geometryElement.getAttribute("y")) {
                        geometryElement.setAttribute("y", "0");
                    }
                    else if (geometryElement.getAttribute("y") && !geometryElement.getAttribute("x")) {
                        geometryElement.setAttribute("x", "0");
                    }
                    else if (!geometryElement.getAttribute("x") && !geometryElement.getAttribute("y")){
                        geometryElement.setAttribute("x", "0");
                        geometryElement.setAttribute("y", "0");
                    }

                }
            }
            return {
                id: cell.getAttribute("id")!,
                value: cell.getAttribute("value"),
                type: cell.getAttribute("type"),
                style: cell.getAttribute("style"),
                edge: cell.getAttribute("edge"),
                vertex: cell.getAttribute("vertex"),
                parent: cell.getAttribute("parent"),
                source: cell.getAttribute("source"),
                target: cell.getAttribute("target"),
                geometry: geometryElement ? {
                    width: geometryElement.getAttribute("width"),
                    height: geometryElement.getAttribute("height"),
                    x: geometryElement.getAttribute("x"),
                    y: geometryElement.getAttribute("y"),
                    sourcepoint: sourcePoint,
                    targetpoint: targetPoint,
                    points: points
                } : null
            };
        });
        console.log(dfdElementsArray);
        return dfdElementsArray
    }
}

