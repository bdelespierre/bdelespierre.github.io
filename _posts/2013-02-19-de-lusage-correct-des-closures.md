---
layout: post
type: article
title: De l'usage correct des closures en PHP
date: 2013-02-19
category: php
tags: php5.3 php5.4 closures lambda-functions php fermetures
---

Cet article a pour objet de vous verser dans l'art d'utiliser les closures, l'une des nouveautés les plus utiles de PHP 5.3. Il s'adresse à des développeurs chevronnés, au fait de la programmation orientée objet en PHP.

Je ne reviendrai pas sur les concepts de fonction, de référence ou de portée des variables ni sur le paradigme objet. Vous avez à votre disposition d'autres cours pour ça.

Tout au long de cet article, je parlerai de closures et de scopes et autres termes anglophones, j'ai choisi de les conserver dans leur langue originale car je trouve leurs équivalents français (fermetures et portées) moins parlants et surtout moins usités.

## Fonctions lambda, closures, callbacks et objets invoquables

Il est souvent utile de définir des comportements lors du déroulement de l'application (runtime), par exemple pour filtrer un tableau, valider les champs d'un formulaire ou encore pour créer une fonction de rappel. Définir ainsi ces comportements facilite grandement la délégation, plutôt que de créer des fonctions à usage unique ou sous-typer des classes existantes pour incorporer le comportement voulu, on passe simplement le comportement. Cela réduit l'entropie du projet (moins de classes / fonctions) et améliore la lisibilité.

