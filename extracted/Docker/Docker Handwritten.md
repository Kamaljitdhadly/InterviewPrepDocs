1)  **Docker**– A docker is a tool for creating and managing containers <img src="media/image1.png" style="width:9in;height:5.035in" /><img src="media/image2.png" style="width:9in;height:3.72972in" />

2)  **Docker Compose** – Managing more complex and multi container easier

3)  **docker run -p 3000:3000 imagename - the -p flag is used to publish a container's port(s) to the host.** **3000:3000 means that port 3000 on the host machine is being mapped to port 3000 inside the Docker container.**

4)  **Docker ps(process) -** to list running container

5)  **CMD VS RUN –** CMD will not be executed when image is created, It will be executed when container is started whereas run command will be executed when image is created. If donot specify the CMD in docterfile, then CMD of base image will be executed. With no base image and no CMD, you will get an error

6)  In DockerFile every instruction creates a layer and each layer are cached, when one layer change then all other layer are also rebuild

7)  In some instances the data should not be lost on removal of container. We need to use conatiner volumes

8)  **Volumes –** Volumes are folders on your host machine hard drive which are mounted(“made available”, mapped) into containers. Volumes are managed by docker so we do not know the path on hosting machine where data is being stored. There are two types of volumes 1) named and anonymous

9)  **Named Volumnes – Named Volume survive container removal and can therefore be used to store persistent data**

10) **Anonymous volumes -** Anonymous Volumes are attached to a container – therefore can be used to save (temporary) data inside the container

11) **Bind Mounts –** Bind mounts are the folder on your host machine which are specified by the user and mounted into the containers – like named volumes. in case of bind mounts we do not need to rebuild the image again and again in case of development changes. Container will have access to latest code.

12) Docker supports build-time arguments and runtime environment variable

13) **Host.docker.internal** – this will be translated to ipadress of your local host machine as seen from inside the container

14) If we have Frontend, backend, Database, running in container, they can communicate with each other through localhost because we have publish their ports. Another way of communication is through **network**, they can directly talk with each other

15) **Network** - <img src="media/image3.png" style="width:9in;height:4.88575in" />

16) for communication - name of containers gets automatically resolved to IP address if containers belong to same network

17) **Docker Compose** – Its is used to manage multiple containers on same host but not suitable for managing multiple containers on different hosts(machine). The idea is basically to replace long lengthy docker run command with docker compose file for multiple container.<img src="media/image4.png" style="width:9in;height:4.47703in" />

18) **Docker exec** – docker exec commands allows you to run additional command besides from the cmd written in dockerfile

19) If you specify command in docker run command after the image name, then **cmd** command in dockerfile will be overwritten

20) **Entrypoint command -** If you specify command in docker run command after the image name, then that command will be appended with entrypoint command mentioned in dockerfile

21) Bind mounts should not be used in production

22) **SSH –** ‘sudo’ ensures that the command is executed as a root user / with sufficient permission

23) **Multi-stage Builds –** Multi stage build is helpful when you have multiple steps like in angular you have build step, then you deploy your application in second step. So in dockerfile you can copy content from one stage to another stage. With –target flag you can specify upto which stage you want to continue and then stop.
