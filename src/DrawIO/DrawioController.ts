import cssVariables from "./variables";
import coretm from "./libs/CoReTM.json";
import CORSCommunicator from "./CORSCommunicator";
import LocalStorageModel from "./LocalStorageModel";
import DiagramAnalyser from "./DiagramAnalyser";

import { ICrossingElements } from "../interfaces/DrawioInterfaces";


export default class DrawioController {
    private drawio: CORSCommunicator;
    private storage: LocalStorageModel;
    private diagramAnalyser: DiagramAnalyser;

    constructor(drawio: any, storage: any) {
        this.drawio = drawio
        this.storage = storage
        this.diagramAnalyser = new DiagramAnalyser();
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

    parseXml() : ICrossingElements[]  {
        const xmlDataString : string | null = this.storage.read('DrawioMsg');
        const parsed = JSON.parse(xmlDataString!);
        const xml = parsed.xml;

        if (xmlDataString) {
            const parser = new DOMParser();
            try
            {
                const xmlDoc : XMLDocument = parser.parseFromString(xml, "text/xml");
                const crossingElements: ICrossingElements[] = this.diagramAnalyser.parseDifferentDfdElementsFromXml(xmlDoc);
                return crossingElements;

            }
            catch (e) {
                console.log(e);
            }
        }
        // TODO add error handling if something goes wrong (e.g. dataflow without source or target)
        alert("Some elements could not be processed, please check the console for more information");
        return [];
    }
}

