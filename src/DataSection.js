import {useState, useEffect} from 'react';

import UploadModal from './components/DataUpload';
import DataProcessing from './components/DataProcessing';
import InfoSection from './components/DataInfoSection';
import DataFolders from './components/DataFolders';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Alert from 'react-bootstrap/Alert';


function DataSection(){
	const [info, setInfo] = useState(null);
	const [currentDS, setCurrentDS] = useState(null);
	const [errMsg, setErrMsg] = useState(null);
	
	const handleExit=()=>{
		setInfo(null);
		setCurrentDS(null);
	};
	return (
	<div className='row'>
		<div className = 'mainboard border border-secondary rounded p-2 m-md-1 my-1 col-md-9 col-xs'>
		{
			!currentDS ? (
			<>
				<UploadModal 
					setCurrentDS={setCurrentDS}
					setInfo={setInfo}
				/>
				<DataFolders 
				info={info} setInfo={setInfo}
				currentDS={currentDS} setCurrentDS={setCurrentDS}
				setErrMsg = {setErrMsg}
				/>
			</>
			) : (
			<>
				<Row>
					<Col>
						<Button variant="dark" onClick={handleExit}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-left-fill" viewBox="0 0 16 16">
						  <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
						</svg> Back to dashboard
						</Button>
					</Col>
				</Row>
				
				<Breadcrumb data-bs-theme="dark" >
				  <Breadcrumb.Item title='The current stage of your file'>{+currentDS.currentstage.no+1}</Breadcrumb.Item>
				  <Breadcrumb.Item title='The name of your stage'>
					{currentDS.currentstage.name}
				  </Breadcrumb.Item>
				  <Breadcrumb.Item title='The current selected file' active>{currentDS.savedname}</Breadcrumb.Item>
				</Breadcrumb>
				<p className='m-2'>{currentDS.name}</p>
				<i className='mt-2'>Show 10 rows from dataframe</i>
				<Table bordered hover variant='dark' responsive striped dangerouslySetInnerHTML={{ __html: currentDS.html }}/>
				<DataProcessing
					info={info} setInfo={setInfo}
					currentDS={currentDS} setCurrentDS={setCurrentDS}
					setErrMsg = {setErrMsg}
				/>
			</>
			)
		}
		</div>
		<div className = 'infoboard border border-secondary rounded p-2 m-md-1 my-1 col-md col-xs' style={{minHeight: '300px'}}>
			{currentDS&&<Alert variant='info'>Stage {currentDS.currentstage.no+1} - {currentDS.currentstage.name} - is already loaded!</Alert>}
			<InfoSection
				info={info} setInfo={setInfo}
				currentDS={currentDS} setCurrentDS={setCurrentDS}
				errMsg = {errMsg} setErrMsg = {setErrMsg}
			/>
		</div>
		
	</div>
		
	)
}



export default DataSection