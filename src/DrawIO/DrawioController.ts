import cssVariables from "./variables";
import coretm from "./libs/CoReTM.json";
import notes from "./libs/Notes.json";

export default class DrawioController {
    private drawio: any;
    private storage: any;
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
        if (message.data.length <= 0) {
            return console.log('Empty event received:', message)
        }
        if (message.data === 'ready') {
            //this.drawio.contentWindow.postMessage(JSON.stringify({ action: 'load', xmlpng: "" }), '*');
            return
        }
        if (!this.isJsonString(message.data)) {
            return
        }
        var msg = JSON.parse(message.data)
        var {event} = msg

        if (event === 'configure') {
            this.configureDrawio()
        } else if (event === 'init') {
            this.loadDrawio()
        } else if (event === 'export') {
            this.storeDiagram(msg)
            this.close()
        } else if (event === 'autosave') {
            this.autoSaveDiagram(msg)
        }
    }

    configureDrawio() {
        // @ts-ignore
        // @ts-ignore
        // @ts-ignore
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
                defaultLibraries: 'ThreatFinderAI',
                defaultCustomLibraries: ['ThreatFinderAI'],
                enabledLibraries: ['ThreatFinderAI'],
                libraries: [{
                    "title": {
                        "main": "ThreatFinderAI"
                    },
                    "entries": [{
                        "id": "ThreatFinderAI",
                        "title": {
                            "main": "ThreatFinderAI",
                            "de": "ThreatFinderAI"
                        },
                        "desc": {
                            "main": "ThreatFinderAI",
                            "de": "ThreatFinderAI"
                        },
                        "libs": [{
                            "title": {
                                "main": "CoReTM",
                                "de": "CoReTM"
                            },
                            "data": coretm
                        }, {
                            "title": {
                                "main": "Notes",
                                "de": "Notes"
                            },
                            "data": notes
                        }]
                    }]
                }]
            }
        }
        this.drawio.send(configurationAction)
    }

    loadDrawio() {
        var draft = this.storage.read()
        var loadAction = {}
        if (draft != null) {
            var rec = draft
            loadAction = {
                action: 'load',
                autosave: 1,
                xml: rec.xml
            }

            var statusAction = {
                action: 'status',
                modified: true
            }

            this.drawio.send(loadAction)
            this.drawio.send(statusAction)
        } else {
            loadAction = {
                action: 'load',
                autosave: 1,
                xml: ""
            }
            this.drawio.send(loadAction)
        }
    }

    mergeChanges(record: any) {
        if (record.clientId === this.clientId) {
            return
        }
        var {xml} = record
        var mergeAction = {
            "action": "merge",
            "xml": xml
        }
        this.drawio.send(mergeAction)
    }

    storeDiagram(msg: any) {
        var svg = atob(msg.data.substring(msg.data.indexOf(',') + 1))
        this.storage.write({
            data: svg
        })
    }

    autoSaveDiagram(msg: any) {
        this.storage.write({
            xml: msg.xml
        })
    }

    close() {
        // TOOD
        console.log('To be implemented')
    }
}

