// /*
// *爬虫升级版  获取cnode社区首页的帖子列表并获取到每个帖子的第一条评论以及评论的用户和他的积分
// */

const cheerio = require('cheerio')
const eventproxy = require('eventproxy')
const superagent = require('superagent')

const url = require('url')
const ep = new eventproxy()
const cnodeUrl = 'https://cnodejs.org'

const crawlerData = {}

superagent.get(cnodeUrl)
    .end((err,res) => {
        if(err){
            console.error(err)
        }
        let $ = cheerio.load(res.text)
        let IndexTitle = $('.topic_title')
        let indexHrefArr = []
        let userHrefArr = []
        IndexTitle.each((tId,title) => {
            let $title = $(title)
            if(tId > 37){
                indexHrefArr.push(url.resolve(cnodeUrl,$title.attr('href')))
            }
        })

        ep.after('index_html',indexHrefArr.length,(lists) => {
            lists.forEach((list,lId)=>{
                let $ = cheerio.load(list[1])                
                let title = $('.topic_full_title').text().trim()
                let commentLen = $('.reply_content').length
                let comment1 = commentLen >0 ? $('.reply_content').eq(0).find('p').text().trim():''
                let user = commentLen >0 ? $('.reply_author').eq(0).text().trim():''
                let userHref = commentLen >0 ?url.resolve(cnodeUrl,$('.user_avatar').eq(0).attr('href')) :''
                userHrefArr.push(userHref);
                crawlerData[lId]={
                    id:lId,
                    title:title,
                    href:list[0],
                    comment:comment1,                    
                    user:user
                }
            })
            ep.after('user_score',userHrefArr.length,(data) => {
                console.log(data)
                
                data.forEach((scoreObj) => {
                    let hId = scoreObj[0]
                    let score = scoreObj[1]
                    console.log(hId +','+score)
                    crawlerData[hId].score = score                    
                })
                console.log(crawlerData)

            })    
            userHrefArr.forEach((href,hId) => {
                // console.log(hId+':'+href)
                let score = ''
                let userHref = href.length > 0 ? href :'https://cnodejs.org/user/atian25' 
                superagent.get(userHref)
                    .end((err,res) => {
                        if(err){
                            console.error(err)
                        }                            
                        let $ = cheerio.load(res.text)
                        score = $('.unstyled').find('.big').eq(0).text().trim()
                        // console.log(score)
                        ep.emit('user_score',[hId,score])
                    })

            })
        })

        indexHrefArr.forEach((href) => {
            superagent.get(href)
                .end((err,res) => {
                    if(err){
                        console.error(err)
                    }
                    ep.emit('index_html',[href,res.text])                    
                })
        })
    })
