local wezterm = require("wezterm")
local config = wezterm.config_builder()

config.enable_tab_bar = false
config.window_background_opacity = 0.15
config.window_background_image = "/home/mahauni/.config/wezterm/assets/frieren.jpeg"

return config
