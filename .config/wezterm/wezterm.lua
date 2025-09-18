local wezterm = require("wezterm")
local config = wezterm.config_builder()

config.enable_tab_bar = false
config.window_background_opacity = 0.13
config.window_background_image = "/home/mahauni/.config/wezterm/assets/frieren.jpeg"

-- maybe latter change the red of the Tokyo Night to the Gruber
config.color_scheme = "Tokyo Night"
-- config.color_scheme = "Gruber (base16)"
-- config.color_scheme = "Catppuccin Macchiato"

return config
