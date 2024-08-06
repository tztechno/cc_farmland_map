import { useState, useCallback } from 'react';
import * as Papa from 'papaparse';
import { ProgressData } from './Map';

interface InitialDataLoaderProps {
    onDataLoaded: (data: ProgressData) => void;
}

const GOOGLE_SHEET_ID = '1oXpWOmPWHfdvuv4uBc0rFcsXBa-9ECWiczDoDFZkUu4';
const SHEET_NAME = 'progress';

const InitialDataLoader: React.FC<InitialDataLoaderProps> = ({ onDataLoaded }) => {
    const [dataSource, setDataSource] = useState<'github' | 'googleDrive' | null>(null);

    const loadCSVData = useCallback(() => {
        fetch('./Progress.csv')
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
                console.error('Error loading CSV data:', error);
            });
    }, [onDataLoaded]);

    const loadGoogleSheetData = useCallback(() => {
        const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

        fetch(url)
            .then((response) => response.text())
            .then((csvText) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const data: ProgressData = {};
                        const rows = results.data.slice(1); // Skip the first row
                        rows.forEach((row: any) => {
                            if (row.region && row.progress) {
                                data[row.region] = Number(row.progress);
                            }
                        });
                        onDataLoaded(data);
                    },
                });
            })
            .catch((error) => {
                console.error('Error loading Google Sheet data:', error);
            });
    }, [onDataLoaded]);

    const loadData = useCallback(() => {
        if (dataSource === 'github') {
            loadCSVData();
        } else if (dataSource === 'googleDrive') {
            loadGoogleSheetData();
        }
    }, [dataSource, loadCSVData, loadGoogleSheetData]);

    return (
        <div>
            <button onClick={() => { setDataSource('github'); loadData(); }}>
                Progress GitHub {dataSource === 'github' && '(Selected)'}
            </button>
            <button onClick={() => { setDataSource('googleDrive'); loadData(); }}>
                Progress GoogleDrive {dataSource === 'googleDrive' && '(Selected)'}
            </button>
        </div>
    );
};

export default InitialDataLoader;
