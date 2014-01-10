---
layout: post
type: article
title: Injections de dépendances et composants en PHP
date: 2013-04-23
category: php
tags: php dependency-injection injection dépendances components-oriented-development développement-orienté-composants composants
---

Les développeurs sont par nature assez paresseux, s'ils peuvent réutiliser des fonctionnalités existantes pour se simplifier la vie ils le font en règle générale. C'est encore mieux si ces fonctionnalités leurs sont fournies directement par des librairies ou par l'API du langage. Ne pas réinventer la roue est un concept qui revient souvent en programmation, en effet, si la solution à un problème posé existe déjà, il est inutile voire absurde de dépenser du temps et de l'énergie à fournir une autre solution.

Il n'est donc pas étonant que, très tôt dans l'informatique, les langages offrants ces fonctionnalités génériques soient rapidement devenus populaires. De nos jours, la vaste majorité des langages offrent nativement des fonctionnalités élémentaires pour afficher du texte, manipuler des données ou la mémoire ainsi que des fonctionnalités plus évolués généralement liées à la nature du langage en question.

Dans un [précédent article](http://bdelespierre.fr/article/la-poo-en-php-en-10-minutes-ou-moins), je vous ai parlé de la révolution introduite par l'approche orientée-object dans les langages de programmation. Appliquée à l'architecture logicielle, cette approche à donné naissance à la programmation orientée composant, une forme d'architecture au sein de laquelle les librairies sont encapsulées dans des briques logicielles indépendantes dont le développeur se sert pour construire le système d'information. L'objectif étant de favoriser la réutilisabilité et la flexibilité par une approche modulaire de l'architecture. En effet, grâce à l'utilisation de composants il devient aisé de créer des briques génériques pour des besoins réccurents et de changer si nécéssaire un composant pour adresser au mieux un problème donné.

Nous allons donc nous intéresser à la notion de composant dans le cadre du langage PHP. La notoriété croissante des frameworks PHP tels que Symfony ou Zend Framework aidant, la programmation orientée composant est rapidement devenue populaire auprès de la communauté. Il m'apparaît donc essentiel de faire le point sur les problématiques liées à cette forme d'architecture et comment les adresser à l'aide d'un pattern aujourd'hui célèbre: l'injection de dépendances.

## L'interopérabilité

Le concept de composant ne date pas d'hier en PHP car depuis 1999 [PEAR](http://pear.php.net/) favorise la réutilisation de composants génériques. Mais il faudra attendre la fin des années 2000 pour que le phénomène prenne de l'ampleur notamment grâce à [Composer](http://getcomposer.org/) et son dépôt [Packagist](https://packagist.org/). De nos jours, la plupart des nouvelles librairies PHP sont fournies sous la forme de composants afin de faciliter leur installation et leur mise à jour, favorisant de ce fait leur utilisation par la communauté des développeurs.

Les développeurs ont dès lors commencé à concevoir leurs application non plus comme des briques logicielles monolithiques mais comme un assemblage de composants liés les uns aux autres. S'est alors posé très vite la question de l'interraction entre ces composants.

En effet, si une application à besoin d'un routeur capable d'invoquer des contrôleurs et que ces derniers font appels à des vues après avoir effectué les opération modèle nécéssaires à l'aide d'un mappeur objet-relationnel (ORM), comment lier tous ces composants entre eux ?

La façon la plus simple est encore de coder ces liens "en dur", donc dans un composant A faire explicitement appel à un composant B. Mais cette approche nuit considérablement à la réutilisabilité et à la flexibilité car A devient indissociable de B. De fait, plus le nombre de composants augmente, plus le couplage augmente, et on finit par détruire toute modularité dans l'application et l'approche orientée composants devient inutile.

Pour résoudre ce problème, il est préférable que A utilise B sans avoir connaissance de l'implémentation conrête de B, ce qui nous permet de fournir à A la forme de B qui nous convient. On retrouve ici plus ou moins l'idée de polymorphisme héritée de la programmation orientée objet, nos composants ne vont pas travailler avec les implémentations concrêtes d'autres composants mais avec leurs représentations abstraites.

Il existe de nombreux patrons de conception qui résolvent ce problème: Adaptateur, Stratégie, Médiateur... Mais nous allons nous intéresser plus particulièrement à l'injecteur de dépendances (_Dependency Injector_ en anglais).

## L'injection de dépendances

L'injection de dépendances est un patron de conception qui permet de supprimer ces dépendances codées "en dur", rendant possible le remplacement des éléments de l'application lors du runtime. Pour reprendre notre exemple, le composant A ne fera pas appel explicitement au composant B, c'est l'injecteur qui va le lui fournir (la plupart du temps sous la forme d'un object prêt à l'emploi). Le principe clé de ce pattern est la séparation du comportement vis-a-vis de la résolution de la dépendance.

L'injection de dépendance implique donc au moins 3 entitées:

* un consommateur de dépendances
* une définition des dépendances
* un injecteur capable de créer les instances de dépendances

Le consommateur est reponsable de la description des types avec lesquels il travaille, mais il n'a pas à savoir quel est le type précis qu'il va utiliser, c'est justement le rôle de l'injecteur de le déterminer en utilisant la définition des dépendances. En fait, vous pouvez penser la définition de dépendances comme un moyen commode de "câbler" votre application.

Par exemple, si votre contrôleur doit travailler avec un objet représentant une vue, il demandera explicitement une instance de `ViewInterface` pour s'initialiser et l'injecteur pourra lui passer une instance de `HTMLView` ou de `JSONView` en fonction du contexte d'éxécution.

Un autre avantage de l'injection de dépendances est qu'il devient aisé de tester nos composants, on va pour cela leur fournir de _fausses_ implémentations. Ces bouchons (_mocks_ en anglais) sont des composants dont le comportement est totalement déterministe, ce qui nous permet de tester les composants dans lesquels ils sont injectés. Ces mocks également nous permettre de tester des cas d'erreur difficiles à reproduire.

On peut également créer des mocks pour émuler des traitements dans l'idée de mettre en place une démonstration du produit (les équipes marketing sont friandes de ce genre de flexibilité).

Par exemple, si votre contrôleur doit travailler avec un objet modèle dont le comportement dépend des données que vous avez en base, il devient difficile de tester le contrôleur car la base de données n'est par définition pas un élément déterministe et les données reçues ne sont pas forcément identiques d'un appel sur l'autre. Dans ce cas, nous allons passer à notre contrôleur un mock qui va émuler le bon ou le mauvais comportement des requêtes en base et on va regarder comment se comporte le contrôleur.

Il existe d'ailleurs des méthodologies de développement comme le développement piloté par les tests (_test driven development_ ou TDD en anglais) qui placent l'écriture des tests avant l'écriture du code. Dans ce contexte de travail, il est impératif de prévoir toute une série de mocks afin de pouvoir dérouler les tests dans de bonnes conditions puis de les remplacer par leur réelle implémentation au fur et à mesure que le projet avance.

## Exemple pratique

L'injection de dépendances est un patron qui se marie à merveille avec un patron qu'on ne présente plus désormais: le _Modèle-Vue-Contrôleur_ ou MVC pour les intimes. Nous allons pour cet exemple utiliser l'injecteur de dépendances [Pimple](https://github.com/fabpot/Pimple) et nous allons définir nos dépendances au sein d'un composant central: `Application`.

Je ne vais pas mettre l'intégralité des classes impliquées car l'implémentation du MVC à l'aide de composants n'est pas au chapitre de cet article. Si nécéssaire, j'écrirais un article dédié là dessus.

    <?php

    class Application extends Pimple {

        public function __construct (array $values) {

            $app = $this;

            $this['controllers'] = array(
                'default' => 'DefaultController',
            );

            $this['views_path'] = '/views';
            $this['views'] = array(
                'html' => $this->share(function () use ($app) {
                    return new HTMLView($app['views_path']);
                }),
            );

            $this['models_path'] = '/models';
            $this['models'] = array();

            $this['router'] = $this->share(function () use ($app) {
                return new Router($app['controllers']);
            });

            $this['request_class'] = 'HTTPRequest';

            foreach ($values as $key => $value)
                $this[$key] = $value;
        }

        public function addController ($name, $class) {
            $this['controllers'][$name] = $class;
            return $this;
        }

        public function addViewHandler ($name, $handler) {
            $this['views'][$name] = $handler;
            return $this;
        }

        public function addModel ($name, $model) {
            $this['models'][$name] = $model;
            return $this;
        }

        public function run (Request $request = null) {
            if ($request === null)
                $request = new $this['request_class']($this);

            $this['router']->run($request);
        }
    }

Cette classe est à la fois une façade qui nous simplifie grandement l'usage du MVC et un injecteur de dépendances. Son constructeur représente l'étape d'initialisation de l'application, c'est là que toute la définition des composants à utiliser prends place. Cette définition peut être surchargé directement en passant un tableau au constructeur ou bien par la suite en utilisant les différentes méthodes.

On notera au passage l'usage de la méthode `Pimple::share` qui permet de définir des services partagés qui sont en fait des singletons.

Voici un exemple d'utilisation:

    <?php

    // bla bla autoloader bla bla

    $app = new Application;

    // nos modèles sont des modèles MySQL
    $app['models_path'] = 'models/MySQL';

    // décommenter pour utiliser les mocks
    // $app['models_path'] = 'models/mock';

    // le modèle Articles est un itérateur
    // qui s'initialise avec une instance
    // vide de la classe article à utiliser
    // pour l'itération.
    $app->addModel('articles', function () use ($app) {
        include_once $app['models_path'] . '/articles.php';
        return new Articles($app['article']);
    });

    // le modèle Article est le CRUD
    // permettant d'obtenir les données
    // d'un article.
    $app->addModel('article', function ($id = null) use ($app) {
        include_once $app['models_path'] . '/article.php';
        return new Article($id);
    });

    // enregistrer le contrôleur
    // d'articles
    $app->addController("article", "ArticleController");

    // lancer l'application
    $app->run();

Les modèles nous sont fournis par des fonctions annonymes qui sont en fait leurs fabriques. Cela permet à la fois de déterminer quelle famille de modèles utiliser (on inclut les classes en fonction du paramètre `models_path`) et de n'initialiser les modèles que lors que c'est utile: si les contrôleurs ne les utilisent pas, il n'y a pas d'instanciation.

Voyons enfin le contrôleur `ArticleController`:

    <?php
    class ArticleController extends Controller {

        public function index ($app, $q) {
            // récupérer la liste des articles
            // optionnellement filtrée par $q
            $articles = $app['models']['articles']->get($q);

            //
            return $app['views']['html']->load('article/articles.php', $articles);
        }

        public function article ($app, $id) {
            // retourner sur l'index de la section
            // article si l'id n'est pas fourni
            if (!$id)
                return $this->redirect($this, 'index');

            $article = $app['models']['article']($id);

            return $app['views']['html']->load('article/article.php', $article);
        }

        public function commenter ($app, $id) {
            $author = filter_input(INPUT_POST, 'comment_author', FILTER_SANITIZE_STRING);
            $body   = filter_input(INPUT_POST, 'comment_body',   FILTER_SANITIZE_STRING);

            if (!$id || !$author || !$body)
                return $this->redirect($this, 'index');

            $article = $app['models']['article']($id);
            $article->addComment($author, $body);

            return $app['views']['html']->load('article/article.php', $article);
        }
    }

Dans cet exemple, on suppose qu'il est de la responsabilité de la classe `Router` de déterminer pour chaque action de contrôleur quels sont les paramètres à passer (`$app` représente l'application et les autres paramètres sont des paramètres GET). Pour la petite histoire, il suffit d'utiliser les classes de réflexion pour obtenir les noms des paramètres d'un méthode ou fonction et les faire correspondre à des valeurs dans `$_GET` par exemple.

On remarque immédiatement qu'il existe un couplage entre nos composants (en l'occurence les contrôleurs) et l'injecteur de dépendances. Il existe bien des moyens de supprimer ce couplage mais ce n'est pas toujours souhaitable.

