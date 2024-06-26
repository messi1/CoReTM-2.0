import React, {useEffect, useRef, useState} from 'react';

import CORSCommunicator from '../DrawIO/CORSCommunicator';
import LocalStorageModel from '../DrawIO/LocalStorageModel';
import DrawioController from "../DrawIO/DrawioController";


interface IStoredModel {
    id: string | null;
    diagram: string;
}

function DrawIO({ sendDiagram }: { sendDiagram: (diagram: string | null) => void }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized) {
            const localStorageModel = new LocalStorageModel();
            let loaded: IStoredModel[] = [];
            let selectedModel = localStorage.getItem('selectedModel');

            try {
                selectedModel = localStorage.getItem('selectedModel')
                loaded = JSON.parse(localStorage.getItem('storedModels') || '[]');
            } catch (error) {
                loaded = []
            }


            const selectedStoreModel: IStoredModel | undefined = loaded.find((m: IStoredModel) => m.id === selectedModel);

            if (selectedStoreModel?.diagram) {
                localStorageModel.write(selectedStoreModel.diagram);
            } else {
                localStorage.removeItem('diagram')
            }

            setInitialized(true);

            const drawioView = new CORSCommunicator(iframeRef.current);
            const stateController = new DrawioController(drawioView, localStorageModel);

            localStorageModel.observe(function(diagram: string) {
                sendDiagram(diagram)
                // @ts-ignore
                //selectedStoreModel.diagram = diagram;
                localStorage.setItem('storedModels', JSON.stringify(loaded))
            })
            sendDiagram(localStorageModel.read())
        }
    }, [initialized, sendDiagram]);

    return (
        <iframe
            ref={iframeRef}
            width="100%"
            height="100%"
            src="https://embed.diagrams.net/?embed=1&ui=dark&spin=1&proto=json&configure=1&noExitBtn=1&saveAndExit=0&noSaveBtn=1&noExitBtn=1"
            style={{ border: 'none' }}
            title={'draw.io'}
        />
    );
}

export default DrawIO;
