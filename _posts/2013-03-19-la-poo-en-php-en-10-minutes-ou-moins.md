---
layout: post
type: article
title: La POO en PHP en 10 minutes (ou moins)
date: 2013-03-19
category: php
tags: php oop object héritage encapsulation polymorphisme programmation-orientée-objet objet programmation
---
# La POO en PHP en 10 minutes (ou moins)

Si vous avez vécu sous un rocher dans une grotte sous une montagne au fin fond du Jura ces 40 dernière années et n'avez jamais entendu parler de programmation orientée objet, je vais tenter de vous faire un rapide résumé.

La programmation orientée objet est l'évolution la plus significative dans le monde de l'informatique depuis l'invention du transistor. Bien qu'elle ait été théorisée dans les années 60, son implémentation _correcte_ devait attendre 2004 pour voir le jour en PHP. Il s'agit d'une approche différente (mais complémentaire) de la programmation impérative, à la fois plus souple, plus puissante mais surtout plus naturelle. Le concept de base est de créer une structure qui va permettre de rassembler à la fois des données et des traitements.

Comme vous le verrez tout au long de cet article, l'idée principale de la programmation orientée objet est de faciliter la _réutilisabilité_ et la _généricité_ tout en favorisant la _simplicité_ et la _cohérence_.

La programmation orientée objet repose sur 3 concepts clés: l'encapsulation, l'héritage et le polymorphisme (généralement regroupés sous l'appelation de _paradigme objet_) que je me propose d'exposer. L'objet de cet article est de vous initier à cette forme de programmation dans le cadre du langage PHP, il s'adresse donc à des débutants au fait de la programmation _"classique"_ (donc procédurale) en PHP.

__Important__: Cet article couvre le paradigme objet en PHP mais pas les petites spécificités propres à PHP comme la résolution statique à la volée (ou _late static binding_) ni les traits. Ces concepts feront l'objet d'un futur article, dans l'immédiat je vous recommande de maîtriser les bases de l'OOP en PHP avant d'aller plus loin.

## L'encapsulation

Le principe fondamental de la programmation orienté objet est la notion de _classe_. Vous savez déjà manier des tableaux et des variables (qui sont des structures de données) et des fonctions (qui sont des structures de comportements). La classe vous permet de les rassembler dans un strucrure commune.

On appelle classe tout regroupement _cohérent_ de données (ou _propriétés_) et de comportemnts (ou _méthodes_). Les proprétés et méthodes d'une classe sont égalements appelés membres. En fait, on peut penser à une classe comme à un _"moule"_ destiné à la fabrication d'_objets_ (ou _instances de classes_).

Pour créer un nouvel objet, on utilise le mot clé `new` suivi du nom de la classe à instancier. Une fois l'objet crée, son état interne (les valeurs de ses propriétés) sera préservé jusqu'a sa destruction explicite (avec la fonction `unset`) ou jusqu'a la fin du script.

__Note__: une propriété peut avoir une valeur par défaut mais cette valeur ne peut pas être une expression (comme 1+2 par exemple). Si vous avez besoin d'initialiser une propriété à l'aide d'une expression, utilisez le constructeur comme montré ci-dessous.

Au sein d'une classe, un membre peut également avoir une _visibilité_:

+ `public` (ou `var`) le membre est visible à l'intérieur et à l'exterieur de la classe
+ `protected` le membre n'est visible qu'à l'intérieur de la classe et de ses classes filles (voir plus bas pour  l'héritage)
+ `private` le membre n'est visible qu'a l'intérieur de la classe

La notion de visibilité d'un membre est intimement liée à la notion d'état. En restreignant la visibilité d'un membre, l'objet est protégé contre les altérations de son état depuis l'exterieur qui pourraient nuire à son fonctionnement. Par exemple, si vous créez une classe de manipulation de fichier et que cette classe porte une propriété qui est la ressource du fichier, vous ne voulez pas qu'on puisse la fermer de l'exterieur avec `fclose` car cela perturberai l'éxécution de vos méthodes.

Définir la visibilité d'un membre n'est pas obligatoire, en l'absence de visibilité un membre sera public (les propriétés doivent au moins être déclarées avec le mot clé var). Je vous recommande d'utiliser efficacement la visibilité afin de protéger le fonctionnement et les données internes de la classe (qui n'ont pas besoin d'être exposés). Dans la pratique, il vaut mieux définir les propriétés comme protégées par défaut afin qu'on ne puisse pas les modifier depuis l'extérieur de la classe et de définir des accesseur (des méthode d'accès à ces propriétés) au besoin.

On accède aux membres par l'intermédiaire de l'opérateur flèche (->). Au sein d'une classe, le mot clé [b]$this[/b] permet d'accéder au membres d'instance en cours ($this représente en fait l'objet).

