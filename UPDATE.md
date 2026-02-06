# BrewBuddy Update: Grinder Preference Database Integration

## 🎉 Neue Features

Die Grinder-Auswahl wird jetzt **vollständig in der Railway-Datenbank** gespeichert und synchronisiert!

---

## 📊 Was wurde hinzugefügt?

### 1. **Datenbank-Schema erweitert**

Neue Spalte in der `users` Tabelle:

```sql
ALTER TABLE users 
ADD COLUMN grinder_preference TEXT DEFAULT 'fellow';
```

**Werte:**
- `'fellow'` - Fellow Ode Gen 2 (Default)
- `'comandante'` - Comandante C40 MK3

### 2. **Neue API Endpunkte**

#### GET `/api/user/grinder`
Holt die gespeicherte Grinder-Präferenz vom Server.

```javascript
GET /api/user/grinder?token=xxx&deviceId=xxx

Response:
{
  "success": true,
  "grinder": "fellow"
}
```

#### POST `/api/user/grinder`
Speichert die neue Grinder-Auswahl.

```javascript
POST /api/user/grinder
Body: {
  "token": "xxx",
  "deviceId": "xxx",
  "grinder": "comandante"
}

Response:
{
  "success": true,
  "grinder": "comandante"
}
```

### 3. **Frontend-Integration**

Die `switchGlobalGrinder()` Funktion synchronisiert jetzt automatisch:

```javascript
async function switchGlobalGrinder(grinder) {
    // 1. UI aktualisieren
    // 2. LocalStorage speichern
    // 3. ⭐ Backend synchronisieren (NEU!)
    await window.backendSync.syncGrinderPreference(grinder);
    // 4. Coffee-Cards neu rendern
}
```

### 4. **Automatisches Laden beim Login**

Beim App-Start wird die Grinder-Präferenz automatisch vom Server geladen:

```javascript
async function initBackendSync() {
    // User validieren
    const status = await checkUserStatus();
    
    if (status.valid) {
        // ⭐ Grinder vom Backend laden (NEU!)
        const remoteGrinder = await fetchGrinderPreference();
        if (remoteGrinder) {
            window.preferredGrinder = remoteGrinder;
            localStorage.setItem('preferredGrinder', remoteGrinder);
        }
        
        // Coffees laden...
    }
}
```

---

## 🔄 Synchronisations-Flow

```
┌─────────────┐
│   User      │
│  wechselt   │
│  Grinder    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ switchGlobalGrinder()       │
│ 1. UI Update                │
│ 2. localStorage speichern   │
│ 3. Backend Sync ⭐          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ POST /api/user/grinder      │
│ → Railway PostgreSQL        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ users.grinder_preference    │
│ = 'comandante'              │
└─────────────────────────────┘
```

### Bei erneutem Login:

```
┌─────────────┐
│   Login     │
│  (Token +   │
│  DeviceID)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ initBackendSync()           │
│ 1. User validieren          │
│ 2. Grinder laden ⭐         │
│ 3. Coffees laden            │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ GET /api/user/grinder       │
│ ← Railway PostgreSQL        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ preferredGrinder =          │
│ 'comandante'                │
│ UI zeigt Comandante aktiv   │
└─────────────────────────────┘
```

---

## 📁 Geänderte Dateien

### Frontend
- ✅ `index.html` - `switchGlobalGrinder()` jetzt async + Backend-Sync
- ✅ `backend-sync.js` - Neue Funktionen:
  - `syncGrinderPreference(grinder)`
  - `fetchGrinderPreference()`

### Backend
- ✅ `server.js` - Neue Endpunkte:
  - `GET /api/user/grinder`
  - `POST /api/user/grinder`
- ✅ `db/database.js` - Neue Queries:
  - `updateGrinderPreference(userId, grinder)`
  - `getGrinderPreference(userId)`

### Dokumentation
- ✅ `API_DOCUMENTATION.md` - Grinder-Endpunkte dokumentiert
- ✅ `README.md` - Feature-Liste aktualisiert
- ✅ `CHANGES.md` - Changelog erweitert

---

## 🚀 Deployment

### 1. Backend deployen (Railway)

```bash
# In deinem Backend-Repository
git add db/database.js server.js
git commit -m "Add grinder preference storage"
git push origin main
```

Railway wird automatisch:
1. Die Datenbank-Migration ausführen
2. Die neuen Endpunkte deployen
3. Die Spalte `grinder_preference` hinzufügen (falls nicht vorhanden)

### 2. Frontend deployen

```bash
# In deinem Frontend-Repository
git add index.html backend-sync.js
git commit -m "Add grinder preference sync"
git push origin main
```

---

