---
layout: post
type: article
title: Codez avec style
date: 2013-08-02
category: article
tags: programmation oop convention développement web php javascript
---

Utiliser une convention de codage est indispensable pour faciliter la (re)lecture de vos codes source. Quand on est débutant on tâtone, on a tendance parfois à oublier l'indentation ou à dépasser largement la taille de l'écran. C'est généralement en déboguant son application et en fouillant méthodiquement son code qu'un développeur se rend compte que celui-ci n'est pas optimal en terme de lisibilité et donc de compréhension. On se  surprend donc souvent à refactorer le code afin de le rendre lisible, clair.

Avec de l'expérience, chaque développeur finit par adopter un style qui lui est propre mais il n'est pas rare non plus que les conventions de codage vous soient imposées par l'entreprise dans laquelle vous travaillez. Depuis 5 ans que je travaille dans le web, j'ai fini par peaufinner ma propre convention que je partage avec vous aujourd'hui.

_Je ne prétends pas que c'est la seule et unique façon de mettre en forme ses sources_ mais vous pouvez toujours vous en inspirer. Il s'agit ici de conventions que j'emploie dans mes sources PHP, JavaScript, et même CSS. Les exemples de code ci-dessous sont donnés à titre indicatif et ont à peu près autant d'intérêt que l'étude des comportements sociaux des criquets du Gabon lors de la saison des amours. Une fois n'est pas coutume, penchons-nous sur la forme plutôt que sur le fond.

## Configuration indispensable

J'utilise __toujours__ l'UTF-8 (sans BOM) comme jeu de caractères pour mes sources, vu que la justification de cette pratique sort légérement du cadre de cet article, je vous recommande l'excellent manifeste [UTF-8 Everywhere](http://www.utf8everywhere.org/) (en anglais). Retennez simplement que pour éviter tout problème lié à l'encodage, j'utilise UTF-8 à tous les niveaux de mes applications, de la base de données aux vues.

J'utilise aussi 4x espaces au lieu des traditionnelles tabulations en début de ligne. C'est bien plus facile pour (dés)indenter des lignes ou tout simplement pour visualiser le code sur des éditeurs qui n'affichent pas les tabulations comme le mien.

## Taille maximum d'une ligne d'affichage

Dans tous les IDE et éditeurs que j'utilise, je paramètre __systématiquement__ la marge d'impression (_print margin_ en anglais) afin d'avoir un repère de 120 caractères que je ne dépasse __jamais__. Pourquoi 120 caractères ? Tout simplement parce que ça correspond sur presque tous les éditeurs à une ligne pleine sur un écran de 1024 pixels de largeur. Sur les écrans plus grands, ça laisse assez de place pour les autres vues de votre IDE ou éditeur comme la liste des fichiers du projet par exemple.

L'objectif est de ne jamais dépasser cette limite de 120 caractères au delà de laquelle il faut utiliser un asencseur horizontal pour visualiser l'intégralité d'une ligne: c'est le meilleur moyen de rater du code ou des variables qui se trouvent en fin de ligne. Il s'agit en somme d'une règle qui permet de toujours lire le code verticalement.

## Les blocs de code

Autant que possible, j'essaie de ne pas utiliser les accolades. Par exemple, si un bloc `if` ou `foreach` ne contiens qu'une seule instruction je ne mets pas d'accolage (même s'ils sont imbriqués).

{% highlight php linenos %}
<?php

if (isset($_GET['a']))
    $a = $_GET['a'];

if ($a)
    foreach ($b as $c)
        echo $c;
{% endhighlight %}

Pour ceux qui se poseraient la question: oui, c'est parfaitement valide en PHP. C'est une syntaxe assez proche de Python qui à le mérite d'aller droit à l'essentiel sans rajouter de caractères ou de sauts de lignes inutiles.

Quand les blocs de code sont plus conséquents (ou simplement obligatoires comme pour les fonctions et les classes), j'utilise les _accolades égyptiennes_. Ce nom s'explique simplement avec ce hiéroglyphe:

