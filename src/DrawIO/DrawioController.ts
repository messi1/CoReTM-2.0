import cssVariables from "./variables";
import coretm from "./libs/CoReTM.json";
import CORSCommunicator from "./CORSCommunicator";
import LocalStorageModel from "./LocalStorageModel";

interface IDraft {
    xml: string;
}

export default class DrawioController {
    private drawio: CORSCommunicator;
    private storage: LocalStorageModel;
    private clientId: number;

    constructor(drawio: any, storage: any) {
        this.drawio = drawio
        this.storage = storage
        this.clientId = Math.random() * 10e15

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
        console.log("Message data: " + message.data);
        if (message.data.length <= 0) {
            return console.log('Empty event received:', message)
        }
        if (message.data === 'ready') {
            console.log('Drawio ready');
            //this.drawio.contentWindow.postMessage(JSON.stringify({ action: 'load', xmlpng: "" }), '*');
            return
        }
        if (!this.isJsonString(message.data)) {
            console.error('Invalid JSON received:', message.data);
            return
        }
        const msg = JSON.parse(message.data);
        console.info('Incoming message:', msg);

        const {event} = msg;
        console.info('Event:', event);
        const {xml} = msg;
        console.info('XML:', xml);

        if (event === 'configure') {
            console.log("Configure event received")
            this.configureDrawio()
        } else if (event === 'init') {
            console.log("Init event received")
            this.loadDrawio()
        } else if (event === 'export') {
            console.log("Export event received")
            this.storeDiagram(msg)
            this.close()
        } else if (event === 'autosave') {
            console.log("Autosave event received")
            this.autoSaveDiagram(msg)
        }
    }

    configureDrawio() {
        var configurationAction = {
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
        const draft: IDraft | null = this.storage.read("DrawioMsg");

        if (draft) {
            let loadAction = {
                action: 'load',
                autosave: 1,
                xml: draft.xml
            };
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
        var svg = atob(msg.data.substring(msg.data.indexOf(',') + 1))
        this.storage.write({
            data: svg
        })
    }

    autoSaveDiagram(msg: any) {
        this.storage.write(JSON.stringify(msg.xml), 'DrawioXML');
        // TODO test if stringify can be accessed when reloading the page. Accessor is line 147
        this.storage.write(JSON.stringify(msg), 'DrawioMsg');
    }

    close() {
        // TOOD
        console.log('To be implemented')
    }
}

