'use strict';
var fs = require('fs');

function validateModelName(req,res,next,name){
	if(name.slice(-1)==='s'){
		next();
	} else {
		res.status(404).jsonp({message:'Invalid model name'});
	};
}

function getFiles(dir){
	var files = fs.readdirSync(dir);
	if(files.length){
		files.sort(function(a,b){
			a = parseInt(a);
			b = parseInt(b);
			return a - b;
		});
	}
	return files;
}

function listItems(req,res){
	//console.log(req.params,req.body,req.query);
	var name = req.params.modelName;
	var dir = './data/'+name;
	if(!fs.existsSync(dir)){
		return res.status(404).jsonp({message:'Not Found'});
	}
	var list = [];
	var files = getFiles(dir);
	for (var i=0;i<files.length;i++) {
		list.push(JSON.parse(fs.readFileSync(dir+'/'+files[i])+""));
	};
	res.jsonp(list);
}

function createItem(req,res){
	var name = req.params.modelName;
	var dir = './data/'+name;
	var fileName;
	if(req.body.id){
		return res.status(400).jsonp({message:'You can not have id while creating item'});
	}
	if(!fs.existsSync(dir)){
		fs.mkdirSync(dir);
		fileName = "1.json";
		req.body.id = 1;
	} else {
		var files = getFiles(dir);
		var tmp = parseInt(files[files.length-1]);
		if(!tmp){
			tmp=0
		}
		req.body.id = 1 + tmp;
		fileName = req.body.id + '.json';
	}
	fs.writeFileSync(dir+'/'+fileName, JSON.stringify(req.body));
	res.jsonp(req.body);
}

/*Get items handled by static router. if here its not found*/
function getItem(req,res){
	res.status(404).jsonp({message:'Requested Item not found'});
}

function modifyItem(req,res){
	var name = req.params.modelName;
	var dir = './data/'+name;
	if(!fs.existsSync(dir)){
		return res.status(404).jsonp({message:'Not Found'});
	}

	var id = req.params.id;
	if(req.body.id != req.params.id){
		return res.status(400).jsonp({message:'Invalid Request'});
	}
	req.body.id = req.body.id/1;
	if(fs.existsSync(dir+'/'+id+'.json')){
		fs.writeFileSync(dir+'/'+id+'.json', JSON.stringify(req.body));
		res.jsonp(req.body);
	} else {
		res.status(400).jsonp({message:'No item found with given Id'});
	}
}

function deleteItem(req,res){
	var name = req.params.modelName;
	var dir = './data/'+name;
	if(!fs.existsSync(dir)){
		return res.status(404).jsonp({message:'Not Found'});
	}
	var id = req.params.id;
	if(!id){
		return res.status(400).jsonp({message:'Invalid Request'});
	}
	if(fs.existsSync(dir+'/'+id+'.json')){
		fs.unlinkSync(dir+'/'+id+'.json');
		res.jsonp({success:true});
	} else {
		res.status(400).jsonp({message:'No item found with given Id'});
	}
}


function validateEmail(email) { 
	if(typeof email !== 'string'){
		return false;
	}
	email = email.trim();
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}
function validateEmpty(str){
	if(typeof str !== 'string'){
		return false;
	}
	return !!str;
}
function validateAddress(addr,msgs){
	if(typeof addr !== 'object'){
		msgs.push('Please provide valid address');
		return false;
	}
	var dummy = {street:'',city:'',state:'',zip:''};
	for(var key in addr){
		if(!(key in dummy)){
			delete addr[key];
		} else {
			addr[key] = addr[key].trim();
		}
	}
	if(!validateEmpty(addr.street)){
		msgs.push('Please enter valid street');
	}
	if(!validateEmpty(addr.city)){
		msgs.push('Please enter valid city');
	}
	if(!validateEmpty(addr.state)){
		msgs.push('Please enter valid state');
	}
	if(!validateEmpty(addr.zip)){
		msgs.push('Please enter valid zip');
	}
}

function validateItem(req,res,next){
	var model = req.params.modelName;
	if(model==='customers'){
		var dummy = {name:'',email:'',telephone:'',address:'',id:''};
		var cust = req.body;
		for(var key in cust){
			if(!(key in dummy)){
				delete cust[key];
			} else {
				if(typeof cust[key] === 'string'){
					cust[key]=cust[key].trim();
				}
			}
		}
	}

	var msgs=[];
	if(!validateEmpty(cust.name)){
		msgs.push('Please enter name');
	}
	if(!validateEmail(cust.email)){
		msgs.push('Please valid email');
	}
	if(!validateEmpty(cust.telephone)){
		msgs.push('Please enter telephone');
	}
	validateAddress(cust.address,msgs);

	if(msgs.length){
		return res.status(400).send({error:msgs});
	}
	next();
}

module.exports = function(app) {
	app.route('/:modelName')
		.get(listItems)
		.post(validateItem,createItem);
	app.route('/:modelName/:id')
		.get(getItem)
		.post(validateItem,modifyItem)
		.put(validateItem,modifyItem)
		.delete(deleteItem);
	app.param('modelName',validateModelName);
};