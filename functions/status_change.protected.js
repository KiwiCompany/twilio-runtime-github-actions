const cache = require(Runtime.getFunctions()['core/cache']['path']);
const { _CONVO_KEY } = require(Runtime.getFunctions()['helpers/constants']['path']);

exports.handler = async function (context, event, callback) {
	
	if(event.CallStatus === 'completed'){
		if(!cache.isInitialized()) await cache.initialize()

		const convo = await cache.getList(_CONVO_KEY, event.CallSid)
		const convoText = convo.join('\n')
		console.log(convoText);
		//save convoText into the crm
		return true
	} else {
		return true
	}

};