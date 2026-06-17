Kubernetes has a comprehensive set of commands for managing various aspects of your cluster. Here’s a list of some commonly used kubectl commands:

**Cluster Management**

- kubectl cluster-info: Displays cluster info.

- kubectl config view: Shows the kubeconfig file.

**Pods**

- kubectl get pods: Lists all pods.

- kubectl describe pod \<pod-name\>: Shows detailed information about a specific pod.

- kubectl logs \<pod-name\>: Fetches logs from a pod.

- kubectl exec -it \<pod-name\> -- /bin/bash: Opens an interactive shell in a pod.

**Deployments**

- kubectl get deployments: Lists deployments.

- kubectl describe deployment \<deployment-name\>: Shows details about a deployment.

- kubectl rollout status deployment/\<deployment-name\>: Checks the status of a deployment rollout.

- kubectl scale deployment \<deployment-name\> --replicas=\<number\>: Scales the number of replicas.

**Services**

- kubectl get services: Lists services.

- kubectl describe service \<service-name\>: Shows detailed information about a service.

**Namespaces**

- kubectl get namespaces: Lists namespaces.

- kubectl describe namespace \<namespace-name\>: Shows details about a namespace.

**ConfigMaps and Secrets**

- kubectl get configmaps: Lists config maps.

- kubectl describe configmap \<configmap-name\>: Shows details about a config map.

- kubectl get secrets: Lists secrets.

- kubectl describe secret \<secret-name\>: Shows details about a secret.

**Nodes**

- kubectl get nodes: Lists nodes.

- kubectl describe node \<node-name\>: Shows detailed information about a node.

**StatefulSets, ReplicaSets, and Jobs**

- kubectl get statefulsets: Lists stateful sets.

- kubectl describe statefulset \<statefulset-name\>: Shows details about a stateful set.

- kubectl get replicasets: Lists replica sets.

- kubectl describe replicaset \<replicaset-name\>: Shows details about a replica set.

- kubectl get jobs: Lists jobs.

- kubectl describe job \<job-name\>: Shows details about a job.

**Other Commands**

- kubectl apply -f \<file\>: Applies a configuration from a file.

- kubectl create -f \<file\>: Creates resources from a file.

- kubectl delete -f \<file\>: Deletes resources from a file.

- kubectl edit \<resource\> \<name\>: Edits a resource in your editor.

For a more complete list of commands and options, you can always use kubectl --help or check the official Kubernetes documentation.

To deploy your .NET and Angular applications to Kubernetes, you need to create Kubernetes manifests that define the necessary resources, such as deployments, services, and potentially ingress controllers.

Here’s how you can set up Kubernetes manifests for both your .NET and Angular applications:

**1. Deployment and Service for .NET Application**

**dotnet-deployment.yaml**

apiVersion: apps/v1

kind: Deployment

metadata:

name: dotnet-app

labels:

app: dotnet

spec:

replicas: 2

selector:

matchLabels:

app: dotnet

template:

metadata:

labels:

app: dotnet

spec:

containers:

\- name: dotnet-app

image: your-dockerhub-username/dotnet-app:latest

ports:

\- containerPort: 80

---

apiVersion: v1

kind: Service

metadata:

name: dotnet-service

spec:

selector:

app: dotnet

ports:

\- protocol: TCP

port: 80

targetPort: 80

type: ClusterIP

**2. Deployment and Service for Angular Application**

**angular-deployment.yaml**

apiVersion: apps/v1

kind: Deployment

metadata:

name: angular-app

labels:

app: angular

spec:

replicas: 2

selector:

matchLabels:

app: angular

template:

metadata:

labels:

app: angular

spec:

containers:

\- name: angular-app

image: your-dockerhub-username/angular-app:latest

ports:

\- containerPort: 80

---

apiVersion: v1

kind: Service

metadata:

name: angular-service

spec:

selector:

app: angular

ports:

\- protocol: TCP

port: 80

targetPort: 80

type: LoadBalancer

**3. Optional: Ingress Configuration**

