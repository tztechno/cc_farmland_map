import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ProgressData } from '../components/Map';
import InitialDataLoader from '../components/InitialDataLoader';
import * as Papa from 'papaparse';

const MapComponent = dynamic(() => import('../components/Map'), { ssr: false });

// プログレス状態のマッピングを定義
const progressMapping = {
    0: '未散布',
    1: '散布中',
    2: '散布済み',
    3: '散布中止'
};

// 色のマッピングを定義（yellowをorangeに変更）
const colorMapping = {
    0: 'red',
    1: 'orange',
    2: 'blue',
    3: 'gray'
};

const IndexPage: React.FC = () => {
    const [progressData, setProgressData] = useState<ProgressData>({});
    const [selectedRegion, setSelectedRegion] = useState<string>('');

    const handleProgressUpdate = useCallback((newProgressData: ProgressData) => {
        setProgressData(newProgressData);
    }, []);

    const handleInitialDataLoad = useCallback((data: ProgressData) => {
        setProgressData(prevData => ({ ...prevData, ...data }));
    }, []);

    const handleSaveCSV = () => {
        const csvContent = Papa.unparse(
            Object.entries(progressData).map(([region, progress]) => ({
                region,
                progress,
            }))
        );

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            const date = new Date().toISOString().replace(/[:.]/g, '-');
            link.setAttribute('download', `Progress_${date}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    const handleRegionSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRegion(event.target.value);
    };

    const handleProgressSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newProgress = parseInt(event.target.value);
        if (selectedRegion) {
            const newProgressData = { ...progressData, [selectedRegion]: newProgress };
            setProgressData(newProgressData);
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ width: '86%' }}>
                <h1>Farmland Map</h1>
                <MapComponent
                    onProgressUpdate={handleProgressUpdate}
                    progressData={progressData}
                />
            </div>
            <div style={{ width: '14%', padding: '8px' }}>
                <h2>Status</h2>

                <InitialDataLoader onDataLoaded={handleInitialDataLoad} />
                <button onClick={handleSaveCSV}>Save Progress</button>

                <div style={{ marginTop: '20px' }}>
                    <select onChange={handleRegionSelect} value={selectedRegion}>
                        <option value="">Select region</option>
                        {Object.keys(progressData).map(region => (
                            <option key={region} value={region}>{region}</option>
                        ))}
                    </select>
                    {selectedRegion && (
                        <select
                            onChange={handleProgressSelect}
                            value={progressData[selectedRegion]}
                            style={{ marginLeft: '10px' }}
                        >
                            {Object.entries(progressMapping).map(([value, label]) => (
                                <option
                                    key={value}
                                    value={value}
                                    style={{ color: colorMapping[parseInt(value) as keyof typeof colorMapping] }}
                                >
                                    {label}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {Object.entries(progressData).map(([region, progress]) => (
                        <li key={region} style={{ marginBottom: '5px' }}>
                            <span style={{
                                color: colorMapping[progress as keyof typeof colorMapping],
                                fontWeight: 'bold'
                            }}>
                                {region}: {progressMapping[progress as keyof typeof progressMapping]}
                            </span>
                        </li>
                    ))}
                </ul>

            </div>
        </div>
    );
};

export default IndexPage;