Exemple d'instanciation:

    <?php

    class MaClasse {

        // propriété
        var $a = 1;

        // méthode
        function afficher () {
            echo $this->a;
        }
    }

    $mon_instance = new MaClasse;
    $mon_instance->afficher(); // affiche 1
    $mon_instance->a = 2;
    $mon_instance->afficher(); // affiche 2

### Le constructeur

La création d'une instance provoque systématiquement l'appel au _constructeur_ de la classe (la méthode d'instance `__construct`). Le rôle du constructeur est de construire l'objet, le plus souvent il s'agit d'initialiser ses propriétés mais on peut également faire appel à d'autres méthodes lors de l'instanciation. Cette méthode n'est pas obligatoire, en son absence, le constructeur par défaut de PHP sera utilisé (comme dans l'exemple plus haut).

Exemple d'utilisation du constructeur:

    <?php

    class MaClasse {

        // propriété protégée
        protected $a;

        // constructeur
        function __construct ($valeur) {
            $this->a = $valeur;
        }

        // méthode
        function afficher () {
            echo $this->a;
        }
    }

    $mon_instance = new MaClasse("hello");
    $mon_instance->afficher(); // affiche hello

### Le destructeur

La destruction d'une instance provoque systématiquement l'appel du _destructeur_ de la classe (la méthode d'instance `__destruct`). Le rôle avoué du destructeur est de pouvoir détruire proprement l'objet, par exemple en fermant les ressources utilisées par l'instance (comme un fichier ouvert avec fopen par exemple). Comme pour le constructeur, cette méthode n'est pas obligatoire. Dans la réalité, les usages du destructeur sont assez rares.

Exemple d'utilisation du destructeur:

    <?php

    class MaClasse {

        protected $ressource;

        function __construct ($fichier) {
            $this->ressource = fopen($fichier, 'r');
        }

        function lireUneLigne () {
            return fgets($this->ressource);
        }

        function __destruct () {
            // fermer proprement le fichier
            fclose($this->ressource);
        }
    }

    $mon_instance = new MaClasse('fichier.txt');
    echo $mon_instance->lireUneLigne(); // lit la première ligne
    echo $mon_instance->lireUneLigne(); // lit la seconde ligne
    unset($mon_instance); // le destructeur est appellé, le fichier est fermé

### Membres de classes et membres d'instances

Un membre peut être lié à l'instance de la classe (on parle alors de _membre d'instance_), c'est le cas par défaut. Pour qu'un tel membre existe et soit utilisable on doit impérativement disposer d'une instance.

Mais un membre peut également être lié à la classe elle-même (on parle alors de _membre de classe_ ou de _membre statique_), il est pour cela précédé du mot clé `static`. Un membre statique est accessible par l'intermédiaire de l'opérateur de résolution de porté (`::`). Au sein d'une classe le mot clé `self` permet d'accéder aux membres statiques (`self` représent la classe en cours, par opposition à `$this` qui représente l'instance en cours).

La visibilité s'applique de la même façon sur les membres d'instances et sur les membres de classes, leurs effets sont basiquement les mêmes sauf dans le cas de l'héritage de méthodes statiques que nous détaillerons plus bas.

__Notez__: il est possible d'utiliser un membre de classe avec l'opérateur flèche (`->`) si on dispose d'une instance de cette classe (exemple `$objet->maMethodeDeClasse()`), l'inverse, c'est à dire l'utilisation de membres d'instance dans un contexte statique, est plus que déconseillé car votre script plantera s'il rencontre un `$this`. Dans la pratique, on évite généralement de se livrer à ce genre d'exercice hasardeux, on préférera utiliser les membres dans le contexte (statique ou d'instance) d'origine.

Exemple de classe disposant de membres statiques:

    <?php

    class MaClasse {

        // propriété de classe
        public static $prefixe = "hello";

        // propriété d'instance
        protected $_phrase;

        // constructeur
        public function __construct ($mot) {
            $this->_phrase = self::$prefixe . ' ' . $mot;
        }

        // méthode d'instance
        public function afficher () {
            echo $this->_phrase;
        }

        // méthode de classe
        public static function definirPrefixe ($prefixe) {
            self::$prefixe = $prefixe;
        }
    }

    $obj1 = new MaClasse("world");
    $obj1->afficher(); // affiche hello world

    MaClasse::definirPrefixe("strange");

    $obj2 = new MaClasse("word");
    $obj2->afficher(); // affiche strange world
    $obj1->afficher(); // affiche strange world également

