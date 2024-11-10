//modal cho nút import

import React , {useState, useEffect} from "react"

import Preview from './UploadPreview';
import UploadInfo from './UploadInfo';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';



function UploadModal({setCurrentDS, setInfo}) {
	// state variables
	const [selectedFile, setSelectedFile] = useState(null);
	const [errorMessage, setErrorMessage] = useState(null);
	const [previewData, setPreviewData] = useState(null);
	
	// file properties variables
	const [header, setHeader] = useState(false);
	const [columnsMap, setColumnsMap] = useState({});
	const [delimiter, setDelimiter] = useState('	');
	const [cacheData, setCacheData] = useState(null);
	
	const [uploadclick,setUploadclick] = useState(false);
	const handleUpload = ()=>{
		setUploadclick(true);
	}
	
	const controller = new AbortController(); //dung de huy request 
	const signal = controller.signal;
	useEffect(() => {
		if(!uploadclick)
			return;
		if (!selectedFile) {
			setErrorMessage({error:'Please select a file to upload.',variant:'danger'});
			setUploadclick(false);
			return;
		}
		console.log('map checking ',(0 in columnsMap && 1 in columnsMap && 2 in columnsMap))
		if (!(0 in columnsMap && 1 in columnsMap && 2 in columnsMap))
		{
			setErrorMessage({error:'The required columns is missed. Match them to your columns!',variant:'danger'});
			setUploadclick(false);
			return;
		}
		if (errorMessage.variant==='danger')
		{
			setErrorMessage({error:'Your file seems not valid. Please check again!',variant:'danger'});
			setUploadclick(false);
			return;
		}
		
		console.log('handle upload access successfully')
		// Assuming you have an API endpoint for upload (replace with your actual logic)
		const formData = new FormData();
		
		formData.append('file', selectedFile);
		
		formData.append('columnsmap', JSON.stringify(columnsMap));
		
		formData.append('delimiter', delimiter);
		
		formData.append('header', header);
		
		
		
		fetch('/api/upload', {
			method: 'POST',
			body: formData,
			signal: signal
		})
		.then((res)=>{
			if (res.ok){
				return res.json();
			}
			else
				throw new Error('File cannot be upload somehow....');
		})
		.then(json=>{
			console.log(json);
			setCurrentDS(json.rootinfo);
			setInfo(json.stagesinfo);
			setUploadclick(false);
			setShow(false);
		})
		.catch((err) => {
			if ('name' in err && err.name === 'AbortError') {
				console.error(err.name);
				setErrorMessage({error:'Upload stopped!',variant:'info'});
			}
			else{
				console.log(err);
				setErrorMessage({error:err.message,variant:'warn'});
			}
			setUploadclick(false);
			
		});
		return () => {
			// Cancel the request when the component unmounts
			controller.abort();
		};
	},[uploadclick])
	
	const handleAbort=()=> {
		if (uploadclick){
			controller.abort();
			setUploadclick(!uploadclick);
			console.log('Aborted')
		}
		else
			setShow(!show)
		
	}
	
	const [show,setShow] = useState(false)
	
	const handleModal=()=>{
		if (uploadclick){
			controller.abort();
			console.log('Aborted')
		}
		setShow(!show);
		if (!show)
		{
			setSelectedFile(null);
			setPreviewData(null);
			setErrorMessage(null);
			setHeader(false);
			setColumnsMap({});
		}
	};
    return (
	<div>
		<div className='d-flex flex-row-reverse'>
			<Button title='Import your own dataset to process then train your model' variant="primary" onClick={handleModal}>
				Import
			</Button>
		</div>
		<Modal size="lg" show={show} onHide={handleModal} backdrop='static' data-bs-theme="dark" className='text-light'>
			<Modal.Header closeButton>
			  <Modal.Title>Upload</Modal.Title>
			</Modal.Header>

			<Modal.Body>
			  <p>Tải lên một dataset và chọn ra các thuộc tính(cột)cần dùng.<br/> 
				Tổi thiểu phải có user_orginal_id, item_orginal_id, time.</p>
				{//----------------------Filltheinfo-----------------------
				}
				<UploadInfo header = {header} setHeader={setHeader} 
				delimiter = {delimiter} setDelimiter = {setDelimiter}
				selectedFile = {selectedFile} setSelectedFile = {setSelectedFile}
				errorMessage = {errorMessage} setErrorMessage={setErrorMessage}
				previewData ={previewData} setPreviewData ={setPreviewData }
				columnsMap = {columnsMap} setColumnsMap={setColumnsMap}
				cacheData={cacheData} setCacheData={setCacheData}
				/>
				{//---------------------Errorsection------------------------
				}
				<div className='d-flex'>
				{
					errorMessage && <Alert variant={errorMessage.variant}>
						{errorMessage.error}
					</Alert>
				}
				</div>
				{//------------------------Preview---------------------
				}
				<Preview 
					header = {header} delimiter = {delimiter}
					selectedFile = {selectedFile} setSelectedFile = {setSelectedFile}
					errorMessage = {errorMessage} setErrorMessage={setErrorMessage}
					previewData = {previewData} setPreviewData = {setPreviewData}
					columnsMap = {columnsMap} setColumnsMap={setColumnsMap}
					cacheData={cacheData} setCacheData={setCacheData}
				/>
				
				
			
			</Modal.Body>

			<Modal.Footer>
			  <Button onClick={handleAbort} variant="danger">Cancel</Button>
			  <Button variant="primary" onClick={handleUpload} disabled={uploadclick}>
			  {!uploadclick ? 'Upload' : <>
				Uploading your file, please wait...
				<Spinner
				  as="span"
				  animation="border"
				  size='sm'
				  role="status"
				  aria-hidden="true"
				/>
			  </>}
			  </Button>
			</Modal.Footer>
		</Modal>
	</div>
	);
}

export default UploadModal
