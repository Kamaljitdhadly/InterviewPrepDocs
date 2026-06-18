# Docker Commands Important
## Questions Covered

1. What is the command to list all running Docker containers?
2. How do you start and stop a container in Docker?
3. How can you remove all stopped containers in Docker?
4. Explain how to check the logs of a running Docker container.
5. How do you get inside a running Docker container to execute commands?
6. List of instructions in dockerfile?
7. List of docker commands?
8. Details example of docker run command?
9. Details example of docker build command?
10. List of Docker Compose Commands?
11. Details example of docker compose file?
## What is the command to list all running Docker containers?

To list all running Docker containers, you can use the following command:

```bash
docker ps
```

This command displays a list of all currently running containers, including details such as the container ID, image name, command, creation time, status, ports, and names.

### Example Output

CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES

d4f7a9e0e1c2 nginx:latest "nginx -g 'daemon of…" 2 hours ago Up 2 hours 0.0.0.0:80->80/tcp webserver

3c1d2e3a4b5f mysql:5.7 "docker-entrypoint.s…" 3 hours ago Up 3 hours 3306/tcp database

### Additional Options

- **List all containers (including stopped ones):**

```bash
docker ps -a
```

- **Display more detailed information:**

```bash
docker ps --no-trunc
```

- **Filter containers by specific criteria (e.g., by name):**

```bash
docker ps --filter "name=mycontainer"
```

These commands help you manage and monitor your Docker containers efficiently.
## How do you start and stop a container in Docker?

To start and stop Docker containers, you use the docker start and docker stop commands, respectively. Here's how to use these commands:

### Starting a Container

### Command

```bash
docker start <container_name_or_id>
```

### Examples

- **Start a container by name:**

```bash
docker start my-container
```

- **Start a container by ID:**

```bash
docker start 3c1d2e3a4b5f
If you want to start a container and attach to it interactively, you can use:
docker start -a <container_name_or_id>
```

### Note

- You cannot start a container that has been removed. Make sure the container exists and is stopped before attempting to start it.

### Stopping a Container

### Command

```bash
docker stop <container_name_or_id>
```

### Examples

- **Stop a container by name:**

```bash
docker stop my-container
```

- **Stop a container by ID:**

```bash
docker stop 3c1d2e3a4b5f
```

### Details

- By default, docker stop sends a SIGTERM signal to the container, giving it a grace period (10 seconds by default) to shut down gracefully. If the container does not stop within this time, a SIGKILL signal is sent to forcefully terminate it.

### Adjusting the Grace Period

- You can specify a different grace period (in seconds) before sending the SIGKILL signal:

```bash
docker stop -t 30 <container_name_or_id>
```

### Starting and Stopping Containers Using Docker Compose

If you are using Docker Compose, you can start and stop containers defined in your docker-compose.yml file using the following commands:

- **Start containers:**

```bash
docker-compose up
```

- **Start containers in detached mode:**

```bash
docker-compose up -d
```

- **Stop containers:**

```bash
docker-compose down
```

### Summary

- **Start a container:** docker start <container_name_or_id>

- **Stop a container:** docker stop <container_name_or_id>

These commands help you manage the lifecycle of your Docker containers, allowing you to start and stop them as needed.
## How can you remove all stopped containers in Docker?

To remove all stopped containers in Docker, you can use the docker container prune command. This command cleans up all stopped containers, freeing up disk space.

### Command

docker container prune

### Details

- This command will prompt you to confirm the deletion of all stopped containers. If you want to bypass the confirmation prompt, you can use the -f (force) flag:

docker container prune -f

### Alternative Approach

If you want to manually remove all stopped containers without using docker container prune, you can use a combination of docker ps and docker rm commands. Here’s how:

1.  **List all stopped containers:**

```bash
docker ps -a -q -f status=exited
```

- -a lists all containers (including stopped ones).

- -q outputs only container IDs.

- -f status=exited filters for containers that are stopped.

2.  **Remove all stopped containers:**

```bash
docker rm $(docker ps -a -q -f status=exited)
```

- This command removes all containers whose IDs are output by the docker ps -a -q -f status=exited command.

### Summary

- **Remove all stopped containers:** docker container prune

- **Remove all stopped containers without prompt:** docker container prune -f

- **Alternative method:**

```bash
docker rm $(docker ps -a -q -f status=exited)
```

