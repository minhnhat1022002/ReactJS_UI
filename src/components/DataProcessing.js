//các nhiệm vụ xử lý dữ liệu (điền thông số)

import {useState , useEffect} from 'react'

import Button from 'react-bootstrap/Button'; 
import Form from 'react-bootstrap/Form'; 
import Spinner from 'react-bootstrap/Spinner'; 
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const stagelist = [
	{name: 'ksample',api:'/api/sample'},
	{name: 'ncore',api:'/api/ncore'},
	{name: 'mappingid',api:'/api/mappingid'},
	{name: 'split and jaccard',api:'/api/split'}
]



function DataProcessing({
	info, setInfo,
	currentDS, setCurrentDS,
	setErrMsg
}){
	const [stage, setStage] = useState(false);
	const [stageargs, setStageArgs] = useState([
	[
		{valname: 'k', defaultval: 0.01, val:null, title:'Percentage of the root dataset that you get randomly from'},
		{valname:'seed', defaultval: 5, val:null, title:'Random state, or seed, controls the shuffling applied to the data before applying the split. Pass an int for reproducible output across multiple function calls '}
	],
	[
		{valname: 'n', defaultval: 10, val:null, title:'Number of interactions of an item or a user will be detected as outliers when it less than'}
	],
	null,
	[
		{valname:'train', defaultval: 0.5, val:null, title:'Percentage of training set'},
		{valname:'valid', defaultval: 0.3, val:null, title:'Percentage of validation set'},
		{valname:'test', defaultval: 0.2, val:null, title:'Percentage of test set'},
		{valname:'limit', defaultval: 0.25, val:null, title:'The highest Jaccard distance you want to keep'},
		{valname:'numHashTables', defaultval: 1, val:null, title:'Number of hash tables, where increasing number of hash tables lowers the false negative rate, and decreasing it improves the running performance'},
		{valname:'numFeatures', defaultval: 'Default', val:null, title:'Number of features (items)'}
	]
])
	
	const processingTask = ()=>{
		if (stage<0)
			setStage(-stage)
		if (!stage)
			if (currentDS.currentstage.no>0)
				setStage(currentDS.currentstage.no+1)
			else
				setStage(1)
		
	};
	
	
	const controller = new AbortController(); //dung de huy request 
	const signal = controller.signal;
	useEffect(()=>{
		if (stage>0){
			const formData = new FormData();
			formData.append('root',currentDS.savedname);
			stageargs[stage-1] && stageargs[stage-1].map(arg=>{
				formData.append(arg.valname,arg.val?arg.val:arg.defaultval);
			});
			fetch(stagelist[stage-1].api,{
				method: 'POST',
				body: formData,
				signal: signal
			}).then((response) => {
				return response.json()
			})
			.then((json)=>{
				setInfo(json.stagesinfo);
				console.log(json.stagesinfo)
				if (stage === stagelist.length)
					setStage(false)
				else
					setStage(stage+1)
			})
			.catch((err)=> {  
				console.log('Failed to fetch file list: ', err); 
				if ('name' in err && err.name === 'AbortError') {
					console.error(err.name);
					const tmp = stage+1;
					setErrMsg({error:'Stage '+tmp+' stopped!',variant:'warning'});
				}
				else{
					const tmp = stage+1;
					setErrMsg({error:'Stage '+tmp+' failed! Please check if the results of these dataframes is fine. You can do it again with differences arguments.',variant:'danger'});	
				}
				setStage(-stage)
			});
		}
	},[stage]);
	
	const cancelStage=()=>{
		controller.abort();
	}
	
	return (
		<div>
		{
			currentDS.currentstage.no===4 ? <>
			This dataframe was processed at the final stage. You can train it for the model.
			</>:<Container fluid>
				<Row>
					<Col>
					</Col>
					<Col xs={2}><b>Hyperparameter</b>
					</Col>
					<Col ><b>Value</b>
					</Col>
				</Row>
			{
				stageargs.map((stageinfo,id)=>{
					console.log(currentDS.currentstage.no <= id && stageinfo!=null)
					return(
					<>
					{
						currentDS.currentstage.no < id+1 && stageinfo!=null && (
						<>
							<Row>
								<Col>
								<b>Stage {id+2} - {stagelist[id].name}</b>
								</Col>
							</Row>
							{
								stageinfo.map((stagedetail, argid)=>{
									const handleChange=(e)=>{
										let tmp = stageargs;
										if (e.target.value === "")
											tmp[id][argid]['val']=null;
										else
											tmp[id][argid]['val']=e.target.value;
										setStageArgs(tmp);
										console.log(tmp[id][argid])
									}
									return(
									<Row className='my-2'>
										<Col>
										</Col>
										<Col xs={2}>
										<p title={stagedetail.title}>{stagedetail.valname}</p>
										</Col>
										<Col>
										{
											stagedetail.defaultval!='Default' ? <input onChange={handleChange} type="number" placeholder={'default: '+stagedetail.defaultval} /> :<>
												<Form.Select size="sm" onChange = {handleChange} defaultValue={'Default'}>
														<option value={'Default'}>By default</option>
														<option value={true}>Number of items</option>												
												</Form.Select>
											</>
										}
											 
										</Col>
									</Row>
									)
								})
							}
						</>
						)
					}
					</>
					)
				})
			}
			<div className='col d-flex flex-row-reverse mt-2'>
				<Button onClick= {processingTask} disabled={stage>0 || currentDS.currentstage.no===4} >
					{
						stage>0 ? (
						<>
							Processing stage {stage+1} {stagelist[stage-1].name}. . .
							<Spinner
							  as="span"
							  animation="border"
							  size='sm'
							  role="status"
							  aria-hidden="true"
							/>
						</>
						)
						: stage<0?'Process stage '+(-stage+1)+' again!':'Process it!'
					}
				</Button>
				{
					stage>0 && <Button variant='danger' onClick= {cancelStage}>Stop!</Button>
				}
			</div>
			<div className='col d-flex flex-row-reverse mt-2'>
				<DropdownButton
				variant='outline-light'
				title='Start from...'
				disabled={stage>0}>
					{
						currentDS.currentstage.no < 4 && <Dropdown.Item onClick= {()=>(setStage(currentDS.currentstage.no+1))}>scratch - {currentDS.currentstage.no+2}</Dropdown.Item>
					}
					{
						info.map((stageinfo,id)=>{
							return(
							<>
							{
								stageinfo && <Dropdown.Item onClick= {()=>(setStage(id+1))}>stage {id+2}</Dropdown.Item>
							}
							</>
							)
						})
					}
				</DropdownButton>
			</div>
			</Container>
		}
			
			
		</div>
	)
}


export default DataProcessing