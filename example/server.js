var matchserver = require('../server/matchserver');
var express = require('express')
	,app = module.exports = express();

app.set('port', 8011);
app.use(express.static(__dirname+'/public'));

if (!module.parent) {
	app.listen(app.get('port'));
	matchserver.listen(8010,8012);
	console.log('listening on port ' + app.get('port'));
}
