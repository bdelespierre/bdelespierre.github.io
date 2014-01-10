---
layout: post
type: article
title: On vous a menti !
date: 2013-05-13
category: article
tags: elearning web developpement tutorial
---

La prolifération des sites d'e-learning autours des technologies web, bien qu'étant un formidable moteur d'intérêt pour ces technologies auprès du public, m'a toujours inquiété en raison de leur méthode d'aprentissage majoritairement didactique. On ne présente plus désormais des sites tels que [nettuts](http://net.tutsplus.com/) ou [Le Site du Zéro](http://www.siteduzero.com/) qui font du tutoriel un fond de commerce. Ces sites véhiculent selon moi une image biaisée de la programmation: celle d'une "recette de cuisine" réduisant la discipline à une série de problème connus et identifiés que quelques étapes apparemment toutes bêtes permettent de déjouer.

Grâce à eux depuis environ dix ans, on croise ça et là au détours des forums ou des chats des amateurs, toujours plus nombreux, visiblement perdus lorsqu'il s'agit de sortir du cadre de ces tutoriels. Si vous êtes un habitué des communautés de développeurs, vous savez de quoi je parle.

C'est justement à cette communauté de novices curieux des technos web que je m'adresse aujourd'hui: ces sites vous ont menti en vous laissant croire qu'en sortant de leurs "cursus", vous seriez de vrais développeurs web. Loin de moi l'idée de jeter la pierre à ces exercices techniques qui sont pour moi une étape cruciale dans l'apprentissage, mais nous allons voir ensemble quelles sont les problèmes induits par cette dérive de l'apprentissage facile.

Je passerai sous silence la manifeste pauvreté technique ou l'obsolécense caractérisée de certains tutoriels malheureusement propulsés en tête des résultats de recherche, le cadre de cet article se limite strictement aux dégats qu'occasionnent l'abus de tutoriels lors de l'apprentissage.

## La fausse confiance en soi

Exécuter avec succès toutes les étapes d'un didacticiel et arriver à faire marcher un bout de code vous donne l'illusion d'avoir apris quelque chose et d'y être arrivé par vos seuls moyens. C'est évidement faux, n'importe qui arrive plus ou moins facilement à un résultat si on lui dicte un série d'étapes à suivre. Pourtant, vous y êtes arrivé, et vous passez alors à un didacticiel de difficulté supérieure, sans même prendre le temps de digérer les concepts que le premier vous a énoncé.

Arrivé au bout du cursus, fort de votre "expérience", vous vous sentez à même de faire quelque chose par vous même, vous vous essayez donc à réaliser un projet qui en général ressemble à ce que vous avez vu dans ces tutoriels avec quelques fonctionnalités en plus ou en moins. Pour beaucoup, cette étape se solde par un échec, en sortant du cadre du didacticiel bien balisé et lâché dans la jungle des API du langage, vous ne savez vite plus où vous en êtes, vos faiblesses techniques prennent le dessus et finalement, votre petit projet ne fonctionne pas.

On vous retrouve alors sur les différentes communautés en ligne, posant des question réccurentes qui sont la plupart du temps déjà renseignées dans les FAQ ou dans les manuels. Les développeurs expérimentés vous traitent même parfois avec mépris, se contentant de répondre à vos messages par _"RTFM"_ ou _"Google est ton ami"_... D'aucuns vous diront que vous l'avez bien cherché.

Si vous ne vous reconnaissez pas dans ce petit scénario, vous en avez sûrement déjà expérimenté un aspect ou bien vous connaissez quelqu'un qui est passé par là. Mais le coupable, ce n'est pas vous. C'est le tutoriel lui même qui vous a balancé à la figure des kilos de références techniques sans pour autant les expliquer, et pour cause, ça prendrait du temps alors que le tutoriel se veut __rapide__ pour être __attractif__ (et __vendeur__).

## Apprendre, c'est comprendre

Il y a une différence fondamentale entre l'aprentissage scolaire pratiqué dans les universités et le processus didactique dominant dans l'e-learning actuellement: à l'école, on place les exercices pratiques _après_ le cours théorique. Dans l'e-learning, on compte sur la bonne volontée et sur la curiosité de l'étudiant pour approfondir les aspects techniques de l'exercice, certains le font, beaucoup font l'impasse.

