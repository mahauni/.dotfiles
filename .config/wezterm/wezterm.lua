local wezterm = require("wezterm")
local config = wezterm.config_builder()

-- Fonts
config.font = wezterm.font_with_fallback({
	-- "MesloLGS NF",
	"FiraMono Nerd Font",
	"JetBrains Mono",
})
config.font_size = 13

-- Windows
if wezterm.target_triple == "x86_64-pc-windows-msvc" then
	Default_prog = { "powershell.exe" }
	config.window_background_image = weztterm.home_dir .. "/wezterm/assets/frieren.jpeg"
	config.window_background_hsb = {
		hue = 1.0,
		saturation = 1.0,
		brightness = 0.05,
	}
end

-- Linux
if wezterm.target_triple == "x86_64-unknown-linux-gnu" then
	config.window_background_opacity = 0.13
	config.window_background_image = wezterm.home_dir .. "/.config/wezterm/assets/frieren.jpeg"
end

-- Configs
config.enable_tab_bar = false
config.default_prog = Default_prog

-- Colorscheme
config.color_scheme = "Tokyo Night"
-- config.color_scheme = "Gruber (base16)"
-- config.color_scheme = "Catppuccin Macchiato"

return config
