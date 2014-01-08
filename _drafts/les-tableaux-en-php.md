---
layout: post
title: Les tableaux en PHP
date: 
category: php
tags: 
---
# Les tableaux en PHP

De nos jours, la totalité des langages de programmation proposent des fonctionnalités (et souvent des types de données spécifiques) permettant de manipuler des séquences. Bien entendu, PHP ne fait pas exception avec son type `array()`. Je vous propose au cours de cet article de découvrir qu'en PHP, un tableau n'est pas une structure aussi simple qu'on pourrait le penser au premier abord. Nous allons voir ensemble quelques techniques qui permettent une utilisation plus intelligente et plus performante de ce type de données un peu atypique.

Plus qu'une explication formelle, cet article s'attachera à dresser un portrait des fonctionnalités les plus utiles des tableaux au travers d'exemples simple. J'ai utilisé (volontairement) PHP 5.4 et je vous recommande d'en faire autant pour exécuter les exemples ci-desous.

Si vous êtes déjà famillier avec l'utilisation standard des tableaux, vous pouvez sauter le chapitre de rappel sur le type Array et aller directement au chapitre [Parcours](#).

## Rappel sur le type Array

Avant de commencer, point de rappel. En PHP, le type le plus simple pour manipuler des ensembles (ou séquence) est `array`. Contrairement à d'autres langages plus restrictifs comme C ou Java, un `array` PHP c'est bien plus qu'une simple suite d'octets, c'est à la fois une _liste_, une _pile_, un _dictionnaire_ et de manière générale tout ce qui peut représenter n'importe quel type abstrait non scalaire.

### Liste

Une liste - comme son nom l'indique - c'est tout simplement une suite de valeurs. Il s'agit de la forme la plus simple de tableau et l'exemple ci-dessous illustre comment créer une simple liste composée de valeurs entières:

    <?php

    // un tableau qui contiens 1, 2 et 3
    $liste_1 = array(1,2,3);

    // la représentation de l'expression
    // mathématique [1:99] soit tous les
    // nombres entiers de 1 à 99
    $liste_2 = range(1,99);

