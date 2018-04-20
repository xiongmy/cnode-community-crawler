const express = require('express');
const utility = require('utility');

const app = express();
app.get('/',function(req,res){
    if(req.query.n){
        let user = req.query.n;
        let userBase64 = utility.sha1(user);
        res.send(userBase64);
    }else{
        res.send('hello world');
    }
    
})
app.listen(3000,function(){
    console.log('app is running at port 3000');
})