If you want to expose these services outside of your Kubernetes cluster using an ingress controller (e.g., Nginx Ingress Controller), you can create an ingress resource.

**ingress.yaml**

apiVersion: networking.k8s.io/v1

kind: Ingress

metadata:

name: app-ingress

annotations:

nginx.ingress.kubernetes.io/rewrite-target: /

spec:

rules:

\- host: angular.example.com

http:

paths:

\- path: /

pathType: Prefix

backend:

service:

name: angular-service

port:

number: 80

\- host: dotnet.example.com

http:

paths:

\- path: /

pathType: Prefix

backend:

service:

name: dotnet-service

port:

number: 80

**Explanation of Each File**

1.  **dotnet-deployment.yaml and angular-deployment.yaml**

    - **Deployment**: Defines a set of replicas (pods) for the application. Each pod runs a container with the specified Docker image.

      - **replicas**: Number of pod replicas.

      - **selector**: Ensures that the deployment manages pods with the specified labels.

      - **containers**: Defines the container to run, including the Docker image and port mapping.

    - **Service**: Exposes the deployment internally within the cluster or externally.

      - **type: ClusterIP**: Exposes the service only within the cluster.

      - **type: LoadBalancer**: Exposes the service externally via a cloud provider's load balancer.

2.  **ingress.yaml** (Optional)

    - **Ingress**: Manages external access to services in the cluster. It routes HTTP/HTTPS traffic based on the rules defined.

      - **rules**: Defines routing rules based on the host and path. This example routes traffic for angular.example.com to the Angular service and dotnet.example.com to the .NET service.

      - **annotations**: Optional configuration for Ingress controllers, such as rewriting URLs.

**Deploying to Kubernetes**

1.  **Apply the manifests**:

> kubectl apply -f dotnet-deployment.yaml
>
> kubectl apply -f angular-deployment.yaml
>
> kubectl apply -f ingress.yaml

2.  **Verify the deployments**:

> kubectl get deployments
>
> kubectl get services
>
> kubectl get pods
>
> kubectl get ingress

3.  **Update Docker Images**: Ensure that the image names in the manifests (your-dockerhub-username/dotnet-app:latest and your-dockerhub-username/angular-app:latest) match your actual Docker images.

These manifests set up the necessary resources to deploy and expose your Angular and .NET applications in a Kubernetes cluster.

The dotnet-deployment.yaml file is a Kubernetes manifest used to deploy a .NET application to a Kubernetes cluster. It defines a Deployment and a Service for the .NET application. Here’s a detailed breakdown of each section:

**dotnet-deployment.yaml**

apiVersion: apps/v1

kind: Deployment

metadata:

name: dotnet-app

labels:

app: dotnet

spec:

replicas: 2

selector:

matchLabels:

app: dotnet

template:

metadata:

labels:

app: dotnet

spec:

containers:

\- name: dotnet-app

image: your-dockerhub-username/dotnet-app:latest

ports:

\- containerPort: 80

---

apiVersion: v1

kind: Service

metadata:

name: dotnet-service

spec:

selector:

app: dotnet

ports:

\- protocol: TCP

port: 80

targetPort: 80

type: ClusterIP

**Deployment**

1.  **apiVersion: apps/v1**

    - **Explanation**: Specifies the API version for the Deployment resource. apps/v1 is the current stable version used for deploying applications.

2.  **kind: Deployment**

    - **Explanation**: Defines the type of resource being created. In this case, it's a Deployment, which manages a set of replica pods.

3.  **metadata**

    - **name: dotnet-app**: The name of the Deployment. This is a unique identifier within the namespace.

    - **labels**: Labels are key-value pairs attached to the Deployment. They are used for organizing and selecting resources. Here, app: dotnet is used to identify this Deployment.

