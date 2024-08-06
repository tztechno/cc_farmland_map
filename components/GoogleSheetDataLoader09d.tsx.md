import { useCallback, useEffect } from 'react';
import * as Papa from 'papaparse';

// ProgressData 型をここで定義
interface ProgressData {
    [region: number]: number;
}

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
                console.log('CSV Text:', csvText);
                Papa.parse(csvText, {
                    header: false, // ヘッダーなしに設定
                    skipEmptyLines: true,
                    complete: (results) => {
                        console.log('Parsed data:', results.data);
                        const data: ProgressData = {};
                        results.data.forEach((row: string[], index: number) => {
                            if (row.length >= 2) {
                                const region = parseInt(row[0], 10);
                                const progress = parseInt(row[1], 10);
                                console.log(`Row ${index}: Region: ${region}, Progress: ${progress}`);
                                if (!isNaN(region) && !isNaN(progress)) {
                                    data[region] = progress;
                                } else {
                                    console.warn(`Invalid data in row ${index}: ${row.join(', ')}`);
                                }
                            } else {
                                console.warn(`Insufficient data in row ${index}: ${row.join(', ')}`);
                            }
                        });
                        console.log('Final processed data:', data);
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