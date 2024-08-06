import { useCallback, useEffect } from 'react';
import * as Papa from 'papaparse';
import { ProgressData } from './Map';

const GOOGLE_SHEET_ID = '1oXpWOmPWHfdvuv4uBc0rFcsXBa-9ECWiczDoDFZkUu4';
const SHEET_NAME = 'progress';

interface GoogleSheetDataLoaderProps {
    onDataLoaded: (data: ProgressData) => void;
}

const GoogleSheetDataLoader: React.FC<GoogleSheetDataLoaderProps> = ({ onDataLoaded }) => {
    const loadGoogleSheetData = useCallback(() => {
        const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

        fetch(url)
            .then((response) => response.text())
            .then((csvText) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        console.log('Parsed data:', results.data);
                        const data: ProgressData = {};
                        results.data.forEach((row: any) => {
                            if (row.region && row.progress) {
                                const progress = Number(row.progress);
                                if (!isNaN(progress)) {
                                    data[row.region] = progress;
                                } else {
                                    console.warn(`Invalid progress value for region ${row.region}: ${row.progress}`);
                                }
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

    useEffect(() => {
        loadGoogleSheetData();
    }, [loadGoogleSheetData]);

    return null;
};

export default GoogleSheetDataLoader;
