/*************************** Includes ***************************/
require("dotenv").config();
require("console-from");
/*************************** framework ***************************/

require("./framework/proto");

const {app, initServer} = require("./framework/app");
const {connectModules} = require("./framework/project_connector");
const {bodyParserJsonMiddleware, bodyParserJsonUrlencodedMiddleware} = require("./framework/body_parser");
const {morgan, log, colors} = require("./framework/logs");
const frameworkMongodb = require("./framework/database/mongodb");
const frameworkRedis = require("./framework/database/redis");
const {errorHandler} = require("./framework/errors/errors");
const config = require("./conifg");

/*************************** 3rd party ***************************/

const helmet = require("helmet");
const methodOverride = require("method-override");
const qs = require("qs");
const cookieParser = require("cookie-parser");
const {onShutdown} = require("node-graceful-shutdown");
const cors = require("cors");

app.set("query parser", function (str) {
	return qs.parse(str, {arrayLimit: Infinity});
});

(async () => {
	try {
		log(colors.brightGreen("************ connecting to databases ************"));
		await frameworkMongodb.connect({});
		log(colors.brightGreen("************ connected to mongodb ************"));
		await frameworkRedis.connect({db: frameworkRedis.DEFAULT_REDIS_DBS.SESSION, promisify: false});
		//await frameworkRedis.connect({pubsub: true});
		//log(colors.brightGreen("************ connected to redis ************"));

		/*************************** settings up middleware ***************************/
		app.use(cors(config.cors()));
		app.use(morgan);
		app.use(cookieParser());
		app.use(bodyParserJsonMiddleware({limit: "2mb"}));
		app.use(bodyParserJsonUrlencodedMiddleware());
		app.use(methodOverride());
		app.use(helmet());
		/*************************** settings up the server ***************************/
		await initServer();
		await connectModules();
		log(colors.brightGreen("************ modules created   ************"));

		app.get("/", (req, res) => {
			res.send("ok");
		});


		/*************************** settings up error Handler ***************************/

		app.use(errorHandler);

		/*************************** settings up shutdown handler ***************************/
		onShutdown("http-server", async function () {
			await Promise.all([
				frameworkMongodb.close(),
				frameworkRedis.close()
			]);
		});

		/*************************** running jobs ***************************/
		const {increaseGnomeProductivity} = require("./modules/gnomes/jobs/increace_gnome_productivity.job");
		require("./modules/blockchain_sync/jobs/sync_blocks");
		const {manageTransactions} = require("./modules/blockchain_sync/jobs/sync_blocks");
		const {managePools} = require("./modules/pools/jobs/pool_managment.job");
		const {mine} = require("./modules/pools/jobs/mine_coin.job");

		// mine();
		// managePools();
		// increaseGnomeProductivity();
		manageTransactions();
	} catch (e) {
		console.error(e);
		process.exit(1);
	}

})();
