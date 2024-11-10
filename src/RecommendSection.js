import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  APIProvider,
  Map,
  Marker,
  AdvancedMarker,
  MapCameraChangedEvent,
  Pin,
  InfoWindow,
  useMarkerRef,
  useMap
} from '@vis.gl/react-google-maps';

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


type Poi ={ key: string, location: google.maps.LatLngLiteral };
function RecommendSection(){
	const abortControllerRef = useRef(null);
	const [locations, setLocations] = useState(null);
	const [train, setTrain] = useState(null);
	const [trainshow, setTrainshow] = useState(true);
	
	const [test, setTest] = useState(null);
	const [testshow, setTestshow] = useState(true);
	
	const [showup, setShowup] = useState(null);
	const [user,setUser] = useState(0);
	const [top, setTop] = useState(10);
	const [thres, setThres] = useState(10);
	
	const Traintestshow = ()=>{
		fetch('/api/traintest/'+user+'/'+top,
		{
			method: 'GET'
		})
		.then((res)=>{
			if (res.ok){
				
				return res.json()
			}
			else
				throw new Error('File cannot be fetched somehow....');
		})
		.then((json)=>{
			console.log(json)
			const trainresult: Poi[] = json.train
			const testresult: Poi[] = json.test
			// console.log(trainresult)
			console.log(testresult)
			setTrain(trainresult)
			setTest(testresult)
		})
		.catch((err) => {
			console.log(err);
		});
	}
	
	const Test = ()=>{
		fetch('/api/predict/'+user+'/'+top,
		{
			method: 'GET'
		})
		.then((res)=>{
			if (res.ok){
				
				return res.json()
			}
			else
				throw new Error('File cannot be fetched somehow....');
		})
		.then((json)=>{
			console.log(json)
			const result: Poi[] = json.predictresult
			
			setLocations(result)
		})
		.catch((err) => {
			console.log(err);
		});
	};
	
	const handleViewChange = (center)=>{
		const formData = new FormData();
		
		formData.append('lat',center.lat);
		formData.append('lng',center.lng);
		
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			console.log('Request aborted')
		}
		
		const newAbortController = new AbortController();
		abortControllerRef.current = newAbortController;
		
		fetch('/api/getlocation/'+user+'/'+thres, 
		{
			method: 'POST',
			body: formData,
			signal: newAbortController.signal
		})
		.then((res)=>{
			if (res.ok){
				
				return res.json()
			}
			else
				throw new Error('File cannot be fetched somehow....');
		})
		.then((json)=>{
			console.log(json)
			const result: Poi[] = json.predictresult
			console.log(result)
			setShowup(result)
		})
		.catch((err) => {
			console.log(err);
		});
	}
	
	return (
	
	<APIProvider apiKey={''} onLoad={() => console.log('Maps API has loaded.')}>
	   <div className='row'>
		   <div className='col border border-secondary rounded p-2 my-1 m-md-1 col-md-6 col-12 '>
				
				<RecommendButton Test = {Test} locations = {locations}/>
				{' top '}<input type='number' value={top} onChange={(e)=>setTop(e.target.value)}/>{' on User with ID '}<input type='number' value={user} onChange={(e)=>setUser(e.target.value)}/><br/>
				<HistButtonShow Test = {Traintestshow} locations = {locations} train ={train} test={test}/>
				<br/><input type='checkbox' defaultChecked={testshow} onChange={()=>setTestshow(!testshow)}/> Test show
				<br/><input type='checkbox' defaultChecked={trainshow} onChange={()=>setTrainshow(!trainshow)}/> Train show
				<br/>
				{'Show up threshold '}<input type='number' value={thres} onChange={(e)=>setThres(e.target.value)}/><br/>
				
				
				<PriorColor/>
				<div className='row'>
					<div className = 'mainboard border border-secondary rounded p-2 m-md-1 my-1 col-md-11 col-xs'>
					
					
					{
						locations && <div className="justify-content-center"
						style={{height: '350px',
							overflowX: 'hidden',
							overflowY: 'scroll'
						}}
						>
							<Row xs={3} sm={4} xl={6} >
							{
								locations?locations.map((location,id) =>{
									const handleInteract = ()=>{
										fetch('/api/interactionlogging/'+user+'/'+location.key+'/10')
										.then((res)=>{
											if (res.ok){
												
												return res.json()
											}
											else
												throw new Error('File cannot be fetched somehow....');
										})
										.then((json)=>{
											console.log(json)
										})
										.catch((err) => {
											console.log(err);
										});
									}
									return(
									<Col className='mb-2'>
		
										<Card style={{ cursor: "pointer" , backgroundColor:'hsl('+(60+(locations.length - id)*280/locations.length)+',100%,50%'}}
										text='light' >
											<Card.Header>
											{location.key}
											</Card.Header>
											<Card.Body className=' m-0 p-0'>
											
												<div className='d-flex flex-row-reverse'>
													<Button onClick={handleInteract}>Interact</Button>
													
												</div>
												
											</Card.Body>
										</Card>
									</Col>
									)
								}):<FileLoading/>
							}
								
							</Row>
						</div>
						
					}
					</div>
				</div>
		   </div>
			<div className='col border border-secondary rounded p-0 my-1 m-md-1 col-md col-12' style={{minHeight: '400px'}}>
			   <Map
					mapId='DEMO_MAP_ID'
					defaultZoom={13}
					defaultCenter={{ lat: 10.838255020540336, lng: 106.61962058722027 }}
					onCameraChanged={ (ev: MapCameraChangedEvent) =>{
							setTimeout(handleViewChange(ev.detail.center), 1000);
							// console.log(ev.detail.center)
						}
					}
				>
				{locations ? locations.map((location,id) => {
					console.log(location)
					return <PoiMarkers user = {user} top = {top} setLocations = {setLocations} poi={location} prior = {(locations.length - id)*280/locations.length}/>;
				}) : null}
				{showup ? showup.map((n,id) => {
					return <PoiMarkers user = {user} top = {top} setLocations = {setLocations} poi={n} prior = {-59}/>;
				}) : null}
				
				{train&&trainshow ? train.map((n,id) => {
					return <PoiMarkers user = {user} top = {top} setLocations = {setLocations} poi={n} />;
				}) : null}
				
				{test&&testshow ? test.map((n,id) => {
					return <PoiMarkers user = {user} top = {top} setLocations = {setLocations} poi={n} />;
				}) : null}
				
			   </Map>
		   </div>
	   </div>
	</APIProvider>
	
	)
}