4.  **spec**

    - **replicas: 2**: Specifies the number of pod replicas that should be running. In this case, it ensures there are always 2 instances of the application running.

    - **selector**

      - **matchLabels**: Defines how the Deployment finds which pods to manage. It looks for pods with the label app: dotnet.

    - **template**

      - **metadata**

        - **labels**: Labels applied to the pods created by this Deployment. They must match the selector labels to be managed by this Deployment.

      - **spec**

        - **containers**

          - **name: dotnet-app**: Name of the container within the pod.

          - **image: your-dockerhub-username/dotnet-app:latest**: Specifies the Docker image to use for the container. Replace your-dockerhub-username/dotnet-app:latest with your actual Docker image name.

          - **ports**

            - **containerPort: 80**: The port on which the application inside the container is listening.

**Service**

1.  **apiVersion: v1**

    - **Explanation**: Specifies the API version for the Service resource. v1 is the stable version used for creating Services.

2.  **kind: Service**

    - **Explanation**: Defines the type of resource being created. In this case, it's a Service, which exposes a set of pods.

3.  **metadata**

    - **name: dotnet-service**: The name of the Service. This is used to reference the Service within the cluster.

4.  **spec**

    - **selector**

      - **app: dotnet**: Specifies the label selector used to determine which pods the Service should route traffic to. It must match the labels on the pods created by the Deployment.

    - **ports**

      - **protocol: TCP**: The protocol used by the Service (TCP in this case).

      - **port: 80**: The port on which the Service will be exposed within the cluster.

      - **targetPort: 80**: The port on the container to which the Service forwards traffic. This should match the containerPort defined in the Deployment.

    - **type: ClusterIP**

      - **Explanation**: Specifies the type of Service. ClusterIP exposes the Service only within the cluster, meaning it can be accessed by other pods but not from outside the cluster.

**Summary**

- **Deployment**: Manages a set of pod replicas for your .NET application, ensuring the desired number of pods are running and available.

- **Service**: Exposes the Deployment internally within the cluster, routing traffic to the pods based on the selector and port configuration.

These resources ensure that your .NET application is deployed and accessible within the Kubernetes cluster.

The ingress.yaml file is a Kubernetes manifest used to define ingress rules that control how external HTTP/HTTPS traffic is routed to services within your Kubernetes cluster. Ingress resources allow you to expose your applications to the outside world and manage access using domain names and paths.

Here’s a breakdown of the ingress.yaml file example provided earlier:

**Example ingress.yaml**

apiVersion: networking.k8s.io/v1

kind: Ingress

metadata:

name: app-ingress

annotations:

nginx.ingress.kubernetes.io/rewrite-target: /

spec:

rules:

\- host: angular.example.com

http:

paths:

\- path: /

pathType: Prefix

backend:

service:

name: angular-service

port:

number: 80

\- host: dotnet.example.com

http:

paths:

\- path: /

pathType: Prefix

backend:

service:

name: dotnet-service

port:

number: 80

**Breakdown of Each Section**

1.  **apiVersion: networking.k8s.io/v1**

    - **Explanation**: Specifies the API version for the Ingress resource. networking.k8s.io/v1 is the stable version used for defining Ingress rules.

2.  **kind: Ingress**

    - **Explanation**: Defines the type of resource being created. In this case, it’s an Ingress resource, which manages external access to services.

