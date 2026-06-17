# Namespaces & RBAC

## Concept Explanation

**Namespaces** provide a virtual partition within a cluster — a way to group and isolate resources (by team, environment, app). They scope names (two `web` Services can coexist in different namespaces), enable **resource quotas**, and are a unit for access control. Cluster-wide objects (nodes, PVs, namespaces themselves) are *not* namespaced.

**RBAC (Role-Based Access Control)** governs *who can do what*:
- **Role** — permissions (verbs like get/list/create on resources) **within a namespace**.
- **ClusterRole** — permissions cluster-wide or for cluster-scoped resources.
- **RoleBinding / ClusterRoleBinding** — grant a Role/ClusterRole to a **subject** (user, group, or **ServiceAccount**).

**ServiceAccounts** are identities for Pods/processes (apps) — distinct from human users.

## Code Example(s)

```yaml
apiVersion: v1
kind: Namespace
metadata: { name: team-a }
---
# Role: read-only access to pods in team-a
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { namespace: team-a, name: pod-reader }
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
---
# Bind the Role to a ServiceAccount
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { namespace: team-a, name: read-pods }
subjects:
  - kind: ServiceAccount
    name: ci-bot
    namespace: team-a
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

```bash
kubectl get ns
kubectl get pods -n team-a
kubectl auth can-i delete pods -n team-a --as=system:serviceaccount:team-a:ci-bot
```

## Interview Q&A

**🟢 What is a namespace and why use one?**
A virtual cluster partition for grouping/isolating resources by team, environment, or app. It scopes names, enables quotas, and is a boundary for RBAC.

**🟢 What is RBAC?**
Role-Based Access Control — Kubernetes authorization that grants subjects (users, groups, ServiceAccounts) specific verbs on specific resources via Roles/ClusterRoles and bindings.

**🟡 What's the difference between a Role and a ClusterRole?**
A Role grants permissions within a single namespace. A ClusterRole grants cluster-wide permissions or access to cluster-scoped resources (nodes, PVs); it can also be reused across namespaces via RoleBindings.

**🟡 What is a ServiceAccount?**
An identity for processes running in Pods (not human users). Pods authenticate to the API server as their ServiceAccount; RBAC controls what that account can do.

**🔴 Do namespaces provide security isolation?**
Not by themselves — they isolate names and enable quotas/RBAC, but Pods in different namespaces can still reach each other over the network by default. True isolation needs **NetworkPolicies**, RBAC, and possibly separate clusters.

## ⚠️ Tricky / Gotchas

- **Namespaces are NOT a network boundary.** By default all Pods can talk to each other across namespaces; you need **NetworkPolicies** to restrict traffic. A very common misconception.
- **Not everything is namespaced** — nodes, PersistentVolumes, ClusterRoles, and namespaces themselves are cluster-scoped. `kubectl get pv -n x` ignores the namespace.
- **RBAC is additive and deny-by-default** — there are no "deny" rules; you grant the minimum and the absence of a grant means denied.
- **The default ServiceAccount** is auto-mounted into Pods; leaving it over-privileged is a security risk — disable automount or scope it down.
- **ResourceQuota / LimitRange per namespace** can block Pod creation if requests aren't set — leading to confusing "forbidden: exceeded quota" errors.

## 📌 Quick Recap

- Namespace = virtual partition for grouping/isolation, name-scoping, quotas, RBAC boundary.
- Namespaces are NOT network isolation — use NetworkPolicies for that.
- RBAC: Role (namespaced) / ClusterRole (cluster-wide) + RoleBinding/ClusterRoleBinding to subjects.
- ServiceAccount = identity for Pods/apps; lock down the default one.
- RBAC is additive, deny-by-default (no explicit deny rules).
- Cluster-scoped resources (nodes, PVs, ClusterRoles) aren't namespaced.
