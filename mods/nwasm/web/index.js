const express = require('express'); //Import the express dependency
const app = express();
const port = 5000;

app.use(express.static(__dirname));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
	//server starts listening for any attempts from a client to connect at port: {port}
	console.log(`Now listening on port ${port}`);
});

