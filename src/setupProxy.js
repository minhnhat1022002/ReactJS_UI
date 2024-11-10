const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
	app.use(
		createProxyMiddleware({
		target: 'http://localhost:8081',
		changeOrigin: true,
		pathFilter: '/api/exportdf',
		}),
	);
	app.use(
	'/api/exportfile',
	createProxyMiddleware({
	  target: 'http://localhost:8081/api/exportfile',
	  changeOrigin: true,
	})
	);
};