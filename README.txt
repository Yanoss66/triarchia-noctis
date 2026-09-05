TRIARCHIA NOCTIS — Site V1.6

Ouvrir index.html dans un navigateur pour tester le site localement.

Principales évolutions de cette version :
- Structure publique validée : Accueil / Outils / Guides / Clan / Actualités.
- Outils : Analyseur de toucher, Analyseur de Croisade, lien vers Kain Forge Calculator.
- Guides : WikiBW, testeur d’objets R1, comparatif Épique / Ancien interactif.
- Clan : présentation, histoire, règlement interactif, recrutement.
- Actualités : journal simple des mises à jour du site.


V1.3 — ZONES DU CLAN
- Page : clan/zones.html
- Données publiques nettoyées : assets/data/zones.json
- Source utilisée : feuille "Zones UFH" du fichier Excel fourni, lignes 16 à 67.
- Sécurité : les liens Spy et hyperliens sensibles ne sont PAS copiés dans le site.
- Pour une future mise à jour : fournir simplement une nouvelle version du fichier Excel ; le JSON pourra être régénéré.

- Compatibilité locale : assets/js/zones-data.js permet de tester la page en ouvrant directement index.html sans serveur web.


V1.4 — Analyseurs intégrés
- Analyseur de toucher : moteur HTML/JS utilisateur conservé, ajout uniquement de la barre de navigation TN.
- Analyseur de Croisade RC1-RC9 : moteur HTML/JS utilisateur conservé, ajout uniquement de la barre de navigation TN.

V1.5 — Correction de la source des Zones du clan : données importées depuis Zones Clan TS.xlsx, avec Valeur Combat Z3 / Moyenne Combat / Valeur TOTAL et 15 bâtiments.


V1.6 — Bannière vivante
- Nouvelle bannière panoramique avec étendards rapprochés du blason historique du clan.
- Suppression des têtes encapuchonnées au-dessus des boucliers.
- Animation légère sans vidéo : pulsation rouge, brume, braises et respiration visuelle.
- Parallaxe discrète au pointeur sur ordinateur ; désactivée automatiquement si l’utilisateur préfère réduire les animations.
- Les analyseurs et les données des Zones du clan ne sont pas modifiés.
