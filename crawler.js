const https = require('https')
const cheerio = require('cheerio')
const fs = require('fs')
const express = require('express')

const app = express();
const url = 'https://cnodejs.org/';

app.get('/',(req,res) => {
    let questions='';
    https.get(url,function(result){
        let html = '';
        result.on('data',function(chunk){
            html += chunk
        });
        result.on('end',function(){
            let $ = cheerio.load(html);
            console.log($("#topic_list .cell").length);
            let questionList = $("#topic_list");
            let questionItem = $("#topic_list .cell");
            questionItem.each((item)=>{
                let title = questionItem.eq(item).find('.topic_title').text();
                let href = questionItem.eq(item).find('.topic_title').attr('href');
                // console.log(title);
                questions += '{<br>id:'+item+1+'<br>title:'+title+'<br>href:'+href+'<br>}<br>';
            })
        res.send(questions);            
        })        
    });
})
app.listen(3000,() => {     
    console.log('app is running at port 3000..');
})