En PHP, la définition de comportements lors du runtime peut se faire de 3 façons distinctes (nous n'admettrons pas ici l'utilisation d'eval comme une option acceptable bien que techniquement réalisable).

### créer une fonction anonyme à l'aide de create_function

    <?php // version 4+

    $additionner = create_function('$a,$b', 'return $a + $b;');
    $trois = $additionner(1,2);

### instancier une classe dottée de la méthode magique __invoke

    <?php // version 5.3+

    class Additionneur {
        public function __invoke ($a, $b) {
            return $a + $b;
        }
    }

    $additioner = new Additionneur;
    $trois = $additioner(1,2);

### créer une fermeture (closure)

    <?php // version 5.3+

    $additionner = function ($a, $b) {
        return $a + $b;
    };
    $trois = $additionner(1,2);

C'est sur cette dernière forme que nous allons nous pencher. Outre le fait que cette syntaxe est proche de celle de JavaScript et qu'elle est considérablement plus simple à mettre en place, elle présente une caractéristique unique: la possibilité de manipuler les variables dans sa portée.

__NOTE__: Le manuel de PHP rassemble ces 3 concepts sous le terme générique de _Callback_ et, depuis PHP 5.4, il est possible dans les prototypes de fonction de spécifier le type `callable` pour un paramètre, ce qui évite d'avoir recours systématiquement à la fonction `is_callable`.

    <?php // version 5.4

    function executer_fonction (callable $fonction) {
        return $fonction();
    }

    var_dump( executer_fonction(function () { echo "Salut!"; }) ); // Salut!

    var_dump( executer_fonction(123) ); // erreur: 123 n'est pas une fonction

## Manipulation du scope

Ce qui différencie une closure d'une fonction anonyme ou d'une instance invoquable, c'est sa capacité à manipuler des références de la portée (ou scope) dans laquelle elle à été définie. Concrêtement, cela signifie que peu importe le scope dans lequel la closure est exécutée, elle peut se "souvenir" des variables présentes dans le scope où elle à été créée. Ceci est rendu possible grâce au mot clé `use`.

__Note__: La documentation de PHP ne fait pas de distinction claire entre fermetures et fonctions anonymes, ce n'est pourtant pas exactement la même chose en programmation. Référez vous aux articles Wikipedia pour plus de détails:

* [fermetures](http://fr.wikipedia.org/wiki/Fermeture_(informatique))
* [fonctions anonymes](http://fr.wikipedia.org/wiki/Fonction_anonyme)

Exemple:

    <?php // version 5.3+

    function fabrique_closure () {
        $a = 1;
        return function ($b) use ($a) {
            return $a + $b;
        };
    }

    function executer_closure ($f, $b) {
        return $f($b); // additionner
    }

    $f = fabrique_closure();

    echo executer_closure($f, 2); // 3

Dans l'exemple ci dessus, on obtiens bien 3 car même si `$a` n'existe pas dans le scope de `executer_closure`, la closure se "souvient" de la référence originale.

C'est de cette fonctionnalité que les closures (fermetures) tirent leur nom: une closure "ferme" le scope parent, plus simplement c'est comme si elle était une boîte autour du scope dans lequel elle est définie.

Cela étant, si en JavaScript n'importe quelle variable du scope parent peut être référencée dans le scope de la closure, en PHP il faut explicitement définir avec le mot clé `use` quelles variables seront importées. Malgré cette limitation, c'est extrêment pratique car on peut promener la closure dans n'importe quel scope, sans se soucier de la visibilité des variables référencées.

Exemple:

    <?php // version 5.3+

    list($a,$b) = array(1,2);

    $f = function () use (&$a, &$b) {
        $a *= 2;
        $b *= 3;
    };

    $f();
    var_dump($a,$b); // 2,6

    function executer_closure ($f) {
        list($a,$b) = array(0,1);
        $f();
        var_dump($a,$b);
    }

    executer_closure($f); // 0,1

Il est intéressant de remarquer dans cet exemple que le scope d'exécution de la closure n'influe pas sur les variables référencées. Dans le scope de `executer_closure`, ce sont toujours les variables du scope racine qui sont référencées par la closure et non les deux nouvelles définies dans `executer_closure`. Nous n'avons donc pas à nous soucier du scope dans lequel notre closure est exécutée, il n'y a pas de risque d'écrasement involontaire.

## Faire référence aux membres d'une instance dans une closure

### En PHP 5.4

Depuis PHP 5.4, les closures peuvent désormais se servir du mot clé `$this` comme n'importe quelle méthode. Il est même possible d'utiliser des membres protégés, ce qui présente en soi un risque de violation de l'encapsulation mais ouvre de nouvelles possibilité pour la conception orientée objet.

Pour que le mot clé `$this` soit utilisable dans le contexte d'une closure, celle-ci doit soit:

+ être définie dans une méthode d'instance
+ être explicitement "attachée" à l'objet

Exemple:

    <?php // version 5.4+

    class MaClasse {

        public $a = 1;

        public function fabriqueClosure () {
            return function ($b) {
                return $this->a += $b;
            }
        }
    }

    $o = new MaClasse;
    $f = $o->fabriqueClosure();
    $r = $f(2);

    var_dump( $o->a ); // 3

    $o2 = (object)['a'=>2];
    $f2 = $f->bindTo($o2);
    $r2 = $f2(2);

    var_dump( $o2->a ); // 4

Pour les habitués de JavaScript, la méthode `bindTo` représente en quelque sorte la méthode `call`: elle permet d'éxécuter notre closure dans un autre contexte que celui d'origine (au détail près qu'une nouvelle closure nous est renvoyée au lieu d'utiliser la closure existante mais vous l'aviez compris j'en suis sûr).

__Note__: Vous l'avez sûrement remarqué mais `bindTo` est bien une méthode et donc, par voie de condéquence, notre closure un objet. Ce qui était en PHP 5.3 un détail d'implémentation est maintenant officiel: les closures sont des instances de la classe `Closure` et on peut donc utiliser le type-hinting. A noter également qu'on peut cloner une closure avec le mot clé `clone`.

Il est également possible de redéfinir le scope de notre closure pour utiliser celui d'une classe ou d'une instance. Concrêtement, cela va nous permettre d'adresser des membres protégés et privés. On passe pour cela un second paramètre à la méthode `bindTo` qui est l'instance ou le nom de la classe à utiliser comme nouveau scope pour notre closure.



### En PHP 5.3

Si vous n'avez pas la possibilité d'utiliser PHP 5.4, vous pouvez injecter la référence de l'objet lors de l'exécution, ce que vous pouvez faire en encapsulant votre closure.

Exemple:

    <?php // version 5.3+

    class SuperClosure {

        protected $_closure;
        protected $_object;

        public function __construct (Closure $closure, $object = null) {
            $this->_closure = $closure;

            if ($object) {
                if (!is_object($object))
                    throw new InvalidArgumentException("object is not object");

                $this->_object = $object;
            }
        }

        public function bindTo ($object) {
            if (!is_object($object))
                throw new InvalidArgumentException("object is expected to be a valid instance");

            return new static($this->_closure, $object);
        }

        public function __invoke () {
            $args = array_merge(func_get_args(), array($this->_object));
            return call_user_func_array($this->_closure, $args);
        }
    }

    $f = new SuperClosure(function ($b, $that) {
        return $that->a *= $b;
    });

    $obj1 = (object)array('a'=>1);
    $obj2 = (object)array('a'=>2);

    $f1 = $f->bindTo($obj1);
    $f2 = $f->bindTo($obj2);

    $f1(2);
    $f2(2);

    var_dump( $obj1->a ); // 2
    var_dump( $obj2->a ); // 4

Le prix à payer est assez lourd en revanche:

* on perd la possibilité d'adresser les membres privés et protégés
* les closures ne pouvant pas se servir de `$this`, il faut ajouter à leur prototype de fonction un paramètre qui caractérise l'instance (généralement appellé `$that` ou `$self`)

Pour aller plus loin, jetez un oeil à mon projet [prototype.php](https://github.com/bdelespierre/prototype.php), il fonctionne en PHP 5.3 et reproduit (en gros) le comportement mentionné ci-dessus.

## Cas concrets d'utilisation

Les cas d'utilisation des closures sont nombreux, il s'agit généralement de déléguer un traitement sans pour autant définir une nouvelle structure (fonction) ou un nouveau type (classe). En voici quelques uns.

### Filtrer un tableau à partir d'un paramètre

Imaginons qu'on veuille filtrer un tableau pour ne conserver qu'un élément sur _N_, nous allons pour cela utiliser la fonction `array_filter` qui attends une _callback_ en tant que second paramètre.

Exemple:

    <?php // version 5.3+

    // soit un tableau de 20 entrées
    $tableau = range(1,20);

    // soit la fonction de filtre qui utilise $n comme multiple
    $filtre = function ($valeur) use (& $n) {
        return (int)$valeur % $n == 0;
    };

    // filtrer pour obtenir 1 élément sur 4
    $n = 4;
    $un_sur_quatre = array_filter($tableau, $filtre);

    // filtrer pour obtenir 1 élément sur 10
    $n = 10;
    $un_sur_dix = array_filter($tableau, $filtre);

    var_dump( $un_sur_quatre ); // [4,8,12,16,20]
    var_dump( $un_sur_dix );    // [10,20]

### Implémentation du pattern observer

Le pattern observer est extrêmement utile pour modéliser un mécanisme d'évènements. Depuis l'apparition de la SPL avec PHP 5.1, on dispose d'ailleurs des interfaces `SplObserver` et `SplSubject` dont nous allons nous servir. Comme il n'est pas pratique de créer une classe d'observateur pour chaque gestionnaire d'évènement, nous allons créer un observateur générique dont le comportement sera injecté avec une closure.

Exemple:

    <?php // version 5.4+

    class SampleSubject implements SplSubject {

        protected $_name;
        protected $_observers;

        public function __construct ($name = false) {
            $this->_name = $name ?: uniqid(__CLASS__.'_');
            $this->_observers = new SplObjectStorage;
        }

        public function attach (SplObserver $observer) {
            $this->_observers->attach($observer);
        }

        public function detach (SplObserver $observer) {
            $this->_observers->detach($observer);
        }

        public function notify () {
            foreach ($this->_observers as $observer)
                $observer->update($this);
        }

        public function __toString () {
            return $this->_name;
        }
    }

    class GenericObserver extends SplObjectStorage implements SplObserver {

        protected $_name;
        protected $_closure;

        public function __construct (Closure $closure, $name = false) {
            $this->_name = $name ?: uniqid(__CLASS__.'_');
            $this->_closure = $closure->bindTo($this, $this);
        }

        public function update (SplSubject $subject) {
            $closure = $this->_closure;
            $closure($subject);
        }

        public function __toString () {
            return $this->_name;
        }
    }

    // soient deux instance distinctes de SampleSubject
    $subject_1 = new SampleSubject;
    $subject_2 = new SampleSubject;

    // soit une méthode destinée aux observeurs
    $observer_function = function (SplSubject $subject) {
        echo "$this notifié par $subject\n";
    };

    // attachons les observateurs aux sujets...
    $subject_1->attach(new GenericObserver($observer_function));
    $subject_2->attach(new GenericObserver($observer_function));

    // ...et voyons ce qui se passe
    $subject_1->notify();
    $subject_2->notify();

Dans l'exemple ci-dessus, nous avons utilisé la même closure pour définir deux observateurs différents. On aurait aussi bien plus utiliser le meme observateur pour différents sujets ou encore définir plusieurs observateurs pour chaque sujet.

Je vous recommande de vous approprier cet exemple pour créer vos propres observateurs au sein de votre application. Ce pattern est très utile pour réduire le couplage d'un architecture et est très pratique pour effectuer des tâches de logging, audit, gestion des erreurs / exceptions etc.

### Des filtres pour nos itérateurs

Pour ceux qui ont déjà utilisé les itérateurs de la SPL, vous avez sûrement déjà rencontré la classe abstraite `FilterIterator` qui agit de la même manière que `array_filter` sur ces structures. Dans le même esprit que l'exemple précédent, nous allons implémenter un filtre générique pour nos itérateurs.

Exemple:

    <?php // version 5.4+

    class GenericFilterIterator extends FilterIterator {

        protected $_closure;

        public function __construct (Iterator $iterator, Closure $closure) {
            $this->_closure = $closure->bindTo($this, $this);
            parent::__construct($iterator);
        }

        public function accept () {
            $closure = $this->_closure;
            return $closure();
        }
    }

    // soit une séquence de 20 entrées
    $it = new ArrayIterator(range(1,20));

    // soit un filtre qui ne laisse passer
    // que les nombres pairs
    $filtre_1 = new GenericFilterIterator($it, function () {
        return !($this->current() & 1);
    });

    echo "Nombres pairs de 1 à 20:\n"
    foreach ($filtre_1 as $nombre)
        echo "> $nombre\n";

    // soit un filtre qui s'ajoute au
    // précédent pour ne laisser passer
    // que les multiples de 5
    $filtre_2 = new GenericFilterITerator($filtre_1, function () {
        return $this->current() % 5 == 0;
    });

    echo "Nombres pairs multiples de 5 de 1 à 20:\n";
    foreach ($filtre_2 as $nombre)
        echo "> $nombre\n";

Cet exemple nous montre combien il est facile d'appliquer un comportement identique à `array_filter` pour des itérateurs en utilisant des closures. On peut en plus enchaîner les filtres à l'infini, ce qui peut être pratique pour des moteurs de recherches multi-critères par exemple.

__Note__: Je ne vous recommande pas d'utiliser les filtres sur des résultats de requêtes MySQL, les performances ne seront __jamais__ supérieures à l'utilisation de la clause `WHERE` SQL.

### Des classes maléables

Les afficionados du pattern strategy ont dû être aux anges à l'annonce de la mise à jour des closures avec PHP 5.4. En effet, grâce aux nouvelles possibilité offertes par les traits et l'usage de `$this` dans les closures, il est désormais possible de rendre n'importe quelle classe existante dynamique.

Exemple:

    <?php // version 5.4+

    trait DynamicObject {

        protected $_customMethods = [];

        public function method ($name, Closure $closure = null) {
            if (!$closure)
                return isset($this->_customMethods[$name]) ? $this->_customMethods[$name] : null;
            else
                $this->_customMethods[$name] = $closure->bindTo($this, $this);
        }

        public function __call ($method, $args = []) {
            if (!$custom_method = $this->method($method))
                throw new BadMethodCallException("no such method $method");

            return call_user_func_array($custom_method, $args);
        }
    }

    class MyClass {
        use DynamicObject;

        protected $_a;
        protected $_b;

        public function __construct ($a, $b) {
            $this->_a = $a;
            $this->_b = $b;
        }
    }

    $f = function () {
        return $this->_a + $this->_b;
    };

    $obj1 = new MyClass(1,2);
    $obj1->method('add', $f);

    $obj2 = new MyClass(4,8);
    $obj2->method('add', $f);

    var_dump( $obj1->add() ); // 3
    var_dump( $obj2->add() ); // 12

Dans l'exemple ci-dessus, nous crééons un trait qui une fois équipé sur une classe lui permet de se voir doter de nouvelles méthodes dynamiquement. Ce genre de concept est exrêmement pratique pour injecter de nouveaux comportements à des types existants, ce qui réduit la nécéssité du sous-typage. Imaginez que vous disposiez d'une classe `Collection` qui représente une séquence (un tableau si vous préférez) et vous voulez une méthode qui trouve des informations dedans mais cette dernière est simple et ne justifie pas que vous sous-typiez `Collection` inutilement. Vous pouvez grâce à ce trait ajouter là où ça vous intéresse le comportement qui vous intéresse et l'affaire est dans le sac: pas de nouvelle classe à créer, pas de nouveau fichier, on reste simple, cohérent et lisible.

## Aller plus loin

Les closures de par leur nature ont quelques application amusantes, voyons-en quelques unes.

### De la récursivité avec les closures

Il est parfois utile d'exécuter la closure dans son propre corp afin, par exemple, d'explorer récursivement un arbre. Mais comment faire dès lors qu'une closure n'est pas nommé comme se doit de l'être une fonction ou méthode ? Tout simplement en utilisant sa propre référence.

Exemple:

    <?php // version 5.3+

    $explorer = function (array $tableau, $profondeur = 0) use (& $explorer) {
        foreach ($tableau as $valeur) {
            if (is_array($valeur))
                $explorer($valeur, $profondeur +1);
            else
                echo str_repeat('  ', $profondeur) . "> $valeur\n";
        }
    };

    $arbre = array(
        1,2,3,
        array(
            4,5,6,
            array(
                7,8,9,
            )
        )
    );

    $explorer($arbre);

### Tricher avec la syntaxe nowdoc

Comme vous le savez, grâce à la syntaxe nowdow (et heredoc aussi) vous pouvez insérer des variables dans des chaines de caractère délimitées par des guillemets-doubles. Mais vous ne pouvez pas insérer des constantes et encore moins des expressions. Comme ce n'est pas toujours pratique d'utiliser des variables temporaires le temps de construire la chaîne, nous allons avoir recours à un hack assez sympathique.

Exemple:

    <?php // version 5.3+

    $_ = function ($v) { return $v; };

    define('FOO', 'bar');
    $a = 1;

    // fonctionne
    echo "{$_(FOO)} - {$_($a+$a)}";

    //fonctionne aussi
    echo <<< EOF
    Une expression: {$_($a+1)}
    Une constante : {$_(FOO)}
    EOF;

### Un autoloader plus malin

Il arrive qu'on doive configurer des paramètre statique d'une classe juste après l'avoir chargée, comme par exemple exécuter la méthode `setConfig` d'un singleton. Mais on ne veux pas pour autant tout charger à chaque fois, alors comment faire ? En utilisant le chargement automatique de classes avec les closures, on va pouvoir enregistrer des comportements a effectuer avant et/ou après le chargement d'une classe.

Exemple:

    <?php // version 5.3+

    spl_autoload_register(function ($classe) use (&$autoload_before, &$autoload_after) {
        isset($autoload_before[$classe]) && $autoload_before[$classe]($classe);
        $r = include $classe . '.class.php';
        $r && isset($autoload_after[$classe]) && $autoload_after[$classe]($classe);
    });

    // configurer automatiquement un singleton
    $autoload_after['MonSingleton'] = function () use (& $config) {
        if (!isset($config))
            throw new RuntimeException("you must setup configuration first");

        MonSingleton::setConfig($config);
    };

    // créer dynamiquement un alias
    $autoload_before['MonAlias'] = function (& $vrai_nom) {
        $vrai_nom = 'MaClasse';
    };

    $autoload_after['MaClass'] = function () {
        class_alias('MonAlias', 'MaClasse');
    }

### Un injecteur de dépendances

L'injection de dépendances est un patron d'architecture proche de l'inversion de contrôle. Sans rentrer dans les détails, l'idée globale est de définir une cartographie des composants et de leurs dépendances au sein d'un composant capable de les résoudre pour fournir un composant donné. Par exemple, une classe de modèle (destinée à effectuer des requêtes sur la BDD) nécessite un adaptateur comme PDO ou encore un contrôleur à besoin d'accéder à des composants métiers. L'injecteur de dépendances, comme son nom l'indique permet d'exprimer ce besoin.

Voici un exemple d'implémentation qui repose sur les paramètres des closures pour déterminer les dépendances entre les composants. Il s'agit ici d'une résolution par nom où le chargement et l'initialisation d'un composant sont modélisés par une closure, les noms de ses paramètres sont ceux des dépendances du composants à charger.

    <?php // version 5.3+

    class IoC {

        protected static $_registry = array();

        public static function register ($name, Closure $fct) {
            static::$_registry[(string)$name] = $fct;
        }

        public static function resolve ($name) {
            $fct = static::$_registry[(string)$name];
            return inject($fct);
        }
    }

    function inject (Closure $fct) {
        $reflect = new ReflectionFunction($fct);
        foreach ($reflect->getParameters() as $parameter) {
            $name = $parameter->name;
            $context[$name] = IoC::resolve($name);
        }
        return !empty($context) ? $reflect->invokeArgs($context) : $reflect->invoke();
    }

    IoC::register('Composant_A', function ()             { echo "Composant A initialisé\n"; });
    IoC::register('Composant_B', function ($Composant_A) { echo "Composant B initialisé\n"; });
    IoC::register('Composant_C', function ($Composant_B) { echo "Composant C initialisé\n"; });

    inject(function ($Composant_C) {
        // ici, on dispose du composant C qui dépends de B qui dépends de A
        // la chaîne de dépendance à été résolue récursivement par IoC
    });

On peut sans grand effort effectuer une résolution par type en utilisant des interface (ce qui est bien mieux en termes de sécurité), je suis sûr que vous saurez adapter l'exemple ci-dessous en conséquence.

L'avantage marteau de l'injecteur de dépendances est le total découplage entre les classes au prix bien sûr d'une inversion de contrôle car il faut bien que l'injection soit contrôlée par quelque chose. Mon projet [Cobalt](https://github.com/bdelespierre/cobalt) utilise cette forme d'injection de dépendances pour les contrôleurs, la flexibilité apportée est extrêmement apréciable dans le contexte du MVC.

## Conclusion

Je crois avoir suffisament démontré à quel point les closures sont à la fois simples et puissantes, elles permettent de répondre à nombre de problématiques existantes et ouvrent de nouvelles pistes de réflexion pour les designs à venir. Pour moi, il n'est pas étonnant que le concept de closures soit central dans de nombreux langages, notamment JavaScript, compte tenu de la flexibilité qu'elles apportent.

Je vous recommande maintenant de faire quelques essais ou au moins d'exécuter les exemples ci-dessus (environement PHP 5.4 obligatoire), de les comprendre et de les maîtriser. Vous verrez, une fois qu'on a commencé à programmer avec des closures, on ne peut plus s'en passer.

Je terminerai simplement en vous mettant en garde contre l'utilisation abusive de ce concept qui peut mener, comme on s'en doute, à une ["spaghettisation"](http://fr.wikipedia.org/wiki/Programmation_spaghetti) du code. Sachez donc les utiliser convenablement et à ne pas en abuser.
