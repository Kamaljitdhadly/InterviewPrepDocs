# Volumes & Persistent Storage

## Concept Explanation

Pods are ephemeral, so on-disk data vanishes when a Pod restarts. Kubernetes storage abstractions provide durable, decoupled storage:

- **Volume** — storage tied to a Pod's lifecycle (e.g. `emptyDir` — scratch space deleted with the Pod).
- **PersistentVolume (PV)** — a piece of cluster storage (disk, NFS, cloud disk) provisioned by an admin or dynamically. Independent of any Pod.
- **PersistentVolumeClaim (PVC)** — a *request* for storage by a user/Pod (size, access mode). K8s **binds** a PVC to a matching PV.
- **StorageClass** — defines a "type" of storage and enables **dynamic provisioning** (auto-create a PV when a PVC is made).

**Access modes:** `ReadWriteOnce` (one node), `ReadOnlyMany`, `ReadWriteMany` (many nodes — needs networked storage).

## Code Example(s)

```yaml
# PVC requests storage; StorageClass dynamically provisions a PV
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes: ["ReadWriteOnce"]
  storageClassName: managed-csi
  resources:
    requests:
      storage: 5Gi
---
apiVersion: v1
kind: Pod
metadata: { name: db }
spec:
  containers:
    - name: postgres
      image: postgres:16
      volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: data-pvc
```

```bash
kubectl get pv,pvc,storageclass
kubectl describe pvc data-pvc      # see binding status / events
```

## Interview Q&A

**🟢 Why do Pods need PersistentVolumes?**
Because Pod storage is ephemeral. PVs provide storage that outlives the Pod, so data (e.g. a database) survives Pod restarts and rescheduling.

**🟡 What's the difference between a PV and a PVC?**
A PV is the actual provisioned storage resource. A PVC is a request/claim for storage with desired size and access mode. K8s binds a PVC to a suitable PV — separating the "what I need" (PVC) from the "what exists" (PV).

**🟡 What is a StorageClass?**
A template describing a type of storage and its provisioner. It enables dynamic provisioning — when a PVC references a StorageClass, K8s automatically creates a matching PV (e.g. a cloud disk).

**🟡 What are access modes?**
`ReadWriteOnce` (mounted read-write by a single node), `ReadOnlyMany` (read-only by many nodes), `ReadWriteMany` (read-write by many nodes — requires shared/networked storage like NFS).

**🔴 How do StatefulSets handle storage differently from Deployments?**
StatefulSets use `volumeClaimTemplates` to give *each* Pod its own stable, persistent PVC (e.g. `data-mysql-0`, `data-mysql-1`) that survives rescheduling — essential for databases. Deployment Pods typically share or use ephemeral storage.

## ⚠️ Tricky / Gotchas

- **`ReadWriteOnce` means one *node*, not one Pod** — multiple Pods on the *same* node can share it, but Pods on different nodes can't. Many assume it's strictly one Pod.
- **`ReadWriteMany` requires special storage** (NFS, Azure Files, etc.) — most cloud block disks only support RWO. Requesting RWX on a block disk fails to schedule.
- **Reclaim policy matters:** a PV's `persistentVolumeReclaimPolicy` (`Retain`/`Delete`) decides whether the underlying storage is deleted when the PVC is removed — `Delete` can wipe data.
- **PVC stuck `Pending`** usually means no matching PV / no default StorageClass / unsatisfiable access mode.
- **`emptyDir` is not persistent** — it's deleted with the Pod; don't use it for important data.

## 📌 Quick Recap

- Pod storage is ephemeral; PV/PVC provide durable, decoupled storage.
- PV = actual storage; PVC = request; StorageClass = dynamic provisioning template.
- Access modes: RWO (one node), ROX (many read-only), RWX (many read-write, needs shared storage).
- StatefulSets give each Pod its own stable PVC via volumeClaimTemplates.
- Watch reclaim policy (`Delete` wipes data); `Pending` PVC = no match/StorageClass.
- `emptyDir` = scratch, not persistent.
