# This is a README for importing the .dotfiles to another computer

1. Create the alias in the terminal you are using

```bash
alias config='/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'
```

2. Clone the repository

```bash
git clone --bare https://github.com/mahauni/.dotfiles.git $HOME/.dotfiles
```

3. Checkout to the content of the repo

```bash
config checkout
```

If this step happens to appear a error like this

```bash
error: The following untracked working tree files would be overwritten by checkout:
    .bashrc
    .gitignore
Please move or remove them before you can switch branches.
Aborting
```

That means that there is confliting config files in the system, so then we will backup these files somewhere else

4. Run this command if there is error like the above

```bash
mkdir -p .config-backup && \
config checkout 2>&1 | egrep "\s+\." | awk {'print $1'} | \
xargs -I{} mv {} .config-backup/{}
```

5. Then do the checkout and set so that it will not show all the files in the system when you do a config status

```bash
config checkout
config config --local status.showUntrackedFiles no
```

## Using the script

Well if you want to use the script you can do with these commands

```bash
chmod +x $HOME/install-dotfiles.sh
$HOME/install-dotfiles.sh
```

If you want to read more about this check the post on Hacker News: https://news.ycombinator.com/item?id=11070797
