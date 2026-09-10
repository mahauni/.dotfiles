#!/bin/bash
data=$(base64 | tr -d '\n')
tty=$(tmux display-message -p '#{client_tty}')
printf '\033]52;c;%s\a' "$data" > "$tty"
