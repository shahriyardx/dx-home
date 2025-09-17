import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet"
import { useSettings } from "@/hooks/useSettings"
import type { SetStateAction, Dispatch } from "react"
import { ThemeSwitcher } from "../ui/kibo-ui/theme-switcher"
import { cn, getRandomItem } from "@/lib/utils"
import { Shuffle } from "lucide-react"

type Props = {
	open: boolean
	setOpen: Dispatch<SetStateAction<boolean>>
}

const colors = [
	"#1abc9c",
	"#3498db",
	"#9b59b6",
	"#e74c3c",
	"#f39c12",
	"#2ecc71",
	"#34495e",
	"#16a085",
	"#27ae60",
	"#2980b9",
	"#8e44ad",
	"#c0392b",
	"#d35400",
	"#7f8c8d",
	"linear-gradient(135deg, #667eea, #764ba2)",
	"linear-gradient(135deg, #f7971e, #ffd200)",
	"linear-gradient(135deg, #ff6a00, #ee0979)",
	"linear-gradient(135deg, #56ab2f, #a8e063)",
	"linear-gradient(135deg, #43cea2, #185a9d)",
	"linear-gradient(135deg, #e65c00, #f9d423)",
	"linear-gradient(135deg, #fc466b, #3f5efb)",
	"linear-gradient(135deg, #11998e, #38ef7d)",
	"linear-gradient(135deg, #c31432, #240b36)",
	"linear-gradient(135deg, #ff512f, #dd2476)",
	"linear-gradient(135deg, #4568dc, #b06ab3)",
	"linear-gradient(135deg, #de6262, #ffb88c)",
	"linear-gradient(135deg, #06beb6, #48b1bf)",
	"linear-gradient(135deg, #eb3349, #f45c43)",
	"linear-gradient(135deg, #8360c3, #2ebf91)",
	"linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
	"linear-gradient(135deg, #232526, #414345)",
	"linear-gradient(135deg, #141e30, #243b55)",
	"linear-gradient(135deg, #000000, #434343)",
	"linear-gradient(135deg, #200122, #6f0000)",
	"linear-gradient(135deg, #373b44, #4286f4)",
	"linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
	"linear-gradient(135deg, #000046, #1cb5e0)",
	"linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)",
	"linear-gradient(135deg, #414d0b, #727a17)",
	"linear-gradient(135deg, #16222a, #3a6073)",
	"linear-gradient(135deg, #2c3e50, #4ca1af)",
	"linear-gradient(135deg, #1e130c, #9a8478)",
	"linear-gradient(135deg, #42275a, #734b6d)",
	"linear-gradient(135deg, #1f1c2c, #928dab)",
	"linear-gradient(135deg, #434343, #000000)",
	"linear-gradient(135deg, #283c86, #45a247)",
	"linear-gradient(135deg, #000000, #434343, #000000)",
	"linear-gradient(135deg, #360033, #0b8793)",
]

const Settings = ({ open, setOpen }: Props) => {
	const settings = useSettings()

	return (
		<Sheet open={open} onOpenChange={(val) => setOpen(val)}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Settings</SheetTitle>
				</SheetHeader>

				<div className="px-4 space-y-5">
					<div>
						<h2 className="text-xl font-bold">Background</h2>
						<div className="flex flex-wrap gap-2 mt-2">
							{colors.map((color) => (
								<div
									key={color}
									onClick={() => settings.updateBg(color)}
									className={cn(
										"w-5 h-5 rounded cursor-pointer",
										settings.background === color && "border-2 border-primary",
									)}
									style={{ background: color }}
								></div>
							))}

							<div
								onClick={() => settings.updateBg(getRandomItem(colors))}
								className="w-5 h-5 grid place-items-center bg-primary text-primary-foreground rounded cursor-pointer"
							>
								<Shuffle size={10} />
							</div>
						</div>
					</div>

					<div>
						<h2 className="text-xl font-bold">Theme</h2>
						<div className="mt-2 w-max">
							<ThemeSwitcher
								value={settings.theme}
								onChange={(theme) => settings.setTheme(theme)}
							/>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	)
}

export default Settings
