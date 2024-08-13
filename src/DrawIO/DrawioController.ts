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
    private readonly projectName: string;
    private readonly diagramImage: HTMLImageElement;
    private imageReadyCallback: ((image: HTMLImageElement) => void) | null = null;


    private loadedFromLocalStorage: boolean = false;
    private changedAfterImported: boolean = false;


    constructor(drawio: CORSCommunicator, storage: LocalStorageModel, projectName: string) {
        this.drawio = drawio
        this.storage = storage
        this.diagramAnalyser = new DiagramAnalyser();
        this.projectName = projectName;
        this.diagramImage  = new Image();
        this.drawio.receive(this.handleIncomingEvents.bind(this))
    }

    private isJsonString = (str: any) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    private handleIncomingEvents(message: any) {
        if (message.data.length <= 0) {
            return
        }
        if (!this.isJsonString(message.data)) {
            return
        }
        const msg = JSON.parse(message.data);

        switch (msg.event) {
            case 'autosave':
                this.autoSaveDiagram(msg);
                break;
            case 'export':
                this.storeDiagram(msg);
                break;
            case 'init':
                this.loadDrawio();
                break;
            case 'configure':
                this.configureDrawio();
                break;
            default:
                console.error('Unknown event: ', msg.event);
        }
    }

    private configureDrawio() {
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
                }],
            }
        }
        this.drawio.send(configurationAction)
    }

    private loadDrawio(): void {
        const draft: any | null = this.storage.read("DrawioMsg");

        if (draft) {
            this.loadedFromLocalStorage = true;
            const parsedDraft = JSON.parse(draft);
            let loadAction = {
                action: 'load',
                autosave: 1,
                xml: parsedDraft.xml,
                title: this.projectName
            };
            const statusAction = {
                action: 'status',
                modified: true
            };
            this.drawio.send(loadAction);
            this.drawio.send(statusAction);
        } else {
            let loadAction = {
                "action": "load",
                "autosave": 1,
                "xml": "",
                    //"<mxGraphModel><root><mxCell id=\"0\"/><mxCell id=\"1\" parent=\"0\"/><mxCell id=\"2\" value=\"Note that &lt;u&gt;&lt;b&gt;only&lt;/b&gt;&lt;/u&gt; elements from the &lt;br&gt;CoReTM Library will be analysed.\" style=\"text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;overflow=hidden;\" vertex=\"1\" connectable=\"0\" parent=\"1\"><mxGeometry x=\"0\" y=\"0\" width=\"200\" height=\"50\" as=\"geometry\"/></mxCell></root></mxGraphModel>",
                title: this.projectName
            };
            this.drawio.send(loadAction);
        }
    }

    exportDiagram() {
        const exportAction = {
            action: 'export',
            format: 'svg'
        }
        this.drawio.send(exportAction)
    }

    private storeDiagram(msg: any) : any {
        this.diagramImage.src = msg.data;
        if (this.imageReadyCallback) {
            this.imageReadyCallback(this.diagramImage);
        }
    }

    private autoSaveDiagram(msg: any) {
        this.storage.write(JSON.stringify(msg), 'DrawioMsg');
        if (this.loadedFromLocalStorage) {
            this.changedAfterImported = true;
        }
    }

    getChangedAfterImported() : boolean {
        return this.changedAfterImported
    }

    setImageReadyCallback(callback: (image: HTMLImageElement) => void) {
        this.imageReadyCallback = callback;
    }

    parseXml() : {crossingElements: ICrossingElements[], invalidDataflows: boolean}  {
        const xmlDataString : string | null = this.storage.read('DrawioMsg');
        const parsed = JSON.parse(xmlDataString!);
        const xml = parsed.xml;

        let xmlDoc : XMLDocument;

        if (xmlDataString) {
            const parser : DOMParser = new DOMParser();
            try {
                xmlDoc = parser.parseFromString(xml, "text/xml");
            }
            catch (e) {
                console.log(e);
            }
        }
        const {crossingElements, invalidDataflows} = this.diagramAnalyser.parseDifferentDfdElementsFromXml(xmlDoc!);

        return {
            crossingElements: crossingElements,
            invalidDataflows: invalidDataflows
        }
    }
}

