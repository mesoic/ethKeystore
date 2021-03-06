/*
	package: ethKeystore
	license: MIT
	author: mesoic@github
*/

/*
	Ethereum (ethereumjs-wallet@1.0.1)
*/
const Wallet = require('ethereumjs-wallet')
var EthUtil = require('ethereumjs-util');
let bip39 = require("bip39");

/*
	UI interaction
*/
const prompt = require('prompt');
const fs = require('fs');

/*
	Security
*/
const clipboardy = require('clipboardy');

class generateEthKeystore {

	constructor(_path = "./keystore/") {

		/*
			Inform user of the dangers
		*/
		console.log( "\n WARNING: manipulating plain text private keys is DANGEROUS. \n")
		console.log( " Before continuing, REVIEW the source code of this file in detail.")
		console.log( " ALWAYS work with your keys in OFFLINE mode on ENCRYPTED filesystems.")
		console.log( " VERIFY that all networking hardware has been PHYSICALLY disconnected.")
		console.log( " before proceeding. \n")		

		/*
			Path to save generated keystore files
		*/
		this.path = _path
	}

	/*
		Generate keystore file from private key
	*/	
	fromPrivateKey() {

		let keystoreFromPrivateKey = async (_private, _passwd ) => {
		
			/*
				Initialize private key. Note "Wallet.default" for ethereumjs-wallet@1.0.1^
			*/
			const privateKeyBuffer = EthUtil.toBuffer(_private);

			const wallet = Wallet.default.fromPrivateKey(privateKeyBuffer);
			
			const address = wallet.getAddressString();

			/*
				We need the async block because of this function
			*/
			const json = await wallet.toV3String(_passwd)
		
			fs.writeFile(  this.path + address + ".json" , json, (err) => {
				if (err) {
					throw err;
				}
				console.log( "OK: " + address )
			})
		}	

		/*
			Create a schema for user entry 
		*/
		var schema = {
			
			properties: {
			
				private : { description: 'PASTE your private key', hidden: true, required: true },

				passwd 	: { description: 'ENTER your password', hidden: true, required: true },

				verify 	: { description: 'RE-ENTER your password', hidden: true, required: true }
			}
		};

		/*
			Start prompt. The user inputs desired private key, followed by password
		*/
		prompt.start();

		prompt.get(schema, function (err, result) {

			if (err) { return onErr(err); }

			/*
				Check to see if password is correct
			*/
			if ( result.passwd == result.verify ){

				console.log( "OK: generating keystore")

				keystoreFromPrivateKey( result.private, result.passwd );

				/*
					Clear private key from clipboard
				*/
				clipboardy.writeSync(" ");
			}

			else {
				console.log( "ERROR: passwords do not match ... exiting.")
			}

		});

		function onErr(err) {
			console.log(err);
			return 1;
		}
	}

	/*
		Generate keystore files from mnemonic phrase
	*/	
	fromMnemonic() {

		let keystoreFromMnemonic = async ( _mnemonic, _passwd, _index = 0, _hdpath = "m/44'/60'/0'/0/") => {
		
			let hdwallet = Wallet.hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(_mnemonic));

			let hdpath = _hdpath;

			let wallet = hdwallet.derivePath(_hdpath + _index).getWallet();

			const address = wallet.getAddressString();

			/*
				We need the async block because of this function
			*/
			const keystore = await wallet.toV3String(_passwd)
			
			fs.writeFile(  this.path + address + ".json" , keystore, (err) => {
		
				if (err) {
					throw err;
				}
				console.log( "OK: " + address )
			})
		}	

		let hexstoreFromMnemonic = async ( _mnemonic, _passwd, _index = 0, _hdpath = "m/44'/60'/0'/0/") => {
			
			let hdwallet = Wallet.hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(_mnemonic));

			let hdpath = _hdpath;

			let wallet = hdwallet.derivePath(_hdpath + _index).getWallet();

			const address = wallet.getAddressString();

			const hexstore = Buffer.from(JSON.stringify({

				"secret" : wallet.getPrivateKeyString()
			}));


			fs.writeFile(  this.path + address + "-hex.json" , hexstore, (err) => {
		
				if (err) {
					throw err;
				}
				console.log( "OK: " + address )
			})
		}

		/*
			Create a schema for user entry 
		*/
		var schema = {
			
			properties: {
			
				output 	: { description : 'Select output format \n\t (1) v3-keystore \n\t (2) hexadecimal', required: true },

				mnemonic : { description : 'PASTE your mnemonic', hidden : true, required: true },

				index 	: { description : 'ENTER wallet index', hidden : false, required: true },

				hdpath 	: { description : 'ENTER wallet hdpath \n\t default m/44\'/60\'/0\'/0/', hidden : false, required : false },
		
				// only ask for password if we are building a v3-keystore
				passwd 	: { 

					description : 'ENTER your password', 

					hidden: true, 

					required: true,
					
					ask: function() {
						
						return prompt.history('output').value == "1";

					}
				},


				verify 	: { 

					description : 'RE-ENTER your password', 

					hidden: true, 

					required: true,
					
					// only ask for password if we are building a v3
					ask: function() {
						
						return prompt.history('output').value == "1";
					}
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
				v3 from mnemonic mode
			*/
			if ( result.output == "1") {

				if ( result.passwd == result.verify ){

					console.log( "OK: generating keystore")

					if ( result.hdpath == "" ) {

						console.log( "OK: hdpath default \"m/44\'/60\'/0\'/0/\" ")
							
						keystoreFromMnemonic ( result.mnemonic, result.passwd, result.index );
					}

					else {

						console.log( "OK: hdpath \"" + result.hdpath + "\"")
							
						keystoreFromMnemonic ( result.mnemonic, result.passwd, result.index, result.hdpath );
					}
				}

				else {

					console.log( "ERROR: passwords do not match ... exiting.")
				}
			}

			/*
				hexadecimal from mnemonic mode
			*/
			if ( result.output == "2") {

				if ( result.hdpath == "" ) {

					console.log( "OK: hdpath default \"m/44\'/60\'/0\'/0/\" ")
					
					hexstoreFromMnemonic ( result.mnemonic, result.passwd, result.index );
					}
				
				else {
							
					hexstoreFromMnemonic ( result.mnemonic, result.passwd, result.index, result.hdpath );
				}
			}

			/*
				Clear mnemonic from clipboard
			*/
			clipboardy.writeSync("");

		});

		function onErr(err) {
			console.log(err);
			return 1;
		}
	}
}

module.exports = generateEthKeystore
