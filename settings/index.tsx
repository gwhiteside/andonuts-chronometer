import previewPlain from "../resources/previews/plain.png";
import previewMint from "../resources/previews/mint.png";
import previewStrawberry from "../resources/previews/strawberry.png";
import previewBanana from "../resources/previews/banana.png";
import previewPeanut from "../resources/previews/peanut.png";
import previewCherry from "../resources/previews/cherry.png";

const previewImages = {
	"plain":      previewPlain,
	"mint":       previewMint,
	"strawberry": previewStrawberry,
	"banana":     previewBanana,
	"peanut":     previewPeanut,
	"cherry":     previewCherry
};

function mySettings(props) {
	return (
		<Page>
			<Section
				title={<Text bold align="center">Demo Settings</Text>}>
				<TextInput
					settingsKey="name"
					label="Your name, please."
					title="Test input"
					placeholder=""
					action="OK"
				/>
				<Select
					label="Which style of windows do you prefer?"
					title="Which style of windows do you prefer?"
					settingsKey="theme"
					options={[
						{name:"Plain flavor",      value:"plain"},
						{name:"Mint flavor",       value:"mint"},
						{name:"Strawberry flavor", value:"strawberry"},
						{name:"Banana flavor",     value:"banana"},
						{name:"Peanut flavor",     value:"peanut"},
						{name:"Cherry flavor",     value:"cherry"}
					]}
					renderItem={
						(option) =>
							<TextImageRow
								label={option.name}
								sublabel=""
								icon={previewImages[option.value]}
							/>
					}
				/>
				{/* In case there's a device that doesn't support the fitbit user preference for units?
				<Select
					label="Your preferred distance unit?"
					title="the title"
					settingsKey="distance-units"
					options={[
						{name: "kilometers", value: "kilometers"},
						{name: "miles",      value: "miles"}
					]}
				/>
				*/}
			</Section>
		</Page>
	);
}

registerSettingsPage(mySettings);
