//bảng thông báo các tiến trình hoặc thông tin khác

import {useState , useEffect} from 'react'
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';

function InfoSection({
	info, setInfo,
	currentDS, setCurrentDS,
	errMsg, setErrMsg
	}){
		
		
	return(
	<>
	{
		info && info.map((stage) => (
		<>
		{
			stage && (
			<>
				<Alert>
					Stage {stage.maindf.currentstage.no+1} - {stage.maindf.currentstage.name}
					<hr/>
					<StageResponse stage = {stage.maindf}/>
				</Alert>
				{
					stage.subdf && stage.subdf.map((sub,id)=><Alert data-bs-theme='dark' variant='secondary' className='mx-2'>
					{sub.name}
						<StageResponse stage = {sub} 
						subinfo={{
							parentname:currentDS.savedname,
							parentstage: stage.maindf.currentstage.no,
							subid: id
							}}/>
					</Alert>
					)
				}
			</>
			)
		}
		</>
		)) 
	}
	{
		errMsg && <Alert variant={errMsg.variant} dismissible onClose={()=>setErrMsg(null)}>
					{errMsg.error}
				</Alert>
	}
	</>
	)
}

const actiondrop=[
	[
		{name:'Export', api:'/api/exportdf'},
		{name:'Export', api:'/api/exportfile'}
	],
	{name:'Delete', api:'/api/delete'}
]

function StageResponse({stage, subinfo}){
	
	const [detail, setDetail] = useState(false);
	
	
	const handleExport=()=>{
		let url = subinfo ? actiondrop[0][0]['api']+'/'+
		subinfo.parentname+'/'+
		subinfo.parentstage+'/'+subinfo.subid : actiondrop[0][1]['api']+'/'+
		stage.currentstage.name+'/'+
		stage.savedname;
		
		window.open(url,'_blank');
	};
	
	const handleDelete= ()=>{
		const stagename = stage.currentstage.name;
		const filename = stage.savedname;
		
		fetch(actiondrop[1]+'/'+stagename+'/'+filename)
		.then(res=>{
			if (res.ok)
				console.log('deleted')
			else
				throw new Error('Dont know why this file cant be deleted...');
		})
		.catch(e=>console.log(e));
	};
	
	return(
	<>
		<NavDropdown menuVariant="dark" >
			<NavDropdown.Item onClick={handleExport}>
			Export
			</NavDropdown.Item>
			
			{
				!subinfo && <NavDropdown.Item onClick={handleDelete}>
					Delete
				</NavDropdown.Item>
			}
			
			<NavDropdown.Item onClick={()=>setDetail(!detail)}>
			Show detail
			</NavDropdown.Item>
		</NavDropdown>
		
		<Offcanvas data-bs-theme='dark' show={detail} onHide={()=>{setDetail(!detail)}} placement='end'>
			<Offcanvas.Header closeButton>
				<Offcanvas.Title>Details</Offcanvas.Title>
			</Offcanvas.Header>
			<Offcanvas.Body>
			{
				!subinfo && (<p>Stage {stage.currentstage.no+1}: {stage.currentstage.name}</p>)
			}
				<br/>Description: {stage.name}
				<Table bordered hover variant='dark' responsive striped dangerouslySetInnerHTML={{ __html: stage.html }}/>
			</Offcanvas.Body>
		</Offcanvas>
	</>
	)
	
}

export default InfoSection;