A noter qu'un tableau peut contenir n'importe quelle valeur (entier, chaine, objet ou même d'autres tableaux); `null`, `false` ou `""` sont donc bien entendu utilisable.

Pour décrire la position d'un élément dans le tableau, on utilise couramment le terme d'_index_ (ou d'_offset_ en anglais). Dans l'exemple ci-dessus, l'élément portant la valeur `2` de `$tableau_1` se trouve à l'index 1 (les tableaux sont indexés à partir de 0). Il est bien entendu possible de réccupérer la valeur (ou la référence) d'un élément donné dans un tableau.

    <?php

    $liste = array(1,2,4,8,16,32,64);

    echo $list[3]; // affiche 8

    $variable = $liste[4];
    echo $variable;   // affiche 16

    $reference = & $liste[5];
    $reference = $reference * 2;
    echo $liste[5]; // affiche 64 (on a utilisé la référence pour multiplier une valeur du tableau par 2)

En PHP il existe également un mot clé réservé `list` dont le rôle est de populer des variables à l'aide d'un tableau.

    <?php

    // soit un vecteur de l'espace
    $vecteur = array(10,20,30):

    // obtenons x, y et z
    list($x,$y,$z) = $vecteur;

    echo "Mon vecteur est : ($x,$y,$z)";

__Attention:__ `list` vous fournis une copie des éléments du tableau et non des références, en conséquence si dans l'exemple ci-dessus on modifie `$x`,`$y` ou `$z` cela n'aura aucun impact sur `$vecteur`.

Souvent, on ne connait pas à l'avance le nombre d'éléments d'un tableau - souvent parce qu'il est construit dynamiquement. Dans ce cas, il faut toujours se rappeller que l'utilisation d'un index non défini d'un tableau provoque une erreur PHP de type `E_NOTICE` (vous verrez _undefined offset X_ dans l'erreur). Pour contrôler l'existence d'une valeur à l'emplacement voulu, il est toujours de bon ton d'utiliser `isset` de la manière suivante:

    <?php

    // crééons un tableau de N éléments
    // où N est un entier aléatoire
    // entre 1 et 10
    $liste = range(1, rand(1,10));

    // on veut la valeur de
    // l'index 5 s'il existe
    if (isset($liste[5]))
        $valeur = $list[5];
    else
        $valeur = false;

### Matrice

Comme mentionné ci-dessus, un tableau peut contenir des tableaux. On parle alors ici de tableaux multidimentionnels (ou matrices).

    <?php

    // imaginons une matrice carrée de
    // 3x3 éléments
    $matrice = array(
        array(1, 2, 3),
        array(4, 5, 6),
        array(7, 8, 9),
    );

    // on veut l'élément à 2.2
    $valeur = $matrice[2][2];

    echo $valeur; // affiche 5

    // créons maintenant un gros gros
    // talbeau de 5x5x5x5x5=3125 éléments
    // dynamiquement
    $gros_tableau = array();

    for ($a=1; $a<=5; $a++) {
        for ($b=1; $b<=5; $b++) {
            for ($c=1; $c<=5; $c++) {
                for ($d=1; $d<=5; $d++) {
                    for ($e=1; $e<=5; $e++) {
                        $gros_tableau[$a][$b][$c][$d][$e] = $a*$b*$c*$d*$e;
                    }
                }
            }
        }
    }

    echo $gros_tableau[1][2][3][4][5]; // affiche 120 (1x2x3x4x5)

Rien de bien compliqué ici, il ne s'agit que d'une application de ce qui avait été décrit précédement. On peut théoriquement imbriquer les tableaux de cette façon à l'infini (du moins, autant que la limite mémoire le permet) et se servir de ce type de structure pour des arbres (nous verrons plus bas comment se manipulent de telles structures).

On remarque juste une chose avec l'exemple précédent, c'est qu'il est possible d'initialiser directement la valeur à n'importe quelle profondeur du tableau sans que les tableaux "au dessus" n'aient besoin d'être déclarés explictement. En somme, faire

    $tableau[1][2][3] = 4;

Revient à faire

    $tableau = array();
    $tableau[1] = array();
    $tableau[1][2] = array();
    $tableau[1][2][3] = 4;

### Dictionnaire

Un dictionnaire de données consiste en une séquence de paires clés / valeurs, généralement suivant le principe d'une _table de hashage_ (ou _hashmap en anglais). Il s'agit d'une structure extrêmement pratique pour le stockage d'information puisqu'elle permet d'indexer un tableau avec des clés alphanumériques.

En PHP, tous les tableaux sont en réalité des dictionnaires car il est possible de combiner des index numériques avec des clés alphanumériques. En interne, PHP considère tous les tableaux comme des tables de hashage afin d'optimiser la recherche de valeurs à partir des clés. Je ne vais pas ici rentrer dans les détails d'implémentation des hashmap, si ça vous intéresse je vous recommande de consulter [la page hashmap sur Wikipedia](http://fr.wikipedia.org/wiki/Table_de_hachage).

__Note:__ Bien que les termes _index_ et _clé_ soient en réalité une seule et même chose en PHP, je préfère parler d'index quand il s'agit d'identifiants numériques et de clé quand il s'agit d'identifiants alphanumériques pour éviter toute confusions.

Afin de créer une paire dans un dictionnaire, on utilise l'opérateur `=>` dont la partie gauche est un scalaire représentant la clé et la partie droite la valeur. Il est tout à fait possible d'utiliser une variable pour la clé.

    <?php

    $dico_1 = array(
        'a' => 1,
        'b' => 2,
        'c' => 3,
    );

    echo $dico_1['b']; // affiche 2

    // mélange de clés numériques et alhpabétiques
    $dico_2 = array(
        'a' => 1,
         1  => 2,
        'b' => 3,
         2  => 4,
        'c' => 5,
    );

    echo $dico_2['1']; // affiche 2

    // les clés ne sont pas obligatoires
    $dico_3 = array(
        'a' => 1,
        'b' => 2,
        'c' => 3,
        4,
        5,
        6,
    );

    echo $dico_3['b']; // affiche 2
    echo $dico_3[0]; // affiche 4

On remarque dans le cas de `$dico_2` que la clé utilisée pour récupérer la valeur 2 n'a pas forcément besoin d'être du même type que la clé visée. Dans notre cas, la clé pour la valeur 2 est l'entier 1 mais on peut aussi la récupérer en utilisant la chaîne '1'. Ceci est dû au typage faible du langage qui provoque un cast implicite lors de la réccupération de la donnée à l'aide de l'opérateur []. Faites donc très attention au type de vos clés car vous risquez de perdre de l'information.

Par exemple, le tableau suivant, bien qu'il déclare 3 valeur, n'en a plus qu'une en réalité car '0' est l'équivalent de 0 et false:

    <?php

    $dico = array(
        '0'   => 1,
         0    => 2,
        false => 3
    );

    var_dump( $dico ); // affiche array (size=1) { 0 => int 3 }

On remarque également avec `$dico_3` que l'attribution de clés alphanumériques n'a aucune incidence sur la numérotation automatique des index du tableau. On déclare 3 valeur avec les clés a, b et c mais pour autant les valeurs suivantes qui n'ont pas de clés sont numérotées de 0 à 2 et non de 3 à 5. Ceci est dû au fait que PHP maintiens en interne une valeur incrémentale qui est utilisée pour les index numériques et qui n'est pas influencé par l'attribution de clés.

__Important:__ La position des éléments identifiés par des clés dans un tableau est supposé pseudo-aléatoire. Vous ne devriez pas présumer de la position d'un élément par rapport à un autre dans un tableau indexé alphanumériquement, notamment lors que vous traversez celui-ci.

### Pile

Une pile est - comme son nom l'indique - une structure dans laquelle les éléments sont mis les uns par dessus les autres. Une pile s'utilise de la façon suivante: on ajoute des élément sur la pile (on empile) et ensuite on dépile les éléments un par un. Une pile est une file LIFO (first in first out), en clair les derniers éléments insérés sont les premiers à sortir. En programmation, les piles sont notoirement utilisés dans les algorithmes récursifs comme les appels imbriqués de fonctions.

PHP dispose de fonctions natives `array_push`, `array_pop`, `array_shift` et `array_unshift` dédiées à la manipulation des piles. Toutes ces fonctions prenent comme premier paramètre un tableau qui représente la pile et en argument(s) la (ou les) valeur(s) à ajouter ou extraire. Les fonctions push/pop travaillent à partir de la fin du tableau alors que les fonctions shift/unshift travaillent à partir du début.

    <?php

    // créer une pile
    $pile = new array();

    // ajouter 3 éléments
    array_push($pile, 1);
    array_push($pile, 2);
    array_push($pile, 3);

    // dépiler tous les éléments
    while ($element = array_pop($pile))
        echo $element; // affiche 3 puis 2 puis 1

__Note:__ En théorie, il n'est pas autorisé de modifier une pile pour, par exemple, insérer un élément en plein milieu. Beaucoup de langages, dont PHP, font le choix de laisser ce détail à l'appréciation du développeur. C'est donc à vous d'être rigoureux avec ce type de données. Si par contre vous souhaitez renforcer l'application de cette "règle", vous avez la classe native [SplStack](http://php.net/manual/fr/class.splstack.php).

### Liste liée

Une liste liée est une structure de données qui consiste en un groupe de noeuds qui, ensemble, représentent une séquence. Dans sa forme la plus simple, il s'agit d'une séquence dont les éléments possèdent une référence vers l'élément suivant dans la séquence. Les listes liées sont assez simple à modéliser en PHP à l'aide de tableaux à deux dimentions.

Les listes liées sont utiles notamment dans l'implémentation du patron de conception "chaîne de responsabilité" dans lequel un élément (le message) traverse une liste de fonctions, chaque fonction ayant la responsabilité de traiter le message et/ou de l'envoyer à sa voisine. De cette façon, il est inutile de boucler sur la chaine pour trouver qui est responsable de la prise en charge du message: il suffit de l'envoyer à la première fonction de la chaîne. Vous trouverez-ci dessus un exemple d'implémentation de ce patron à l'aide de tableaux dans la section [Patron chaine de responsabilité avec des tableaux](#).

    <?php

    // pour chaque élément de la liste liée
    // l'index 0 représente la valeur et
    // l'index 1 la référence de l'élément suivant
    $liste_liee[0] = array(1, & $liste_liee[1]);
    $liste_liee[1] = array(2, & $liste_liee[2]);
    $liste_liee[2] = array(3, & $liste_liee[3]);
    $liste_liee[3] = array(4, & $liste_liee[4]);
    $liste_liee[4] = array(5, null);

    $element = $liste_liee[0];

    do {
        echo $element[0]; // affiche 12345
    } while ($element = $element[1]);

Les listes liées sont plus contraignantes que les liste classiques mais présentent certains avantage. Par exemple le renversement d'un tableau prends non seulement de la mémoire mais nécéssite également au moins n/2 opérations d'écriture (où n est le nombre d'éléments dans le tableau) alors qu'une liste liée peut être inversée avec un algorithme linéaire sans nécéssiter de consommation mémoire ni d'écriture: on va simplement changer les pointeurs des noeuds de la liste.

    <?php

    // ... en reprennant l'exemple précédent

    $taille = count($liste_liee);
    for ($i=$taille-1; $i>=0; $i--) {
        unset($liste_liee[$i][1]);
        if ($i)
            $liste_liee[$i][1] = & $liste_liee[$i-1];
        else
            $liste_liee[$i][1] = null;
    }

    $element = end($liste_liee); // l'élement de départ est maintenant à la fin du tableau

    do {
        echo $element[0]; // affiche 54321
    } while ($element = $element[1]);

On remarquera l'usage de `unset` qui sert à détruire la référence sans détruire la valeur référencée. Sans `unset`, le fait de changer le pointeur de position modifie le tableau et casse la liste liée (essayez si vous voulez, enlevez le `unset` et regardez la tête de votre liste liée ensuite). Pour plus d'information, je vous recommande [le manuel des références en PHP](http://www.php.net/manual/fr/language.references.unset.php).

L'avantage principal des liste liées c'est que l'ordre des éléments dans le tableau n'a aucune importance, ce qui importe c'est la liaison entre les noeuds. On peut également créer très simplement des listes bouclés en faisant pointer le dernier noeud sur le premier, nous verrons comment dans la section [itération infinie](#).

### Liste doublement liée

Les listes doublement liées sont des listes liées dont les éléments connaissent à la fois l'élément précédent et l'élément suivant dans la séquence, rendant inutile l'algorithme de renversement ci-dessus. Elles sont très utile pour créer des listes liées modifiables car il suffit de changer le pointage de deux noeuds voisins du noeud à insérer pour ajouter un nouveau noeud n'importe où dans la chaine.

    <?php

    // pour chaque noeud
    // [0] représente la valeur
    // [1] représente l'élément précédent
    // [2] représente l'élément suivant
    $liste[0] = array(1, null,        & $liste[1]);
    $liste[1] = array(2, & $liste[0], & $liste[2]);
    $liste[2] = array(3, & $liste[1], & $liste[3]);
    $liste[3] = array(4, & $liste[2], & $liste[4]);
    $liste[4] = array(5, & $liste[3], null       );

    // itération du premier au dernier
    $element = $liste[0];
    do {
        echo $element[0]; // affiche 12345
    } while ($element = $element[2]);

    // itération du dernier au premier
    $element = $liste[4];
    do {
        echo $element[0]; // affiche 54321
    } while ($element = $element[1]);

Ajoutons maintenant un élément au milieu (entre les 3ème et 4ème noeuds).

    <?php

    // ... en reprennant l'exemple précédent

    unset($liste[2][2]);
    unset($liste[3][1]);

    $liste[5] = array(3.5, & $liste[2], & $liste[3]);
    $liste[2][2] = & $liste[5];
    $liste[3][1] = & $liste[5];

    // itération du premier au dernier
    $element = $liste[0];
    do {

        echo $element[0]; // affiche 1233.545

    } while ($element = $element[2]);

    // itération du dernier au premier
    $element = $liste[4];
    do {

        echo $element[0]; // affiche 5433.521

    } while ($element = $element[1]);

Encore une fois, la position des noeuds dans la liste n'a aucune importance, ce qui importe ce sont les liaisons entre les noeuds.

## Parcours

Nous allons voir ici quelques méthodes pour traverser (ou parcourir) un tableau. Sachez que le choix d'une méthode de parcours peut avoir un impact significatif sur les performances de votre script, veillez à choisir la bonne méthode en fonction de votre besoin, de la taille de votre tableau.

### Trouver une valeur

Trouver la position d'un élément dans un tableau ou tout simplement détecter la présence d'une valeur à toujours été crucial dans beaucoup de langages. La façon la plus intuitive de procéder est de parcourir le tableau à la recherche de notre valeur.

    <?php

    $recherche = 5;
    $trouve    = false;

    foreach ($tableau as $valeur) {
        if ($valeur === $recherche) {
            $trouve = true;
            break;
        }
    }

On admettra que ça fait beaucoup de lignes pour pas grand chose. Heureusement, PHP propose des fonctions natives dédiées à la recherche.

    <?php

    $recherche = 5;
    $position  = array_search($recherche, $tableau)

    if ($position !== false)
        echo "L'élément $recherche est à la position $position";

`array_search` est très pratique pour déterminer si une valeur est présente mais elle ne donne que la position de la première occurence de `$recherche` dans `$tableau`. Si on veut obtenir toutes les positions, il existe une forme de la fonction `array_keys` qui permet de faire une recherche.

    <?php

    $recherche = 5;
    $positions = array_keys($tableau, $recherche);

    if ($positions)
        echo "L'élément $recherche est aux positions " . implode(',', $positions);

Cette fois, tous les index / clés qui pointent vers la valeur `$recherche` dans `$tableau` sont renvoyées. Cette fonction est également très utile pour savoir combien de fois une valeur est contenue dans un tableau en comptant simplement le nombre de clés renvoyées.

Si votre but est uniquement de savoir si une valeur est présente dans un tableau mais que vous n'avez pas besoin de savoir à quelle position, vous pouvez utiliser `in_array` qui est plus rapide que `array_search`.

    <?php

    $recherche = 5;

    if (in_array($recherche, $tableau))
        echo "L'élément $recherche est présent";

### Itération

La façon la plus simple et la plus répandue de traverser un tableau c'est encore la bonne vieille boucle. Les structures de contrôle `for`, `foreach` et `while` sont parfaites pour cet usage.

    <?php

    $tableau = range(1,10);

    // le bon vieux for
    for ($i=0; $i<1000; $i++)
        echo $tableau[$i];

    // le foreach que j'affectionne
    // tout particulièrement
    foreach ($tableau as $valeur)
        echo $valeur;

    // le while permet une itération
    // "manuelle"
    reset($tableau);
    while ($valeur = current($tableau)) {
        echo $valeur;
        next($tableau);
    }

Pour itérer un tableau indexé alphanumériquement, c'est plus ou moins la même chose.

    <?php

    $tableau = array('a' => 1, 'b' => 2, 'c' => 3);

    // cette syntaxe n'est ni pratique ni lisible...
    for (reset($tableau); key($tableau) !== null; next($tableau))
        echo key($tableau) . ' = ' . current($tableau);

    // ...surtout par rapport à son équivalent foreach
    foreach ($tableau as $cle => $valeur)
        echo "$cle = $valeur";

    // le while est assez simple lui aussi
    reset($tableau);
    while (list($cle, $valeur) = each($tableau))
        echo "$cle = $valeur";

De la même façon que PHP conserve une variable incrémentale pour l'attribution automatique des clés numériques (voir plus haut), PHP conserve également en mémoire l'index courant du tableau. Les fonctions `next` ou `prev` permettent de manipuler cet index courant respectivement pour l'avancer ou le reculer. Les fonction `current` ou `key` permettent de lire respectivement la valeur et la clé pour l'index courant. Dans tous les cas, si le tableau est vide ou qu'on à dépassé le dernier (ou le premier) élément, ces fonctions renvoient `false` ou `null`.

Vous avez probablement remarqué que j'utilise reset avec `for` et `while` mais pas avec `foreach`, c'est tout simplement parce que ce dernier le fait automatiquement mais attention, une fois sorti du foreach, le pointeur interne du tableau est toujours à la fin !

__Note:__ la structure de contrôle `foreach` est de loin la plus pratique à utiliser car elle peut traverser indifférement les tableaux `array` classiques __et__ les objets qui réalisent l'interface `Traversable` et/ou `Iterator`.

Il y existe également plusieurs moyens de traverser un tableau sans utiliser un une structure de contrôle, PHP dispose de fonctions pour exécuter une fonction de rappel tout en traversant un tableau, c'est notament le cas de `array_walk` et `array_map`.

    <?php

    $tableau = array(1,2,3,4,5);

    array_walk($tableau, function (& $valeur, $cle) {

        echo "$cle = $valeur";

    });

    array_map(function ($valeur) {

        echo $valeur;

    }, $tableau);

Contrairement à ce que cet exemple suggère, ces deux fonctions sont radicalement différentes. Le but avoué de `array_walk` est de fournir un moyen commode de parcourir un tableau en appellant une fonction de rappel sur chaque paire clé / valeur (la valeur est d'ailleurs passée en référence - pratique pour les modifications).

`array_walk` est assez proche d'une structure de contrôle dans ce sens qu'elle ne renvoie rien contrairement à `array_map` qui (comme son nom l'indique) sert à effectuer des relation entre plusieurs tableaux. En fait, `array_map` peut itérer sur plusieurs tableaux en même temps et elle fournira à la fonction de rappel autant de paramètre qu'il y a de tableau. Chacun de ces paramètres représentera l'élément courant de chaque tableau lors de l'itération. A noter également que `array_map` renvoie un tableau constitué des retours successifs de la fonction de rappel.

Comme je sens que c'est un peu complexe à comprendre, voici un exemple simple:

    <?php

    $nombres         = array(1,2,3,4,5); // les nombres
    $multiplicateurs = array(1,2,2,3,3); // leurs multiplicateurs

    function multiplier ($n, $m) { return $n * $m; }

    $nombres_multiplies = array_map('multiplier', $nombres, $multiplier);

    var_dump( $nombres_multiplies ); // affiche [1,4,6,12,15]

En somme, `array_walk` est un bon moyen pour modifier directement un tableau alors que `array_map` est plus utile pour convertir un tableau et en renvoyer un nouveau tout en préservant l'original.

Un autre moyen d'itérer horizontalement un tableau sans utiliser de structure de contrôle est de se servir d'une fonction récursive de la manière suivante:

    <?php

    function iterer ($tableau) {
        if (key($tableau) === null)
            return;

        echo current($tableau);
        next($tableau) && iterer($tableau);
    }

    iterer(array(1,2,3,4,5)); // affiche 12345

L'invonvénient de ne pas utiliser les structures de contrôle est l'impossibilité d'utiliser le mot clé `break` pour sortir de la "boucle" (bien qu'en réalité dans l'exemple précédent, un simple `return` fait l'affaire, ce n'est pas toujours le cas), vous serez obligé de continuer l'itération jusqu'a la fin. Itérer au moyen d'une closure ou d'une fonction peut être très pratique notamment quand on utilise la délégation mais faites attention aux performances et gardez à l'esprit que les structures de contrôle sont plus rapides que les appels de fonction.

### Itération inversée

Itérer un tableau à partir de la fin n'est pas aussi simple. On peut bien entendu construire notre tableau en ajoutant des éléments au début de celui-ci avec `array_unshift` puis le traverser normalement mais ce n'est pas forcément très pratique à maintenir car c'est contraire à la logique conventionnelle de manipulation des séquences.

Une solution simple pour traverser un tableau de la fin au début est de retourner le tableau avec `array_reverse`.

    <?php

    $tableau = array(1,2,3,4,5);

    foreach (array_reverse($tableau) as $valeur)
        echo $valeur; // affiche 54321

Mais c'est consommateur en temps et en mémoire, surtout avec les gros tableaux, car `array_reverse` effectue déjà une itération. C'est donc une solution acceptable uniquement avec des tableaux légers.

Pour les tableaux plus lourds, le moyen le plus simple est de se positionner à la fin avec `end` et de déplacer l'index interne avec `prev`.

    <?php

    $tableau = array(1,2,3,4,5);

    end($tableau);
    do {
        echo current($tableau); // affiche 54321
    } while (prev($tableau) !== false);

Mais si votre tableau contiend `false`, l'itération s'arrêtera dessus. Vous pouvez éventuellement contourner ce problème en filtrant le tableau avant usage.

Si votre tableau est indexé numériquement et que les index sont continus, alors vous pouvez évidement vous servir aussi d'un simple `for`.

    <?php

    $tableau = array(1,2,3,4,5);
    $taille = count($tableau);

    for ($i=$taille-1; $i>=0; $i--)
        echo $tableau[$i]; // affiche 54321

### Récursivité

La récursivité est un processus fonctionnel qui s'utilise lui même. Plus simplement, il s'agit en général d'une fonction qui s'appelle elle-même, formant ainsi une "cascade" d'appels. La récursivité est notoirement utilisée pour traverser des structures dont on ne connait pas à priori la profondeur comme les arbres XML par exemple.

Il faut être particulièrement vigilant en utilisant la récursivité et ce avec n'importe quel langage car si la condition mise en place pour sortir de la boucle échoue, la fonction continuera à s'invoquer elle-même jusqu'au plantage du programme.

En PHP, une fonction ne peut pas s'appeller elle-même plus de 100 fois sous peine d'émettre une erreur fatale de type _"Maximum function nesting level of '100' reached, aborting!"_. Rassurez vous, il s'agit d'une limite de sécurité et je n'ai jusqu'ici jamais rencontré un cas où cette limitation posait problème pour parcourir une structure.

Un bon moyen d'illustrer simplement la récursivité est de créer une fonction permettant d'afficher le contenu d'un tableau.

    $tableau = array(
        array(
            array(
                1,
                2,
            ),
            3,
        ),
        4,
        5
    );

    function explorer_tableau ($tableau) {
        foreach ($tableau as $key => $value) {
            if (is_scalar($value))
                echo $value;
            elseif (is_array($value))
                explorer_tableau($value);
            else
                echo "objet/ressource";
        }
    }

    explorer_tableau($tableau); // affiche 12345

PHP dispose également de fonctions qui permettent de parcourir un tableau récursivement. Nous avons vu précédement comment parcourir une séquence avec `array_walk` à l'aide d'une fonction de rappel, cette fonction existe également en mode récursif et s'appelle très justement `array_walk_recursive`.

    $tableau = array(
        array(
            array(
                1,
                2,
            ),
            3,
        ),
        4,
        5
    );

    array_walk_recursive($tableau, function ($valeur) {
        echo $valeur; // affiche 12345
    });

### Itération infinie

L'itération infinie est un processus qui, comme son nom l'indique, continue l'itération jusqu'a ce que celle-ci soit manuellement stoppée. On a vu précédement avec les listes liées qu'une liste peut être circulaire (quand le dernier élément pointe sur le premier). On peut donc par exemple incrémenter les valeurs d'une liste liée jusqu'à ce qu'un élement (n'importe lequel) soit égal à 25.

    <?php

    // crééons une liste doublement liée
    // circulaire

    $liste[0] = array(1, & $liste[4], & $liste[1]);
    $liste[1] = array(2, & $liste[0], & $liste[2]);
    $liste[2] = array(3, & $liste[1], & $liste[3]);
    $liste[3] = array(4, & $liste[2], & $liste[4]);
    $liste[4] = array(5, & $liste[3], & $liste[0]);

    $element = $liste[0];

    // incrémentons toutes les valeurs
    // jusqu'à ce qu'une d'entre elles
    // soit à 25

    do {

        if (++$element[0] >= 25)
            break;

    } while ($element = & $element[2]);

    // parcourons maintenant notre liste
    // pour afficher ses valeurs

    foreach ($liste as $element)
        echo $element[0]; // affiche 2522202324

On remarque que la condition du `while` est une affectation par référence car, vu qu'on modifie l'élément, il faut éviter d'obtenir une copie sinon c'est cette copie qui est modifiée et non la liste elle-même donc ça boucle à l'infini.

Les cas d'utilisation d'une itération _vraiment_ infinie sont peu répandus en PHP. Un usage possible est un script qui ne s'arrête jamais (un daemon par exemple) dont le rôle est de surveiller activement les mises à jour de plusieurs ressources, ces ressources peuvent être définies au moyen d'une liste liée comme dans l'exemple ci-dessus et l'itération s'arrête quand une de ces ressources (ou toutes, pourquoi pas) atteint un état donné.

## Manipulation

Disposer d'une séquence pour stocker un nombre théoriquement infini de valeur avec une seule référence c'est bien. Pouvoir manipuler cette séquence c'est mieux. Dans ce chapitre nous allons voir ensemble quelques exemples de manipulations des tableaux en PHP.

Rappellez-vous toujours qu'il vaut mieux utiliser une des nombreuses fonction PHP de manipulation des tableaux plutôt que de créer un algorithme vous même: __vous n'irez jamais plus vite que les fonctions natives !__

### Tri

Le tri des tableaux est un sujet passionnant en algorithmie, il n'est donc pas étonnant que de nombreux algorithmes aient vu le jour très tôt: le [quick sort](http://en.wikipedia.org/wiki/Quicksort), le [bubble sort](http://en.wikipedia.org/wiki/Bubble_sort), le [heap sort](http://en.wikipedia.org/wiki/Heap_sort) ou même le débile [bogo sort](http://en.wikipedia.org/wiki/Bogo_sort) parmi [baucoup d'autres](http://fr.wikipedia.org/wiki/Algorithme_de_tri).

Chaque algorithme à ses forces et faiblesses, certains s'attachent davantage à économiser le nombres de cycles requis, d'autes à minimiser la consommation mémoire lors du tri, d'autre encore sont adaptés à des cas très spécifiques. L'objet de cet article n'étant pas de faire un cours d'algorithmie, je vous recommande de suivre les liens ci-dessus si vous souhaitez en savoir plus et implémenter vous-même l'un de ces algos.

PHP vous fournir nativement de nombreuses fonctions pour trier un tableau:

- [sort](http://www.php.net/manual/en/function.sort.php) effectue le tri du tableau en utilisant un quick sort
- [rsort](http://www.php.net/manual/en/function.rsort.php) (se lit _reverse sort_) pareil que sort mais l'ordre est nversé
- [usort](http://www.php.net/manual/en/function.usort.php) (se lit _user sort_) effectue le tri du tableau en tilisant une fonction de rappel utilisateur
- [asort](http://www.php.net/manual/en/function.asort.php) (se lit _associative sort_) est pareil que sort mais réserve les clés
- [arsort](http://www.php.net/manual/en/function.arsort.php) (se lit _associative reverse sort_) est pareil que asort ais l'ordre est inversé
- [uasort](http://www.php.net/manual/en/function.uasort.php) (se lit _user associative sort_) est pareil que usort ais préserve les clés
- [ksort](http://www.php.net/manual/en/function.ksort.php) (se lit _key sort_) effectue le tri du tableau en tilisant ses clés au lieu de ses valeurs
- [krsort](http://www.php.net/manual/en/function.krsort.php) (se lit _key reverse sort_) pareil que ksort mais 'ordre est inversé
- [uksort](http://www.php.net/manual/en/function.uksort.php) (se lit _user key sort_) effectue le tri des clés en tilisant une fonction de rappel utilisateur
- [natsort](http://www.php.net/manual/en/function.natsort.php) (se lit _natural order sort_) effectue le tri en tilisant l'algorithme d'ordre naturel (pratique pour trier des chaînes)
- [natcasesort](http://www.php.net/manual/en/function.natcasesort.php) (se lit _natural order case insensitive sort_) areil que natsort mais la casse est ignorée
- [array_multisort](http://www.php.net/manual/en/function.array-multisort.php) effectue le tri de plusieurs tableaux u de tableaux multi-dimentionnels

Ces fonctions ont toutes en commun d'utiliser la référence du tableau et de renvoyer un booléen pour décrire si le tri à réussi. Vous trouverez un résumé sur [la page de résumé des fonctions de tri](http://www.php.net/manual/en/array.sorting.php).

Comme leur usage est assez basique (on passe le tableau et c'est tout pour la plupart), je vais seulement vous montrer un exemple de tri à l'aide d'une fonction de rappel.

    <?php

    $animaux = array(
        'éléphant', 'poney', 'coq', 'poule', 'cochon', 'dindon',
        'vache', 'taureau', 'mouton', 'boeuf', 'canard', 'cerf',
        'cheval', 'ornithorynque', 'paresseux', 'guépard', 'lion',
        'panda', 'ours', 'singe', 'ver', 'fourmi', 'cafard', 'pie',
        'phacochère', 'gnou', 'buffle', 'bizon', 'aigle', 'pivert',
        'diable de tasmanie', 'lapin', 'putois', 'Justin Bieber',
    );

    // trions le tableau par ordre
    // de longueur de chaine

    usort($animaux, function ($gauche, $droite) {
        $gauche = strlen($gauche);
        $droite = strlen($droite);

        if ($gauche == $droite)
            return 0;

        if ($gauche > $droite)
            return 1;

        if ($gauche < $droite)
            return -1;
    });

    foreach ($animaux as $animal)
        echo $animal . '<br />';

Comme on vient de le voir, la fonction de rappel compare deux entrées du tableau et renvoie 0 si les deux parties sont égales, 1 si la gauche est supérieure à la droite et -1 dans le cas contraire. En utilisant une fonction de rappel vous pouvez implémenter n'importe quel type de tri comme par exemple un tri d'objets.

### Mélange

Le mélange est l'exact inverse du tri, PHP dispose nativement de la fonction `shuffle` qui de surcroit préserve les clés du tableau.

Une illustration intéressante est le mélange d'un paquet de cartes.

    <?php

    function creer_jeu_de_cartes () {
        foreach (array('Coeur', 'Carreau', 'Trefle', 'Pique') as $couleur) {
            for ($numero = 1; $numero <= 10; $numero++)
                $cartes[] = "$numero de $couleur";

            $cartes[] = "Valet de $couleur";
            $cartes[] = "Dame de $couleur";
            $cartes[] = "Roi de $couleur";
            $cartes[] = "As de $couleur";
        }
        return $cartes;
    }

    function piocher (& $cartes, $nombre = 1) {
        for ($i=0; $i<$nombre; $i++)
            $pioche[] = array_pop($cartes);
        return $pioche;
    }

    $jeu = creer_jeu_de_cartes();

    // mélanger le jeu de cartes
    shuffle($jeu);

    echo "Main du joueur 1 : " . implode(',', piocher($jeu, 5)) . '<br />';
    echo "Main du joueur 2 : " . implode(',', piocher($jeu, 5)) . '<br />';
    echo "Cartes restantes dans la pile : " . count($jeu);

### Rembourrage

Le rembourrage (ou _padding_ en anglais) est une technique qui permet de compléter un tableau. C'est surtout pratique lorsqu'il s'agit de compléter des dictionnaires.

Le rembourrage utilise l'opérateur `+` sur les tableaux. C'est un usage relativement méconnu de cet opérateur malgré la puissance qu'il apporte. Pour faire simple, le résultat de l'opération "tableau A + tableau B" est l'ensemble des paires clés / valeurs du tableau A plus celles du tableau B dont les clés n'existe pas dans A.

C'est beaucoup plus parlant avec un exemple:

    <?php

       $valeurs_obtenues   = array('a' => 1,           'c' => 3, 'd' => 4);
    // +
       $valeurs_par_defaut = array('a' => 5, 'b' => 6, 'c' => 7          );
    // --------------------------------------------------------------------
    // =                           'a' => 1, 'b' => 6, 'c' => 3, 'd' => 4

    // voyez vous même:

    var_dump( $valeurs_obtenues + $valeurs_par_defaut );

Attention, le résultat produit par `var_dump` montre que la clé `b` est la dernière du tableau et non celle qui se trouve entre `a` et `b`. Mais ce n'est pas vraiment gênant car il s'agit ici d'un dictionnaire et que donc l'ordre des clés n'a pas vraiment d'importance et de toute façon et si vous voulez tout de même réordoner les clés, vous pouvez le faire avec `ksort`.

Exemple concrêt avec une classe Log qui peut recevoir un tableau de configuration sur son constructeur:

    <?php

    class Log {

        protected $_config;
        protected $_file;

        public function __construct ($file, array $config = array()) {
            $this->_file = new SplFileObject($file);

            $this->_config = $config + array(
                // préfixe ajouté sur toutes les traces de log
                'prefix' => '',

                // format d'une trace de log ([date] niveau : message)
                'format' => '[%s] %s : %s',

                // format des dates
                'date-fromat' => 'r';

                // quels niveaux sont pris en charge (regexp)
                'hanlde' => '.*',
            );
        }

        public function add ($level, $message) {
            if (!preg_match("~{$this->_config['handle']}~", $level))
                return false;

            $message = sprintf(
                $this->_config['format'],
                date($this->_config['date-format']),
                $level,
                $message
            );

            return $this->_file->fwrite("{$this->_config['prefix']}{message}\n");
        }
    }

On peut créer une nouvelle instance sans devoir spécifier tous les paramètres du tableau `$config`. Par exemple, on peut instancier un log qui ne prends en charge que les messages d'erreur mais dont les autres paramètres de configuration sont ceux par défault.

    <?php

    $log = new Log('error.log', array('handle' => 'error'));

Il est souvent pratique de recourrir à des tableaux pour remplacer les paramètres d'un prototype et ce pour 2 raisons majeures:

- les tableaux sont passés par défaut par référence aux fonctions alors que les scalaires sont passés par copie, c'est donc une charge mémoire moindre sur la pile
- vous pouvez ajouter autant de paramètre que vous voulez sans altérer le prototype de la fonction et ainsi préserver la compatibilité ascendante de votre interface

Dans l'exemple ci-dessous, on pourrait permettre de passer un nouveau paramètre `ignore-repeated-message` dans le tableau de config. Cette modification ne casserait pas la compatibilité avec des script utilisant l'ancienne version de la classe car le prototype du constructeur resterait inchangé et les anciens paramètres toujours valides.

### Nettoyage

### Découpage

### Fonctions de rappel

## Conversion

### Objet vers tableau

### Tableau vers objet

### Tableau vers chaine

### Chaîne vers tableau

### Tableau vers booléen

### Tableau vers entier

### Tableau vers <tout>

## Aller Plus loin

### La syntaxe courte

### Manipuler la table des symboles

### Patron chaine de responsabilité avec des tableaux

Le patron chaîne de responsabilité est un patron de conception qui consiste en une séquence de traitements organisée de telle sorte que lorsqu'un traitement reçoit un message, il peut prendre la décision de le traiter et/ou de le passer à son voisin. Ce genre de patron est utilisé par exemple dans les mécaniques de journalisation afin d'implémenter des méthodes d'enregistrement des message différents en fonction du type de message ou du contexte.

Nous allons nous servir d'une liste liée pour implémenter une chaine de responsabilité simple: on lui donne un entier, et elle répondra si elle est multiple de 3, 2 ou 1.

    <?php

    $chaine[0] = array(function ($n, $noeud) {
        // ne traite que les multiples de 3
        if ($n % 3 === 0) echo "multiple de 3 !";
        else call_user_func($noeud[1][0], $n, $noeud[1]);
    }, & $chaine[1]);

    $chaine[1] = array(function ($n, $noeud) {
        // ne traite que les multiples de 2
        if ($n % 2 === 0) echo "multiple de 2 !";
        else call_user_func($noeud[1][0], $n, $noeud[1]);
    }, & $chaine[2]);

    $chaine[2] = array(function ($n, $noeud) {
        // jusqu'a preuve du contraire,
        // tous les nombres entiers sont
        // multiples de 1
        echo "multiple de 1 !";
    }, null);

    // envoyons un message dans la chaine
    $element = $chaine[0];

    $element[0](66, $element); // affiche "multiple de 3 !"
    $element[0](20, $element); // affiche "multiple de 2 !"
    $element[0](11, $element); // affiche "multiple de 1 !"

Comme on peut le voir, c'est une application directe des capacités des listes liées. La seule nuance c'est qu'on passe l'élément de début à la première fonction appellée afin qu'elle puisse à son tour appeller les suivantes.

L'avantage de ce patron c'est qu'on peut à tout moment ajouter un nouveau comportement en début comme en fin de chaine.

    <?php

    // ... en reprennant l'exemple précédent

    // ajoutons une fonction supplémentaire en début de chaine
    $chaine[3] = array(function ($n, $noeud) {
        // ne traite que les multiples de 4
        if ($n % 4 === 0) echo "multiple de 4 !";
        else call_user_func($noeud[1][0], $n, $noeud[1]);
    }, & $chaine[0]);

    // le nouveau "début" de chaine devient
    // $chaine[3] car il pointe sur $chaine[0]
    $element = $chaine[3];

    $element[0](66, $element); // affiche "multiple de 3 !"
    $element[0](20, $element); // affiche "multiple de 4 !"
    $element[0](11, $element); // affiche "multiple de 1 !"

### Arbres

### Arbres binaires

### Abres pondérés

### Graphes

## Conclusion