These commands help you efficiently clean up stopped containers and manage your Docker environment.
## Explain how to check the logs of a running Docker container.

To check the logs of a running Docker container, you can use the docker logs command. This command retrieves and displays the logs produced by a container. Here’s how you can use it:

### Basic Command

### Syntax

```bash
docker logs <container_name_or_id>
```

### Examples

- **View logs of a container by name:**

docker logs my-container

- **View logs of a container by ID:**

docker logs 3c1d2e3a4b5f

### Additional Options

1.  **Tail Logs:** To view only the most recent logs, you can use the --tail option to specify the number of lines to show.

docker logs --tail 100 my-container

2.  **Follow Logs:** To stream the logs in real-time (similar to tail -f), use the -f (follow) option.

docker logs -f my-container

3.  **Combine Tail and Follow:** To view the most recent logs and continue to follow new logs, combine the --tail and -f options.

docker logs --tail 100 -f my-container

4.  **Since and Until Options:** To view logs from a specific time range, you can use --since and --until options. The time format can be YYYY-MM-DDTHH:MM:SS or relative (e.g., 5m for 5 minutes ago).

docker logs --since 2024-09-13T12:00:00 my-container
docker logs --until 5m my-container

5.  **Show timestamps:** To include timestamps with the log output, use the --timestamps option.

docker logs --timestamps my-container

### Summary

- **View all logs:** docker logs <container_name_or_id>

- **Tail recent logs:** docker logs --tail <number> <container_name_or_id>

- **Follow logs in real-time:** docker logs -f <container_name_or_id>

- **View logs from a specific time:** docker logs --since <time> <container_name_or_id>

- **Show logs with timestamps:** docker logs --timestamps <container_name_or_id>

These commands help you monitor and troubleshoot Docker containers by providing access to their logs.
## How do you get inside a running Docker container to execute commands?

To get inside a running Docker container and execute commands, you can use the docker exec command. This command allows you to run commands in a running container, effectively providing you with an interactive shell session. Here’s how to do it:

### Using docker exec

### Syntax

```bash
docker exec [options] <container_name_or_id> <command>
```

### Examples

1.  **Start an Interactive Shell Session:**

**Example:**

```bash
To start an interactive shell session (such as /bin/bash or /bin/sh) inside the container, use the -it options with docker exec:
docker exec -it <container_name_or_id> /bin/bash
If /bin/bash is not available, you can use /bin/sh:
docker exec -it <container_name_or_id> /bin/sh
docker exec -it my-container /bin/bash
```

2.  **Run a Single Command:**

**Example:**

```bash
To run a single command inside the container, you can omit the -it options:
docker exec <container_name_or_id> <command>
docker exec my-container ls /app
```

3.  **Run a Command as a Specific User:**

**Example:**

```bash
To run a command as a specific user, use the -u option followed by the username or UID:
docker exec -u <username_or_uid> <container_name_or_id> <command>
docker exec -u www-data my-container whoami
```

### Options

- **-i (interactive):** Keep STDIN open even if not attached. This is useful for interactive commands.

- **-t (tty):** Allocate a pseudo-TTY. This is useful for interactive shell sessions.

- **-u (user):** Specify the user to run the command as.

- **--env:** Set environment variables for the command.

### Summary

- **Start an interactive shell:** docker exec -it <container_name_or_id> /bin/bash or /bin/sh

- **Run a single command:** docker exec <container_name_or_id> <command>

- **Run a command as a specific user:** docker exec -u <username_or_uid> <container_name_or_id> <command>

These commands enable you to interact with a running container, perform diagnostics, or execute administrative tasks directly inside the container environment.
## List of instructions in dockerfile?

Here is a list of the most commonly used **Dockerfile instructions** along with explanations:
## What is the command to list all running Docker containers?

- Specifies the base image to build your image from.

- Every Dockerfile starts with this instruction.

Example:

```bash
FROM node:16-alpine
```
## How do you start and stop a container in Docker?

- Sets the working directory inside the container.

- All subsequent COPY, RUN, and other commands will be executed in this directory.

Example:

```bash
WORKDIR /app
```
## How can you remove all stopped containers in Docker?

- Copies files and directories from the host machine to the container’s filesystem.

Example:

```bash
COPY . /app
```
## Explain how to check the logs of a running Docker container.

- Similar to COPY, but with additional features like extracting tar files and supporting URLs.

