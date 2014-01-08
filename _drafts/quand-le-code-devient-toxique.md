---
layout: post
title: Quand le code devient toxique
date: 
category: article
tags: 
---
# Quand le code devient Toxique

## Avant propos

En tant que développeurs, nous voulons tant que faire se peut travailler sur du code propre. Nous détestons devoir corriger des problèmes purement techniques, nous voulons produire de la valeur ajoutée. Ce qui nous plait le plus c'est construire et faire évoluer des applications utiles, fiables et performantes, pas devoir démêler des noeuds dans un code mal écrit.

Je ne suis pas responsable projet mais j'ose imaginer que leurs objectifs sont les mêmes. Ils ne veulent pas nous payer à débugguer un code simplement parce qu'il est mal écrit, ils veulent que nous menons à bien des projets rémunérateurs rapidement et efficacement.

Alors pourquoi le fossé semble t'il si grand entre ces deux visions du projet ? A cette question j'ai envie de répondre: parce que chaque partie ne comprend pas les problèmes de l'autre. C'est pourquoi j'ai choisi d'aborder dans cet article la question de la déterioration du code, ses raison, ses impacts et proposer des solutions pour limiter ce facteur. L'article est écrit du point de vue du développeur mais peut également servir aux non techniciens pour comprendre les problématiques et les enjeux de la qualité dans le processus de développement.

## Introduction

Vous est-il déjà arrivé de débarquer sur un projet et vous rendre compte qu'il n'a pas (ou mal) été entretnu ? Avez-vous déjà vu une fonctionnalité pourtant simple peiner à arriver en production uniquement parce que le code n'était à la base pas prévu pour ? Vous êtes vous déjà arraché les cheveux à essayer de faire marcher un applicatif sur une plateforme de production un vendredi à 23h ? Si c'est le cas, alors vous avez probablement été en contact avec du code toxique.

