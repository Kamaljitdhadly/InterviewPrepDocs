# bash Commands

### File and Directory Management

1.  **List Files**

```bash
ls # List directory contents
ls -l # Long listing format
ls -a # Include hidden files
```

2.  **Change Directory**

```bash
cd <directory> # Change to a specific directory
cd .. # Move up one directory
cd ~ # Change to the home directory
```

3.  **Print Working Directory**

```bash
pwd # Print the current working directory
```

4.  **Create Directory**

```bash
mkdir <directory> # Create a new directory
```

5.  **Remove Directory**

```bash
rmdir <directory> # Remove an empty directory
rm -r <directory> # Remove a directory and its contents recursively
```

6.  **Remove Files**

```bash
rm <file> # Remove a file
rm -f <file> # Force remove a file without confirmation
rm -i <file> # Prompt before removing each file
```

7.  **Copy Files**

```bash
cp <source> <destination> # Copy files or directories
cp -r <source> <destination> # Recursively copy directories
```

8.  **Move/Rename Files**

```bash
mv <source> <destination> # Move or rename files and directories
```

9.  **View File Contents**

```bash
cat <file> # Concatenate and display file content
less <file> # View file content page by page
more <file> # View file content page by page (older command)
head <file> # View the first 10 lines of a file
tail <file> # View the last 10 lines of a file
```

10. **File Permissions**

```bash
chmod <permissions> <file> # Change file permissions
chown <user>:<group> <file> # Change file owner and group
```

### File Searching and Text Processing

1.  **Find Files**

```bash
find <directory> -name <name> # Find files by name
find <directory> -type <type> # Find files by type (e.g., f for regular file, d for directory)
```

2.  **Search for Text**

```bash
grep <pattern> <file> # Search for a pattern in a file
grep -r <pattern> <directory> # Recursively search for a pattern in a directory
```

3.  **Search Text with Regular Expressions**

```bash
grep -E <regex> <file> # Use extended regex for searching
```

4.  **Replace Text**

sed 's/<pattern>/<replacement>/' <file> # Substitute text

5.  **Sort and Uniq**

```bash
sort <file> # Sort lines in a file
uniq <file> # Remove duplicate lines from a file
```

### System Information

1.  **System Information**

uname -a # System info

2.  **Disk Usage**

df -h # Disk space (human-readable)

du -sh <directory> # Directory disk usage

3.  **Memory Usage**

free -h # Memory usage

4.  **Process Management**

```bash
ps aux # Display information about running processes
top # Display a dynamic view of system processes
htop # Display a more interactive process viewer (requires installation)
kill <pid> # Kill a process by PID
killall <name> # Kill all processes with a specific name
```

### Networking

1.  **Ping**

ping <host> # ICMP echo to host

2.  **Network Configuration**

ifconfig # Network interfaces (deprecated; use ip)

ip addr show # IP addresses

3.  **Download Files**

```bash
wget <url> # Download files from the internet
curl <url> # Transfer data from or to a server
```

4.  **Check Open Ports**

netstat -tuln # Listening ports and connections

### Archiving and Compression

1.  **Create Archive**

tar -cvf <archive.tar> <files> # Create tar archive

2.  **Extract Archive**

tar -xvf <archive.tar> # Extract tar archive

3.  **Compress Files**

```bash
gzip <file> # Compress a file using gzip
bzip2 <file> # Compress a file using bzip2
```

4.  **Decompress Files**

gunzip <file.gz> # Decompress gzip
bunzip2 <file.bz2> # Decompress bzip2

### File and Command Operations

1.  **Execute Commands**

./<script> # Run script in current directory

2.  **Redirection**

command > <file> # Redirect output (overwrite)

command >> <file> # Append output

command < <file> # Redirect input

3.  **Pipes**

command1 | command2 # Pipe stdout to next command

4.  **Background Processes**

command & # Run in background

5.  **Job Control**

jobs # List background jobs

fg %<job> # Foreground a job

bg %<job> # Resume job in background

### Shell Scripting

1.  **Define Variables**

```bash
variable=value # Define a variable
echo $variable # Print the value of a variable
```

2.  **Conditional Statements**

if [ condition ]; then

# commands

elif [ condition ]; then

# commands

else

# commands

fi

3.  **Loops**

for var in list; do

# commands

done

while [ condition ]; do

# commands

done

4.  **Functions**

function_name() {

# commands

}

function_name # Call a function

### File Permissions

1.  **Change File Permissions**

```bash
chmod <permissions> <file> # Change file permissions
```

2.  **Change File Owner**

```bash
chown <user>:<group> <file> # Change file owner and group
```

### Other Useful Commands

1.  **Date and Time**

date # Current date and time

2.  **Environment Variables**

```bash
env # Display environment variables
export VAR=value # Set an environment variable
```

3.  **History**

history # Command history

4.  **Exit**

exit # Exit shell