Example:

```bash
ADD my-archive.tar.gz /app
```
## How do you get inside a running Docker container to execute commands?

- Executes a command in the container’s shell during the image build process. It is used for tasks like installing packages, building code, etc.

Example:

```bash
RUN npm install
```
## List of instructions in dockerfile?

- Provides the default command to run when a container starts. This is overridden if a command is provided when running the container.

- Typically used to start an application.

Example:

```bash
CMD ["node", "app.js"]
```
## List of docker commands?

- Similar to CMD, but it is meant to be the main command that always runs, even if you provide additional arguments when running the container.

Example:

```bash
ENTRYPOINT ["dotnet", "MyApp.dll"]
```
## Details example of docker run command?

- Declares the port on which the container will listen for incoming traffic.

- This is a metadata instruction and doesn’t publish the port. You need to use -p or -P in docker run to expose the port.

Example:

```bash
EXPOSE 80
```
## Details example of docker build command?

- Sets environment variables that will be available during the build and runtime.

Example:

```bash
ENV NODE_ENV=production
```
## List of Docker Compose Commands?

- Defines a build-time variable that can be passed during the docker build process with --build-arg.

Example:

```bash
ARG app_version=1.0
```
## Details example of docker compose file?

- Creates a mount point with a specified path and marks it as holding externally mounted volumes from the host or other containers.

Example:

```bash
VOLUME /data
```

### 12. USER

- Specifies the user to run the following instructions as. Useful for security (e.g., not running everything as root).

Example:

```bash
USER node
```

### 13. LABEL

- Adds metadata to an image in the form of key-value pairs. Useful for adding descriptions, versioning, and other metadata.

Example:

```bash
LABEL version="1.0" description="MyApp"
```

### 14. SHELL

- Specifies the shell to use when running RUN commands. The default shell is /bin/sh on Linux.

Example:

SHELL ["/bin/bash", "-c"]

### 15. STOPSIGNAL

- Defines the system call signal that will be used to stop the container.

Example:

STOPSIGNAL SIGTERM

### 16. ONBUILD

- Adds a trigger instruction that will be executed when the image is used as a base for another Dockerfile.

Example:

ONBUILD RUN apt-get update

### 17. HEALTHCHECK

- Defines a command to periodically check whether the container is still running correctly.

Example:

```bash
HEALTHCHECK CMD curl --fail http://localhost:5000/health || exit 1
```

### 18. MAINTAINER (Deprecated)

- Used to specify the author/maintainer of the image (deprecated, now replaced by LABEL).

Example:

MAINTAINER "john.doe@example.com"

### Example Dockerfile with Multiple Instructions

# Use Node.js as base image

```bash
FROM node:16-alpine
```

# Set the working directory

```bash
WORKDIR /app
```

# Copy package.json and install dependencies

```bash
COPY package.json ./
RUN npm install
```

# Copy the rest of the application files

```bash
COPY . .
```

# Expose the application port

```bash
EXPOSE 3000
```

# Set environment variable

```bash
ENV NODE_ENV=production
```

# Command to run the application

```bash
CMD ["npm", "start"]
```

### Explanation

- **FROM**: Base image is node:16-alpine.

- **WORKDIR**: Sets the working directory inside the container to /app.

- **COPY**: Copies files from the local machine to the container.

- **RUN**: Installs dependencies.

- **EXPOSE**: Exposes port 3000.

- **CMD**: Specifies the command to run when the container starts (npm start).
## List of docker commands?

Here’s a list of common Docker commands that can help you manage containers, images, volumes, and networks:

### **Container Management**

1.  **Run a container**

```bash
docker run [options] IMAGE [command]
```

- Example: docker run -d -p 8080:80 nginx

2.  **List running containers**

```bash
docker ps
```

3.  **List all containers (including stopped ones)**

```bash
docker ps -a
```

4.  **Stop a running container**

```bash
docker stop CONTAINER_ID/NAME
```

5.  **Start a stopped container**

```bash
docker start CONTAINER_ID/NAME
```

6.  **Restart a container**

docker restart CONTAINER_ID/NAME

7.  **Remove a container**

```bash
docker rm CONTAINER_ID/NAME
```

8.  **Attach to a running container**

docker attach CONTAINER_ID/NAME

9.  **View logs of a container**

docker logs CONTAINER_ID/NAME

