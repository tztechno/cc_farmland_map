import { useCallback, useState } from 'react';
import * as Papa from 'papaparse';
import { ProgressData } from './Map';

interface InitialDataLoaderProps {
    onDataLoaded: (data: ProgressData) => void;
}

const InitialDataLoader: React.FC<InitialDataLoaderProps> = ({ onDataLoaded }) => {
    const [source, setSource] = useState<'github' | 'gdrive'>('github');

    const loadInitialProgressData = useCallback(() => {
        const url = source === 'github' ? './Progress.csv' : 'https://docs.google.com/spreadsheets/d/<YOUR_SPREADSHEET_ID>/gviz/tq?tqx=out:csv&sheet=<SHEET_NAME>';

        fetch(url)
            .then((response) => response.text())
            .then((csvText) => {
                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        const data: ProgressData = {};
                        results.data.forEach((row: any) => {
                            if (row.region && row.progress) {
                                data[row.region] = Number(row.progress);
                            }
                        });
                        onDataLoaded(data);
                    },
                });
            })
            .catch((error) => {
                console.error('Error loading initial progress data:', error);
            });
    }, [source, onDataLoaded]);

    const toggleSource = () => {
        setSource((prevSource) => (prevSource === 'github' ? 'gdrive' : 'github'));
    };

    return (
        <div>
            <button onClick={loadInitialProgressData}>Load Initial Data</button>
            <button onClick={toggleSource}>
                Switch to {source === 'github' ? 'Google Drive' : 'GitHub'}
            </button>
        </div>
    );
};

export default InitialDataLoader;