## L'héritage

Avec l'héritage, on entre dans la vraie plus-value des langages objets par rapport aux langages impératifs, il s'agit d'un moyen simple de favoriser la _réutilisabilité_ du code.

L'héritage va permettre une réutilisation verticale du code, c'est à dire que nos classes vont former une hiérarchie dans laquelle les enfants (les _classes filles_) pourront réutiliser les comportements et les données de leur(s) parent(s) (les _classes mères_).

__Important__: l'héritage entre deux classes caractérise la relation _"est un espèce de..."_ Par exemple: une voiture est une espèce de véhicule, un chien est une espèce d'animal. L'héritage doit être sémantiquement valide afin d'éviter les dérives comme l'héritage fonctionnel. Comme le disait mon prof de Java: _"ce n'est pas parce que le chien pisse sur le poteau que le chien est un espèce de poteau"_... Donc ce n'est pas parce que le chien _utilise_ le poteau qu'il doit _hériter_ de poteau (on préférera dans ce cas utiliser une _délégation_ ou encore une _composition_).

Concrêtement, lors qu'une classe B (la _fille_) hérite d'une classe A (la _mère_), elle dispose alors
de tous les membres publics ___et protégés___ de sa mère (d'ou l'importance de cette différentiation entre membre protégé et privé). On réalise un héritage quand il y a lieu d'effectuer une _spécialisation_, c'est à dire que la classe fille va _redéfinir_ (on parle aussi de _surcharge_) ou _ajouter_ des comportements.

Pour que la classe B hérite de A, on utilise le mot clé `extends` comme montré ci-dessous. On peut, depuis une classe fille, faire explicitement appel au méthode de la classe parente à l'aide du mot clé `parent`, c'est pratique lors ce qu'il s'agit de réutiliser une partie du comportement de la classe parent sans pour autant devoir le réécrire.

    <?php

    class Vehicule {

        protected $nombre_de_roues;

        public function __construct ($nombre_de_roues) {
            $this->nombre_de_roues = $nombre_de_roues;
        }

        public function nombreDeRoues () {
            return $this->nombre_de_roues;
        }
    }

    class Voiture extends Vehicule {

        public function __construct () {
            // appel du constructeur parent
            parent::__construct(4);
        }
    }

    class Moto extends Vehicule {

        public function __construct () {
            // appel du constructeur parent
            parent::__construct(2);
        }
    }

    $ma_voiture = new Voiture;
    echo "Ma voiture a " . $ma_voiture->nombreDeRoues() . " roues"; // Ma voiture a 4 roues

    $ma_moto = new Moto;
    echo "Ma moto a " . $ma_moto->nombreDeRoues() . " roues"; // Ma moto a 2 roues

__Important__: En PHP, l'héritage multiple __n'existe pas__. Ce qui signifie que vous ne pouvez par déclarer une classe qui hérite de deux autre classes. En somme, `class A extends B, C` c'est interdit. Vous pouvez en revanche _réaliser_ plusieurs interfaces (voir le chapitre sur le polymorphisme ci-dessous).

### Filliation, parents, enfants et arbre généalogique

Une classe n'est pas seulement un moyen commode de rassembler des données et des comportements au sein d'une structure, c'est surtout un excellent moyen de créer de nouveaux _types_ de données, car en réalité, une classe peut être considérée comme un type au même sens qu'une chaine ou un entier.

Quand on réalise une héritage, la classe fille caractérise un nouveau type mais est toujours du type de la mère. Par exemple une pomme est toujours considérée un fruit, qui est toujours considéré comme un végétal. En programmation orientée objet c'est le même concept, on parle alors de _hiérarchie de types_.

Comme tout bon langage objet, PHP dispose de l'opérateur `instanceOf` qui permet de savoir si une instance est d'un type donné. Cet opérateur renvoie `true` si l'objet est du type (ou _super-type_) spécifié.