10. **Execute a command in a running container**

```bash
docker exec -it CONTAINER_ID/NAME command
```

- Example: docker exec -it my_container /bin/

### **Image Management**

1.  **Pull an image from Docker Hub**

```bash
docker pull IMAGE_NAME
```

2.  **List images**

```bash
docker images
```

3.  **Build an image from a Dockerfile**

```bash
docker build -t IMAGE_NAME:TAG .
```

4.  **Tag an image**

```bash
docker tag SOURCE_IMAGE:TAG TARGET_IMAGE:TAG
```

5.  **Push an image to a registry**

```bash
docker push IMAGE_NAME:TAG
```

6.  **Remove an image**

```bash
docker rmi IMAGE_ID
```

7.  **Inspect an image**

docker inspect IMAGE_ID

### **Volume Management**

1.  **Create a volume**

```bash
docker volume create VOLUME_NAME
```

2.  **List volumes**

```bash
docker volume ls
```

3.  **Inspect a volume**

```bash
docker volume inspect VOLUME_NAME
```

4.  **Remove a volume**

```bash
docker volume rm VOLUME_NAME
```

### **Network Management**

1.  **List networks**

```bash
docker network ls
```

2.  **Inspect a network**

```bash
docker network inspect NETWORK_NAME
```

3.  **Create a network**

```bash
docker network create NETWORK_NAME
```

4.  **Remove a network**

```bash
docker network rm NETWORK_NAME
```

5.  **Connect a container to a network**

```bash
docker network connect NETWORK_NAME CONTAINER_NAME
```

6.  **Disconnect a container from a network**

```bash
docker network disconnect NETWORK_NAME CONTAINER_NAME
```

### **Cleaning Up**

1.  **Remove unused containers, networks, and images**

docker system prune

2.  **Remove all stopped containers**

docker container prune

3.  **Remove all unused images**

docker image prune

4.  **Remove all unused volumes**

```bash
docker volume prune
```

Let me know if you'd like to explore any specific Docker command in more detail!
## Details example of docker run command?

Here’s a detailed example of a comprehensive docker run command with all its possible options, followed by explanations of each flag:

```bash
docker run -d --name my_container \\
```

-p 8080:80 \\

-e ENV_VAR=value \\

-v /host/path:/container/path \\

--network my_network \\

--restart always \\

--cpu-shares 512 \\

--memory 512m \\

--cap-add SYS_ADMIN \\

--device /dev/sda:/dev/xvda \\

--link another_container:alias \\

--log-driver json-file \\

--log-opt max-size=10m \\

--security-opt seccomp=unconfined \\

--user 1000:1000 \\

--workdir /app \\

--entrypoint /bin/bash \\

my_image:latest

### Breakdown of the command

1.  **-d (Detached mode)**\
    Runs the container in the background.

    - Without -d, the container would run in the foreground, and you'd see the container's logs directly in the terminal.

2.  **--name my_container**\
    Assigns a name to the container.

    - If not provided, Docker will generate a random name like focused_morse.

3.  **-p 8080:80** (Port mapping)\
    Maps port 8080 on the host to port 80 on the container.

    - This allows you to access the container's application running on port 80 via localhost:8080.

4.  **-e ENV_VAR=value** (Environment variable)\
    Sets environment variables in the container.

    - This can be useful for setting configuration values or credentials.

5.  **-v /host/path:/container/path** (Volume mapping)\
    Mounts a directory or file from the host to the container.

    - This is useful for persisting data or sharing files between the host and container.

6.  **--network my_network**\
    Connects the container to a specific Docker network (my_network).

    - If no network is specified, Docker connects it to the default network.

7.  **--restart always**\
    Configures the restart policy.

    - This option restarts the container if it stops, even on a host reboot. Other values include on-failure, unless-stopped, and no.

8.  **--cpu-shares 512**\
    Sets CPU share weight for the container (relative weight for CPU allocation).

    - Default is 1024; smaller values reduce the priority when CPU contention occurs.

9.  **--memory 512m**\
    Limits the container to use no more than 512 MB of RAM.

    - You can also use g for gigabytes, like --memory 2g.

10. **--cap-add SYS_ADMIN**\
    Adds Linux kernel capabilities to the container.

    - In this example, it adds the SYS_ADMIN capability, giving the container additional privileges.

