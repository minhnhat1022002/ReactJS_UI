import React, {useState, useEffect} from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import Home from './Home';
import Navbar from 'react-bootstrap/Navbar';


function App() {
	
	return(
		<BrowserRouter style={{height:'100vh'}}>
			<Routes>
				<Route path="/*" element={<Home/>} />
				<Route path="/login/*" element={<LoginPage/>} />
				<Route path="/register/*" element={<Register/>} />
				<Route element={NotFound} />
			</Routes>
		</BrowserRouter>	
	);
}

function LoginPage(){
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const logInUser = (event) => {
		const form = event.currentTarget;
		event.preventDefault(); //ngan khong cho refresh
		if (form.checkValidity() === false) {
		  event.stopPropagation();
		  return;
		}
		async function tmpF(){
			const res = await fetch("/login", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials:'include',
				body: JSON.stringify({
					email: email,
					password: password
				})
			})
			return res	
		}
		tmpF().then(res=>{
			if (res.ok){
				console.log(res.status);
				window.location.href = "/"; // chuyen ve route chinh neu thanh cong
			}
			else {
				if (res.status === 401)
					alert("Invalid credentials");
				else{
					const text = res.text();
					console.log(text);
				}
			}
		})
		
	};
	return (
	<div className='container col-lg-6 col-m-12'>
		<h3>Login</h3>
		<Form noValidate onSubmit={logInUser}>
			<Form.Group className="mb-3" controlId="formGroupEmail">
			<Form.Label>Email address</Form.Label>
			<Form.Control required type="email" placeholder="Enter email" autoComplete='username' onChange={(e) => setEmail(e.target.value)}/>
			</Form.Group>
			
			<Form.Group className="mb-3" controlId="formGroupPassword">
			<Form.Label>Password</Form.Label>
			<Form.Control required type="password" placeholder="Password" autoComplete='current-password' onChange={(e) => setPassword(e.target.value)}/>
			</Form.Group>
			<Button variant="primary" type="submit" >
				Log me in
			</Button>
		</Form>
		
		<div className='mt-2'>
		   <a href="/register">
				<p>I don't have account</p>
			</a>
		</div>
	</div>
	)
}

function Register(){
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const registerUser = async (event) => {
		const form = event.currentTarget;
		if (form.checkValidity() === false) {
		  event.preventDefault();
		  event.stopPropagation();
		  return;
		}
		
		await fetch("/register",  {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials:'include',
			body: JSON.stringify({
				email: email,
				password: password
			})
		})
		.then(res=>{
			if (res.ok)
				window.location.href = "/";
		})
		.catch (error =>{
			if (error.response.status === 401) {
			alert("Invalid credentials");
			}
			console.log(error);
			}
		);
	};
	return(
	<div className='container col-lg-6 col-m-12'>
		<h3>Signup</h3>
		<Form onSubmit={registerUser}>
			<Form.Group className="mb-3" controlId="formGroupEmail">
			<Form.Label>Email address</Form.Label>
			<Form.Control required type="email" placeholder="Enter email" autoComplete='username' onChange={(e) => setEmail(e.target.value)}/>
			</Form.Group>
			
			<Form.Group className="mb-3" controlId="formGroupPassword">
			<Form.Label>Password</Form.Label>
			<Form.Control required type="password" placeholder="Password" autoComplete='current-password' onChange={(e) => setPassword(e.target.value)}/>
			</Form.Group>
			<Button variant="primary" type="submit">
				Signup
			</Button>
		</Form>
		
		<div className='mt-2'>
			<a href="/login">
              <p>I have an account</p>
            </a>
        </div>
	</div>
	)
};

function NotFound(){
	return (
		<div>
		  <h1>404 not found</h1>
		</div>
	);
}


export default App;
