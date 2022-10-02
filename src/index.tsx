import { createHandler } from "slshx";
import invite from "./invite";

const handler = createHandler({
	// Replaced by esbuild when bundling, see scripts/build.js (do not edit)
	applicationId: SLSHX_APPLICATION_ID,
	applicationPublicKey: SLSHX_APPLICATION_PUBLIC_KEY,
	applicationSecret: SLSHX_APPLICATION_SECRET,
	testServerId: SLSHX_TEST_SERVER_ID,

	commands: {
		invite,
	},
});

export default { fetch: handler };
