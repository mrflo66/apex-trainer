# Entraînement Clavier – Apex Legends

Petit outil pour t'aider à passer de la manette au clavier sur Apex Legends :
travaille tes mouvements et ton indépendance de doigts (Z Q S D, Maj, Ctrl, Espace, molette).

## Télécharger

Va dans l'onglet **Releases** de ce dépôt et télécharge `Setup-Entrainement-Clavier-Apex.exe`.

> Windows SmartScreen peut afficher « Windows a protégé votre PC » car l'installateur n'est pas signé.
> Clique sur **Informations complémentaires** puis **Exécuter quand même**.

## Contenu

- Touches seules, combos de mouvement, strafe rapide, mouvement + actions
- Lurchs : Ras avant, Ras arrière, Yuki, Pito, Raf
- Séries enchaînées de 20 : Yuki, Snake, Fazzy, Raf
- Couleurs personnalisables (bouton « Couleurs »)

Les touches sont lues par position physique : ça marche en AZERTY comme en QWERTY. Les noms affichés (Z/W, Q/A, Maj/Shift…) s'adaptent à ta disposition, détectée automatiquement et réglable dans **⚙ Paramètres → Disposition du clavier**.
L'appli est un simple entraînement : elle n'envoie aucune touche au jeu et ne s'injecte pas dedans.

## Construire le setup.exe soi-même

1. Installer [Node.js](https://nodejs.org) (version LTS)
2. Lancer `build.bat` (ou `npm install` puis `npm run dist`)
3. L'installateur est créé dans le dossier `dist`

Sur GitHub, l'action **Build setup.exe** le construit automatiquement :
il suffit de publier un tag (`v1.0.0`) pour qu'il soit ajouté dans **Releases**.

## Modifier les séquences

Tout est dans `index.html` (liste `SEQ` pour les lurchs, `META` pour les séries).

## Overlay des touches (stand de tir)

> L'overlay lit tes touches en dehors de l'appli. Certains anti-cheats peuvent le refuser : vérifie les règles du jeu avant de l'utiliser en ligne, à tes risques.

Dans l'appli `.exe` : **⚙ Paramètres → 🖥 Overlay**. Clique sur « Activer l'overlay ».
Une petite fenêtre transparente affiche tes touches (Z Q S D, Maj, Ctrl, Espace, molette) par-dessus le jeu.
Les clics la traversent. Raccourci : **Ctrl + Maj + O**.

- Mets le jeu en « fenêtré sans bordure » (pas en plein écran exclusif).
- Taille, opacité et position réglables ; option pour inverser le sens de la molette.
- Seules les touches affichées sont lues, rien n'est enregistré ni envoyé.

## Mises à jour automatiques

L'appli installée vérifie les mises à jour au démarrage (et dans **⚙ Paramètres → 🔄 Mises à jour**).
Pour publier une nouvelle version :

1. Modifie le code et envoie-le sur GitHub.
2. Crée une nouvelle **Release** avec un numéro de version plus grand que le précédent (`v1.0.1`, `v1.1.0`…).
3. L'action GitHub construit le `setup.exe` et l'ajoute à la release. Les appli déjà installées le téléchargent toute seules,
   puis proposent « Redémarrer et installer ».

Le dépôt doit être **public** pour que les mises à jour fonctionnent sans identifiants.
Les builds faits à la main avec `build.bat` n'ont pas de mise à jour automatique : utilise ceux de GitHub.

L'overlay affiche aussi le **mouvement choisi dans l'appli** (les touches de chaque étape, comme dans l'appli) et
suit ta progression en direct : étape en cours, répétition et temps en ms. Options « Afficher le clavier » et
« Afficher le mouvement choisi » dans les paramètres.

Dans **⚙ Paramètres → Overlay**, tu peux choisir le contenu (clavier + mouvement, clavier seul ou mouvement seul)
et personnaliser les couleurs de l'overlay (touche active, fond, texte, étape réussie).

## Installateur en français ou en anglais

Au lancement du `setup.exe`, une fenêtre propose le **français** ou l'**anglais** pour l'installation.
(L'appli elle-même est en français.)

## Conseils, métronome et mode fantôme

- **Conseils personnalisés** : quand tu rates une étape, l'appli te dit pourquoi (touche en trop, Maj/Ctrl relâché,
  mauvais sens de molette…) et retient ton point faible pour chaque mouvement.
- **Métronome** (désactivé par défaut) : tempo, volume et flash visuel réglables dans **⚙ Paramètres → Aides à l'entraînement**.
- **Mode fantôme** : le 👻 au-dessus du nombre d'erreurs l'active ou le coupe. Il te compare à ton meilleur essai, étape par étape.

## Déplacer l'overlay et partager des mouvements

- **⚙ Paramètres → Overlay → « Déplacer l'overlay à la souris »** (ou **Ctrl + Maj + M**) : glisse l'overlay où tu veux, puis « Valider ».
  Sa position est mémorisée.
- **➕ Mes mouvements → Partager** : « Exporter » génère un code (`APEXMV1:…`) à copier-coller dans Discord, par exemple ;
  « Importer » ajoute les mouvements d'un code reçu.

## Paramètres en onglets, double bind et Superglide

- **⚙ Paramètres** est organisé en onglets : Touches, Superglide, Entraînement, Overlay, Apparence, Mises à jour.
- **Double bind** : chaque action peut avoir une 2e touche (« + Ajouter » dans l'onglet Touches). Les deux touches sont
  prises en compte partout : exercices, Superglide et overlay.
- **Superglide** : les FPS ne sont demandés qu'à la première ouverture ; ils se changent ensuite dans
  ⚙ Paramètres → Superglide.
