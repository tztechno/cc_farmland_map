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
                console.log('CSV Text:', csvText); // CSVの内容を確認
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        console.log('Parsed data:', results.data);
                        const data: ProgressData = {};
                        results.data.forEach((row: any) => {
                            console.log('Processing row:', row); // 各行の内容を確認
                            if (row.region && row.progress) {
                                const progress = Number(row.progress);
                                console.log(`Region: ${row.region}, Progress: ${row.progress}, Converted Progress: ${progress}`);
                                if (!isNaN(progress)) {
                                    data[row.region] = progress;
                                } else {
                                    console.warn(`Invalid progress value for region ${row.region}: ${row.progress}`);
                                }
                            } else {
                                console.warn('Missing region or progress:', row);
                            }
                        });
                        onDataLoaded(data);
                    },
                    error: (error) => {
                        console.error('Papa.parse error:', error);
                    }
                });
            })
            .catch((error) => {
                console.error('Fetch error:', error);
            });

    }, [onDataLoaded]);

    useEffect(() => {
        loadGoogleSheetData();
    }, [loadGoogleSheetData]);

    return null;
};

export default GoogleSheetDataLoader;
