//thông số yêu cầu cho file

import React , {useState, useEffect} from "react"

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';


const headername = ['user_id_orginal','item_id_orginal','time','lat','lon'];

function UploadInfo({
	delimiter, setDelimiter,
	header, setHeader,
	previewData, setPreviewData,
	errorMessage, setErrorMessage,
	selectedFile, setSelectedFile,
	columnsMap, setColumnsMap,
	cacheData, setCacheData
						})
{
	
	const [show, setShow] = useState(false); //show mapping board for matching columns after choose file
	
	const delimiterValid = (delimiter)=>{
		if (selectedFile){
			const lines = cacheData;
			const nocols = lines[0].split(delimiter).length;
			if (nocols<3){
				setErrorMessage({error:'Number of columns must >= 3!!',variant:'danger'});
				return;
			}
			
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
		
	}

	return (
		<Container>
			<Row>
				<Col>
					{// Check delimiter
					}
					<div className='py-2'>
						<label htmlFor = 'delimiter'>Choose the delimiter:
						</label>
						
						<select id="delimiter" onChange = {e=> {
							
							if (e.target.value === 'Manual')
							{
								setShow(true)
							}
							else{
								setDelimiter(e.target.value)
								delimiterValid(e.target.value)
								setShow(false)
							}
								
						}}>
						
						  <option value='	'>tab</option>
						  <option value=','>comma</option>
						  <option value=' '>space</option>
						  <option value='Manual'>Manual</option>
						</select>
					</div>
				</Col>
				
					{show && (
					<Col>
						<input type="text" onBlur = {e=>{
							setDelimiter(e.target.value)
							delimiterValid(e.target.value)
						}}
						onKeyPress={(e)=>{
							if (e.key === 'Enter'){
								setDelimiter(e.target.value)
								delimiterValid(e.target.value)
							}
						}}
						/>
					</Col>
					)}
				
				<Col>
					{// Header check
					}
					<label htmlFor = 'headercheck' >
					<input id = 'headercheck' type= 'checkbox' onChange = {e=>{
						console.log('header new set',e.target.checked)
						console.log('header old set',header)
						setHeader(e.target.checked)
					}}/><b>Header</b>
					</label>
				</Col>
			</Row>
				
			
			{// The required columns
			}
      
    
				{
					previewData &&(
					<>
						<Row>
							<Col><h5>Cột yêu cầu</h5></Col>
							<Col>
								<b>{header?'Tên':'ID'} cột của DS</b>
							</Col>
							{
								!header && <Col><b>Sample</b></Col>
							}
						</Row>
						{
						headername.map((col,id)=><ColumnMapping col={col} id={id}
								previewData ={previewData} setPreviewData ={setPreviewData }
								columnsMap = {columnsMap} setColumnsMap={setColumnsMap}
								header = {header} setHeader = {setHeader} 
								setGlobalerror={setErrorMessage}
							/>)
						}
						<Row>
							<Col>
								
							</Col>
						</Row>
					</>
					)
				}
		</Container>
	)
}

function ColumnMapping({
	setGlobalerror,
	col,id,
	header, setHeader,
	previewData, setPreviewData,
	columnsMap, setColumnsMap
}){
	const [errorMessage, setErrorMessage]=useState(null);
	useEffect(()=>{
		if (errorMessage)
			setTimeout(() => {
				setErrorMessage(null);
			}, 3000)
	},[errorMessage]);
	
	const [sample, setSample] = useState(null);
	
	const handleChangeCol = (e)=> {
		let tmp = columnsMap;
		console.log('col target',e.target.value);
		if (e.target.value>previewData[0].length-1 || e.target.value<0)
		{
			e.target.value='';
			setSample(null);
			setErrorMessage({error:'Your column id out of range!',variant:'danger'});
			return;
		}
		const check = Object.keys(columnsMap).map(key=>{
			if (key != id)
				return columnsMap[key] === e.target.value
			return false
		})
		console.log(check)
		if (check.includes(true))
		{
			setErrorMessage({error:'Your column was used!',variant:'danger'});
			console.log('your column was used', [tmp]);
			if (header)
				e.target.value='';
			return;
		}
		if (e.target.value === 'false' || !e.target.value){
			delete tmp[id];
			setColumnsMap(tmp);
			setSample(null);
			console.log('your column was removed', [tmp]);
			return;
		}
		else{
			tmp[id]=e.target.value;
			setColumnsMap(tmp);
			setSample(previewData[1][e.target.value]['value'])
			console.log('your column map to requirement', [tmp]);
		}
		if (0 in tmp && 1 in tmp && 2 in tmp)
		{
			setGlobalerror({error:'Cool to upload now!',variant:'success'});
		}
	}
	
	const handleBlur=(e)=>{
		const check = Object.keys(columnsMap).map(key=>{
			if (key != id)
				return columnsMap[key] === e.target.value
			return false
		})
		if (check.includes(true)){
			setSample(null);
			e.target.value='';
		}
	}
	
	return(
	<Row>
		<Col><b>id</b>: {id}	-	<b>name</b>: {col}</Col>
		<Col>
		{
			header ?(
			<>
				<Form.Select size="sm" onChange = {e=>handleChangeCol(e)} defaultValue={columnsMap[id]?columnsMap[id]:false}>
					<option value={false}>Not Selected</option>
					{previewData[0].map((col,id)=><option value={id}>
						id: {id}	-	name: {col.name}
					</option>)}
					
				</Form.Select>
			</>
			) :	(
				<input defaultValue={columnsMap[id]?columnsMap[id]:''} onBlur={handleBlur} onChange = {e=>handleChangeCol(e)} type="number" min="0" max={previewData[0].length-1}></input>
			)
		}
		{
			errorMessage && <Alert variant={errorMessage.variant}>
				{errorMessage.error}
			</Alert>
		}
		</Col>
		{
			!header && <Col>
				{sample}
			</Col>
		}
	</Row>
	);
}

export default UploadInfo;