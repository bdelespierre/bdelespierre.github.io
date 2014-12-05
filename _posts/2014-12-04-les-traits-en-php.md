---
layout: post
type: article
title: Les traits en PHP
date: 2014-12-04
category: article
tags: [programmation, php, developpement, oop, poo, traits, classes, héritage, reutilisation horizontale, code]
description: Comprendre rapidement l'intérêt et l'usage des traits en PHP
spritzable: no
image: /images/articles/php-traits.jpg
related:
- title: La POO en PHP en 10 minutes (ou moins)
  url: la-poo-en-php-en-10-minutes-ou-moins
- title: Injection de dépendances et composants
  url: injection-de-dependances-et-composants-en-php
- title: La resolution statique à la volée
  url: la-resolution-statique-a-la-volee
---

Comme nous l'avons vu dans l'article [La POO en PHP en 10 minutes (ou moins)](http://bdelespierre.fr/article/la-poo-en-php-en-10-minutes-ou-moins/), l'héritage est un moyen simple de réutiliser des comportements existants et donc d'éviter la dupplication de code. C'est d'ailleurs un pilier _fondamental_ de la programmation orientée objet.

En revanche, la relation d'héritage est en fait une spécialisation. Ce qui signifie que la classe qui hérite doit partager une nature commune avec sa mère; par exemple, la classe Voiture peut être une spécialisation de la classe Vehicule mais certainement pas de la classe Canapé. Pourtant, dans le canapé comme dans la voiture on peut s'asseoir à plusieurs. Comment faire dans ce cas pour implémenter la méthode `faireAsseoir(Personne $personne)` dans deux classes qui ne partagent pas du tout les mêmes classes de base et ne peuvent pas s'hériter entre-elles ?

Jusqu'ici, la solution à ce genre de problème était de soit:

+ duppliquer le code (et tant pis pour les bonnes pratiques)
+ réaliser une composition (par exemple en injectant une instance de Fauteuil, ce qui introduit du couplage et de la complexité)

L'un comme l'autre peut poser problème. C'est pourquoi il existe depuis PHP 5.4 la notion de [traits](http://php.net/manual/fr/language.oop5.traits.php).

## Encore un type de classe ?

Oui et non. Un trait est une structure qui rassemble les avantages d'une classe et d'une interface:

+ comme une classe, un trait peut avoir des méthode définies (et pas seulement déclarées)
+ comme une classe, un trait peut avoir des propriétés (contrairement aux interfaces)
+ comme une interface, on peut utiliser plusieurs traits dans une même classe
+ comme une interface, un trait ne peut être instancé

Un trait caractérise en quelque sorte un hértiage __horizontal__, indépendant de la hiérachie des types. Pour utiliser un trait, il n'est pas nécéssaire que celui-ci partage une nature commune avec la classe qui l'utilise. On peut le voir en fait comme un "morceau" de classe fournissant des fonctionnalités indépendantes de tout typage.

Pour ceux qui travaillent avec JS ou Ruby, on retrouve avec les traits la notion de _mixin_, c'est à dire de la fabrication de classes en "mélangeant" des objets. Par ailleurs, les traits existent aussi en Scala et bientôt en SmallTalk.

## A quoi ça ressemble ?

Prennons un exemple utile: l'EventEmitter. Il s'agit de permettre à un objet d'émettre des évènements, par exemple lors d'un changement de son état, qui seront capturés par les écouteurs. Avant les traits on devait disposer une classe dédiée et passer ses instances aux classes susceptibles d'émettre des évènements, maintenant on peut tout simplement créer un jeu de méthodes qui feront exactement la même chose:

{% highlight php linenos %}
<?php

trait EventEmitter
{
	protected $listeners;

	public function on($event, Closure $listner)
	{
		$this->listeners[$event][] = $listener->bindTo($this);
	}

	public function emit($event, array $data = [])
	{
		if (!isset($this->listeners[$event]))
			return;

		foreach ($this->listeners[$event] as $listener)
			$listener($data);
	}
}

?>
{% endhighlight %}

Pour utiliser un trait au sein d'une classe, on utilise le mot clé `use`:

{% highlight php linenos %}
<?php

class Personne
{
	use EventEmitter;

	public function __construct($name)
	{
		$this->name = $name;
	}

	public function naitre($date)
	{
		$this->emit('naissance', [$date]);
	}

	public function mourrir($date)
	{
		$this->emit('mort', [$date]);
	}
}

$p = new Personne("Denis Ritchie");
$p->on("naissance", function($data) {
	echo "{$this->name} est néé le {$data[0]}";
});
$p->on("mort", function($data) {
	echo "{$this->name} est mort le {$data[0]}";
});

$p->naitre('9 Septembre 1941');
$p->mourrir('12 Octobre 2011');

?>
{% endhighlight %}

## Et qu'est-ce qu'on peut mettre dans un trait ?

Presque tout ce qu'on peut mettre dans une classe en réalité: des membres statiques, protégés, ou abstrait. On peut même utiliser des traits dans les traits

{% highlight php linenos %}
<?php

trait Foo
{
	// un autre trait
	use Bar;

	// une propriété protégée
	protected $a;

	// une propriété statique
	public static $b = 2;

	// une méthode abstraite
	abstract public function c();

	// une méthode statique, protégée et abstraite
	abstract protected static function e();

	// etc.
}

?>
{% endhighlight %}

La classe qui utilise le trait peut à son tour changer le nom et la visibilité des méthodes du trait. Pour cela, on utilise la syntaxe suivante:

{% highlight php linenos %}
<?php

class Foo
{
	// un seul trait utilisé
	use Bar {
		uneMethodePublique as protected unAutreNomDeMethode;
	}
}

class Baz
{
	// plusieurs traits utilisés
	use A, B {
		A::hello as traitHello;
		B::world as traitWorld;
	}
}

?>
{% endhighlight %}

En revanche, on ne peut pas changer le nom des propriétés. Avoir la même propriété dans la classe et dans le trait résulte soit d'une erreur stricte (E\_STRICT) si les propriétés sont compatibles, soit d'une erreur fatale (E\_FATAL\_ERROR).

{% highlight php linenos %}
<?php

trait Foo
{
	public $a = true;
	public $b = false;
}

class Bar
{
	use Foo;
	public $a = true; // E_STRICT
	public $b = true; // E_FATAL_ERROR !
}

?>
{% endhighlight %}

## Priorisation

Les traits surchargent les méthodes de la classe parente mais les méthodes du trait sont surchargées par les méthodes déjà définies dans la classe. En fait c'est comme si le trait était "entre" la classe parente et la classe au niveau de la hiérarchie d'héritage.

{% highlight php linenos %}
<?php

class A
{
	public function foo() { echo 1; }
}

trait B
{
	public function foo() { echo 2; }
}

class C extends A
{
	use B;
}

$c = new C;
$c->foo(); // affiche 2 car A::foo est écrasée par B::foo

class D extends A
{
	use B;

	public function foo() { echo 3; }
}

$d = new D;
$d->foo(); // affiche 3 car D::foo écrase B::foo (qui écrase A::foo)

?>
{% endhighlight %}

## Collisions

Quand une classe utilise plusieurs traits, des colisions de noms de méthodes peuvent se produire. Pour résoudre le problème, PHP 5.4 introduit un nouvel opérateur: `insteadof` pour signifier "utilise celle-ci plutôt que celle-là". Changer manuellement le nom d'une méthode reste cependant possible. Il est important de noter que si le conflit n'est pas explicitement résolu, une erreur fatale (E\_FATAL\_ERROR) est émise.

{% highlight php linenos %}
<?php

trait Foo
{
	public function hello() { echo "Hello"; }
}

trait Bar
{
	public function hello() { echo "World"; }
}

class FooBar
{
	use Foo, Bar {
		Foo::hello insteadof Bar; // utiliser la méthode de Foo plutôt que celle de Bar
		Bar::hello as world;      // changer le nom de la méthode de Bar
	}

	// la classe dispose des méthode hello() et world()
}

?>
{% endhighlight %}

## Conclusion

En résumé les traits sont utiles pour:

+ rassembler des comportements sans devoir créer des classes fourre-tout
+ partager des comportements entre des classes qui n'ont aucun lien entre-elles
+ fournir des bases d'implémentation concrètes pour des interfaces
+ limiter le trop grand sous typage des classes
+ limiter le nombre d'instances à créer par rapport à des compositions

Selon moi, le trait n'est pas une alternative à l'injection de dépendance mais un complément. L'injection de dépendance, parce qu'elle suppose que les fonctionnalités soient isolées dans des composants séparés, encourage la création de petits composants sans réelle valeur ajoutée à encapsuler. Les traits permettent de réduire le nombre de ces composants (et donc le nombre de classes) sans pour autant sacrifier à l'encapsulation ni à la séparation des responsabilités. L'exemple de l'EventEmitter décrit plus haut en est une parfaite illustration.

Coté performances, je n'ai pas encore pensé à regarder l'impact de l'utilisation d'un trait, je ne pense pas qu'il soit très important mais si quelqu'un dispose des chiffres n'hésitez pas à les partager dans les commentaires.