---
layout: post
title: PHP, bonnes et mauvaises pratiques
date: 
category: php
tags: 
---
# PHP, bonnes et mauvaises pratiques

Au vu de la quantité de tutoriels PHP de piètre qualité malheureusement propulsés en tête des résultats des principaux moteurs de recherches, il m'apparait essentiel de faire le point sur les bonnes pratiques et les erreurs à éviter en PHP.

Avant toute chose, sachez qu'il n'y a aucune manière connue de l'homme de produire un code parfait, l'expérience seule vous apprendra les erreurs à éviter. Il existe cependant quelques cas d'école que vous vous devez de connaître.

![Good Code](http://imgs.xkcd.com/comics/good_code.png)

## Ce qu'il faut éviter

### Désactiver les erreurs avec @

Exemple:

    <?php
    @include 'mail.php';

    if ($_GET['send']) {
        @mail($from,$to,$message,$headers);
    }


Probablement l'erreur la plus grave, la désactivation des erreurs à l'aide de l'opérateur `@` à deux effets néfastes. Le premier, comme le rappelle la documentation, est que les erreurs deviennent invisibles, nuisant de fait au débuggage de l'application. Dans l'exemple ci-dessus, il est impossible, en cas d'erreur, de savoir quelle en était la cause, y compris si l'erreur est présente dans le script 'enfant' mail.php car la désactivation se fait en cascade.

Le second, plus insidieux est une dégradation des performances car on s'écarte du mode de fonctionnement normal de PHP. Cet effet est cependant minime mais on obtiens tout de même des pertes de plus de 10%.

__Comment corriger ce défaut ?__

Dans tous les cas, il est préférable d'interpréter le code de retour de la fonction ou de l'expression et d'adopter le bon comportement en conséquence. Désactiver les erreurs, c'est comme mettre un autocollant sur le voyant moteur; il ne faut pas s'étonner de tomber en panne en rase campagne.

### Utiliser or die(...)

Exemple:

    <?php
    $connection = mysql_connect('localhost', 'root', '') or die('Impossible de se connecter');

    $results = mysql_query('SELECT * FROM table') or die(mysql_error());

L'erreur que je rencontre le plus souvent, l'usage de `or die` provoque l'arrêt brutal du script si une erreur survient. On la voit surtout sur l'exécution de requêtes SQL car beaucoup de tutoriels préconisent cette forme de contrôle d'erreur. Cette pratique présente cependant de nombreux désagréments:

+ la réponse n'est pas servie en totalité, tout ce qui devrait se trouver après le die n'est évidement pas affiché
+ les headers HTTP 5xx normalement prévus pour les erreurs ne sont pas envoyé, au contraire, on renvoie un 200 OK par défaut alors que tout ne s'est pas bien passé
+ la plupart du temps, die est agrémenté de messages d'erreurs totalement inutiles pour l'utilisateur lambda mais très utiles à un attaquant pour comprendre les failles de votre application
+ vous perdez instantanément toute chance de rattraper votre erreur, ou au moins de la logguer

__Comment corriger ce défaut ?__

Comme mentionné plus haut, vous aurez toujours meilleur compte d'interpréter le résultat de la fonction avec un simple if que de sortir brutalement.

    <?php
    $connection = mysql_connect('localhost', 'root', '');

    if (!$connection) {
        log_error("Connection Error");

        // mettre en forme un beau message d'erreur,
        // un formulaire de reporting d'erreur
        // ou rediriger l'utilisateur

    }

    if (!$results = mysql_query('SELECT * FROM table')) {
        log_error("Query Error");

        // mettre en forme un beau message d'erreur,
        // un formulaire de reporting d'erreur
        // ou rediriger l'utilisateur

    }
    else {
        // continuer notre traitement normalement
    }

### Considérer les données reçues comme sûres

Exemple:

    <?php
    $identifiant = $_POST['identifiant'];
    $motdepasse = $_POST['motdepasse'];

    $resultat = mysql_query("SELECT * FROM membres WHERE identifiant='$identiant' AND motdepasse='$motdepasse'");
    $_SESSION['utilisateur'] = mysql_fetch_assoc($resultat);

L'absence de vérification est souvent à l'origine de nombreux problèmes de sécurité comme les injections SQL ou les attaques XSS. Dans notre exemple, on voit aisément comment un utilisateur pourrait détourner le formulaire pour se connecter sans avoir de compte (ou pire avec un compte admin). Il suffit d'utiliser la valeur `"xx' OR 1"` comme mot de passe et la requête de selection renverra toujours un resultat et voilà, on est connecté !

__Comment corriger ce défaut ?__

Ne pas sécuriser ses formulaire et supposer que les données de l'utilisateur sont sûres, c'est ne pas mettre de verrou à sa porte en éspérant qu'on ne viendra jamais nous cambrioler. Au sein d'une application web, vous devez toujours considérer les données reçues de l'utilisateur comme insécurisées. Pour les valider et les nettoyer, vous pouvez utiliser les filtres ou une méthode de votre cru.

    <?php
    $identifiant = filter_input(INPUT_POST, 'identifiant', FILTER_SANITIZE_STRING);
    $motdepasse  = filter_input(INPUT_POST, 'motdepasse', FILTER_SANITIZE_STRING);

    $id          = mysql_real_escape_string($identifiant);
    $pass        = mysql_real_escepe_string($motdepasse);

    $resultat = mysql_query("SELECT * FROM membres WHERE identifiant='$id' AND motdepasse='$pass'");

### Utiliser les register globals

Exemple:

    <?php
    if (connecter_utilisateur())
        $connecte = true;

    if ($connecte)
        include "admin.php";

Problème qu'on rencontre régulièrement avec de vieux script écrits pour PHP 4 puis migrés sur PHP 5, la directive `register_globals` détermine l'injection de variables dans le scope global, notamment les paramètres POST et GET. En d'autres termes, chaque donnée de l'URL ou du formulaire est disponible sous forme de variable dans le script, ce qui peut provoquer nombre de failles de sécurité. Dans l'exemple ci-dessus, la variable $connect n'est supposée exister que si la fonction `connecter_utilisateur` à réussi, or avec `register_globals` à `On` un utilisateur malin peut tout simplement ajouter `?connecte=1` à l'URL et la variable `$connecte` sera alors définie, provoquant le chargement du script d'administration. Problématique non ?

Même s'il est vrai qu'il est peu probable qu'un attaquant détermine les variables internes utilisées par votre application, utiliser register_globals c'est s'exposer à des collisions de variables, ce qui nuit énormément à la maintenance de l'application car il devient difficile de connaître l'origine et la valeur des variables utilisées. C'est donc définitivement une directive à désactiver, c'est pourquoi elle est dépreciée à partir de PHP 5.3 et supprimée dans PHP 5.4.

__Comment corriger ce défaut ?__

Si vous en avez la possibilité, désactivez cette directive dans php.ini. Sinon, vous pouvez la définir dans le .htaccess comme suit.

    # désactiver les register globals
    php_flags register_globals Off

### Mélanger le PHP et le HTML

    <!DOCTYPE HTML>
    <html lang="en-US">
    <head>
        <meta charset="UTF-8">
        <title></title>
    </head>
    <body>
    <?php
    $results = mysql_query("SELECT machin FROM truc");

    if (!$results) {
        ?>
        <p class="error">Erreur de requête</p>
        <?php
        header('HTTP/1.1 500 Internal Server Error');
        exit();
    }
    else {
        while ($row = mysql_fetch_assoc($results)) {
            echo "$row[machin]" . "<br />";
        }
    }
    ?>
    </body>
    </html>

Pour expliquer en quoi cette pratique est mauvaise, en dehors de la lisibilité dégradée qu'elle provoque, un petit rappel sur le protocole HTTP s'impose.

Le protocole HTTP sépcifie que les échanges entre le client (le navigateur) et le serveur (Apache + PHP) sont formés de deux parties:

+ L'en-tête (header) qui contiens les informations relatives à la requête / réponse
+ le corp (body) qui contiens le contenu de la réponse

Exemple de requête HTTP:

    GET /hello.php HTTP/1.1
    Host: localhost
    Accept: */*

Exemple de réponse HTTP:

    HTTP/1.1 200 Ok
    Content-Type: text/plain
    Content-Length: 12

    Helloworld!

Il y a en réalité davantage de headers envoyés mais pour simplifier, je ne vous ai mis que les plus importants. Cet exemple d'échange HTTP se produit lors de l'appel de http://localhost/hello.php, un simple script dont le corp se résume à `<?php echo "Helloworld!" ?>`

Lors que votre script PHP est appellé, il envoie le contenu produit dans le corp de la réponse, mais ce que vous ne voyez pas, c'est qu'avant d'envoyer le corp Apache à envoyé les en-têtes (pour décrire le status de la réponse, le type de données servies, etc.) alors que votre script ne lui a pourtant rien demandé.

Ce qu'il est important de savoir, c'est que l'envoi des headers se produit _au moment ou vous commencez à afficher quoi que ce soit, y compris un caractère blanc_ (espace, tabulation ou saut de ligne).

_"Qu'est ce que ça peut faire ?"_ me direz vous. Eh bien le problème est qu'une fois que les headers ont étés envoyés, vous perdez la possibilité d'en evoyer à nouveau. Si, une fois du produit vous tentez d'utiliser la fonction `header` de PHP, celle-ci échouera et émettra un warning. Vous ne pouvez plus dès lors changer le statut de la réponse (404, 500 ou 403) ni effectuer une redirection par exemple.

__Comment corriger ce défaut ?__

Séparez clairement les traitements de l'affichage et afin de respecter au mieux l'indentation de votre flux HTML pour préserver sa lisibilité, utilisez la syntaxe alternative.

    <?php

    // partie traitement

    $results = mysql_query("SELECT machin FROM truc);
    if (!$results) {
      header('HTTP/1.1 500 Internal Server Error');
      exit();
    }

    // partie affichage

    ?>
    <!DOCTYPE HTML>
    <html lang="en-US">
    <head>
        <meta charset="UTF-8">
        <title></title>
    </head>
    <body>
        <ul>
        <?php while ($row = mysql_fetch_assoc($results)): ?>
           <li><?php echo $row['machin'] ?></li>
        <?php endwhile ?>
        </ul>
    </body>
    </html>

## Bonnes pratiques

_En cours de rédaction_