Il est parfois beaucoup plus simple de fournir directement l'injecteur de dépendances aux composants pour qu'ils "tirent" eux-même leurs dépendances plutôt que d'imaginer un mécanisme complexe d'injection automatique. En PHP notamment, cette approche nous satisfait en général car nous obtenons suffisament de flexibilité par ce biais: dans notre exemple il sufft de décommenter une ligne pour utiliser directement les mocks au lieu de l'implémentation réelle ou encore d'enregistrer de nouveaux gestionnaires de vues pour les rendre directement utilisables au niveau des contrôleurs.

De plus, les contrôleurs faisant partie intégrante de l'application, cette dépendance entre controlleurs et application est tout à fait justifiée.

## Conclusion

Comme le MVC, l'injection de dépendances peut prendre bien des formes. On aurait pu par exemple parler de la programmation par contrats qui nous aurait permi de définir pour chaque composant ses dépendances ou encore détailler comment effectuer une injection automatique à l'aides des classes de réflexion mais ce n'est pas notre objectif car il existe autant d'implémentation et d'usages de ce patron que les développeurs sont en mesure d'en imaginer.

J'espère que cet article vous aura permi de mieux comprendre les enjeux du découplage dans une architecture orientée-objet et vous a donné quelques pistes pour améliorer vos sources.

Je terminerai en vous mettant en garde (comme à mon habitude) contre les dérives du découplage et de la généricité en général: à un moment donné il faut arrêter de découpler et de banaliser au risque de voir la solution devenir plus complexe que le problème ce qui n'est __jamais__ une bonne chose. L'injection de dépendances, comme la plupart des patterns existants, existe pour vous simplifier le travail, pas pour le rendre obscur et incompréhensible donc n'allez pas trop loin (croyez-moi, on a tôt fait de se retrouver avec des composants tellements "souples" qu'on ne sait même plus ce qu'ils font concrêtement).

## Références

* [Programmation orientée composant](https://fr.wikipedia.org/wiki/Programmation_orient%C3%A9e_composant)
* [Dependency Injection](http://en.wikipedia.org/wiki/Dependency_injection)
* [Pimple](https://github.com/fabpot/Pimple)