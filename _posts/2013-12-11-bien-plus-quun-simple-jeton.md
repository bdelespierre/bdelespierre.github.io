---
layout: post
type: article
title: Bien plus qu'un simple jeton
date: 2013-12-11
category: php
tags: [php, token, pack, unpack, jeton, sécurité, web, programmation, développement]
description: Apprennez à générer des jetons uniques, non-aléatoires et porteurs d'information simplement et efficacement avec PHP
related:
- title: Compacter une date sur 2 octets
  url: compacter-une-date-sur-2-octets
---

Il est souvent utile de générer des jetons (ou _token_ en anglais) afin de sécuriser une action utilisateur, par exemple pour un mail de réinitialisation de mot de passe, s'assurer qu'un formulaire est bien soumis par la même personne que celle qui l'a demandé, ou encore pour identifier un utilisateur à l'aide d'un cookie. Nous allons voir ensemble comment générer un jeton non-aléatoire et unique qui en plus pourra contenir des données intéressantes pour notre application. Les exemples de code fournis sont en langage PHP mais ces concepts sont applicables à n'importe quel langage.

## Choisir ses données

Le jeton que nous allons générer devra répondre aux trois critères suivants:

+ il doit être unique pour un utilisateur et une action données à une date (jour) donné
+ il doit être court (pas plus de 16 caractères)
+ il doit pouvoir être mis dans un paramètre de l'URL

Nous allons suivre le scénario suivant: _je suis un utilisateur ayant oublié mon mot de passe et je viens de cliquer sur le boutton "réinitialiser mon mot de passe" depuis la page d'authentification, j'ai saisi mon email et j'attends l'envoi de l'email qui contiendra le lien permettant de saisir un nouveau mot depasse_.

Nous partirons de l'hypothèse que les adresses email sont identifiantes dans notre modèle (à une adresse email correspond un et un seul utilisateur). L'utilisateur ayant saisi son email et soumis le formulaire, nous disposons donc d'un objet User disposant des propriétés suivantes:

+ id
+ nom
+ prénom
+ email
+ mot de passe crypté

Par convention, nous allons définir l'identifiant de l'action "réinitialisation de mot de passe" à 4 soit 0b100 en binaire. Personnellement, j'ai tendance à utiliser des bitfields (champs de bits) pour mes codes actions car cela permet de passer plusieurs actions sur une seule valeur tout en utilisant un type entier.

Nous allons donc partir avec le code suivant:

{% highlight php linenos %}
<?php

// nous vient d'une requête en base par exemple
$user = (object)array(
    'id'       => 123456,
    'name'     => 'Dupont',
    'surname'  => 'Roger',
    'email'    => 'roger.dupont@yopmail.com',
    'password' => 'f4ca703804ff37f3153ce168bd24f066'
);

// arbitraire
define('ACTION_RESET_PASSWORD', 4);
?>
{% endhighlight %}

## Construire la représentation binaire du jeton

