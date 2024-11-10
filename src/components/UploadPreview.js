//preview dataset

import React, {useState , useEffect} from 'react';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';

const SIZE_LIMIT= 400;

export default function Preview({
						header, delimiter,
						selectedFile, setSelectedFile,
						errorMessage, setErrorMessage,
						previewData, setPreviewData,
						columnsMap, setColumnsMap,
						cacheData, setCacheData
						}) {	
	
	
	
	const previewUpdate = (lines)=>{
		let columns = []
		// Parse the data into an array of objects
		const parsedData = lines.map((line, index) => {
			let values = line.split(delimiter);
			
			if (index === 0 && header === true) {
			  // Assuming comma-separated values (CSV)
			  
			  return values.map(column => {
				  columns.push(column)
				  return { name: column }
				  });
			} else {
				
			  return values.map((column, i) => ({ name: header ? columns[i] : i, value: values[i] }));
			}
		});
		
		console.log('previewdata: ',parsedData)
		console.log('columns: ',columns)
		
		setPreviewData(parsedData);
		return columns
	}
	
	const delimiterValid = (lines)=>{
		
		const nocols = lines[0].split(delimiter).length;
		
		lines.some((line,id)=>{
			const nocolsnow = line.split(delimiter).length;
			if (id===lines.length-1){
				setErrorMessage({error:'Your delimiter is valid',variant:'success'});
				return id===lines.length-1;
			}
				
			if (nocolsnow !== nocols)
			{
				setErrorMessage({error:'Your delimiter will create unexpected empty cell',variant:'warning'});
				return nocolsnow !== nocols;
			}
		});
	}
	
	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (!file) {
			// setSelectedFile(null);
			// setPreviewData(null);
			// setErrorMessage(null);
			return;
		}

		if (!file.type.startsWith('text/')) {
			setErrorMessage({error:'Please select a text file (CSV, TSV, TXT, etc.). Your file should be able to understand when showing it in raw text by notepad,...',variant:'danger'});
			setSelectedFile(null);
			setPreviewData(null);
			return;
		}
		if (file.size > SIZE_LIMIT * 1000 * 1024)
		{
			setSelectedFile(null);
			setPreviewData(null);
			setErrorMessage({error:`File size should be smaller than ${SIZE_LIMIT}MB`,variant:'danger'});
			return;
		}
		setColumnsMap({});
		setSelectedFile(file);
		
		// Use FileReader to preview the first 10 rows
		const reader = new FileReader();
		reader.readAsText(file);
		reader.onload = (event) => {
			const content = event.target.result;
			const lines = content.split('\n').slice(0,11);
			
			delimiterValid(lines);
			setCacheData(lines);
			previewUpdate(lines)
		};
		reader.onerror = (error) => {
		  setErrorMessage({error:'Error reading the file.',variant:'danger'});
		  setSelectedFile(null);
		  setPreviewData(null);
		};
	};
	
	
	useEffect(()=>{
		console.log('delimiter changed: ',[delimiter]);
		if (previewData){
			previewUpdate(cacheData);
		}
	},[delimiter,header]);
	
	useEffect(()=>{
		if (previewData){
			setErrorMessage({error:'Validating your delimiter...',variant:'info'});
		}
	},[delimiter]);
	
	
	useEffect(()=>{
		if(selectedFile)
			setErrorMessage({error:'Loading your file and validating your delimiter...',variant:'info'});
	},[selectedFile]);
	
	return (
	<div>
		<input type="file" onChange={handleFileChange} />	
		{previewData && <Previewsection header={header} displayData = {previewData}/>}

	</div>
	);
}


function Previewsection({header, displayData}) {
	
	return (
	<>
		<p className='d-flex'><Alert variant={displayData[0].length<3?'danger':'success'}>
		Number of columns: <b>{displayData[0].length}</b> {displayData[0].length<3?'. It must be 3 at least!!':'. Cool!'}
		</Alert></p>
		<div style={{
			height: '300px',
			overflowX: 'scroll',
			overflowY: 'scroll',
		}}>
			<Table size='sm' bordered hover variant='dark' striped="columns">
				<TableHead columns={header ? displayData[0]: [...Array(displayData[0].length).keys().map(e=>{return{name:'placeholderID: '+e}})]} />
				
				<TableBody datas = {header ? displayData.slice(1): displayData.slice(0,10)} />
			</Table>
		</div>
	</>
  );
}
function TableHead({columns}){
	return (
	
		<thead className='table-active'>
			<tr>
			{
				columns && (columns.map((col,id) => {
					return <th key={id}>{[col.name]}</th>
				}))
			}
			</tr>
		</thead>
		
	)
}

function TableBody({datas}){
	return (
	<tbody>
		
		{datas && 
			(datas.map((row, id) =>{
				return (
				<tr key = {id}>
					{
						Object.values(row).map((col,id) => {
							return <td key={id} value={[col.value]}>
							{[col.value]}
							</td>;
						})
					}
				</tr>
				)
			}))
			
			
		}
	</tbody>
	)
}



