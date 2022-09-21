

class DataChannel  {

    constructor(app, mod, dc, public_key){
        this.app = app;
        this.mod = mod;
        this.dc = dc
        this.public_key = public_key
    }

    receiveMessage(callback){
        this.dc.onmessage = (e)=> {
            console.log("receiving message", this.dc, e)
            callback(e);
        }
    }

    sendMessage(data){
        this.dc.send(data)
    }   
    
    closeDataChannel(){
        this.dc.close()
    }

}

module.exports = DataChannel;