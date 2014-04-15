---
layout: post
type: article
title: Quand le code devient toxique
date: 2014-03-28
category: article
tags: [toxicity,code,quality,qa,test,kiss,dry,yagni,software-development,architecture,best-practices]
description: A partir de quand peut-on dire qu'un code est toxique ? Quelques clés pour comprendre comment un projet peut devenir un cauchemard pour les développeurs
---

Vous est-il déjà arrivé de débarquer sur un projet et vous rendre compte qu'il n'a pas (ou mal) été entretnu ? Avez-vous déjà vu une fonctionnalité pourtant simple peiner à arriver en production uniquement parce que le code n'était à la base pas prévu pour ? Vous êtes vous déjà arraché les cheveux à essayer de faire marcher une application sur une plateforme de production un vendredi soir à 23h ? Si c'est le cas, alors vous avez probablement été en contact avec du code toxique.

Je suis récemment tombé sur l'article [You are NOT a Software Engineer!](http://www.chrisaitchison.com/2011/05/03/you-are-not-a-software-engineer/) (Vous n'êtes PAS un ingénieur software) dans lequel [Chris Aitchison](https://plus.google.com/115403705191774932888) décrit les développeurs non pas comme des architectes ou des maçons mais comme des jardiniers. Cete métaphore m'a d'abord surpris mais en continuant ma lecture je me suis rendu compte a quel point elle était exacte: Nos projets ne sont pas de beaux bâtiments ou de grands ponts qui une fois finis sont immuables, nos projets sont des jardins que l'on aménage et qu'on entretient.

Chaque projet est par nature différent. Que ce soit par son écosystème, sa plateforme, son langage, l'entreprise qui le met en oeuvre ou les développeurs qui ont opéré dessus. Je n'en ai jamais vu deux identiques. En revanche, ils partagent à de très rares exceptions près un point commun: ils __évoluent__. Ces évolutions son en général motivées par de nouveaux besoins, des bugs, des contraintes de performances etc. Il faut donc pérpétuellement modifier le code source, qu'il s'agisse d'évolutions fonctionnelles ou de patchs.

Pour bien comprendre l'aspect corrosif que peuvent prendre les nombreux changements qui ponctuent le cycle de vie d'une application, je vais vous raconter une histoire vécue. Nous sommes en 2009, je sors de l'école, des idées préconçues bien angulaires plein la tête et une image assez carrée de la profession de développeur. Je fais face dans ma première boite à un applicatif vieillissant qui nécéssite beaucoup d'aspirine pour faire fonctionner le développeur qui la fait fonctionner. Je décide alors, en accord avec mes responsables, de changer la donne et de proposer une autre voie: faire du from-scratch (tout reprendre à zéro).

J'entreprends alors de réécrire une nouvelle version, plus moderne et plus proche de l'idée que je me faisait d'un "bon code". Je me documente sur les patrons d'architecture, sur le langage et la plateforme que j'utilise, je regarde ce qui se fait ailleurs et je finis par accoucher d'une béta fonctionnelle qui ma foi m'avait l'air potable. C'est là que les ennuis ont commencés: jusqu'ici je n'ai fait qu'écrire un prototype qui n'a jamais eu à supporter une logique métier digne de ce nom et le premier projet implémenté à l'aide de mon outil a rapidement montré ses faiblesses. 

J'ai donc dû faire évoluer l'outil pour correspondre aux besoins du projet, ajoutant de nouvelles fonctionnalités, patchant des segments de code non testés. A chaque commit, le volume de code de l'outil augmentait de même que sa complexité. Puis, une fois le projet fini, la mise en production et les retours d'expérience utilisateur ont déclenché l'avalanche de rapports de bugs qu'il a fallu patcher en urgence, augmentant encore le volume et la complexité du code. Quand je me suis rendu compte que tous ces changements avaient tendance à se marcher dessus et qu'on était rentré dans la dynamique malsaine de devoir changer un outil générique pour correspondre à des besoins fonctionnels, il était déjà trop tard. Nous étions partis dans le cycle des projets et nous n'avions plus le temps pour réécrire proprement ce qui n'allait pas.

Un an et quelques projets plus loin, j'ai dû arrêter les développements sur cet outil et en proposer un nouveau. Je venais de reproduire ce que d'autres développeurs avaient fait avant moi: j'avais érodé le projet à tel point que son code source devenait un cauchemard, même pour son auteur. Manque de conception en amont, problème de visibilité et d'anticipation des besoins, inexpérience, La somme de tous ces facteurs avait produit un outil peu robuste et chaque évolution ou patch que j'ai dû y apporter ont été comme une goutte d'acide versée sur le code, le grignottant petit à petit. Le projet était devenu __toxique__.

Cette histoire m'a fait comprendre qu'une application ne nait pas naturellement pourrie, elle le devient. La cause directe est bien entendu les nombreux changement qu'elle subit au cours de sa vie et donc plus elle est vieille et plus vous avez de chance de vous arracher les cheveux à la maintenir mais la véritable cause réside dans sa conception: __l'effet corrosif des changements est amplifié par un design bancal, simpliste voire simplement court-termiste__.

## La toxicité

> La toxicité (du grec τοξικότητα toxikótêta) est la mesure de la capacité d’une substance à provoquer des effets néfastes et mauvais pour la santé ou la survie chez toute forme de vie, qu'il s'agisse de la vitalité de l'entité ou d'une de ses parties.
> _(source [Wikipedia](http://fr.wikipedia.org/wiki/Toxicit%C3%A9))_

Qu'un composant manque de rigueur dans sa conception, qu'un patch soit fait à l'arrache par manque de temps, qu'ils soit impossible de développer proprement car le code n'a pas été prévu pour être modifié, dans tous ces cas de figure on est en précence de toxicité car tout ce qu'on fait sera néfaste au projet à plus ou moins long terme. Dans l'entreprise tout le monde à l'air d'être conscient, à différent niveau, que l'application sent le vieux pâté. Mais quand il s'agit de déterminer à quel point, les avis divergent. C'est pourquoi [Erik Dörnenburg](http://erik.doernenburg.com/) dans son article [How toxic is your code?](http://erik.doernenburg.com/2008/11/how-toxic-is-your-code/) (a quel point votre code est-il toxique ?) a immaginé une méthode de mesure simple:

> La mesure de la toxicité [d'un composant] est basée sur des métriques et des seuils. Par exemple, la métrique de longueur d'une méthode a un seuil de 30. Si une classe contiends une méthode qui est plus longue elle obtiens un nombre de points proportionnel à la différence vis-à-vis du seuil, par exemple une méthode de 45 ligne obtiendrait un score de 1.5 parce qu'elle fait 1.5x le seuil. Le score de tous les éléments est ensuite additionné. Donc, si une classe contiens 2 méthodes, une de 45 lignes et une de 60 lignes, son score pour la longueur de ses méthode sera de 3.5 points. Ce qui signifie que les éléments ne sont pas uniquement qualifiés comme toxiques, leur score révèle également à quel point ils le sont.

Il propose d'ailleurs une table des métriques et des seuils acceptables sur lesquels les multiplicateurs sont basés:

<table>
    <thead>
        <tr>
            <th style="font-weight: bold; text-align: left">Métrique</th>
            <th style="font-weight: bold; text-align: left">Niveau</th>
            <th style="font-weight: bold; text-align: left">Seuil</th>            
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Longueur du fichier</td>
            <td>fichier</td>
            <td>500</td>
        </tr>
        <tr>
            <td><abbr title="Le nombre de classes qui dépendent d'une classe donnée">Complexité externe</abbr></td>
            <td>classe</td>
            <td>30</td>
        </tr>
        <tr>
            <td><abbr title="Le nombre d'instanciations d'autres classes par une classe donnée">Couplage abstrait</abbr></td>
            <td>classe</td>
            <td>10</td>
        </tr>
        <tr>
            <td>Longueur des classes anonymes</td>
            <td>class interne (Java)</td>
            <td>35</td>
        </tr>
        <tr>
            <td>Longueur de méthode</td>
            <td>méthode</td>
            <td>30</td>
        </tr>
        <tr>
            <td>Nombre de paramètres</td>
            <td>méthode</td>
            <td>6</td>
        </tr>
        <tr>
            <td><a href="http://fr.wikipedia.org/wiki/Complexit%C3%A9_cyclomatique">Complexité cyclomatique</a></td>
            <td>méthode</td>
            <td>10</td>
        </tr>
        <tr>
            <td>Imbrication des blocs If</td>
            <td>déclaration</td>
            <td>3</td>
        </tr>
        <tr>
            <td>Imbrication des blocs Try</td>
            <td>déclaration</td>
            <td>2</td>
        </tr>
        <tr>
            <td>Complexité des expressions booléennes</td>
            <td>déclaration</td>
            <td>3</td>
        </tr>
        <tr>
            <td>Default manquant dans un switch</td>
            <td>déclaration</td>
            <td>1</td>
        </tr>
    </tbody>
</table>

Cette table à été imaginée pour déterminer la toxicité d'une application Java. Erik Dörnenburg a d'ailleurs créé [un outil](http://erik.doernenburg.com/2013/06/toxicity-reloaded/) qui permet d'obtenir une représentation graphique de cette toxicité, mais c'est appliquable à d'autres langages dans l'ensemble.

Ces métriques et seuils ont été déterminés arbitrairement. Erik a pensé la mesure de la toxicité en opposition au concept de "mauvais code", bien trop vague, pour founir une donnée utile pour le plus grand nombre. Par exemple, en ce qui concerne la métrique "longeur de méthode", on est en droit de penser qu'une méthode ne devrait pas faire plus de 30 lignes. Vous pouvez bien entendu en fonction de votre projet et de votre tolérance utiliser d'autres valeurs de seuil.

## Que faire d'un code toxique ?

S'il est avéré que le code est toxique, que faut-il en faire ? Continuer à travailler dessus ne fera que le dégrader davantage. C'est pire que du temps perdu: c'est de l'alourdissement de dette technique, donc de l'accumulation de temps à perdre à court ou moyen terme. Il faut refactoriser voire tout recommencer.

### faire du refactoring

Le refactoring est la discipline visant a réorganiser et nettoyer le code source d'une application en vue de l'améliorer. Il s'agit d'une étape coûteuse, surtout si elle n'est pas faite périodiquement, mais nécéssaire pour maintenir un niveau de qualité et de performances satisfaisant. Dans les cas extrêmes il vaut largement mieux repartir d'une feuille blanche plutôt que d'essayer de refactoriser un code dont la toxicité à atteint son paroxysme, ça coûtera moins cher.

Avant d'aller plus loin, je tiens à préciser que vous ne pouvez pas tuer le spectre du refactoring, vous pouvez seulement l'éloigner. La méthode de mesure de toxicité expliquée plus haut peut vous aider à orienter votre refactoring sur les segments de code les plus critiques si nécéssaire.

Les tests unitaires et les tests fonctionnels ont également une importance cruciale dans le processus de refactoring. Ils permettent de s'assurer que la nouvelle version est identique à l'ancienne en termes de comportements. il est souvent conseillé de mettre en place des revues de code et/ou du peer-programming (faire travailler 2 développeurs en même temps, sur la même tâche) afin d'une part de réduire le risque de régression et d'autre part pour répartir les connaissances au sein de l'équipe technique.

Un bon moyen d'éviter à avoir a faire du refactoring plus tard c'est d'éviter de procrastiner. Ne dites jamais _"on fait sale aujourd'hui, on refera proprement plus tard."_ En 5 ans de développement en entreprise __ça ne m'est jamais arrivé__. Aucun chef de projet n'allouera du temps à l'amélioration du code si ça ne débouche sur aucune valeur, peu lui importera que ce soit nécéssaire à vos yeux. A vous de défendre votre steak lors des phases de planification pour que le temps qui vous est alloué sur une tâche vous permette de faire les choses proprement dès le départ.

## Eviter de produire du code toxique

En tant que développeur n'essayez pas de briller en proposant de la performance au prix de la conception, des tests et de la documentation. Réduire le temps d'une tâche à toujours un coût, gagner une heure aujourd'hui peut facilement faire boule de neige et vous en faire perdre dix plus tard. Multiplié par le nombre de tâches "amputées" qui ont étés exécutées sur un projet, on voit rapidement l'ampleur que peut prendre le problème. En somme, si vous rabottez vos tâches c'est que vous êtes d'accord pour vous pourrir tout seul la vie à plus ou moins court terme.

Si toutefois il est impossible de faire propre (ça arrive) alors __isolez__ et __balisez__ votre "sale code" afin d'éviter que sa toxicité ne se propage à tout le projet. Tout élément fix ou patch fait en urgence doit toujours être repris dans une logique de développement complète. Il faut transformer ce patch en régression puis en évolution produit et réfléchir avec tous les intervenants du projet à comment le réintégrer proprement et sans dommage. De cette façon, vous transformez quelque chose de toxique en quelque chose de bénéfique pour le projet.

### Anticiper le futur sans tenter de le prédire

Inutile de s'essayer à la divination, __vous ne pouvez pas prévoir comment un projet va évoluer__. Pas plus que vous ne pourriez prévoir avec exactitude combien de pomme va vous donner un pommier dont vous venez de planter la graine. Donc rangez votre boule de cristal et passez a la [compatbilité descendante](http://blog.ircmaxell.com/2013/06/backwards-compatibility-is-for-suckers.html).

Vous êtes probablement famillier avec le concept de compatibilité ascendante qui consiste a faire en sorte que le nouveau code produit soit toujours compatible avec l'ancien. La compatibilité descendante c'est exactement l'inverse: on essaie de faire en sorte que le code, au moment où on l'écrit, soit compatible avec le prochain. Il ne s'agit pas d'essayer de prévoir quel seront les futurs usages, mais d'écrire nos fonctions et classes de façon suffisament adaptable pour que de nouveau usages puissent s'y glisser sans tout casser.

Concrêtement, on peut par exemple équiper une fonction d'un paramètre "options" afin de pouvoir lui passer autre chose que les paramètres qu'on lui avait attribué à la base, évitant ainsi de devoir modifier son prototype dans le futur. De la même façon, on pourra mettre en place des architectures modulaires ou [orientées composants](http://bdelespierre.fr/article/php-injection-de-dependances-et-composants) qui permettront davantage de flexibilité. Ce sont autant des choix architecturaux que des choix d'implémentation qu'il faudra penser en vue des usages futurs.

### Une toile de maître

Vous est-il déjà arrivé de regarder un peintre au travail ? En général, on le voit donner quelques coups de pinceau puis reculer pour regarder l'ensemble avant de redonner quelques coups. En tant que développeur pour devez être capable de faire la même chose, c'est à dire prendre du recul sur votre code. Vous devez voir vos composants, classes et fonctions dans le contexte global du projet. On appelle celà faire du zoom-in/zoom-out, voir l'ensemble et le détail.

Avoir cette faculté vous évitera de produire du code dont vous n'avez pas besoin (le fameux <abbr title="You Ain't Gonna Need It">YAGNI</abbr>) ou pire de produire un code inadapté.

Par exemple, les concepteur du jeu Dark Messiah ont eu l'idée de permettre au joueur d'accrocher un grapin sur les poutres des bâtiments pour pouvoir se balancer. En soi l'idée était bonne et ajoutait un élément de gameplay intéressant. Lors de l'implémentation les développeurs ont donc fait en sorte que le grappin puisse s'accrocher aux textures bois. Le problème c'est que des textures bois, il y en avait partout, ce qui permettait au joueur de sortir de la carte. Les développeurs n'ont donc pas pensé cette fonctionnalité dans le contexte global du jeu.

### Keep it simple, stupid !

<abbr title="Keep It Simple Stupid">KISS</abbr> est probablement la recommandation la plus connue des développeurs. Selon moi, elle est fondamentale: le rôle d'un développeur est de produire une solution _adaptée_ et non pas une soltion _esothérique_ qui peut prendre en charge des besoin qui n'ont pas encore été recontrés.

Une erreur courante est de se dire "je peux en avoir besoin un jour alors je le fais maintenant". Si vous pensez que le besoin pourra changer, alors faites en sorte que votre composant puisse changer, n'essayez pas d'y implémenter ces changements à l'avance.

Il faut toujours garder à l'esprit qu'__une solution élégante est une solution facile à écrire et à comprendre__. L'optimisation prématurée est, à mon humble avis, la __pire erreur__ qu'un développeur puisse faire car elle mène à une complexification inutile du code et détruit aisément sa réutilisabilité - car l'optimisation se fait pour un contexte précis. Optimisez quand vous en avez réeelement besoin, pas quand ça vous chante.

## Conclusion

Produire un code de qualité n'est pas un exercice facile. Chaque projet est différent de par son contexte, son entreprise et ses équipes. C'est pourquoi il n'existe pas une "méthodologie-unique-qui-marche-partout" mais une multitude de proposition, d'essais, de conseils, de bonnes pratiques et de recommandation. C'est à vous de faire votre choix avec discernement en fonction de vos besoins, de vos impératifs et de votre sensibilité.

Mais tenter d'imposer ses choix ou les prendre seul dans son coin est une erreur, le travail de développeur est un travail d'équipe. Si vous imposez vos choix, les autres développeurs freineront des deux pieds. Si chacun fait sa petite méthodo dans son coin, le projet ne ressemblera à rien à la fin. Il faut donc faire usage de pédagogie et trouver avec l'équipe la meilleur option pour avancer vite et bien.