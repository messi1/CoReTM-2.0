import React, {useEffect, useRef, useState} from 'react';

import CORSCommunicator from '../DrawIO/CORSCommunicator';
import LocalStorageModel from '../DrawIO/LocalStorageModel';
import DrawioController from "../DrawIO/DrawioController";
import '../styles/Model.css';

interface DfdElement {
    id: string;
    value: string | null;
    style: string | null;
    edge: string | null;
    vertex: string | null;
    parent: string | null;
    source: string | null;
    target: string | null;
    geometry: {
        width: string | null;
        height: string | null;
        x: string | null;
        y: string | null;
        sourcepoint: {
            x: string;
            y: string;
        } | null;
        targetpoint: {
            x: string;
            y: string;
        } | null;
        points: Array<{
            x: string;
            y: string;
        }>;
    } | null;
}

function DrawIO({ sendDiagram }: { sendDiagram: (diagram: string | null) => void }) {
    let iframeRef = useRef<HTMLIFrameElement>(null);
    let [initialized, setInitialized] = useState(false);
    let [drawioController, setDrawioController] = useState<DrawioController | null>(null);

    useEffect(() => {
        if (!initialized) {
            const localStorageModel = new LocalStorageModel();

            setInitialized(true);

            const drawioView = new CORSCommunicator(iframeRef.current);
            const stateController = new DrawioController(drawioView, localStorageModel);
            setDrawioController(stateController)

            localStorageModel.observe(function(diagram: string) {
                sendDiagram(diagram)
            })
            sendDiagram(localStorageModel.read())
        }
    }, [sendDiagram]);

    function handleClickEvent() {
        const xmlDoc : XMLDocument | null =   drawioController!.returnXMLDocument()
        const diagram : Element = xmlDoc!.getElementsByTagName('diagram')[0]

        const mxCells : HTMLCollectionOf<Element> = xmlDoc!.getElementsByTagName("mxCell");

        // TODO - Remove this
        const mxCellsArray: Element[] = Array.from(mxCells);
        mxCellsArray.forEach((cell : Element, index : number) => {
            console.log(`Cell ${index}:`, cell);
        });

        const dfdElementsArray : DfdElement[] = Array.from(mxCells).map(cell => {
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
    }

    return (
        <div className={"Model"}>
            <iframe
                ref={iframeRef}
                width="100%"
                height="100%"
                src="https://embed.diagrams.net/?embed=1&ui=dark&spin=1&proto=json&configure=1&noExitBtn=1&saveAndExit=0&noSaveBtn=1&noExitBtn=1"
                style={{border: 'none'}}
                title={'draw.io'}
            />
            <button className={"nextButton"} onClick={handleClickEvent}>Next</button>
        </div>


    );
}

export default DrawIO;
