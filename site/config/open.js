/**
    * open 
    * 1. start app url
    */
module.exports.tasks = {
	open : {
		local : {
		  path: 'https:/traderlocal.iforex.com/webpl3/account/login'
		},
		dev : {
		  path: 'https:/traderdev.iforex.com/webpl3/account/login'
		}
	}
};