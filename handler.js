const AWS = require('aws-sdk')
const flat = require('flat')
const unflatten = require('flat').unflatten
  

function handler(event, context){
    var reported = event.reported
    var thingname = (event.topic)
    var thingendpoint = "a2w9ms3po56adk-ats.iot.us-west-2.amazonaws.com"
    var params = {
        'thingName': thingname
    }
    if(reported!=null){
        var shadow = new AWS.IotData({endpoint: thingendpoint});
        shadow.getThingShadow(params, function(err, res){
            if (err){
                console.log(err)
            }
            else{
                var shadowdata = res.payload
                shadowdata = JSON.parse(shadowdata)
                var desiredstatedata = flat(shadowdata.state.desired)
                var reportedstatedata = flat(shadowdata.state.reported)
                var desiredstatedatakeys = Object.keys(desiredstatedata)
                var arraylength = desiredstatedatakeys.length
                var payload = {}
                var flag = 0
                while(arraylength>0)
                {
                    var key = desiredstatedatakeys[arraylength-1]
                    if(reportedstatedata[key] != desiredstatedata[key]){
                        desiredstatedatakeys.splice(arraylength-1,1)
                    }
                    else{
                        payload['state.desired.'+key] = null
                        flag = 1
                    }
                    arraylength --;
                }
                if(flag == 1)
                {
                    payload = JSON.stringify(unflatten(payload))
                    console.log(desiredstatedatakeys)
                    console.log(payload)
                    updatethingshadowparams = {
                        'thingName': thingname,
                        'payload': payload
                    }
                    shadow.updateThingShadow(updatethingshadowparams, function(err, res){
                        if(err){
                            console.log(err)
                        }
                        else{
                            console.log(res)
                        }
                    })
                }
            }
        })
    }
};

exports.handler = handler