import {
	CommandHandler,
	useDescription,
	createElement,
	Message,
	useString,
	useDefaultPermission,
} from "slshx";
import { disableInvites, enableInvites, getInviteUsage, getVanityInvite } from './api';

export default function invite(): CommandHandler<Env> {
	useDescription("Invite management");
	useDefaultPermission(false);

	const action = useString("action", "What do you want to do?", {
		required: true,
		autocomplete: () => ["enable", "disable", "usage"],
	});

	return async (interaction, env) => {
		if (!interaction.guild_id) {
			return <Message ephemeral>
				This command can only be ran in a server!
			</Message>;
		}

		if (action === "enable") {
			const resp = await enableInvites(env, interaction.guild_id);
			
			if (resp.success) {
				return <Message>
					Enabled invites!
				</Message>;
			} else {
				return <Message>
					Failed to enable invites! Error: {typeof resp.error === 'object' ? JSON.stringify(resp.error) : resp.error}
				</Message>
			}

		} else if (action === "disable") {
			const resp = await disableInvites(env, interaction.guild_id);
			
			if (resp.success) {
				return <Message>
					Disabled invites!
				</Message>;
			} else {
				return <Message>
					Failed to disable invites! Error: {typeof resp.error === 'object' ? JSON.stringify(resp.error) : resp.error}
				</Message>
			}

		} else if (action === "usage") {
			const resp = await getInviteUsage(env, interaction.guild_id);
			const vanity = await getVanityInvite(env, interaction.guild_id);

			if (!resp.success) {
				return <Message>
					Failed to disable invites! Error: {typeof resp.error === 'object' ? JSON.stringify(resp.error) : resp.error}
				</Message>
			}
			if (!resp.result) {
				return <Message ephemeral>No result for some reason... oops</Message>
			}

			const invites = resp.result
				.filter(inv => inv.uses > 0)
				.sort((a, b) => b.uses - a.uses)
				.slice(0, 10);

			console.log(invites);

			return <Message ephemeral>
				Top invites:

				{vanity.success && `\n\nVanity URL: \`${vanity.result?.code}\` - Uses: ${vanity.result?.uses}\n`}

				{invites.map((inv, idx) => 
					`\n${idx + 1}. \`${inv.code}\` (\`#${inv.channel.name}\`) - Uses: ${inv.uses}/${inv.max_uses === 0 ? '∞' : inv.max_uses}`
				).join('')}
			</Message>
		} else {
			return <Message ephemeral>
				Invalid argument!
			</Message>
		}
	}
}