3.  **metadata**

    - **name: app-ingress**: The name of the Ingress resource. This name is used to identify the Ingress within the namespace.

    - **annotations**

      - **nginx.ingress.kubernetes.io/rewrite-target: /**: An annotation used to configure specific behavior of the Ingress controller. This particular annotation tells Nginx to rewrite the URL path to / before forwarding the request to the backend service. This is useful when you want to remove or change part of the URL path.

4.  **spec**

    - **rules**: Defines the routing rules for the Ingress. Each rule specifies how to handle incoming requests based on the request's host and path.

      - **host: angular.example.com**: Specifies the domain name for the rule. Requests to this host will be routed according to the defined paths.

        - **http**

          - **paths**

            - **path: /**: The path prefix to match for this rule. In this case, it matches all paths (/).

            - **pathType: Prefix**: Defines how the path should be matched. Prefix means that the path matches if it starts with the specified path.

            - **backend**

              - **service**

                - **name: angular-service**: The name of the Service to route traffic to. This should match the name of the Service defined in your angular-deployment.yaml.

                - **port**

                  - **number: 80**: The port on the Service to route traffic to. This should match the port exposed by the Service.

      - **host: dotnet.example.com**: Specifies the domain name for the second rule. Requests to this host will be routed according to the defined paths.

        - **http**

          - **paths**

            - **path: /**: Matches all paths (/).

            - **pathType: Prefix**: Matches if the path starts with /.

            - **backend**

              - **service**

                - **name: dotnet-service**: The name of the Service to route traffic to. This should match the name of the Service defined in your dotnet-deployment.yaml.

                - **port**

                  - **number: 80**: The port on the Service to route traffic to. This should match the port exposed by the Service.

**Summary**

- **Ingress**: Manages external HTTP/HTTPS access to your services within the Kubernetes cluster.

- **Rules**: Define how requests are routed based on the host and path. Each rule directs traffic to a specific backend service.

- **Annotations**: Optional settings for configuring the behavior of the Ingress controller.

In this example, the Ingress routes traffic for angular.example.com to the angular-service and traffic for dotnet.example.com to the dotnet-service. This allows you to access your Angular and .NET applications via their respective domain names.

In a real microservice application deployed on Kubernetes, you’ll likely need a variety of Kubernetes YAML files to manage different aspects of your deployment. Here’s an overview of common types of YAML files you might have:

**1. Deployment**

**Purpose**: Manages the deployment of application pods. It ensures that a specified number of pod replicas are running and updates them in a controlled manner.

**Example**:

apiVersion: apps/v1

kind: Deployment

metadata:

name: my-service

spec:

replicas: 3

selector:

matchLabels:

app: my-service

template:

metadata:

labels:

app: my-service

spec:

containers:

\- name: my-service-container

image: my-registry/my-service:latest

ports:

\- containerPort: 80

**2. Service**

**Purpose**: Exposes a set of pods as a network service. It provides a stable IP address and DNS name for accessing the pods.

**Example**:

apiVersion: v1

kind: Service

metadata:

name: my-service

spec:

selector:

app: my-service

ports:

\- protocol: TCP

port: 80

targetPort: 80

type: ClusterIP

**3. Ingress**

**Purpose**: Manages external access to the services, typically HTTP or HTTPS traffic. Routes requests to the appropriate service based on the host and path.

**Example**:

apiVersion: networking.k8s.io/v1

kind: Ingress

metadata:

name: my-ingress

annotations:

nginx.ingress.kubernetes.io/rewrite-target: /

spec:

rules:

\- host: service1.example.com

http:

paths:

\- path: /

pathType: Prefix

backend:

service:

name: service1

port:

number: 80

\- host: service2.example.com

http:

paths:

\- path: /

pathType: Prefix

backend:

service:

name: service2

port:

number: 80

**4. ConfigMap**

**Purpose**: Stores configuration data as key-value pairs that can be used by pods. It decouples configuration from container images.

**Example**:

apiVersion: v1

kind: ConfigMap

metadata:

name: my-config

data:

app.config: \|

key1=value1

key2=value2

**5. Secret**

**Purpose**: Stores sensitive information such as passwords, OAuth tokens, and ssh keys. Provides a way to securely manage and use sensitive data.

**Example**:

apiVersion: v1

kind: Secret

metadata:

name: my-secret

type: Opaque

data:

password: dGVzdHBhc3M= \# Base64 encoded value of 'testpass'

**6. PersistentVolume (PV) and PersistentVolumeClaim (PVC)**

**Purpose**: Manages storage resources in Kubernetes. PV defines the storage resource, and PVC requests and binds to a PV.

**PersistentVolume**:

apiVersion: v1

kind: PersistentVolume

metadata:

name: my-pv

spec:

capacity:

storage: 1Gi

accessModes:

\- ReadWriteOnce

hostPath:

path: /mnt/data

**PersistentVolumeClaim**:

apiVersion: v1

kind: PersistentVolumeClaim

metadata:

name: my-pvc

spec:

accessModes:

\- ReadWriteOnce

resources:

requests:

storage: 1Gi

**7. Namespace**

**Purpose**: Creates a logical partition within the Kubernetes cluster, allowing for isolation and organization of resources.

**Example**:

apiVersion: v1

kind: Namespace

metadata:

name: my-namespace

**8. HorizontalPodAutoscaler**

**Purpose**: Automatically scales the number of pods in a deployment based on CPU usage or other metrics.

**Example**:

apiVersion: autoscaling/v1

kind: HorizontalPodAutoscaler

metadata:

name: my-hpa

spec:

scaleTargetRef:

apiVersion: apps/v1

kind: Deployment

name: my-service

minReplicas: 1

maxReplicas: 10

targetCPUUtilizationPercentage: 80

**9. Job**

**Purpose**: Creates one or more pods that run a batch task until completion. Useful for tasks that need to run to completion.

**Example**:

apiVersion: batch/v1

kind: Job

metadata:

name: my-job

spec:

template:

spec:

containers:

\- name: my-job-container

image: my-registry/my-job:latest

command: \["python", "script.py"\]

restartPolicy: OnFailure

**Summary**

- **Deployment**: Manages the desired state of your pods and their replicas.

- **Service**: Provides stable network access to your pods.

- **Ingress**: Manages external access and routing of HTTP/HTTPS traffic.

- **ConfigMap**: Stores configuration data.

- **Secret**: Stores sensitive data securely.

- **PersistentVolume & PersistentVolumeClaim**: Manages persistent storage.

- **Namespace**: Organizes and isolates resources.

- **HorizontalPodAutoscaler**: Automatically scales pod replicas based on metrics.

- **Job**: Runs batch tasks to completion.

These YAML files cover many of the essential components you’ll need in a microservices architecture. Depending on your application's complexity and requirements, you may also use other Kubernetes resources like StatefulSets, DaemonSets, or Custom Resource Definitions (CRDs)

In Kubernetes, a **Service** is an abstraction that defines a logical set of Pods and a policy by which to access them. Services enable loose coupling between dependent Pods. There are several types of Services in Kubernetes, each designed to handle different use cases:

1.  **ClusterIP (default)**:

    - **Description**: Exposes the Service on an internal IP in the cluster. This type of Service makes the application accessible only within the cluster.

    - **Use Case**: Suitable for microservices architectures where services need to communicate with each other internally.

2.  **NodePort**:

    - **Description**: Exposes the Service on the same port of each selected Node in the cluster using NAT. External traffic can access the Service using \<NodeIP\>:\<NodePort\>.

    - **Use Case**: Useful for development or testing purposes when you need to expose a service on a specific port of each Node.

3.  **LoadBalancer**:

    - **Description**: Exposes the Service externally using a cloud provider’s load balancer. The cloud provider will automatically provision a load balancer and associate it with the Service.

    - **Use Case**: Ideal for exposing services to external clients in production environments on supported cloud platforms (e.g., AWS, GCP, Azure).

4.  **ExternalName**:

    - **Description**: Maps a Service to the contents of the externalName field (e.g., example.com). This does not create any proxying but returns a CNAME record with the value of externalName.

    - **Use Case**: Useful for integrating external services (e.g., legacy applications or services not running in Kubernetes) using Kubernetes service discovery.

5.  **Headless Service**:

    - **Description**: Allows direct access to individual Pods without a stable IP. You create a headless Service by setting the clusterIP field to None.

    - **Use Case**: Used for applications that require direct access to individual Pods (e.g., StatefulSets) or when managing service discovery through DNS.

**Additional Concepts**

- **Ingress**: Although not a type of Service, Ingress is an API object that manages external access to the services in a cluster, typically HTTP/HTTPS. Ingress can provide load balancing, SSL termination, and name-based virtual hosting.

- **Service Mesh**: A layer on top of your services to manage traffic between microservices, often providing advanced capabilities like traffic management, service discovery, and security.

Each type of Service has its own use case and is designed to meet specific networking needs within Kubernetes environments.
