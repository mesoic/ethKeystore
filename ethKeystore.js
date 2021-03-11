/*
	Keystore class
*/
const generateEthKeystore = require('./src/generateEthKeystore.js')

/*
	UI interaction
*/
const prompt = require('prompt');

/*
	Initialize keystore class
*/
keygen = new generateEthKeystore()

/*
	Create a schema for user entry 
*/
var schema = {
	
	properties: {
	
		mode : {
			description: 'Select input format \n\t (1) private key \n\t (2) mnemonic',
			required: true
		}
	}
};

/*
	Start prompt. The user inputs desired private key, followed by password
*/
prompt.start();

prompt.get(schema, function (err, result) {

	if (err) { return onErr(err); }

	/*
		Private key
	*/ 
	if ( result.mode == "1" ){
		console.log("\n")
		keygen.fromPrivateKey()
	}

	/*
		Mnemonic
	*/
	else if ( result.mode == "2" ){
		console.log("\n")
		keygen.fromMnemonic()
	}

	else {
		console.log( "ERROR: Invalid mode")
	}
});