11. **--device /dev/sda:/dev/xvda**\
    Allows access to a host device inside the container.

    - Here, /dev/sda on the host is mapped to /dev/xvda in the container.

12. **--link another_container:alias**\
    Links the current container with another_container and sets up a network alias alias.

    - Deprecated in favor of Docker networks, but still useful in certain cases.

13. **--log-driver json-file**\
    Specifies the log driver for the container.

    - Docker uses json-file by default, but it can also be syslog, journald, etc.

14. **--log-opt max-size=10m**\
    Sets options for the log driver, such as limiting the log file size to 10 MB.

    - Once the limit is reached, Docker starts a new log file.

15. **--security-opt seccomp=unconfined**\
    Modifies security options.

    - The default seccomp profile can be replaced with unconfined to allow more syscalls.

16. **--user 1000:1000**\
    Runs the container as a specific user (UID 1000) and group (GID 1000).

    - By default, containers run as root, but it's best practice to run as a non-root user for security.

17. **--workdir /app**\
    Sets the working directory inside the container.

    - This is the directory where commands will be executed inside the container.

18. **--entrypoint /bin/bash**\
    Overrides the default entry point of the container image.

    - By default, Docker runs the image's CMD or ENTRYPOINT instructions, but this allows you to run a custom command (like opening a shell).

19. **my_image:latest**\
    Specifies the image and tag to use for the container.

    - In this case, the image is my_image and the tag is latest. If the tag is omitted, Docker assumes latest.

### Example: Running a Simple Nginx Container with Some Options

```bash
docker run -d --name my_nginx \\
```

-p 8080:80 \\

--memory 256m \\

nginx:latest

- Runs an Nginx container (nginx:latest).

- Binds port 80 in the container to port 8080 on the host.

- Limits the container to 256 MB of RAM.

- The container runs in detached mode with the name my_nginx.

This is just a demonstration of how flexible docker run can be. You can pick and choose options based on your specific needs. Let me know if you'd like any more details!
## Details example of docker build command?

Here’s a detailed example of the docker build command and an explanation of its components:

### Docker Build Command Example

```bash
docker build --file Dockerfile.prod \\
```

--build-arg APP_ENV=production \\

--target build-stage \\

--tag myapp:latest \\

--no-cache \\

--pull \\

--label "maintainer=you@example.com" \\

--compress \\

--memory 1g \\

--cpuset-cpus="0,1" \\

--build-arg SECRET_KEY=supersecret \\

/path/to/context

### Breakdown of the Command

1.  **--file Dockerfile.prod**\
    Specifies a different Dockerfile than the default (Dockerfile).

    - This is useful when you have multiple Dockerfiles (e.g., Dockerfile.dev, Dockerfile.prod) for different environments.

2.  **--build-arg APP_ENV=production**\
    Sets a build-time argument (ARG) that can be accessed within the Dockerfile.

    - In the Dockerfile, this would be accessed via ARG APP_ENV. Build arguments are useful for passing configuration data during the image build process.

3.  **--target build-stage**\
    Specifies the stage of a multi-stage build.

    - Multi-stage builds are used to optimize image size by separating build dependencies from runtime dependencies. This flag allows you to build only up to a specific stage (e.g., build-stage) in a multi-stage Dockerfile.

4.  **--tag myapp:latest**\
    Tags the resulting image with a name and tag.

    - In this case, the image will be tagged as myapp:latest. If the tag (latest) is omitted, Docker assumes the tag latest.

5.  **--no-cache**\
    Disables the cache during the build process.

    - Normally, Docker caches layers to speed up future builds, but sometimes, you might want to ensure a clean build without using cached layers (e.g., when files have changed).

6.  **--pull**\
    Always attempts to pull a newer version of the base image from the registry.

    - This ensures that you’re using the latest version of any base image in your Dockerfile (like node:14-alpine).

7.  **--label "maintainer=you@example.com"**\
    Adds a label to the image metadata.

    - Labels provide metadata for the image, like maintainers or version information. This can be useful for documenting images or for automated tools.

8.  **--compress**\
    Compresses the build context before sending it to the Docker daemon.

    - This can be helpful for speeding up the build process, especially if the build context (i.e., the files being used for the build) is large.

9.  **--memory 1g**\
    Limits the build process to use no more than 1 GB of RAM.

    - This can help in resource-constrained environments or to ensure that the build doesn’t consume too much memory.