const PriorColor = ()=>{
	return(
	<div className='d-flex flex-row bd-highlight'>
	<div 
		style={{ 
		backgroundColor: 'hsl(359,100%,50%)', padding: 20, 
		color: 'white'
		}}>
		Normal marker
	</div>
	{
		Array.from({ length: 10 }).map((nan, id) =>{
			let color = id*280/10
			return<div 
			style={{ 
			backgroundColor: 'hsl('+(60+color)+',100%,50%)', padding: 20, 
			color: 'white'
			}}>
			{id==9 && 'Highest recommended'}
			</div>
		})
	}
		
	</div>
	)
}
const HistButtonShow = ({Test, locations, train, test})=>{
	const map = useMap();
	useEffect(() => {
		if (!map) return;
		
		if (locations && train){
			// map.setCenter(locations[0].location);
			const bounds = new window.google.maps.LatLngBounds();
			locations.map(x =>{
				bounds.extend(x.location)
				return x.id
			});
			train.map(x =>{
				bounds.extend(x.location)
				return x.id
			});
			test.map(x =>{
				bounds.extend(x.location)
				return x.id
			});
			map.fitBounds(bounds)
		}
		
	}, [map,locations]);
	

	return <Button onClick={Test}>Show Train and Test location</Button>
}
const RecommendButton = ({Test, locations})=>{
	const map = useMap();
	useEffect(() => {
		if (!map) return;
		
		if (locations){
			// map.setCenter(locations[0].location);
			const bounds = new window.google.maps.LatLngBounds();
			locations.map(x =>{
				bounds.extend(x.location)
				return x.id
			});
			map.fitBounds(bounds)
		}
	}, [map,locations]);
	

	return <Button onClick={Test}>Recommend</Button>
}
const PoiMarkers = (props: {poi: Poi}) => {
	const [markerRef, marker] = useMarkerRef();
	const [activeMarker, setActiveMarker] = useState(false);

	const handleActiveMarker = () => {
		
		setActiveMarker(!activeMarker);
	};
	const handleInteract = ()=>{
		fetch('/api/interactionlogging/'+props.user+'/'+props.poi.key+'/'+props.top)
		.then((res)=>{
			if (res.ok){
				
				return res.json()
			}
			else
				throw new Error('File cannot be fetched somehow....');
		})
		.then((json)=>{
			console.log(json)
			const result: Poi[] = json.predictresult
			
			props.setLocations(result)
		})
		.catch((err) => {
			console.log(err);
		});
	}
	return (
    <>{/*
		<Marker
			ref={markerRef}
			key={props.poi.key}
			position={props.poi.location}
			onClick={handleActiveMarker}
		>
        </Marker>
		{activeMarker && (
			<InfoWindow anchor={marker}>
				{props.poi.key}
			</InfoWindow>
		)}
		*/}
		<AdvancedMarker
		  ref={markerRef}
          key={props.poi.key}
          position={props.poi.location}
		  onClick={handleActiveMarker}
		>
		{
			props.prior ? <Pin background={'hsl('+(60+props.prior)+',100%, 50%)'} glyphColor={'#000'} borderColor={'#000'} /> : <Pin background={'hsl(100,100%, 100%)'} glyphColor={'#000'} borderColor={'#000'} />
		}
		
			
				
		</AdvancedMarker>
		{activeMarker && (
		<InfoWindow disableAutoPan anchor={marker} >
			<p style={{color: "black"}}>{props.poi.key}</p>
			<Button onClick={handleInteract}>Interact</Button>
		</InfoWindow>
		)}
    </>
	)
};




function FileLoading(){
	return(<>
		
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

export default RecommendSection