/*
	package: ethKeystore
	license: MIT
	author: mesoic@github
*/

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
			description: 'Select input format \n\t (1) mnemonic \n\t (2) hexadecimal',
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
		Mnemonic
	*/
	if ( result.mode == "1" ){

		console.log("\n")
		keygen.fromMnemonic()
	}

	/*
		Private key
	*/ 
	else if ( result.mode == "2" ){
		console.log("\n")
		keygen.fromPrivateKey()
	}


	else {
		console.log( "ERROR: Invalid mode")
	}
});
