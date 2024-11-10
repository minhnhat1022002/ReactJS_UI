import {useState, useEffect} from 'react';

import Card from 'react-bootstrap/Card';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import Badge from 'react-bootstrap/Badge';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Placeholder from 'react-bootstrap/Placeholder';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';

export default function Folders({
	info, setInfo,
	currentDS, setCurrentDS,
	setErrMsg
	}){
	const [filelist, setFilelist] = useState(null);
	const [act, setAct] = useState(true);
	
	useEffect(()=>{
		fetch('/api/checkfile')
		.then(res=>{
			if (res.ok){
				console.log(res);
				return res.json()
			}
			throw new Error();
		})
		.then(json=>{
			setFilelist(json)
		})
		.catch(e=>{
			console.log(e);
		})
	},[act]);
	return(
	<>
	{
		!filelist ? <FileLoading/> : <Tab.Container>
			<Nav variant="tabs" data-bs-theme='dark'>
			{
				filelist.map((folders,id)=>
					<Nav.Item>
						<Nav.Link eventKey={folders[0]} disabled= {folders[1].length+folders[2].length===0}>
							{folders[0]} <Badge pill bg="danger">
							{folders[1].length+folders[2].length}
							</Badge>
						</Nav.Link>
					</Nav.Item>
				)
				
			}
			</Nav>			
			<Tab.Content>
			{
				filelist.map((folders,id)=><FFs folders={folders} id={id}
				info={info} setInfo={setInfo}
				currentDS={currentDS} setCurrentDS={setCurrentDS}
				setErrMsg = {setErrMsg}
				act={act} setAct={setAct}
				/>)
			}
			</Tab.Content>
			
		</Tab.Container>
		
	}
	</>	
	)
}

function FFs({folders,id,
	info, setInfo,
	currentDS, setCurrentDS,
	setErrMsg,
	act, setAct
}){
	
	return(
	<Tab.Pane eventKey={folders[0]}>
		<div className='rounded p-2 m-2 border border-secondary'>
		{
			//Chi active khi co file hoac folder
		}
			{folders[1].length+folders[2].length>0 && <div className="justify-content-center"
			style={{height: '350px',
				overflowX: 'hidden',
				overflowY: 'scroll'
			}}
			>
				<Row xs={3} sm={4} xl={6} >
				{
					folders[1].map(folder=><File folder={folder} stagename = {folders[0]}
							info={info} setInfo={setInfo} id={id}
							currentDS={currentDS} setCurrentDS={setCurrentDS}
							setErrMsg = {setErrMsg} folders ={folders[1]}
							act={act} setAct={setAct}
						/>)
				}
				</Row>
			</div>
			}
		</div>
	</Tab.Pane>
	)
}

const actiondrop=[
	{name:'Export', api:'/api/exportfile'},
	{name:'Delete', api:'/api/delete'}
]

function File({
	folder, stagename, id,
	info, setInfo,
	currentDS, setCurrentDS,
	setErrMsg, folders,
	act, setAct
}){
	const [clicked, setClicked] = useState(false);
	
	const filename = folder;
	const handleExport = ()=>{
		const url = '/api/exportfile/'+stagename+'/'+filename;
		window.open(url,'_blank');
	}
	
	const handleDelete = ()=>{
		fetch('/api/delete/'+stagename+'/'+filename)
		.then(res=>{
			if (res.ok){
				setAct(!act);
				setClicked(false);
			}
			else
				throw new Error('Dont know why this file cant be deleted...');
		})
		.catch(e=>console.log(e));
	}
	
	
	const loadFile = ()=>{
		const filename = folder
		console.log(stagename)
		fetch('/api/loadfile/'+stagename+'/'+id+'/'+filename)
		.then(res=>{
			if (res.ok)
				return res.json();
			throw new Error('Dont know why this file cant be loaded...');
		})
		.then(json=>{
			setCurrentDS(json.rootdf);
			setInfo(json.stagesinfo);
			console.log(json.stagesinfo)
			setClicked(false);
		})
		.catch(e=>{
			console.log(e)
			setClicked(false);
			setErrMsg({error:'Something went wrong! Your file cannot be loaded to our system',variant:'danger'});
		});
	};
	
	return (
	<Col className='mb-2'>
		
		<Card style={{ cursor: "pointer" }}
		bg='dark' text='light' border="secondary">
			<div onClick={()=>setClicked('Opening...')}>
				<Card.Img variant="top" src="/logo512.png" onClick={loadFile}/>
				{	
					clicked && (<div>
					<Spinner animation="border" variant="secondary" size='sm'/> {clicked}
					</div>)
				}
			</div>
			<Card.Header>
				<div onClick={()=>setClicked('Opening...')} className='m-0 p-0'>
					<p className='m-0 p-0' onClick={loadFile}>{folder}</p>
						
				</div>
			</Card.Header>
			<Card.Body className=' m-0 p-0'>
			
				<div className='d-flex flex-row-reverse'>
					
					<div onClick={()=>setClicked('Deleting...')} >
					<Button variant='dark' onClick={handleDelete} title='Delete'>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
						  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
						</svg>
					</Button>
					</div>
					
					<Button variant='dark' onClick={handleExport} title='Export'>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
						  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
						  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
						</svg>
					</Button>
				</div>
				
			</Card.Body>
		</Card>
	</Col>
	);
}

function FileLoading(){
	return(<>
	<Nav variant="tabs" data-bs-theme='dark' activeKey='placeholder'>
		<Nav.Item>
			<Nav.Link eventKey='placeholder'  style={{width:'100px'}}>
				<Placeholder as="p" animation="glow">
					<Placeholder xs={12}/>
				</Placeholder>
			</Nav.Link>
		</Nav.Item>
	</Nav>	
	<div className='rounded p-2 m-2 border border-secondary'>
		<div className="justify-content-center"
		style={{height: '350px',
			overflowX: 'hidden',
			overflowY: 'scroll'
		}}
		>
			<Row xs={3} sm={4} xl={6} >
				<Col className='mb-2'>
				<Card bg='dark' text='light' border="secondary" style={{ height: '300px' }}>
					<Card.Img variant="top" src="logo512.png" />
					<Card.Body>
					  <Placeholder as={Card.Title} animation="glow">
						<Placeholder xs={6} />
					  </Placeholder>
					  <Placeholder as={Card.Text} animation="glow">
						<Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
						<Placeholder xs={6} /> <Placeholder xs={8} />
					  </Placeholder>
					</Card.Body>
				</Card>
				</Col>
			</Row>
		</div>
	</div>
	</>
	)
}