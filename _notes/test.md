---
title: "Créer une collection de notes avec Jekyll (Minimal Mistakes)"
date: 2025-07-03
layout: single
classes: wide
toc: true
---

## 📄 Bloc : Front Matter général

```markdown

---
title: "Créer une collection de notes avec Jekyll (Minimal Mistakes)"
date: 2025-07-03
layout: single
toc: true
author_profile: true
---


```


## 🎯 Objectif

Ajouter un dossier `_notes` dans un site Jekyll basé sur le thème **Minimal Mistakes**, et s'assurer que :

- les notes soient bien générées en pages HTML ;
- le style du thème s’applique correctement ;
- un index de la collection soit disponible via `/notes/`.

## ✅ Étapes à suivre
### 1. Déclarer la collection dans `_config.yml`

Ajouter ceci :

```yaml
collections:
  notes:
    output: true
    permalink: /notes/:title/
```
> Cela permet à Jekyll de générer une page HTML pour chaque fichier .md dans _notes.

### 2. Créer le dossier `_notes/`

Ajouter ses notes Markdown dans ce dossier avec un **front matter** comme :

```markdown
---
title: "Titre de la note"
date: 2025-07-03
layout: single
toc: true
author_profile: true
---

## Titre 2
Contenu de la note ici.

```

Le layout single applique automatiquement le style du thème à la page.
Sans cela, la note s'affiche sans mise en forme (style brut HTML).

Et sous `layout: single` avec :

```markdown
classes: wide
```
On élargit la place prise par le texte dans la page


### 3. Ajouter des valeurs par défaut dans `_config.yml` (optionnel mais recommandé)

Pour éviter de répéter `layout`, `toc`, etc. dans chaque note :

```markdown
defaults:
  - scope:
      path: ""
      type: notes
    values:
      layout: single
      toc: true
      author_profile: true
```

Cela garantit un affichage homogène de toutes les notes, même si on oublie de définir un layout dans certaines.

### 4. Créer une page d’index pour la collection

Ajoute un fichier `notes.md` à la racine (ou dans un dossier `pages/`) avec ce contenu :

```markdown
---
title: "Mes Notes"
layout: collection
permalink: /notes/
collection: notes
---
```

Cette page listant automatiquement toutes les notes de la collection _notes.

### 5. Ajouter un lien vers les notes dans la navigation (facultatif)

Si on veut un lien dans le menu principal du site, créer ou modifier le fichier `_data/navigation.yml` :

```markdown
main:
  - title: "Notes"
    url: /notes/
```
On verra ainsi une entrée "Notes" dans la barre de navigation du site.

## 🧪 Résultat attendu

- Chaque fichier `.md` dans `_notes/` génère une page stylée avec le thème Minimal Mistakes.
- La page `/notes/` liste automatiquement toutes les notes disponibles.
- On peut organiser ses idées, tutoriels, brouillons ou documents internes dans cet espace personnel, propre et intégré.
