---
layout: post
type: article
title: JavaScript, le noeud du problème
date: 2013-11-26
category: javascript
tags: [javascript, oop, angular, backbone, node, jquery, php, web, programmation, development]
description: Un rapide tour d'horizon de JavaScript et ses usages dans le web d'aujourd'hui
---

Dans l'histoire des langages, peu ont autant déchainés les passions que JavaScript. Ses détracteurs lui reprochent son manque de cohérence, son typage faible, son acessibilité qui permet de faire tout et n'importe quoi. Ses adeptes lui reconnaissent souplesse, performance et adaptabilité. On parle beaucoup de JavaScript, surtout aujourd'hui, mais plus qu'un débat d'idées c'est une bataille rangée qui fait rage dans la communauté; personne n'aime juste "un peu" JavaScript, on adore ou on déteste.

Comme PHP, JavaScript à lui aussi longtemps souffert d'une communauté d'amateurs peu informés, renvoyant au public une image biaisée du langage et de ses possibilités. Certes il n'est pas parfait, mais ce qu'on fait de nos jours avec mérite notre attention et force parfois le respect.

Contrairement à mon habitude, l'objet du présent article n'est pas de vous apprendre JavaScript ni un de ses aspects en particulier mais simplement de faire un rapide tour d'horizon sur ce qu'il est possible de faire avec JavaScript en 2013.

## JavaScript de J à T

A l'origine, JavaScript était conçu en 1995 par Netscape comme un moyen simple de dynamiser les pages web en réponse à des langages plus lourds et contraignants comme Java. JavaScript à été voulu simple et léger à destination des programmeurs amateurs, comme Visual Basic de Microsof. Le nom JavaScript prête souvent à confusion, Netscape le voyait au départ comme un complément de Java, il à été développé sous le nom de code _Mocha_, puis s'est appellé _LiveScript_ pour finalement être déployé sous l'appellation _JavaScript_ (nul doute que c'était plus vendeur à l'époque). De nos jours, JavaScript est normalisé par l'ECMA sous le nom officiel d'ECMAScript.

Vu le nombre incalculable d'individus, professionnels ou non, qui font encore l'erreur, je le répète: __NON__, JavaScript n'a strictement rien à voir avec Java. Leurs environements sont différents, leurs syntaxes sont différentes, leurs modèles objets sont différents et on pourrait continuer toute la semaine le petit jeu des différences. Ils n'ont tout simplement rien à voir si ce n'est que ce sont tous deux des langages.

