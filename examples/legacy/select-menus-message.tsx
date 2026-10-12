import { ChannelType, SelectMenuDefaultValueType } from "discord-api-types/v10";
import {
	Message,
	ActionRow,
	UserSelect,
	RoleSelect,
	MentionableSelect,
	ChannelSelect,
	renderDiscordMessage,
} from "disjsx";

const SelectMenusMessage = () => {
	return (
		<Message>
			<ActionRow>
				<UserSelect
					customId="user_select"
					placeholder="Select a user"
					minValues={1}
					maxValues={5}
					defaultValues={[{ id: "123456789012345678", type: SelectMenuDefaultValueType.User }]}
				/>
			</ActionRow>
			<ActionRow>
				<RoleSelect customId="role_select" placeholder="Select a role" />
			</ActionRow>
			<ActionRow>
				<MentionableSelect customId="mentionable_select" placeholder="Select a user or role" disabled />
			</ActionRow>
			<ActionRow>
				<ChannelSelect
					customId="channel_select"
					placeholder="Select a channel"
					channelTypes={[ChannelType.GuildText, ChannelType.GuildAnnouncement]}
				/>
			</ActionRow>
		</Message>
	);
};

console.log(
	"Select Menus Message:",
	Bun.inspect(renderDiscordMessage(<SelectMenusMessage />), {
		colors: true,
		depth: 250,
	}),
);
