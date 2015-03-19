---
layout: post
type: article
title: SOLID par l'exemple
date: 2015-03-20
category: article
tags: []
description: Découvrez le principe SOLID avec des exemples concrêts en PHP
spritzable: no
image: /images/articles/captain-shield.jpg
related:
- title: Quand le code devient toxique
  url: quand-le-code-devient-toxique
- title: Injection de dépendances et composants
  url: injection-de-dependances-et-composants-en-php
- title: La POO en PHP en 10 minutes (ou moins)
  url: la-poo-en-php-en-10-minutes-ou-moins
---

En conception orientée-objet, on fait souvent face à une problématique réccurente: comment construire un code à la fois robuste, simple et maintenable ? Avant de parler des principes __SOLID__, penchons nous sur ce qui rends le code __cauchemardesque__ pour les développeurs: le code STUPID

+ <abbr title="Ou tout ce qui est global en général"><kbd>__S__</kbd> ingleton</abbr>
+ <abbr title="Couplate fort"><kbd>__T__</kbd> ight-coupling</abbr>
+ <abbr title="Impossible a tester"><kbd>__U__</kbd> ntestability</abbr>
+ <abbr title="Optimisation prématurée"><kbd>__P__</kbd> remature optimization</abbr>
+ <abbr title="Nommage incohérent"><kbd>__I__</kbd> nconsistence naming</abbr>
+ <abbr title="Code duppliqué"><kbd>__D__</kbd> upplication</abbr>

