/* eslint no-console: 0 */
//please install npm i msnodesqlv8
const sql = require('msnodesqlv8')

const RESOURCEID = 101570
const LANGID = 2

// const chatbot_data = require('./keys.max_6_en.js.json')
// const chatbot_data = require('./keys.lexi_2_en.js.json')

// const chatbot_data = require('./keys.maxsa_1_en.js.json')

// const chatbot_data = require('./keys.max_6_sp.js.json')
// const chatbot_data = require('./keys.lexi_2_sp.js.json')

// const chatbot_data = require('./keys.max_6_ar.js.json')
const chatbot_data = require('./keys.lexi_2_ar.js.json')

connectionString = 'Driver={SQL Server Native Client 11.0}; Server=fx-db-dev,2555; Database=Content_FXNET; Trusted_Connection=Yes;'

const  config = {
    conn_str: connectionString,
    // server:'fx-db-dev',
    // port:2555,
    // database:'Content_FXNET',
    // driver: 'msnodesqlv8',
    // options: {
    //     trustedConnection: true,
    //     // enableArithAbort: false
    // }
}

const escapequote = /'/g

sql.open(config.conn_str, function(err, cnn){
    if (err) {
        console.log(`failed to open ${err.message}`)
      }

    // cnn.query('select top 10 ContentID,	BrokerID,	LangID,	ResourceID,	ContentKey,	TagId,	ContentValue from Content.ContentsData where ResourceID = 101610 and Deleted <> 1', function(err, results, more){
    //     console.log(results)
    // })

    /* eslint quotes: 0 */
    let inserts = chatbot_data.map(d=>
        "INSERT INTO [Content].[ContentsData]" + 
        " ([BrokerID]" + 
        ", [LangID]" + 
        ", [ResourceID]" + 
        ", [ContentKey]" + 
        ", [TagId]" + 
        ", [ContentValue]" + 
        ", [TimeStamp]" + 
        ", [UploadUserName]" +         
        ", [Reference]" + 
        ", [Deleted])" + 
  "VALUES" + 
        " (999" + 
        ", " + LANGID + 
        ", " + RESOURCEID +
        ", '" + d.k +"'" + 
        ", 0" + 
        ", '" + d.s.replace(escapequote, "''") + "'" + 
        ", getdate()" + 
        ", 'livius'" + 
        ", '414275'" + 
        ", 0)"
    )

    inserts.forEach((q, idx) => {
        if(false){
        if(q.indexOf('#_msg_33_0') >= 0)//(idx === 0)
           console.log(q)
        }else{
         cnn.query(q, (err,res) => {
            if(err){
                console.error(q)
                throw err
            }
            
            console.info(idx)
         })
        }
    })
})