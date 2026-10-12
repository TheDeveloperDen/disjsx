import { ButtonStyle } from "discord-api-types/v10";
import { expect, test } from "bun:test";
import { ActionRow, Button, DisJSXValidationError, Message, TextDisplay, renderDiscordMessage } from "./index.js";

test("validation errors are in the thrown message", () => {
	const bad = (
		<Message isV2>
			<ActionRow>
				<Button customId="a" label="1" style={ButtonStyle.Primary} />
				<Button customId="a" label="2" style={ButtonStyle.Primary} />
			</ActionRow>
		</Message>
	);
	let e: unknown;

	try {
		renderDiscordMessage(bad);
	} catch (err) {
		e = err;
	}
	expect(e).toBeInstanceOf(DisJSXValidationError);
	expect((e as DisJSXValidationError).errors.length).toBeGreaterThan(0);
	expect((e as Error).message).toContain((e as DisJSXValidationError).errors[0]!.message);
});

test("deeply nested custom components throw instead of vanishing", () => {
	const Deep = () => {
		let X: React.FC = () => <TextDisplay>hi</TextDisplay>;

		for (let i = 0; i < 120; i++) {
			const Inner = X;

			X = () => <Inner />;
		}
		return <X />;
	};

	expect(() =>
		renderDiscordMessage(
			<Message isV2>
				<Deep />
			</Message>,
		),
	).toThrow(/nested more than/);
});