<center><img src="http://www.codinghorror.com/.a/6a0120a85dcdae970b016768a17a2a970b-800wi" alt="break dance chez Osiris ce soir !"><br>(merci à [Coding Horror](http://www.codinghorror.com/blog/2012/07/new-programming-jargon.html))</center>

{% highlight php linenos %}
<?php

if ($a) {
    foreach ($b as $c) {
        $a += $c;

        echo $a;
    }
}
else {
    echo "null (ou false, allez savoir!)";
}

function foo ($bar) {
    echo $bar;
}

foo("hello!");
{% endhighlight %}

J'utilise cette convention car le caractère fermant du bloc se retrouve au même niveau que la structure de contrôle elle-même. Il est donc plus facile lors de la lecture de retrouver la structure de contrôle depuis la fin de bloc, surtout quand les blocs ont tendance à jouer aux poupées russes.

En fait, j'ai tendance à considérer le parcours de mon regard sur mes sources comme un curseur qui se déplacerait verticalement en partant du début de la ligne. Il est donc important que les informations essentielles soient sur les premier caractères (après les espaces d'indentation) de la ligne.

## Aération

J'utilise la règle suivante pour espacer les lignes et aérer le code: devant toute structure de contrôle j'ajoute une nouvelle ligne sauf si elle est directement précédée d'une autre strucrure de contrôle. Dans la mesure du possible, au sein d'un bloc, je regroupe les instructions qui partagent une nature commune (comme les affectations de variables ou des appels sucessifs de fonction).

{% highlight php linenos %}
<?php

$a = 0;
$b = [1,2,3];

if ($a === 0) {
    foreach ($b as $c) {
        echo $c;
        $a += $c;
    }

    while ($d = array_shift($b)) {
        $a -= $d / 2;
    }
}

if ($a >= max($b))
    echo "A est supérieur à 3";
else
    echo "A est inférieur à 3";
{% endhighlight %}


Cela permet de garder des structures de blocs bien groupées.

Je suis également un aficionado de l'opérateur ternaire (et d'une manière générale tout ce qui peut réduire le nombre de lignes de code). Comme l'usage de cet opérateur à tendance à produire des lignes un peu longues, je l'aère en ajoutant des sauts de lignes. J'adore tout particulièrement sa forme contractée `?:` qui se comporte comme l'opérateur `||` de JavaScript.

{% highlight php linenos %}
<?php

$foo = isset($_GET['foo'])
    ? $_GET['foo']
    : "valeur par défaut";

$bar = $foo ?: "une autre valeur";
{% endhighlight %}

## Nommage

Je n'ai jamais été un grand fan des conventions de nommage strictes vis-à-vis des types de données. Je comprends leur justification avec des langages comme C/C++ etc. Mais dans le monde du Web largement dominé par les langages à typage faible, c'est selon moi une perte de temps que de décrire le type de la donnée dans le nom de la variable ou de la fonction. Pour moi, ce qui importe, ce sont la __sémantique__ et la __cohérence__.

J'applique la conventions [snake_case](http://en.wikipedia.org/wiki/Snake_case) pour les noms de variables: toujours en minuscules (y compris les acronymes) et les mots qui les constituent sont séparés par des underscores (_). L'emploi de caractères spéciaux et/ou accentués est bien entendu prohibé.

{% highlight js linenos %}
var la_variable_qui_va_bien = "la valeur qui va avec",
    les_qte_c_est_sympa = "tu l'as dit gros!";

for (position in collection) {
    var current = collection[position];

    console.log(position, current);
}
{% endhighlight %}

J'essaie de toujours donner un sens au nom de mes variables et d'éviter les `$i` ou `$toto` qu'on trouve régulièrement. Quitte à leur donner un nom un peu trop long parfois.

Le nommage de mes fonctions suit la même convention que mes variables, à ceci près qu'un nom de fonction __doit__ contenir au moins un verbe qui caractérise l'action effectuée par la fonction.

{% highlight php linenos %}
<?php

function executer_traitement ($traitement, $valeur) {
    if ($traitement == "afficher")
        echo $valeur;
    elseif ($traitement == "incrémenter")
        return $valeur +1;
    else
        return $valeur;
}

function aller_chercher_contenu ($fichier) {
    if (!is_file($fichier))
        return false;

    return file_get_contents($fichier);
}
{% endhighlight %}

En ce qui concerne l'orienté objet, j'utilise un formalisme bien connu que je ne vais pas trop détailler car il est plus que largement utilisé: c'est le même que celui employé par PHP et Java.

Pour mes classe c'est donc la convention [CamelCase](http://en.wikipedia.org/wiki/CamelCase) et pour les membres (attributs et méthodes) la conventions mixedCase. Les constantes suivent les règles des variables mais sont en majuscules.

{% highlight php linenos %}
<?php

class MaClasseConcrete extends BaseMaClasseAbstraite implements InterfaceMonInterface {

    const UNE_CONSTANTE = "une valeur";

    public $proprietePublique;

    protected $_proprieteProtegee;

    private $_proprietePrivee;

    public function __construct () {
        // ...
    }