Exemple de hiérarchie:

    <?php

    class Vivant {
    }

    class Vegetal extends Vivant {
    }

    class Fruit extends Vegetal {
    }

    class Apple extends Fruit {
    }

    class GoldenLady extends Apple {
    }

    $object = new GoldenLady;

    var_dump( $object instanceOf Apple );  // true
    var_dump( $object instanceOf Fruit );  // true
    var_dump( $object instanceOf Vegetal); // true
    // ... etc.

Il est d'ailleurs possible de sépcifier sur un prototype quel type d'objet est attendu. Vous l'aviez peut-être déjà fait avec les tableaux, sachez simplement que c'est possible avec les objets.

En reprennant l'exemple précédent:

    <?php

    function manger (Fruit $fruit) {
        echo "I'm eating " . get_class($fruit);
    }

    $object = new Apple;
    manger($object); // I'm eating Apple

On appelle ce syntaxe de paramètres le _type-hinting_, c'est à dire qu'on demande explicitement des objets du type (ou super-type) spécifié. N'importe quoi d'autre provoquera une erreur. Si on avait passé un type natif comme un entier ou encore une instance qui hérite de la classe `Vegetal` mais qui n'est pas un fruit, on se serait fait jeter.

Le type-hinting est extrèmement pratique pour sécuriser vos fonctions et vos méthode en empêchant le développeur d'y mettre n'importe quoi.

__Note__: contrairement à d'autres langages objets comme Java, les objets n'héritent pas par défaut de la class `Object`, vous devez donc recourrir à `is_object` si vous voulez valider le type objet.

## Le polymorphisme

Le polymorphisme (du grec _plusieurs formes_) est le mécanisme grâce auquel une même méthode peut être implémentée par plusieurs types (donc plusieurs classes) favorisant ainsi la _généricité_. Concrêtement, si une méthode est déclarée et/ou définie dans la classe parente d'une classe donnée, vous n'avez pas à vous préocuper du type précis de la fille avec laquelle vous travaillez pour l'utiliser.

Par exemple, une méthode `obtenirAire` est commune aux classes `Cercle`, `Carre` et `Rectangle` qui héritent toutes de `Forme`. Quand vous travaillez avec une instance de `Forme`, vous n'avez donc plus à vous soucier de savoir si c'est un cercle, un carré ou un rectangle pour obtenir son aire.

Comme dans la plupart des langages objet, le polymorphisme en PHP est un polymorphisme par _sous-typage_ (ou _dérivation_) c'est à dire qu'on va se servir de la redéfinition de comportements prévue par l'héritage pour faire du polymorphisme. Nous avons vu plus haut avec `Vehicule`, `Voiture` et `Moto` qu'il est possible de redéfinir une méthode de la classe mère dans sa fille (en l'occurence, il s'agissait de son constructeur). Nous allons maintenant voir qu'il est possible d'aller plus loin.

### Abstraction

En programmtion objet, il est possible de déclarer des méthodes dont la définition n'est pas encore connue dans la classe mère mais devront être décrites dans une classe fille. On parle alors de _méthodes abstraites_. Une classe qui contiend au moins une méthode abstraite doit elle aussi être déclarée abstraite et ne peut plus être instanciée - vu que tout son code n'est pas implémenté. On parle alors de _classe abstraite_.

Une méthode abstraite est précédée du mot clé `abstract` (idem pour la classe qui la porte) et ne peut pas avoir de corp.

Exemple de classe abstraite:

    <?php

    abstract class Animal {

        protected $_nom;

        public function __construct ($nom) {
            $this->_nom = $nom;
        }

        abstract public function parler ();
    }

    class Chien extends Animal {

        public function parler () {
            echo "$this->_nom: Wouf Wouf\n";
        }
    }

    class Chat extends Animal {

        public function parler () {
            echo "$this->_nom: Miaou\n";
        }
    }

    $chien = new Chien("Rex");
    $chien->parler(); // affiche Rex: Wouf Wouf

    $chat  = new Chat("Sac-a-puces");
    $chat->parler();  // affichie Sac-a-puces: Miaou

### Interfaces

Si toutes les méthodes d'une classe sont abstraites, cette classe est alors une _interface_. Dès lors, on utilise le mot clé `interface` en lieu et place du mot clé `class`. L'intérêt principal des interfaces est que plusieurs d'entre elles peuvent être _réalisées_ (ou _implémentées_) par une même classe. En somme `class A extend B implements C,D,E` est tout à fait valide.

On croise d'ailleurs fréquement des classes qui réalisent plusieurs interfaces, c'est le cas notamment de la classe PHP `ArrayIterator` qui réalise `Iterator`, `Traversable`, `ArrayAccess`, `SeekableIterator`, `Countable` et `Serializable`.

