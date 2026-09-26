# Skybound Run

Jeu de plateforme 2D jouable dans un navigateur.

## Lancer le jeu

Depuis la racine du projet, démarre un serveur local :

```powershell
python -m http.server 8000
```

Puis ouvre http://localhost:8000.

## Sources des assets

Les ressources utilisées ou prévues pour le projet proviennent des sources suivantes :

### Objets et personnages post-apocalyptiques

- [Raven Fantasy Icons - Clockwork Raven](https://clockworkraven.itch.io/raven-fantasy-icons)
- [Post Apocalypse Medicine Icons - CraftPix](https://craftpix.net/freebies/free-post-apocalypse-medicine-512x512-icons/)
- [Post Apocalypse Melee Weapon Icons - CraftPix](https://craftpix.net/freebies/free-post-apocalypse-melee-weapon-512x512-icons/)
- [Post Apocalypse Crafting and Resource Icons - CraftPix](https://craftpix.net/freebies/free-post-apocalypse-crafting-and-resource-icons/)
- [Post Apocalypse Survivor Clothing Icons - CraftPix](https://craftpix.net/freebies/free-post-apocalypse-survivor-clothing-512x512-icons/)
- [Post Apocalypse Ammunition Icons - CraftPix](https://craftpix.net/freebies/free-post-apocalypse-ammunition-512x512-icons/)
- [Post Apocalypse Projectile Icons - CraftPix](https://craftpix.net/freebies/free-post-apocalypse-projectile-512x512-icons/)
- [Post Apocalypse Pixel Art Asset Pack - TheLazyStone](https://thelazystone.itch.io/post-apocalypse-pixel-art-asset-pack)

### Decors et tilesets

- [Execution Grounds 2D Platformer Tileset - CraftPix](https://craftpix.net/freebies/free-execution-grounds-2d-platformer-tileset/)
- [Medieval Armory Street Cartoon 2D Tileset - CraftPix](https://craftpix.net/freebies/free-medieval-armory-street-cartoon-2d-tileset/)
- [Plague Town 2D Platformer Vector Tileset - CraftPix](https://craftpix.net/freebies/free-plague-town-2d-platformer-vector-tileset/)
- [Factory Pixel Art 32x32 Tileset for Cyberpunk - CraftPix](https://craftpix.net/freebies/free-factory-pixel-art-32x32-tileset-for-cyberpunk/)

## Structure

- `index.html` : point d'entrée du jeu
- `src/game.js` : logique du jeu et boucle de gameplay
- `src/styles/main.css` : styles de l'interface
- `assets/runtime/` : ressources chargées par le jeu
- `assets/pack/` : packs sources classés par type

Les assets sont séparés entre les ressources utilisées directement par le jeu
et les packs sources conservés dans une structure dédiée :

```text
assets/
├── runtime/             # ressources directement utilisées par le jeu
│   ├── audio/           # sons et musiques
│   ├── sprites/         # images des entités et objets
│   └── spritesheets/    # feuilles de sprites
└── pack/                # packs sources et leurs licences
	├── icons/           # icônes, objets et équipements
	├── tilesets/        # décors et environnements
	├── world/           # personnages, ennemis, objets et tuiles
	└── audio/           # packs musicaux et effets sonores
```

Chaque pack reste regroupé dans sa catégorie afin de conserver ses fichiers
originaux, ses sous-dossiers et ses informations de licence.
