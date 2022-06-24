const config = {
	servers: [{
            urls: "stun:stun.l.google.com:19302",
        }, {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
        }, {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
        }, {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
        }],

    stun_servers: [{
	        urls: "stun:stun.l.google.com:19302",
	    }],

    turn_servers: [{
	        urls: "turn:openrelay.metered.ca:80",
	        username: "openrelayproject",
	        credential: "openrelayproject",
	    }, {
	        urls: "turn:openrelay.metered.ca:443",
	        username: "openrelayproject",
	        credential: "openrelayproject",
	    }, {
	        urls: "turn:openrelay.metered.ca:443?transport=tcp",
	        username: "openrelayproject",
	        credential: "openrelayproject",
	    }]
};

module.exports = config