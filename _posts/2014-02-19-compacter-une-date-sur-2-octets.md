---
layout: post
type: article
title: Compacter une date sur 2 octets
date: 2014-02-19
category: php
tags: php token pack unpack date octet
---

J'espère que vous vous êtes bien amusés avec les concepts décrits dans mon article [bien plus qu'un simple jeton](http://bdelespierre.fr/article/bien-plus-quun-simple-jeton/), si vous ne l'avez pas encore lu c'est l'occasion de le découvrir. Je souhaitais cependant revenir sur le point de l'encodage de la date. Comme montré, on procède à une compression de la date afin de réduire son empreinte sur la taille du jeton. D'une date en chaîne sur plusieurs octets on passe à une chaîne binaire de seulement 2 octets. Cet article va vous expliquer plus en détail ce qui se passe dans les fonctions date16\_encode et date16\_decode ce qui nous permettra également d'aborder quelques uns des aspects de la manipulation de bits en PHP. Nous somme encore une fois sur la plateforme PHP mais ces concepts sont aussi applicables à d'autres langages (les opérateurs sont d'ailleurs les même à peu près partout).

Je partirai ici du principe que vous ne connaissez rien au binaire et aux opérations binaires.

## Pourquoi 2 octets ?

On se place dans le cas suivant: j'ai besoin de stocker une date (sans les heures, minutes, et secondes) sur la plus petite longueur de bits possible. On choisis donc de ne conserver que les éléments suivants:

+ Année de 00 à 99
+ Mois de 1 à 12
+ Jour de 1 à 31

La question qu'il faut alors se poser c'est combien de bits me faut-il pour chaque élément ? C'est assez simple à déterminer quand on sait compter en binaire. Je vous épargne volontairement l'explication mathématique pour passer d'une base décimale (10) à une base binaire (2) et je vous donne une règle de calcul simplissime. Prennons par exemple le nombre 42, sa représentation en binaire (sur 8 bits) est:

	0 0	1 0 1 0 1 0 = 42
	| | | | | | | |
	| | | | | | | +-- 2^0 = 1
	| | | | | | +---- 2^1 = 2
	| | | | | +------ 2^2 = 4
	| | | | +-------- 2^3 = 8
	| | | +---------- 2^4 = 16
	| | +------------ 2^5 = 32
	| +-------------- 2^6 = 64
	+---------------- 2^7 = 128

Car, décomposé en puissances de 2, 42 = 2^5 + 2^3 + 2^1 soit 32 + 8 + 2 (comme montré ci-dessus). En fait pour passer du binaire à la base 10 et vice versa, écrivez sur une feuille les puissances de 2 en partant de la droite (c'est facile ça double à chaque fois) puis placez vos 1 et vos 0 dessous (toujours en partant de la droite) et additionnez partout où il y a des 1. C'est aussi simple que ça.

Une autre règle intéressante c'est que la valeur maximale d'un entier sur N bits est 2^(N)-1. Par exemple, la valeur maximale qu'on peut faire tenir sur 4 bits c'est 2^4 -1 = 15. Démonstration sur 8 bits:

	0 0 0 0 1 1 1 1 = 15 (1+2+4+8)
	0 0 0 1 0 0 0 0 = 16 (2^4)

Donc combien faut-il de bits pour faire tenir les jours, mois et années ?

	Années [0~99]: 7 bits (de 0 à 127): 0 1 1 0 0 0 1 1 = 99
	Mois   [1~12]: 4 bits (de 0 à 15):  0 0 0 0 1 1 0 0 = 12
	Jours  [1~31]: 5 bits (de 0 à 31):  0 0 0 1 1 1 1 1 = 31

Donc au total, il nous faudra pile 16 bits pour faire tenir ces trois éléments (7 + 4 + 5). Ce qui nous fait pile-poil 2 octets (1 octet = 8 bits), ça tombe bien, c'est la taille d'un entier court signé. Puisqu'on est curieux, on peut d'ailleur calculer la valeur max que cet entier peut avoir:

	Années 1 1 0 0 0 1 1  0 0 0 0  0 0 0 0 0 = 50688
	Mois   0 0 0 0 0 0 0  1 1 0 0  0 0 0 0 0 = 384
	Jours  0 0 0 0 0 0 0  0 0 0 0  1 1 1 1 1 = 31
	----------------------------------------
	Total  1 1 0 0 0 1 1  1 1 0 0  1 1 1 1 1 = 51103

## Encoder la date sur 16 bits

Bon maintenant qu'on sait tout ça, comment construire le bitfield (séquence binaire) à partir de ces 3 valeurs ? Vous avez remarqué dans l'exemple ci-dessus que j'ai réparti mes 16 bits de la façon suivante: 7 bits pour l'année, 4 bits pour le mois, 5 bits pour le jour.

Il s'agit donc de décaler les 7 bits de l'année de 9 bits vers la gauche, les 4 bits du mois de 5 bits vers la gauche, et les bits du jours restent où ils sont. Dans la plupart des langages (dont PHP), l'opérateur de décalage de bits vers la gauche c'est A << B où A sont mes bits à décaller et B le nombre de bits du décallage.

{% highlight php linenos %}
<?php
// les nombres sont volontairement fournis en notation binaire
echo (0b01100011 << 9) . "\n"; // 50688
echo (0b00001100 << 5) . "\n"; // 384
echo  0b00011111       . "\n"; // 31
?>
{% endhighlight %}

Afin d'être sûr qu'on n'écrit pas n'importe où (avec une valeur qui serait trop longue - par exemple si par erreur on inversait les mois et le jours - on va restreindre nos valeur sur leur longueur de bits maximale.

On utilise pour cela l'opérateur & (AND binaire, à ne pas confondre avec l'opérateur booléen &&). Ce opérateur positionnera chaque bit de résultat à 1 si et seulement si le bit correspondant est à 1 des des deux cotés. Démonstation:

	  0 0 1 0 0 1 0 0 = 36 (débordement sur 6 bits)
	& 0 0 0 1 1 1 1 1 = 31
	----------------------
	= 0 0 0 0 0 1 0 0 = 4  (plus de déborderment)

On n'a pas besoin de s'occuper les bits à 0 devant le premier 1, ils seront ommis lors de la construction de la séquence binaire.

Ensuite, il ne nous reste qu'a les décaller et "additionner" le tout avec l'opéareur | (OR binaire, à ne pas confondre avec l'opérateur booléen ||):

	  0 0 0 1 1 1 0  0 0 0 0  0 0 0 0 0 = 14 << 9 (année)
	| 0 0 0 0 0 0 0  0 0 1 0  0 0 0 0 0 = 2  << 5 (mois)
	| 0 0 0 0 0 0 0  0 0 0 0  1 0 0 1 1 = 19      (jours)
	---------------------------------------------
	= 0 0 0 1 1 1 0  0 0 1 0  1 0 0 1 1 = 7251

Ce qui nous donne en PHP:

{% highlight php linenos %}
<?php
function date16_encode ($annee, $mois, $jour)
{
	$jour  &= 0b00011111; // ne garder que les 5 premiers bits
	$mois  &= 0b00001111; // ne garder que les 4 premiers bits
	$annee &= 0b01111111; // ne garder que les 7 premiers bits
	
	return ($annee << 9) | ($mois << 5) | $jour;
}

echo date16_encode(14, 2, 19); // 7251
?>
{% endhighlight %}

Et voilà, la représentation décimale de notre date (19/02/14) sur 16 bits est 7251. Dans les faits, on se fiche pas mal de la valeur numérique de notre bitfield, on ne peut d'ailleurs pas faire d'opération mathématiques dessus (par exemple pour décaller d'un mois). Ce qui nous intéresse c'est sa structure binaire.

## Décoder une date sur 16 bits

Pour décoder, on va faire exactement l'inverse: décaller les 3 séquences de bits vers la droite et leur appliquer un masque:

	     0 0 0 1 1 1 0 0 0 1 0 1 0 0 1 1
	>> 9 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 0
	   & 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1
	------------------------------------
	   = 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 0 = 14

		 0 0 0 1 1 1 0 0 0 1 0 1 0 0 1 1
	>> 5 0 0 0 0 0 0 0 0 1 1 1 0 0 0 1 0
	   & 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1
	------------------------------------
	   = 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 = 2

         0 0 0 1 1 1 0 0 0 1 0 1 0 0 1 1
       & 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1
    ------------------------------------
       = 0 0 0 0 0 0 0 0 0 0 0 1 0 0 1 1 = 19

La séquence de bits pour les jours est déjà à droite donc inutile de la décaler. En PHP ça nous donne:

{% highlight php linenos %}
<?php
$date = date16_encode(14, 2, 19);

function date16_decode ($date)
{
	$annee = ($date >> 9) & 0b01111111;
	$mois  = ($date >> 5) & 0b00001111;
	$jour  = ($date)      & 0b00011111;
	
	return [$annee, $mois, $jour];
}

list($y, $m, $d) = date16_decode($date);
echo "$y-$m-$d"; // affiche 14-2-19
?>
{% endhighlight %}

Je tiens au passage à rappeller que les opérations sur les bits sont HYPER rapides, aucun souci du coté des performances avec ces 2 fonctions.

## Conclusion

En PHP vous ne pouvez pas manipuler directement le type de données que vous utilisez. Même si nous avons réussi à générer une date sur 16 bits, celle-ci est toujours stockée sur 32 bits (ou 64 selon votre système) car PHP la traite comme un entier. C'est en revanche utile quand, comme dans l'article [Bien plus qu'un simple jeton](http://bdelespierre.fr/article/bien-plus-quun-simple-jeton/) vous insérez la donnée dans une chaine binaire avec [pack](), auquel cas vous devez connaître le binaire et les opération binaires pour l'utiliser efficacement.