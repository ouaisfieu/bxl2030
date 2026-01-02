# 🎭 LA RÉSERVE — Application Unifiée

> « Ce qui existe déjà mais n'a jamais été reconnu »

## 📦 Contenu

Cette version ultime unifie TOUS les composants développés depuis le début du projet :

| Fonctionnalité | Description |
|----------------|-------------|
| **Tableau de bord** | Vue d'ensemble avec statistiques et actions récentes |
| **Éditeur d'actions** | Création complète avec infos, contenu Markdown, recrues, timeline |
| **Gestion des recrues** | 4 types (complice, figurant, témoin, expert) - max 9 |
| **Timeline** | Chronologie des événements de l'action |
| **Aperçu temps réel** | Preview HTML généré en direct |
| **Import/Export** | JSON, Markdown, HTML, TXT |
| **War Room** | Centre de commandement tactique rétro-geek |
| **6 thèmes** | Sombre, Clair, Néon, Retrogeek, Console, War Room |
| **3 typographies** | Élégant, Éditorial, Brut |
| **PWA** | Installable, fonctionne offline |

## 🚀 Démarrage rapide

### Option 1 : Fichiers séparés
```
la-reserve-ultimate/
├── index.html      ← Page principale
├── styles.css      ← Styles
├── app.js          ← Application
├── manifest.json   ← PWA
└── README.md       ← Ce fichier
```

Ouvrez `index.html` dans votre navigateur.

### Option 2 : Fichier unique
Utilisez `la-reserve-ultimate-bundle.html` qui contient tout en un seul fichier.

## 🎮 Utilisation

### Créer une action
1. Cliquez sur "Nouvelle action"
2. Remplissez les infos de base (titre, cible, statut...)
3. Ajoutez une description en Markdown
4. Ajoutez des recrues (max 9)
5. Construisez la timeline
6. Sauvegardez et exportez

### War Room
Le centre de commandement affiche :
- Carte tactique de la Belgique
- Progression de l'infiltration (67% BE, 12% EU, 3% Monde)
- Liste des cibles institutionnelles
- Flux d'opérations en temps réel

## ⌨️ Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+S` | Sauvegarder l'action |
| `Ctrl+N` | Nouvelle action |
| `Esc` | Fermer les modals |

## 🎨 Thèmes

- **Sombre** — Thème par défaut, élégant
- **Clair** — Mode jour
- **Néon** — Cyberpunk avec effets glow
- **Retrogeek** — Style années 80, pixels
- **Console** — Terminal vert sur noir
- **War Room** — Centre de commandement

## 📊 Structure d'une action

```json
{
  "id": "LR-ABC123XYZ",
  "titre": "Opération Silence FOREM",
  "pseudo": "Agent Gaufre",
  "lieu": "Wallonie",
  "type": "detournement",
  "statut": "en_cours",
  "cible": "FOREM",
  "description": "Description en Markdown...",
  "manifeste": "Le silence administratif est une réponse.",
  "recrues": [
    { "name": "Agent X", "type": "complice", "role": "Coordinateur" }
  ],
  "timeline": [
    { "date": "2026-01-01", "title": "Début de l'opération", "desc": "..." }
  ],
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-02T00:00:00Z"
}
```

## 🔄 Historique du projet

1. **Concept initial** — ARG sur l'emploi et la bureaucratie belge
2. **Site vitrine** — Présentation du concept avec règles du jeu
3. **Switcher thèmes** — 6 thèmes visuels
4. **Switcher typo** — 6 styles typographiques
5. **Générateur d'export** — Création de pages HTML autonomes
6. **Éditeur Markdown** — Avec toolbar et preview
7. **Gestionnaire de fichiers** — Import/export multi-formats
8. **Application mobile PWA** — Interface touch-first
9. **Hub landing page** — Page d'accueil avec choix des versions
10. **Synchronisation cloud** — Module Supabase optionnel
11. **War Room** — Dashboard rétro-geek
12. **Version unifiée** — Cette version qui combine tout

## 🌍 Concept de l'ARG

### Le principe
Détourner le système administratif pour créer des "réserves de recrutement" fictives qui peuvent devenir réelles.

### Les étapes
1. **Détourner** — Une offre d'emploi, un formulaire, un site
2. **Recruter** — 9 personnes (fictives ou réelles)
3. **Soumettre** — À une ASBL belge partenaire
4. **Basculer** — Du fictif au réel si succès

### Les limites
- Le droit réel
- Les aléas de la vie
- Rien d'autre

## 📄 Licence

Projet artistique et créatif. Utilisez, modifiez, partagez librement.

---

*« Ce qui existe déjà mais n'a jamais été reconnu »*

🧇 La Réserve — Piratage pacifique de la Belgique puis du monde