Je suis récemment tombé sur l'article [You are NOT a Software Engineer!](http://www.chrisaitchison.com/2011/05/03/you-are-not-a-software-engineer/) (Vous n'êtes PAS un ingénieur software) dans lequel [Chris Aitchison](https://plus.google.com/115403705191774932888) décrit les développeurs non pas comme des architectes ou des maçons mais comme des jardiniers. Cete métaphore m'a d'abord surpris mais en continuant ma lecture je me suis rendu compte a quel point elle permettait d'expliquer avec acuité la réalité de notre métier. Nos projets ne sont pas de beaux bâtiments ou de majestueux ponts qui une fois finis sont immuables, nos projets sont des jardins que l'on aménage et qu'on entretient.

Le cycle de vie d'une application obéit à des lois qui peuvent s'apparenter à celles de la botanique. Il faut savoir faire grandir l'application, la retailler, la rempoter, l'arracher pour en replanter une neuve etc. Tous ces changements s'accompagnent en général de modifications de son code source et ce sont précisément ces changements qui m'intéressent aujourd'hui. Nous allons voir comment les changements peuvent déformer un projet jusqu'a le rendre toxique, comment cette toxicité peut être mesurée et enfin comment elle peut être évitée.

## Les changements sont corrosifs

Chaque projet est par nature différent. Que ce soit par son écosystème, sa plateforme, son langage, l'entreprise qui le met en oeuvre ou les développeurs qui ont opéré dessus. Je n'en ai jamais vu deux identiques. En revanche, ils partagent à de très rares exceptions près un point commun: ils __évoluent__. Ces évolutions son en général motivées par de nouveaux besoins, des bugs, des contraintes de performances etc. Il faut donc pérpétuellement faire muter l'ADN de notre projet: son code source. Je distingerai ces mutations en deux catégories: les évolutions et les patchs. Dans les deux cas on peut assister à une corrosion du projet, parfois minime si le projet était simple ou bien conçu, parfois dramatique quand le patch à été appliqué au fer à souder, laissant une énorme cicatrice dans le code source.

Pour bien comprendre l'aspect corrosif que peuvent prendre les nombreux changements qui ponctuent le cycle de vie d'une application, je vais vous raconter une histoire vécue. Nous sommes en 2009, je sors de l'école, des idées préconçues bien angulaires plein la tête et une image assez carrée de la profession de développeur. Je fais face dans ma première boite à un applicatif vieillissant qui nécéssite beaucoup d'aspirine pour faire fonctionner le développeur qui la fait fonctionner. Je décide alors, en accord avec mes responsables, de changer la donne et de proposer une autre voie: faire du from-scratch (tout reprendre à zéro).

J'entreprends alors de réécrire une nouvelle version, plus moderne et plus proche de l'idée que je me faisait d'un "bon code". Je me documente sur les patrons d'architecture, sur le langage et la plateforme que j'utilise, je regarde ce qui se fait ailleurs et je finis par accoucher d'une béta fonctionnelle qui ma foi m'avait l'air potable. C'est là que les ennuis ont commencés: jusqu'ici je n'ai fait qu'écrire un prototype qui n'a jamais eu à supporter une logique métier digne de ce nom et le premier projet implémenté à l'aide de mon outil a rapidement montré ses faiblesses. 

J'ai donc dû faire évoluer l'outil pour correspondre aux besoins du projet, ajoutant de nouvelles fonctionnalités, patchant des segments de code non testés. A chaque commit, le volume de code de l'outil augmentait de même que sa complexité. Puis, une fois le projet fini, la mise en production et les retours d'expérience utilisateur ont déclenché l'avalanche de rapports de bugs qu'il a fallu patcher en urgence, augmentant là aussi le volume et la complexité du code. Quand je me suis rendu compte que tous ces changements avaient tendance à se marcher dessus et qu'on était rentré dans la dynamique malsaine de devoir changer l'outil pour correspondre à des besoins fonctionnels, il était déjà trop tard. Nous étions partis dans le cycle des projets et nous n'avions plus le temps pour réécrire proprement ce qui n'allait plus.

Un an et quelques projets plus loin, j'ai dû arrêter les développements sur cet outil et en proposer un nouveau. Je venais de reproduire ce que d'autres développeurs avaient fait avant moi: j'avais érodé le projet à tel point que son code source devenait un cauchemard, même pour son concepteur. Du fait que les besoin futurs avaient mal été anticipés, j'avais créé un outil inadapté. Du fait de mon inexpérience, j'avais créé un outil bancal et mal conçu. Du fait des aléas du quotidient, il n'y eut aucun tuteur pour faire grandir le projet dans le bon sens. La somme de tous ces facteurs avait produit un outil peu robuste et chaque évolution ou patch que j'ai dû y apporter ont été comme une goutte (ou un sceau) d'acide versée sur le code, le grignottant petit à petit. Le projet était devenu __toxique__.

Cette histoire m'a fait comprendre qu'une application ne nait pas naturellement pourrie, elle le devient. La cause directe est bien entendu les nombreux changement qu'elle subit au cours de sa vie et donc plus elle est vieille et plus vous avez de chance de vous arracher les cheveux à la maintenir mais la véritable cause réside dans sa conception: __l'effet corrosif des mutation est amplifié par un design bancal, simpliste ou tout simplement court-termiste__.

## La toxicité

> La toxicité (du grec τοξικότητα toxikótêta) est la mesure de la capacité d’une substance à provoquer des effets néfastes et mauvais pour la santé ou la survie chez toute forme de vie, qu'il s'agisse de la vitalité de l'entité ou d'une de ses parties.
> (source [Wikipedia](http://fr.wikipedia.org/wiki/Toxicit%C3%A9))

Le code source de l'application est toxique quand elle finit par nuir à tout ce qu'elle touche, que ce soit l'entreprise, les équipes ou les projets. Elle devient un poison que personne ne veut avaler et qui, dans les cas extrêmes, met en péril l'activité de l'entreprise.

Comme on a pu le voir avec ma petite histoire, un code ne devient pas toxique du jour au lendemain. Il s'agit d'une dégradation graduelle sans pour autant être toujours perceptible. Les responsables et les développeurs sont bien conscients du processus de dégradation ce qui fait que l'application peut rester en fin de vie des années avant qu'une décision d'agir soit prise. Pendant ce temps, on continue à opérer dessus et c'est là le noeud du problème: qu'il s'agisse évolutions ou de patchs, chaque changement augmente la toxicité de l'application, comme s'il s'agissait d'un mélange de poisons. On se retrouve pris dans un cercle vicieux de dégradation accélérée où il nous faut toujours plus de patchs... L'application demande sans cesse davantage de moyens humains et techniques pour son évolution et sa maintenance, son coût augmente et sa rentabilité diminue. C'est ça que j'appelle de la toxicité: un processus de vieillissement accéléré de l'application, comme si elle était malade, empoisonnée, et qu'elle contaminait tout ce qu'elle touche.

### Du point de vue du responsable

En tant que responsable, chef de projet ou produit, vous n'êtes généralement pas en contact avec le code source de l'application, il vous est donc difficile de vous rendre compte de sa toxicité. Voici néanmois quelques points qui peuvent vous aider à identifier un code toxique:

+ grande difficulté à sortir de nouvelles fonctionnalités, même simples
+ time-to-market élastique (le temps qui sépare la réalisation de la mise en production)
+ ras-le-bol généralisé des équipes techniques, départs
+ difficulté de détection, de reproduction et de correction des bugs
+ risques accrus de dysfonctionnement lors des mises en production
+ appels fréquents à l'astreinte par votre (vos) client(s) (quotidiens dans les cas graves)
+ empilement des tickets d'incidents et des rapports de bug
+ rallentissement généralisé de la cadence des équipes de développement

Si vous les décellez, il est alors urgent de prendre les décisions qui s'imposent: passer l'application en fin de vie et investir dans une nouvelle version, passer par une grosse phase de refactoring ou encore externaliser le support de l'existant actuel pour laisser les équipes se concentrer sur les améliorations ou la nouvelle version, vous avez le choix. Mais si vous laissez le projet aller à vau-l'eau, vous risquez de détruire votre bénéfice, ou pire de vous faire coiffer au poteau par un concurrent plus audacieux.

### Du point du vue du technicien

En tant que technicien, vous avez le code sous les yeux et je pense que vous reconnaissez assez facilement un code toxique, surtout si vous aimez le travail bien fait et que vous appliquez rigoureusement les bonnes pratiques de développement. Mais comment savoir a quel point il l'est ? [Erik Dörnenburg](http://erik.doernenburg.com/) dans son article [How toxic is your code?](http://erik.doernenburg.com/2008/11/how-toxic-is-your-code/) (a quel point votre code est-il toxique ?) a immaginé une méthode de mesure simple:

> Le calcul de la toxicité est basée sur des métriques et des seuils. Par exemple, la métrique de longueur d'une méthode a un seuil de 30. Si une classe contiens une méthode qui est plus longue elle obtiens un nombre de points proportionnel à la longueur de la méthode par rapport à son seuil, par exemple une méthode de 45 ligne obtiendrait un score de 1.5 parce que sa longueur est 1.5 fois le seuil. Le score de tous les éléments est addition. Donc, si une classe contiens 2 méthodes, une de 45 lignes et une de 60 lignes, son score pour la longuer de ses méthode sera de 3.5 points. Ce qui signifie que les éléments ne sont pas uniquement qualifiés comme toxiques, leur score révèle également à quel point ils le sont.

Il propose d'ailleurs une table des métriques et des seuils acceptables sur lesquels les multiplicateurs sont basés:

<table>
    <thead>
        <tr>
            <th>Métrique</th>
            <th>Niveau</th>
            <th>Seuil</th>            
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
            <td><abbr title="Le nombre d'instanciations d'autre classes par une classe donnée">Couplage abstrait</abbr></td>
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

Cette table à été imaginée pour déterminer la toxicité d'une application Java, Erik Dörnenburg a d'ailleurs créé [un outil](http://erik.doernenburg.com/2013/06/toxicity-reloaded/) qui permet d'obtenir une représentation graphique de cette toxicité, mais c'est applicable à d'autres langages dans l'ensemble.

Ces métriques et seuils ont été déterminés arbitrairement. Erik a pensé la mesure de la toxicité en opposition au concept de "mauvais code", bien trop vague, pour founir une donnée utile pour le plus grand nombre. Par exemple, en ce qui concerne la métrique de longeur de méthode, on est en droit de penser que personne ne constestera le fait qu'une méthode ne devrait pas faire plus de 30 lignes. Et au cas où vous n'êtes pas d'accord avec ces seuils, vous pouvez trouver les votres mais il est conseillé d'utiliser ceux-là d'abbord.

## Le code radioactif

En tant que développeur, avez vous déjà écrit un segment de code dans lequel vous ne voulez surtout pas remettre les doigt ? Vous savez que vous avez écrit un code toxique qui va endommager votre santé mental dès lors que vous allez devoir travailler à nouveau dessus. Ce code n'est pas juste toxique: il est radioactif car il irradie

## Que faire d'un code toxique ?

S'il est avéré que le code est toxique, que faut-il en faire ? Comme on l'a vu, continuer à travailler dessus ne fera que le dégrader davantage. C'est pire que du temps perdu: c'est de l'alourdissement de dette technique, donc de l'accumulation de temps à perdre à court ou moyen terme. Selon moi, il n'y a qu'une seule solution: prendre une grande inspiration et recommencer.

## Comment éviter que le code ne devienne toxique ?

### Le refactoring

Le refactoring est la discipline visant a réorganiser et nettoyer le code source d'une application en vue de l'améliorer. Il s'agit d'une étape coûteuse dans le cycle de vie d'une application, surtout si elle n'est pas faite périodiquement, mais nécéssaire pour maintenir un niveau de qualité et de performances satisfaisant. Dans les cas extrêmes il vaut largement mieux repartir d'une feuille blanche plutôt que d'essayer de refactorer un code dont la toxicité à atteint son paroxysme, ça coûtera moins cher.

Avant d'aller plus loin, je tiens à préciser que vous ne pouvez pas tuer le spectre du refactoring, vous pouvez seulement l'éloigner. Nous verrons plus loin comment. Cela étant dit, ne pas faire de refactoring revient à dire qu'on a fait quelque chose de parfait dès le départ. Mais nous ne sommes ni des machines ni des dieux, nous faisons sans cesse des erreurs, c'est pour pourquoi le refactoring est __nécéssaire__. La méthode de mesure de toxicité expliquée plus haut peut vous aider à orienter votre refactoring sur les segments de code les plus critiques si nécéssaire. Mais je pense que l'équipe technique est tout à fait à même de déterminer sur quels composants l'éffort doit se porter.

Les tests unitaires et les tests fonctionnels ont une importance cruciale dans le processus de refactoring. Ils permettent de s'assurer que la nouvelle version est identique à l'ancienne en termes de comportements. S'ils n'ont pas été prévus au départ, vous ne pourrez mettre en place que les tests fonctionnels pour tester l'interface de votre application mais dans ce cas le niveau de confiance de votre refactoring sera moindre. Vous pouvez en parallèle mettre en place des revues de code et/ou du peer-programming afin de réduire le risque de régression.

Un bon moyen d'éviter à avoir a faire du refactoring plus tard c'est d'éviter de procrastiner. Ne vous dites jamais _"on fait sale aujourd'hui, on refera proprement plus tard."_ En 4 ans de développement en entreprise __ça ne m'est jamais arrivé__. Aucun chef de projet n'allouera du temps à l'amélioration du code si ça ne débouche sur aucune valeur, peu lui importera que ce soit nécéssaire à vos yeux. A vous de défendre votre steak lors des phases de planification pour que le temps qui vous est alloué sur une tâche vous permette de faire les choses proprement dès le départ. N'essayez pas non plus de briller en proposant de la performance au prix de la conception, des tests et de la documentation. Réduire le temps d'une tâche à toujours un coût, gagner une heure aujourd'hui peut facilement faire boule de neige et vous en faire perdre dix plus tard. Multiplié par le nombre de tâches "amputées" qui ont étés exécutées sur un projet, on voit rapidement l'ampleur que peut prendre le problème. En somme, si vous rabottez vos tâches lors des phases de planification, c'est que vous êtes d'accord avec le fait que _"ça c'est un problème pour le futur moi, la vache je l'envie pas celui-là !"_

Si toutefois c'est impossible (ça arrive) alors __isolez__ et __balisez__ votre "sale code" afin d'éviter que sa toxicité ne se propage à tout le projet. Tout élément fix ou patch fait en urgence doit toujours être repris dans une logique de développement complête. Il faut transformer ce patch en régression puis en évolution produit et réfléchir avec tous les intervenants du projet à comment le réintégrer proprement et sans dommage. De cette façon, vous transformez quelque chose de toxique en quelque chose de bénéfique pour le projet.

### Anticiper le futur sans tenter de le prédire

Inutile de s'essayer à la divination, __vous ne pouvez pas prévoir comment un projet va évoluer__. Pas plus que vous ne pourriez prévoir avec exactitude combien de pomme va vous donner un pommier dont vous venez de planter la graine. Donc rangez votre boule de cristal et passez a la [compatbilité descendante](http://blog.ircmaxell.com/2013/06/backwards-compatibility-is-for-suckers.html).

Vous êtes probablement famillier avec le concept de compatibilité ascendante qui consiste a faire en sorte que le nouveau code produit soit toujours compatible avec l'ancien. La compatibilité descendante c'est exactement l'inverse: on essaie de faire en sorte que le code, au moment où on l'écrit, soit compatible avec le futur code. En somme, on va essayer d'anticiper les futurs besoin du code qu'on écrit aujourd'hui et on va les implémenter de façon suffisament adaptable pour que les futures implémentations puissent s'y glisser sans compromettre la compatibilité ascendante.

Il faut garder à l'esprit que le code va évoluer qu'on le veuille ou non et le construire d'une façon suffisament adaptable pour qu'il reste valide, même pour des besoins futurs. On ne cherches pas ici à correspondre à la perfection à ces besoin (c'est par définition impossible sans une Dolorean et 2.21 GW) mais simplement à penser et influencer nos développements en fonction des futurs besoin et pas seulement les besoins actuels.

Concrêtement, on peut par exemple équiper une méthode d'interface d'un paramètre `options` afin de pouvoir lui passer autre chose que les paramètres qu'on lui avait attribué à la base, évitant ainsi de devoir modifier son prototype dans le futur. De la même façon, on pourra mettre en place des architectures modulaires ou [orientées composants](http://bdelespierre.fr/article/php-injection-de-dependances-et-composants) qui permettront davantage de flexibilité pour les futurs changements. Ou encore d'utiliser des bitfields plutôt que des codes alphanumériques afin de ne pas devoir changer les interfaces et les prototypes pour ajouter de nouveaux codes. Ce sont autant des choix architecturaux que des choix d'implémentation qu'il faudra penser en vue des usages futurs.

Ne pas oublier: il faut avoir la capacité à faire du zooming + zoomout. Voir le macro et le détail. Avoir la capacité à voir l'ensemble et le détail. On ne peut pas deviner l'évolution mais anticiper l'évolution possible. par exemple > jeu video (carte + gameplay). 

Par exemple, les concepteur du jeu Dark Messiah ont eu l'idée de permettre au joueur d'accrocher un grapin sur les poutres des bâtiments pour pouvoir se balancer. En soi l'idée était bonne et ajoutait un élément de gameplay intéressant. Lors de l'implémentation les développeurs ont donc fait en sorte que le grappin puisse s'accrocher aux textures bois. Le problème c'est que des textures bois, il y en avait partout, ce qui permettait au joueur de sortir de la carte. Les développeurs n'ont donc pas pensé cette fonctionnalité dans le contexte global du jeu.



