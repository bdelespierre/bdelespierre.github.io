---
layout: post
type: article
title: PHP fait n'importe quoi avec les closures
date: 2013-07-31
category: php
tags: php php.5.4 closures wtf bug static binding
---

J'ai récemment découvert un comportement étrange avec les closures, après avoir un peu fouillé le problème, je partage avec vous mes découvertes. Accrochez-vous, c'est complêtement bizarre.

## Vous avez dit "closure" ?

Rappel pour ceux qui dormaient au fond. L'une des avancées majeures de PHP 5.3 était la mise en place des closures, très injustement appellées fonctions anonymes dans le manuel PHP, qui permettent de définir des fonctions à la volée à l'aide d'une syntaxe proche de celle de JavaScript.

L'avantage marteau de la closure par rapport aux fonctions annonymes et aux objets invoquables (voir [la méthode magique __invoke](http://www.php.net/manual/en/language.oop5.magic.php#object.invoke)) c'est qu'elle est capable de conserver des références de la porté dans laquelle elle est définie.

    <?php
    $a = "Robert";
    $f = function () use ($a) {
        echo "Bonjour $a";
    };
    $f(); // affiche "Bonjour Robert"

La seule chose qui manquait, c'était le support du mot clé `$this` au sein d'une closure afin de pouvoir l'utiliser dans le contexte d'un objet, c'est de l'or pour ceux qui aiment la délégation ! C'est justement ce qu'apporte PHP 5.4.

En fait quand on utilise la syntaxe `function () {}`, le moteur de PHP utilise comme à son habitude un raccourci bien pratique: il convertit tout ça en un objet `Closure` qui dispose d'une méthode `__invoke` (c'est de la même façon qu'ils implémenteront plus tard les générateurs). Ce mécanisme décrit comme un détail d'implémentation dans PHP 5.3 est devenu officiel depuis PHP 5.4. Désormais, les closures sont des objets. Ma foi pourquoi pas.

## Le problème

PHP 5.4 introduit la mécanique suivante: si une closure est définie dans une méthode de classe ou d'instance, alors sa portée par défaut devient l'objet ou la classe de cette méthode.

    <?php

    class Foo {
        protected $_bar = "Hello";
        public function bar () {
            return function () {
                return $this->_bar;
            };
        }
    }

    $o = new Foo;
    $f = $o->bar();
    echo $f(); // affiche "Hello"

Coté statique, c'est la même chose: on peut utiliser les mots clés `self` et `static` dans une closure. Il est d'ailleurs possible de manipuler le contexte d'éxécution de notre closure avec `Closure::bind` et `Closure::bindTo` afin "d'accrocher" la closure à un contexte personnalisé. Et ça, c'est __super__ pratique... En théorie.

Là où ça se corse, c'est qu'implicitement, une closure définie dans un contexte statique devient une __closure statique__ et ne peut plus être attachée à un contexte d'objet et c'est grave car il n'existe aucun moyen de différentier une closure d'une closure statique.

En somme, si je créée une méthode qui travaille avec une closure et qu'il me prends le goût d'attacher cette closure à mon objet pour permettre à la closure d'utiliser ses propriétés itnernes, je m'expose sans le savoir à une erreur fatale __qu'il m'est impossible d'anticiper__ !

    <?php

    class Foo {
        protected $str = "Hello";
        public function doGreet (Closure $f) {
            $f = $f->bindTo($this, $this); // Warning: Cannot bind an instance to a static closure
            $f();
        }
    }

    class Bar {
        public static function getGreet () {
            return function () { echo $this->str . " World!"; };
        }
    }

    $o = new Foo;
    $f = Bar::getGreet();
    $o->doGreet($f); // Fatal error: Using $this when not in object context

C'est quand même un comble non ? Là où c'est tordu, c'est que cet exemple fonctionne parfaitement avec une closure définie dans la portée racine, indépendament de tout objet:

    $o = new Foo;
    $f = function () { echo $this->str . " World!"; };
    $o->doGreet($f); // affiche "Hello World!"

Bien que le manuel prétende qu'on peut passer d'une closure statique à une closure non statique et vice-versa, je n'ai jamais réussi à rendre une closure statique utilisable dans un contexte d'objet.

> [Closure::bindTo] va vérifier qu'une fermeture non-statique à laquelle on passe un contexte d'objet deviendra liée à cet objet (et ne sera donc plus non-statique), et vice-versa. Dans ce but, les fermetures non-statiques auxquelles on passe un contexte de classe mais NULL comme contexte objet seront rendues statiques, et inversement.

Donc, si j'ai bien compris votre charabia, en passant `($object, null)` je définis un contexte d'instance pour ma closure et en passant `(null, $object)` je définis un contexte de classe. Dans la pratique, ce n'est pas le cas, il est effectivement possible de rendre une closure d'instance statique (même si c'est débile vu que dès qu'on va passer sur le mot clé `$this` ça va crasher) mais l'opération inverse reste impossible.

Le pire dans tout ça, c'est que la différentiation statique / objet n'est pas visible au niveau de l'API, pas de méthode ou de propriété isStatic qui nous permettrait au moins de savoir où on met les pieds.

## Une correction ? Quelle correction ?

Le problème à déjà été [soulevé par netmosfera](https://bugs.php.net/bug.php?id=64761) et on peut voir très clairement le beau Wont Fix (ne sera pas corrigé) sur la page du bug. La raison invoqué ? C'est le deisgn qui est comme ça. Point.

Si je traduis l'opinion de laruence sur la question:

> c'est voulu par le design. Si vous créez une closure à l'intérieur d'un "scope", alors la fonction est une "METHODE", donc elle doit être attachée à l'objet courant(this) ou statique. Dans votre exemple, puisque la closure est crée dans une fonction statique blah, dans laquelle "this" n'est pas disponible lors de la création de la closure, alors la closure est crée statique...

Ce qui n'empêche pas netmosfera de faire remarquer que dans le contexte global, `$this` n'est pas non plus défini ce qui n'empêche en rien d'attacher la closure à un contexte d'objet ou de classe.

La vraie raison, à mon avis, c'est que le standard PHP s'est encore pris les pieds dans le tapis avec les contextes statiques. On avait déjà eu droit à un beau n'importe quoi avec la résolution statique à la volée, maintenant ça va plus loin et le moteur fait carrément des suppositions sur l'utilisation qu'on va faire de nos objets.

Ah et j'allais oublier la cerise sur le gâteau: si vous pensiez pouvoir contourner la limitation en définissant une propriété publique aribtraire sur la closure de façon à l'identifier comme statique ou non, oubliez tout de suite. Les closures sont "verouillées" donc contrairement à __n'importe quel autre objet__ vous ne pouvez pas définir de propriétés dessus à l'aide de l'opérateur ->

## Conclusion

Il ne nous reste qu'a espérer que le bon sens gagne l'équipe du Zend Engine et que ce "détail" soit reglé. D'ici là, n'oubliez pas de faire attention avec vos closures.

#### Update du 31/07/2013

Julien Pauli à la rescousse avec [un patch](http://pastebin.com/QSEWQb8U):

<blockquote class="twitter-tweet"><p><a href="https://twitter.com/mageekguy">@mageekguy</a> oui il faut ma version patchee. G fait un patch pour ca, je vais le proposer ;)</p>&mdash; julienPauli (@julienPauli) <a href="https://twitter.com/julienPauli/statuses/362529854761091073">July 31, 2013</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

Affaire à suivre !