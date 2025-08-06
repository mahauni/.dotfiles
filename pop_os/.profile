# ~/.profile: executed by the command interpreter for login shells.
# This file is not read by bash(1), if ~/.bash_profile or ~/.bash_login
# exists.
# see /usr/share/doc/bash/examples/startup-files for examples.
# the files are located in the bash-doc package.

# the default umask is set in /etc/profile; for setting the umask
# for ssh logins, install and configure the libpam-umask package.
#umask 022

# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
	. "$HOME/.bashrc"
    fi
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/.local/bin" ] ; then
    PATH="$HOME/.local/bin:$PATH"
fi

export PATH=$PATH:/usr/local/go/bin
. "$HOME/.cargo/env"

# Enable and disable Pop! Store on login
alias pop-shop-on='sed -i "s/X-GNOME-Autostart-enabled=false/X-GNOME-Autostart-enabled=true/" /home/$USER/.config/autostart/io.elementary.appcenter-daemon.desktop; echo "Pop! Store enabled"; nohup io.elementary.appcenter -s >/dev/null 2>&1 &'

alias pop-shop-off='sed -i "s/X-GNOME-Autostart-enabled=true/X-GNOME-Autostart-enabled=false/" /home/$USER/.config/autostart/io.elementary.appcenter-daemon.desktop; echo "Pop! Store disabled"; killall io.elementary.appcenter'