Je parie mon chapeau que vous avez été (ou êtes encore) en contact avec du code présentant ce genre de problèmes. Un code STUPID (en général l'héritage de vos prédécesseurs) engendre <abbr title="Les changements se font en cascade">rigidité</abbr>, <abbr title="Des régressions apparaissent facilement">fragilité</abbr>, <abbr title="Il est impossible de réutiliser du code">immobilisme</abbr>, <abbr title="Il est plus facile de contourner les problèmes que de les résoudre correctement">viscosité</abbr> et <abbr title="Le code est illisible, voire incompréhensible">opacité</abbr>. En somme, le code devient intolérant aux changements et, comme je l'expliquais dans l'article [Quand le code devient toxique](/article/quand-le-code-devient-toxique), il devient urgent d'y remédier.

## J'ai besoin d'un code plus __SOLID__

__SOLID__ est un acronyme mnémonique amusant qui rassemble les 5 principes de bases de la conception orientée-objet:

+ <abbr title="Une seule responsabilité"><kbd>__S__</kbd> ingle responsibility</abbr>
+ <abbr title="Ouvert / Fermé"><kbd>__O__</kbd> pen-closed</abbr>
+ <abbr title="Principe de substitution de Liskov"><kbd>__L__</kbd> iskov Substitution</abbr>
+ <abbr title="Ségrégation des interfaces"><kbd>__I__</kbd> nterface segregation</abbr>
+ <abbr title="Inversion de dépendances"><kbd>__D__</kbd> ependency inversion</abbr>

Voyons quelques exemples simples pour comprendre en quoi l'application de ces principes peuvent vous aider.

Remarque: les exemples ci-dessous sont purement fictifs et donnés uniquement à titre indicatif.

## Principe de seule responsabilité (SRP)

__Définition__:

>  Une classe devrait avoir une et une seule raison de changer

Le principe est simple: pas plus d'une responsabilité par classe. Changer une responsabilité d'une classe en ayant plusieurs c'est prendre le risque que le changement impacte également les autres.

__Démonstration__:

{% highlight php linenos %}
<?php

class User
{
    public function login($user, $password)
    {
        // si la session n'existe pas encore, il faut l'initialiser
        if (!session_id())
            session_start();

        // rechercher dans la table user un utilisateur avec ce couple login / mot de passe
        $sth = $this->pdo->query("SELECT * FROM users WHERE username='$user' AND password='$password'");

        // si il y a des résultats
        if ($sth->rowCount()) {
            // populer (hydrater) l'objet courant
            $this->data = $sth->fetch(PDO::FETCH_ASSOC);

            // enregistrer l'utilisateur courant sur la session
            $_SESSION['logged'] = true;
            $_SESSION['user'] = $this;

            return true;
        } else {
            return false;
        }
    }
}

?>
{% endhighlight %}

La méthode `User::login` à deux casquettes: elle se charge de trouver les données de l'utilisateur __et__ s'occuper de gêrer la session. Ce qui pose plusieurs problèmes:

* si on change la structure de la table `users`, alors tous les scripts qui dépendent du contenu de $_SESSION['user'] sont potentiellement invalides
* si on décide de changer la méthode d'authentification, alors il faut également changer la classe `User` et potentiellement la requête de sélection (pour effectuer une jointure par exemple)
* on ne peut pas écrire simplement les tests unitaires de cette méthode car elle utilise la superglobale $_SESSION
* si on authentifie l'utilisateur alors qu'un contenu est déjà envoyé, une erreur peut se produire car on démarre implicitement la session, ce qui déclenche l'envoi des en-têtes, ce qui n'est pas forcément explicite
* le code client n'a plus de contrôle sur la manière de gêrer la session

Une solution préférable est donc de séparer ces deux responsabilités:

{% highlight php linenos %}
<?php

class User
{
    public function getUserFromLoginPassword($user, $password)
    {
        // rechercher dans la table user un utilisateur avec ce couple login / mot de passe
        $sth = $this->pdo->query("SELECT * FROM users WHERE username='$user' AND password='$password'");

        if ($sth->rowCount()) {
            $this->data = $sth->fetch(PDO::FETCH_ASSOC);
            return $this;
        } else {
            return null;
        }
    }
}

class CookiesAuth
{
    public function authenticate($user, $password)
    {       
        $user = new User;

        // rechercher l'utilisateur correspondant
        if ($user->getUserFromLoginPassword($user, $password)) {
            // si la session n'existe pas encore, il faut l'initialiser
            if (!session_id())
                session_start();

            // enregistrer l'utilisateur courant sur la session
            $_SESSION['logged'] = true;
            $_SESSION['user'] = $user;

            return true;
        } else {
            return false;
        }
    }
}

?>
{% endhighlight %}

On dirait pourtant que ça ne change pas grand-chose au final. On a juste _déplacé_ du code d'un point A à un point B. Pourtant il y a une différence fondamentale entre ces deux codes: tant que la méthode `User::getUserFromLoginPassword` conservera son prototype (i.e. son nom et ses arguments), la classe `CookiesAuth` pourra fonctionner en parfaite autonomie et on n'aura pas à changer la classe `User` si on doit changer la méthode de login. De plus, il devient désormais possible de tester exhaustivement la classe `User`.

L'inconvénient principal de ce principe est que s'il est mal utilisé, il peut conduire à la création d'une myriade de petites classes sans réelle valeur ajoutée. Il serait absurde, au nom de la séparation des responsabilités, de se mettre à découper les classes en petits confettis imbriqués les uns dans les autres dans une splendide orgie. Il faut donc savoir faire preuve de bon sens et de reflexion pour trouver quels rôles affecter à quelles classes. Pour cela, on peut s'aider des [CRC cards](http://en.wikipedia.org/wiki/Class-responsibility-collaboration_card) dont je vous parlerais dans un autre article.

## Principe ouvert / fermé (OCP)

__Définition__:

> Les classes doivent être ouvertes aux extensions mais fermées aux modifications

En somme, on doit pouvoir changer un comportement sans devoir modifier à la main la définition des méthodes d'une classe. Il s'agit en réalité de l'application directe du principe de polymorphisme.

__Démonstration__:

{% highlight php linenos %}
<?php

class Car
{
    public function __construct($engineType)
    {
        switch ($engineType) {
            case 'fuel':
                $this->engine = new FuelEngine;
                break;

            case 'diesel':
                $this->engine = new DieselEngine;
                break;

            case 'electric':
                $this->engine = new ElectricEngine;
                break;
        }
    }
}

?>
{% endhighlight %}

Ma voiture roule au GPL. Mais ce cas n'est visiblement pas géré par le constructeur de `Car`. Dans l'exemple ci-dessus, mes seules alternatives sont:

* ajouter à la main `case 'gpl'` dans le swich
* étendre `Car` en `GplCar` en surchargeant son constructeur

Il eut été préférable de pouvoir passer directement un objet moteur (engine) au constructeur afin qu'on soit libre de choisir quel moteur on veut pour la voiture:

{% highlight php linenos %}
<?php

class Car
{
    public function __construct(Engine $engine)
    {
        $this->engine = $engine;
    }
}

?>
{% endhighlight %}

Ou de passer par une factory (fabrique):

{% highlight php linenos %}
<?php

class Car
{
    public function __construct($engineType)
    {
        $this->engine = EngineFactory::getEngine($engineType);
    }
}

?>
{% endhighlight %}

Pour la petite histoire, la première solution se prête mieux au jeu de l'Injection de Dépendances qui est un pattern plutôt en vogue dans le petit monde de PHP. La seconde solution impliquant un couplage entre `Car` et `EngineFactory`, je vous laisse juge, on ne discute pas l'égout.

Dans la continuité de ce principe, on évitera de déclarer les membres cachés de la classe en `private` et on leur préfèrera la visibilité `protected` (à moins d'avoir une bonne raison) ceci afin de permettre de toujours pouvoir les surcharger en cas de besoin.

## Principe de substitution de Liskov (LSP)

__Définition__:

> Les classes doivent pouvoir être remplacées par leurs filles sans altérer le comportement de ses utilisateurs

Il s'agit ni-plus ni-moins que d'imposer le respect des prototypes d'une classe au niveau de ses filles. Une classe dérivée doit toujour se comporter comme sa mère afin que son utilisation soit rigoureusement identique: on doit pouvoir les _substituer_. Il faut également éviter de lever des exceptions imprévues ou modifier l'état de l'objet de manière inadaptée par rapport au comportement de la mère.

__Démonstration__:

{% highlight php linenos %}
<?php

class Rectangle
{
    public function setDimentions($width, $width)
    {
        if ($with <= 0 || $height <= 0)
            throw new InvalidArgumentException("with or height cannot be null or negative");

        $this->width  = $width;
        $this->height = $height;
    }
}

class Square extends Rectangle
{
    public function setDimentions($width, $height)
    {
        if (!$width == $height)
            throw new UnexpectedValueException("with should be equal to height");

        parent::setDimentions($width, $height);
    }
}

?>
{% endhighlight %}

Ces deux classes ont pourtant l'air parfaitement valides: un carré est bien un type particulier de rectangle. Hors il y a une contrainte sur les dimentions du carré: hauteur = largeur ! Dès lors, on est tenté de surcharger `setDimentions` afin de refléter cette contrainte mais quid de la fonction suviante:

{% highlight php linenos %}
<?php

function set_size(Rectangle $r, $w, $h)
{
    try {
        $r->setDimentions($w, $h);
    } catch (InvalidArgumentException $e) {
        return false;
    }
    
    return $r;
}

set_size(new Square, 10, 20);

?>
{% endhighlight %}

`reset_size` devrait-elle se spécialiser en fonction du type précis de `Rectangle` pour essayer d'attraper l'exception levée par `Square::setDimentions` ? Le principe de Liskov impose de respecter le _contrat_ défini par la classe mère (voire par l'interface si il y en a une), y compris au niveau de ses exceptions:

{% highlight php linenos %}
<?php

class Square
{
    public function setDimentions($width, $height)
    {
        if ($width != $height)
            $width = max($with, $height);

        parent::setDimentions($width, $width);
    }
}

?>
{% endhighlight %}

Ce n'est bien sûr pas la seule option, encore une fois je vous laisse seul juge. On aurait tout aussi pu implémenter une méthode `validateDimentions` que `set_size` aurait pu utiliser pour valider en amont la largeur et la hauteur.

Ce qui vaut pour les exceptions de `Rectangle` vaut également pour les valeurs de retour ansi que l'ordre, le type et le nombre des arguments. Le respect du principe de substitution de Liskov garantis que les changements dans les implémentation concrêtes des interfaces n'impacteront pas le bon déroulement du code client. C'est un gage de robustesse.

__Attention__: en PHP il est extrêmement facile de violer ce principe car les retours des méthodes __ne sont pas typés__ ! On ne peut donc (théoriquement) jamais garantir que ce que renvoie une méthode respecte le contrat prévu par l'interface. Immaginons qu'une méthode `incrementCounter` telle que déclarée sur l'interface soit supposée renvoyer un compteur après l'avoir incrémenté; le code client s'attendra à recevoir un entier mais pas de chance: l'implémentation réalisée renvoie `null`, ce qui peut exposer le premier à des erreurs inattendues voire des plantages !

## Principe de ségrégation des interfaces (ISP)

## Principe d'inversion de dépendances (DIP)

## Don't be a fool (DBFP)

## TL;DR