    public static function getFoo () {
        return "foo";
    }

    protected function _setBar ($b) {
        $this->_bar = $b;
    }
}
{% endhighlight %}

Les membres d'instance et de classe (donc statiques et non-statiques) suivent la même convention. Les membres protégés ou privés sont préfixés d'un underscore `_` afin de les identifier plus facilement. Je n'utilise __jamais__ le mot clé var, c'est déjà assez explicite avec le préfixe `$` en PHP, en revanche je définis __toujours__ la visibilité d'un membre.

J'ai tendance à regrouper les membres d'une classe dans cet ordre:

+ Constantes
+ Propriétés publiques
+ Propriétés protégées
+ Propriétés privées
+ Constructeur / Destructeur
+ Méthodes __magiques (forcément publiques)
+ Méthodes publiques
+ Méthodes statiques publiques
+ Méthodes protégées / privées

## Les commentaires

Je ne saurais jamais insister assez lourdement sur la nécéssité de commenter votre code. C'est une étape sur laquelle beaucoup de développeur font l'impasse parfois par oubli, souvent par manque de temps, généralement par paresse.C'est pourtant __indispensable__ si vous voulez maintenir votre code et le documenter correctement. Essayez de relire un code assez complexe que vous avez écrit l'an dernier, vous comprendrez tout de suite de quoi je veux parler.

J'emploie les commentaires de 2 façons:

+ pour commenter un bloc ou une expression complexe
+ pour commenter une fonction/méthode ou une classe

Dans le premier cas j'utilise le double slash `//`.

{% highlight php linenos %}
<?php

// convertis les saut de lignes \r\n en <br> HTML
$texte = implode('<br>', array_filter(preg_split('~(\r|\n)*~', $text)));

// heu.... je sais plus... disons un truc complexe
$a = ($b ? ($c === $d && $e << 1 ? $f) : null) && ($h = fopen('fichier.php')) && ($b = fread($h, 1024));
{% endhighlight %}

Dans le second j'utilise la syntaxe Doxygen.

{% highlight php linenos %}
<?php

/**
 * Classe Foo qui ne sert visiblement pas à grand-chose
 *
 * Description longue (et inutile)
 * de ma classe qui peut s'étaler
 * sur plusieurs lignes.
 *
 * @package libs
 * @subpackage util
 * @author Benjamin DELESPIERRE <benjamin.delespierre@gmail.com>
 * @version 1.0.0
 * @since 1.2
 * @copyright 2013 Foo Corp.
 */
class Foo extends Bar implements Baz {

    /**
     * Nom
     * @var string
     */
    protected $_name;

    /**
     * Constructeur
     *
     * Description longue (et inutile)
     * de mon constructeur qui peut
     * s'étaler sur plusieurs lignes
     *
     * @param string $name Le nom
     *
     * @throws InvalidArgumentException Si $name n'est pas une chaine
     */
    public function __construct ($name) {
        $this->_name = $name;
    }

    /**
     * toString
     *
     * @return string
     */
    public function __toString () {
        return "Je m'appelle $this->_name";
    }
}
{% endhighlight %}

Doxygen est extrêmement flexible et le formalisme change en fonction de la configuration de l'outil. Une convention se dégage néanmoins: il est d'usage de respecter l'ordre suivant dans vos blocs de commentaires:

+ Description courte (optionnellement précédée de @brief)
+ Description longue (sur plusieurs lignes)
+ Paramètres (avec @param)
+ Exceptions (avec @throws)
+ Type de retour (avec @return)

Plus vous serez descriptif dans vos commentaires, mieux ça ira pour vous relire et documenter votre projet. Cerise sur le gâteau, avec Doxygen vous pouvez générer automatiquement une documentation technique de [cette qualité](http://bdelespierre.github.io/php-axiom/index.html), plutôt sympa non ?

Bon... certains de mes projets au stade de prototype ne sont pas documentés... mais bon on se comprends hein ?

## Conclusion

Il est pas très difficile de se forger un style cohérent qui nous correspond. Ce qui est plus difficile, c'est d'admettre que les conventions d'autrui ne sont pas forcément absurdes. S'il vous arrive parfois de penser en lisant le code d'un autre développeur qu'il code comme un ponney simplement parce qu'il utilise une convention différente de la votre, rappellez-vous ceci: peu importe le formalisme, l'essentiel c'est de s'y tenir !

__Attention:__ cet article ne doit pas servir de prétexte pour venir troller dans les commentaires. Je ne veux pas voir de débat "ma convention est mieux que la tienne blah blah blah". Essayez d'être constructif.