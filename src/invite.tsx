import {
	CommandHandler,
	useDescription,
	createElement,
	Message,
	useString,
	useDefaultPermission,
} from "slshx";
import { disableInvites, enableInvites, getInviteUsage, getVanityInvite } from './api';

export function inviteEnable(): CommandHandler<Env> {
	useDescription("Enable invites");
	useDefaultPermission(false);

	return async (interaction, env) => {
		if (!interaction.guild_id) {
			return <Message ephemeral>
				This command can only be ran in a server!
			</Message>;
		}

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
	}
}

export function inviteDisable(): CommandHandler<Env> {
	useDescription("Disable invites");
	useDefaultPermission(false);

	return async (interaction, env) => {
		if (!interaction.guild_id) {
			return <Message ephemeral>
				This command can only be ran in a server!
			</Message>;
		}

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
	}
}

export function inviteUsage(): CommandHandler<Env> {
	useDescription("Invite usage");
	useDefaultPermission(false);

	return async (interaction, env) => {
		if (!interaction.guild_id) {
			return <Message ephemeral>
				This command can only be ran in a server!
			</Message>;
		}

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

		return <Message ephemeral>
			Top invites:

			{vanity.success && `\n\nVanity URL: \`${vanity.result?.code}\` - Uses: ${vanity.result?.uses}\n`}

			{invites.map((inv, idx) => 
				`\n${idx + 1}. \`${inv.code}\` (\`#${inv.channel.name}\`) - Uses: ${inv.uses}/${inv.max_uses === 0 ? '∞' : inv.max_uses}`
			).join('')}
		</Message>
	}
}
