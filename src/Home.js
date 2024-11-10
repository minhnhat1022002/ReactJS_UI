import {useState, useEffect} from 'react';
import DataSection from './DataSection';
import RecommendSection from './RecommendSection';

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';

function Home() {
	const [user, setUser] = useState(null);

	const logoutUser = async () => {
		await fetch("/logout",{
			method:'POST',
			credentials:'include'
		})
		.then(res=>{
			console.log('logout ',res)
		});
		window.location.href = "/login";
	};

	useEffect(() => {
		(async () => {
			await fetch("/@me")
			.then(res=>{
				if (res.ok){
					return res.json();
				}
				else
					throw new Error('authentication not work');
			})
			.then(json=>{
				console.log('check authenticated',json);
				setUser({email: json.email, id: json.id});
			})
			.catch(error=>{
				console.log("Not authenticated ",error);
				window.location.href = "/login";
			});
		})();
	}, []);
	return(
	<div className='text-light bg-dark'>
		{user && (
		<>
		<Navbar sticky="top" collapseOnSelect expand="lg" className="bg-body-tertiary" bg="dark" data-bs-theme="dark">
		  <Container>
			<Navbar.Brand>WELCOME BACK!</Navbar.Brand>
			<Navbar.Toggle aria-controls="responsive-navbar-nav" />
			<Navbar.Collapse id="responsive-navbar-nav">
			  <Nav className="me-auto">
				
			  </Nav>
			  <Nav>
				<Nav.Link><b>ID:</b> {user.id}</Nav.Link>
			  </Nav>
			  <Nav>
				<Nav.Link><b>Email:</b> {user.email}</Nav.Link>
			  </Nav>
			  <Nav>
				<Button variant='danger' onClick={logoutUser}>Logout</Button>
			  </Nav>
			</Navbar.Collapse>
		  </Container>
		</Navbar>
		<Container className='text-light bg-dark' fluid>
			<div className='container-fluid'>
			{
			}
				<RecommendSection/>
				<DataSection/>
			</div>
		</Container>
		</>
		)}
	</div>
	)
}

export default Home;