Nous allons commencer par créer une structure binaire formattée comme suit:

    [identifiant utilisateur] [code action] [date du jour] [bits d'entropie]

L'email est un bon identifiant car il est unique dans notre modèle, mais il est un peu lourd car c'est un chaine de caractères. Par exemple, l'email _roger.dupont@yopmail.com_ fait 24 caractères donc au minimum 24 octets (soit 192 bits) alors que son id ne fait que 4 octets (32 bits) si c'est un entier non signé comme dans la plupar des cas. Pour la construction de notre jeton, il est important de garder les plus petites valeurs possibles en nombre de bits. On pourrait bien entendu générer une somme de hashage de l'email mais ce ne serait pas forcément unique, on choisira donc l'id pour identifier notre utilisateur (ça tombe bien, c'est à ça que ça sert).

On va également supposer que, n'ayant pas plus de 16 code actions différents, on peut encoder l'action sur 2 octets (16 bits). Dans la pratique, vous aurez rarement besoin de plus d'une dizaine de codes actions différents pour vos emails ou alors c'est que vous devriez utiliser du _identifiant action_ au lieu d'un _code action_ (en termes de terminologie, un code n'est pas supposé être identifiant).

La date va nous poser un problème car la réprésentation d'une date au format US (YYYY-MM-DD HH:II:SS) est un peu trop lourde: 19 octets (152 bits). Mais ce qui nous intéresse c'est uniquement le jour auquel l'action à été émise donc on peut réduire à YYMMDD ce qui nous permet d'encoder la date sur une valeur entière comprise entre 000101 et 991231 (de toute façon je doute que vous souhaitiez laisser courrir la validité de votre jeton jusqu'au siècle prochain). On utilisera la fonction `date16_encode` telle que décrite dans mon article [Compacter une date sur 2 octets](http://bdelespierre.fr/article/compacter-une-date-sur-2-octets/) pour passer de 19 à 2 octets (16 bits).

Par sécurité on va également rajouter quelques bits d'entropie, c'est à dire une séquence aléatoire de bits qui va nous servir à générer des jetons différents si l'utilisateur réinitialise plusieurs fois son mail dans la même journée. Avec 16 bits d'entropie pour un utilisateur donné, une action donnée et une date donnée, on a donc une chance sur 65535 de générer 2x le même jeton, c'est acceptable. Pour générer ces bits on va tout simplement se servir de la fonction `mt_rand` de PHP, elle va nous générer un entier de 32 bits aléatoire qu'on va réduire sur 16 bits.

Notre structure, en termes de bits, devrait donc avoir cette forme:

    [identifiant utilisateur] [code action] [date du jour] [bits d'entropie]
             32 bits             16 bits        16 bits         16 bits

Ce qui nous fait un total de 80 bits soit 10 octets. Si on avait encodé toutes ces informations délimitées par un séparateur sur une chaine de caractères sans se casser la tête, on se serait retrouvé avec une chaine de 48 caractères (384 octets) soit presque 5x plus pour la même information. De plus, il aurait été aisé d'en comprendre la structure ce qui n'est pas forcément une bonne chose en termes de sécurité alors qu'avec un bitfield binaire, vous seul connaissez la structure et savez comment déconstruire le bitfield, mais on y reviendra.

Pour rassembler toutes ces données dans un seul bitfield, nous allons nous servir de la fonction PHP [pack](http://php.net/pack). Cette fonction prends comme premier paramètre un format (la structure de notre champ de bits) et tous les paramètres suivants seront nos valeur. Elle se comporte un peu comme la fonction [date](http://php.net/manual/fr/function.date.php) en fait mais elle sert à générer du binaire.

Pack dispose d'un tas de codes pour le format mais nous allons uniquement nous servir de `I` et `S` (respectivement Int et Short pour entier non signé et entier court non signé). Conformément à la structure que nous voulons, notre format est donc `ISSS`. Référez-vous au manuel de la fonction pour les autre codes de formattage.

{% highlight php linenos %}
<?php

// en reprennant l'exemple précédent

// identifiant de l'utilisateur sous forme d'entier
$id = (int)$user->id;

// code de l'action effectuée
$code_action = (int)ACTION_RESET_PASSWORD;

// date du jour sous forme d'entier
$date = date16_encode(date('y'), date('m'), date('d'));

// nombre aléatoire pour l'entropie
$entropy = mt_rand();

// représentation binaire de notre jeton
$binary_token = pack('ISSS', $id, $code_action, $date, $entropy);
?>
{% endhighlight %}

En PHP il nous est impossible de spécifier la taille des structures qu'on utilise car le langage est faiblement typé. Tout ce qu'on peut faire c'est caster nos valeurs en entier avec `(int)$valeur` avant de les passer à la fonction pack. Vous pouvez ensuite contrôler avec `echo strlen($binary_token);` que le jeton binaire fait au maximum 10 caractères (ou 10 octets si vous préférez).

## Encodage du jeton

A ce stade, le jeton est sous forme binaire, il n'est pas exploitable en tant que tel. Vous pouvez vous en rendre compte en l'affichant avec `var_dump( $binary_token )` ce qui va afficher des caractères non reconnus. Cette représentation binaire reste valide et compréhensible par l'application mais on doit la mettre dans une URL donc nous allons devoir l'encoder.

Le plus simple est de se servir de la fonction [base64_encode](http://php.net/manual/en/function.base64-encode.php) qui va passer tous les octets de notre chaine en base 64, c'est à dire uniquement avec des caractères alphanumériques et quelques caractères spéciaux ce qui permet de les faire transiter sur un autre support sans perte d'information et sans se soucier de l'encodage. Si le processus mathématique de changement de base vous intéresse, je vous recommande d'aller voir sur [Wikipedia](http://fr.wikipedia.org/wiki/Base).

{% highlight php linenos %}
<?php

// représentation alphanumérique de notre jeton
$token = base64_encode(binary_token);
?>
{% endhighlight %}

Evidement, on passe les "caractères" de notre jeton d'une base 256 (un octet) à 64, il faut s'attendre à ce que la chaine produite par la fonction base64_encode soit plus longue que la représentation binaire de départ. On peut donc à nouveau vérifier la longueur du jeton avec `echo strlen($token);` pour constater cette fois que le jeton fait toujours 16 caractères.

L'un des problèmes de la fonction base64_encode c'est qu'elle génère des chaines contenant les caractères `+/=` qui vont nous gêner dans l'URL. Vous pouvez choisir d'encoder ces caractères avec [url_encode](http://www.php.net/urlencode) ou les remplacer par des caractères "inoffensifs" pour l'URL à l'aide des fonctions suivantes:

{% highlight php linenos %}
<?php

// voir: http://php.net/manual/en/function.base64-encode.php#103849

function base64url_encode($data) {
  return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
  return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

// créer une version URL-SAFE de notre jeton binaire
$urlsafe_token = base64url_encode($binary_token);
?>
{% endhighlight %}

__Note:__ si vous choisissez d'encoder avec base64url\_encode vous devrez bien sûr décoder avec base64url\_decode de l'autre coté.

A l'issue de cette procédure, vous vous retrouvez avec un token qui devrait reseembler à ça: `QOIBAAQAXLyeVg`, c'est plutôt court malgré toutes les informations qu'il renferme non ? Il ne vous reste qu'a mettre ce jeton dans le lien que vous enverrez par mail à votre utilisateur, par exemple:

{% highlight php linenos %}
<?php

// en reprennant l'exemple précédent

// lien vers la page de réinitialisation du mot de passe
$link = "http://mon.site.com/auth/reset?t=" . $urlsafe_token;

// en reprennant les exemples précédents
$message = <<< MSG
<p>
    Veuillez suivre ce lien pour réinitialiser votre mot de passe:<br />
    <br />
    <a href="$link">$link</a>
</p>
MSG;

mail(
    $user->email,
    'Réinitialisation de votre mot de passe',
    $message,
    'From: webmaster@mon.site.com' . "\r\n" .
    'ReplyTo: webmaster@mon.site.com' . "\r\n" .
    'Content-type: text/html; charset=utf-8' . "\r\n"
);
?>
{% endhighlight %}

## Décoder le jeton et extraire ses données

C'est là que ça devient vraiment intéressant: tout ce qu'on a fait plus haut est reversif, c'est à dire que vous allez pouvoir déconstruire le jeton pour récupérer les données qu'il contiens. Nous allons pour cela faire exactement le même cheminement mais à l'envers. On va pour cela se servir des fonction [base64_decode](http://www.php.net/base64_decode) (ou [base64url_decode](http://php.net/manual/en/function.base64-encode.php#103849) si vous aviez utilisé base64url_encode) et [unpack](http://www.php.net/manual/fr/function.unpack.php).

On va également utiliser la fonction `date16_decode` pour décoder notre date 16 bits (voir [Compacter une date sur 2 octets](http://bdelespierre.fr/article/compacter-une-date-sur-2-octets/)).

Unpack fonctionne différement de pack, vous devez mettre dans son premier paramètre un format qui contiendra les noms des variables à remplir précédées du type de la donné et les séparer par des slash (/). Nous avions encodé id + action + date + entropie avec le format __ISIS__, nous allons donc décoder avec le format __I__id/__S__code_action/__I__date/__S__entropy.

Unpack à également la désagréable habitude de lancer des warnings quand le bitfield à décoder ne correspond pas au format. Dans la mesure où on ne peut pas à priori contrôler le format du jeton avant de l'avoir décodé, on ne peut pas se prémunir contre cette erreur: il faut empêcher qu'elle survienne en préfixant l'appel d'unpack avec l'opérateur de désactivation d'erreur @ (je n'aime pas spécialement faire ça mais cet opérateur existe pour ces cas précis). De toute façon, si la déconstruction du bitfield échoue, unpack renverra false et nous pourrons traiter l'erreur.

{% highlight php linenos %}
<?php

// nous sommes sur la page /auth/reset

// récuppérer le jeton
$token = isset($_GET['t']) ? $_GET['t'] : null;

if (!$token) {
    // erreur: pas de jeton fourni
}

// retrouver la version binaire du jeton
$binary_token = base64_decode($token); // ou base64url_decode

if (!$binary_token) {
    // erreur: mal encodé
}

// extraire les informations du bitfield
$data = @unpack('Iid/Scode_action/Sdate/Sentropy', $binary_token);

if (!$data) {
    // erreur: bitfield mal formé
}

list($year, $month, $day) = date16_decode($data['date']);

// populer les variables correspondantes
$id          = $data['id'];
$code_action = $data['code_action'];
$date        = "{$year}-{$month}-{$day}";
$entropy     = $data['entropy'];
?>
{% endhighlight %}

Plutôt sympa non ? Avec ces données à votre disposition vous pouvez maintenant faire toutes les vérifications que vous voulez et afficher à l'utilisateur un formulaire de réinitialisation du mot de passe.

## Augmenter la sécurité du jeton

La méthode démontrée ici est très pratique pour garantir l'unicité d'un jeton pour certains critères __mais cette unicité ne constitue pas pour autant une quelconque sécurité__. En effet, un pirate pourra facilement reconstruire un jeton parfaitement valide s'il arrive à comprendre de quelle façon il est construit et s'en servir pour duper votre application et se rendre par exemple propriétaire de comptes tiers.

Un moyen simple de sécuriser le jeton est d'y inclure une donnée que l'attaquant ne peut ni connaitre, ni calculer. On va pour cela se servir du mot de passe de l'utilisateur: on va tout simplement en calculer la somme de contrôle crc et ajouter les 16 premiers bits au jeton (ce qui va modifier sa taille binaire de 2 octets).

{% highlight php linenos %}
<?php

// en reprennant les exemples précédents

// somme de contrôle du mot de passe utilisateur
$password_crc32 = crc32($user->password);

// représentation binaire de notre jeton
$binary_token = pack('ISSSS', $id, $code_action, $date, $entropy, $password_crc32);

// créer une version URL-SAFE de notre jeton binaire
$urlsafe_token = base64url_encode($binary_token);
?>
{% endhighlight %}

La taille de notre jeton passe à 12 octets (96 bits) mais sa taille encodée reste 16 caractères (car base64_encode fonctionne par blocs de 16 bits et il nous manquait justement 16 bits pour faire un compte rond, ajouter le crc du mot de passe ne change donc rien à la taille du jeton).

De l'autre coté, il nous suffira de comparer la somme de contrôle du jeton avec celle du mot de passe utilisateur connu, si elles ne sont pas identiques, alors soit le jeton est bidon, soit l'utilisateur a changé son mot de passe. Dans tous les cas, inutile de continuer.

## Conclusion

En termes de sécurité, les jetons ont une importance cruciale et sont courrament échangés entre le client et le serveur sur le web, il est donc important de savoir comment les générer et comment les sécuriser. C'est typiquement le cas avec la gestion des session par PHP qui provoque la construction d'un jeton à partir de valeurs "identifiantes" pour un utilisateur, encore que cette sécurité puisse être contournée comme le montre [cette présentation](http://www.youtube.com/watch?v=fEmO7wQKCMw) de Samy Kamkar à la Defcon.

Cet exercice nous a permis de voir comment construire et manipuler des données binaires en PHP et à quel point cela permet, dans certains cas, de réduire considérablement le volume de données à transmettre tout en conservant le même niveau d'information.
