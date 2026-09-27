# Afterlight // Zero Day

Page d’accueil post-apocalyptique futuriste, jouable dans un navigateur.

## Lancer le jeu

Depuis la racine du projet, démarre un serveur local :

```powershell
python -m http.server 8000
```

Puis ouvre http://localhost:8000.

## Source du background

- [Free Post-Apocalyptic Pixel Art Backgrounds - Free Game Assets](https://free-game-assets.itch.io/free-post-apocalyptic-pixel-art-backgrounds)

## Sources des personnages

- [Platformer Character Pack - Meraki Tsugi](https://merakintsugi.itch.io/platformer-character-pack) : personnage joueur
- [Sci-Fi Character Pack 1.2 - Penusbmic](https://penusbmic.itch.io/sci-fi-character-pack-12) : ennemis

## Structure

- `index.html` : page d'accueil
- `game.html` : aperçu du niveau complexe Dustline Blockout
- `src/home.js` : interactions de langue et panneaux d'information
- `src/game.js` : rendu du niveau, plateformes et parallax
- `src/styles/home.css` : styles de la page d'accueil
- `src/styles/main.css` : styles de la mission
- `assets/runtime/` : sprites et sons utilisés par la mission
- `assets/pack/backgrounds/post-apocalyptic/` : background utilisé par l'accueil

Les assets sont séparés entre les ressources utilisées directement par le jeu
et les packs sources conservés dans une structure dédiée :

```text
assets/
└── pack/
    ├── backgrounds/       # décors post-apocalyptiques
    ├── icons/             # équipements et ressources
    ├── tilesets/          # environnements
    └── world/             # personnages, ennemis et objets
```

La page d'accueil et l'aperçu de niveau partagent les packs sources conservés
dans `assets/pack/`. Le niveau est volontairement présenté sans joueur,
ennemi, objet ou système de combat pour travailler d'abord sa structure.