Quel est le problème ? C'est pourtant en forgeant qu'on devient forgeron non ? C'est vrai que rien ne remplace la pratique mais l'expérience seule ne peut apporter toutes les réponses, surtout dans un domaine aussi vaste et technique que le développement web. Pour reprendre à bon compte cet adage célèbre, forger ne vous donne pas une connaissance de la physique des métaux ou du maniement des outils, ou du moins pas de manière aussi complête qu'un bon vieux cours bien barbant.

Même quelqu'un d'aussi borné que moi et d'aussi réfractaire aux méthodes d'enseignement traditionnelles ne peut que reconnaitre qu'à un moment ou un autre il faut passer par une étape d'apprentissage théorique rébarbative sans laquelle la maîtrise d'un concept __dans son ensemble__ est impossible. Libre à vous de choisir la méthode qui vous sied le mieux, livres, articles, cours en ligne, podcasts, conférences, écoles, FAC, vous avez l'embarras du choix.

Il y a autant de parcours que d'étudiants, je n'ai pas de solution miracle à vous proposer pour devenir un bon développeur. D'ailleurs, même quelqu'un disposant d'un solide bagage théorique et technique peut se révêler être un mauvais programmeur car la programmation est une discipline qui vise à trouver des solution adaptées à des problèmes concrêts. Certains développeurs sont pris dans la spirale de la technique pour la technique et perdent de vue cet aspect fondamental et sont de fait _"à coté de leurs pompes"_.

Il existe néanmoins quelques fondamentaux que vous vous devez de connaitre sinon de maîtriser:

* le protocole HTTP
* la distinction client / serveur
* la gestion des ressources
* comment fonctionne un système de fichier
* comment fonctionne un interprêteur
* comment fonctionne un compilateur
* les bases de données
* l'algèbre relationnelle
* l'algèbre booléene
* l'algorithmique

Ces concepts théoriques ne sont généralement jamais couverts par des didactitiels, ils ne sont pas populaires car on ne travaille pas avec quelque chose de concrêt. Il s'agit pourtant là d'outils théoriques indispensables, on ne peut pas toujours s'en remettre à la _"magie du truc"_ qui fait que ça marche sans qu'on comprenne pourquoi. Arrivera fatalement le moment où vous aurez besoin de ce bagage, autant vous en équiper dès que possible.

Par exemple, vous ne pouvez pas tout simplement vous retrancher derrière la phrase _"Apache s'en occupe pour moi, j'ai pas à m'en soucier"_ et vous en servir comme pretexte pour faire l'impasse sur le protocole HTTP et la gestion des ressources. D'une part vous serez bien ennuyé le jour où quelque chose ne fonctionnera plus à ce niveau, d'autre part vous encourrez le risque de produire une solution inadaptée car elle ne tiendra pas compte des spécificités "bas niveau". Vous pouvez par exemple déclencher le téléchargement systématique d'un script JavaScript lourd alors que ce dernier pouvait être mis en cache par le navigateur comme prévu par le protocole tout simplement parce que vous ignoriez qu'il était possible de faire ça.

## Article, livres, cours et tutoriels

Il y a plusieurs niveaux de lecture pour les aspects techniques, du traditionnel tutoriel sur l'envoi de mails en PHP jusqu'au paveton de référence qui pourrait servir à caler une armoire, et il n'est pas facile de s'y retrouver dans ce brouhaha de littérature spécialisée. Pas facile non plus quand on est face à une ressource qui traite d'un sujet qu'on connait mal de savoir si elle est de qualité, toujours d'actualité, s'il s'agit d'une référence ou du délire d'un développeur solitaire en vadrouille.

Afin d'orienter au mieux votre apprentissage, si vous n'avez pas la possibilité ou la volonté de suivre un cursus traditionnel, n'hésitez pas à demander conseil auprès de développeurs expérimentés. __N'ayez pas honte de ne pas savoir__, on ne nait pas avec la science infuse et la plupart des développeurs sont plus enclins à guider des débutants dans le choix de leur parcours d'aprentissage qu'a répondre à des questions techniques évidentes de la part d'amateurs qui ne savent manifestement pas de quoi ils parlent.

