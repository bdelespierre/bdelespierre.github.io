---
layout: post
type: article
title: SOLID par l'exemple
date: 2015-03-20
category: article
tags: []
description: Comprendre les principes SOLID avec des exemples concrêts en PHP
spritzable: no
tldr: yes
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

+ <abbr title="Ou tout ce qui est global en général">__S__ingleton</abbr>
+ <abbr title="Couplate fort">__T__ight-coupling</abbr>
+ <abbr title="Impossible a tester">__U__ntestability</abbr>
+ <abbr title="Optimisation prématurée">__P__remature optimization</abbr>
+ <abbr title="Nommage incohérent">__I__nconsistence naming</abbr>
+ <abbr title="Code duppliqué">__D__upplication</abbr>

Je parie mon chapeau que vous avez été (ou êtes encore) en contact avec du code présentant ce genre de problèmes. Un code STUPID (en général l'héritage de vos prédécesseurs) engendre <abbr title="Les changements se font en cascade">rigidité</abbr>, <abbr title="Des régressions apparaissent facilement">fragilité</abbr>, <abbr title="Il est impossible de réutiliser du code">immobilisme</abbr>, <abbr title="Il est plus facile de contourner les problèmes que de les résoudre correctement">viscosité</abbr> et <abbr title="Le code est illisible, voire incompréhensible">opacité</abbr>. En somme, le code devient intolérant aux changements et, comme je l'expliquais dans l'article [Quand le code devient toxique](/article/quand-le-code-devient-toxique), il devient urgent d'y remédier.

> __boss__: Je t'ai demandé de passer le taux de TVA à 20% la semaine dernière, t'en es où ?

> __dev__: Bah là je suis en train de revoir la gestion des utilisateurs

> __boss__: Comment ça ?

> __dev__: En fait la TVA est utilisée par la gestion-produits, qui est utilisée par la facturation, qui dépend de l'utilisateur, dont le profil indique le montant de TVA en fonction du pays qui se trouve en base et qu'on peut accéder qu'avec une jointure sur la table account_rights sinon ça casse l'authentification ce qui ne se produit qu'avec les comptes...

> __boss__: Ok. Ok. Tu peux finir pour ce soir ? On doit livrer demain !

> __dev__: ...

## J'ai besoin d'un code plus __SOLID__

__SOLID__ est un acronyme mnémonique amusant qui rassemble les 5 principes de bases de la conception orientée-objet:

+ <abbr title="Une seule responsabilité">__S__ingle responsibility</abbr>
+ <abbr title="Ouvert / Fermé">__O__pen-closed</abbr>
+ <abbr title="Principe de substitution de Liskov">__L__iskov Substitution</abbr>
+ <abbr title="Ségrégation des interfaces">__I__nterface segregation</abbr>
+ <abbr title="Inversion de dépendances">__D__ependency inversion</abbr>

Voyons quelques exemples simples pour comprendre en quoi l'application de ces principes peut nous aider.

__Remarque__: les exemples ci-dessous sont purement fictifs et donnés uniquement à titre indicatif.

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

La méthode `User::login` à deux casquettes: elle se charge de trouver les données de l'utilisateur __et__ de gêrer la session. Ce qui pose plusieurs problèmes:

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

En somme, on doit pouvoir changer un comportement sans devoir modifier à la main la définition des méthodes d'une classe. Il s'agit en réalité de l'application correcte du polymorphisme.

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
            throw new UnexpectedValueException("width should be equal to height");

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

`set_size` devrait-elle se spécialiser en fonction du type précis de `Rectangle` pour essayer d'attraper l'exception levée par `Square::setDimentions` ? Le principe de Liskov impose de respecter le _contrat_ défini par la classe mère (voire par l'interface si il y en a une), y compris au niveau de ses exceptions:

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

Ce qui vaut pour les exceptions vaut également pour les valeurs de retour ansi que l'ordre, le type et le nombre des arguments des méthodes. Le respect du principe de substitution de Liskov garantis que les changements dans les implémentation concrêtes des interfaces n'impacteront pas le bon déroulement du code client. C'est un gage de robustesse.

__Attention__: en PHP il est extrêmement facile de violer ce principe car les retours des méthodes __ne sont pas typés__ ! On ne peut donc (théoriquement) jamais garantir que ce que renvoie une méthode respecte le contrat prévu par l'interface. Immaginons qu'une méthode `incrementCounter` telle que déclarée sur l'interface soit supposée renvoyer un compteur après l'avoir incrémenté; le code client s'attendra à recevoir un entier mais pas de chance: l'implémentation réalisée renvoie `null`, ce qui peut exposer le premier à des erreurs inattendues voire des plantages !

## Principe de ségrégation des interfaces (ISP)

__Définition__:

> Plusieurs interfaces spécialisées valent mieux qu'une interface fourre-tout

Les client ne devraient pas dépendre de méthodes qu'ils n'utilisent pas. On pourrait presque y voir une forme d'héritage fonctionnel: une interface ne devrait pas déclarer plus d'un ensemble _cohérent_ de méthodes. On parle aussi _d'interfaces de rôles_.

__Démonstration__:

{% highlight php linenos %}
<?php

interface UserInterface
{
    public function login($user, $password);

    public function logout();

    public function isConnected();

    public function isAdmin();

    public function getRights();
}

class User implements UserInterface
{

}

?>
{% endhighlight %}

Ici l'interface `UserInterface` présente deux rôles: la gestion du login ainsi que la gestion des droits. Il eut été préférable de séparer ces deux rôles dans deux interfaces séparées, quitte à les réunir par la suite dans l'implémentation concrête de la classe `User`:

{% highlight php linenos %}
<?php

interface LoginInterface
{
    public function login($user, $password);

    public function logout();

    public function isConnected();
}

interface PermissionInterface
{
    public function isAdmin();

    public function getRights();
}

class User implements LogginInterface, PermissionInterface
{

}

?>
{% endhighlight %}

Cette aproche est beaucoup plus souple car désormais les classes clientes pourront utiliser les instances de `LoginInterface` et `PermissionInterface` suivant leur besoin sans se retrouver obligé de supporter d'autres méthodes que celles décrites par le rôle qu'elles veulent utiliser. Par exemple, un composant qui ne s'occupe que de vérifier qu'un utilisateur dispose bien des droits d'accès à une ressource se fiche pas mal des méthodes de `LoginInterface`.

Il faut cependant faire attention à ne pas trop segmenter les rôles et se retrouver ainsi avec une multitude d'interfaces. Ici encore, il faut faire preuve de bon sens.

## Principe d'inversion de dépendances (DIP)

__Définition__:

> Les modules haut-niveau ne devraient pas dépendre des modules bas-niveau, les deux devraient dépendre d'abstractions

> Les abstractions ne devraient pas dépendre des détails, les détails devraient dépendre des abstractions

Traduction: il faut autant que possible éviter le couplage de types concrêts et lui préférer un couplage de types abstraits. Les abstraction pouvant être implémentés de différentes façon sans remettre en question la hiérarchie des types abstraits, les changements dans les modules _bas-niveau_ n'impactenteront pas les modules _haut-niveau_ (généralement le business.) Tant que le principe de substitution de Liskov est repecté, les modules _haut-niveau_ sont à priori garantis de ne pas changer quand l'implémentation des modules _bas-niveau_ est modifiée.

__Démonstration__:

{% highlight php linenos %}
<?php

class EBookReader
{
    private $book;

    function __construct(PDFBook $book)
    {
        $this->book = $book;
    }

    function read()
    {
        return $this->book->read();
    }
}

class PDFBook
{
    function read()
    {
        echo "reading a pdf book.";
    }
}

?>
{% endhighlight %}

Imaginons un instant que le scénario suivant: vous travaillez pour un éditeur de livres en ligne dont le choix initial était de proposer des livres au format PDF. Vous avez alors créé la classe `PDFBook` pour représenter les entrées de la table `pdf_books` ainsi que la liseuse `EBookReader` et tout fonctionne bien.

Jusqu'au jour où un commercial vient vous voir avec une idée révolutionnaire ! On va se plugger sur l'API d'un partenaire pour proposer la lecture de ses bouquins au travers de notre interface afin d'augmenter pour l'utilisateur la taille de la bibliothèque. Chouette ! A ceci près que l'API vous envoie des fichiers au format ePub, illisibles par votre liseuse. Vous êtes donc obligé de mettre à jour EBookReader en ajoutant la gestion du nouveau format:

{% highlight php linenos %}
<?php

class EBookReader
{
    private $book;

    function __construct($book)
    {
        if (!$book instanceof EPubBook && !$book instanceof PDFBook)
            throw new InvalidArgumentException("invalid book");

        $this->book = $book;
    }

    function read()
    {
        return $this->book->read();
    }
}

class EPubBook
{
    function read()
    {
        echo "reading a epub book.";
    }
}

?>
{% endhighlight %}

Puis vient le jour où on décide d'ajouter le format Docx, puis le format Kindle, puis le format TXT etc. En regardant en arrière, il aurait mieux valu que la liseuse accepte un type abstrat d'EBook plutôt qu'un type concrêt:

{% highlight php linenos %}
<?php

interface EBook
{
    public function read();
}

class EBookReader(EBook $book)
{
    private $book;

    function __construct($book)
    {
        if (!$book instanceof EPubBook && !$book instanceof PDFBook)
            throw new InvalidArgumentException("invalid book");

        $this->book = $book;
    }

    function read()
    {
        return $this->book->read();
    }
}

?>
{% endhighlight %}

Désormais, vous pouvez créer autant de types d'EBook que vous voulez sans devoir toucher à la classe EBookReader à chaque fois.

Le principe d'inversion de dépendance vous oblige donc à respecter le principe ouvert / fermé en permettant de fournir des types abstraits. Tant que tout le monde respecte le contrat prévu par l'interface, les détails d'implémentation n'impactent pas la validité du code client, ce qui augment considérablement la réutilisabilité du code !

## <abbr title="Ne soyez pas idiot">Don't be a fool principle</abbr> (DBFP)

Il vous est peut être apparu que tous ces principes se renforcent mutuellement dans une démarche vertueuse dont l'aboutissement est de produire un code très perméable aux changements. Mais est-ce vraiment __la__ chose à faire dans tous les cas ? Pas forcément. Ces principes sont à la conception objet ce que les [formes normales](http://fr.wikipedia.org/wiki/Forme_normale_%28bases_de_donn%C3%A9es_relationnelles%29) sont à la modélisation des bases de données: il faut savoir faire des exceptions. Il faut les comprendre, les assimiler, mais pas les appliquer à la lettre en dépit de tout bon sens.

Soyons honnête, le respect _stricto sensu_ de ces principes à pour conséquence néfaste de produire un code plus complexe et plus éparpillé et, in fine, plus difficile à apréhender dans son ensemble qu'un code qui se cantone à la description de la logique métier telle qu'exprimée dans le cahier des charges.

On a vite fait de se retrouver avec des interfaces qui ne sont utilisées que par une seule classe, des adaptateurs pour un seul type concrêt, des factories qui renvoient toujours la même chose etc. Il faut donc faire preuve de __bon sens__ pour déterminer ce qui doit être __SOLID__ et ce qu'on peut se permettre de laisser en jachère; le mieux est l'ennemi du bien.

En résumé, ces principes sont, vous l'avez compris, fondamentaux pour l'écriture d'un code propre __mais__ en aucun cas ils ne se substituent aux principes <abbr title="Keep It Simple, Stupid">__KISS__</abbr> et <abbr title="You Ain't Gonna Need It">__YAGNI__</abbr>. Rappellez-vous que la complexité architecturable d'un projet doit être le reflet de sa complexité métier; ne vous compliquez pas la vie inutilement et faites preuve de discernement avec les principes __SOLID__.

> __boss__: t'en es où avec la page de listing des ventes ? ça fait 2 semaines qu'on l'attend...

> __dev__: j'avance, là j'écris la classe _AbstractEntityControllerFactory_ qui est utilisée au niveau du _HTTPKernel_ et utilise _HTTPRequest_ qui sert à abstraire le contexte des requêtes afin de fournir une validation en amont en utilisant un _EventDispatcher_ couplé avec un _DataValidator_, tout ça derrière l'_AuthManager_ bien entendu.

> __boss__: ...

> __boss__: d'accord, mais c'était juste un script pour Sophie de la compta pour qu'elle voit les ID des ventes quand elle fait les factures...

## <b id="tldr">TL;DR</b>

__SOLID__ = __S__RP + __O__CP + __L__SP + __I__SP__ + __D__IP + [bon sens](http://fr.wiktionary.org/wiki/bon_sens)

<dl>
    <dt><abbr title="Single Reponsibility Principle">SRP</abbr></dt>
    <dd>Principe de seule responsabilité: une classe devrait avoir une et une seule raison de changer</dd>
    <dt><abbr title="Open-Closed Principle">OCP</abbr></dt>
    <dd>Principe ouvert-fermé: Les classes doivent être ouvertes aux extensions mais fermées aux modifications</dd>
    <dt><abbr title="Liskov Substitution Principle">LSP</abbr></dt>
    <dd>Principe de substitution de Liskov: les classes doivent pouvoir être remplacées par leurs filles sans altérer le comportement de ses utilisateurs</dd>
    <dt><abbr title="Interface Segregation Principle">ISP</abbr></dt>
    <dd>Plusieurs interfaces spécifiques aux clients valent mieux qu'une interface fourre-tout</dd>
    <dt><abbr title="Dependency Inversion Principle">DIP</abbr></dt>
    <dd>Les modules haut-niveau ne devraient pas dépendre des modules bas-niveau, les deux devraient dépendre d'abstractions</dd>
    <dd>Les abstractions ne devraient pas dépendre des détails, les détails devraient dépendre des abstractions</dd>
</dl>
