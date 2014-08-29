---
layout: post
type: article
title: Les styles de programmation
date: 2014-08-20
category: article
tags: [programmation, humour, developpeur, développement, fusil-a-pompe, accident]
spritzable: yes
related:
- title: Codez avec style
  url: codez-avec-style
- title: On vous a menti !
  url: on-vous-a-menti
- title: Quand le code devient toxique
  url: quand-le-code-devient-toxique
---

Avec le temps, j'ai rencontré beaucoup de développeurs et connu bien des styles de programmation différents. Voici quelques un parmi les plus louches. Reconnaîtrez-vous quelqu'un ?

## Programmation au fusil à pompe

Il s'agit d'une méthode où le développeur tire au hasard sur le code. "Bon, cet appel de méthode échoue... Peut être qu'en changeant ce paramètre de false à true !" Ce qui bien sûr ne marche pas et le développeur se dit: "Bon, peut être que je pourrais juste commenter tout l'appel de la méthode !" et ainsi de suite. Ça peut durer éternellement jusqu'a ce que ça marche par pur hasard or que le développeur ne soit secouru par un collègue qui lui montre la solution.

Un développeur normal peut devenir dingue en quelques heures s'ils se retrouve à collaborer avec ce genre de programmeur. Ça peut vous rendre MARTEAU. Deux développeurs qui codent au fusil à pompe ne devraient jamais programmer ensemble pour éviter d'amplifier les dommages.

## Programmation par accident

C'est une forme légère de programmation au fusil à pompe, et il est surprennant de voir à quelle point elle est commune. Je pense que cette catégorie regroupe la vaste majorité des développeurs sur la planète. Elle survient quand le développeur ne sait pas réellement ce qu'il fait, mais que ça marche. Donc il code un peu plus, et ça marche toujours. Vu que ça marche par accident, à un moment ça va planter et le développeur n'aura aucune idée de comment réparer. Arrivé là, il y a alors 2 scenarios possibles: s'arrêter et comprendre ce qu'il vient de faire, dans l'espoir de trouver la cause de l'erreur, ou, plus certainement, sortir le fusil à pompe et essayer de résoudre le problème.

Le développement piloté par les tests (Test Driven Development) est venu à la rescousse de ces millions de programmeurs. Maintenant, vous avez une excuse pour programmer par accident: tant que les tests passent, c'est cool.

## La programmation culte du cargo

Le terme vient des [cultes du cargo](http://fr.wikipedia.org/wiki/Culte_du_cargo) apparus dans beaucoup d'îles du pacifique pendant la seconde guerre mondiale. Pendant la guerre, les États-Unis ont utilisé ces iles en tant que bases et on construit des pistes d'atterissage pour leurs avions de fret (cargo planes). Les autochtones étaient impressionnés par ces avions débordants de biens et de nourriture. Quand la guerre fut finie, les avions disparurent, et les natifs construirent leurs propres pistes d'atterissage avec des tours de contrôle en bambous, dans l'espoir que s'il faisaient exactement la même chose que les hommes blancs, les avions reviendraient avec leur précieuse cargaison.

La programmation Culte du Cargo se caractérise par le fait d'utiliser une solution populaire uniquement parce que tout le monde le fait et que ça à l'air de marcher pour eux, mais sans comprendre pourquoi ils font comme ça. Beaucoup de développeurs s'y sont engoufrés dans les premières années de J2EE (Java Platform, Enterprise Edition) en surutilisant les EJB et les Entity Beans, par exemple.

## La programmation du moindre effort

Ce style est très fréquent, surtout chez les développeurs junior. Un jour, vous êtes désigné pour réparer une NullPointerException, donc vous allez juste à la ligne de code d'où vient l'exception et l'entourez d'un if (reference != null).

Ça peut très bien marcher mais vous n'avez par résolu la cause du bug, vous l'avez seulement caché jusqu'a ce qu'il revienne vous hanter. Ce qu'il aurait fallu faire c'est revenir en arrière et corriger le problème qui rendait la référence nulle.

## La programmation par design pattern

Comme son nom l'indique, il s'agit d'un style de programmation où vous utilisez des patrons de conception (design patterns) pour N'IMPORTE QUOI. Votre code est plein de Façade ceci, d'Observateur cela, de Strategie quelque chose, d'Adaptateur bla bla bla. C'en est au point que vous avez besoin de plonger vraiment profond pour trouver le code qui fait vraiment un boulot concrêt au milieu du sac de noeuds des patterns.

## Développeur chirurgical

Quand il travaille sur un bug, le développeur chirurgical investigue la cause. Et ensuite la cause de la cause. Ensuite, il investigue les conséquences d'un changement de code qui conduit un autre code à causer le bug dans un troisième. Puis il fait une recherche pour trouver tous les appels de cette classe dans le code, juste au cas où. Et pour chaque occurence trouvée, il fait une nouvelle recherche pour trouver les appels de cet appel. Ensuite il écrit un test unitaire pour les 30 scénarios possible, même ceux qui n'ont rien à voir avec le bug qu'il devait corriger. Enfin, plein de confiance et avec une précision chirurgicale, il corrige la typo.

Pendant ce temps là, son collègue à corrigé 5 autres bugs.

## Développeur boucher

Quand il touche quelque chose, ça le démange de le réécrire. C'est le genre de développeur qui, la veille du déploiement, en corrigeant une typo dans un message d'erreur, change 10 classes, en réécrit 20, et change les scripts de déploiement.

_voir [l'Article original](www.codeinstructions.com/2008/10/styles-of-programming.html) (en)_