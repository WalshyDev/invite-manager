interface ApiResponse<T> {
	success: boolean;
	result?: T;
	error?: string | object;
}

interface Guild {
	id: string;
	name: string;
	features: string[];
}

interface GuildUpdate {
	name?: string;
	features?: string[];
}

interface PartialChannel {
	id: string;
	name: string;
	type: number;
}

interface Invite {
	code: string;
	guild?: Guild;
	channel: PartialChannel;
	inviter?: object;
	approximate_presence_count?: number;
	approximate_member_count?: number;
	expires_at?: string;
}

interface InviteWithMetadata extends Invite {
	uses: number;
	max_uses: number;
	max_age: number;
	temporary: boolean;
	created_at: string;
}

interface VanityInvite {
	code: string;
	uses: number;
}
