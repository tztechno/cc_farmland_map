import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import * as Papa from 'papaparse';
import GitHubDataLoader from '../components/GitHubDataLoader';
import GoogleSheetDataLoader from '../components/GoogleSheetDataLoader';
interface ProgressData {
    [region: number]: number;
};

const MapComponent = dynamic(() => import('../components/Map'), { ssr: false });
//import { ProgressData } from '../components/Map';

const progressMapping = {
    0: '未散布',
    1: '散布中',
    2: '散布済み',
    3: '散布中止'
};

const colorMapping = {
    0: 'red',
    1: 'orange',
    2: 'blue',
    3: 'gray'
};

const ProgressSelector: React.FC<{
    progressData: ProgressData,
    onProgressUpdate: (newProgressData: ProgressData) => void
}> = ({ progressData, onProgressUpdate }) => {
    const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

    const handleRegionSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRegion(parseInt(event.target.value, 10));
    };

    const handleProgressSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newProgress = parseInt(event.target.value, 10);
        if (selectedRegion !== null) {
            const newProgressData = { ...progressData, [selectedRegion]: newProgress };
            onProgressUpdate(newProgressData);
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <select onChange={handleRegionSelect} value={selectedRegion || ""}>
                <option value="">Select region</option>
                {Object.keys(progressData).map(region => (
                    <option key={region} value={region}>{region}</option>
                ))}
            </select>
            {selectedRegion !== null && (
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
    );
};


const IndexPage: React.FC = () => {
    const [progressData, setProgressData] = useState<ProgressData>({});
    const [dataSource, setDataSource] = useState<'github' | 'googleDrive' | null>(null);
    //const [mapHeight, setMapHeight] = useState('85%');
    //const minBottomHeight = 200;

    const handleProgressUpdate = useCallback((newProgressData: ProgressData) => {
        setProgressData(newProgressData);
    }, []);


    const handleInitialDataLoad = useCallback((data: ProgressData) => {
        setProgressData(prevData => {
            const newData: ProgressData = {};
            for (const [region, progress] of Object.entries(data)) {
                const regionNumber = parseInt(region, 10);
                if (!isNaN(regionNumber) && !isNaN(progress)) {
                    newData[regionNumber] = progress;
                }
            }
            return { ...prevData, ...newData };
        });
    }, []);


    const handleSaveCSV = () => {
        const csvContent = Papa.unparse(
            Object.entries(progressData).map(([region, progress]) => ({
                region: parseInt(region, 10),
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

    const handleUploadCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;

                // ここで Papa.parse を使用してCSVを解析します
                Papa.parse(content, {
                    header: true, // CSVの1行目をヘッダーとして扱う
                    skipEmptyLines: true,
                    complete: (results) => {
                        const newData: ProgressData = {};
                        results.data.forEach((row: any) => {
                            const region = parseInt(row.region, 10);
                            const progress = parseInt(row.progress, 10);
                            if (!isNaN(region) && !isNaN(progress)) {
                                newData[region] = progress;
                            }
                        });

                        // 解析したデータを状態にセットします
                        setProgressData(newData);

                        // Google Drive APIを使用してファイルをアップロードします
                        fetch('https://script.google.com/macros/s/AKfycbzTRUmakmdncy3WYFCFNX-y7biQNBs2nPfMNqAYfUI8RDxT7G-UUBBVM_E6tMRw1cF33Q/exec', {
                            method: 'POST',
                            body: JSON.stringify({ content: content, fileName: file.name }),
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            mode: 'no-cors'
                        })
                            .then(() => {
                                console.log('File uploaded successfully');
                                alert('File uploaded successfully');
                            })
                            .catch(error => {
                                console.error('Error uploading file:', error);
                                alert('Error uploading file');
                            });
                    },
                    error: (error) => {
                        console.error('Error parsing CSV:', error);
                        alert('Error parsing CSV file');
                    }
                });
            };
            reader.readAsText(file);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ width: '90%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
                    <h1>Farmland Map</h1>
                    <div style={{ textAlign: 'right' }}>
                        <input type="file" onChange={handleUploadCSV} accept=".csv" />
                        <div style={{ marginTop: '10px' }}>
                            Send File to <a href="https://drive.google.com/drive/u/0/folders/1Uuwfk6ujh2XpjBYOCJ20B-86UbcKNlSX" target="_blank" rel="noopener noreferrer">GoogleDrive</a>
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <MapComponent
                        onProgressUpdate={handleProgressUpdate}
                        progressData={progressData}
                    />
                </div>
            </div>
            <div style={{ width: '10%', height: '100%', padding: '8px', overflowY: 'auto' }}>
                <div>
                    <button onClick={() => setDataSource('github')}>
                        Load GitHub Data {dataSource === 'github' && '(Selected)'}
                    </button>
                    <button onClick={() => setDataSource('googleDrive')}>
                        Load GoogleDrive Data {dataSource === 'googleDrive' && '(Selected)'}
                    </button>
                </div>

                <div style={{ marginTop: '20px' }}>
                    {dataSource === 'github' && <GitHubDataLoader onDataLoaded={handleInitialDataLoad} />}
                    {dataSource === 'googleDrive' && <GoogleSheetDataLoader onDataLoaded={handleInitialDataLoad} />}
                </div>

                <div style={{ marginTop: '20px' }}>
                    <a href="https://docs.google.com/spreadsheets/d/1oXpWOmPWHfdvuv4uBc0rFcsXBa-9ECWiczDoDFZkUu4/edit?usp=drive_link" target="_blank" rel="noopener noreferrer">Report Progress</a>
                </div>

                <hr />

                <div style={{ marginTop: '20px' }}>
                    <ProgressSelector
                        progressData={progressData}
                        onProgressUpdate={handleProgressUpdate}
                    />
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

                <div style={{ marginTop: '20px' }}>
                    <button onClick={handleSaveCSV}>Save Progress</button>
                </div>

                <hr />

            </div>
        </div>
    );
};

export default IndexPage;