10. **--cpuset-cpus="0,1"**\
    Restricts the build process to specific CPU cores (in this case, cores 0 and 1).

    - This is useful for controlling CPU resource usage during a build, especially in environments with many containers or processes running.

11. **--build-arg SECRET_KEY=supersecret**\
    Passes a secret build argument to the build process.

    - Though build arguments are not preserved in the final image (unlike environment variables), care should be taken when using them to pass sensitive data like SECRET_KEY. Docker does not keep this data secure in image history.

12. **/path/to/context**\
    Specifies the build context (the directory that contains the Dockerfile and associated files).

    - The context is what Docker uses during the build. If this is not specified, the current directory (.) is used as the context.

### Other Useful docker build Options

1.  **--squash**\
    Squashes all layers of the image into a single layer.

    - This helps reduce image size, but it is experimental in some Docker versions.

2.  **--rm**\
    Automatically removes intermediate containers after a successful build.

    - This is enabled by default to help clean up unnecessary build artifacts.

3.  **--force-rm**\
    Forces removal of intermediate containers even if the build fails.

    - This ensures that temporary build containers don’t remain after a failed build.

4.  **--shm-size**\
    Sets the size of /dev/shm (shared memory).

    - Useful for applications that rely on shared memory, such as databases or memory-intensive processes.

### Example: Building a Simple Image for Production

```bash
docker build --file Dockerfile.prod \\
```

--build-arg APP_ENV=production \\

--tag myapp:prod .

- This command uses a Dockerfile specifically for production (Dockerfile.prod).

- The APP_ENV build argument is passed as production.

- The resulting image is tagged as myapp:prod.

### Concepts to Understand

1.  **Build Context**

    - The build context refers to the set of files that Docker has access to when building an image. It’s essential to minimize the context by using .dockerignore to exclude unnecessary files and directories, improving both build speed and image size.

2.  **Layer Caching**

    - Docker caches each layer of the image to speed up future builds. Layers that don’t change between builds are reused from the cache. Understanding how layers work in Dockerfiles is key to creating efficient, fast builds.

3.  **Multi-Stage Builds**

    - This technique is used to create lean production images by separating build dependencies (e.g., compilers, build tools) from runtime dependencies (e.g., binaries, libraries). The --target option allows building only up to a specific stage, which can be helpful for testing intermediate stages.

4.  **Build Arguments**

    - Build arguments (--build-arg) are only available during the build process. Unlike environment variables, they are not persisted in the final image, so they are not accessible at runtime.
## List of Docker Compose Commands

1.  **docker-compose up**\
    Brings up all services defined in the docker-compose.yml file.

    - **-d**: Run services in detached mode (background).

    - **--build**: Builds images before starting the services (even if images are cached).

    - **--scale SERVICE=NUM**: Scale a specific service to a specified number of instances.

```bash
Example:
docker-compose up -d --build
```

2.  **docker-compose down**\
    Stops and removes all running containers, networks, and volumes created by up.

    - **--volumes**: Removes named volumes declared in the volumes section of the docker-compose.yml.

    - **--remove-orphans**: Removes containers that are no longer defined in the docker-compose.yml.

```bash
Example:
docker-compose down --volumes
```

3.  **docker-compose build**\
    Builds or rebuilds the services' images specified in the docker-compose.yml.

    - **--no-cache**: Builds the images without using any cached layers.

    - **--force-rm**: Forces the removal of intermediate containers used during the build process.

```bash
Example:
docker-compose build --no-cache
```

4.  **docker-compose start**\
    Starts already created services (containers).

    - Unlike up, this command doesn’t recreate or reattach the services; it simply starts them if they are stopped.

```bash
Example:
docker-compose start
```

5.  **docker-compose stop**\
    Stops running containers without removing them. You can later use docker-compose start to restart them.

```bash
Example:
docker-compose stop
```

6.  **docker-compose restart**\
    Restarts running services.

```bash
Example:
docker-compose restart
```

7.  **docker-compose ps**\
    Lists the status of all containers (services) defined in the docker-compose.yml file.

```bash
Example:
docker-compose ps
```

8.  **docker-compose logs**\
    Shows the logs of all services.

    - **-f**: Follows the logs (similar to tail -f).

    - **--tail N**: Shows the last N lines of the logs.

```bash
Example:
docker-compose logs -f
```