Coté technique, c'est encore le manuel du langage qui est le plus adapté pour répondre à une question technique précise, n'hésitez donc pas à utiliser les moteurs de recherche de [php.net](http://php.net/), du [W3C](http://www.w3.org/), de [jQuery](http://jquery.com/) etc. Méfiez-vous des ressources externes comme w3school, leurs succès est plus dû à leur référencement qu'à leur pertinence ! N'utilisez que les références officielles, les autres cherchent juste à faire de l'argent en monétisant le travail d'autrui à grand renforts de publicité sans même se fendre de citer les références qu'ils ont pillé ni de s'assurer de la mise à jour de leurs propres pages. Si vous avez le moindre doute, n'hésitez pas à solliciter l'avis de developpeurs chevronnés.

D'après mon expérience, vous pouvez également vous reporter à [Wikipedia](http://fr.wikipedia.org/wiki/Main_Page) qui propose de nombreuses ressources de qualité dans le domaine de la programmation, surtout en ce qui concerne les sujets assez transverses comme l'analyse et conception ou les design patterns.

La littérature est également une bonne source d'information mais attention, les presses tournent moins vite que les sites web et beaucoup de livres se retrouvent vite dépassés. Si vous souhaitez faire l'aquisition de quelques bouquins, je vous recommande de choisir des ouvrages qui traitent de sujet assez généraux qui resterons valides pas mal de temps. Le web est par essence un domaine qui bouge énormément avec en général une petite révolution par an, donc une littérature trop précise devient vite obsolète. Beaucoup de communautés en ligne proposent des critiques de livres qui vous permettent de faire votre choix dans ce vaste monde de papier.

Gardez à l'esprit qu'il est absurde de vouloir de tout savoir. La physique de la combustion de matériaux organiques vous échape peut-être, pourtant vous savez globalement comment fonctionne un moteur à explosion, c'est le même principe. Le développement logiciel s'est ramifié à un point tel qu'un parallèle avec la médecine est possible: vous pouvez choisir d'être généralise et moyen en tout (PHP + HTML + CSS + JavaScript) ou choisir de minorer dans un domaine en particulier et devenir expert JS par exemple. Mais l'époque où on pouvait se dire expert en tout dans le web est révolue (ou alors vous avez un très très gros cerveau et vous devriez aller bosser à la NASA plutôt que de perdre votre temps à lire mes articles...)

## Conclusion

Une expertise technique s'acquiert certes avec la pratique, avec l'implémentation concrète d'une solution dans des environnements contraignants, en échouant et en remettant sans cesse son travail en question, en se documentant sur les technologies au travers des cours ou des manuels. Mais aussi vrai qu'un bon tutoriel peut vous mettre le pied à l'étrier, si vous n'avez pas la curiosité d'aller plus loin, de comprendre en profondeur comment l'auteur du didacticiel en est arrivé à ses démarches, vous n'apprendrez jamais rien et finalement vous serez un bon petit singe-savant, incapable d'autre chose que de repêter bêtement ce qu'on vous aura apris.

Je ne vous dirai pas de ne pas suivre de tutoriels, ils sont souvent un bon moyen de découvrir rapidement les possibilités offertes par une technologie et de faire ses premiers pas dans le monde de la programmation. Je suis d'ailleurs passé par là dans mes premières années. Mais n'oubliez jamais d'approfondir. Un bon moyen de valider votre progression est de refaire exactement le même exercice mais d'une façon totalement différente et sans s'aider du didacticiel. Vous vous rendrez alors compte de vos faiblesses et serez à même d'orienter votre apprentissage en conséquence.

Pour finir, voici quelques communautés de développeurs recommandables où vous pourrez poser intelligemment vos questions:

* [Developpez.com](http://www.developpez.com)
* [AFUP](http://www.afup.org/pages/site)
* [Stack Overflow](http://stackoverflow.com) (en)
