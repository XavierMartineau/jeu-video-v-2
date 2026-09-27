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

## Structure

- `index.html` : page d'accueil
- `src/home.js` : interactions de langue et panneaux d'information
- `src/styles/home.css` : styles de la page d'accueil
- `assets/pack/backgrounds/post-apocalyptic/` : background utilisé par l'accueil

Les assets sont séparés entre les ressources utilisées directement par le jeu
et les packs sources conservés dans une structure dédiée :

```text
assets/
└── pack/
    └── backgrounds/
        └── post-apocalyptic/
            ├── PNG/
            ├── LICENSE.txt
            └── README.txt
```

Le gameplay a été retiré. Le dépôt contient uniquement la page d'accueil et
les ressources nécessaires à son affichage.
