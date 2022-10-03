export function getGuild(env: Env, guildId: string): Promise<ApiResponse<Guild>> {
	return api<Guild>(env, `/guilds/${guildId}`);
}

export function getInvite(env: Env, code: string): Promise<ApiResponse<Invite>> {
	return api<Invite>(env, `/invites/${code}`);
}

export function patchGuild(env: Env, guildId: string, update: GuildUpdate): Promise<ApiResponse<Guild>> {
	return api<Guild>(env, `/guilds/${guildId}`, {
		method: 'PATCH',
		body: JSON.stringify(update),
	});
}

export async function enableInvites(env: Env, guildId: string): Promise<ApiResponse<Guild>> {
	const resp = await getGuild(env, guildId);

	if (!resp.success) {
		return resp;
	}

	const features = resp.result!.features;
	if (!features.includes('INVITES_DISABLED')) {
		// Already enabled
		return { success: true };
	}

	const newFeatures = features.filter(feature => feature !== 'INVITES_DISABLED');

	return patchGuild(env, guildId, { features: newFeatures });
}

export async function disableInvites(env: Env, guildId: string): Promise<ApiResponse<Guild>> {
	const resp = await getGuild(env, guildId);

	if (!resp.success) {
		return resp;
	}

	const features = resp.result!.features;
	if (features.includes('INVITES_DISABLED')) {
		// Already disabled
		return { success: true };
	}

	features.push('INVITES_DISABLED');

	return patchGuild(env, guildId, { features });
}

export async function deleteInvite(env: Env, guildId: string, code: string): Promise<ApiResponse<Invite>> {
	const resp = await getInvite(env, code);

	if (!resp.success) {
		return resp;
	}

	if(resp.result?.guild?.id !== guildId) {
		return { success: false, error: "The invite does not belong to this server" };
	}

	return api<Invite>(env, `/invites/${code}`, {
		method: 'DELETE',
	});
}

export function getInviteUsage(env: Env, guildId: string): Promise<ApiResponse<InviteWithMetadata[]>> {
	return api<InviteWithMetadata[]>(env, `/guilds/${guildId}/invites`);
}

export function getVanityInvite(env: Env, guildId: string): Promise<ApiResponse<VanityInvite>> {
	return api<VanityInvite>(env, `/guilds/${guildId}/vanity-url`);
}

export async function api<T>(env: Env, path: string, opts?: RequestInit): Promise<ApiResponse<T>> {
	let headers: Record<string, string> = {};
	if (opts && opts.headers) {
		headers = opts.headers as Record<string, string>;
	}
	headers['Authorization'] = `Bot ${env.DISCORD_TOKEN}`;
	headers['User-Agent'] = 'DiscordBot (https://cloudflare.com, v1)';
	headers['Content-Type'] = 'application/json';

	// re-set headers
	if (!opts) {
		opts = { headers };
	} else {
		opts.headers = headers;
	}

	console.log('------------------------------');
	console.log(`API request to: ${path}`);
	console.log(opts);

	const res = await fetch(`https://discord.com/api/v10${path}`, opts);

	if (res.status >= 400 && res.status < 600) {
		// Try to parse response as JSON
		let body: string | object;
		try {
			body = await res.json();
		} catch(e) {
			body = await res.text();
		}

		return { success: false, error: body };
	}

	const json = await res.json<T>();
	return { success: true, result: json };
}