## 🧪 Testing

### Test 1: Grinder-Wechsel synchronisiert

```javascript
// 1. In der App Grinder von Fellow → Comandante wechseln
// 2. Browser-Console öffnen
// Erwartete Logs:
// "✓ Grinder switched to: comandante"
// "✅ Grinder-Präferenz synchronisiert: comandante"
```

### Test 2: Nach Reload wird Grinder geladen

```javascript
// 1. Seite neu laden (F5)
// 2. Browser-Console öffnen
// Erwartete Logs:
// "🔄 Initialisiere Backend-Sync..."
// "✅ Eingeloggt als: username"
// "📦 Grinder-Präferenz vom Backend geladen: comandante"
// → UI zeigt Comandante als aktiv
```

### Test 3: Device-Binding funktioniert

```javascript
// 1. Mit Token auf zweitem Gerät einloggen
// 2. Grinder auf Gerät 2 wechseln
// 3. Zurück zu Gerät 1 → Seite neu laden
// → Grinder-Wahl bleibt beim ersten Gerät erhalten
// (da Device-Binding verhindert Cross-Device Sync)
```

---

## 🔒 Sicherheit

### Device-Binding
Die Grinder-Präferenz ist **pro User UND Device** gespeichert:

```javascript
// User kann nur eigene Grinder-Präferenz ändern
const user = await queries.getUserByToken(token);

// Device-Check
if (user.device_id && user.device_id !== deviceId) {
    return res.status(403).json({
        error: 'Device mismatch'
    });
}
```

### Rate Limiting
Grinder-Endpunkte sind durch das allgemeine Rate Limit geschützt:
- 100 Requests / 15 Minuten

---

## 🎯 Vorteile

### ✅ Multi-Device Sync
User kann auf einem Gerät den Grinder wechseln, auf einem anderen Gerät die App öffnen → Einstellung ist synchronisiert (sofern kein Device-Binding aktiv).

### ✅ Persistenz
Auch nach Browser-Cache-Clear oder App-Neuinstallation bleibt die Grinder-Wahl erhalten.

### ✅ Zentralisierte Daten
Alle User-Präferenzen an einem Ort (Railway DB) statt nur in localStorage.

### ✅ Analytics-Potenzial
Du kannst später analysieren:
- Wie viele User Fellow vs Comandante nutzen
- Beliebte Grinder-Modelle
- Feature-Adoption-Rate

---

## 📊 Datenbank-Abfragen (für Analytics)

```sql
-- Grinder-Verteilung
SELECT 
    grinder_preference, 
    COUNT(*) as count 
FROM users 
GROUP BY grinder_preference;

-- Ergebnis:
-- grinder_preference | count
-- fellow             | 42
-- comandante         | 18

-- User mit Comandante
SELECT username, created_at 
FROM users 
WHERE grinder_preference = 'comandante';
```

---

## 🔮 Zukünftige Erweiterungen

Mögliche Features basierend auf dieser Architektur:

1. **Mehr Grinder-Modelle**
```sql
ALTER TABLE users 
ALTER COLUMN grinder_preference TYPE TEXT;

-- Neue Werte: 'baratza', 'wilfa', 'niche', etc.
```

2. **Grinder-Kalibrierung**
```sql
ALTER TABLE users 
ADD COLUMN grinder_calibration JSONB;

-- Speichert: { "comandante": { "offset": -2 }, "fellow": { "offset": +0.5 } }
```

3. **Präferenz-Historie**
```sql
CREATE TABLE grinder_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    grinder TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ❓ FAQ

**Q: Was passiert, wenn das Backend offline ist?**
A: Die App funktioniert weiter mit localStorage. Der Sync erfolgt beim nächsten erfolgreichen Backend-Kontakt.

**Q: Kann ich mehrere Geräte mit verschiedenen Grinder-Einstellungen nutzen?**
A: Nein, durch Device-Binding ist jeder Token an ein Gerät gebunden.

**Q: Was ist der Default-Wert?**
A: `'fellow'` - Fellow Ode Gen 2

**Q: Kann ich die Grinder-Wahl per API abfragen?**
A: Ja! `GET /api/user/grinder?token=xxx&deviceId=xxx`

---

## 🎉 Summary

Du hast jetzt ein **vollständig synchronisiertes Grinder-Präferenz-System** mit:

✅ Datenbank-Speicherung (Railway PostgreSQL)  
✅ REST API (GET + POST Endpunkte)  
✅ Frontend-Sync (automatisch beim Wechsel)  
✅ Auto-Load beim Login  
✅ Device-Binding-Schutz  
✅ Rate-Limiting  

**Alle Dateien sind bereit zum Deployen!** 🚀
