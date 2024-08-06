import { useCallback, useEffect } from 'react';
import * as Papa from 'papaparse';
import { ProgressData } from './Map';

interface GitHubDataLoaderProps {
    onDataLoaded: (data: ProgressData) => void;
}

const GitHubDataLoader: React.FC<GitHubDataLoaderProps> = ({ onDataLoaded }) => {
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

    useEffect(() => {
        loadCSVData();
    }, [loadCSVData]);

    return null;
};

export default GitHubDataLoader;