En fait l'interface donne une _"forme"_ a notre classe: elle va définir comment celle-ci doit se _présenter_ (par là on entends quelles devront être ses méthodes) mais pas comment elle doit se _comporter_. Les iterateurs de la SPL en sont un bel exemple: tous les itérateurs partagent des prototypes de méthodes communs mais chacun les implémente différement.

__Note__: vu que toutes les méthodes d'une interface sont obligatoirement abstraites, il est inutile de le spécifier avec le mot clé `abstract` sur les méthodes et la classe.

Exemple d'interface:

    <?php

    interface Forme2D {

        // toutes les formes en deux dimention ont une aire...
        public function obtenirAire ();

        // ... et un périmètre
        public function obtenirPerimetre ();
    }

    class Carre implements Forme2D {

        protected $_cote;

        public function __construct ($cote) {
            $this->_cote = $cote;
        }

        public function obtenirAire () {
            return pow($this->_cote, 2);
        }

        public function obtenirPerimetre () {
            return 4 * $this->_cote;
        }
    }

    class Rectangle implements Forme2D {

        protected $_longueur;
        protected $_largeur;

        public function __construct ($longueur, $largeur) {
            $this->_longueur = $longueur;
            $this->_largeur = $largeur;
        }

        public function obtenirAire () {
            return $this->_longueur * $this->_largeur;
        }

        public function obtenirPerimetre () {
            return 2 * ($this->_longueur + $this->_largeur);
        }
    }

    class Cercle implements Forme2D {

        protected $_rayon;

        public function __construct ($rayon) {
            $this->_rayon = $rayon;
        }

        public function obtenirAire () {
            return M_PI * pow($this->_rayon, 2);
        }

        public function obtenirPerimetre () {
            return M_PI * ($this->_rayon * 2);
        }
    }

Dans l'exemple ci-dessous, connaissant les méthodes déclarées par `Forme2D`, nous pouvons décrire des objet qui travaillent avec n'importe quelle instance de `Forme2D`. C'est ça la généricité !

Exemple d'utilisation générique d'une forme:

    <?php

    // en reprennant l'exemple précédent

    class Figure2D {

        protected $_formes;

        public function ajouter (Forme2D $forme) {
            $this->_formes[] = $forme;
        }

        public function surfaceTotale () {
            $surface = 0;
            foreach ($this->_formes as $forme)
                $surface += $forme->obtenirAire();

            return $surface;
        }
    }

    $figure = new Figure;
    $figure->ajouter(new Cercle(3));
    $figure->ajouter(new Carre(4));
    $figure->ajouter(new Rectangle(5,6));

    echo "Ces trois figures ont une surface totale de " . $figure->surfaceTotale(); // 74.27...

On voit rapidement l'intérêt du polymorphisme dans ce cas: grâce à l'interface `Forme`, on peut créer autant de type de formes qu'on veut, par exemple le triangle, le losange, le polygone etc. Et tous ces objets, aussi longtemps qu'ils hériteront de `Forme2D`, seront utilisables avec la classe `Figure2D`.

__Note__: Il est également possible d'hériter des interfaces entre elles à l'aide du mot clé `extends`.

Exemple d'héritage d'interfaces:

    <?php

    interface Forme {
        // ...
    }

    interface Forme2D extends Forme {
        // ...
    }

    interface Forme3D extends Forme {
        // ...
    }

__Note__: Contrairement aux classes, une interface peut étendre plusieurs interfaces avec le mot clé `extends`. On notera également que les cas qui justifient un héritage d'interfaces sont assez rares, il est peu probable que vous en ayez besoin un jour.

## Conclusion

Vous l'aurez compris, la programmation orientée objet c'est aussi complexe que puissant. Une fois les base de l'OOP maîtrisées, vous pourrez commencer à aller plus loin dans l'architecture logicielle, la programmation par composants, les design-patterns etc.

De nos jours, la plupart des infrastructure logicielles importantes ou complexes sont codées en Objet, ce n'est pas un hasard. La __simplicité__ grâce à l'encapsulation, la __réutilisabilité__ grâce à l'héritage et la __généricité__ grâce au polymorphisme expliquent à elles trois l'engoument persistant pour les langages objets et leur large domination parmi les langages de programmation.

Vous verrez, une fois habitué, penser objet vous sera naturel.