JavaScript est un langage multi-paradigme, impératif, fonctionnel, orienté objet et à prototype (on y reviendra). Contrairement à Java ou PHP qui sont indisociables de leurs plateformes, JavaScript est simplement un langage de script c'est à dire que sont rôle est de venir se greffer à une application existante pour permettre de programmer dessus. Par exemple, l'usage le plus répandu de JavaScript est le JavaScript DOM, c'est celui avec lequel vous travaillez quand vous scriptez vos pages web. Dans ce contexte, JavaScript vous permet de manipuler le modèle du document (Document Object Model ou DOM tout simplement) et des objets de base ainsi qu'une API vous sont fournis pour ça (comme l'objet window par exemple). Mais on peut également mettre du JavaScript sur théoriquement n'importe quoi, c'est le cas d'OpenOffice, d'Acrobat Reader, des Google Apps, de MongoDB, de NodeJS, de PHP (eh oui) etc. Il est donc loin de se cantonner aux seules pages web (on y reviendra également) ses "concurents" directs dans ce domaine sont notamment [Python](http://www.python.org/) et [Lua](http://www.lua.org/).

JavaScript est un langage interprêté qui tourne sur une machine virtuelle, il en existe bon nombre depuis sa création mais les plus connues de nos jours sont Rhino (Mozzila), SpiderMonkey (Firefox), Chakra (Internet Explorer) et en tête du classement, V8 (Google) souvent citée comme étant la plus performante. Une liste plus complête est disponible sur [Wikipedia](http://en.wikipedia.org/wiki/List_of_ECMAScript_engines).

### Ce que le public retient de JavaScript

Ce qu'on retient en général de JavaScript c'est ça:

{% highlight html linenos %}
<a class="button" onclick="ma_fonction_javascript()">Mon Button</a>
{% endhighlight %}

Ah ce bon vieux mélange de HTML et de JS. En tant que développeur web, j'en boufferai jusqu'a ma mort je crois. On a aussi l'habitude de voir ça:

{% highlight html linenos %}
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript">
$(function () {
    $('.ma-classe').click(function () {
        $(this).hide();
    });
});
</script>
{% endhighlight %}

Et c'est souvent sous cette forme que vous le verrez, surtout si le code sur lequel vous opérez n'a pas été écrit par un développeur JavaScript.

On parle aussi beaucoup d'AJAX (Asynchronous JavaScript And XML), qui est un moyen simple et efficace d'effectuer des requêtes HTTP sans avoir à rafraîchir la page ce qui est le pillier de tous les sites modernes et à largement contribué à l'émergence du concept d'application web. Si vous ne connaissez pas, retennez seulement qu'une requête AJAX c'est une sous requête envoyée via JavaScript au serveur de manière totalement transparente pour l'utilisateur (c'est la technologie qui sous-tend Facebook, également connue sous le nom de [BigPipe](https://www.facebook.com/notes/facebook-engineering/bigpipe-pipelining-web-pages-for-high-performance/389414033919)).

### Ce que le public ignore sur JavaScript

Encore trop de développements JavaScript sont fait à la va-vite, soit on à affaire à des morceaux de code directement injectés dans les attributs on* des balises HTML, soit on est face à une soupe de plugins jQuery dont l'imbrication semble ne plus avoir de fin (des fonctions dans des fonctions dans des fonction, bref, inception au pays du développement web).

Selon moi, c'est surtout dû au fait que les développeurs qui travaillent avec JavaScript sont trop peu au fait des 3 concepts clé du langage et donc n'en exploitent pas le plein potentiel:

+ le _scope_
+ le _prototype_
+ l'objet _function_

Je vais tenter de vous expliquer ça en quelques mots:

#### Le scope

Ou portée en français, il s'agit tout simplement d'un espace dans lequel on va définir des vériables, identifiées par des noms. En JavaScript, ces variables ne seront accessibles que dans le scope dans lequel elles sont définies ainsi que les scopes eux même définis dans celui-ci.

Exemple:

{% highlight js linenos %}
var a = 1;

function b () {
    var b = 2;

    function c () {
        var c = 3;
        console.log(a,b,c); // affiche 1 2 3
    }

    c();
}

b();
{% endhighlight %}

En fait, lors de l'éxecution d'une expression, si la variable n'est pas trouvée dans le scope courant, JavaScript va regarder dans le scope du dessus et ainsi de suite jusqu'a trouver la variable. Cette mécanique n'existe que pour les variables locales (définie avec le mot clé `var`), les variables globales sont disponibles dans tous les scope (ce qui les rends d'ailleurs potentiellement dangereuses).

#### Le prototype

Le prototype d'un objet JavaScript, c'est comme son scope parent en quelque sorte. Il s'agit d'un objet qui sert de "base" à un autre objet. De la même façon que pour les variables, si on demande une propriété qui n'existe pas sur l'objet courant, JavaScript va regarder dans le prototype de l'objet et ainsi de suite jusqu'a trouver la propriété demandée.

Exemple: 

{% highlight js linenos %}
function Type1 () {
    this.a = 1;
}

function Type2 () {
    this.b = 2;
}

// Type2 "hérite" de Type1
Type2.prototype = new Type1();

var t2 = new Type2;

console.log( t2.a, t2.b ); // affiche 1 2
{% endhighlight %}

#### L'objet Fonction

En JavaScript, toute fonction est un objet Function qui peut représenter plusieurs de ces aspects suivant le contexte:

+ un scope, car elle permet de définir des variables qui seront locales à la fonction
+ une fonction (au sens littéral), c'est à dire un ensemble de traitements, nommée ou non
+ un constructeur (pour une "classe"), qui va décrire comment un objet doit se construire
+ une closure, qui va enfermer le scope parent et donc "hériter de ses variables"

Comme dans l'exemple ci-dessus, on remarque qu'une fonction peut se servir du mot clé this. Mais contrairement à des langages objets classiques, en JavaScript une méthode (une fonction attachée à un objet) peut être exécutée dans un autre contexte que celui de sa classe d'origine. Cet usage extrêmement pratique et répandu est rendu possible grâce au méthodes `call` et `apply` de l'objet Function.

Exemple:

{% highlight js linenos %}
var objet1 = {
    str: "Hello",
    afficher: function () {
        console.log( this.str );
    }
}:

var objet2 = {
    str: "World",
};

// appel direct de la méthode afficher
objet1.afficher(); // affiche "Hello"

// appel de la méthode afficher dans le contexte de objet2
objet1.afficher.call(objet2); // affiche "World"
{% endhighlight %}

Si vous souhaitez aller plus loin, je vous recommande chaudement les articles de [Douglas Crockford](http://www.crockford.com/) pour bien saisir ces concepts.

## La guerre des frameworks

JavaScript est un langage plutôt complexe à prendre en main, même s'il n'en a pas l'air au premier abord, mais sa principale difficulité réside dans son support coté navigateurs. C'est une problématique simple: chaque année, plusieurs personnes se réunissent pour déterminer ce que sera le futur de JavaScript et élaborer un standard (c'est le boulot de l'ECMA qu je citais ci-dessus). Libre à chaque navigateur de l'implémenter comme bon lui semble. On se retrouve donc avec le même problème que celui du support de HTML5 ou de CSS3: tous les navigateurs ne vont pas au même rythme (à ce sujet, ça me démangeait de tirer à boulets rouges sur Internet Explorer mais je me suis retenu par peur que le torent d'insulte que j'aurais eu à proférer ne me contraigne à afficher un logo -18).

Avec la popularisation du langage dans les années 2000, le problème de compatibilité inter-navigateur (cross-browser) des scripts s'est rapidement posé et sont arrivés les grand frameworks JS pour y répondre. [Prototype](http://prototypejs.org/), [jQuery](http://jquery.com/), [MooTools](http://mootools.net/) et [YUI](http://yuilibrary.com/) sont certainement les plus connus mais il en existe une [pléthore](http://en.wikipedia.org/wiki/Comparison_of_JavaScript_frameworks).

Ces frameworks sont rapidement devenus populaires car ils permettent "d'applatir" les différences entre les navigateurs, de combler les trous qui auraient dû être implémentés, et généralement de fournir une interface plus "sexy" pour le développeur. C'est vrai que Sizzle, le sélécteur de jQuery, nous a grandement facilité la vie. Fort heureusement, ces différences entre navigateurs ont tendance à se lisser et on peut de plus en plus recourir à du code natif (vanilla). Mais la segmentation du marché des navigateurs web est repartie de plus belle avec l'arrivée des smartphones et des tablettes ce qui promet un nouvel age d'or des frameworks mobile.

Force est de constater que peu de développements sont aujourd'hui fait en JavaScript natif. C'est plus long, moins élégant et surtout plus ingrât pour le développeur mais c'est aussi bien plus performant et on a une meilleure maitrise des objets manipulés. Je suis le premier à dire qu'il faut maitriser une technologie avant d'utiliser un framework ou tout autre outil destiné à simplifier la vie du développeur car sinon on apprends jamais (voir mon article [On vous a menti](http://bdelespierre.fr/article/on-vous-a-menti)). Mais pas dans le cas JavaScript.

JavaScript est typiquement le langage où je vous recommande l'usage d'un framework dès le départ. Et si vous n'y connaissez vraiment rien, utilisez jQuery. Le jour où vous aurez besoin de faire quelque chose d'un peu complexe, vous serez obligé d'approfondir JavaScript, mais se lancer dans le natif d'entrée de jeu, c'est louable mais difficile surtout si vous voulez des scripts compatibles partout. Ne vous cassez pas la tête pour une fois, utilisez jQuery.

## jQuery ou la soupe de plugins

Inutile de se voiler la face, pour le JavaScript DOM sur Desktop, c'est clairement jQuery le plus populaire (a tel point qu'on le mets comme prérequis sur les descriptifs de postes de dévelopeurs, c'est dire). Même s'il facilite grandement la tâche du développeur, son incroyable facilité d'utilisation a un prix: il est difficile d'y maintenir une structure cohérente dès lors qu'on ajoute plugin sur plugin.

Ce phénomène est appellé "soupe de plugin" car la recette est sensiblement la même que celle du potage de mamie: on prends tous les légume qu'on a besoin, un peu d'eau et hop, une bonne sousoupe (en plus c'est plein de vitamines m'a t'on dit). Le problème majeur que cela pose est l'impact sur le temps de chargement. Chaque plugin devant être chargé avec une balise &lt;script&gt; dédiée, la taille du head augmente vite. Il existe bien des solution comme [RequireJS](http://requirejs.org/) qui permettent d'assembler et de compresser tous ces fichiers mais l'usage courant est de faire les include "à la barbare". Cette pratique fait d'autant plus de dégât dans des environnements contraignants comme le web mobile où les performances de la machine sont plus limitées et la bande passante réseau plus restreinte.

Mais on peut reconnaitre à cette pratique un avantage: elle a popularisé le développement orienté composant en JavaScript, notament avec [RequireJS](http://requirejs.org/) et [Angular](http://angularjs.org/). De fait, les interface web on largement gagné en ergonomie et en richesse grâce à JavaScript et jQuery, se pose désormais la question de comment assembler tout ça en une structure cohérente. __Enfin__, on commence à penser les scripts JS comme des applications et non plus comme de simples systèmes évènementiels callback > listener pour se la pêter avec des animations.

En somme, je ne considère pas jQuery comme un framework car il ne s'agit pas d'un composant destiné à encadrer le développement et à poser les base d'une architecture applicative mais uniquement à le faciliter (ce qui est déjà la moitié du travail, j'en conviens). jQuery a pourtant fait quelques efforts dans ce domaine avec jQuery UI et jQuery Mobile mais ces deux solution sont souvent jugées bien trop lourdes pour être utilisables (surtout jQuery Mobile). De plus, je n'aime pas du tout leur coté "magique": avec jQuery Mobile, presque tout se fait avec des data-attributes et le développement à proprement parler n'a pratiquement plus sa place. Je suis d'avantage à mon aise avec le trio [RequireJS](http://requirejs.org/) + [Underscore](http://underscorejs.org/) + [Backbone](http://backbonejs.org/), c'est léger, souple et puissant, en un mot: élégant.

## Le JavaScript coté serveur

Je ne vais pas m'étendre sur le sujet car c'est un univers que je maitrise encore très mal mais dans l'idée, la figure de proue du JavaScript coté serveur est (et à mon avis restera encore longtemps) [Node.js](http://nodejs.org/). Quand on voit avec quelle facilité et quelle rapidité on arrive à faire une application pas trop branque avec Node.js, je ne sais pas pour vous mais moi ça me laisse admiratif.

Pourtant, sur le papier c'est tout bête: la gestion réseau, les threads, les pools, l'évènementiel, tous ces aspects existent déjà dans la plupart des plateformes. Node.js s'est finalement contenté d'y ajouter du scripting JavaScript. De mon point de vue, Node.js c'est simplement les librairies standards C/C++ exposées à un moteur JavaScript, ici [v8](https://code.google.com/p/v8/), la machine virtuelle JavaScript de Google, la plus performante du marché.

Et ça marche, Node.js affiche des performances assez spectaculaires et se vante ouvertement de pouvoir maintenir 100.000 connections sur un seul thread (sous-processus).  De plus, Node s'est rapidement imposé comme __la__ solution aux problématiques de push du web moderne. Je m'explique: immaginez que vous souhaitiez faire un chat pour votre site web. Si vous travaillez avec PHP par exemple, il va vous être difficile de pouvoir notifier le navigateur de l'utilisateur connecté au travers d'une websocket (un canal bi-directionnel entre le client et le serveur) car cette socket à besoin de rester ouverte pendant toute la durée de la session. Hors PHP s'arrête une fois la requête servie. C'est là que généralement Node vient nous sauver la mise: comme votre programme JavaScript tournant sur Node ne s'arrête pas entre deux échanges, vous pouvez maintenir un état des utilisateurs connecté et des messages qu'ils s'échangent et ainsi les "pousser" (on parle de push) sur le navigateur d'un client donné.

Ce concept n'est pas nouveau, on peut faire exactement la même chose en Java par exemple mais là où Node est vraiment séduisant c'est qu'il permet de faire tout ça avec du JavaScript. Si en plus vous utilisez un framework client (comme [Angular](http://angularjs.org/) ou [Backbone](http://backbonejs.org/) cité plus haut) pour gêrer l'affichage et une base de données NoSQL comme [MongoDB](http://www.mongodb.org/) (dont JavaScript est le moteur de requêtage), vous disposez d'une stack 3-tiers full-JavaScript. Sympa non ?

## Conclusion

Les usages du web changent, c'est pas nouveau. JavaScript est encore selon moi une technologie naissante et du coup en plein essor. Je ne vous ai présenté ici que certains des projets de cet univers qui sont selon moi le reflet de ce changement. Nous voulons pour nos utilisateurs des interfaces plus riches, plus dynamiques et plus performantes et JavaScript fait figure d'outsider dans l'univers des technologies web. Certrs cette essor s'accompagne de beaucoup de projets bancals et on ne sait pas encore très bien à quoi s'en tenir, beaucoup de ces projets sont encore en béta et dans un sens on pourrait dire qu'il manque une certaine maturation à cet écosystème mais d'ores et déjà, les performances et la facilité d'utilisation qu'apporte les nouveaux usages de JavaScript ont sû séduire des acteurs majeurs du web (Facebook, Twitter, Amazon, Google et j'en passe...)

J'espère sincèrement que JavaScript continuera sur sa lancée et s'aura s'imposer, coté client comme coté serveur, comme langage de tout premier plan sur le web, même si ça me fera mal d'admettre qu'un jour (à mon humble avis) il faudra presque mettre PHP au placard, mais c'est justement ce qui fait tout le sel de la programmation web: ça bouge tout le temps.