9.  **docker-compose exec**\
    Executes a command inside a running service container (similar to docker exec).

    - **-T**: Disables pseudo-TTY allocation (useful for piping data).

```bash
Example:
docker-compose exec SERVICE_NAME command
Example:
docker-compose exec web /bin/bash
```

10. **docker-compose run**\
    Runs a one-off command against a service. Unlike exec, run creates a new container for the command, based on the service's image.

    - **--rm**: Automatically removes the container after the command is executed.

    - **--service-ports**: Runs the container with the service’s ports enabled (useful when debugging or testing).

```bash
Example:
docker-compose run --rm web /bin/bash
```

11. **docker-compose config**\
    Validates and displays the current configuration based on the docker-compose.yml file.

    - **--services**: Lists all services in the configuration.

    - **--volumes**: Lists all named volumes in the configuration.

```bash
Example:
docker-compose config --services
```

12. **docker-compose pull**\
    Pulls the latest images for services defined in the docker-compose.yml file from the registry.

    - This is useful to ensure you have the latest version of an image before running the services.

```bash
Example:
docker-compose pull
```

13. **docker-compose rm**\
    Removes stopped service containers.

    - **-f**: Forces removal without confirmation.

    - **-v**: Removes any anonymous volumes attached to containers.

```bash
Example:
docker-compose rm -f
```

14. **docker-compose scale**\
    Scales a specific service to the number of replicas you define. This is useful for load balancing and high availability setups.

    - This command is deprecated in favor of docker-compose up --scale.

```bash
Example:
docker-compose scale web=3
```

15. **docker-compose version**\
    Displays the version of Docker Compose installed.

```bash
Example:
docker-compose version
```

16. **docker-compose top**\
    Displays the processes running inside the containers managed by Docker Compose.

```bash
Example:
docker-compose top
```

17. **docker-compose port**\
    Displays the mapped port for a service.

```bash
Example:
docker-compose port SERVICE_NAME CONTAINER_PORT
Example:
docker-compose port web 80
```

18. **docker-compose events**\
    Monitors real-time events from containers managed by Docker Compose.

```bash
Example:
docker-compose events
```

### Docker Compose Command Workflow Example

Here’s how you might use Docker Compose in a workflow:

1.  **Build images** for your services:

```bash
docker-compose build
```

2.  **Start the services** in detached mode:

```bash
docker-compose up -d
```

3.  **View the status** of running containers:

```bash
docker-compose ps
```

4.  **Check the logs** of all running services:

```bash
docker-compose logs -f
```

5.  **Execute a command** inside a running container:

```bash
docker-compose exec web /bin/bash
```

6.  **Stop all services**:

```bash
docker-compose stop
```

7.  **Remove the containers** and volumes:

```bash
docker-compose down --volumes
```
## Details example of docker compose file?

Here's an example of a **Docker Compose file** for an application that includes both **Angular** (frontend) and **.NET Core** (backend). The setup also includes a **proxy** service using **Nginx** to route traffic between the frontend and backend.

### **Directory Structure**

Before diving into the docker-compose.yml, here’s a basic structure you might have for your project:

/my-project

```bash
├── docker-compose.yml
```

├── backend/ # .NET Core application

│ └── Dockerfile

├── frontend/ # Angular application

│ └── Dockerfile

└── nginx/ # Nginx reverse proxy

└── default.conf # Nginx configuration

### **Docker Compose File:** docker-compose.yml

```bash
version: '3.8'
services:
```

# Angular Frontend Service

frontend:

build:

context: ./frontend

dockerfile: Dockerfile

container_name: angular_app

ports:

```bash
- "4200:80" # Exposing Angular on port 4200 (default Angular dev server port)
```

depends_on:

- backend

networks:

- app-network

# .NET Core Backend Service

backend:

build:

context: ./backend

dockerfile: Dockerfile

container_name: dotnet_app

ports:

```bash
- "5000:80" # Exposing .NET Core API on port 5000
```

networks:

- app-network

# Nginx Proxy Service

proxy:

image: nginx:alpine

container_name: nginx_proxy

volumes:

```bash
- ./nginx/default.conf:/etc/nginx/conf.d/default.conf
```

ports:

```bash
- "80:80" # Exposing Nginx on port 80 for HTTP requests
```

depends_on:

- frontend

- backend

networks:

- app-network

# Network for inter-service communication

networks:

app-network:

driver: bridge

### **Explanation of the** docker-compose.yml

#### 1. **Version**

The version 3.8 is the Docker Compose file format version. It’s compatible with newer Docker versions and supports advanced features.

#### 2. **Services**

The services section defines all the services (containers) that will be part of your application.

##### Frontend (Angular)

- **build**: Points to the Dockerfile located in the frontend/ directory.

  - **context**: The build context is set to ./frontend, meaning it will look for the Angular app’s Dockerfile in that directory.

  - **dockerfile**: Specifies the Dockerfile to use when building the image.

- **container_name**: Name of the container that will be created (angular_app).

- **ports**: Maps the container’s internal port 80 (the default HTTP port inside the container) to the host’s port 4200, which is typically the default Angular development port.

- **depends_on**: Indicates that the frontend service depends on the backend service to start, ensuring that the backend is ready when the frontend starts.

- **networks**: Defines the app-network where all services can communicate.

##### Backend (.NET Core API)

- **build**: Similar to the frontend, but points to the ./backend folder where the .NET Core project’s Dockerfile resides.

- **ports**: Exposes port 5000 on the host and maps it to the internal port 80 inside the container where the .NET Core app will be running.

- **networks**: Connected to the same app-network, allowing the frontend to communicate with the backend.

##### Nginx (Reverse Proxy)

- **image**: Uses the official nginx:alpine image from Docker Hub, a lightweight version of Nginx.

- **volumes**: Mounts the Nginx configuration file default.conf (explained below) to the container’s Nginx configuration directory.

- **ports**: Exposes port 80 to handle HTTP requests from the host, acting as a reverse proxy to forward requests between the Angular and .NET Core apps.

- **depends_on**: Ensures that Nginx waits for both the frontend and backend services to start before it starts.

- **networks**: Also connected to the same app-network.

#### 3. **Networks**

- **app-network**: A bridge network used to allow communication between the Angular, .NET Core, and Nginx services. This ensures that containers can reference each other by their service names (e.g., frontend can communicate with backend).

### **Frontend Dockerfile (**frontend/Dockerfile**)**

This Dockerfile is for building the Angular app.

# Stage 1: Build the Angular application

```bash
FROM node:16-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --prod
```

# Stage 2: Serve the app with Nginx

```bash
FROM nginx:alpine
COPY --from=build /app/dist/angular-app /usr/share/nginx/html
EXPOSE 80
```

- **Stage 1**: The Angular application is built using a Node.js image. It copies the package.json files, installs dependencies, and builds the Angular application.

- **Stage 2**: The build output (Angular files) is then copied to an Nginx container, which serves the static files.

### **Backend Dockerfile (**backend/Dockerfile**)**

This Dockerfile is for building the .NET Core API.

# Use the official .NET Core SDK image to build the application

```bash
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
```

# Copy the .NET Core project files and restore dependencies

```bash
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
```

# Build the application

```bash
RUN dotnet build -c Release -o /app/build
```

# Publish the application

```bash
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish
```

# Serve the .NET Core application

```bash
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MyApi.dll"]
```

- **Stage 1**: Sets up the working directory, restores dependencies, and builds the .NET Core project.

- **Stage 2**: Publishes the application for deployment.

- **Final Stage**: Uses the official .NET Core runtime to run the published application.

### **Nginx Configuration (**nginx/default.conf**)**

Here’s a basic configuration file for Nginx that acts as a reverse proxy to forward traffic to both Angular and .NET Core apps.

```bash
server {
listen 80;
location / {
proxy_pass http://frontend:80; # Proxy traffic to the Angular frontend
}
location /api/ {
proxy_pass http://backend:80; # Proxy API requests to the .NET Core backend
}
}
```

- **location /**: Routes all root traffic (/) to the Angular app.

- **location /api/**: Routes requests with /api/ to the .NET Core backend.

### **How It Works**

1.  **Angular (Frontend)**: Runs the Angular app and makes requests to the backend API.

2.  **.NET Core (Backend)**: Exposes an API for the frontend.

3.  **Nginx**: Acts as a reverse proxy, directing frontend requests to the Angular app and API requests to the .NET Core backend.

By using **Docker Compose**, you can easily manage the multiple services (Angular, .NET Core, and Nginx) in a single environment. Running docker-compose up will spin up the entire environment with one command, while keeping services isolated and containerized.
