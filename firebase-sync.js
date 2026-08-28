/* ============================================================
   FitGlass AI — Firebase cloud sync
   Firebase Web SDK 12.18.0 via browser ESM modules.
   Uses anonymous Auth + Cloud Firestore.
   LocalStorage remains the offline-first source of truth.
   ============================================================ */
(() => {
  "use strict";

  const C = window.FG_CONFIG || {};
  const stateKey = "fitglass_state_v1";
  const plusKey = "fitglass_plus_state_v1";
  const ready = (async () => {
    const result = {
      enabled: false,
      connected: false,
      auth: null,
      db: null,
      uid: null,
      firestore: null,
      firebaseApp: null,
      saveTimer: null
    };

    const cfg = C.FIREBASE_CONFIG || {};
    const required = ["apiKey","authDomain","projectId","appId"];
    const hasConfig = required.every(k => cfg[k] && !String(cfg[k]).includes("__"));
    if (!C.FIREBASE_ENABLED || !hasConfig) {
      window.FG_FIREBASE_STATUS = "disabled";
      return result;
    }

    try {
      const [appMod, authMod, fsMod] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js")
      ]);

      const { initializeApp } = appMod;
      const { getAuth, signInAnonymously } = authMod;
      const {
        getFirestore, doc, getDoc, setDoc,
        collection, getDocs, query, orderBy, limit,
        serverTimestamp, enableNetwork
      } = fsMod;

      const firebaseApp = initializeApp(cfg);
      const auth = getAuth(firebaseApp);
      const db = getFirestore(firebaseApp);

      result.enabled = true;
      result.firebaseApp = firebaseApp;
      result.auth = auth;
      result.db = db;
      result.firestore = fsMod;

      const credential = await signInAnonymously(auth);
      const user = credential.user;
      result.uid = user.uid;
      result.connected = true;
      window.FG_FIREBASE_STATUS = "connected";
      window.dispatchEvent(new CustomEvent("fitglass:firebase-ready", { detail: { uid: user.uid } }));

      async function pullDoc(key, mergeMode = true) {
        const snap = await getDoc(doc(db, "users", user.uid, "app", key));
        if (!snap.exists()) return null;
        const remote = snap.data();
        if (!remote || !remote.payload) return null;
        let parsed;
        try { parsed = JSON.parse(remote.payload); } catch { return null; }
        if (!mergeMode) return parsed;

        let local = {};
        try { local = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
        if (!local || Object.keys(local).length === 0) {
          localStorage.setItem(key, JSON.stringify(parsed));
          return parsed;
        }

        // Merge array-like collections without destroying offline additions.
        const merged = { ...local };
        for (const [field, value] of Object.entries(parsed || {})) {
          if (Array.isArray(value) && Array.isArray(local[field])) {
            const map = new Map();
            [...value, ...local[field]].forEach(item => {
              const id = item?.id || item?.barcode || JSON.stringify(item);
              if (!map.has(id)) map.set(id, item);
            });
            merged[field] = [...map.values()];
          } else if (value && typeof value === "object" && local[field] && typeof local[field] === "object" && !Array.isArray(value)) {
            merged[field] = { ...value, ...local[field] };
          } else if (local[field] == null || local[field] === "") {
            merged[field] = value;
          }
        }
        localStorage.setItem(key, JSON.stringify(merged));
        return merged;
      }

      async function pushDoc(key) {
        let payload = localStorage.getItem(key);
        if (!payload) return;
        await setDoc(doc(db, "users", user.uid, "app", key), {
          payload,
          updatedAt: serverTimestamp(),
          appVersion: "eureka-plus-firebase-v1"
        }, { merge: true });
      }

      // First try cloud recovery, then install an offline-first write bridge.
      await pullDoc(stateKey, true);
      await pullDoc(plusKey, true);

      let syncing = false;
      const originalSetItem = Storage.prototype.setItem;
      if (!window.__FG_FIREBASE_STORAGE_PATCHED__) {
        window.__FG_FIREBASE_STORAGE_PATCHED__ = true;
        Storage.prototype.setItem = function(key, value) {
          const response = originalSetItem.call(this, key, value);
          if (this === localStorage && (key === stateKey || key === plusKey)) {
            clearTimeout(result.saveTimer);
            result.saveTimer = setTimeout(async () => {
              if (syncing) return;
              syncing = true;
              try { await pushDoc(key); }
              catch (error) { console.warn("FitGlass Firebase sync:", error); }
              finally { syncing = false; }
            }, 800);
          }
          return response;
        };
      }

      result.saveState = () => pushDoc(stateKey);
      result.savePlus = () => pushDoc(plusKey);

      result.upsertProduct = async product => {
        if (!product?.barcode) return false;
        await setDoc(doc(db, "food_database", String(product.barcode)), {
          ...product,
          updatedBy: user.uid,
          updatedAt: serverTimestamp(),
          source: product.source || "FitGlass"
        }, { merge: true });
        return true;
      };

      result.getProduct = async barcode => {
        if (!barcode) return null;
        const snap = await getDoc(doc(db, "food_database", String(barcode)));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
      };

      result.listProducts = async count => {
        const q = query(collection(db, "food_database"), orderBy("updatedAt", "desc"), limit(Math.min(Number(count)||40,100)));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id:d.id, ...d.data() }));
      };

      result.reconnect = async () => {
        try { await enableNetwork(db); return true; } catch { return false; }
      };

      // Explicit public helpers.
      result.syncNow = async () => {
        await pushDoc(stateKey);
        await pushDoc(plusKey);
        return true;
      };

      window.FG_FIREBASE_STATUS = "connected";
      return result;
    } catch (error) {
      console.warn("Firebase no disponible:", error);
      window.FG_FIREBASE_STATUS = "error";
      return result;
    }
  })();

  window.FG_FIREBASE = { ready };
})();
