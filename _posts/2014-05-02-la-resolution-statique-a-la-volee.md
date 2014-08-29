---
layout: post
type: article
title: La résolution statique à la volée
date: 2014-05-02
category: article
tags: [php, poo, late static binding, resolution statique à la volée, php5, orienté objet, statique, objet, class, méthode, héritage, abstraction]
description: Comprendre le fonctionnement de la résolution statique à la volée en PHP
related:
- title: La POO en PHP en 10 minutes (ou moins)
  url: la-poo-en-php-en-10-minutes-ou-moins
- title: Injections de dépendances et composants en PHP
  url: injection-de-dependances-et-composants-en-php
- title: De l'usage correct des closures en PHP
  url: de-lusage-correct-des-closures
---

Si vous vous souvennez de mon article [La poo en PHP en 10 minutes (ou moins)](http://bdelespierre.fr/article/la-poo-en-php-en-10-minutes-ou-moins/), vous vous rappellerez sans doute que je n'ai pas souhaité parler des spécificités de PHP en matière de programmation orientée objet. C'est justement le sujet qui nous intéresse aujourd'hui; nous allons nous pencher sur une fonctionnalité relativement complexe mais puissante qu'est la _résolution statique à la volée_ ou en anglais _late static binding_ (LSB). Cette fonctionnalité fait partie des évolutions de la version 5.3 de PHP, les version antérieures étant à ce jour dépreciées depuis longtemps vous devriez pouvoir l'utiliser sans risque sur votre environnement.

## Résolu-quoi ?

J'avoue que le nom est un peu barbare mais c'est tout à fait cohérent (*troll* ce qui est rare dans le monde PHP *endtroll*). Il désigne en fait la capacité du moteur à déterminer dans quel contexte exécuter une méthode statique, en d'autres termes effectuer la résolution du contexte d'éxécution lors du déroulement du script.

Vous vous souvennez que vous pouvez utiliser le mot-clé `$this` pour faire référence à l'instance en cours d'utilisation et à `self` pour faire référence à la classe. Le late static binding vous permet d'utiliser le mot-clé `static` en lieu et place du mot clé `self`.

## D'accord mais à quoi ça sert ?

J'y viens. Pour bien comprendre la nuance, il faut penser au cas de l'héritage de méthode statiques. Considérons deux classes A et B liées par une relation d'héritage:

{% highlight php linenos %}
<?php
class A
{
	public static $message = "Bonjour!";

	public static function hello()
	{
		echo self::$message;
	}
}

class B extends A
{
	public static $message = "Au revoir!";
}
?>
{% endhighlight %}

B hérite naturellement la méthode `hello` de A mais vous avez peut être déjà remarque que quand on exécute `B::hello()`, c'est "Bonjour!" et non "Au revoir!" qui s'affiche:

{% highlight php linenos %}
<?php
A::hello(); // affiche "Bonjour!"
B::hello(); // affiche également "Bonjour!"
?>
{% endhighlight %}

Pourquoi ? Tout simplement parce que `self` "pointe" toujours sur la classe A, peu importe que la méthode `hello` soit executée sur B ou A. Donc au sein de `hello`, la propriété statique `$message` lue est toujours celle de A et jamais celle de B. C'est justement dans ce genre de cas de figure que la résolution statique à la volée est utile.

En utilisant `static` au lieu de `self` on demande au moteur d'utiliser en tant que contexte d'éxécution de la méthode `hello` la classe avec laquelle on l'appelle et non la classe où `hello` est définie.

{% highlight php linenos %}
<?php
class A
{
	public static $message = "Bonjour!";

	public static function hello()
	{
		echo static::$message;
	}
}

class B extends A
{
	public static $message = "Au revoir!";
}

A::hello(); // affiche "Bonjour!"
B::hello(); // affiche "Au revoir!"
?>
{% endhighlight %}

En somme, utiliser `static` au lieu de `self` revient à utiliser `$this` mais pour un contexte statique.

## Et c'est utile ?

En fait oui car ça permet de reproduire l'héritage des membres d'instance au niveau des membres statiques. Il devient dès lors possible de créer des __abstractions statiques__:

{% highlight php linenos %}
<?php
abstract class Log
{
	final public static function message($message)
	{
		static::_write($message);
	}

	abstract protected static function _write($message);
}

class FileLog extends Log
{
	protected static $_file;

	protected static function _write($message)
	{
		static::$_file->write($message);
	}
}

class DatabaseLog extends Log
{
	protected static $_database;

	protected static function _write($message)
	{
		static::$_database->query("INSERT INTO `log` (`message`) VALUES ('$message');");
	}
}
?>
{% endhighlight %}

Cela permet:

* de rester flexible et ouvert au niveaux des services statiques car leur spécialisation devient possible
* de conserver l'unicicité du fournisseur de service sans avoir recours à un Singleton
* de bénéficier des performances des contextes statiques dont l'exécution est 4x plus rapide que les contextes d'instance (c'est à dire avec des objets)

Astuce: vous pouvez utiliser le mot-clé `static` pour une fabrique:

{% highlight php linenos %}
<?php
class A
{
	public function __construct($a, $b, $c)
	{
		// ...
	}

	public static function newInstance($a, $b, $c)
	{
		return new static($a, $b, $c);
	}
}

class B extends A
{
	public function sayHello()
	{
		// ...
	}
}

// ça permet notamment de faire du chainage
B::newInstance()->sayHello();
?>
{% endhighlight %}

## Ça craint rien ?

Le vrai problème avec les classes statiques, c'est qu'on retrouve un peu partout ce genre d'appel dans le code `Classe::methode(...)` ce qui introduit forcément du couplage.

En reprennant les classes FileLog et DatabaseLog ci-dessus, comment faire pour permettre à une classe d'utiliser indifférement l'une ou l'autre et ainsi éviter un couplage serré ? Une solution simple consiste à utiliser le dynamisme du langage et stocker le nom de la classe de service à utiliser, c'est une méthode proche de ce qui se pratique en Java:

{% highlight php linenos %}
<?php
class User
{
	public function __construct($logServiceClass)
	{
		if (!is_subclass_of($logServiceClass, 'Log'))
			throw new InvalidArgumentException("invalid log service class");

		$this->_logServiceClass = $logServiceClass;
	}

	public function save()
	{
		$log = $this->_logServiceClass;
		$log::message("saving user $this->id");

		// ...
	}
}
?>
{% endhighlight %}

Ou tout simplement passer l'instance de la classe statique à utiliser (car toute classe, même entièrement statique, reste instanciable - sauf évidement les classes abstraites). L'avantage de cette méthode est de pouvoir utiliser directement l'opérateur `instanceOf` et le type-hinting:

{% highlight php linenos %}
<?php
class User
{
	public function __construct(Log $logService)
	{
		$this->_log = $logService;
	}

	public function save()
	{
		$this->_log->message("saving user $this->id");

		// ...
	}
}
?>
{% endhighlight %}

Autre avantage de cette dernière méthode; vous pouvez enregistrer l'instance au sein d'un conteneur de dépendances comme Pimple.
